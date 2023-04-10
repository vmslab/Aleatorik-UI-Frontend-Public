import { VNode, VNodeDirective } from "vue";
import { set, get, debounce } from "lodash";
import { removeAllClass, getTooltipPosition } from "mozart-common";
import ElementWatcher from "../utils/ElementWatcher";
import { DxDataGrid } from "devextreme-vue";
import DataGrid from "devextreme/ui/data_grid";

const watcherName: string = "cellTooltipWatcher";

const showCellTooltip = (
  context: Vue,
  component: DataGrid,
  element: HTMLElement,
  callback?: Function,
) => {
  return () => {
    const showTooltip = () => {
      const rows = component.getVisibleRows();
      rows
        .filter(r => r.rowType === "data")
        .forEach((row: any) => {
          row.cells.forEach((cell: any) => {
            const ele = cell.cellElement;
            if (!ele) return;
            ele.title = "";

            let tooltipContent = cell.text;
            let showAlways = false;

            const tooltipEle = searchTooltipAttr(ele);
            if (tooltipEle) {
              tooltipContent = tooltipEle.getAttribute("tooltip");
              showAlways = tooltipEle.hasAttribute("always");
            }

            if (!tooltipContent) return;

            ele.onmouseenter = (evt: MouseEvent) => {
              if (!showAlways && ele.offsetWidth >= ele.scrollWidth) {
                return;
              }

              removeAllClass("tooltip");

              const divEl = document.createElement("div");
              divEl.classList.add("tooltip");
              divEl.innerHTML = tooltipContent;
              document.body.appendChild(divEl);
              const { xKey, xPos, yKey, yPos } = getTooltipPosition(divEl, evt, "elupdown", false);

              let arrow = `tooltip-${yKey}-${xKey}`;
              // if (false) {
              //   arrow += "-tb";
              // }
              divEl.className = `tooltip ${arrow}`;
              divEl.style[xKey as any] = `${xPos}px`;
              divEl.style[yKey as any] = `${yPos}px`;
            };
            ele.onmouseleave = () => {
              removeAllClass("tooltip");
            };
            ele.onclick = () => {
              removeAllClass("tooltip");
            };
          });
        });
    };
    showTooltip();
    const el = component.getScrollable();
    if (el) {
      el.on(
        "scroll",
        debounce(() => {
          showTooltip();
        }, 5),
      );
    }

    if (callback) callback(component, element);
  };
};

const searchTooltipAttr = (el: HTMLElement | Element): HTMLElement | Element | void => {
  const tooltipContent = el.hasAttribute("tooltip");
  if (tooltipContent) return el;

  if (el.children.length <= 0) return;

  for (let index = 0; index < el.children.length; index++) {
    const child = el.children.item(index);
    if (child) {
      const tooltipContent2 = searchTooltipAttr(child);
      if (tooltipContent2) return tooltipContent2;
    }
  }
};

export default {
  bind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const context = node.context;
    if (!context) return;

    context.$nextTick(() => {
      if (!node.componentInstance) return;
      const dataGrid = node.componentInstance as DxDataGrid;
      const component = dataGrid.instance;
      if (!component) return;

      set(
        component,
        "_contentReadyAction",
        showCellTooltip(context, component, el, binding.value?.contentReady),
      );

      const watcher = new ElementWatcher(el, true, showCellTooltip(context, component, el));
      set(el, watcherName, watcher);
    });
  },
  update: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const context = node.context;
    if (!context) return;

    context.$nextTick(() => {
      if (!node.componentInstance) return;
      const dataGrid = node.componentInstance as DxDataGrid;
      const component = dataGrid.instance;
      if (!component) return;

      set(
        component,
        "_contentReadyAction",
        showCellTooltip(context, component, binding.value?.contentReady),
      );

      const watcher = get(el, watcherName) as ElementWatcher;
      if (watcher) {
        watcher.callback = showCellTooltip(context, component, el);
      } else {
        const newWatcher = new ElementWatcher(el, true, showCellTooltip(context, component, el));
        set(el, watcherName, newWatcher);
      }
    });
  },
  unbind: (el: HTMLElement, binding: VNodeDirective, node: VNode) => {
    const context = node.context;
    if (!context) return;

    context.$nextTick(() => {
      const watcher = get(el, watcherName) as ElementWatcher;
      watcher.disconnect();
    });
  },
};
