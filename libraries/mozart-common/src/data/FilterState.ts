import dayjs from "dayjs";
import { WhereType, ValueType } from "../enums";
import { IFilterState } from "../types";

export default class FilterState implements IFilterState {
  public type: string;
  public name: string;
  public data?: any;
  private _value?: any;
  public show: boolean = false;
  public render?: () => void;
  public valueChanged?: (newVal: any, oldVal: any) => void;

  constructor(params: IFilterState) {
    this.type = params.type;
    this.name = params.name;
    this.data = params.data;
    this.value = params.value;
  }

  public get value(): any {
    return this._value;
  }

  public set value(val: any) {
    const old = this._value;
    this._value = val;
    if (this.valueChanged) {
      this.valueChanged(val, old);
    }
    this.callRender();
  }

  public get whereType(): WhereType {
    switch (this.type) {
      case "multicombo":
        return WhereType.In;
      case "date":
      case "number":
        return WhereType.Between;
      default:
        return WhereType.Equal;
    }
  }

  public get valueType(): ValueType {
    switch (this.type) {
      case "multicombo":
      case "date":
      case "number":
        return ValueType.Array;
      case "check":
        return ValueType.Boolean;
      default:
        return ValueType.String;
    }
  }

  public get whereValue(): any {
    switch (this.type) {
      case "multicombo":
      case "date":
      case "number":
        return JSON.stringify(this.value);
      default:
        return this.data;
    }
  }

  public stringValue(): string {
    // eslint-disable-next-line id-blacklist
    if (this.value === null || this.value === undefined) {
      return "All";
    }
    switch (this.type) {
      case "date":
        if (this.value.length < 2) {
          return "All";
        } else {
          return this.getDateString();
        }
      case "number":
        if (this.value.length < 2) {
          return "All";
        } else {
          return `${this.value[0]} - ${this.value[1]}`;
        }
      case "multicombo":
        if (this.value.length < 1) {
          return "All";
        } else {
          return this.value.join(",");
        }
      default:
        return this.value;
    }
  }

  private getDateString(): string {
    const from = this.value[0];
    const to = this.value[1];
    return `${this.dateToString(from)} - ${this.dateToString(to)}`;
  }

  private dateToString(date: any): string {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  }

  public callRender() {
    if (this.render) {
      this.render();
    }
  }

  public toString(): string {
    return `${this.name}: ${this.stringValue()}`;
  }
}
