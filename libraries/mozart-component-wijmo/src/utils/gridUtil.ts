interface IProperty {
  readonly [index: string]: any;
  name: string;
  optional: boolean;
  type: string;
  key: boolean;
  input: string;
  hide: boolean;
  edit: boolean;
  guid: boolean;
  sort: string;
  cbotype?: string;
  cboitems?: string[];
  cboentity?: string;
  cbopropkey?: string;
  cbopropname?: string;
  cbowhereprop?: string;
  cbowherevalue?: any;
}

export const addData = (module: any, grid: any, data: any[], properties: IProperty[]) => {
  data.forEach(async (item: any) => {
    // key가 없는 테이블의 경우는 Excel Upload를 지원하지 않는다. (21/11/19)
    const keyColumn = properties.find(t => t.key === true)!.name;
    const isInsert =
      !item[keyColumn] || !module.getItems.find((t: any) => t[keyColumn] === item[keyColumn]);

    if (isInsert) {
      const newItem = await module.getNewItem();
      grid.addRow();

      properties.forEach(async (prop: IProperty) => {
        if (prop.key && prop.guid) grid.cellValue(0, prop.name, newItem[prop.name]);
        else grid.cellValue(0, prop.name, item[prop.name]);
      });
    } else {
      const index = grid.getRowIndexByKey(item[keyColumn]);

      properties.forEach(async (prop: IProperty) => {
        if (grid.cellValue(index, prop.name) !== item[prop.name])
          grid.cellValue(index, prop.name, item[prop.name]);
      });
    }
  });
};
