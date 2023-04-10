import { calcTextSize } from "../../utils/sizeUtil";

export default class GanttColumn {
  field: string;
  caption?: string;
  width: number;
  minWidth: number;
  visible: boolean;
  order?: "asc" | "desc";
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  merge: boolean;
  mergeAffectedByPrevColumn: boolean;
  tooltip: boolean;
  children?: GanttColumn[];

  resizer?: HTMLElement;
  headerCol?: HTMLElement;

  constructor(params: {
    field: string;
    caption?: string;
    width?: number;
    minWidth?: number;
    visible?: boolean;
    order?: "asc" | "desc";
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    merge?: boolean;
    mergeAffectedByPrevColumn?: boolean;
    tooltip?: boolean;
    children?: GanttColumn[];
  }) {
    this.field = params.field;
    this.caption = params.caption;
    this.width = params.width || calcTextSize(params.field, { fontSize: "var(--font-size-body02)" }).width + 16;
    this.minWidth = params.minWidth || 8;
    this.visible = params.visible ?? true;
    this.order = params.order;
    this.textAlign = params.textAlign || "center";
    this.verticalAlign = params.verticalAlign || "middle";
    this.merge = params.merge || false;
    this.mergeAffectedByPrevColumn = params.mergeAffectedByPrevColumn ?? true;
    this.tooltip = params.tooltip ?? true;
    this.children = params.children;
  }

  getWidth(): number {
    if (this.children) {
      return this.children.reduce((sum: number, child: GanttColumn) => {
        if (child.visible) {
          return sum + child.getWidth();
        }
        return sum;
      }, 0);
    }
    return this.width;
  }

  setWidth(width: number) {
    this.width = width;
  }

  getColSpan(): number {
    if (this.children) {
      return this.children.reduce((sum, child) => {
        return sum + child.getColSpan();
      }, 0);
    } else {
      return 1;
    }
  }

  getRowSpan(rowCount: number): number {
    if (this.children) {
      return Math.min(...this.children.map(child => child.getRowSpan(rowCount - 1)));
    } else {
      return rowCount;
    }
  }

  getRowColumns(columns: GanttColumn[], level: number, cnt: number) {
    if (cnt === level) {
      columns.push(this);
    } else {
      if (this.children) {
        this.children.forEach(column => {
          column.getRowColumns(columns, level, cnt + 1);
        });
      }
    }
  }

  setResizer(column: GanttColumn) {
    if (!column.resizer) return;
    if (!column.headerCol) return;

    let x = 0;
    let w = 0;

    const colThis = this;

    const mouseDownHandler = function (e: MouseEvent) {
      if (!column.resizer) return;
      if (!column.headerCol) return;

      x = e.clientX;
      const styles = window.getComputedStyle(column.headerCol);
      w = parseInt(styles.width, 10);

      const mouseMoveHandler = function (e: MouseEvent) {
        const dx = e.clientX - x;
        const width = w + dx;
        if (width <= colThis.minWidth) return;
        const els = document.querySelectorAll(`[data-col="${column.field}"]`);
        els.forEach(el => {
          const hel = el as HTMLElement;
          hel.style.width = `${width}px`;
          hel.style.minWidth = `${width}px`;
          hel.style.maxWidth = `${width}px`;
        });
        colThis.width = width;
      };

      const mouseUpHandler = function () {
        if (!column.resizer) return;
        column.resizer.classList.remove("moz-grid-resizing");
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);

      column.resizer.classList.add("moz-grid-resizing");
    };

    column.resizer.addEventListener("mousedown", mouseDownHandler);
  }
}
