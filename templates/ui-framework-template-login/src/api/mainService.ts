import restCall, { requestFile, responseFile } from "@/utils/request";
import { MainModule } from "@/store/modules/mainStore";

export const systemID = process.env.NODE_ENV === "production" ? `${MainModule.getSystemId}/` : "";

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

export async function CustomLogin(params: any) {
  return await restCall(`/api/${systemID}CustomLogin`, "post", params);
}
