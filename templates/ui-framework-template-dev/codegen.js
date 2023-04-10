"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { upperFirst, camelCase } = require("lodash");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const yaml = require("js-yaml");
const axios = require("axios");

const rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

let gap,
  indent,
  meta = {
    // table of character substitutions
    "\b": "\\b",
    "\t": "\\t",
    "\n": "\\n",
    "\f": "\\f",
    "\r": "\\r",
    '"': '\\"',
    "\\": "\\\\",
  },
  rep;

function quote(string) {
  rx_escapable.lastIndex = 0;
  return rx_escapable.test(string)
    ? '"' +
        string.replace(rx_escapable, function(a) {
          const c = meta[a];
          return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) +
        '"'
    : '"' + string + '"';
}

function str(key, holder, limit) {
  let i, // The loop counter.
    k, // The member key.
    v, // The member value.
    length,
    mind = gap,
    partial,
    value = holder[key];

  if (value && typeof value === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
  }

  if (typeof rep === "function") {
    value = rep.call(holder, key, value);
  }

  switch (typeof value) {
    case "string":
      return quote(value);
    case "number":
      return isFinite(value) ? String(value) : "null";
    case "boolean":
    case "null":
      return String(value);
    case "object":
      if (!value) {
        return "null";
      }
      gap += indent;
      partial = [];
      if (Object.prototype.toString.apply(value) === "[object Array]") {
        length = value.length;
        for (i = 0; i < length; i += 1) {
          partial[i] = str(i, value, limit) || "null";
        }
        v =
          partial.length === 0
            ? "[]"
            : gap
            ? gap.length + partial.join(", ").length + 4 > limit
              ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
              : "[ " + partial.join(", ") + " ]"
            : "[" + partial.join(",") + "]";
        gap = mind;
        return v;
      }

      if (rep && typeof rep === "object") {
        length = rep.length;
        for (i = 0; i < length; i += 1) {
          if (typeof rep[i] === "string") {
            k = rep[i];
            v = str(k, value, limit);
            if (v) {
              partial.push(k + (gap ? ": " : ":") + v);
            }
          }
        }
      } else {
        for (k in value) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            v = str(k, value, limit);
            if (v) {
              partial.push(k + (gap ? ": " : ":") + v);
            }
          }
        }
      }

      v =
        partial.length === 0
          ? "{}"
          : gap
          ? gap.length + partial.join(", ").length + 4 > limit
            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
            : "{ " + partial.join(", ") + " }"
          : "{" + partial.join(",") + "}";
      gap = mind;
      return v;
  }
}

function beautify(value, replacer, space, limit, initGap) {
  gap = initGap;
  indent = "";

  if (!limit) limit = 0;

  if (typeof limit !== "number") throw new Error("beaufifier: limit must be a number");

  if (typeof space === "number") {
    for (let i = 0; i < space; i += 1) {
      indent += " ";
    }
  } else if (typeof space === "string") {
    indent = space;
  }

  rep = replacer;
  if (
    replacer &&
    typeof replacer !== "function" &&
    (typeof replacer !== "object" || typeof replacer.length !== "number")
  ) {
    throw new Error("beautifier: wrong replacer parameter");
  }

  return str("", { "": value }, limit);
}

const makeHeader = classes => {
  let result = "";

  result = result.concat(`import { set } from "lodash";\n`);
  result = result.concat(`\n`);
  result = result.concat(`export interface IEntity {\n`);
  result = result.concat(`  readonly [index: string]: any;\n`);
  result = result.concat(`  name: string;\n`);
  result = result.concat(`  properties: IProperty[];\n`);
  result = result.concat(`}\n`);
  result = result.concat(`\n`);
  result = result.concat(`export interface IProperty {\n`);
  result = result.concat(`  readonly [index: string]: any;\n`);
  result = result.concat(`  name: string;\n`);
  result = result.concat(`  optional: boolean;\n`);
  result = result.concat(`  type: string;\n`);
  result = result.concat(`  key: boolean;\n`);
  result = result.concat(`  input: string;\n`);
  result = result.concat(`  hide: boolean;\n`);
  result = result.concat(`  edit: boolean;\n`);
  result = result.concat(`  guid: boolean;\n`);
  result = result.concat(`  sort: string;\n`);
  result = result.concat(`  cbotype?: string;\n`);
  result = result.concat(`  cboitems?: string[];\n`);
  result = result.concat(`  cboentity?: string;\n`);
  result = result.concat(`  cbopropkey?: string;\n`);
  result = result.concat(`  cbopropname?: string;\n`);
  result = result.concat(`  cbowhereprop?: string;\n`);
  result = result.concat(`  cbowherevalue?: any;\n`);
  result = result.concat(`}\n`);
  result = result.concat(`\n`);
  result = result.concat(`export interface IEntities {\n`);
  result = result.concat(`  readonly [index: string]: any;\n`);

  for (const cls of classes) {
    const clsName = upperFirst(camelCase(cls.name));
    result = result.concat(`  ${clsName}?: IEntity;\n`);
  }

  result = result.concat(`}\n`);
  result = result.concat(`\n`);
  result = result.concat(`export class Entity {\n`);
  result = result.concat(`  private static _default: Entity;\n`);
  result = result.concat(`\n`);
  result = result.concat(`  public entities: IEntities = {};\n`);
  result = result.concat(`\n`);
  result = result.concat(`  constructor() {\n`);
  result = result.concat(`    this.setEntities();\n`);
  result = result.concat(`  }\n`);
  result = result.concat(`\n`);
  result = result.concat(`  public static get default(): Entity {\n`);
  result = result.concat(`    if (!Entity._default) {\n`);
  result = result.concat(`      Entity._default = new Entity();\n`);
  result = result.concat(`    }\n`);
  result = result.concat(`    return Entity._default;\n`);
  result = result.concat(`  }\n`);
  result = result.concat(`\n`);
  result = result.concat(`  private setEntities() {\n`);

  return result;
};

const makeFooter = () => {
  let result = "";

  result = result.concat(`  }\n`);
  result = result.concat(`}\n`);
  result = result.concat(`\n`);
  result = result.concat(`export default Entity.default;\n`);

  return result;
};

const makeEntity = classes => {
  let result = "";

  result = result.concat(makeHeader(classes));

  for (const cls of classes) {
    const clsName = upperFirst(camelCase(cls.name));
    result = result.concat(`    set(this.entities, "${clsName}", `);
    result = result.concat(`${beautify(cls, null, 2, 80, "    ")});\n`);
  }

  result = result.concat(`\n`);
  result = result.concat(makeFooter());

  return result;
};

const makeType = classes => {
  let result = "";

  classes.forEach((cls, i) => {
    if (i > 0) {
      result = result.concat(`\n`);
    }
    const clsName = upperFirst(camelCase(cls.name));
    result = result.concat(`export interface I${clsName} {\n`);
    result = result.concat(`  readonly [index: string]: any;\n`);
    cls.properties.forEach(prop => {
      result = result.concat(`  ${prop.name}`);
      result = result.concat(`${prop.optional ? "?" : ""}`);
      result = result.concat(`: ${prop.type};\n`);
    });
    result = result.concat(`}\n`);
  });

  return result;
};

const entity = async (fileName, classes) => {
  const fullPath = path.join(__dirname, fileName.replace("/", "\\"));
  const dir = path.dirname(fullPath);
  const flag = await fs.existsSync(dir);

  if (!flag) {
    await fs.mkdirSync(dir);
  }

  fs.writeFile(fullPath, makeEntity(classes), "utf8", error => {
    if (error) {
      console.error(error);
    } else {
      console.log("entity completed!");
    }
  });
};

const type = async (fileName, classes) => {
  const fullPath = path.join(__dirname, fileName.replace("/", "\\"));
  const dir = path.dirname(fullPath);
  const flag = await fs.existsSync(dir);
  if (!flag) {
    await fs.mkdirSync(dir);
  }

  fs.writeFile(fullPath, makeType(classes), "utf8", error => {
    if (error) {
      console.error(error);
    } else {
      console.log("type completed!");
    }
  });
};

const run = async () => {
  try {
    const conf = yaml.safeLoad(fs.readFileSync("codegen.yml", "utf8"));
    const classes = [];

    for (const url of conf.urls) {
      const result = await axios({
        url,
        method: "get",
      });

      for (const cls of result.data) {
        const prev = classes.find(c => c.name === cls.name);
        if (prev) {
          classes[classes.indexOf(prev)] = cls;
        } else {
          classes.push(cls);
        }
      }
    }

    await type(conf.type, classes);
    await entity(conf.entity, classes);
  } catch (e) {
    console.error(e.stack);
    exit(1);
  }
};

dotenv.config();
run();
