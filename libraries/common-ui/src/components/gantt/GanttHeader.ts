import dayjs, { Dayjs } from "dayjs";
import { DayjsRange } from "@aleatorik-ui/common";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { IGanttHeader, GanttHeaderType, GanttTaskLineType } from "../../types";
import { dateRangeToWidth } from "../../utils/sizeUtil";
import Cell from "./Cell";

dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);

export interface IGanttColumn {
  [key: string]: any;
  text: string;
  width: number;
  left: number;
  classList: string[];
}

export interface IGanttHeaderRow {
  type: GanttHeaderType;
  columns: IGanttColumn[];
}

export default class GanttHeader {
  parents: HTMLElement;
  minDate: Date;
  maxDate: Date;
  headers: IGanttHeader[];
  rowHeight: number;
  ganttWidthRate: number;
  shiftHours: number[];
  dayStartTime: number;
  emptyRanges?: DayjsRange[];
  setGanttHeaderText?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string;
  setGanttHeaderClassList?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string[];
  shiftTerm: number;
  headerRows: IGanttHeaderRow[] = [];

  constructor(params: {
    parents: HTMLElement;
    minDate: Date;
    maxDate: Date;
    headers: IGanttHeader[];
    rowHeight: number;
    ganttWidthRate?: number;
    shiftHours?: number[];
    dayStartTime?: number;
    emptyRanges?: DayjsRange[];
    setGanttHeaderText?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string;
    setGanttHeaderClassList?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string[];
  }) {
    this.parents = params.parents;
    this.minDate = params.minDate;
    this.maxDate = params.maxDate;
    this.headers = params.headers;
    this.rowHeight = params.rowHeight;
    this.ganttWidthRate = params.ganttWidthRate || 1;
    if (!params.shiftHours || params.shiftHours.length < 2) {
      this.shiftHours = [6, 14, 22];
    } else {
      this.shiftHours = params.shiftHours;
    }
    this.dayStartTime = params.dayStartTime || 0;
    this.shiftTerm = this.shiftHours[1] - this.shiftHours[0];
    this.emptyRanges = params.emptyRanges;
    this.setGanttHeaderText = params.setGanttHeaderText;
    this.setGanttHeaderClassList = params.setGanttHeaderClassList;
  }

  createGanttColumns(header: IGanttHeader, min: Dayjs, max: Dayjs): IGanttColumn[] {
    const result: IGanttColumn[] = [];

    let prev: Dayjs = min.clone();
    let next: Dayjs = min.clone();

    const setNext = (mmt: Dayjs) => {
      switch (header.type) {
        case "Year":
          return mmt.startOf("y").add(1, "y").add(this.dayStartTime, "h");
        case "Quarter":
          return mmt.startOf("Q").add(1, "Q").add(this.dayStartTime, "h");
        case "Month":
          return mmt.startOf("M").add(1, "M").add(this.dayStartTime, "h");
        case "Week":
          return mmt.startOf("w").add(1, "w").add(this.dayStartTime, "h");
        case "Day":
          return mmt.startOf("d").add(1, "d").add(this.dayStartTime, "h");
        case "Shift":
          const hour = mmt.startOf("h").hour();
          if (this.shiftHours.includes(hour)) {
            return mmt.startOf("h").add(this.shiftTerm, "h");
          } else {
            const fh = this.shiftHours.find(h => h > hour);
            return mmt.startOf("h").hour(fh || this.shiftHours[0]);
          }
        case "Hour":
          return mmt.startOf("h").add(1, "h");
        default:
          return mmt.startOf("m").add(1, "m");
      }
    };

    const getText = (mmt: Dayjs): string => {
      switch (header.type) {
        case "Year":
          return mmt.format("YYYY");
        case "Quarter":
          return mmt.format("Qo");
        case "Month":
          return mmt.format("MMM");
        case "Week":
          return String(mmt.week());
        case "Day":
          return mmt.format("DD");
        case "Shift":
          return mmt.format("HH");
        case "Hour":
          return mmt.format("HH");
        default:
          return mmt.format("mm");
      }
    };

    const getFormatText = (mmt: Dayjs): string => {
      return mmt.format(header.format);
    };

    do {
      next = setNext(next);
      const minDate = prev.toDate();
      const maxDate = max.isAfter(next) ? next.toDate() : max.toDate();
      let text = header.format ? getFormatText(prev) : getText(prev);
      if (this.setGanttHeaderText) {
        text = this.setGanttHeaderText(text, header.type, minDate, maxDate);
      }
      let classList = ["moz-gantt-column"];
      if (this.setGanttHeaderClassList) {
        classList = [...classList, ...this.setGanttHeaderClassList(text, header.type, minDate, maxDate)];
      }
      result.push({
        text,
        width: dateRangeToWidth(minDate, maxDate, this.ganttWidthRate, this.emptyRanges),
        left: dateRangeToWidth(this.minDate, minDate, this.ganttWidthRate, this.emptyRanges),
        classList,
      });
      prev = setNext(prev);
    } while (max.isAfter(prev));

    return result;
  }

  calcRowWidth() {
    return dateRangeToWidth(this.minDate, this.maxDate, this.ganttWidthRate, this.emptyRanges);
  }

  getGanttHeaderRow(type?: GanttTaskLineType): IGanttHeaderRow | undefined {
    if (!type) return undefined;
    if (this.headerRows.length === 0) return undefined;
    if (typeof type === "string") {
      return type === "first" ? this.headerRows[0] : this.headerRows[this.headerRows.length - 1];
    } else if (typeof type === "number") {
      if (type >= this.headerRows.length) return undefined;
      return this.headerRows[type];
    }
    return undefined;
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const element = document.createElement("div");

    const minMmt = dayjs(this.minDate);
    const maxMmt = dayjs(this.maxDate);
    this.headerRows = this.headers.map(header => {
      return {
        type: header.type,
        columns: this.createGanttColumns(header, minMmt, maxMmt),
      };
    });

    this.headerRows.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.classList.add("moz-gantt-header-row");
      rowEl.style.height = `${this.rowHeight}px`;
      rowEl.style.width = `${this.calcRowWidth()}px`;

      row.columns.forEach(column => {
        const cell = new Cell({
          parents: rowEl,
          contents: column.text,
          tooltip: column.text,
          classList: column.classList,
          style: {
            width: `${column.width}px`,
            height: `${this.rowHeight}px`,
            left: `${column.left}px`,
          },
        });
        cell.render();
      });

      element.appendChild(rowEl);
    });

    this.parents.appendChild(element);
  }
}
