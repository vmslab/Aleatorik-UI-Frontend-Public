import { defineStore } from "pinia";
import { call, upload, download } from "@aleatorik-ui/common-api";
import { Method } from "axios";
import { get, set } from "lodash";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { IProperty } from "@aleatorik-ui/common";

dayjs.extend(utc);

export const Get = async (type: string, param?: any, method: Method = "get") => {
  if (typeof param === "object" && method?.toLowerCase() === "get") method = "post";
  return await call(`/api/get${type}`, method, param);
};

export const Add = async (type: string, param?: any, method: Method = "post") => {
  return await call(`/api/add${type}`, method, param);
};

export const Modify = async (type: string, param?: any, method: Method = "put") => {
  return await call(`/api/modify${type}`, method, param);
};

export const Remove = async (type: string, param?: any, method: Method = "delete") => {
  return await call(`/api/remove${type}`, method, param);
};

export const Save = async (type: string, param?: any, method: Method = "post") => {
  return await call(`/api/save${type}`, method, param);
};

export const Upload = async (type: string, param?: any, method: Method = "post") => {
  return await upload(`/api/upload${type}`, method, param);
};

export const Download = async (type: string, param?: any, method: Method = "post") => {
  return await download(`/api/download${type}`, method, param);
};

const getDotNetFormatDate = (date?: Date) => {
  if (date) {
    const mmt: Dayjs = dayjs(date);
    if (mmt.isValid()) {
      const formatValue = `\/Date(${mmt.valueOf()}${mmt.format("ZZ")})\/`;
      const pattern = /Date\(([^)]+)\)/;
      const results = pattern.exec(formatValue);
      if (results) {
        const dt = new Date(parseFloat(results[1]));
        const utcmmt = dayjs(dt).utc();
        if (utcmmt.year() < 1) {
          // Year가 0001보다 작을경우 .NET에서 에러를 발생시키기 때문에,
          // 가능한 최소값으로 변환하여 넣어준다.
          return "/Date(-62135596800000+0000)/";
        }
      }
      return formatValue;
    } else {
      return null;
    }
  }
  return date;
};

export const parseData = (data: any, props: IProperty[]): any => {
  const result: any = Object.assign({}, data);

  props.forEach((prop: IProperty) => {
    if (prop.type === "Date") {
      const date: Date = get(result, prop.name);
      set(result, prop.name, getDotNetFormatDate(date));
    }
  });

  return result;
};

export const parseDatas = (datas: any[], props: IProperty[]): any[] => {
  return datas.map(d => parseData(d, props));
};
