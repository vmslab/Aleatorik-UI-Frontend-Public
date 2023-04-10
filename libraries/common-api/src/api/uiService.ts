import { call, bidiCall } from "../common";

export const GetSystem = async () => {
  return await call("/api/getSystem", "get");
};
