/* eslint-disable id-blacklist */
import get from "lodash/get";
import extend from "lodash/extend";
import CustomStore, { CustomStoreOptions } from "devextreme/data/custom_store";
import dataUtils from "devextreme/data/utils";
import { LoadOptions } from "devextreme/data/load_options";

export interface ActionLoadOptions extends LoadOptions {
  [key: string]: any;
  stringToLowerDefault?: boolean;
  isCountQuery?: boolean;
  isSummaryQuery?: boolean;
  preSelect?: any;
  remoteSelect?: boolean;
  remoteGrouping?: boolean;
  expandLinqSumType?: boolean;
  primaryKey?: any;
  defaultSort?: string;
  stringToLower?: boolean;
  paginateViaPrimaryKey?: boolean;
  sortByPrimaryKey?: boolean;
  allowAsyncOverSync?: boolean;
}

export interface DataStoreOptions {
  key?: string | string[];
  errorHandler?: (e: Error) => void;

  loadFunc: (loadOptions: ActionLoadOptions) => Promise<any>;
  insertFunc?: (values: any) => Promise<any>;
  updateFunc?: (key: any, values: any) => Promise<any>;
  deleteFunc?: (key: any) => Promise<any>;

  loadParams?: object;

  loadMode?: "processed" | "raw";
  cacheRawData?: boolean;

  onLoading?: (loadOptions: any) => void;
  onLoaded?: (result: any[]) => void;

  onInserting?: (values: any) => void;
  onInserted?: (values: any, key: any) => void;

  onUpdating?: (key: any, values: any) => void;
  onUpdated?: (key: any, values: any) => void;

  onRemoving?: (key: any) => void;
  onRemoved?: (key: any) => void;

  onModifying?: (key: any, values: any) => void;
  onModified?: (key: any, values: any) => void;

  onPush?: (changes: any[]) => void;
}

const serializeKey = (key: any) => {
  if (typeof key === "object") {
    return JSON.stringify(key);
  }
  return key;
};

const map = (values: any, callback: any) => {
  if (Array.isArray(values)) {
    return values.map(callback);
  }
  const result = [];
  // eslint-disable-next-line guard-for-in
  for (const key in values) {
    result.push(callback(values[key], key));
  }
  return result;
};

const isFunction = (object: any) => {
  return "function" === typeof object;
};

const normalizeSorting = (info: any) => {
  if (!Array.isArray(info)) {
    info = [info];
  }
  return map(info, (i: any) => {
    const result: any = {
      selector: isFunction(i) || "string" === typeof i ? i : i.getter || i.field || i.selector,
      desc: !!(i.desc || "d" === String(i.dir).charAt(0).toLowerCase()),
    };
    if (i.compare) {
      result.compare = i.compare;
    }
    return result;
  });
};

const serializeDate = (date: Date) => {
  const zpad = (num: number, len: number): string => {
    let text = String(num);
    while (text.length < len) {
      text = "0" + text;
    }
    return text;
  };

  const builder = [1 + date.getMonth(), "/", date.getDate(), "/", date.getFullYear()];
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const f = date.getMilliseconds();

  if (h + m + s + f > 0) {
    builder.push(" ", zpad(h, 2), ":", zpad(m, 2), ":", zpad(s, 2), ".", zpad(f, 3));
  }

  return builder.join("");
};

const isAdvancedGrouping = (expr: any): boolean => {
  if (!Array.isArray(expr)) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < expr.length; i++) {
    if ("groupInterval" in expr[i] || "isExpanded" in expr[i]) {
      return true;
    }
  }
  return false;
};

const stringifyDatesInFilter = (crit: any) => {
  crit.forEach((v: any, k: any) => {
    if (Array.isArray(v)) {
      stringifyDatesInFilter(v);
    } else if (Object.prototype.toString.call(v) === "[object Date]") {
      crit[k] = serializeDate(v);
    }
  });
};

const filterByKey = (keyExpr: any, keyValue: any) => {
  if (!Array.isArray(keyExpr)) {
    return [keyExpr, keyValue];
  }

  return keyExpr.map((i: any) => {
    return [i, keyValue[i]];
  });
};

export const createStoreConfig = (options: DataStoreOptions): CustomStoreOptions => {
  const keyExpr = options.key;
  const loadFunc = options.loadFunc;
  const insertFunc = options.insertFunc;
  const updateFunc = options.updateFunc;
  const deleteFunc = options.deleteFunc;
  const onLoading = options.onLoading;
  const onLoaded = options.onLoaded;
  const loadParams = options.loadParams;
  const isRawLoadMode = options.loadMode === "raw";

  const loadOptionsToActionParams = (loadOptions: LoadOptions, isCountQuery: boolean = false) => {
    const result: ActionLoadOptions = {};

    if (isCountQuery) {
      result.isCountQuery = isCountQuery;
    }

    if (loadOptions) {
      ["skip", "take", "requireTotalCount", "requireGroupCount"].forEach((i: string) => {
        const option = get(loadOptions, i);
        if (option) {
          result[i] = option;
        }
      });

      let group = loadOptions.group;
      const filter = loadOptions.filter;
      let select = loadOptions.select;

      if (loadOptions.sort) {
        result.sort = normalizeSorting(loadOptions.sort);
      }

      if (group) {
        if (!isAdvancedGrouping(group)) {
          group = normalizeSorting(group);
        }
        result.group = group;
        result.requireGroupCount = true;
        result.requireTotalCount = true;
      }

      if (Array.isArray(filter)) {
        result.filter = filter;
      }

      if (loadOptions.totalSummary) {
        result.totalSummary = loadOptions.totalSummary;
      }

      if (loadOptions.groupSummary) {
        result.groupSummary = loadOptions.groupSummary;
      }

      if (select) {
        if (!Array.isArray(select)) {
          select = [select as string];
        }
        result.select = select;
      }
    }

    extend(result, loadParams);

    return result;
  };

  const lotap = loadOptionsToActionParams;

  const customStoreOptions: CustomStoreOptions = {
    key: keyExpr,
    useDefaultSearch: true,
    cacheRawData: true,

    load: (loadOptions: LoadOptions) => {
      return loadFunc(loadOptionsToActionParams(loadOptions));
    },

    totalCount: !isRawLoadMode
      ? async (loadOptions: LoadOptions) => await loadFunc(lotap(loadOptions, true))
      : undefined,

    byKey: !isRawLoadMode
      ? (key: any) => loadFunc(loadOptionsToActionParams({ filter: filterByKey(keyExpr, key) }))
      : undefined,

    update: updateFunc ? (key: any, values: any) => updateFunc(key, values) : undefined,
    insert: insertFunc ? (values: any) => insertFunc(values) : undefined,
    remove: deleteFunc ? (key: any) => deleteFunc(key) : undefined,
    onLoading,
    onLoaded,
  };
  return customStoreOptions;
};
