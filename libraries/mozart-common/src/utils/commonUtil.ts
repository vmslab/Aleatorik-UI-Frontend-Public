import { camelCase, lowerCase, trim } from "lodash";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export interface ITypeValue {
  type: string;
  value: any;
}

export function getStringToTypeValue(value: string, dateFormat: string = "YYYY-MM-DD A hh:mm:ss"): ITypeValue {
  const typeValue: ITypeValue = {
    type: "",
    value: {},
  };

  try {
    const val: any = JSON.parse(lowerCase(value));

    typeValue.type = typeof val;
    typeValue.value = val;
  } catch (error) {
    dayjs.locale("ko");
    const date: Dayjs = dayjs(value, dateFormat);

    if (date.isValid()) {
      typeValue.type = "Date";
      typeValue.value = date.toDate();
    } else {
      typeValue.type = typeof value;
      typeValue.value = value;
    }
  }

  return typeValue;
}

export function getStringToValue(value: string, dateFormat?: string) {
  return getStringToTypeValue(value, dateFormat).value;
}

export const setFocus = (el: HTMLElement) => {
  if (["input", "select", "textarea"].includes(trim(lowerCase(el.tagName)))) {
    el.focus();
    return true;
  } else {
    if (el.hasChildNodes()) {
      for (const childIdx in el.childNodes) {
        if (setFocus(el.childNodes[childIdx] as any)) {
          break;
        }
      }
    }
    return false;
  }
};

export const generateGUID = (): string => {
  const ran = () => {
    // tslint:disable-next-line: no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  const guid = (ran() + ran() + "-" + ran() + "-" + ran() + "-" + ran() + "-" + ran() + ran() + ran()).toUpperCase();

  return guid;
};

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

export const kebabCaseWithoutNumber = (str: string) => {
  return str
    .split("")
    .map((letter, idx) => {
      return !Number.isFinite(+letter) && letter.toUpperCase() === letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
};

export const decodeEscapeAtob = (text: string) => {
  return decodeURIComponent(atob(text));
};

export const encodeUnescapeBtoa = (text: string) => {
  return btoa(encodeURIComponent(text));
};

export const clamp = (value: number, min: number, max: number) => {
  return min < max ? (value < min ? min : value > max ? max : value) : value < max ? max : value > min ? min : value;
};

export const createCamelProps = <T>(props: Record<string, any>): T => {
  return Object.keys(props).reduce((result, key) => {
    // @ts-ignore
    result[camelCase(key)] = props[key];
    return result;
  }, {} as T);
};
