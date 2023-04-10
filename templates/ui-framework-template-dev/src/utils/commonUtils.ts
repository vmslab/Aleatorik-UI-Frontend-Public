import { EventBus } from "mozart-common";
import { CurrentUser } from "@/utils/common";

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

export const toFormatString = ({ value, valueText }: any) => {
  const regexp = /\B(?=(\d{3})+(?!\d))/g;
  switch (typeof value) {
    case "number": {
      let decimals = valueText.split(".");
      let result = decimals[0].replace(regexp, ",");
      if (decimals.length > 1) result += "." + decimals[1].charAt(0);

      return result;
    }
  }

  return valueText;
};

export const toPercentString = ({ value, valueText }: any) => {
  switch (typeof value) {
    case "number":
      return value * 100 + "%";
  }

  return valueText;
};

export const setCreateProperty = (values: any) => {
  values.CREATE_TIME = new Date();
  values.CREATE_USER = CurrentUser();
};

export const setUpdateProperty = (values: any) => {
  values.UPDATE_TIME = new Date();
  values.UPDATE_USER = CurrentUser();
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
