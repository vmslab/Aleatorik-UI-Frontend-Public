import { max } from "lodash";
import dayjs from "dayjs";
import { dayjsRange, DayjsRange, EventBus } from "@mozart-ui/common";
import Column from "../components/gantt/GanttColumn";
import { ISize, IGanttRow } from "../types";

export interface IDummyOptions {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  width?: string;
  wordBreak?: string;
  padding?: string;
}

const createDummyElement = (text: string, options?: IDummyOptions, className?: string): HTMLElement => {
  const element = document.createElement("div");
  element.innerHTML = text;

  element.className = `dummy-text${className ? ` ${className}` : ""}`;

  if (options) {
    if (options.fontFamily) {
      element.style.fontFamily = options.fontFamily;
    }
    if (options.fontSize) {
      element.style.fontSize = options.fontSize;
    }
    if (options.fontWeight) {
      element.style.fontWeight = options.fontWeight;
    }
    if (options.lineHeight) {
      element.style.lineHeight = options.lineHeight;
    }
    if (options.width) {
      element.style.width = options.width;
    }
    if (options.wordBreak) {
      element.style.wordBreak = options.wordBreak;
    }
    if (options.padding) {
      element.style.padding = options.padding;
    }
  }

  document.body.appendChild(element);

  return element;
};

const destroyElement = (element: HTMLElement): void => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
};

const cache: {
  [key: string]: any;
} = {};

export const calcTextSize = (text: string, options?: IDummyOptions, className?: string): ISize => {
  const cacheKey = JSON.stringify({ text, options });

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const element = createDummyElement(text, options, className);

  const size = {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };

  destroyElement(element);

  cache[cacheKey] = size;

  return size;
};

export const getArrSizes = (arr: string[], options?: IDummyOptions, className?: string): ISize[] => {
  const sizes: ISize[] = [];

  arr.forEach((text: string) => {
    sizes.push(calcTextSize(text, options, className));
  });

  return sizes;
};

const getColSizes = (col: Column, rows: IGanttRow[], options?: IDummyOptions, className?: string): ISize[] => {
  const sizes: ISize[] = [];

  sizes.push(calcTextSize(col.caption ? col.caption : col.field, options, className));
  sizes.push(
    ...getArrSizes(
      rows.map((row: IGanttRow) => row[col.field]),
      options,
      className,
    ),
  );

  return sizes;
};

export const getMaxColSize = (col: Column, rows: IGanttRow[], options?: IDummyOptions, className?: string): ISize => {
  const sizes = getColSizes(col, rows, options, className);

  return {
    width: max(sizes.map((size: ISize) => size.width)) || 0,
    height: max(sizes.map((size: ISize) => size.height)) || 0,
  };
};

export const dateRangeToWidth = (from: Date, to: Date, rate: number, emptyRanges?: DayjsRange[]): number => {
  const range = dayjsRange(from, to);
  if (emptyRanges) {
    const ranges: DayjsRange[] = [];
    emptyRanges.forEach((er: DayjsRange) => {
      ranges.push(...range.subtract(er));
    });
    return ranges.reduce((sum, rg) => sum + rg.diff("s") * rate, 0);
  } else {
    return range.diff("s") * rate;
  }
};

export const widthToEndDate = (width: number, from: Date, rate: number, emptyRanges?: DayjsRange[]): Date => {
  if (width <= 0) return from;
  let day = dayjs(from);
  let w = width;
  if (emptyRanges) {
    emptyRanges.forEach(range => {
      const tw = dateRangeToWidth(from, range.startDate.toDate(), rate, emptyRanges);
      if (w >= tw) {
        w -= tw;
        day = range.endDate;
      }
    });
  }
  if (w <= 0) return day.toDate();
  return day.add(w / rate, "s").toDate();
};

export const changeSizeTheme = (params: { color: "light" | "dark"; size: "normal" | "compact" }) => {
  EventBus.emit("theme-changed", { params });
};
