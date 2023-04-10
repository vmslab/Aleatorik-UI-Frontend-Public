import { customElement, property } from "lit-element";
import { BoxPlotChart as BPC } from "mozart-common";
import ChartBase from "./ChartBase";

@customElement("box-plot-chart")
export default class BoxPlotChart extends ChartBase {
  /**
   * `BoxPlotChart`에 그려지는 모든 선의 넓이 입니다.
   */
  @property({ type: Number }) public lineWidth: number = 1;
  /**
   * Scatter Plot Circle의 반지름 입니다.
   */
  @property({ type: Number }) public radius: number = 4;
  /**
   * Scatter Plot Circle의 투명도 입니다.
   */
  @property({ type: Number }) public circleOpacity: number = 0.6;
  /**
   * Scatter Plot Circle의 흩어진 정도입니다.<br>
   * 숫자가 클수록 더 넓은 범위로 그려집니다.
   */
  @property({ type: Number }) public circlePadding: number = 10;
  /**
   * Scatter Plot Circle을 그릴지 여부입니다.
   */
  @property({ type: Boolean }) public showScatter: boolean = true;
  /**
   * Outlier를 그릴지 여부입니다.
   */
  @property({ type: Boolean }) public showOutlier: boolean = true;
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

    this.chartBase = new BPC();
    this.cls = BoxPlotChart;
  }
}
