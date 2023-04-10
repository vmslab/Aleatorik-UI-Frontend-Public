import { customElement, property } from "lit-element";
import { BarChart as BC } from "mozart-common";
import ChartBase from "./ChartBase";

@customElement("bar-chart")
export default class BarChart extends ChartBase {
  /**
   * Chart 색상 기준 입니다.<br>
   * - series: Series를 기준으로 색상 분리<br>
   * - axis: axis 항목을 기준으로 색상 분리<br>
   * - one: 한 가지 색상 사용
   */
  @property({ type: String }) public colorStandard: "series" | "axis" | "one" = "series";

  /**
   * Box의 Radius 값 입니다.
   */
  @property({ type: String }) public boxRadius!: string;

  constructor() {
    super();

    this.chartBase = new BC();
    this.cls = BarChart;
  }
}
