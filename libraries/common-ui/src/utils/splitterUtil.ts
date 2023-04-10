import { Size } from "../types";

export const DEFAULT_PANE_SIZE = "1";
export const DEFAULT_PANE_MIN_SIZE = "0";
export const DEFAULT_PANE_MAX_SIZE = "100%";

export function toPx(value: number, unit: string = "px", size: number) {
  switch (unit) {
    case "%":
      return +((size * value) / 100).toFixed(2);
    default:
      return +value;
  }
}

export function convert(str: Size, size: number) {
  const strValue = String(str);
  const tokens = strValue.match(/([0-9]+)([px|%]*)/)!;
  const value = tokens[1];
  const unit = tokens[2];
  return toPx(+value, unit, size);
}

export function getUnit(size: Size) {
  const value = String(size);
  if (value.endsWith("px")) {
    return "px";
  }

  if (value.endsWith("%")) {
    return "%";
  }

  return "ratio";
}

export function convertSizeToCssValue(size: Size, resizersSize: number) {
  const value = String(size);
  if (getUnit(value) !== "%") {
    return value;
  }

  if (!resizersSize) {
    return value;
  }

  const idx = value.search("%");
  const percent = +value.slice(0, idx) / 100;
  if (percent === 0) {
    return value;
  }

  return `calc(${value} - ${resizersSize}px*${percent})`;
}

export function convertToUnit(size: number, unit: string, containerSize: number = 1) {
  switch (unit) {
    case "%":
      return `${((size / containerSize) * 100).toFixed(2)}%`;
    case "px":
      return `${size.toFixed(2)}px`;
    case "ratio":
      return (size * 100).toFixed(0);
  }
}
