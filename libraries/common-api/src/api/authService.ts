import { call, bidiCall } from "../common";

export const Login = async (param: any) => {
  return await call("/api/auth/login", "post", param);
};

export const Refresh = async () => {
  return await call("/api/auth/refresh", "get");
};

export const Logout = async () => {
  return await call("/api/auth/logout", "get");
};
