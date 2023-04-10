import { call, bidiCall } from "../common";

export const ServerTime = async (param: any) => {
  return await bidiCall("/api/ss/server-time", "get", param);
};

export const GetServerInfo = async () => {
  return await call("/api/ss/getServerInfo", "get");
};

export const ServerSate = async (param: any) => {
  return await bidiCall("/api/ss/server-state", "get", param);
};
