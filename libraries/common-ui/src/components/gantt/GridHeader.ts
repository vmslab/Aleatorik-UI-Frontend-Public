import GanttColumn from "./GanttColumn";
import { addTooltipEvent } from "../../utils/element";

export interface IGridHeader {
  parents: HTMLElement;
  columns: GanttColumn[];
  rowHeight: number;
  rowCount: number;
  resizeColumn: boolean;
}

export default class GridHeader implements IGridHeader {
  parents: HTMLElement;
  columns: GanttColumn[];
  rowHeight: number;
  rowCount: number;
  resizeColumn: boolean;

  constructor(params: IGridHeader) {
    this.parents = params.parents;
    this.columns = params.columns;
    this.rowHeight = params.rowHeight;
    this.rowCount = params.rowCount;
    this.resizeColumn = params.resizeColumn;
  }

  getDataColumnsDetail(columns: GanttColumn[]) {
    return columns
      .filter(column => column.children && column.children.length > 0)
      .reduce(
        (result: GanttColumn[], column: GanttColumn) => {
          result.push(...this.getDataColumnsDetail(column.children!));
          return result;
        },
        columns.filter(column => !column.children || column.children.length === 0),
      );
  }

  getDataColumns() {
    return this.getDataColumnsDetail(this.columns);
  }

  getRowColumns(level: number) {
    const columns: GanttColumn[] = [];

    this.columns.forEach(column => {
      column.getRowColumns(columns, level, 0);
    });

    return columns;
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const colgroup = document.createElement("colgroup");

    const dataColumns = this.getDataColumns();
    dataColumns.forEach(column => {
      const col = document.createElement("col");
      col.style.width = `${column.getWidth()}px`;
      col.style.maxWidth = `${column.getWidth()}px`;
      col.style.minWidth = `${column.getWidth()}px`;
      col.setAttribute("data-col", column.field);
      colgroup.appendChild(col);
      column.headerCol = col;
    });

    new Array(this.rowCount).fill(0).forEach((num, idx) => {
      const tr = document.createElement("tr");
      tr.style.height = `${this.rowHeight}px`;

      const columns = this.getRowColumns(idx);

      columns.forEach(column => {
        const td = document.createElement("td");
        td.style.verticalAlign = "middle";
        td.style.textAlign = "center";
        const colSpan = column.getColSpan();
        const rowSpan = column.children ? 1 : this.rowCount - idx;
        if (colSpan > 1) td.colSpan = colSpan;
        if (rowSpan > 1) td.rowSpan = rowSpan;

        td.innerHTML = column.caption || column.field;
        if (!column.children) {
          const width = `${column.width}px`;
          td.style.width = width;
          td.style.minWidth = width;
          td.style.maxWidth = width;
        }
        td.setAttribute("data-col", column.field);
        if (this.resizeColumn && !column.children) {
          const resizer = document.createElement("div");
          resizer.classList.add("moz-grid-resizer");
          resizer.style.height = `${this.rowHeight * rowSpan}px`;
          column.resizer = resizer;
          td.appendChild(resizer);
        }
        if (column.tooltip) {
          addTooltipEvent(td, column.caption || column.field, true, "elupdown");
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(colgroup);
    table.appendChild(tbody);
    this.parents.appendChild(table);

    if (this.resizeColumn) {
      dataColumns.forEach(column => {
        if (!column.resizer) return;
        column.setResizer(column);
      });
    }
  }
}
