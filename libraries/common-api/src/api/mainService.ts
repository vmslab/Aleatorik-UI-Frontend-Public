import { call, bidiCall } from "../common";

export const Add = async (param: { type: string; payload: any }) => {
  return await call(`/api/add${param.type}`, "post", param.payload);
};

export const Modify = async (param: { type: string; payload: any }) => {
  return await call(`/api/modify${param.type}`, "post", param.payload);
};

export const Remove = async (param: { type: string; payload: any }) => {
  return await call(`/api/remove${param.type}`, "post", param.payload);
};
