import {
  FlexGrid,
  HeadersVisibility,
  GroupRow,
  Row,
  CellRange,
  Column,
  AutoSizeMode,
  HitTestInfo,
  SelectionMode,
  AllowSorting,
  KeyAction
} from '@grapecity/wijmo.grid';
import { Selector } from '@grapecity/wijmo.grid.selector';
import { SortDescription, toggleClass, isDate, DataType, setCss, Aggregate } from '@grapecity/wijmo';
import { InputDateTime } from '@grapecity/wijmo.input';
import { GroupPanel } from '@grapecity/wijmo.grid.grouppanel';
import { FlexGridFilter, FilterType } from '@grapecity/wijmo.grid.filter';

import ExtendGridContextMenu, { ContextMenuProps } from './ExtendGridContextMenu';
import ExtendGroupContextMenu, { GroupContextMenuProps } from './ExtendGroupContextMenu';
import { removeAllClass, getTooltipPosition, calcTextSize, EventBus } from 'mozart-common';
import notify from 'devextreme/ui/notify';

import cloneDeep from 'lodash/cloneDeep';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

import CustomMergeManager from './CustomMergeManager';
import RestVirtualCollectionView from './RestVirtualCollectionView';

export type DataMode = 'standard' | 'virtual';
export type ValidateMode = 'none' | 'edit' | 'save';
export type TooltipMode = 'always' | 'ellipsis' | 'none';

export interface ILayoutStorage {
  key?: string;
  mode: 'localStorage' | 'uiframework' | 'none';
}
export interface ILoadingMode {
  mode: 'throttle' | 'debounce';
  delay: number;
}
export interface ISnackBarParams {
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
}

/**
 * Extend Grid에서 Grid UI 관련 Option을 정의한 클래스
 */
export class GridOptions {
  useSelector?: boolean;
  useGroupPanel?: boolean;
  useContextMenu?: boolean;
  useFilter?: boolean;
  useFooter?: boolean;
  useAutoColumnFit?: boolean;
  useCellTooltip?: TooltipMode;
  useCellTemplateTooltip?: boolean;

  useMerge?: boolean | Array<string>;
  useParseDate?: boolean;

  setContextMenuProps?: ContextMenuProps;
  setGroupPanelOptions?: any;
  setMergePreAffected?: boolean;

  selectionMode?: SelectionMode | string;
  allowSorting?: AllowSorting | string;
  keyActionEnter?: KeyAction | string;
  keyActionTab?: KeyAction | string;
  deferResizing?: boolean;
  quickAutoSize?: boolean;
  imeEnabled?: boolean;
  alternatingRowStep?: number;
  showSelectedHeaders?: HeadersVisibility | string;
  showMarquee?: boolean;

  onColumnHeaderClick?(flexGrid: FlexGrid, hitTest: HitTestInfo, e: MouseEvent): void;
  onColumnHeaderDblClick?(flexGrid: FlexGrid, hitTest: HitTestInfo, e: MouseEvent): void;
  onCellClick?(flexGrid: FlexGrid, hitTest: HitTestInfo, e: MouseEvent): void;
  onCellDblClick?(flexGrid: FlexGrid, hitTest: HitTestInfo, e: MouseEvent): void;
  onInitialized?(extendGrid: ExtendGrid): void;
  onInitialzeRowData?(): any;
  onSaveEditData?(addedItem: any[], updatedItem: any[], removedItem: any[]): Promise<any>;
  onRefreshed?(extendGrid: ExtendGrid): void;

  /**
   * {@link ExtendGrid}
   * Grid UI 설정
   *
   * @param {boolean?} useSelector CheckBox를 보이는지 여부, (true일 경우 FlexGrid.headersVisibility = All)
   * @param {boolean?} useGroupPanel Group Panel을 생성하는지 여부
   * @param {boolean?} useContextMenu Context Menu를 생성하는지 여부
   * @param {boolean?} useFilter Colun Filter를 생성하는지 여부
   * @param {boolean?} useFooter Column Footer를 생성하는지 여부 (Row Count)
   * @param {boolean?} useAutoColumnFit Column의 Size를 자동으로 설정하는지 여부
   * @param {TooltipMode?} useCellTooltip Cell Tooltip을 생성하는지 여부
   * @param {boolean?} useCellTemplateTooltip Cell Template에 정의한 tooltip을 사용하는지 여부
   * @param {boolean | Array<string> | undefined} useMerge Cell Merge를 설정하는지 여부
   * @param {boolean?} setMergePreAffected useMerge 시, 대상 Column이 2개 이상일 경우에 앞 Column의 Merge에 영향을 받는지 여부
   *
   * @param {boolean?} useParseDate data에 Date string이 있을 경우, Date 객체로 Parsing할지 여부
   *
   * @param {ContextMenuProps?} setContextMenuProps Conetext Menu 설정
   * @param {any?} setGroupPanelOptions Group Panel 설정
   *
   * @param {SelectionMode | string | undefined} selectionMode FlexGrid.selectionMode 설정
   * @param {AllowSorting | string | undefined} allowSorting FlexGrid.allowSorting 설정
   * @param {KeyAction | string | undefined} keyActionEnter FlexGrid.keyActionEnter 설정
   * @param {KeyAction | string | undefined} keyActionTab FlexGrid.keyActionTab 설정
   * @param {boolean?} deferResizing FlexGrid.deferResizing 설정
   * @param {boolean?} quickAutoSize FlexGrid.quickAutoSize 설정
   * @param {boolean?} imeEnabled FlexGrid.imeEnabled 설정
   * @param {HeadersVisibility | string | undefined} showSelectedHeaders FlexGrid.showSelectedHeaders 설정
   * @param {boolean?} showMarquee FlexGrid.showMarquee 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html FlexGrid 관련 Property는 해당 문서 참고
   *
   * @param {Function?} onInitialized Grid 초기 설정 후, 이벤트
   * @param {Function?} onInitialzeRowData addRow 시, 생성되는 row의 초기값 설정
   * @param {Promise<any>?} onSaveEditData saveEditData 실행 시, added, updated, removed items를 arguments로 받는 이벤트
   * @param {Function?} onRefreshed refresh 실행 후, 이벤트
   * @param {Function?} onColumnHeaderClick (sender:FlexGrid, hitTest:HitTestInfo, e:MouseEvent) Column Header Click 시, 이벤트
   * @param {Function?} onColumnHeaderDblClick (sender:FlexGrid, hitTest:HitTestInfo, e:MouseEvent) Column Header Double Click 시, 이벤트
   * @param {Function?} onCellClick (sender:FlexGrid, hitTest:HitTestInfo, e:MouseEvent) Cell Click 시, 이벤트
   * @param {Function?} onCellDblClick (sender:FlexGrid, hitTest:HitTestInfo, e:MouseEvent) Cell Double Click 시, 이벤트
   */
  constructor(option: GridOptions) {
    this.useSelector = option.useSelector;
    this.useGroupPanel = option.useGroupPanel;
    this.useContextMenu = option.useContextMenu;
    this.useFilter = option.useFilter;
    this.useFooter = option.useFooter;
    this.useAutoColumnFit = option.useAutoColumnFit;
    this.useCellTooltip = option.useCellTooltip;
    this.useMerge = option.useMerge;
    this.useParseDate = option.useParseDate;
    this.setContextMenuProps = option.setContextMenuProps;
    this.setGroupPanelOptions = option.setGroupPanelOptions;

    this.onColumnHeaderClick = option.onColumnHeaderClick;
    this.onColumnHeaderDblClick = option.onColumnHeaderDblClick;
    this.onCellClick = option.onCellClick;
    this.onCellDblClick = option.onCellDblClick;
    this.onInitialized = option.onInitialized;
    this.onInitialzeRowData = option.onInitialzeRowData;
    this.onSaveEditData = option.onSaveEditData;
    this.onRefreshed = option.onRefreshed;
  }
}

/**
 * Extend Grid에서 Data Interaction을 위한 Option을 정의한 클래스
 */
export class DataOptions {
  mode?: DataMode;
  loadingMode?: ILoadingMode;
  dataKey: string | string[];
  validateKey: ValidateMode;
  validateClassName?: string;

  addRowClassName?: string;
  updateClassName?: string;
  removeRowClassName?: string;

  /**
   * {@link ExtendGrid}
   * Data Interaction 설정
   *
   * @param {DataMode?} mode Data Interaction Mode
   * @param {ILoadingMode?} loadingMode Data Loading Mode (only virtual mode)
   * @param {string|string[]} dataKey unique key
   * @param {ValidateMode} validateKey dataKey 중복 검사
   * @param {string?} validateClassName 중복 검사 시, 중복된 row의 css class name (only save mode)
   *
   * @param {string?} addRowClassName added row의 css class name
   * @param {string?} updateClassName updated cell의 css class name
   * @param {string?} removeRowClassName removed row의 css class name
   */
  constructor(option: DataOptions) {
    this.mode = option.mode || 'standard';
    this.loadingMode = option.loadingMode || { mode: 'throttle', delay: 200 };
    this.dataKey = option.dataKey;
    this.validateKey = option.validateKey || 'none';
    this.validateClassName = option.validateClassName;

    this.addRowClassName = option.addRowClassName;
    this.updateClassName = option.updateClassName;
    this.removeRowClassName = option.removeRowClassName;
  }
}

/**
 * Flex Grid를 확장한 클래스
 */
export default class ExtendGrid {
  public name: string;
  private initialize = false;

  public gridOptions: GridOptions = {
    useSelector: false,
    useGroupPanel: true,
    useContextMenu: true,
    useFilter: true,
    useFooter: false,
    useAutoColumnFit: false,
    useCellTooltip: 'ellipsis',
    useCellTemplateTooltip: false,
    useMerge: false,
    useParseDate: true,
    setMergePreAffected: true,
    selectionMode: SelectionMode.MultiRange,
    allowSorting: AllowSorting.MultiColumn,
    keyActionEnter: KeyAction.MoveDown,
    keyActionTab: KeyAction.CycleEditable,
    deferResizing: true,
    quickAutoSize: true,
    imeEnabled: true,
    showSelectedHeaders: HeadersVisibility.All,
    showMarquee: true
  };
  public dataOptions: DataOptions | null;
  private setOptions: any = {};

  private _dataKey: string[] = [];
  public get dataKey() {
    return this._dataKey;
  }
  public set dataKey(dataKey: string[]) {
    if (this.dataOptions) this.dataOptions.dataKey = dataKey;
    this._dataKey = dataKey;
  }
  public flexGrid: FlexGrid;

  private currentRowIndex = 0;
  private currentColumnIndex = 0;

  private onError = false;

  private originalDataMap: Map<string, Map<string, any>> = new Map();
  private originalData: any = null;
  private dateColumns: Column[] = [];

  public _pinHist: Map<string, number> = new Map();

  public footerRow: GroupRow | undefined;
  public selector: Selector | undefined;
  public contextMenu: ExtendGridContextMenu | undefined;
  public groupPanel: GroupPanel | undefined;
  public groupContextMenu: ExtendGroupContextMenu | undefined;
  public filter: FlexGridFilter | undefined;

  public tooltip: TooltipMode = 'none';
  public layoutMode: ILayoutStorage = { mode: 'none' };

  private added: Map<string, any> = new Map();
  private updated: Map<string, any> = new Map();
  private removed: Map<string, any> = new Map();
  private errors: Map<string, Set<string>> = new Map();

  public gridContainerHeight: string = '';

  public get isEditing(): boolean {
    return this.added.size > 0 || this.updated.size > 0 || this.removed.size > 0;
  }

  public get selectedItems(): Array<any> {
    return this.flexGrid.rows.filter(r => r.isSelected).map(r => r.dataItem);
  }

  public get selectedRows(): Array<Row> {
    return this.flexGrid.rows.filter(r => r.isSelected);
  }

  public get addingItems(): any {
    const addedItems = cloneDeep([...this.added.values()]).filter((item: any) => !this.removed.has(item._RID));
    return addedItems.map((item: any) => {
      delete item._RID;
      return {
        data: item
      };
    });
  }
  public get updatingItems(): any {
    const updatedItems = cloneDeep([...this.updated.values()]).filter((item: any) => !this.removed.has(item._RID));
    return updatedItems.map((item: any) => {
      const updatedItem = {
        key: this.getOriginalDataKey(item),
        data: item
      };
      delete item._RID;
      return updatedItem;
    });
  }
  public get removingItems(): any {
    const removedItems = cloneDeep([...this.removed.values()]).filter((item: any) => !this.added.has(item._RID));
    return removedItems.map((item: any) => {
      const removedItem = {
        key: this.getOriginalDataKey(item)
      };
      delete item._RID;
      return removedItem;
    });
  }

  private uuidv4() {
    return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  private getDataKey(dataItem: any) {
    return `${this.dataKey.map(key => dataItem[key])}`;
  }

  private getOriginalDataKey(dataItem: any) {
    const dataMap = this.originalDataMap.get(dataItem._RID);
    let dataKey: any = {};
    this.dataKey.forEach(key => {
      if (dataMap && dataMap.has(key)) {
        dataKey[key] = dataMap.get(key);
      } else {
        dataKey[key] = dataItem[key];
      }
    });
    return dataKey;
  }
  /**
   * @param {FlexGrid} flexGrid @grapecity/wijmo.grid/FlexGrid
   * @param {GridOptions} gridOptions FlexGrid의 설정
   * @param {DataOptions} dataOptions Data의 Row 변경 사항을 추적하고, 전송하기 위한 객체
   *
   * @see GridOptions
   * @see DataOptions
   *
   * @returns ExtendGrid
   */
  constructor(option: { name?: string; flexGrid: FlexGrid; dataOptions?: DataOptions; gridOptions?: GridOptions }) {
    this.name = option.name || this.uuidv4();
    this.flexGrid = option.flexGrid;
    this.dataOptions = option.dataOptions || null;
    this.gridOptions = Object.assign(this.gridOptions, option.gridOptions);

    if (document.readyState === 'complete') {
      this.onLoaded();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') this.onLoaded();
      });
    }
  }

  private onLoaded() {
    this.gridContainerHeight = this.flexGrid.hostElement.style.height;

    if (this.flexGrid.itemsSource && this.flexGrid.itemsSource.sourceCollection?.length > 0) {
      this.setInitialize();
    } else {
      this.flexGrid.itemsSourceChanged.addHandler(this.setInitialize, this);
    }
  }

  public async setInitialize() {
    this.flexGrid.itemsSourceChanged.removeHandler(this.setInitialize, this);
    if (this.initialize) return;
    this.initialize = true;

    this.setInitialzeGrid(this.gridOptions);
    if (this.dataOptions) this.setInitialzeData(this.dataOptions);
    this.setInitializeHandler();

    if (this.gridOptions?.onInitialized) {
      await Promise.resolve(this.gridOptions.onInitialized(this));
    }

    this.refresh();
  }

  private setInitialzeGrid(gridOptions: GridOptions) {
    if (gridOptions.useSelector) {
      this.setSelector();
    } else {
      this.hideRowHeader();
    }
    if (gridOptions.useGroupPanel) {
      this.setGroupPanel(gridOptions.setGroupPanelOptions);
    }
    if (gridOptions.useContextMenu) {
      this.setContextMenu(gridOptions.setContextMenuProps);
    }
    if (gridOptions.useFilter) {
      this.setGridFilter();
    }
    if (gridOptions.useFooter) {
      this.setFooter();
    }
    if (gridOptions.useCellTooltip !== 'none') {
      this.setCellTooltip(gridOptions.useCellTooltip);
    }
    if (gridOptions.useMerge) {
      this.setMerge(gridOptions.useMerge, gridOptions.setMergePreAffected);
    }
    if (gridOptions.useParseDate) {
      this.addParseDateHandler();
    }
    if (gridOptions.selectionMode) {
      this.setSelectionMode(gridOptions.selectionMode);
    }
    if (gridOptions.allowSorting) {
      this.setAllowSorting(gridOptions.allowSorting);
    }
    if (gridOptions.keyActionEnter) {
      this.setKeyActionTab(gridOptions.keyActionEnter);
    }
    if (gridOptions.keyActionTab) {
      this.setKeyActionTab(gridOptions.keyActionTab);
    }
    if (gridOptions.deferResizing) {
      this.setDeferResizing(gridOptions.deferResizing);
    }
    if (gridOptions.quickAutoSize) {
      this.setQuickAutoSize(gridOptions.quickAutoSize);
    }
    if (gridOptions.imeEnabled) {
      this.setImeEnabled(gridOptions.imeEnabled);
    }
    if (gridOptions.showSelectedHeaders) {
      this.setShowSelectedHeaders(gridOptions.showSelectedHeaders);
    }
    if (gridOptions.showMarquee) {
      this.setShowMarquee(gridOptions.showMarquee);
    }
  }

  /**
   * Row Header에 Selector를 생성
   * 호출 시, FlexGrid.headersVisibility = All이 적용
   */
  public setSelector() {
    if (this.setOptions.selector) return;
    this.setOptions.selector = true;

    const selectionMode = this.flexGrid.selectionMode;
    this.selector = new Selector(this.flexGrid);

    this.flexGrid.headersVisibility = HeadersVisibility.All;
    this.selector.column = this.flexGrid.rowHeaders.columns[0];
    this.flexGrid.selectionMode = selectionMode;
  }

  /**
   * Row Header를 숨김
   */
  public hideRowHeader() {
    if (this.setOptions.hideRowHeader) return;

    this.setOptions.hideRowHeader = true;
    this.flexGrid.rowHeaders.columns.splice(0, 1);
  }

  /**
   * Group Panel을 생성
   * @param {any} options Group Panel Option
   */
  public setGroupPanel(options: any) {
    const node = this.groupPanel ? this.groupPanel.hostElement : document.createElement('div');
    node.style.cssText = 'display: none;';

    if (options && !options.grid) {
      options.grid = this.flexGrid;
    }

    this.groupPanel = new GroupPanel(node, options || { grid: this.flexGrid });
    this.moveGroupPanel(node);

    if (!this.groupContextMenu) {
      this.setGroupPanelContextMenu(this.groupPanel);
    }
  }

  private moveGroupPanel(node: HTMLElement) {
    if (!this.flexGrid?.hostElement) {
      setTimeout(this.moveGroupPanel, 200);
      return;
    }
    this.flexGrid.hostElement.before(node);
  }

  /**
   * Context Menu를 생성
   * @param {GroupPanel} groupPanel Group Panel
   * @param {GroupContextMenuProps} props Context Menu Props
   */

  public setGroupPanelContextMenu(groupPanel: GroupPanel, prop?: GroupContextMenuProps) {
    this.groupContextMenu = new ExtendGroupContextMenu(this, groupPanel, prop);
  }

  /**
   * Context Menu를 생성
   * @param {ContextMenuProps} props Context Menu Props
   */
  public setContextMenu(props: ContextMenuProps = {}) {
    if (typeof props.useGroupColumn === 'undefined' && !this.gridOptions.useGroupPanel) {
      props.useGroupColumn = false;
    }
    // if (typeof props.useFixedColumn === "undefined" && !this.flexGrid.allowPinning) {
    //   props.useFixedColumn = false;
    // }
    if (typeof props.useLayout === 'undefined') {
      this.layoutMode = props.useLayout = {
        key: 'main',
        mode: process.env.NODE_ENV === 'development' ? 'localStorage' : 'uiframework'
      };
    }
    this.contextMenu = new ExtendGridContextMenu(this, props);
  }

  /**
   * Group Filter 생성
   */
  public setGridFilter() {
    if (!this.filter) {
      this.filter = new FlexGridFilter(this.flexGrid);
      if (this.dataOptions?.mode === 'virtual') {
        this.filter.defaultFilterType = FilterType.Condition;
      }
    }
    if (this.setOptions.filter) return;
    this.setOptions.filter = true;
  }

  /**
   * Footer를 생성하고, 첫 번째 열에 Row Count를 표시
   */
  public setFooter() {
    if (!this.footerRow) {
      this.footerRow = new GroupRow();
      this.flexGrid.columnFooters.rows.push(this.footerRow);
      this.flexGrid.columnFooters.hostElement.style.fontWeight = 'bold';
    }
    if (this.setOptions.footer) return;
    this.setOptions.footer = true;
  }

  /**
   * FlexGrid의 itemsSource가 갱신될 때마다 열 넓이를 자동으로 조정
   */
  public setAutoColumnFit() {
    if (this.setOptions.autoColumnFit) return;
    this.setOptions.autoColumnFit = true;
  }

  public setAutoSizeAllColumn() {
    const startIndex = this.flexGrid.viewRange.row;
    const endIndex = this.flexGrid.viewRange.row2;

    this.flexGrid.deferUpdate(() => {
      for (let col = 0; col < this.flexGrid.columns.length; col++) {
        let maxContent = '';
        for (let row = startIndex; row < endIndex; row++) {
          const content = this.flexGrid.getCellData(row, col, true);

          if (content.length > maxContent.length) maxContent = content;
        }

        const width = calcTextSize(maxContent, {
          fontSize: 'var(--font-size-body03)',
          padding: '0px 20px'
        }).width;
        this.flexGrid.columns[col].width = width;
      }
    });
  }

  /**
   * Cell Tooltip 생성
   * @param {TooltipMode} useCellTooltip Tooltip Mode 설정
   */
  public setCellTooltip(useCellTooltip: TooltipMode = 'ellipsis') {
    this.tooltip = useCellTooltip;
    this.flexGrid.formatItem.removeHandler(this.setTooltip, this);
    if (this.tooltip === 'none') return;

    this.flexGrid.formatItem.addHandler(this.setTooltip, this);
  }

  private searchTooltipAttr = (el: HTMLElement | Element): HTMLElement | Element | void => {
    const tooltipContent = el.hasAttribute('tooltip');
    if (tooltipContent) return el;

    if (el.children.length <= 0) return;

    for (let index = 0; index < el.children.length; index++) {
      const child = el.children.item(index);
      if (child) {
        const tooltipContent2 = this.searchTooltipAttr(child);
        if (tooltipContent2) return tooltipContent2;
      }
    }
  };

  private setTooltip(s: any, e: any) {
    const ele = e.cell;
    if (!ele) return;

    ele.onmouseenter = (evt: MouseEvent) => {
      let tooltipContent = ele.textContent;
      let showAlways = this.tooltip === 'always';

      if (this.gridOptions.useCellTemplateTooltip) {
        const tooltipEle = this.searchTooltipAttr(ele);
        if (tooltipEle) {
          tooltipContent = tooltipEle.getAttribute('tooltip');
          showAlways = tooltipEle.hasAttribute('always');
        }
      }

      if (!tooltipContent) return;

      const span = ele.querySelector('.wj-cell-text');
      if (!span) return;
      if (!showAlways && span.offsetWidth >= span.scrollWidth) {
        return;
      }

      removeAllClass('tooltip');

      const divEl = document.createElement('div');
      divEl.classList.add('tooltip');
      divEl.innerHTML = tooltipContent;
      document.body.appendChild(divEl);
      const { xKey, xPos, yKey, yPos } = getTooltipPosition(divEl, evt, 'elupdown', true);

      let arrow = `tooltip-${yKey}-${xKey}-tb`;
      divEl.className = `tooltip ${arrow}`;
      divEl.style[xKey as any] = `${xPos}px`;
      divEl.style[yKey as any] = `${yPos}px`;
    };
    ele.onmouseleave = () => {
      removeAllClass('tooltip');
    };
    ele.onclick = () => {
      removeAllClass('tooltip');
    };
  }

  /**
   * Cell Merge 설정
   * @param {boolean | Array<string>} useMerge Merge 사용 여부 | Merge 대상 Column.binding 배열
   * @param {boolean} preAffected Merge 시, 앞 열 데이터에 영향을 받는지
   * @param {boolean} alignCenter 가운데 정렬
   */
  public setMerge(useMerge: boolean | Array<string>, preAffected: boolean = true, alignCenter: boolean = true) {
    this.flexGrid.formatItem.removeHandler(this.centerCell, this);
    this.flexGrid.mergeManager = new CustomMergeManager(useMerge, preAffected);
    if (alignCenter) {
      this.flexGrid.formatItem.addHandler(this.centerCell, this);
    }
  }

  private centerCell(s: any, e: any) {
    if (e.cell.children.length == 0) {
      e.cell.innerHTML = '<div>' + e.cell.innerHTML + '</div>';
      setCss(e.cell, {
        display: 'table',
        tableLayout: 'fixed'
      });
      setCss(e.cell.children[0], {
        display: 'table-cell',
        textAlign: 'center',
        verticalAlign: 'middle'
      });
    }
  }

  /**
   * DataType이 Date인 Data를 Date 객체 수정하는 이벤트 추가
   */
  public addParseDateHandler() {
    if (this.setOptions.parseDate) return;
    this.setOptions.parseDate = true;
  }

  /**
   * DataType이 Date인 Data를 Date 객체 수정하는 이벤트 제거
   */
  public removeParseDateHandler() {
    if (!this.setOptions.parseDate) return;
    this.setOptions.parseDate = false;
  }

  /**
   * Cell 선택 시, 동작 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#selectionmode
   */
  public setSelectionMode(selectionMode: SelectionMode | string) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (typeof selectionMode === 'string') {
      this.flexGrid.selectionMode = SelectionMode[selectionMode as keyof typeof SelectionMode];
    } else {
      this.flexGrid.selectionMode = selectionMode;
    }
  }

  /**
   * Column Header 클릭 시, Sorting 기능 동작 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#allowsorting
   */
  public setAllowSorting(allowSorting: AllowSorting | string) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (typeof allowSorting === 'string') {
      this.flexGrid.allowSorting = AllowSorting[allowSorting as keyof typeof AllowSorting];
    } else {
      this.flexGrid.allowSorting = allowSorting;
    }
  }

  /**
   * Enter 키 입력 시, 동작 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#keyactionenter
   */
  public setKeyActionEnter(keyActionEnter: KeyAction | string) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (typeof keyActionEnter === 'string') {
      this.flexGrid.keyActionEnter = KeyAction[keyActionEnter as keyof typeof KeyAction];
    } else {
      this.flexGrid.keyActionEnter = keyActionEnter;
    }
  }

  /**
   * Tab 키 입력 시, 동작 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#keyactiontab
   */
  public setKeyActionTab(keyActionTab: KeyAction | string) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (typeof keyActionTab === 'string') {
      this.flexGrid.keyActionTab = KeyAction[keyActionTab as keyof typeof KeyAction];
    } else {
      this.flexGrid.keyActionTab = keyActionTab;
    }
  }

  /**
   * Row/Column 크기 조정 시, 입력이 끝날 때, Grid에 크기가 조정되도록 설정 (false면, 입력하는 중에도 크기가 조정)
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#deferresizing
   */
  public setDeferResizing(deferResizing: boolean) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    this.flexGrid.deferResizing = deferResizing;
  }

  /**
   * AutoSize 기능 사용 시, 성능 최적화
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#quickautosize
   */
  public setQuickAutoSize(quickAutoSize: boolean) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    this.flexGrid.quickAutoSize = quickAutoSize;
  }

  /**
   * 다국어 입력 허용 (일본어, 중국어, 한국어, 대만어, ...)
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#imeenabled
   */
  public setImeEnabled(imeEnabled: boolean) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    this.flexGrid.imeEnabled = imeEnabled;
  }

  /**
   * 현재 선택된 영역의 Header 표시 설정
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#showselectedheaders
   */
  public setShowSelectedHeaders(showSelectedHeaders: HeadersVisibility | string) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (typeof showSelectedHeaders === 'string') {
      this.flexGrid.showSelectedHeaders = HeadersVisibility[showSelectedHeaders as keyof typeof HeadersVisibility];
    } else {
      this.flexGrid.showSelectedHeaders = showSelectedHeaders;
    }
  }

  /**
   * 현재 선택된 영역의 윤곽선 표시 여부
   * @doc https://demo.grapecity.co.kr/wijmo/api/classes/wijmo_grid.flexgrid.html#showmarquee
   */
  public setShowMarquee(showMarquee: boolean) {
    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    this.flexGrid.showMarquee = showMarquee;
  }

  private setInitializeHandler() {
    this.addPinningColumnHandler();

    this.flexGrid.itemsSourceChanged.removeHandler(this.onItemsSourceChanged, this);
    this.flexGrid.itemsSourceChanged.addHandler(this.onItemsSourceChanged, this);

    this.flexGrid.formatItem.removeHandler(this.addSpanTag, this);
    this.flexGrid.formatItem.addHandler(this.addSpanTag, this);

    this.flexGrid.pinningColumn.removeHandler(this.pinningColumnHandler, this);
    this.flexGrid.pinningColumn.addHandler(this.pinningColumnHandler, this);

    if (this.dataOptions?.mode === 'virtual') {
      if (this.dataOptions.loadingMode) {
        const mode = this.dataOptions.loadingMode.mode;
        const delay = this.dataOptions.loadingMode.delay;
        if (mode === 'throttle') {
          this.flexGrid.scrollPositionChanged.removeAllHandlers();
          this.flexGrid.scrollPositionChanged.addHandler(throttle(this.virtualSetWindow, delay), this);
        } else if (mode === 'debounce') {
          this.flexGrid.scrollPositionChanged.removeAllHandlers();
          this.flexGrid.scrollPositionChanged.addHandler(debounce(this.virtualSetWindow, delay), this);
        }
      } else {
        this.flexGrid.scrollPositionChanged.removeHandler(this.virtualSetWindow, this);
        this.flexGrid.scrollPositionChanged.addHandler(this.virtualSetWindow, this);
      }
    }

    this.setGridElementEvent();
  }

  private setGridElementEvent() {
    if (!this.flexGrid?.hostElement) {
      setTimeout(this.setGridElementEvent, 200);
      return;
    }

    this.flexGrid.hostElement.addEventListener('click', this.onGridClick.bind(this));
    this.flexGrid.hostElement.addEventListener('dblclick', this.onGridDblClick.bind(this));
  }

  private addSpanTag(s: any, e: any) {
    let textContent,
      cellContent,
      aggregateHead = '',
      aggregateTail = '',
      spacer = '';
    if (e.panel === s.columnHeaders) {
      const column = e.getColumn();

      textContent = column.header;
      cellContent = e.cell.innerHTML.replace('&nbsp;', '');
      spacer = "<div class='spacer'></div>";
    }
    if (e.panel === s.columnFooters) {
      const aggregate = e.getColumn().aggregate;
      switch (e.getColumn().aggregate) {
        case Aggregate.Cnt:
          aggregateTail = ' Rows';
          break;
        default:
          aggregateHead = `${Aggregate[aggregate]} : `;
          break;
      }
      textContent = e.cell.innerText;
      cellContent = e.cell.innerHTML;
    }

    if (!textContent || !cellContent) return;

    const index = cellContent.lastIndexOf(textContent);
    if (index < 0) return;

    const parseContent = `<span class='wj-cell-text'>${aggregateHead}${textContent}${aggregateTail}</span>${spacer}${cellContent.substr(
      0,
      index
    )}${cellContent.substr(index + textContent.length, cellContent.length)}`;

    e.cell.innerHTML = parseContent;
  }

  private onGridClick(e: MouseEvent) {
    const ht = this.flexGrid.hitTest(e);
    if (!ht) return;

    switch (ht.panel) {
      case this.flexGrid.cells:
        this.gridOptions.onCellClick && this.gridOptions.onCellClick(this.flexGrid, ht, e);
        break;
      case this.flexGrid.columnHeaders:
        this.gridOptions.onColumnHeaderClick && this.gridOptions.onColumnHeaderClick(this.flexGrid, ht, e);
        break;
    }

    this.currentRowIndex = ht.row;
    this.currentColumnIndex = ht.col;
  }

  private onGridDblClick(e: MouseEvent) {
    const ht = this.flexGrid.hitTest(e);
    if (!ht) return;

    switch (ht.panel) {
      case this.flexGrid.cells:
        this.gridOptions.onCellDblClick && this.gridOptions.onCellDblClick(this.flexGrid, ht, e);
        break;
      case this.flexGrid.columnHeaders:
        this.gridOptions.onColumnHeaderDblClick && this.gridOptions.onColumnHeaderDblClick(this.flexGrid, ht, e);
        break;
    }
  }

  public async refresh() {
    if (!this.flexGrid || !this.flexGrid.itemsSource) return;

    if (!this.flexGrid?.hostElement) {
      setTimeout(this.refresh, 200);
      return;
    }

    try {
      this.refreshData();
      await this.refreshLayout();
      this.flexGrid.refresh();

      if (this.gridOptions.onRefreshed) Promise.resolve(this.gridOptions.onRefreshed(this));
    } catch (e) {
      console.log(e);
    }
  }

  private refreshData() {
    for (const column of this.flexGrid.columns) {
      if (column.editor instanceof InputDateTime) column.align = 'between';
      if (column.dataMap) column.align = 'between';
      if (!column.cellTemplate && !(column as any)['$__cellTemplCell']) {
        column.cellTemplate = "<span class='wj-cell-text'>${text}</span>";
      }
    }

    this.dateColumns = this.flexGrid.columns.filter((column: Column) => column.dataType === DataType.Date);

    this.flexGrid.collectionView?.sourceCollection?.forEach((row: any) => {
      if (this.setOptions.parseDate) {
        this.dateColumns.forEach(column => {
          const binding = column.binding;
          if (!binding || !Object.prototype.hasOwnProperty.call(row, binding)) return;
          if (!row[binding]) return;
          if (row[binding] instanceof Date) return;
          row[binding] = new Date(row[binding]);
        });
      }
    });

    if (this.dataOptions?.mode === 'virtual') {
      this.virtualSetWindow(this.flexGrid);
    }
    if (this.setOptions.validateUniqueKey) {
      this.validationKeyHandler();
    }
  }

  private async refreshLayout() {
    let layoutData = null;

    if (this.layoutMode) {
      layoutData = await this.loadLayout(this.layoutMode);
      if (this.applyLayout(layoutData)) {
        this.flexGrid.select(new CellRange(0, 0), true);
      }
    }

    if (!layoutData && this.gridOptions.useAutoColumnFit) {
      const origMode = this.flexGrid.autoSizeMode;
      if (this.flexGrid.columns.length > 20) {
        this.flexGrid.autoSizeMode = AutoSizeMode.Headers;
      }
      this.flexGrid.autoSizeColumns();
      this.flexGrid.autoSizeMode = origMode;
    }
  }

  private onItemsSourceChanged(s: FlexGrid, e: any) {
    this.refresh();
  }

  private virtualSetWindow(s: FlexGrid) {
    const cv = s.collectionView as RestVirtualCollectionView;
    if (!cv) return;
    this.dateColumns = s.columns.filter((column: Column) => column.dataType === DataType.Date);
    cv.setWindow && cv.setWindow(s.viewRange.row, s.viewRange.row2, this.dateColumns);
  }

  /**
   * Column Pin 고정/해제 시에 실행되는 이벤트 추가
   */
  public addPinningColumnHandler() {
    if (this.setOptions.pinning) return;
    this.setOptions.pinning = true;
  }

  /**
   * Column Pin 고정/해제 시에 실행되는 이벤트 제거
   */
  public removePinningColumnHandler() {
    if (!this.setOptions.pinning) return;
    this.setOptions.pinning = false;
  }

  private pinningColumnHandler(s: any, e: any) {
    if (!this.setOptions.pinning) return;

    const col = s.columns[e.col],
      cols = s.columns,
      fCols = s.frozenColumns;

    if (col.index >= fCols && col.binding) {
      this._pinHist.set(col.binding, col.index);
      cols.moveElement(col.index, fCols, false);
      s.select(new CellRange(0, fCols, s.rows.length, col.index));
      cols.frozen++;
    }

    if (col.index < fCols && col.binding) {
      const origIndex = this._pinHist.get(col.binding);
      this._pinHist.delete(col.binding);
      cols.moveElement(col.index, origIndex || fCols - 1, false);
      s.select(new CellRange(0, col.index, s.rows.length, col.index));
      cols.frozen--;
    }

    e.cancel = true;
  }

  private setInitialzeData(dataOptions: DataOptions) {
    this.setTrackChanges();
    if (dataOptions && dataOptions.validateKey === 'edit') {
      this.validateUniqueKey();
    }
    if (dataOptions && dataOptions.dataKey) {
      if (typeof dataOptions.dataKey === 'string') this.dataKey = [dataOptions.dataKey];
      else this.dataKey = dataOptions.dataKey;

      const ridCol = this.flexGrid.columns.find((column: any) => column.binding === '_RID');
      if (ridCol) ridCol.visible = false;
      else this.flexGrid.columns.push(new Column({ binding: '_RID', visible: false }));
    }
  }

  private setTrackChanges() {
    if (!this.dataOptions) return;
    if (this.setOptions.setTrackChanges) return;

    this.setOptions.setTrackChanges = true;

    this.flexGrid.beginningEdit.removeHandler(this.cellChanging, this);
    this.flexGrid.cellEditEnded.removeHandler(this.cellChanged, this);
    this.flexGrid.pastingCell.removeHandler(this.cellChanging, this);
    this.flexGrid.pastedCell.removeHandler(this.cellChanged, this);

    this.flexGrid.formatItem.removeHandler(this.cellHighlight, this);

    this.flexGrid.beginningEdit.addHandler(this.cellChanging, this);
    this.flexGrid.cellEditEnded.addHandler(this.cellChanged, this);
    this.flexGrid.pastingCell.addHandler(this.cellChanging, this);
    this.flexGrid.pastedCell.addHandler(this.cellChanged, this);

    this.flexGrid.formatItem.addHandler(this.cellHighlight, this);
  }

  private cellHighlight(s: any, e: any) {
    if (e.panel == s.cells) {
      let errors = false;
      let removed = false;
      let added = false;
      let updated = false;

      const rid = e.getRow().dataItem?._RID;
      if (!rid) return;
      const binding = e.getColumn().binding;

      const errorMap = this.errors.get(rid);
      if (binding && errorMap?.has(binding)) {
        errors = true;
      }

      removed = this.removed.has(rid);
      if (!removed) {
        added = this.added.has(rid);
        if (!added) {
          const updatedMap = this.originalDataMap.get(rid);
          if (binding && updatedMap?.has(binding)) {
            updated = true;
          }
        }
      }

      toggleClass(e.cell, this.dataOptions?.validateClassName || 'cell-error', errors);
      toggleClass(e.cell, this.dataOptions?.addRowClassName || 'cell-removed', removed);
      toggleClass(e.cell, this.dataOptions?.updateClassName || 'cell-added', added);
      toggleClass(e.cell, this.dataOptions?.removeRowClassName || 'cell-updated', updated);
    }
  }

  private cellChanging(s: any, e: any) {
    const cellData = s.getCellData(e.row, e.col, false);
    this.originalData = cellData;
  }

  private cellChanged(s: any, e: any) {
    this.onError = false;

    const item = e.getRow().dataItem;
    const binding = e.getColumn().binding;
    let newValue = s.getCellData(e.row, e.col, false);

    if (this.originalData != newValue) {
      if (this.errors.has(item._RID)) {
        const errorRow = this.errors.get(item._RID);
        errorRow?.delete(binding);
        if (errorRow?.size === 0) {
          this.errors.delete(item._RID);
        }
      }

      if (this.removed.has(item._RID)) {
        this.removed.delete(item._RID);
      }
    }
    this.checkChanges(item, binding, this.originalData || '', newValue || '');

    this.setOnEditing(this.isEditing);
  }

  private checkChanges(editingRow: any, editingColumn: any, originalValue: any, newValue: any) {
    if (this.added.has(editingRow._RID)) {
      this.added.set(editingRow._RID, editingRow);
      return;
    }

    const originalRow = this.originalDataMap.get(editingRow._RID);
    if (originalRow && originalRow.has(editingColumn)) {
      originalValue = originalRow.get(editingColumn);
    }

    if (this._sameValue(originalValue, newValue)) {
      if (originalRow) {
        if (originalRow.has(editingColumn)) {
          originalRow.delete(editingColumn);
        }
        if (originalRow.size === 0) {
          this.originalDataMap.delete(editingRow._RID);
          this.updated.delete(editingRow._RID);
          delete editingRow._RID;
        }
      }
      return;
    }

    if (!editingRow._RID) {
      editingRow._RID = this.uuidv4();
    }

    if (!originalRow) {
      const newOrignalRow = new Map();
      newOrignalRow.set(editingColumn, originalValue);
      this.originalDataMap.set(editingRow._RID, newOrignalRow);
    } else if (!originalRow.has(editingColumn)) {
      originalRow.set(editingColumn, originalValue);
    }
    this.updated.set(editingRow._RID, editingRow);
  }

  private _sameValue(item1: any, item2: any) {
    if (item1 == item2) {
      return true;
    }
    if (isDate(item1) && isDate(item2)) {
      return item1.getTime() == item2.getTime();
    }
    return false;
  }

  /**
   * Data Key가 중복되는 데이터가 있는지 Validate Check 이벤트 추가
   */
  public validateUniqueKey() {
    if (this.setOptions.validateUniqueKey) return;
    this.setOptions.validateUniqueKey = true;
  }

  /**
   * Data Key가 중복되는 데이터가 있는지 Validate Check 이벤트 제거
   */
  public invalidateUniqueKey() {
    if (!this.setOptions.validateUniqueKey) return;
    this.setOptions.validateUniqueKey = false;
  }

  private validationKeyHandler() {
    const cv = this.flexGrid.collectionView;

    if (!this.flexGrid) throw new Error('FlexGrid is not defined');
    if (!cv) throw new Error('CollectionView is not defined');

    (cv as any).getError = (item: any, prop: string, parsing: boolean) => {
      const dataKey = this.dataKey;
      if (!dataKey.includes(prop)) return;
      if (!item[prop]) {
        this.flexGrid.startEditing(true, undefined, prop);
        this.onError = true;
        return 'Key is Required';
      }
      if (dataKey.length > 0) {
        const targetKey = this.getDataKey(item);
        const uniqueFilter = cv.sourceCollection.filter((source: any) => {
          if (this.removed.has(source._RID)) return false;

          const rowKey = this.getDataKey(source);
          return targetKey === rowKey;
        });
        if (uniqueFilter.length > 1) {
          this.flexGrid.startEditing(true, undefined, prop);
          this.onError = true;
          return 'This key is already exist';
        }
        return '';
      }
    };
  }

  private _addRow(rowIndex: number) {
    return new Promise(async (resolve, reject) => {
      try {
        const newRID = this.uuidv4();

        const initRowData = this.gridOptions?.onInitialzeRowData ? await Promise.resolve(this.gridOptions?.onInitialzeRowData()) : {};

        const newRowData = {
          ...initRowData,
          _RID: newRID
        };
        const view = this.flexGrid?.collectionView;
        if (!view) return;

        view.sourceCollection.splice(rowIndex, 0, newRowData);

        const item = newRowData;
        this.added.set(newRID, item);

        this.flexGrid.collectionView.refresh();
        this.flexGrid.refresh();
        this.flexGrid.focus();
        return resolve(true);
      } catch {
        return reject(false);
      }
    });
  }

  private _rowIndex: number | undefined;
  private _addRowThrottle = throttle(async () => {
    if (typeof this._rowIndex === 'undefined' || this._rowIndex < 0) return;
    await this._addRow(this._rowIndex);
  }, 100);

  /**
   * 행을 추가합니다.
   * @param rowIndex 생성할 row의 위치, null 값이면 선택된 행 기준으로 생성
   */
  public addRow(rowIndex?: number) {
    if (!this.dataOptions) return;
    if (this.onError) return;
    if (this.currentRowIndex < 0) this.currentRowIndex = 0;
    if (this.currentColumnIndex < 0) this.currentColumnIndex = 0;

    this._rowIndex = rowIndex || this.currentRowIndex;

    this._addRowThrottle();
  }

  private removeDataFromSource(_rid: string, callback: Function | undefined = undefined) {
    const index = this.flexGrid.collectionView.sourceCollection.findIndex((source: any) => {
      return source._RID === _rid;
    });
    if (index >= 0) {
      this.flexGrid.collectionView.sourceCollection.splice(index, 1);
      this.added.delete(_rid);
      if (callback) {
        callback(_rid, index);
      }
      return true;
    }

    return false;
  }

  /**
   * 행을 삭제합니다.
   * @param rows 삭제할 Row의 배열, null 값이면 현재 선택된 row를 삭제
   */
  public removeRow(rows?: Array<Row>) {
    if (!this.dataOptions) return;
    if (this.onError) return;
    if (!this.dataKey || this.dataKey.length === 0) return;

    if (rows) {
      rows.forEach(row => {
        if (row.dataItem._RID) {
          if (this.added.has(row.dataItem._RID)) {
            this.removeDataFromSource(row.dataItem._RID);
            return;
          }
        } else {
          row.dataItem._RID = this.uuidv4();
        }
        this.removed.set(row.dataItem._RID, row.dataItem);
        row.isSelected = false;
      });
    } else {
      if (!this.selectedRows || this.selectedRows.length === 0) return;
      this.selectedRows.forEach(row => {
        if (row.dataItem._RID) {
          if (this.added.has(row.dataItem._RID)) {
            this.removeDataFromSource(row.dataItem._RID);
            return;
          }
        } else {
          row.dataItem._RID = this.uuidv4();
        }
        this.removed.set(row.dataItem._RID, row.dataItem);
        row.isSelected = false;
      });
    }

    this.flexGrid.collectionView.refresh();
    this.flexGrid.refresh();
    this.flexGrid.focus();
  }

  /**
   * FlexGred의 변경 사항을 Arguments로 DataOption에 정의한 onSaveEditData를 실행
   * (DataOption의 validateKey가 save일 경우, 실행 전 Data Key가 중복되는 데이터가 있는지 Validate Check)
   */
  public async saveEditData() {
    this.flexGrid.finishEditing();
    if (!this.dataOptions || this.dataKey.length === 0) throw new Error('dataKey is Required');

    this.errors.clear();

    let removedItems = [...this.removed.values()].filter(item => !this.added.has(item._RID));
    let updatedItems = [...this.updated.values()].filter(item => !this.removed.has(item._RID));
    let addedItems = [...this.added.values()].filter(item => !this.removed.has(item._RID));
    let remainItems = [...this.removed.values()].filter(item => this.added.has(item._RID));

    const grid = this.flexGrid,
      cv = grid.collectionView;

    if (!grid) throw new Error('FlexGrid is not defined');
    if (!cv) throw new Error('CollectionView is not defined');

    if (this.dataOptions.validateKey === 'save') {
      for await (const item of [...updatedItems, ...addedItems]) {
        const dataKey = this.dataKey;

        const rid = item._RID;

        const targetKey = this.getDataKey(item);
        const uniqueFilter = cv.sourceCollection.filter((source: any) => {
          if (this.removed.has(source._RID)) return false;

          const rowKey = this.getDataKey(source);
          return targetKey === rowKey;
        });
        if (uniqueFilter.length > 1) {
          this.errors.set(rid, new Set(dataKey));
        } else {
          dataKey.forEach(key => {
            if (!item[key]) {
              if (!this.errors.has(rid)) {
                const errSet = new Set<string>();
                errSet.add(key);
                this.errors.set(rid, errSet);
              } else {
                this.errors.get(rid)?.add(key);
              }
            }
          });
        }
      }

      if (this.errors.size > 0) {
        this.flexGrid.collectionView?.refresh();
        this.flexGrid.refresh();
        this.flexGrid.focus();
        return false;
      }
    }

    let reqRemovedItems: any[] = [],
      reqUpdatedItems: any[] = [],
      reqAddedItems: any[] = [];
    if (this.gridOptions.onSaveEditData) {
      if (removedItems.length > 0) {
        reqRemovedItems = removedItems.map(item => {
          const removedItem = {
            key: this.getOriginalDataKey(item)
          };
          return removedItem;
        });
      }
      if (updatedItems.length > 0) {
        reqUpdatedItems = updatedItems.map(item => {
          let data = cloneDeep(item);
          delete data._RID;
          const updatedItem = {
            key: this.getOriginalDataKey(item),
            data
          };
          return updatedItem;
        });
      }
      if (addedItems.length > 0) {
        reqAddedItems = addedItems.map(item => {
          let data = cloneDeep(item);
          delete data._RID;
          const addedItem = {
            data
          };
          return addedItem;
        });
      }

      let success = await Promise.resolve(this.gridOptions.onSaveEditData(reqAddedItems, reqUpdatedItems, reqRemovedItems));
      if (success === false) {
        console.log(success);
        return false;
      }

      cv.deferUpdate(() => {
        if (removedItems.length > 0) {
          removedItems.forEach(item => {
            this.removeDataFromSource(item._RID);
          });
        }
        if (updatedItems.length > 0) {
          updatedItems.forEach(item => {
            delete item._RID;
          });
        }
        if (addedItems.length > 0) {
          addedItems.forEach(item => {
            delete item._RID;
          });
        }
        if (remainItems.length > 0) {
          remainItems.forEach(item => {
            this.removeDataFromSource(item._RID);
          });
        }
      });
    }

    this.added.clear();
    this.originalDataMap.clear();
    this.updated.clear();
    this.removed.clear();

    this.selectedRows.forEach(r => (r.isSelected = false));

    this.flexGrid.collectionView?.refresh();
    this.flexGrid.refresh();
    this.flexGrid.focus();

    this.setOnEditing(this.isEditing);
    return true;
  }

  /**
   * FlexGred의 변경 사항을 취소
   */
  public async clearChanges() {
    this.flexGrid.finishEditing();
    if (!this.dataOptions || this.dataKey.length === 0) return;

    this.errors.clear();

    let removedItems = [...this.removed.values()].filter(item => !this.added.has(item._RID) && !this.updated.has(item._RID));
    let updatedItems = [...this.updated.values()];
    let addedItems = [...this.added.values()];

    const grid = this.flexGrid,
      cv = grid.collectionView;

    if (!grid) throw new Error('FlexGrid is not defined');
    if (!cv) throw new Error('CollectionView is not defined');

    if (removedItems.length > 0) {
      removedItems.forEach(item => {
        delete item._RID;
      });
    }
    if (updatedItems.length > 0) {
      updatedItems.forEach(item => {
        const dataMap = this.originalDataMap.get(item._RID);
        if (dataMap) {
          dataMap.forEach((value, key, map) => {
            item[key] = value;
          });
        }

        delete item._RID;
      });
    }

    let foundItems: string[] = [];
    if (addedItems.length > 0) {
      for await (const item of addedItems) {
        this.removeDataFromSource(item._RID, (_rid: string) => {
          foundItems.push(_rid);
        });
      }

      foundItems.forEach(item => this.added.delete(item));
    }

    // this.added.clear();
    this.originalDataMap.clear();
    this.updated.clear();
    this.removed.clear();

    this.selectedRows.forEach(r => (r.isSelected = false));

    this.flexGrid.collectionView?.refresh();
    this.flexGrid.refresh();
    this.flexGrid.focus();

    this.setOnEditing(this.isEditing);
  }

  /**
   * 변경사항 object 가져오기
   * @returns { addedItems, updatedItems, removedItems }
   */
  public async getChangedData(): Promise<{ addedItems: any[]; updatedItems: any[]; removedItems: any[] }> {
    this.flexGrid.finishEditing();
    if (!this.dataOptions || this.dataKey.length === 0) throw new Error('dataKey is Required');

    this.errors.clear();

    let removedItems = [...this.removed.values()].filter(item => !this.added.has(item._RID));
    let updatedItems = [...this.updated.values()].filter(item => !this.removed.has(item._RID));
    let addedItems = [...this.added.values()].filter(item => !this.removed.has(item._RID));
    let remainItems = [...this.removed.values()].filter(item => this.added.has(item._RID));

    const grid = this.flexGrid,
      cv = grid.collectionView;

    if (!grid) throw new Error('FlexGrid is not defined');
    if (!cv) throw new Error('CollectionView is not defined');

    if (this.dataOptions.validateKey === 'save') {
      for await (const item of [...updatedItems, ...addedItems]) {
        const dataKey = this.dataKey;

        const rid = item._RID;

        const targetKey = this.getDataKey(item);
        const uniqueFilter = cv.sourceCollection.filter((source: any) => {
          if (this.removed.has(source._RID)) return false;

          const rowKey = this.getDataKey(source);
          return targetKey === rowKey;
        });
        if (uniqueFilter.length > 1) {
          this.errors.set(rid, new Set(dataKey));
        } else {
          dataKey.forEach(key => {
            if (!item[key]) {
              if (!this.errors.has(rid)) {
                const errSet = new Set<string>();
                errSet.add(key);
                this.errors.set(rid, errSet);
              } else {
                this.errors.get(rid)?.add(key);
              }
            }
          });
        }
      }

      if (this.errors.size > 0) {
        this.flexGrid.collectionView?.refresh();
        this.flexGrid.refresh();
        this.flexGrid.focus();
        console.error(this.errors);
        throw new Error('Validation error');
      }
    }

    let reqRemovedItems: any[] = [],
      reqUpdatedItems: any[] = [],
      reqAddedItems: any[] = [];

    if (removedItems.length > 0) {
      reqRemovedItems = removedItems.map(item => {
        const removedItem = {
          key: this.getOriginalDataKey(item)
        };
        return removedItem;
      });
    }
    if (updatedItems.length > 0) {
      reqUpdatedItems = updatedItems.map(item => {
        let data = cloneDeep(item);
        delete data._RID;
        const updatedItem = {
          key: this.getOriginalDataKey(item),
          data
        };
        return updatedItem;
      });
    }
    if (addedItems.length > 0) {
      reqAddedItems = addedItems.map(item => {
        let data = cloneDeep(item);
        delete data._RID;
        const addedItem = {
          data
        };
        return addedItem;
      });
    }

    return {
      addedItems: reqAddedItems,
      updatedItems: reqUpdatedItems,
      removedItems: reqRemovedItems
    };
  }

  /**
   * 변경사항을 저장처리
   */
  public setChangeCommit() {
    const grid = this.flexGrid,
      cv = grid.collectionView;

    let removedItems = [...this.removed.values()].filter(item => !this.added.has(item._RID));
    let updatedItems = [...this.updated.values()].filter(item => !this.removed.has(item._RID));
    let addedItems = [...this.added.values()].filter(item => !this.removed.has(item._RID));
    let remainItems = [...this.removed.values()].filter(item => this.added.has(item._RID));

    cv.deferUpdate(() => {
      if (removedItems.length > 0) {
        removedItems.forEach(item => {
          this.removeDataFromSource(item._RID);
        });
      }
      if (updatedItems.length > 0) {
        updatedItems.forEach(item => {
          delete item._RID;
        });
      }
      if (addedItems.length > 0) {
        addedItems.forEach(item => {
          delete item._RID;
        });
      }
      if (remainItems.length > 0) {
        remainItems.forEach(item => {
          this.removeDataFromSource(item._RID);
        });
      }
    });

    this.added.clear();
    this.originalDataMap.clear();
    this.updated.clear();
    this.removed.clear();

    this.selectedRows.forEach(r => (r.isSelected = false));

    this.flexGrid.collectionView?.refresh();
    this.flexGrid.refresh();
    this.flexGrid.focus();

    this.setOnEditing(this.isEditing);
  }

  public setOnEditing(isEditing: boolean) {
    const params = {
      changed: isEditing
    };
    EventBus.fire('set-changed', { params });
  }

  private getLocalStorageKey(key: string) {
    return `wijmoLayout_${window.location.pathname}_${key}`;
  }

  public async removeLayout(layoutMode: ILayoutStorage) {
    try {
      if (layoutMode.mode === 'localStorage') {
        localStorage.removeItem(this.getLocalStorageKey(layoutMode.key || 'main'));
      } else if (layoutMode.mode === 'uiframework') {
        await this.removeLayoutData(layoutMode.key);
      } else {
        return;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private removeLayoutData = (key: string = 'main') => {
    if (!key) key = 'main';
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const setting: any = await this.loadSetting();
        setting.layout[key] = {};
        const params = {
          params: {
            setting
          },
          resolve
        };

        EventBus.fire('save-user-setting', { params });
      } catch (err) {
        reject(new Error(`${err}`));
      }
    });
  };

  public async saveLayout(layoutMode: ILayoutStorage) {
    const layoutData = {
      columns: this.flexGrid.columnLayout,
      filterDefinition: this.filter?.filterDefinition,
      sortDescriptions: this.flexGrid.collectionView.sortDescriptions.map((sortDesc: any) => {
        return { property: sortDesc.property, ascending: sortDesc.ascending };
      })
    };

    try {
      if (layoutMode.mode === 'localStorage') {
        localStorage.setItem(this.getLocalStorageKey(layoutMode.key || 'main'), JSON.stringify(layoutData));
      } else if (layoutMode.mode === 'uiframework') {
        await this.saveLayoutData(JSON.stringify(layoutData), layoutMode.key);
      } else {
        return;
      }
    } catch (e) {
      console.log(e);
    }
  }

  private saveLayoutData = (layout: any, key: string = 'main') => {
    if (!key) key = 'main';
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const setting: any = await this.loadSetting();
        setting.layout[key] = layout;

        const params = {
          params: {
            setting
          },
          resolve
        };

        EventBus.fire('save-user-setting', { params });
      } catch (err) {
        reject(new Error(`${err}`));
      }
    });
  };

  public async loadLayout(layoutMode: ILayoutStorage) {
    let layoutData: any = null;
    if (layoutMode.mode === 'localStorage') {
      layoutData = localStorage.getItem(this.getLocalStorageKey(layoutMode.key || 'main'));
    } else if (layoutMode.mode === 'uiframework') {
      layoutData = await this.loadLayoutData(layoutMode.key);
    }

    if (layoutData) {
      try {
        return JSON.parse(layoutData);
      } catch {
        layoutData = null;
      }
    }

    return layoutData;
  }

  private loadLayoutData = (key: string = 'main') => {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const setting: any = await this.loadSetting();

        const result = setting.layout && setting.layout[key];
        if (!result) resolve(false);

        resolve(result);
      } catch (err) {
        reject(new Error(`${err}`));
      }
    });
  };

  public applyLayout(layout: any) {
    if (!layout || typeof layout !== 'object') return false;
    if (!this.flexGrid.collectionView) return false;

    try {
      const layoutColumns = JSON.parse(layout.columns);
      if (!layoutColumns?.columns) return;

      const loadedColumns: any[] = [];
      layoutColumns.columns.forEach((c1: any) => {
        const fc = this.flexGrid.columns.find((c2: any) => c1.binding === c2.binding);
        if (!fc) return;

        Object.assign(fc, c1);
        loadedColumns.push(fc);
      });
      this.flexGrid.columns.clear();
      loadedColumns.forEach(c => this.flexGrid.columns.push(c));

      if (this.filter) {
        this.filter.filterDefinition = layout.filterDefinition;
      }
      this.flexGrid.collectionView.sortDescriptions.clear();
      for (var i = 0; i < layout.sortDescriptions.length; i++) {
        var sortDesc = layout.sortDescriptions[i];
        this.flexGrid.collectionView.sortDescriptions.push(new SortDescription(sortDesc.property, sortDesc.ascending));
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  private async timeout<T>(promise: Promise<T>, ms: number) {
    let timer: NodeJS.Timeout;
    const res = await Promise.race([
      promise,
      new Promise<'timeout'>(resolve => {
        timer = setTimeout(() => resolve('timeout'), ms);
      })
    ] as const).finally(() => clearTimeout(timer));

    if (res === 'timeout') {
      return false;
    }
    return res;
  }

  private loadSetting = () => {
    return this.timeout(
      new Promise(async (resolve: any, reject: any) => {
        try {
          let result = (await new Promise((resolve: any) => {
            const params = {
              resolve
            };
            EventBus.fire('load-user-setting', { params });
          })) as any;

          if (!result) {
            result = {};
          }
          if (!result.layout) {
            result.layout = {};
          }
          if (!result.condition) {
            result.condition = {};
          }

          resolve(result);
        } catch (err) {
          reject(new Error(`${err}`));
        }
      }),
      1000
    );
  };

  public showSnackBar(params: ISnackBarParams) {
    notify({
      message: params.message,
      type: params.type,
      displayTime: 2000,
      width: 'auto',
      minWidth: 150,
      animation: {
        show: {
          type: 'fade',
          duration: 400,
          from: 0,
          to: 1
        },
        hide: { type: 'fade', duration: 40, to: 0 }
      }
    });
  }
}
