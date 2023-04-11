import { Column } from "@aleatorik-ui/common-ui";

export function calcRowCount(columns: Column[]): number {
  return Math.max(
    ...columns.map(c => {
      if (c.children) {
        return calcRowCount(c.children) + 1;
      } else {
        return 1;
      }
    }),
  );
}

function encodeTriplet(e1: number, e2: number, e3: number) {
  const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const enc1 = e1 >> 2;
  const enc2 = ((e1 & 3) << 4) | (e2 >> 4);
  const enc3 = ((e2 & 15) << 2) | (e3 >> 6);
  const enc4 = e3 & 63;
  return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
}

function encodeRGB(r: number, g: number, b: number) {
  return encodeTriplet(0, r, g) + encodeTriplet(b, 255, 255);
}

function encodeHex(hexColor: string) {
  let rgb;
  if (typeof hexColor == "string") {
    let s = hexColor.substring(1, 7);
    if (s.length < 6) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    rgb = [parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16)];
  } else rgb = [(hexColor & (0xff << 16)) >> 16, (hexColor & (0xff << 8)) >> 8, hexColor & 0xff];

  return encodeRGB(rgb[0], rgb[1], rgb[2]);
}

export function getTaskBorderPixelImage() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--color-accent");
  return "data:image/gif;base64,R0lGODlhAQABAPAA" + encodeHex(value) + "/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
}
