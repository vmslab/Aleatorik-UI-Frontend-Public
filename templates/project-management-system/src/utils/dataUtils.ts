import { GetTableAll, GetProperties, GetPropertyValues } from "@/api/mainService";

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
    return data.data;
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
