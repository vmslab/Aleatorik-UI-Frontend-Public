import { RestCollectionView } from "@grapecity/wijmo.rest";
import { DataType, DateTime, copy, changeType, isString, asArray } from "@grapecity/wijmo";

/**
 * Virtual Scroll을 지원하기 위해서 {@link ServerCollectionViewBase} 확장한 클래스
 */
export default class RestVirtualCollectionView extends RestCollectionView {
  _loadFunc: (option: any) => Promise<any>;
  virtualizationRange = 0;
  _currentWindow = {
    row1: 0,
    row2: this.virtualizationRange,
  };
  _datas: any[] = [];
  _parseDateColumn: any[] = [];

  constructor(loadFunc: (option: any) => Promise<any>, options: any) {
    super();
    copy(this, options);
    this._loadFunc = loadFunc;

    this._currentWindow.row2 = this.virtualizationRange;
  }

  /**
   *키 필드의 이름이 포함된 배열을 가져오거나 설정.
   *
   * 업데이트 작업(추가/제거/삭제)에 키 필드가 필요.
   */
  get keys() {
    return this._keys;
  }
  set keys(value) {
    this._keys = asArray(value);
  }

  // ** 구현

  // 읽기 매개 변수 필드, 정렬, 페이징 및 필터 적용
  _getReadParams(skip: number, take: number) {
    let settings: any = {};

    // 검색할 필드 지정
    if (this.fields) {
      settings.select = this.fields.join(",");
    }

    // 정렬 적용
    if (this.sortOnServer && this.sortDescriptions.length) {
      let sort: any[] = [];
      this.sortDescriptions.forEach(sd => {
        sort.push({ selector: sd.property, desc: !sd.ascending });
      });
      settings.sort = sort;
    }

    // 페이징 적용
    if (this.pageOnServer && this.pageSize > 0) {
      settings.skip = this.pageIndex * this.pageSize;
      settings.take = this.pageSize;
    }

    // 가상화 활성화
    if (this.virtualizationRange) {
      settings.skip = skip;
      settings.take = take;
    }

    // 필터 적용
    if (this.filterOnServer && this._filterProvider) {
      settings.filter = this._asRestFilter(this._filterProvider);
    }

    return settings;
  }

  // wijmo.grid.filter.FlexGridFilter 객체로 부터 OData 필터 정의 가져오기
  _asRestFilter(filter: {
    grid: { columns: string | any[] };
    getColumnFilter: (arg0: any, arg1: boolean) => any;
  }) {
    let def: any[] = [];
    for (let c = 0; c < filter.grid.columns.length; c++) {
      let col = filter.grid.columns[c],
        cf = filter.getColumnFilter(col, false);
      if (cf && cf.isActive) {
        let filterItem = [];
        if (cf.conditionFilter && cf.conditionFilter.isActive) {
          filterItem = this._asRestConditionFilter(cf.conditionFilter);
        } else if (cf.valueFilter && cf.valueFilter.isActive) {
          filterItem = this._asRestValueFilter(cf.valueFilter);
        }

        if (filterItem) {
          if (def.length > 0) {
            def.push("and");
          }
          def.push(filterItem);
        }
      }
    }
    return def.length > 1 ? def : def.length > 0 ? def[0] : null;
  }
  _asRestValueFilter(vf: { column: any; showValues: any }) {
    let col = vf.column,
      fld = col.binding,
      map = col.dataMap,
      def: any = [];

    // 'eq/or' 로 조건 구축
    for (let key in vf.showValues) {
      let value = changeType(key, col.dataType, col.format);
      if (map && isString(value)) {
        // TFS 239356
        value = map.getKeyValue(value);
      }
      if (def.length > 0) def.push("or");
      def.push(this._asEquals(fld, value, col.dataType));
    }

    // 비어있지 않다면 괄호로 물기
    if (def.length) {
      def = [def];
    }

    // 전체 완료
    return def;
  }
  _asEquals(fld: string, value: Date | null, type: DataType) {
    let def: any[] = [],
      DT = DataType;
    if (/*value === "" ||*/ value == null) {
      // null 또는 빈
      def.push([fld, "=", null]);
      if (type == DT.String) {
        // 문자열에 대해서만 비는 것이 가능
        def.push("or");
        def.push([fld, "=", ""]);
      }
    } else if (type == DT.Date) {
      // non-null/empty dates (TFS 458080)
      def.push([[fld, ">=", value], "and", [fld, "<>=>", DateTime.addDays(value, 1)]]);
    } else {
      // 다른 유형들
      def.push([fld, "=", value]);
    }
    return def;
  }
  _asRestConditionFilter(cf: any) {
    let c1 = this._asRestCondition(cf, cf.condition1),
      c2 = this._asRestCondition(cf, cf.condition2);

    if (c1 && c2) return [c1, cf.and ? "and" : "or", c2];
    if (c1) return c1;
    if (c2) return c2;
    return [];
  }
  _asRestCondition(cf: { column: any }, cnd: { value: any; operator: any }) {
    let col = cf.column,
      fld = col.binding,
      map = col.dataMap,
      value = cnd.value;
    if (map && isString(value)) {
      // TFS 440901
      value = map.getKeyValue(value);
    }
    switch (cnd.operator) {
      case 0: // EQ = 0,
        return [fld, "=", value];
      case 1: // NE = 1,
        return [fld, "!=", value];
      case 2: // GT = 2,
        return [fld, ">", value];
      case 3: // GE = 3,
        return [fld, ">=", value];
      case 4: // LT = 4,
        return [fld, "<", value];
      case 5: // LE = 5,
        return [fld, "<=", value];
      case 6: // BW = 6,
        return [fld, "startswith", value];
      case 7: // EW = 7,
        return [fld, "endswith", value];
      case 8: // CT = 8,
        return [fld, "contains", value];
      case 9: // NC = 9
        return [fld, "notcontains", value];
    }
  }

  // ** overrides

  async getItems() {
    const skip = this._currentWindow.row1;
    const take = this._currentWindow.row2 - this._currentWindow.row1;
    return new Promise<any[]>(async resolve => {
      let result = await this._loadFunc(this._getReadParams(skip, take));

      if (result.totalCount < this._datas.length) {
        this._datas = [];
      }

      while (result.totalCount > this._datas.length) {
        this._datas.push({});
      }

      for (let index = 0; index < take; index++) {
        const dataIndex = skip + index;
        if (dataIndex >= result.totalCount) break;

        this._datas[dataIndex] = result.data[index];

        this._parseDateColumn.forEach(column => {
          const binding = column.binding;
          if (!binding || !Object.prototype.hasOwnProperty.call(this._datas[dataIndex], binding))
            return;
          this._datas[dataIndex][binding] = new Date(this._datas[dataIndex][binding]);
        });
      }

      resolve(this._datas);
    });
  }

  // 가상화를 위한 setWindow 메서드
  setWindow(row1: number, row2: number, parseDateColumn: any[]) {
    const buffer = this.virtualizationRange / 2;
    if (row1 < 0 && row2 < 0) {
      this._currentWindow.row1 = 0;
      this._currentWindow.row2 = this.virtualizationRange;
    } else if (row1 - buffer < 0) {
      this._currentWindow.row1 = 0;
      this._currentWindow.row2 = row2 + this.virtualizationRange - row1;
    } else {
      this._currentWindow.row1 = row1 - buffer;
      this._currentWindow.row2 = row2 + buffer;
    }

    this._parseDateColumn = parseDateColumn;

    this.load();
  }
}
