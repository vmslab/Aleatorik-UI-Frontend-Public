import * as d3 from "d3";
import { EventBus } from "@mozart-ui/common";
import { materialColorGenerator, hexToComplimentary } from "./materialColorGenerator";

const defaultShadePercentage: number = 0.5;

export function hexToRgb(hex: any) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m: number, r: number, g: number, b: number) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

function shadeColor(color: string, percent: number | undefined) {
  if (!percent) {
    percent = defaultShadePercentage;
  }
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  // tslint:disable-next-line: no-bitwise
  const R = f >> 16;
  // tslint:disable-next-line: no-bitwise
  const G = (f >> 8) & 0x00ff;
  // tslint:disable-next-line: no-bitwise
  const B = f & 0x0000ff;
  const result =
    "#" +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1);
  return result;
}

function preHash(str: string) {
  {
    let hash = 0;
    if (str.length === 0) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}

export function stringToColor(str: string, shadePercentage?: number) {
  if (!str) {
    str = "";
  }

  if (str.length < 4) {
    str = str + preHash(str).toString();
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // tslint:disable-next-line: no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    // tslint:disable-next-line: no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  if (shadePercentage || defaultShadePercentage !== 0) {
    return shadeColor(colour, shadePercentage);
  }
  return colour;
}

function toHex(d: number) {
  return ("0" + Number(d).toString(16)).slice(-2);
}

export function lightenDarkenColor(color: string, amt: number) {
  let usePound: boolean = false;

  if (color.startsWith("#")) {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amt;

  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  let g = (num & 0x0000ff) + amt;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return `${usePound ? "#" : ""}${toHex(r)}${toHex(b)}${toHex(g)}`;
}

const colorDicD3: Record<string, string> = {};
let colorRangeD3: number = 0.35;
export function stringToColorD3(key: string) {
  const savedColor = colorDicD3[key];

  if (savedColor) {
    return savedColor;
  }

  const rgb = d3.interpolateRainbow(colorRangeD3);
  colorRangeD3 += 0.075;

  colorDicD3[key] = rgb;
  return rgb;
}

export let colors = [
  "#8FCECE",
  "#F2AF44",
  "#94C2F8",
  "#F598C3",
  "#9CD1A0",
  "#919FEB",
  "#629ED9",
  "#9E75E2",
  "#627DE5",
  "#E05A69",
];

export let lightColors = [
  "#D1F0F0",
  "#FCECD2",
  "#DBE8FC",
  "#FFE0EE",
  "#D9F2DB",
  "#D9DDF2",
  "#D3E3F2",
  "#E2D8F2",
  "#D3DCF4",
  "#F5DADD",
];

export const ganttColors = [
  [
    "#4DB5B5",
    "#DE8900",
    "#529CF2",
    "#EA66A3",
    "#C7EDCA",
    "#667AE0",
    "#2D7ECE",
    "#7743CE",
    "#3956C9",
    "#CC62C3",
    "#30AAC6",
    "#B18266",
    "#DB6C4A",
    "#D95C66",
    "#5471A8",
    "#0759B7",
    "#0F7AB4",
    "#2AAA66",
    "#AD9A09",
    "#82A526",
  ],
  [
    "#65C4C4",
    "#ed9912",
    "#72aef4",
    "#f07eb3",
    "#7ec183",
    "#778aeb",
    "#438dd6",
    "#8959d9",
    "#4664d9",
    "#d870cf",
    "#4ab8d1",
    "#bc9075",
    "#ea7a58",
    "#e66a74",
    "#617db2",
    "#1869c7",
    "#2087be",
    "#3eb776",
    "#bca812",
    "#92b23d",
  ],
  [
    "#8fcece",
    "#f2af44",
    "#94c2f8",
    "#f598c3",
    "#9cd1a0",
    "#919feb",
    "#629ed9",
    "#9e75e2",
    "#627de5",
    "#e58ede",
    "#73cade",
    "#d0a890",
    "#f49578",
    "#f58991",
    "#7e98c9",
    "#2a7fe2",
    "#45a5d8",
    "#65d197",
    "#d9c634",
    "#afce5b",
  ],
  [
    "#ace2e2",
    "#ffcf83",
    "#b5d7ff",
    "#ffbfdd",
    "#b2e5b5",
    "#b8c1f5",
    "#9cc6f0",
    "#c4a9f2",
    "#9baced",
    "#f0baec",
    "#a0e3f2",
    "#e5ccbd",
    "#fdb6a1",
    "#ffbfc4",
    "#a9bce0",
    "#7fb9fc",
    "#92d1f2",
    "#93e2b8",
    "#ebdf83",
    "#c9e285",
  ],
  [
    "#BEEAEA",
    "#FFDFAC",
    "#C7E1FF",
    "#FFD1E6",
    "#C7EDCA",
    "#CBD1F4",
    "#BCDBF8",
    "#D9C8F5",
    "#BACAF4",
    "#F5CCF0",
    "#BDEBF5",
    "#F0DCD0",
    "#FFCCBC",
    "#FDD5D8",
    "#C0CEE8",
    "#C8E5FC",
    "#B9E6FF",
    "#B7F0D2",
    "#F2EBB9",
    "#DAEDA9",
  ],
  [
    "#d1f0f0",
    "#fcecd2",
    "#dbe8fc",
    "#ffe0ee",
    "#d9f2db",
    "#d9ddf2",
    "#d3e3f2",
    "#e2d8f2",
    "#d3dcf4",
    "#f8daf1",
    "#ceeef5",
    "#f7e8df",
    "#ffdbd0",
    "#ffe2e4",
    "#d0dbef",
    "#dbf3ff",
    "#cdebfc",
    "#d6f4e4",
    "#f5f1e2",
    "#e6f4c2",
  ],
];

export const getTextColor = (
  color: any,
  light: string = "#424C5F",
  dark: string = "var(--color-font-white)",
  stdValue: number = 190,
) => {
  if (typeof color === "string") {
    if (color.startsWith("var")) {
      const colorStr = color.substring(color.indexOf("(") + 1, color.indexOf(")"));
      const r = +getComputedStyle(document.documentElement).getPropertyValue(`${colorStr}-r`);
      const g = +getComputedStyle(document.documentElement).getPropertyValue(`${colorStr}-g`);
      const b = +getComputedStyle(document.documentElement).getPropertyValue(`${colorStr}-b`);
      color = `rgb(${r},${g},${b})`;
    }
  }
  const d3color: any = d3.color(color);
  if (d3color && d3color.rgb) {
    const rgb = d3.color(color)!.rgb();
    const brightness = Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
    return brightness > stdValue ? light : dark;
  }
  return light;
};

export const getOpacityColor = (color: string, opacity: number = 1) => {
  const d3color = d3.color(color);
  if (d3color) {
    return d3color.rgb().copy({ opacity });
  }
  return color;
};

const colorDic: Record<string, any> = {};

export const getKeyColor = (
  key: string,
  option?: {
    customColors?: string[];
    opacity?: number;
    colorType?: string;
    colorHash?: Record<string, any>;
  },
) => {
  const { customColors, opacity, colorType, colorHash } = option || {};
  const hash = colorHash || colorDic;
  const savedColor = hash[key];

  if (savedColor) {
    if (opacity) {
      return savedColor.copy({ opacity });
    }
    return savedColor;
  }

  const range = Object.keys(hash).length;
  const colorArr = customColors || (colorType === "d3" ? d3.schemeCategory10 : colors);
  const rgb = d3.rgb(colorArr[range % colorArr.length]).darker(Math.floor(range / colorArr.length));
  hash[key] = rgb;
  if (opacity) {
    return rgb.copy({ opacity });
  }
  return rgb;
};

export const getGanttKeyColor = (
  key: string,
  option?: {
    customColors?: string[];
    opacity?: number;
    colorType?: string;
    colorHash?: Record<string, any>;
  },
) => {
  const { customColors, opacity, colorType, colorHash } = option || {};
  const hash = colorHash || colorDic;
  const savedColor = hash[key];
  if (savedColor) {
    if (opacity) {
      return savedColor.copy({ opacity });
    }
    return savedColor;
  }

  const colorArr = customColors || (colorType === "d3" ? d3.schemeCategory10 : colors);

  if (!colorArr[Object.keys(hash).length]) {
    return stringToColor(key);
  } else {
    hash[key] = colorArr[Object.keys(hash).length];
  }
  return hash[key];
};

const colorLightDic: Record<string, any> = {};
export const getLightKeyColor = (
  key: string,
  option?: {
    customColors?: string[];
    opacity?: number;
    colorType?: string;
    colorHash?: Record<string, any>;
  },
) => {
  const { customColors, opacity, colorType, colorHash } = option || {};
  const hash = colorHash || colorLightDic;
  const savedColor = hash[key];

  if (savedColor) {
    return savedColor;
  }

  const range = Object.keys(hash).length;
  const colorArr = lightColors;
  const rgb = d3.rgb(colorArr[range % colorArr.length]).darker(Math.floor(range / colorArr.length));
  hash[key] = rgb;
  return rgb;
};

export const getContrastKeyColor = (
  key: string,
  option?: {
    opacity?: number;
    colorHash?: Record<string, any>;
  },
) => {
  const { opacity } = option || {};
  const rgb = getKeyColor(key, option).formatRgb();
  const colorArr = rgb.replace("rgb(", "").replace(")", "").split(",");
  const newColorArr: any[] = [];
  colorArr.forEach((c: string) => {
    newColorArr.push(255 - +c);
  });
  return d3.rgb(newColorArr[0], newColorArr[1], newColorArr[2], opacity);
};

export const getThemeColors = (theme: "light" | "dark", light: boolean): string[] => {
  if (theme === "dark") {
    if (!light) {
      return [
        "#70afaf",
        "#d89429",
        "#73a1d6",
        "#dd81ab",
        "#80b784",
        "#7e8bd3",
        "#4b87c3",
        "#845dc6",
        "#4661c7",
        "#be4351",
      ];
    } else {
      return [
        "#3b4f5a",
        "#4e483f",
        "#404f65",
        "#554455",
        "#3f4a40",
        "#3e4569",
        "#324c67",
        "#4e3972",
        "#33406f",
        "#693643",
      ];
    }
  } else {
    if (!light) {
      return [
        "#8fcece",
        "#f2af44",
        "#94c2f8",
        "#f598c3",
        "#9cd1a0",
        "#919feb",
        "#629ed9",
        "#9e75e2",
        "#627de5",
        "#e05a69",
      ];
    } else {
      return [
        "#d1f0f0",
        "#fcecd2",
        "#dbe8fc",
        "#ffe0ee",
        "#d9f2db",
        "#d9ddf2",
        "#d3e3f2",
        "#e2d8f2",
        "#d3dcf4",
        "#f5dadd",
      ];
    }
  }
};

export const changeColorTheme = (params: { color: "light" | "dark"; size: "normal" | "compact" }) => {
  colors = getThemeColors(params.color, false);
  lightColors = getThemeColors(params.color, true);
  EventBus.emit("theme-changed", { params });
};

export const getMaterialColors = (hex: string) => {
  const complimentary = hexToComplimentary(hex);
  const mColors = materialColorGenerator(hex);
  const compColors = materialColorGenerator(complimentary);
  return Object.keys(mColors).map((key: any) => {
    return {
      key: String(key),
      primary: `#${mColors[key]}`,
      complimentary: `#${compColors[key]}`,
      isBase: `#${mColors[key]}` === hex,
    };
  });
};

export const colorPalletesSet: Array<Array<number | string>> = [
  ["Border3", "Border3", "Font4", 0, "Font2"],
  [0, 0, "Font4", 2, "Font2"],
  [0, 0, "Font4", 2, "Font2"],
  [1, 1, 0, 3, 0],
  [2, 2, 1, 0, 0],
  [3, 3, 1, 0, 1],
  [4, 3, 1, 0, 1],
  [4, 3, 1, 0, 1],
  [4, 3, 1, 0, 1],
  [4, 4, 1, 0, 1],
];

export const getColorByType = (primaryColor: string = "var(--color-primary)", type: string) => {
  const mColors = getMaterialColors(primaryColor);
  const index = mColors.findIndex(t => t.isBase === true);
  const set = index >= 0 ? colorPalletesSet[index] : colorPalletesSet[9];

  if (type === "border") {
    if (set[0] === "Border3") return "var(--color-border3)";
    return mColors[+set[0]].primary;
  } else if (type === "square") {
    if (set[1] === "Border3") return "var(--color-border3)";
    return mColors[+set[1]].primary;
  } else if (type === "icon") {
    if (set[2] === "Font4") return "var(--color-font4)";
    return mColors[+set[2]].primary;
  } else if (type === "arrow") {
    return mColors[+set[3]].primary;
  } else if (type === "font") {
    if (set[4] === "Font2") return "var(--color-font2)";
    return mColors[+set[4]].primary;
  } else {
    return primaryColor;
  }
};
