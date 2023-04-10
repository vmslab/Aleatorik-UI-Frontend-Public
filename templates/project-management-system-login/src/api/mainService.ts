import restCall, { requestFile, responseFile } from "@/utils/request";

export async function Get(type: string, param?: any, method: string = "get") {
  return await restCall(`/api/Get${type}`, method, param);
}

export async function Save(type: string, param: any) {
  return await restCall(`/api/Save${type}`, "post", param);
}

export async function Add(type: string, param: any, config: any = {}) {
  return await restCall(`/api/Add${type}`, "post", param);
}

export async function Modify(type: string, param: any) {
  return await restCall(`/api/Modify${type}`, "put", param);
}

export async function Remove(type: string, param: any) {
  return await restCall(`/api/Remove${type}`, "delete", param);
}

export async function Upload(type: string, param: any) {
  return await requestFile(`/api/Upload${type}`, "post", param);
}

export async function Download(type: string, param: any) {
  return await responseFile(`/api/Download${type}`, "post", param);
}

export async function Excel(type: string, param: any) {
  return await requestFile(`/api/Excel${type}`, "post", param, "application/octet-stream");
}

export async function CustomLogin(params: any) {
  return await restCall("/api/CustomLogin", "post", params);
}
