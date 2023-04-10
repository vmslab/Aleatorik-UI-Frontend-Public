import { createStoreConfig, ActionLoadOptions } from "mozart-component-wijmo";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { GetTableRemote, GetTableAll, GetProperties, GetPropertyValues } from "@/api/mainService";

export const createPagenateStore = (
  dataKey: string,
  loadFunc: (loadOptions: ActionLoadOptions) => Promise<any>,
) => {
  return new DataSource({
    store: new CustomStore(
      createStoreConfig({
        key: dataKey,
        loadFunc: loadFunc,
      }) as any,
    ),
    paginate: true,
  });
};

export const loadDistinctRemoteDatas = async (
  tableName: string,
  obj: any,
  selector: any,
  where?: any,
) => {
  obj.group = [{ selector: selector, isExpanded: false }];
  obj.requireGroupCount = true;
  obj.requireTotalCount = true;
  obj.sort = obj.sort || [{ selector: selector, desc: false }];

  const result = await GetTableRemote(tableName, obj, where);
  return JSON.parse(result.data);
};

export const loadTableDatas = async (
  tableName: string,
  where?: any,
  orderByCreateTime: boolean = false,
) => {
  try {
    const result = await GetTableAll(tableName, where);
    const data = JSON.parse(result.data);

    if (orderByCreateTime && data.data[0] && !isNaN(Date.parse(data.data[0].CREATE_TIME))) {
      data.data.sort((x: any, y: any) => {
        return Date.parse(y.CREATE_TIME) - Date.parse(x.CREATE_TIME);
      });
    }
    return data.data.sort();
  } catch {
    return [];
  }
};

export const loadProperties = async (categoryID: string) => {
  const result = await GetProperties(categoryID);
  const data = JSON.parse(result.data);
  return data;
};

export const loadPropertyValues = async (tableName: string, key: any, perperties: any) => {
  const result = await GetPropertyValues(tableName, key, perperties);
  const data = JSON.parse(result.data);
  return data;
};
