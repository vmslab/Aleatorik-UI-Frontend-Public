import { LitElement, html, customElement, property, css, TemplateResult } from "lit-element";
import { get, set } from "lodash";
import {
  ICaptionValue,
  IMargin,
  IChartLabelOption,
  IChartLegendTableOption,
  IChartText,
  Aggregation,
  Position,
  EventBus,
  ChartBase as CB,
} from "mozart-common";

@customElement("chart-base")
export default class ChartBase extends LitElement {
  /**
   * Chart의 데이터 입니다.
   */
  @property({ type: Array }) public data?: object[];
  /**
   * Chart의 넓이입니다.<br>
   * 넓이를 설정하지 않을 경우 상위 Element의 넓이에 100%값이 됩니다.
   */
  @property({ type: Number }) public width!: number;
  /**
   * Chart의 높이입니다.<br>
   * 높이를 설정하지 않을 경우 상위 Element의 높이에 100%값이 됩니다.
   */
  @property({ type: Number }) public height!: number;
  /**
   * Chart의 제목입니다.<br>
   * 설정하지 않을 경우 제목이 표시 되지 않습니다.
   */
  @property({ type: Object }) public chartTitle?: IChartText;
  /**
   * Chart의 X축 제목입니다.<br>
   * 설정하지 않을 경우 X축 제목이 표시 되지 않습니다.
   */
  @property({ type: Object }) public xLegend?: IChartText;
  /**
   * Chart의 Y축 제목입니다.<br>
   * 설정하지 않을 경우 Y축 제목이 표시 되지 않습니다.
   */
  @property({ type: Object }) public yLegend?: IChartText;
  /**
   * Chart의 Label설정 입니다.<br>
   * 설정하지 않을 경우 Label이 표시 되지 않습니다.
   */
  @property({ type: Object }) public labelOption?: IChartLabelOption;
  /**
   * Chart의 Series 목록 입니다.<br>
   * `ICaptionValue` 배열 값 입니다.<br>
   * 설정하지 않을 경우 Label이 표시 되지 않습니다.
   */
  @property({ type: Array }) public serieses!: ICaptionValue[];
  /**
   * Chart의 Legend를 Table형태로 만드는 옵션입니다.<br>
   * 설정하지 않을 경우 기본 Legend가 그려집니다.
   */
  @property({ type: Object }) public legendTableOption?: IChartLegendTableOption;
  /**
   * Chart의 기본 Font 입니다.
   */
  @property({ type: String }) public fontFamily!: string;
  /**
   * Chart의 기본 Font 크기 입니다.
   */
  @property({ type: Number }) public fontSize: number = 16;
  /**
   * Chart의 축 Font 크기 입니다.
   */
  @property({ type: Number }) public axisFontSize: number = 12;
  /**
   * Chart의 Tooltip Font 크기 입니다.
   */
  @property({ type: Number }) public tooltipFontSize: number = 16;
  /**
   * Chart의 Y축 항목 개수의 근사값 입니다.<br>
   * 근사값인 이유는 지정된 값을 토대로 적절한 개수를 계산하기 때문입니다.
   */
  @property({ type: Number }) public ticksY: number = 0;
  /**
   * Y축 값을 결정하는 집합 함수 입니다.<br>
   * 같은 키의 값이 여러개인 Data에 적용됩니다.<br>
   * 목록 : "count", "sum", "avg", "min", "max"
   */
  @property({ type: String }) public aggregation: Aggregation = Aggregation.Min;
  /**
   * Y축의 고정 최소값 입니다.<br>
   * 값을 지정할 경우 Y축의 최소값이 해당 값으로 고정됩니다.
   */
  @property({ type: Number }) public fixedMinY?: number;
  /**
   * Y축의 고정 최대값 입니다.<br>
   * 값을 지정할 경우 Y축의 최대값이 해당 값으로 고정됩니다.
   */
  @property({ type: Number }) public fixedMaxY?: number;
  /**
   * X축의 각도 입니다.<br>
   * 값을 지정할 경우 X축이 지정된 각도많큼 회전합니다.<br>
   * 글자수가 많아 값이 겹쳐보일 경우 활용합니다.
   */
  @property({ type: Number }) public xAxisAngle?: number = 0;
  /**
   * X축의 위치 입니다.??
   */
  @property({ type: String }) public xAxisPosition?: Position = Position.Start;
  /**
   * Legend 표시 여부입니다.
   */
  @property({ type: Boolean }) public showLegend?: boolean = true;
  /**
   * 0인 값을 표시할지 여부입니다.<br>
   * **false**일 경우 0인 값은 없는 값이 되어 Chart에 표기되지 않습니다.
   */
  @property({ type: Boolean }) public showZero: boolean = true;
  /**
   * Chart에 가로 격자선 표시 여부입니다.
   */
  @property({ type: Boolean }) public showHorizontalGrid?: boolean = false;
  /**
   * Chart에 세로 격자선 표시 여부입니다.
   */
  @property({ type: Boolean }) public showVerticalGrid?: boolean = false;
  /**
   * Chart에 가로 축 선 표시 여부입니다.
   */
  @property({ type: Boolean }) public showHorizontalAxisBar: boolean = true;
  /**
   * Chart에 세로 축 선 표시 여부입니다.
   */
  @property({ type: Boolean }) public showVerticalAxisBar: boolean = true;
  /**
   * 축 표시 여부입니다.
   */
  @property({ type: Boolean }) public showAxis: boolean = true;
  /**
   * 기본 ToopTip 표시 여부입니다.
   */
  @property({ type: Boolean }) public showDefaultTooltip: boolean = true;
  /**
   * Chart의 데이터 계산을 Z Score로 할지 여부입니다.<br>
   * 주로 각 항목의 표준분포를 비교할 때 사용합니다.
   */
  @property({ type: Boolean }) public isZScoreData?: boolean = false;
  /**
   * IQR(Inter Quartile Range)은 Box Plot의 사분범위<br>
   * 즉, Q3 - Q1값을 의미합니다.<br>
   * `isIQR`값은 min, max값의 정의를 구분합니다.<br>
   * **true**일 경우<br>
   * - min = Q1 - 1.5 * IQR<br>
   * - max = Q3 + 1.5 * IQR
   */
  @property({ type: Boolean }) public isIQR: boolean = false;
  /**
   * Chart의 Zoom기능 사용 여부입니다.<br>
   * **true**일 경우 Drag & Drop, Mouse Wheel이 활성화 됩니다.
   */
  @property({ type: Boolean }) public isZoom: boolean = false;
  /**
   * Chart의 기본 투명도입니다.<br>
   * 기본 투명도는 Chart의 요소 색상에 적용됩니다.
   */
  @property({ type: Number }) public opacity: number = 1;
  /**
   * Chart의 Focus 시 투명도입니다.<br>
   * Focus 시 투명도는 Mouse Over했을 경우 적용됩니다.
   */
  @property({ type: Number }) public focusOpacity: number = 0.8;
  /**
   * `BarChart`, `BoxPlotChart`등 넓이 속성이 있는 Chart의<br>
   * 최대 넓이 값입니다.<br>
   * 각 항목의 넓이가 해당 값이상 커지지 않습니다.
   */
  @property({ type: Number }) public barMaxWidth: number = 60;
  /**
   * `BarChart`, `BoxPlotChart`등 넓이 속성이 있는 Chart의<br>
   * 각 항목간 Padding 값 입니다.
   */
  @property({ type: Number }) public paddingBand: number = 0.03;
  /**
   * X축의 Padding값 입니다.<br>
   * 설정한 비율 많큼 X축의 최대, 최소 값이 늘어납니다.
   */
  @property({ type: Number }) public paddingXAxis: number = 0.03;
  /**
   * Y축의 Padding값 입니다.<br>
   * 설정한 비율 많큼 Y축의 최대, 최소 값이 늘어납니다.
   */
  @property({ type: Number }) public paddingYAxis: number = 0.03;
  /**
   * Chart의 기본 색상을 사용자 설정값으로 변경할 수 있는 Prop입니다.<br>
   * `string`배열 형태로 색상값을 설정해면,<br>
   * 기본 색상이 설정한 값으로 변경됩니다.
   */
  @property({ type: Array }) public customColors?: string[] | null = null;
  /**
   * 축의 기본 색상입니다.<br>
   * 값을 변경하면 축 색상이 변경됩니다.
   */
  @property({ type: String }) public axisDefaultColor: string = "#666";
  /**
   * 축의 Grid Line 색상입니다.<br>
   * 값을 변경하면 축 Grid Line 색상이 변경됩니다.
   */
  @property({ type: String }) public axisGridColor: string = "#DDD";
  /**
   * Text의 기본 색상입니다.<br>
   * 값을 변경하면 Text 색상이 변경됩니다.
   */
  @property({ type: String }) public textDefaultColor: string = "#666";
  /**
   * Text의 강조 색상입니다.<br>
   * 값을 변경하면 Text 강조 색상이 변경됩니다.
   */
  @property({ type: String }) public textAccentColor: string = "var(--color-font3)";
  /**
   * Loader표시 여부입니다.<br>
   * **true**경우 Loader가 표시됩니다.
   */
  @property({ type: Boolean }) public loading: boolean = false;
  /**
   * Loader의 기본 색상입니다.<br>
   * 값을 변경하면 Loader 색상이 변경됩니다.
   */
  @property({ type: String }) public loaderColor: string = "#7DAFE9";
  /**
   * Loader의 Circle 반지름 입니다.
   */
  @property({ type: Number }) public loaderRadius: number = 10;
  /**
   * Loader의 Circle이 동작하는 폭입니다.
   */
  @property({ type: Number }) public loaderTransitionValue: number = 17;
  /**
   * 데이터가 없을 때의 표시 메시지 입니다.<br>
   */
  @property({ type: String })
  public noDataMsg: string = "No data to display";
  /**
   * x축 데이터가 Date Type일 경우 Format입니다.
   */
  @property({ type: String }) public dateFormat: string = "YYYY-MM-DD";
  /**
   * 순수 그래프의 Margin값 입니다.<br>
   * top, right, bottom, left값을 지정할 수 있습니다.
   */
  @property({
    type: Object,
  })
  public graphMargin: IMargin = {
    top: 20,
    right: 120,
    bottom: 60,
    left: 60,
  };
  /**
   * 강조하고 싶은 값의 index 목록 입니다.
   */
  @property({ type: Array }) highlightIndeces: number[] = new Array<number>();
  /**
   * Tooltip 함수 목록 입니다.
   */
  @property({ type: Object }) public tooltipFuncs: Record<string, any> = {};

  protected chartBase!: CB;
  protected cls: any;

  private observer: ResizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      this.draw();
    },
  );

  constructor() {
    super();
  }

  private get svg(): HTMLDivElement | null {
    const div = this.shadowRoot?.getElementById("svg");
    return div ? (div as HTMLDivElement) : null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.svg) {
      this.observer.observe(this.svg);
      if (this.data) {
        this.analysisData(this.data);
      }
      this.draw();
    }
  }

  async attributeChangedCallback(name: string, old: string, value: string) {
    super.attributeChangedCallback(name, old, value);
    this.requestUpdate(name, old);
    await this.updateComplete;
    if (name === "data") {
      if (this.data) {
        this.analysisData(this.data);
      }
    } else if (name === "showlegend") {
      this.showLegend = JSON.parse(value);
    } else if (name === "showdefaulttooltip") {
      this.showDefaultTooltip = JSON.parse(value);
    } else if (name === "showaxis") {
      this.showAxis = JSON.parse(value);
    } else if (name === "showscatter") {
      set(this, "showScatter", JSON.parse(value));
    } else if (name === "showoutlier") {
      set(this, "showOutlier", JSON.parse(value));
    } else if (name === "iszscoredata") {
      this.isZScoreData = JSON.parse(value);
    } else if (name === "isiqr") {
      this.isIQR = JSON.parse(value);
    }
    this.draw();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  private getPropKeys(): string[] {
    const filters: string[] = ["data", "chartTitle"];
    const cps: Map<string, any> = get(this.cls, "_classProperties");
    const props: string[] = [];
    if (cps && cps.size > 0) {
      cps.forEach((value: any, key: string) => {
        if (!filters.includes(key)) {
          props.push(key);
        }
      });
    }
    return props;
  }

  private initProp() {
    this.getPropKeys().forEach(key => {
      set(this.chartBase, key, get(this, key));
    });
    this.chartBase.width = this.width || this.clientWidth;
    this.chartBase.height = this.height || this.clientHeight;
    this.chartBase.title = this.chartTitle;
    this.chartBase.setTooltipAxisXLabel = (value: any) => (value ? value : "");
    this.chartBase.setTooltipAxisXValue = (value: any) => (value ? value : "");
    this.chartBase.setTooltipSeriesLabel = (value: any) => (value ? value : "");
    this.chartBase.setTooltipSeriesValue = (value: any) => (value ? value : "");
    this.chartBase.setLabelValue = (key: any, value: any) => (value ? value : "");
    this.chartBase.setAxisXLabelValue = (value: any) => (value ? value : "");
    this.chartBase.setAxisYLabelValue = (value: any) => (value ? value : "");
  }

  public analysisData(data: any[]) {
    this.initProp();
    this.chartBase.analysisData(data);
  }

  public draw() {
    EventBus.fire("set-tooltip-funcs", { tooltipFuncs: this.tooltipFuncs });
    this.initProp();
    const svg = this.shadowRoot?.getElementById("svg");
    if (svg) {
      this.chartBase.draw(svg as any);
    }
  }

  public clear() {
    const svg = this.shadowRoot?.getElementById("svg");
    if (svg) {
      this.chartBase.clear(svg as any);
    }
  }

  render(): TemplateResult {
    return html` <div id="svg"></div> `;
  }
}
