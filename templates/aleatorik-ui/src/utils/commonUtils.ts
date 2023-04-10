import { EventBus } from "mozart-common";
import { CurrentEmail } from "@/utils/common";
import Cookies from "js-cookie";
import { GetVersion, GetSchema, GetSchemaInfos, Get } from "@/api/mainService";
import { MainModule } from "@/store/modules/mainStore";
import dayjs, { Dayjs } from "dayjs";

export const versionSize = () => {
  return { width: 670, height: 281 };
};

export const getParentsHeight = (height: number) => {
  const titleHeight = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-card-title-height")
    .replaceAll("px", "");

  const parentsHeight = height - titleHeight;
  return +parentsHeight;
};

export const getContentsWidth = (width: number) => {
  const contentPadding = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-content-padding")
    .replace("px", "");

  const contentsWidth = width - contentPadding * 2;
  return +contentsWidth;
};

export const getContentsHeight = (height: number) => {
  const contentPadding = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-content-padding")
    .replace("px", "");

  const titleHeight = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-card-title-height")
    .replaceAll("px", "");

  const contentsHeight = height - titleHeight - contentPadding * 2;
  return +contentsHeight;
};

export const getToolbarSize = () => {
  const toolbarSize = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-toolbar-bottom")
    .replace("px", "");

  return +toolbarSize;
};

export const createKeyRef = (keys: string[], data: any) => {
  let result = "";
  for (const key of keys) {
    if (result.length > 0) {
      result += "@";
    }
    result += data[key];
  }
  return result;
};

export const createKey = (...args: string[]) => {
  let result = "";
  for (const key of args) {
    if (result.length > 0) {
      result += "@";
    }
    result += key;
  }
  return result;
};

export const getTableSchema = async (tableName: string) => {
  if (!tableName) return [];
  const schema = await GetSchema(tableName);
  return JSON.parse(schema.data);
};

export const getSchemaInformation = async (tableName: string) => {
  if (!tableName) return [];
  const schema = await GetSchemaInfos(tableName);
  return JSON.parse(schema.data);
};

export const getVersionDatasByExecution = async (
  checkExecutionType: Array<string> | null = null,
) => {
  let filter: any[] = [];
  if (checkExecutionType && checkExecutionType.length > 0) {
    filter = ["EXECUTION_TYPE", "IN", `${checkExecutionType}`];
  } else {
    filter = ["EXECUTION_TYPE", "=", `Optimization`];
  }

  const versionResult = await Get("ATPlan", { option: { filter } }, "post");
  const versionDatas = JSON.parse(versionResult.data);
  return versionDatas.data;
};

export const getVersionDatas = async (
  checkStatus: Array<string> | null = [],
  checkUser: boolean = false,
) => {
  let filter: any[] = [];
  if (checkStatus && checkStatus.length > 0) {
    filter = ["PLAN_STATUS", "IN", `${checkStatus}`];
  } else {
    filter = ["PLAN_STATUS", "!=", `REVISION`];
  }
  if (checkUser) {
    const user = CurrentEmail();
    filter = [filter, "and", ["CREATE_USER", "=", user]];
  }

  const versionResult = await Get("ATPlan", { option: { filter } }, "post");
  const versionDatas = JSON.parse(versionResult.data);
  return versionDatas.data || [];
};

export const getVersionNo = () => {
  // const systemID = MainModule.getSystemId;
  // return Cookies.get(`${systemID}/version`);
  return Cookies.get(`version`);
};

/**
 *
 * @param planVersion string
 */
export const setVersionNo = (planVersion: string) => {
  // const systemID = MainModule.getSystemId;
  // Cookies.set(`${systemID}/version`, planVersion, { expires: 30 });
  Cookies.set(`version`, planVersion, { expires: 30 });
};

/**
 *
 * @param value any value
 * @param type data type
 * @returns string
 */
export const toFormatString = (value: any, type: string = "") => {
  const dataType = type === undefined || type === null || type.length === 0 ? typeof value : type;

  switch (dataType) {
    case "datetime":
      return dateToFormat(value, "YYYY-MM-DD HH:mm:ss");
    case "date":
      return dateToFormat(value, "YYYY-MM-DD");
    case "number": {
      return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value);
    }
  }

  const dateObj = dayjs(value);

  if (dateObj.isValid()) {
    return dateToFormat(dateObj, "YYYY-MM-DD HH:mm:ss");
  }

  return value;
};

/**
 *
 * @param date Date
 * @param format dayjs Format (string)
 * @returns string
 */
export const dateToFormat = (date: Date | dayjs.Dayjs, format: string) => {
  const source = dayjs(date);

  const year = source.year();
  if (year >= 1000) {
    return source.format(format);
  }
  if (year >= 100) {
    return `0${source.format(format)}`;
  }
  if (year >= 10) {
    return `00${source.format(format)}`;
  }
  return `000${source.format(format)}`;
};

export const setCreateProperty = (values: any) => {
  values.CREATE_TIME = new Date();
  values.CREATE_USER = CurrentEmail();
  return values;
};

export const setUpdateProperty = (values: any) => {
  if (values.CREATE_TIME === "0001-01-01T00:00:00") values.CREATE_TIME = new Date();
  values.UPDATE_TIME = new Date();
  values.UPDATE_USER = CurrentEmail();
  return values;
};

export const setOnEditing = (isEditing: boolean) => {
  const params = {
    changed: isEditing,
  };
  EventBus.fire("set-changed", { params });
};

export const loadSetting = (key = "main") => {
  return timeout(
    new Promise(async (resolve: any, reject: any) => {
      try {
        let result = (await new Promise((resolve: any) => {
          const params = {
            resolve,
          };
          EventBus.fire("load-user-setting", { params });
        })) as any;

        if (!result) {
          result = {};
        }
        if (!result.layout) {
          result.layout = {};
        }
        if (!result.condition) {
          result.condition = {};
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    }),
    1000,
  );
};

export const removeSetting = () => {
  return new Promise((resolve: any) => {
    const params = {
      resolve,
    };
    EventBus.fire("remove-user-setting", { params });
  });
};

export const loadCondition = (key = "main") => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const setting: any = await loadSetting(key);

      const result = (setting.condition && setting.condition[key]) || {};
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

export const saveCondition = (condition: any, key = "main") => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const setting: any = await loadSetting(key);
      if (!setting.condition) {
        setting.condition = {};
      }

      setting.condition[key] = condition;
      const params = {
        params: {
          setting,
        },
        resolve,
      };

      EventBus.fire("save-user-setting", { params });
    } catch (err) {
      reject(err);
    }
  });
};

export const removeCondition = async () => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const setting: any = await loadSetting();

      setting.condition = {};
      const params = {
        params: {
          setting,
        },
        resolve,
      };

      EventBus.fire("save-user-setting", { params });
    } catch (err) {
      reject(err);
    }
  });
};

export async function timeout<T>(promise: Promise<T>, ms: number) {
  let timer: NodeJS.Timeout;
  const res = await Promise.race([
    promise,
    new Promise<"timeout">(resolve => {
      timer = setTimeout(() => resolve("timeout"), ms);
    }),
  ] as const).finally(() => clearTimeout(timer));

  if (res === "timeout") {
    return false;
  }
  return res;
}
