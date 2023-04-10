import { IThemeData, IThemeItem } from "../types";
import { themeObject } from "./themeObject";

export const MIN_WIDTH: number = 1280;
export const MIN_HEIGHT: number = 720;

const setThemeDataDetail = (data: Record<string, any>, items: IThemeItem[]) => {
  items.forEach(item => {
    if (item.type === "number") {
      if (!Number.isFinite(data[item.name])) {
        data[item.name] = item.defaultValue;
      }
    } else if (item.type === "boolean") {
      if (!data[item.name]) {
        data[item.name] = item.defaultValue ? item.trueValue : item.falseValue;
      }
    } else {
      if (!data[item.name]) {
        data[item.name] = item.defaultValue;
      }
    }
  });
};

export const setThemeData = (params: IThemeData) => {
  const setResult = (data: Record<string, any>, itemData: Record<string, any>) => {
    Object.keys(itemData).forEach(key => {
      setThemeDataDetail(data, itemData[key]);
    });
  };
  setResult(params.common, themeObject.common);
  setResult(params.light, themeObject.light);
  setResult(params.dark, themeObject.dark);
  setResult(params.compact, themeObject.compact);
  setResult(params.normal, themeObject.normal);
};

export const getAllThemeItems = () => {
  const result = { common: [], light: [], dark: [], compact: [], normal: [] };
  const setResult = (data: Record<string, any>, itemData: Record<string, any>) => {
    Object.keys(itemData).forEach(key => {
      data.push(...itemData[key]);
    });
  };
  setResult(result.common, themeObject.common);
  setResult(result.light, themeObject.light);
  setResult(result.dark, themeObject.dark);
  setResult(result.compact, themeObject.compact);
  setResult(result.normal, themeObject.normal);

  return result;
};
