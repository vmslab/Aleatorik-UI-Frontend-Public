import { promisified, RegistryItemPutCollection, setExternalVBSLocation } from "regedit";
import fs from "fs";

export const setExternalDirectory = async (vbsDirectory: string) => {
  if (process.platform === "win32") {
    setExternalVBSLocation(vbsDirectory);
  }
};

export const getRegistry = async (regPath: string) => {
  if (process.platform === "win32") {
    return await promisified.list([regPath]);
  } else if (process.platform === "linux") {
    const data = fs.readFileSync(regPath, { encoding: "utf8", flag: "r" });
    if (data) return JSON.parse(data);
    return undefined;
  }
};

export const addRegistry = async (regPath: string, key: string, value: string) => {
  if (process.platform === "win32") {
    await promisified.createKey([regPath]);
    const type: "REG_SZ" | "REG_QWORD" = typeof value === "string" ? "REG_SZ" : "REG_QWORD";
    const registerValue: RegistryItemPutCollection = {
      [regPath]: { [key]: { value, type } },
    };
    await promisified.putValue(registerValue);
  } else if (process.platform === "linux") {
    const item: Record<string, string> = {};
    item[key] = value;
    fs.writeFileSync(regPath, JSON.stringify(item), { encoding: "utf8", flag: "w" });
  }
};

export const modifyRegstry = async (regPath: string, key: string, value: string) => {
  if (process.platform === "win32") {
    const type: "REG_SZ" | "REG_QWORD" = typeof value === "string" ? "REG_SZ" : "REG_QWORD";

    const item: any = {};
    item[key] = { value, type };
    const param: RegistryItemPutCollection = {};
    param[regPath] = item;
    return promisified.putValue(param);
  } else if (process.platform === "linux") {
    const data = fs.readFileSync(regPath, { encoding: "utf8", flag: "r" });
    const item: Record<string, string> = JSON.parse(data);
    item[key] = value;
    fs.writeFileSync(regPath, JSON.stringify(item), { encoding: "utf8", flag: "w" });
  }
};

export const removeRegstry = async (regPath: string) => {
  if (process.platform === "win32") {
    await promisified.deleteKey([regPath]);
  } else if (process.platform === "linux") {
    fs.rmSync(regPath, { force: true });
  }
};
