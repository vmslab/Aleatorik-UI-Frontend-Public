import { get, set, includes } from "lodash";
import { IProperty } from "../types";
import { generateGUID } from "./commonUtil";

export function copy(target: object, source: object, filter: string[] = []) {
  const sourceKeys = Object.keys(source);

  Object.keys(target).forEach(k => {
    if (!filter.includes(k) && sourceKeys.includes(k)) {
      set(target, k, get(source, k));
    }
  });
}

const getInitValue = (prop: IProperty): any => {
  switch (prop.type) {
    case "string":
      return prop.guid ? generateGUID() : "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "Date":
      return prop.optional ? null : new Date();
    default:
      if (includes(prop.type, "[]")) {
        return [];
      } else {
        return null;
      }
  }
};

export function instancing<T extends object>(properties?: IProperty[]): T {
  const obj = {};

  if (properties) {
    properties.map((property: IProperty) => {
      if (property.name !== "___typename") {
        set(obj, property.name, getInitValue(property));
      }
    });
  }

  return obj as T;
}
