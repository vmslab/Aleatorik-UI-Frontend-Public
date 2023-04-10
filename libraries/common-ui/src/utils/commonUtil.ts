import { camelCase } from "lodash";

export const isNull = (type: string, value: any): boolean => {
  switch (type) {
    case "number":
      return !Number.isFinite(value);
    case "boolean":
      return [true, false].includes(value) ? false : true;
    default:
      return value ? false : true;
  }
};

export const createCamelProps = <T>(props: Record<string, any>): T => {
  return Object.keys(props).reduce((result, key) => {
    if (props[key] === undefined) return result;
    (result as any)[camelCase(key)] = props[key];
    return result;
  }, {} as T);
};

export const clamp = (value: number, min: number, max: number) => {
  return min < max ? (value < min ? min : value > max ? max : value) : value < max ? max : value > min ? min : value;
};

export const generateGUID = (): string => {
  const ran = () => {
    // tslint:disable-next-line: no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  const guid = (ran() + ran() + "-" + ran() + "-" + ran() + "-" + ran() + "-" + ran() + ran() + ran()).toUpperCase();

  return guid;
};
