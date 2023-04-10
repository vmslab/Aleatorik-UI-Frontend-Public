import { get, set } from "lodash";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import Cookies from "js-cookie";
import { FilterState, IProperty, decodeEscapeAtob } from "mozart-common";
import { MainModule } from "@/store/modules/mainStore";
import { ILogin } from "@/generated/types";

dayjs.extend(utc);

let serviceURL: string | undefined = process.env!.VUE_APP_SERVER;
export const getServiceURL = async (): Promise<string> => {
  if (!serviceURL) {
    try {
      const response = await axios({
        method: "get",
        url: "/service",
      });
      if (response.status === 200) {
        serviceURL = response.data;
      }
    } catch (error) {
      console.log(error);
    }
  }
  return serviceURL ?? "";
};

let webSocketURL: string | undefined = process.env!.VUE_APP_WEB_SOCKET;
export const getWebSocketURL = async (): Promise<string> => {
  if (!webSocketURL) {
    try {
      const response = await axios({
        method: "get",
        url: "/service",
      });
      if (response.status === 200) {
        let url: string = response.data;
        url = url.replace("http://", "ws://");
        url = url.replace("https://", "wss://");
        url = url.replace("Service", "WebSocket");
        webSocketURL = url;
      }
    } catch (error: any) {
      console.log(error);
    }
  }
  return webSocketURL ?? "";
};

const errorProcess = async (error: any) => {
  if (process.env.NODE_ENV === "development") {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log("error.response.data", error.response.data);
      console.log("error.response.status", error.response.status);
      console.log("error.response.headers", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log("error.request", JSON.stringify(error));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("etc error", error);
    }
    alert(error.message);
  }
};

export default async function request(
  url: string,
  method = "get",
  data?: any,
  errAlert: boolean = true,
  config?: any,
) {
  try {
    const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
    const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
    const response = await axios({
      method,
      url,
      headers: {
        authorization: login ? login.token : "",
        address: await getServiceURL(),
        ReferrerPolicy: "strict-origin-when-cross-origin",
      },
      data,
      ...config,
    });
    if (response.status !== 200) {
      throw response;
    }
    return response;
  } catch (error: any) {
    if (errAlert) {
      errorProcess(error);
    }
    return Promise.reject(error);
  }
}

export async function requestFile(
  url: string,
  method = "post",
  data?: any,
  contentType: string = "multipart/form-data",
  errAlert: boolean = true,
  config?: any,
) {
  try {
    const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
    const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
    const response = await axios({
      method,
      url,
      headers: {
        authorization: login ? login.token : "",
        address: await getServiceURL(),
        "Content-Type": contentType,
        ReferrerPolicy: "strict-origin-when-cross-origin",
      },
      data,
      ...config,
    });
    if (response.status !== 200) {
      throw response;
    }
    return response;
  } catch (error: any) {
    if (errAlert) {
      errorProcess(error);
    }
    return Promise.reject(error);
  }
}

export async function responseFile(
  url: string,
  method = "post",
  data?: any,
  errAlert: boolean = true,
  config?: any,
) {
  try {
    const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
    const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
    const response = await axios({
      method,
      url,
      headers: {
        authorization: login ? login.token : "",
        address: await getServiceURL(),
      },
      data,
      responseType: "blob",
      ...config,
    });
    if (response.status !== 200) {
      throw response;
    }
    const replaceAll = (str: string, searchStr: string, replaceStr: string) => {
      return str.split(searchStr).join(replaceStr);
    };
    if (response.headers.filename) {
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;
      const filename = replaceAll(decodeURI(response.headers.filename), "+", " ");
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return response;
  } catch (error: any) {
    if (errAlert) {
      errorProcess(error);
    }
    return Promise.reject(error);
  }
}

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

export const parseFilters = (datas: FilterState[]): any => {
  const result: object[] = [];
  for (const data of datas) {
    if (data.value) {
      const val = data.value.map((v: any) => {
        if (v instanceof Date) {
          return getDotNetFormatDate(v);
        } else {
          return v;
        }
      });
      result.push({
        col: data.name,
        val: JSON.stringify(val),
      });
    }
  }
  return result;
};

export const isAdmin = (): boolean => {
  const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
  const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
  return (login && login.admin) || false;
};
