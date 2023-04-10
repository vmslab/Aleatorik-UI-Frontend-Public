<template></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { SeriesType, ColorStandard, Aggregation, IBoxPlotTooltipLabels } from "mozart-common";

@Component({
  name: "Series",
  components: {},
})
export default class Series extends Vue {
  /**
   * Series의 key 입니다.
   */
  @Prop({ type: String, required: true }) public field!: string;
  /**
   * Series Caption 입니다.
   */
  @Prop({ type: String, required: false }) public caption?: string;
  /**
   * Series와 연결되는 key axis name 입니다.
   */
  @Prop({ type: String, required: false }) public keyAxis?: string;
  /**
   * Series와 연결되는 series axis name 입니다.
   */
  @Prop({ type: String, required: false }) public seriesAxis?: string;
  /**
   * Series형태 입니다. (bar, line, area, stack, box-plot, pie, agg-line)
   */
  @Prop({ type: String, required: false }) public type?: SeriesType;
  /**
   * Series의 기본 투명도입니다.<br>
   * 기본 투명도는 Chart의 요소 색상에 적용됩니다.
   */
  @Prop({ type: Number, required: false }) public opacity?: number;
  /**
   * Series의 색상 기준 입니다. (series, axis, one)
   */
  @Prop({ type: String, required: false }) public colorStandard?: ColorStandard;
  /**
   * Bar Series의 최대 폭 입니다.
   */
  @Prop({ type: Number, required: false }) public barMaxSize?: number;
  /**
   * Bar Series의 내부 padding 값 입니다.
   */
  @Prop({ type: Number, required: false }) public barInnerPadding?: number;
  /**
   * Line Series의 원이 보일지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public lineCircle?: boolean;
  /**
   * Line Series의 내부 원이 보일지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public lineInnerCircle?: boolean;
  /**
   * Line Series의 Dash Array 값 입니다.<br>
   * ex) 10, 5
   */
  @Prop({ type: String, required: false }) public lineDashArray?: string;
  /**
   * Line, Area Series의 curve 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public curved?: boolean;
  /**
   * 데이터 계산용으로는 사용되지 않고 Series만 그릴지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public onlySeries?: boolean;
  /**
   * Box-Plot Series의 Tooltip Label값 입니다.<br>
   * 각 값의 Label을 설정 할 수 있습니다.
   */
  @Prop({ type: Object, required: false }) public boxPlotTooltipLabel?: IBoxPlotTooltipLabels;
  /**
   * Area Series의 크기가 이전 값에 영향을 받을지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public areaAffectedPrev?: boolean;
  /**
   * Area Series의 크기가 이전 값에 영향을 받을 때 padding 입니다.
   */
  @Prop({ type: Number, required: false }) public areaPadding?: number;
  /**
   * Area Series의 크기를 고정값으로 지정하고 싶을경우 고정 크기 입니다.<br>
   * 이 값이 기존 크기보다 크면 기존값으로 그려집니다.
   */
  @Prop({ type: Number, required: false }) public areaSize?: number;
  /**
   * Series의 집계함수가 axis의 집계함수와 다를 때 Series 의 집계 함수 입니다.
   */
  @Prop({ type: String, required: false }) public aggregation?: Aggregation;
  /**
   * Series가 agg-line일 때 total값의 aggregation 유형 입니다.
   */
  @Prop({ type: String, required: false }) public totalAggregation?: Aggregation;
  /**
   * Series를 보여줄지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) visible?: boolean;
  /**
   * Series의 추가 class name 입니다.
   */
  @Prop({ type: String, required: false }) className?: string;
}
</script>
