<template>
  <div>
    <div class="moz-gauge-root" ref="gaugeRef"></div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  Gauge as GaugeComponent,
  Bar as BarComponent,
  Arc as ArcComponent,
  Mark as MarkComponent,
  IGaugeProps,
  IBarProps,
  IArcProps,
  IMarkProps,
  GaugeType,
  createCamelProps,
  IGaugeTooltipParams,
} from "mozart-common";

@Component({
  name: "Gauge",
  components: {},
})
export default class Gauge extends Vue {
  /**
   * Gauge의 넓이입니다.
   */
  @Prop({ type: Number, required: true }) public width!: number;
  /**
   * Gauge의 높이입니다.
   */
  @Prop({ type: Number, required: true }) public height!: number;
  /**
   * Gauge형태 입니다. (bar, arc)
   */
  @Prop({ type: String, required: false }) public type?: GaugeType;
  /**
   * Gauge의 최소값 입니다.
   */
  @Prop({ type: Number, default: 0 }) public minValue?: number;
  /**
   * Gauge의 최대값 입니다.
   */
  @Prop({ type: Number, default: 100 }) public maxValue?: number;
  /**
   * Gauge 배경 색상입니다.
   */
  @Prop({ type: String, default: "var(--color-backdark1)" }) public backColor?: string;
  /**
   * Arc의 세로 위치 입니다. (arc만 해당)
   */
  @Prop({ type: Number, default: 0 }) public verticalPosition?: number;
  /**
   * Arc의 내부 원의 반지름 비율 입니다.<br>
   * 기본 반지름 (max(높이, 넓이) / 2)의 배율 입니다.
   */
  @Prop({ type: Number, default: 50 }) public innerRadius?: number;
  /**
   * Arc의 외부 원의 반지름 비율 입니다.<br>
   * 기본 반지름 (max(높이, 넓이) / 2)의 배율 입니다.
   */
  @Prop({ type: Number, default: 70 }) public outerRadius?: number;
  /**
   * Gauge의 끝 부분의 반지름 비율 입니다.
   */
  @Prop({ type: Number, default: 0 }) public cornerRadius?: number;
  /**
   * Arc의 시작 각도 입니다.
   */
  @Prop({ type: Number, default: 0 }) public startAngle?: number;
  /**
   * Arc의 종료 각도 입니다.
   */
  @Prop({ type: Number, default: 360 }) public endAngle?: number;
  /**
   * Arc를 반시계 방향으로 그릴 지 여부 입니다.
   */
  @Prop({ type: Boolean, default: false }) public reverse?: boolean;
  /**
   * 색상 저장소 입니다.
   * 화면에서 Gauge끼리 서로 다른 색상을 사용해야 하는 경우 {}를 넣어줍니다.
   */
  @Prop({ type: Object, required: false }) public colorHash?: Record<string, any>;
  /**
   * Loading 여부입니다.
   */
  @Prop({ type: Boolean, required: false }) public loading?: boolean;
  /**
   * Gauge의 데이터가 없을 때 보여줄 text입니다.<br>
   * 해당 값이 있으면 아무것도 그리지 않고 해당 text만 보여줍니다.
   */
  @Prop({ type: String }) public noDataText?: string;
  /**
   * Gauge의 Tooltip을 보일지 여부입니다.
   */
  @Prop({ type: Boolean, default: true }) public showTooltip?: boolean;
  /**
   * Gauge의 tooltip의 text를 설정할 수 있는 함수 입니다.
   */
  @Prop({ type: Function, required: false }) public setToolTip?: (
    params: IGaugeTooltipParams,
  ) => string;

  public gauge: GaugeComponent | null = null;

  public mounted() {
    this.renderGauge();
  }

  public destroyed() {
    this.dispose();
  }

  public renderGauge() {
    const bars: BarComponent[] = [];
    const arcs: ArcComponent[] = [];
    const marks: MarkComponent[] = [];
    if (this.$slots.default) {
      this.$slots.default.forEach((slot: any) => {
        if (slot.tag.endsWith("Bar")) {
          if (!Object.keys(slot.componentInstance._events).includes("valueChanged")) {
            slot.componentInstance.$on("valueChanged", this.onValueChanged);
          }
          bars.push(new BarComponent(createCamelProps<IBarProps>(slot.componentOptions.propsData)));
        } else if (slot.tag.endsWith("Arc")) {
          if (!Object.keys(slot.componentInstance._events).includes("valueChanged")) {
            slot.componentInstance.$on("valueChanged", this.onValueChanged);
          }
          arcs.push(new ArcComponent(createCamelProps<IArcProps>(slot.componentOptions.propsData)));
        } else if (slot.tag.endsWith("Mark")) {
          marks.push(
            new MarkComponent(createCamelProps<IMarkProps>(slot.componentOptions.propsData)),
          );
        }
      });
    }

    this.gauge = new GaugeComponent({
      parents: this.$refs.gaugeRef as unknown as HTMLElement,
      ...createCamelProps<IGaugeProps>(this.$props),
      bars,
      arcs,
      marks,
    });
    this.gauge.render();
  }

  public dispose() {
    if (!this.gauge) return;
    this.gauge.dispose();
  }

  @Watch("loading")
  public onChangedLoading(newVal: boolean) {
    if (!this.gauge) return;
    if (newVal) return;
    this.gauge.dispose();
    this.renderGauge();
  }

  public onValueChanged() {
    this.dispose();
    this.renderGauge();
  }
}
</script>
