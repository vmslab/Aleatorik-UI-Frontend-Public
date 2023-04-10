import restCall, { requestFile, responseFile } from "@/utils/request";
import { ActionLoadOptions } from "mozart-component-dev";
import { MainModule } from "@/store/modules/mainStore";

export const systemID = process.env.NODE_ENV === "production" ? `${MainModule.getSystemId}/` : "";

export async function CloneRuleSetReference(keys: any, values: any) {
  return await restCall(`/api/${systemID}CloneRuleSetReference`, "post", {
    keys: JSON.stringify(keys),
    values: JSON.stringify(values),
  });
}

export async function GetRuleActionMap(keys: any) {
  return await restCall(`/api/${systemID}GetRuleActionMap`, "post", {
    keys: JSON.stringify(keys),
  });
}

export async function CloneScenarioReference(keys: any, values: any) {
  return await restCall(`/api/${systemID}CloneScenarioReference`, "post", {
    keys: JSON.stringify(keys),
    values: JSON.stringify(values),
  });
}

export async function GetScenarioExecutionOption(obj?: any) {
  return await restCall(`/api/${systemID}GetScenarioExecutionOption`, "post", {
    obj: JSON.stringify(obj),
  });
}

export async function GetResourceLoadReport(obj?: any) {
  return await restCall(`/api/${systemID}GetResourceLoadReport`, "post", {
    obj: JSON.stringify(obj),
  });
}

export async function GetResourceLoadReportDetail(obj?: any) {
  return await restCall(`/api/${systemID}GetResourceLoadReportDetail`, "post", {
    obj: JSON.stringify(obj),
  });
}

export async function GetResourceGroupAll() {
  return await restCall(`/api/${systemID}GetResourceGroupAll`, "get");
}

export async function GetProperties(category: string) {
  return await restCall(`/api/${systemID}GetProperties/${category}`, "get");
}

export async function GetPropertyValues(tableName: string, keys: any, properties: any) {
  return await restCall(`/api/${systemID}GetPropertyValues/${tableName}`, "post", {
    keys: JSON.stringify(keys),
    properties,
  });
}

export async function GetVersion() {
  return await restCall(`/api/${systemID}GetVersion`, "get");
}

export async function GetSchema(tableName: string) {
  return await restCall(`/api/${systemID}GetSchemas/${tableName}`, "get");
}

export async function ClonePlan(values: any) {
  return await restCall(`/api/${systemID}CloneATPlan`, "post", { values: JSON.stringify(values) });
}

export async function RunPlan(values: any) {
  return await restCall(`/api/${systemID}RunATPlan`, "post", { values: JSON.stringify(values) });
}

export async function Get(type: string, param?: any, method: string = "get") {
  return await restCall(`/api/${systemID}Get${type}`, method, param);
}

export async function Save(type: string, param: any) {
  return await restCall(`/api/${systemID}Save${type}`, "post", param);
}

export async function Add(type: string, param: any, config: any = {}) {
  return await restCall(`/api/${systemID}Add${type}`, "post", param);
}

export async function Modify(type: string, param: any) {
  return await restCall(`/api/${systemID}Modify${type}`, "put", param);
}

export async function Remove(type: string, param: any) {
  return await restCall(`/api/${systemID}Remove${type}`, "delete", param);
}

export async function RemoveBatch(type: string, param: any) {
  return await restCall(`/api/${systemID}RemoveBatch${type}`, "post", param);
}

export async function GetTableAll(tableName: string, where?: any) {
  return await restCall(`/api/${systemID}GetTable/${tableName}/All`, "post", {
    where: JSON.stringify(where),
  });
}

export async function GetTableRemote(tableName: string, option: ActionLoadOptions, where?: any) {
  const param: any = { option };
  if (where) {
    param["where"] = JSON.stringify(where);
  }
  return await restCall(`/api/${systemID}GetTableRemote/${tableName}`, "post", param);
}

export async function GetTable(tableName: string, param?: any) {
  return await restCall(`/api/${systemID}GetTable/${tableName}`, "post", param);
}

export async function AddTable(tableName: string, values: any) {
  return await restCall(`/api/${systemID}AddTable/${tableName}`, "post", {
    values: JSON.stringify(values),
  });
}

export async function AddOrModifyTable(tableName: string, keys: any, values: any) {
  return await restCall(`/api/${systemID}AddOrModifyTable/${tableName}`, "put", {
    keys: JSON.stringify(keys),
    values: JSON.stringify(values),
  });
}

export async function ModifyTable(tableName: string, keys: any, values: any) {
  return await restCall(`/api/${systemID}ModifyTable/${tableName}`, "put", {
    keys: JSON.stringify(keys),
    values: JSON.stringify(values),
  });
}

export async function RemoveTable(tableName: string, keys: any[]) {
  return await restCall(`/api/${systemID}RemoveTable/${tableName}`, "delete", {
    keys: JSON.stringify(keys),
  });
}

export async function ExcelTable(param: any) {
  return await restCall(`/api/${systemID}ExcelToTable`, "post", param);
}

export async function Upload(type: string, param: any) {
  return await requestFile(`/api/${systemID}Upload${type}`, "post", param);
}

export async function Download(type: string, param: any) {
  return await responseFile(`/api/${systemID}Download${type}`, "post", param);
}

export async function Excel(type: string, param: any) {
  return await requestFile(
    `/api/${systemID}Excel${type}`,
    "post",
    param,
    "application/octet-stream",
  );
}
