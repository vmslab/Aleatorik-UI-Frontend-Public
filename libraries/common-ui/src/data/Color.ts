// https://github.com/bahamas10/css-color-names/blob/master/css-color-names.json
// const colorNames: Record<string, string> = {
//   aliceblue: "#f0f8ff",
//   antiquewhite: "#faebd7",
//   aqua: "#00ffff",
//   aquamarine: "#7fffd4",
//   azure: "#f0ffff",
//   beige: "#f5f5dc",
//   bisque: "#ffe4c4",
//   black: "#000000",
//   blanchedalmond: "#ffebcd",
//   blue: "#0000ff",
//   blueviolet: "#8a2be2",
//   brown: "#a52a2a",
//   burlywood: "#deb887",
//   cadetblue: "#5f9ea0",
//   chartreuse: "#7fff00",
//   chocolate: "#d2691e",
//   coral: "#ff7f50",
//   cornflowerblue: "#6495ed",
//   cornsilk: "#fff8dc",
//   crimson: "#dc143c",
//   cyan: "#00ffff",
//   darkblue: "#00008b",
//   darkcyan: "#008b8b",
//   darkgoldenrod: "#b8860b",
//   darkgray: "#a9a9a9",
//   darkgreen: "#006400",
//   darkgrey: "#a9a9a9",
//   darkkhaki: "#bdb76b",
//   darkmagenta: "#8b008b",
//   darkolivegreen: "#556b2f",
//   darkorange: "#ff8c00",
//   darkorchid: "#9932cc",
//   darkred: "#8b0000",
//   darksalmon: "#e9967a",
//   darkseagreen: "#8fbc8f",
//   darkslateblue: "#483d8b",
//   darkslategray: "#2f4f4f",
//   darkslategrey: "#2f4f4f",
//   darkturquoise: "#00ced1",
//   darkviolet: "#9400d3",
//   deeppink: "#ff1493",
//   deepskyblue: "#00bfff",
//   dimgray: "#696969",
//   dimgrey: "#696969",
//   dodgerblue: "#1e90ff",
//   firebrick: "#b22222",
//   floralwhite: "#fffaf0",
//   forestgreen: "#228b22",
//   fuchsia: "#ff00ff",
//   gainsboro: "#dcdcdc",
//   ghostwhite: "#f8f8ff",
//   gold: "#ffd700",
//   goldenrod: "#daa520",
//   gray: "#808080",
//   green: "#008000",
//   greenyellow: "#adff2f",
//   grey: "#808080",
//   honeydew: "#f0fff0",
//   hotpink: "#ff69b4",
//   indianred: "#cd5c5c",
//   indigo: "#4b0082",
//   ivory: "#fffff0",
//   khaki: "#f0e68c",
//   lavender: "#e6e6fa",
//   lavenderblush: "#fff0f5",
//   lawngreen: "#7cfc00",
//   lemonchiffon: "#fffacd",
//   lightblue: "#add8e6",
//   lightcoral: "#f08080",
//   lightcyan: "#e0ffff",
//   lightgoldenrodyellow: "#fafad2",
//   lightgray: "#d3d3d3",
//   lightgreen: "#90ee90",
//   lightgrey: "#d3d3d3",
//   lightpink: "#ffb6c1",
//   lightsalmon: "#ffa07a",
//   lightseagreen: "#20b2aa",
//   lightskyblue: "#87cefa",
//   lightslategray: "#778899",
//   lightslategrey: "#778899",
//   lightsteelblue: "#b0c4de",
//   lightyellow: "#ffffe0",
//   lime: "#00ff00",
//   limegreen: "#32cd32",
//   linen: "#faf0e6",
//   magenta: "#ff00ff",
//   maroon: "#800000",
//   mediumaquamarine: "#66cdaa",
//   mediumblue: "#0000cd",
//   mediumorchid: "#ba55d3",
//   mediumpurple: "#9370db",
//   mediumseagreen: "#3cb371",
//   mediumslateblue: "#7b68ee",
//   mediumspringgreen: "#00fa9a",
//   mediumturquoise: "#48d1cc",
//   mediumvioletred: "#c71585",
//   midnightblue: "#191970",
//   mintcream: "#f5fffa",
//   mistyrose: "#ffe4e1",
//   moccasin: "#ffe4b5",
//   navajowhite: "#ffdead",
//   navy: "#000080",
//   oldlace: "#fdf5e6",
//   olive: "#808000",
//   olivedrab: "#6b8e23",
//   orange: "#ffa500",
//   orangered: "#ff4500",
//   orchid: "#da70d6",
//   palegoldenrod: "#eee8aa",
//   palegreen: "#98fb98",
//   paleturquoise: "#afeeee",
//   palevioletred: "#db7093",
//   papayawhip: "#ffefd5",
//   peachpuff: "#ffdab9",
//   peru: "#cd853f",
//   pink: "#ffc0cb",
//   plum: "#dda0dd",
//   powderblue: "#b0e0e6",
//   purple: "#800080",
//   rebeccapurple: "#663399",
//   red: "#ff0000",
//   rosybrown: "#bc8f8f",
//   royalblue: "#4169e1",
//   saddlebrown: "#8b4513",
//   salmon: "#fa8072",
//   sandybrown: "#f4a460",
//   seagreen: "#2e8b57",
//   seashell: "#fff5ee",
//   sienna: "#a0522d",
//   silver: "#c0c0c0",
//   skyblue: "#87ceeb",
//   slateblue: "#6a5acd",
//   slategray: "#708090",
//   slategrey: "#708090",
//   snow: "#fffafa",
//   springgreen: "#00ff7f",
//   steelblue: "#4682b4",
//   tan: "#d2b48c",
//   teal: "#008080",
//   thistle: "#d8bfd8",
//   tomato: "#ff6347",
//   turquoise: "#40e0d0",
//   violet: "#ee82ee",
//   wheat: "#f5deb3",
//   white: "#ffffff",
//   whitesmoke: "#f5f5f5",
//   yellow: "#ffff00",
//   yellowgreen: "#9acd32",
// };
//
// More golfing, just because.. Simple hashing of the names - see nameToRgb()
const colorNames: Record<string, string> = {
  cb: "0f8ff",
  tqw: "aebd7",
  q: "-ffff",
  qmrn: "7fffd4",
  zr: "0ffff",
  bg: "5f5dc",
  bsq: "e4c4",
  bck: "---",
  nch: "ebcd",
  b: "--ff",
  bvt: "8a2be2",
  brwn: "a52a2a",
  brw: "deb887",
  ctb: "5f9ea0",
  hrt: "7fff-",
  chcT: "d2691e",
  cr: "7f50",
  rnw: "6495ed",
  crns: "8dc",
  crms: "dc143c",
  cn: "-ffff",
  Db: "--8b",
  Dcn: "-8b8b",
  Dgnr: "b8860b",
  Dgr: "a9a9a9",
  Dgrn: "-64-",
  Dkhk: "bdb76b",
  Dmgn: "8b-8b",
  Dvgr: "556b2f",
  Drng: "8c-",
  Drch: "9932cc",
  Dr: "8b--",
  Dsmn: "e9967a",
  Dsgr: "8fbc8f",
  DsTb: "483d8b",
  DsTg: "2f4f4f",
  Dtrq: "-ced1",
  Dvt: "94-d3",
  ppnk: "1493",
  pskb: "-bfff",
  mgr: "696969",
  grb: "1e90ff",
  rbrc: "b22222",
  rwht: "af0",
  stg: "228b22",
  chs: "-ff",
  gnsb: "dcdcdc",
  st: "8f8ff",
  g: "d7-",
  gnr: "daa520",
  gr: "808080",
  grn: "-8-0",
  grnw: "adff2f",
  hnw: "0fff0",
  htpn: "69b4",
  nnr: "cd5c5c",
  ng: "4b-82",
  vr: "0",
  khk: "0e68c",
  vnr: "e6e6fa",
  nrb: "0f5",
  wngr: "7cfc-",
  mnch: "acd",
  Lb: "add8e6",
  Lcr: "08080",
  Lcn: "e0ffff",
  Lgnr: "afad2",
  Lgr: "d3d3d3",
  Lgrn: "90ee90",
  Lpnk: "b6c1",
  Lsmn: "a07a",
  Lsgr: "20b2aa",
  Lskb: "87cefa",
  LsTg: "778899",
  Lstb: "b0c4de",
  Lw: "e0",
  m: "-ff-",
  mgrn: "32cd32",
  nn: "af0e6",
  mgnt: "-ff",
  mrn: "8--0",
  mqm: "66cdaa",
  mmb: "--cd",
  mmrc: "ba55d3",
  mmpr: "9370db",
  msg: "3cb371",
  mmsT: "7b68ee",
  "": "-fa9a",
  mtr: "48d1cc",
  mmvt: "c71585",
  mnLb: "191970",
  ntc: "5fffa",
  mstr: "e4e1",
  mccs: "e4b5",
  vjw: "dead",
  nv: "--80",
  c: "df5e6",
  v: "808-0",
  vrb: "6b8e23",
  rng: "a5-",
  rngr: "45-",
  rch: "da70d6",
  pgnr: "eee8aa",
  pgrn: "98fb98",
  ptrq: "afeeee",
  pvtr: "db7093",
  ppwh: "efd5",
  pchp: "dab9",
  pr: "cd853f",
  pnk: "c0cb",
  pm: "dda0dd",
  pwrb: "b0e0e6",
  prp: "8-080",
  cc: "663399",
  r: "--",
  sbr: "bc8f8f",
  rb: "4169e1",
  sbrw: "8b4513",
  smn: "a8072",
  nbr: "4a460",
  sgrn: "2e8b57",
  ssh: "5ee",
  snn: "a0522d",
  svr: "c0c0c0",
  skb: "87ceeb",
  sTb: "6a5acd",
  sTgr: "708090",
  snw: "afa",
  n: "-ff7f",
  stb: "4682b4",
  tn: "d2b48c",
  t: "-8080",
  thst: "d8bfd8",
  tmT: "6347",
  trqs: "40e0d0",
  vt: "ee82ee",
  whT: "5deb3",
  wht: "",
  hts: "5f5f5",
  w: "-",
  wgrn: "9acd32",
};

function printNum(num?: number, decs = 1) {
  if (!num) return "0";
  const str = decs > 0 ? num.toFixed(decs).replace(/0+$/, "").replace(/\.$/, "") : num.toString();
  return str || "0";
}

type RGBA = [number, number, number, number | undefined];
type HLSA = RGBA;

class Color {
  private _rgba: RGBA = [0, 0, 0, 1];
  private _hsla: HLSA = [0, 0, 0, 1];

  constructor(params: string | RGBA | { r: number; g: number; b: number; a?: number }) {
    const that = this;
    function parseString(input: string) {
      // HSL string. Examples:
      //	hsl(120, 60%,  50%) or
      //	hsla(240, 100%, 50%, .7)
      if (input.startsWith("hsl")) {
        let [h, s, l, a] = (input.match(/([\-\d\.e]+)/g) as string[]).map(Number);
        if (a === undefined) {
          a = 1;
        }

        h /= 360;
        s /= 100;
        l /= 100;
        that.hsla = [h, s, l, a];
      }

      // RGB string. Examples:
      //	rgb(51, 170, 51)
      //	rgba(51, 170, 51, .7)
      else if (input.startsWith("rgb")) {
        const [r, g, b, a] = (input.match(/([\-\d\.e]+)/g) as string[]).map(Number);

        that.rgba = [r, g, b, a || 1];
      }

      // Hex string or color name:
      else {
        if (input.startsWith("#")) {
          that.rgba = Color.hexToRgb(input);
        } else {
          that.rgba = Color.nameToRgb(input) || Color.hexToRgb(input);
        }
      }
    }

    // Single input - RGB(A) array
    if (Array.isArray(params)) {
      this.rgba = params;
    }
    // Single input - CSS string
    else if (typeof params === "string") {
      const color = params;
      if (color) {
        parseString(color.toLowerCase());
      }
    } else {
      this.rgba = [params.r, params.g, params.b, params.a === undefined ? 1 : params.a];
    }
  }

  /* RGBA representation */
  get rgba() {
    if (this._rgba) {
      return this._rgba;
    }
    if (!this._hsla) {
      throw new Error("No color is set");
    }

    return (this._rgba = Color.hslToRgb(this._hsla));
  }
  set rgba(rgb: RGBA) {
    if (!rgb[3]) {
      rgb[3] = 1;
    }

    this._rgba = rgb;
    this._hsla = Color.rgbToHsl(rgb);
  }

  printRGB(alpha?: boolean) {
    const rgb = (alpha ? this.rgba : this.rgba.slice(0, 3)) as number[];
    const vals = rgb.map((x, i) => printNum(x, i === 3 ? 3 : 0));

    return alpha ? `rgba(${vals})` : `rgb(${vals})`;
  }

  get rgbString() {
    return this.printRGB();
  }
  get rgbaString() {
    return this.printRGB(true);
  }

  /* HSLA representation */

  get hsla() {
    if (this._hsla) {
      return this._hsla;
    }
    if (!this._rgba) {
      throw new Error("No color is set");
    }

    return (this._hsla = Color.rgbToHsl(this._rgba));
  }
  set hsla(hsl: HLSA) {
    if (!hsl[3]) {
      hsl[3] = 1;
    }

    this._hsla = hsl;
    this._rgba = Color.hslToRgb(hsl);
  }

  printHSL(alpha?: boolean) {
    const mults = [360, 100, 100, 1];
    const suff = ["", "%", "%", ""];

    const hsl = (alpha ? this.hsla : this.hsla.slice(0, 3)) as number[];
    // in printNum(), use enough decimals to represent all RGB colors:
    // https://gist.github.com/mjackson/5311256#gistcomment-2336011
    const vals = hsl.map((x, i) => printNum(x * mults[i], i === 3 ? 3 : 1) + suff[i]);

    return alpha ? `hsla(${vals})` : `hsl(${vals})`;
  }
  get hslString() {
    return this.printHSL();
  }
  get hslaString() {
    return this.printHSL(true);
  }

  /* HEX representation */

  get hex() {
    const rgb = this.rgba as number[];
    const hex = rgb.map((x, i) => (i < 3 ? x.toString(16) : Math.round(x * 255).toString(16)));

    return "#" + hex.map(x => x.padStart(2, "0")).join("");
  }
  set hex(hex) {
    this.rgba = Color.hexToRgb(hex);
  }

  printHex(alpha: any) {
    const hex = this.hex;
    return alpha ? hex : hex.substring(0, 7);
  }

  /* Conversion utils */

  /**
   * Splits a HEX string into its RGB(A) components
   */
  static hexToRgb(input: string): RGBA {
    // Normalize all hex codes (3/4/6/8 digits) to 8 digits RGBA
    const hex: string = (input.startsWith("#") ? input.slice(1) : input)
      .replace(/^(\w{3})$/, "$1F") // 987      -> 987F
      .replace(/^(\w)(\w)(\w)(\w)$/, "$1$1$2$2$3$3$4$4") // 9876     -> 99887766
      .replace(/^(\w{6})$/, "$1FF"); // 987654   -> 987654FF

    if (!hex.match(/^([0-9a-fA-F]{8})$/)) {
      throw new Error(`Unknown hex color; ${input}`);
    }

    const rgba: RGBA = (hex.match(/^(\w\w)(\w\w)(\w\w)(\w\w)$/) as string[])
      .slice(1) // 98765432 -> 98 76 54 32
      .map(x => parseInt(x, 16)) as RGBA; // Hex to decimal

    rgba[3] = rgba[3] ? rgba[3] / 255 : 1;
    return rgba;
  }

  /**
   * Gets the RGB value from a CSS color name
   */
  static nameToRgb(input: string) {
    /* See comments on colorNames
        if(!colorNamesDeser) {
            colorNamesDeser = {};
            colorNames.match(/.{7}/g).forEach(x =>
                colorNamesDeser[x.slice(0, 3)] = atob(x.slice(-4)).split('').map(b => b.charCodeAt(0))
            );
        }
        const hash = [].reduce.call(input.replace('ey', 'ay'), (h, c) => (h << 2) + c.charCodeAt(0), 0)
                                .toString(36).slice(-3);
        return colorNamesDeser[hash];
        */

    // const hex = colorNames[input];
    // if(hex) {
    //    return Color.hexToRgb(hex);
    // }

    const hash = input
      .toLowerCase()
      .replace("at", "T")
      .replace(/[aeiouyldf]/g, "")
      .replace("ght", "L")
      .replace("rk", "D")
      .slice(-5, 4);
    const hex = colorNames[hash];
    return hex === undefined ? hex : Color.hexToRgb(hex.replace(/\-/g, "00").padStart(6, "f"));
  }

  /**
   * https://gist.github.com/mjackson/5311256
   *
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h, s, and l in the set [0, 1].
   */
  static rgbToHsl([r, g, b, a]: RGBA): HLSA {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number = 0;
    let s: number = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h, s, l, a];
  }

  /**
   * https://gist.github.com/mjackson/5311256
   *
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   */
  static hslToRgb([h, s, l, a]: HLSA): RGBA {
    let r;
    let g;
    let b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = function (p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const rgba: RGBA = [r * 255, g * 255, b * 255].map(Math.round) as RGBA;
    rgba[3] = a;

    return rgba;
  }
}

export default Color;
