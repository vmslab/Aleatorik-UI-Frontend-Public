<template></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  AxisType,
  AxisDataType,
  Direction,
  Aggregation,
  Location,
  IChartTextParams,
  ChartData,
  ChartValue,
  ITooltipParams,
} from "mozart-common";

@Component({
  name: "Axis",
  components: {},
})
export default class Axis extends Vue {
  /**
   * Axis의 key 입니다.
   */
  @Prop({ type: String, required: true }) public name!: string;
  /**
   * Axis의 종류 입니다.<br>
   */
  @Prop({ type: String, required: true }) public type!: AxisType;
  /**
   * Axis의 방향 입니다. (가로/세로)
   */
  @Prop({ type: String, required: true }) public direction!: Direction;
  /**
   * Axis의 위치 입니다. (상하좌우)
   */
  @Prop({ type: String, required: true }) public location!: Location;
  /**
   * Axis의 데이터 형태 입니다. (string, number, Date)
   */
  @Prop({ type: String, required: false }) public dataType?: AxisDataType;
  /**
   * Axis의 집계 함수 입니다.
   */
  @Prop({ type: String, required: false }) public aggregation?: Aggregation;
  /**
   * Key Axis일 경우 key field 입니다.<br>
   * 기본 값은 key 입니다.
   */
  @Prop({ type: String, required: false }) public field?: string;
  /**
   * Axis Caption 입니다.
   */
  @Prop({ type: String, required: false }) public caption?: string;
  /**
   * Axis의 내부 padding 입니다.
   */
  @Prop({ type: Number, required: false }) public innerPadding?: number;
  /**
   * Axis의 외부 padding 입니다.
   */
  @Prop({ type: Number, required: false }) public outerPadding?: number;
  /**
   * Axis의 최소 고정 값입니다.
   */
  @Prop({ type: [Number, Date], required: false }) public fixedMinValue?: number | Date;
  /**
   * Axis의 최대 고정 값입니다.
   */
  @Prop({ type: [Number, Date], required: false }) public fixedMaxValue?: number | Date;
  /**
   * Axis의 grid를 보여줄지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public showGrid?: boolean;
  /**
   * Axis의 bar를 보여줄지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public showBar?: boolean;
  /**
   * Axis의 tick 크기 입니다.
   */
  @Prop({ type: Number, required: false }) public tickSize?: number;
  /**
   * Axis의 tick 개수 입니다.
   */
  @Prop({ type: Number, required: false }) public tickCount?: number;
  /**
   * Axis의 label 회전 각도 입니다.
   */
  @Prop({ type: Number, required: false }) public rotateAngle?: number;
  /**
   * Axis의 marker data 입니다.
   */
  @Prop({ type: Array, required: false }) public markers?: ChartValue[];
  /**
   * Axis의 marker class 입니다.
   */
  @Prop({ type: String, required: false }) public markerClass?: string;
  /**
   * Axis를 보여줄지 여부 입니다.
   */
  @Prop({ type: Boolean, required: false }) public visible?: boolean;
  /**
   * Axis의 추가 class name 입니다.
   */
  @Prop({ type: String, required: false }) public className?: string;
  /**
   * Axis label의 text를 설정할 수 있는 함수 입니다.
   */
  @Prop({ type: Function, required: false }) public setLabel?: (params: IChartTextParams) => string;
  /**
   * Axis의 표시 되는 value값을 지정할 수 있는 함수 입니다.<br>
   * type이 key인 경우만 해당
   */
  @Prop({ type: Function, required: false }) public setKeyTickValues?: (
    params: ChartValue[],
  ) => ChartValue[];
  /**
   * Axis의 표시 되는 value값을 지정할 수 있는 함수 입니다.<br>
   * type이 series인 경우만 해당
   */
  @Prop({ type: Function, required: false }) public setSeriesTickValues?: (
    params: Array<Record<string, ChartData>>,
  ) => Set<ChartValue>;
  /**
   * chart에 그려지는 tooltip을 custormize 할 수 있는 함수 입니다.<br>
   * 설정 시 기본 tooltip 대신 그려집니다.
   * key axis에만 동작합니다.
   */
  @Prop({ type: Function, required: false }) public renderCustomTooltip?: (
    params: ITooltipParams,
  ) => string;
}
</script>
