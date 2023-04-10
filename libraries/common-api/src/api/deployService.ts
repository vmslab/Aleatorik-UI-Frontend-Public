import { call, bidiCall, upload, download } from "../common";

export const GetDeployInfo = async () => {
  return await call("/api/getDeployInfo", "get");
};

export const GetFileInfos = async (param: any) => {
  return await call("/api/getFileInfos", "post", param);
};

export const CreateDirectory = async (param: any) => {
  return await call("/api/createDirectory", "post", param);
};

export const DeleteItem = async (param: any) => {
  return await call("/api/deleteItem", "post", param);
};

export const RenameItem = async (param: any) => {
  return await call("/api/renameItem", "post", param);
};

export const CopyTo = async (param: any) => {
  return await call("/api/copyTo", "post", param);
};

export const MoveTo = async (param: any) => {
  return await call("/api/moveTo", "post", param);
};

export const Upload = async (param: any) => {
  await upload("/api/upload", "get", param);
};

export const Download = async (param: any) => {
  await download("/api/download", "get", param);
};
