<template></template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { LabelType } from "mozart-common";

@Component({
  name: "Arc",
  components: {},
})
export default class Arc extends Vue {
  /**
   * Gauge 값 입니다.<br>
   * `minValue`, `maxValue`사이의 값을 입력해야 합니다.
   */
  @Prop({ type: Number, required: true }) public value!: number;
  /**
   * Gauge name 입니다.<br>
   * Key로 사용됩니다.
   */
  @Prop({ type: String }) public name?: string;
  /**
   * Arc Caption 입니다.
   */
  @Prop({ type: String, required: false }) public caption?: string;
  /**
   * Gauge 시작 색상입니다.<br>
   * 가장 낮은 값의 색상입니다.
   */
  @Prop({ type: String }) public color?: string;
  /**
   * Gauge 종료 색상입니다.<br>
   * 가장 높은 값의 색상입니다.
   */
  @Prop({ type: String }) public endColor?: string;
  /**
   * gradient 사용여부 입니다.
   */
  @Prop({ type: Boolean, default: false }) public gradient?: boolean;
  /**
   * Label형태 입니다. (middle, inner, outer)
   */
  @Prop({ type: String, required: false }) public labelType?: LabelType;
  /**
   * Text 크기 입니다.
   */
  @Prop({ type: Number }) public textSize?: number;
  /**
   * Text Bold 여부 입니다.
   */
  @Prop({ type: Boolean, default: false }) public textBold?: boolean;
  /**
   * Arc Label의 세로 위치 입니다.
   */
  @Prop({ type: Number, default: 0 }) public textVerticalPosition?: number;
  /**
   * '%' Text 입니다.<br>
   * ex) '점', '원'등으로 변경하여 사용
   */
  @Prop({ type: String }) public percentText?: string;
  /**
   * 애니메이션 시간 입니다.<br>
   * 1000당 1초입니다.
   */
  @Prop({ type: Number }) public animationDuration?: number;
  /**
   * 애니메이션 Delay 시간 입니다.<br>
   * 1000당 1초입니다.
   */
  @Prop({ type: Number }) public animationDelay?: number;

  @Watch("value")
  public onChangedValue(newVal: number, oldVal: number) {
    if (newVal !== oldVal) {
      this.$emit("valueChanged");
    }
  }
}
</script>
