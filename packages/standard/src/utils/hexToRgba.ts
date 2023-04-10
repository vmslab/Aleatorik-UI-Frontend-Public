interface IRGBAString {
  r: string;
  g: string;
  b: string;
  a: string;
}

interface IRGBANumber {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface IRGBNumber {
  r: number;
  g: number;
  b: number;
}

const removeHash = (hex: string) => (hex.charAt(0) === "#" ? hex.slice(1) : hex);

const parseHex = (nakedHex: string) => {
  const isShort = nakedHex.length === 3 || nakedHex.length === 4;

  const twoDigitHexR = isShort ? `${nakedHex.slice(0, 1)}${nakedHex.slice(0, 1)}` : nakedHex.slice(0, 2);
  const twoDigitHexG = isShort ? `${nakedHex.slice(1, 2)}${nakedHex.slice(1, 2)}` : nakedHex.slice(2, 4);
  const twoDigitHexB = isShort ? `${nakedHex.slice(2, 3)}${nakedHex.slice(2, 3)}` : nakedHex.slice(4, 6);
  const twoDigitHexA = (isShort ? `${nakedHex.slice(3, 4)}${nakedHex.slice(3, 4)}` : nakedHex.slice(6, 8)) || "ff";

  // const numericA = +((parseInt(a, 16) / 255).toFixed(2));

  return {
    r: twoDigitHexR,
    g: twoDigitHexG,
    b: twoDigitHexB,
    a: twoDigitHexA,
  };
};

const hexToDecimal = (hex: string) => parseInt(hex, 16);

const hexesToDecimals = ({ r, g, b, a }: IRGBAString): IRGBANumber => ({
  r: hexToDecimal(r),
  g: hexToDecimal(g),
  b: hexToDecimal(b),
  a: +(hexToDecimal(a) / 255).toFixed(2),
});

export function hexToRgba(hex: string) {
  const hashlessHex = removeHash(hex);
  const hexObject = parseHex(hashlessHex);
  return hexesToDecimals(hexObject);
}

export function rgbaToRgb(background: string, color: string) {
  const backgroundRgba = hexToRgba(background);
  const colorRgba = hexToRgba(color);
  const r = (1 - colorRgba.a) * backgroundRgba.r + colorRgba.a * colorRgba.r;
  const g = (1 - colorRgba.a) * backgroundRgba.g + colorRgba.a * colorRgba.g;
  const b = (1 - colorRgba.a) * backgroundRgba.b + colorRgba.a * colorRgba.b;
  return { r, g, b };
}

export function calcBrightness(color: IRGBNumber | string) {
  const { r, g, b } = typeof color === "string" ? hexToRgba(color) : color;
  return Math.round((r * 299 + g * 587 + b * 114) / 1000);
}

export function getTextColor2(
  brightness: number,
  light: string = "#424C5F",
  dark: string = "var(--color-font-white)",
  stdValue: number = 190,
) {
  return brightness > stdValue ? light : dark;
}
