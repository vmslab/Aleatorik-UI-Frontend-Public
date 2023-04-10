import dayjs, { Dayjs } from "dayjs";
import { ICalendarEvent } from "../types";
import { RepeatType } from "../enums";

export default class CalendarEvent implements ICalendarEvent {
  public title?: string;
  public start: string = "";
  public end: string = "";
  public repeat: RepeatType = RepeatType.Never;
  public tooltip?: string;
  public backgroundColor?: string;

  private formatDay: string;
  private rangeDay: string[];

  constructor(params: ICalendarEvent) {
    this.title = params.title;
    this.start = params.start;
    this.end = params.end;
    this.repeat = params.repeat;
    this.tooltip = params.tooltip;
    this.backgroundColor = params.backgroundColor;

    this.formatDay = this.getFormatDay();
    this.rangeDay = this.getRangeDay();
  }

  public get startMmt(): Dayjs {
    return dayjs(this.start);
  }

  public get endMmt(): Dayjs {
    return dayjs(this.end);
  }

  private getFormatDay(): string {
    switch (this.repeat) {
      case RepeatType.Yearly:
        return "MMDD";
      case RepeatType.Monthly:
        return "DD";
      case RepeatType.Weekly:
        return "ddd";
      default:
        return "YYYYMMDD";
    }
  }

  private getRangeDay(): string[] {
    const list: string[] = [];
    let startMmt = this.startMmt.clone();
    const endStr: string = this.endMmt.format(this.formatDay);
    let fmtStr: string = "";
    while (fmtStr !== endStr) {
      fmtStr = startMmt.format(this.formatDay);
      list.push(fmtStr);
      startMmt = startMmt.add(1, "d");
    }
    return list;
  }

  public isBefore(mmt: Dayjs): boolean {
    const fmtStr = mmt.format(this.formatDay);
    const idx = this.rangeDay.indexOf(fmtStr);
    return idx > 0;
  }

  public isAfter(mmt: Dayjs): boolean {
    const fmtStr = mmt.format(this.formatDay);
    const idx = this.rangeDay.indexOf(fmtStr);
    return idx < this.rangeDay.length - 1;
  }

  public getOrder(mmt: Dayjs): number {
    const before = this.isBefore(mmt);
    const after = this.isAfter(mmt);
    if (before && after) {
      return 3;
    } else if (!before && after) {
      return 2;
    } else if (before && !after) {
      return 1;
    } else {
      return 0;
    }
  }

  public containsDay(mmt: Dayjs): boolean {
    const fmtStr = mmt.format(this.formatDay);
    const idx = this.rangeDay.indexOf(fmtStr);
    if (idx < 0) {
      return false;
    }
    return true;
  }
}
