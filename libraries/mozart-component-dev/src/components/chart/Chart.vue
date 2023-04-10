<template>
  <div class="moz-chart-root" ref="chartRef"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  Chart as ChartComponent,
  Axis as AxisComponent,
  Series as SeriesComponent,
  Text as TextComponent,
  Aggregation,
  IChartData,
  IMargin,
  IChartProps,
  IAxisProps,
  ISeriesProps,
  ITextProps,
  createCamelProps,
  IChartTooltipParams,
  TooltipType,
  IMapData,
  CollisionTextType,
} from "mozart-common";

@Component({
  name: "Chart",
  components: {},
})
export default class Chart extends Vue {
  /**
   * Chart의 데이터 입니다.
   */
  @Prop({ type: Array, required: true }) public data!: IChartData[];
  /**
   * 순수 그래프의 Margin값 입니다.<br>
   * top, right, bottom, left값을 지정할 수 있습니다.
   */
  @Prop({ type: Object, required: false }) public margin?: IMargin;
  /**
   * Chart의 데이터 계산을 Z Score로 할지 여부입니다.<br>
   * 주로 각 항목의 표준분포를 비교할 때 사용합니다.
   */
  @Prop({ type: Boolean, required: false, default: false }) isZScore?: boolean;
  /**
   * IQR(Inter Quartile Range)은 Box Plot의 사분범위<br>
   * 즉, Q3 - Q1값을 의미합니다.<br>
   * `isIQR`값은 min, max값의 정의를 구분합니다.<br>
   * **true**일 경우<br>
   * - min = Q1 - 1.5 * IQR<br>
   * - max = Q3 + 1.5 * IQR
   */
  @Prop({ type: Boolean, required: false, default: false }) public isIqr?: boolean;
  /**
   * Chart의 Zoom기능 사용 여부입니다.<br>
   * **true**일 경우 Drag & Drop, Mouse Wheel이 활성화 됩니다.
   */
  @Prop({ type: Boolean, required: false, default: false }) public isZoom?: boolean;
  /**
   * 기본 ToopTip 표시 여부입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public isTooltip?: boolean;
  /**
   * 기본 ToopTip의 Line 표시 여부입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public isTooltipLine?: boolean;
  /**
   * 충돌 Text 발생 시 위치 이동 여부입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public isCollisionTextRerender?: boolean;
  /**
   * Text 끼리 충돌하는 로직을 적용시킬지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public isCollisionTextLogic?: boolean;
  /**
   * Text가 Rect를 Over하는 로직을 적용시킬지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public isOverTextLogic?: boolean;
  /**
   * 충돌 Text의 실제 값과 떨어지는 위치의 padding입니다.<br>
   * minus 값을 주면 가까워지고 plus 값을 주면 멀어집니다.
   */
  @Prop({ type: Number, required: false }) public collisionTextPadding?: number;
  /**
   * 충돌 Text의 style tyle 입니다.<br>
   * 목록 : back, series<br>
   * 기본 값 : series
   */
  @Prop({ type: String, required: false }) public collisionTextType?: CollisionTextType;
  /**
   * Scatter Plot Circle의 흩어진 정도입니다.<br>
   * 숫자가 클수록 더 넓은 범위로 그려집니다.
   */
  @Prop({ type: Number, required: false }) public circlePadding?: number;
  /**
   * 0인 값을 표시할지 여부입니다.<br>
   * **false**일 경우 0인 값은 없는 값이 되어 Chart에 표기되지 않습니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public showZero?: boolean;
  /**
   * Scatter Plot Circle을 그릴지 여부입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public showScatter?: boolean;
  /**
   * Outlier를 그릴지 여부입니다.
   */
  @Prop({ type: Boolean, required: false, default: true }) public showOutlier?: boolean;
  /**
   * Loader표시 여부입니다.<br>
   * **true**경우 Loader가 표시됩니다.
   */
  @Prop({ type: Boolean, required: false }) public loading?: boolean;
  /**
   * Loader의 Circle 반지름 입니다.
   */
  @Prop({ type: Number, required: false }) public loaderRadius?: number;
  /**
   * 데이터가 없을 때의 표시 메시지 입니다.<br>
   */
  @Prop({ type: String, required: false }) public noDataMessage?: string;
  /**
   * 색상 저장소 입니다.
   * 화면에서 Chart끼리 서로 다른 색상을 사용해야 하는 경우 {}를 넣어줍니다.
   */
  @Prop({ type: Object, required: false }) public colorDic?: Record<string, any>;
  /**
   * Pie Chart의 Y축 값을 결정하는 집합 함수 입니다.<br>
   * 같은 키의 값이 여러개인 Data에 적용됩니다.<br>
   * 목록 : "count", "sum", "avg", "min", "max"
   */
  @Prop({ type: String, required: false }) public pieAggregation?: Aggregation;
  /**
   * `PieChart`의 내부 원의 반지름 입니다.
   */
  @Prop({ type: Number, required: false }) public pieInnerRadius?: number;
  /**
   * `PieChart`의 외부 원의 반지름 입니다.
   */
  @Prop({ type: Number, required: false }) public pieOuterRadius?: number;
  /**
   * Pie Chart의 기본 투명도입니다.<br>
   * 기본 투명도는 Chart의 요소 색상에 적용됩니다.
   */
  @Prop({ type: Number, required: false }) public pieOpacity?: number;
  /**
   * Pie Chart의 Tooltip 유형 입니다.
   */
  @Prop({ type: String, required: false }) public pieTooltipType?: TooltipType;
  /**
   * Chart의 추가 class name 입니다.
   */
  @Prop({ type: String, required: false }) public className?: string;
  /**
   * Chart의 tooltip 순서를 역순으로 할지 여부입니다.
   */
  @Prop({ type: Boolean, required: false }) public isTooltipReverse?: boolean;
  /**
   * Chart의 tooltip에 Delay를 줄지 여부 입니다.<br>
   * 0 이상의 값을 주면 setTimeout으로 지연하여 Tooltip이 그려집니다.
   */
  @Prop({ type: Number, required: false }) public delayedTooltip?: number;
  /**
   * Chart의 tooltip의 text를 설정할 수 있는 함수 입니다.
   */
  @Prop({ type: Function, required: false }) public setToolTipText?: (
    params: IChartTooltipParams,
  ) => string;
  /**
   * Chart Item의 click event 함수 입니다.
   */
  @Prop({ type: Function, required: false }) onClickItem?: (
    data: IMapData,
    event: MouseEvent,
  ) => void;
  /**
   * Chart Item의 double click event 함수 입니다.
   */
  @Prop({ type: Function, required: false }) onDblClickItem?: (
    data: IMapData,
    event: MouseEvent,
  ) => void;
  /**
   * Chart Item의 context menu event 함수 입니다.
   */
  @Prop({ type: Function, required: false }) onContextMenuItem?: (
    data: IMapData,
    event: MouseEvent,
  ) => void;

  public chart: ChartComponent | null = null;

  public mounted() {
    this.renderChart();
  }

  public destroyed() {
    if (!this.chart) return;
    this.chart.dispose();
  }

  public renderChart() {
    const axises: AxisComponent[] = [];
    const serieses: SeriesComponent[] = [];
    const pies: SeriesComponent[] = [];
    const texts: TextComponent[] = [];
    const defaultSlots = this.$slots.default;
    if (defaultSlots) {
      defaultSlots.forEach((slot: any) => {
        if (slot.tag.endsWith("Axis")) {
          axises.push(
            new AxisComponent(createCamelProps<IAxisProps>(slot.componentOptions.propsData)),
          );
        } else if (slot.tag.endsWith("Series")) {
          if (slot.componentOptions.propsData.type === "pie") {
            pies.push(
              new SeriesComponent(createCamelProps<ISeriesProps>(slot.componentOptions.propsData)),
            );
          } else {
            serieses.push(
              new SeriesComponent(createCamelProps<ISeriesProps>(slot.componentOptions.propsData)),
            );
          }
        } else if (slot.tag.endsWith("Text")) {
          texts.push(
            new TextComponent(createCamelProps<ITextProps>(slot.componentOptions.propsData)),
          );
        }
      });
    }

    this.chart = new ChartComponent({
      parents: this.$refs.chartRef as unknown as HTMLElement,
      ...createCamelProps<IChartProps>(this.$props),
      axises,
      serieses,
      pies,
      texts,
    });
    this.chart.render();
  }

  @Watch("data", { deep: true })
  public onChangedData(newVal: IChartData[]) {
    if (this.chart) {
      this.chart.dispose();
    }
    this.renderChart();
  }

  @Watch("loading")
  public onChangedLoading(newVal: boolean) {
    if (!this.chart) return;
    this.chart.loading = newVal;
    this.chart.render();
  }
}
</script>
