import { customElement, property } from "lit-element";
import { LineChart as LC } from "mozart-common";
import ChartBase from "./ChartBase";

@customElement("line-chart")
export default class LineChart extends ChartBase {
  /**
   * Line을 그릴때 직선이 아닌 곡선으로 그릴지 여부입니다.
   */
  @property({ type: Boolean }) public curved: boolean = false;
  /**
   * Line의 넓이 입니다.
   */
  @property({ type: Number }) public lineWidth: number = 3;
  /**
   * X축의 Point마다 그려지는 원의 반지름 입니다.
   */
  @property({ type: Number }) public circleRadius: number = 7;
  /**
   * X축의 Point마다 그려지는 내부 원의 반지름 입니다.
   */
  @property({ type: Number }) public innerCircleRadius: number = 0;
  /**
   * X축의 Point마다 그려지는 내부 원의 색상입니다.
   */
  @property({ type: String }) public innerCircleColor: string = "#FFF";
  /**
   * Line을 Mouse Over했을 때 Line 넓이 입니다.
   */
  @property({ type: Number }) public focusLineWidth: number = 3;
  /**
   * x축의 Data Type입니다.<br>
   * 3가지 Type을 지원합니다.
   * string, number, Date
   */
  @property({ type: String }) public xAxisDataType: string = "number";
  /**
   * Line을 그릴때 Area와 함께 그릴지 여부 입니다.
   */
  @property({ type: Boolean }) public isArea: boolean = false;
  /**
   * Area의 넓이를 줄이는 값입니다.<br>
   * 값이 클수록 Area의 높이가 줄어듭니다.
   */
  @property({ type: Number }) public areaPadding: number = 50;

  constructor() {
    super();

    this.chartBase = new LC();
    this.cls = LineChart;
  }
}
