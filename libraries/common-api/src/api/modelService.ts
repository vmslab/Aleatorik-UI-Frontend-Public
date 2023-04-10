import { call, bidiCall } from "../common";

export const GetModel = async () => {
  return await call("/api/getModel", "get");
};

export const TestConnection = async (param: any) => {
  return await call("/api/testConnection", "post", param);
};

export const Migrate = async (param: any) => {
  return await call("/api/model/migrate", "post", param);
};
