import GanttColumn from "./GanttColumn";
import { IGanttRow } from "../../types";

export default class GridBody {
  parents: HTMLElement;
  columns: GanttColumn[];
  rowHeight: number;
  resizeColumn: boolean;
  onRowClick?: (event: Event, row: IGanttRow) => void;
  setRenderCell?: (row: IGanttRow, column: GanttColumn, value: any) => string | HTMLElement;
  setGridCellClass?: (row: IGanttRow, column: GanttColumn, value: any) => string;
  setGridRowClass?: (row: IGanttRow) => string;

  tbodyEl?: HTMLElement;
  rows?: IGanttRow[];

  constructor(params: {
    parents: HTMLElement;
    columns: GanttColumn[];
    rowHeight: number;
    resizeColumn: boolean;
    onRowClick?: (event: Event, row: IGanttRow) => void;
    setRenderCell?: (row: IGanttRow, column: GanttColumn, value: any) => string | HTMLElement;
    setGridCellClass?: (row: IGanttRow, column: GanttColumn, value: any) => string;
    setGridRowClass?: (row: IGanttRow) => string;
  }) {
    this.parents = params.parents;
    this.columns = params.columns;
    this.rowHeight = params.rowHeight;
    this.resizeColumn = params.resizeColumn;
    this.onRowClick = params.onRowClick;
    this.setRenderCell = params.setRenderCell;
    this.setGridCellClass = params.setGridCellClass;
    this.setGridRowClass = params.setGridRowClass;
  }

  dispose() {}

  getRowById(id?: string | null) {
    if (!this.rows) return;
    if (!id) return;
    const ids = id.split("-");
    if (!ids || ids.length < 2) return;
    return this.rows[+ids[1]];
  }

  onRowClickHandler(event: Event) {
    if (!this.onRowClick) return;
    const el = event.currentTarget as HTMLElement;
    const row = this.getRowById(el.getAttribute("data-id"));
    if (!row) return;
    this.onRowClick(event, row);
  }

  setRowEvents() {
    if (!this.tbodyEl) return;
    const rowEls = this.tbodyEl.getElementsByClassName("moz-grid-row");
    if (!rowEls || rowEls.length === 0) return;
    Array.from(rowEls).forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener("click", this.onRowClickHandler.bind(this));
    });
  }

  getMergeInfo(rows: IGanttRow[]) {
    const mergeInfo: Record<number, Record<string, number>> = {};
    rows.forEach((row, idx) => {
      let mergeAffectedByPrevColumn = true;
      mergeInfo[idx] = {};
      this.columns.forEach(column => {
        mergeInfo[idx][column.field] = 1;
        const updateMerge = () => {
          let i = idx - 1;
          while (i >= 0) {
            if (mergeInfo[i][column.field] === 0) {
              i--;
            } else {
              mergeInfo[i][column.field] = mergeInfo[i][column.field] + 1;
              break;
            }
          }
          mergeInfo[idx][column.field] = 0;
          mergeAffectedByPrevColumn = true;
        };
        if (idx > 0 && column.merge) {
          if (column.mergeAffectedByPrevColumn) {
            if (rows[idx - 1][column.field] === row[column.field] && mergeAffectedByPrevColumn) {
              updateMerge();
            } else {
              mergeAffectedByPrevColumn = false;
            }
          } else {
            if (rows[idx - 1][column.field] === row[column.field]) {
              updateMerge();
            }
          }
        }
      });
    });
    return mergeInfo;
  }

  update(rows: IGanttRow[], firstHeight: number, lastHeight: number) {
    if (!this.tbodyEl) return;
    this.rows = rows;
    const firstRow = `<tr conspan="100%" style="height:${firstHeight}px"></tr>`;
    const lastRow = `<tr conspan="100%" style="height:${lastHeight}px"></tr>`;
    const mergeInfo = this.getMergeInfo(rows);
    const rowsHtml = rows
      .map((row, idx) => {
        if (!this.tbodyEl) return;
        const height = this.rowHeight * (row.maxLevel || 1);
        const rowMergeInfo = mergeInfo[idx] || {};
        const createTds = () => {
          return this.columns
            .filter(column => rowMergeInfo[column.field] > 0)
            .map(column => {
              const rowSpan = rowMergeInfo[column.field];
              const width = `${column.getWidth()}px`;
              let style = `text-align: ${column.textAlign}; vertical-align: ${column.verticalAlign};`;
              style = `${style} width: ${width}; min-width: ${width}; max-width: ${width}`;
              let value: any = "";
              if (this.setRenderCell) {
                const result = this.setRenderCell(row, column, row[column.field]);
                if (typeof result === "string") {
                  value = result;
                } else {
                  value = result.innerHTML;
                }
              } else {
                value = row[column.field];
              }
              let classAttr = "";
              if (this.setGridCellClass) {
                const cls = this.setGridCellClass(row, column, row[column.field]);
                if (cls) {
                  classAttr = `class="${cls}" `;
                }
              }
              if (rowSpan > 1) {
                return `<td rowspan="${rowSpan}" ${classAttr}data-col="${column.field}" style="${style}">${value}</td>`;
              } else {
                return `<td ${classAttr}data-col="${column.field}" style="${style}">${value}</td>`;
              }
            })
            .join("\n");
        };
        // eslint-disable-next-line @typescript-eslint/quotes
        let rowClassAttr = 'class="moz-grid-row" ';
        if (this.setGridRowClass) {
          const cls = this.setGridRowClass(row);
          if (cls) {
            rowClassAttr = `class="moz-grid-row ${cls}" `;
          }
        }
        return `<tr ${rowClassAttr}data-id="row-${idx}" style="height:${height}px">
        ${createTds()}
        </tr>`;
      })
      .join("\n");
    this.tbodyEl.innerHTML = `${firstRow}${rowsHtml}${lastRow}`;
    this.setRowEvents();
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const table = document.createElement("table");
    this.tbodyEl = document.createElement("tbody");

    const colgroup = document.createElement("colgroup");

    this.columns.forEach(column => {
      const col = document.createElement("col");
      col.style.width = `${column.getWidth()}px`;
      col.style.maxWidth = `${column.getWidth()}px`;
      col.style.minWidth = `${column.getWidth()}px`;
      col.setAttribute("data-col", column.field);
      colgroup.appendChild(col);
    });

    table.appendChild(colgroup);
    table.appendChild(this.tbodyEl);

    this.parents.appendChild(table);
  }
}
