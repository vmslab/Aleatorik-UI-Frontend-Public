import { customElement, property } from "lit-element";
import { PieChart as PC } from "mozart-common";
import ChartBase from "./ChartBase";

@customElement("pie-chart")
export default class PieChart extends ChartBase {
  /**
   * `PieChart`의 내부 원의 반지름 입니다.
   */
  @property({ type: Number }) public innerRadius: number = 0;
  /**
   * `PieChart`의 외부 원의 반지름 입니다.
   */
  @property({ type: Number }) public outerRadius: number = 0;

  constructor() {
    super();

    this.chartBase = new PC();
    this.cls = PieChart;
  }
}
