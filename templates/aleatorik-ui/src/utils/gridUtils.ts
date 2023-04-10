import { EventBus } from "mozart-common";
import { loadSetting } from "@/utils/commonUtils";

import { calcTextSize } from "mozart-common";

// const options: string[] = [
//   "filterValue",
//   "filterValues",
//   "fixed",
//   "width",
//   "minWidth",
//   "sortOrder",
//   "visibleIndex",
//   "visible",
// ];

export const createContextMenu = (
  { component, items, target, column, row, rowIndex }: any,
  options: any,
) => {
  component.hideColumnChooser();

  items.push({
    text: "Show Column Chooser",
    icon: "column-chooser",
    beginGroup: true,
    onItemClick: () => {
      component.showColumnChooser();
    },
  });

  if (typeof options.checkRowFilter !== "undefined") {
    items.push({
      text: "Show Filter Row",
      icon: options.checkRowFilter ? "check" : "",
      beginGroup: true,
      onItemClick: () => {
        options.checkRowFilter = !options.checkRowFilter;
      },
    });
  }

  if (typeof options.checkGroupPanel !== "undefined") {
    items.push({
      text: "Show Group Panel",
      icon: options.checkGroupPanel ? "check" : "",
      onItemClick: (e: any) => {
        options.checkGroupPanel = !options.checkGroupPanel;
      },
    });
  }

  if (column && (target == "headerPanel" || (row && row.rowType == "group"))) {
    let expandItems = [
      {
        text: "Expand All",
        onItemClick: (args: any) => {
          component.expandAll();
        },
      },
    ];
    let collapseItems = [
      {
        text: "Collapse All",
        onItemClick: (args: any) => {
          component.collapseAll();
        },
      },
    ];

    if (row && row.rowType == "group") {
      expandItems.push({
        text: `Expand Group '${row.key}'`,
        onItemClick: (args: any) => {
          component.expandRow(row.key);
        },
      });
      collapseItems.push({
        text: `Collapse Group '${row.key}'`,
        onItemClick: (args: any) => {
          component.collapseRow(row.key);
        },
      });
    }

    items.push({
      text: "Expand",
      beginGroup: true,
      items: expandItems,
    });
    items.push({
      text: "Collpase",
      items: collapseItems,
    });
  }

  if (options.useLayout) {
    let layoutMenuItems = [];

    layoutMenuItems.push({
      text: "Save Layout",
      icon: "save",
      onItemClick: async (args: any) => {
        try {
          await saveLayout(component);
        } catch (e) {
          console.log("err", e);
        }
      },
    });
    layoutMenuItems.push({
      text: "Load Layout",
      icon: "download",
      onItemClick: async (args: any) => {
        try {
          await loadLayout(component);
        } catch (e) {
          console.log("err", e);
        }
      },
    });
    layoutMenuItems.push({
      text: "Remove Layout",
      icon: "trash",
      onItemClick: async (args: any) => {
        try {
          await removeLayout(component);
        } catch (e) {
          console.log("err", e);
        }
      },
    });

    if (layoutMenuItems.length > 0) {
      items.push({
        text: "Layout",
        icon: "user",
        beginGroup: true,
        items: layoutMenuItems,
      });
    }
  }

  let excelMenuItems = [];
  let excelGroup = true;
  if (options.useImportExcel && options.onImportExcel) {
    excelMenuItems.push({
      text: "Import from Excel",
      icon: "import",
      beginGroup: excelGroup,
      onItemClick: options.onImportExcel,
    });
    excelGroup = false;
  }

  if (options.useExportExcel) {
    if (options.onExportOriginalData) {
      excelMenuItems.push({
        text: "Export to Excel (Actual)",
        icon: "xlsx",
        beginGroup: excelGroup,
        onItemClick: options.onExportOriginalData,
      });
      excelGroup = false;
    }

    excelMenuItems.push({
      text: "Export to Excel (WYSIWYG)",
      icon: "xlsx",
      beginGroup: excelGroup,
      onItemClick: () => {
        component.exportToExcel();
      },
    });
  }

  if (excelMenuItems.length > 1) {
    items.push({
      text: "Excel",
      beginGroup: true,
      items: excelMenuItems,
    });
  }

  if (excelMenuItems.length == 1) {
    items.push(excelMenuItems[0]);
  }

  if (options.onAddRow || options.onRemoveRow) {
    let beginGroup = true;
    if (options.onAddRow) {
      items.push({
        text: "Add Row",
        icon: "add",
        beginGroup: beginGroup,
        onItemClick: (e: any) => {
          options.onAddRow();
        },
      });
      beginGroup = false;
    }

    if (options.onRemoveRow) {
      items.push({
        text: "Delete Row",
        icon: "trash",
        beginGroup: beginGroup,
        onItemClick: () => {
          options.onRemoveRow(rowIndex);
        },
      });
    }
  }
};

// export const setColumnBlankSpace = (gridWidth: number, dataGrid: any) => {
//   return new Promise(async resolve => {
//     if (!dataGrid) return resolve(false);

//     let columnTotalWidth = 42;

//     const columns = dataGrid.getVisibleColumns();

//     let existBlankField = false;
//     let blankColumn;
//     for await (const item of columns) {
//       if (item.type === "selection") {
//         continue;
//       }
//       if (item.dataField === "_blank") {
//         existBlankField = true;
//         blankColumn = item;
//         continue;
//       }

//       let width = dataGrid.columnOption(item.index, "width");
//       if (!width) {
//         return resolve(false);
//         // width = calcColumnWidth(item.caption);
//         // dataGrid.columnOption(item.index, "width", width);
//       }

//       columnTotalWidth += width;
//     }

//     if (!existBlankField) {
//       dataGrid.addColumn({
//         dataField: "_blank",
//         caption: "",
//         allowEditing: false,
//         allowExporting: false,
//         allowFiltering: false,
//         allowGrouping: false,
//         allowHeaderFiltering: false,
//         allowReordering: false,
//         allowResizing: false,
//         allowSorting: false,
//       });

//       blankColumn = dataGrid.getVisibleColumns().find((col: any) => col.dataField === "_blank");
//     }

//     if (blankColumn) {
//       if (gridWidth > columnTotalWidth) {
//         const blankWidth = gridWidth - columnTotalWidth;
//         blankColumn.width = blankWidth;
//       } else {
//         blankColumn.visible = false;
//       }
//     }
//     resolve(true);
//   });
// };

export const calcColumnWidth = (column: string) => {
  const width = calcTextSize(column, {
    fontSize: "var(--font-size-body03)",
    padding: "0px 20px",
  }).width;

  return width;
};

// export const makeParams = (grid: any) => {
//   return new Promise(async (resolve, reject) => {
//     const params: any = {};

//     try {
//       for await (const o of options) {
//         const values: any[] = [];
//         grid.option("columns").forEach((c: any) => {
//           const field = c.dataField;
//           const value = grid.columnOption(field, o);

//           if (value !== undefined) {
//             values.push({ field, value });
//           }
//         });
//         if (values.length > 0) {
//           params[o] = values;
//         }
//       }

//       resolve(params);
//     } catch {
//       reject(null);
//     }
//   });
// };

// export const setParams = (grid: any, params: any) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       for await (const o of options) {
//         const option = params[o];
//         if (!option) {
//           continue;
//         }
//         option.forEach((v: any) => {
//           grid.columnOption(v.field, o, v.value);
//         });
//       }

//       resolve(true);
//     } catch {
//       reject(false);
//     }
//   });
// };

export const loadLayout = (dataGrid: any, key: string = "main") => {
  return new Promise(async (resolve: any, reject: any) => {
    if (!dataGrid) return resolve(false);
    try {
      const setting: any = await loadSetting(key);

      const result = setting.layout && setting.layout[key];
      if (!result) resolve(false);

      setTimeout(() => {
        dataGrid.state(result);

        resolve(result);
      }, 100);
    } catch (err) {
      reject(err);
    }
  });
};

export const saveLayout = (dataGrid: any, key: string = "main") => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const layout = dataGrid.state();

      const setting: any = await loadSetting(key);
      setting.layout[key] = layout;

      const params = {
        params: {
          setting,
        },
        resolve,
      };

      EventBus.fire("save-user-setting", { params });
    } catch (err) {
      reject(err);
    }
  });
};

export const removeLayout = (dataGrid: any, key: string = "main") => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const setting: any = await loadSetting(key);
      setting.layout[key] = {};
      const params = {
        params: {
          setting,
        },
        resolve,
      };

      EventBus.fire("save-user-setting", { params });
      dataGrid.state(null);
    } catch (err) {
      reject(err);
    }
  });
};
