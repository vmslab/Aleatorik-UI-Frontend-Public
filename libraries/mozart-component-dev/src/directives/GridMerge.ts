import Vue, { VNode, VNodeDirective } from "vue";
import { set, get, debounce } from "lodash";
import ElementWatcher from "../utils/ElementWatcher";
import { DxDataGrid } from "devextreme-vue";
import DataGrid from "devextreme/ui/data_grid";

const watcherName: string = "mergeWatcher";

const mergeGrid = (context: Vue, component: DataGrid, columns: string[], affectedPrev: boolean) => {
  return () => {
    const mergeFunc = () => {
      const cols: any[] = (component as any).option("columns");
      const rows = component.getVisibleRows();
      const isGroup = rows.some(r => r.rowType === "group");
      const rowInfos: any[] = rows.reduce((rowResult, row) => {
        return cols
          .filter(col => columns.includes(col.dataField))
          .reduce((result, col) => {
            const idx = row.rowIndex || 0;
            let prevRowIdx: number = idx;
            if (affectedPrev) {
              const colIdx = columns.findIndex(c => c === col.dataField);
              const prevColumns = columns.filter((c, i) => i <= colIdx);
              const curVals = prevColumns.map(pc => component.cellValue(idx, pc));
              let prevVals: any[];
              while (isGroup ? prevRowIdx >= 0 : prevRowIdx > 0) {
                prevVals = prevColumns.map(pc => component.cellValue(prevRowIdx, pc));
                if (!prevColumns.every((pc, i) => curVals[i] === prevVals[i])) {
                  prevRowIdx++;
                  break;
                }
                prevRowIdx--;
              }
              if (prevRowIdx === 0) {
                prevVals = prevColumns.map(pc => component.cellValue(prevRowIdx, pc));
                if (!prevColumns.every((pc, i) => curVals[i] === prevVals[i])) {
                  prevRowIdx++;
                }
              }
            } else {
              const curVal = component.cellValue(idx, col.dataField);
              let prevVal;
              while (isGroup ? prevRowIdx >= 0 : prevRowIdx > 0) {
                prevVal = component.cellValue(prevRowIdx, col.dataField);
                if (prevVal !== curVal) {
                  prevRowIdx++;
                  break;
                }
                prevRowIdx--;
              }
              if (prevRowIdx === 0) {
                prevVal = component.cellValue(prevRowIdx, col.dataField);
                if (prevVal !== curVal) {
                  prevRowIdx++;
                }
              }
            }
            if (idx === prevRowIdx) {
              result.push({
                rowIdx: prevRowIdx,
                colName: col.dataField,
                rowSpan: 1,
              });
            } else {
              const findVal = result.find(
                (r: any) => r.rowIdx === prevRowIdx && r.colName === col.dataField,
              );
              if (findVal) {
                findVal.rowSpan++;
              }
            }
            return result;
          }, rowResult);
      }, []);
      context.$nextTick(() => {
        rows
          .filter(r => r.rowType === "data")
          .forEach((n, idx) => {
            return cols
              .filter(col => columns.includes(col.dataField))
              .forEach(col => {
                const el = component.getCellElement(idx, col.dataField) as HTMLElement;
                if (!el) return;
                const info = rowInfos.find(
                  (r: any) => r.rowIdx === idx && r.colName === col.dataField,
                );
                if (info) {
                  if (info.rowSpan >= 1) {
                    el.setAttribute("rowspan", String(info.rowSpan));
                  }
                  el.style.display = "table-cell";
                } else {
                  el.style.display = "none";
                }
              });
          });
      });
    };
    mergeFunc();
    const element = component.getScrollable();
    element.on(
      "scroll",
      debounce(() => {
        mergeFunc();
      }, 5),
    );
  };
};

export default {
  bind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    if (!node.context) return;
    const context = node.context;
    context.$nextTick(() => {
      if (!node.componentInstance) return;
      const dataGrid = node.componentInstance as unknown as DxDataGrid;
      const component = dataGrid.instance;
      if (!component) return;
      set(
        component,
        "_contentReadyAction",
        mergeGrid(context, component, binding.value.columns, binding.value.affectedPrev || false),
      );
      const watcher = new ElementWatcher(
        el,
        true,
        mergeGrid(context, component, binding.value.columns, binding.value.affectedPrev || false),
      );
      set(el, watcherName, watcher);
    });
  },
  update: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    if (!node.context) return;
    const context = node.context;
    context.$nextTick(() => {
      if (!node.componentInstance) return;
      const dataGrid = node.componentInstance as unknown as DxDataGrid;
      const component = dataGrid.instance;
      if (!component) return;
      set(
        component,
        "_contentReadyAction",
        mergeGrid(context, component, binding.value.columns, binding.value.affectedPrev || false),
      );
      const watcher = get(el, watcherName) as ElementWatcher;
      if (watcher) {
        watcher.callback = mergeGrid(
          context,
          component,
          binding.value.columns,
          binding.value.affectedPrev || false,
        );
      } else {
        const newWatcher = new ElementWatcher(
          el,
          true,
          mergeGrid(context, component, binding.value.columns, binding.value.affectedPrev || false),
        );
        set(el, watcherName, newWatcher);
      }
    });
  },
  unbind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const watcher = get(el, watcherName) as ElementWatcher;
    watcher.disconnect();
  },
};
