import { SizeType } from "../enums";
import { ILayoutBox } from "../types";

export default class LayoutBox implements ILayoutBox {
  public type: SizeType;
  public size: number;
  public minWidth: number;
  public minHeight: number;
  public scroll: boolean;
  public auto: boolean;
  public width?: number;
  public height?: number;
  public isFix?: boolean;

  public get isResizable(): boolean {
    return this.type === SizeType.Rate;
  }

  constructor(params: ILayoutBox) {
    this.type = params.type;
    this.size = params.size;
    this.minWidth = params.minWidth || 0;
    this.minHeight = params.minHeight || 0;
    this.scroll = params.scroll ?? false;
    this.auto = params.auto ?? true;
  }
}
