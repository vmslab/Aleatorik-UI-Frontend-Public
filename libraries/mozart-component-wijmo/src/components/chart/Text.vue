<template></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TextType, ShapeType, Position, IMargin, Location, IChartTextParams } from "mozart-common";

@Component({
  name: "Text",
  components: {},
})
export default class Text extends Vue {
  /**
   * text 값 입니다.<br>
   * Series의 Text를 따로 설정할 때는 Series field와 매핑됩니다.
   */
  @Prop({ type: String, required: false }) public text?: string;
  /**
   * text 종류 입니다.
   */
  @Prop({ type: String, required: false }) public type?: TextType;
  /**
   * text 색상 입니다.
   */
  @Prop({ type: String, required: false }) public color?: string;
  /**
   * text 크기 입니다.
   */
  @Prop({ type: [String, Number], required: false }) public size?: number | string;
  /**
   * text 각도 입니다.
   */
  @Prop({ type: Number, required: false }) public angle?: number;
  /**
   * text 위치 입니다. (상하좌우)
   */
  @Prop({ type: String, required: false }) public location?: Location;
  /**
   * text 방향 입니다. (가로/세로)
   */
  @Prop({ type: String, required: false }) public position?: Position;
  /**
   * text margin 입니다.
   */
  @Prop({ type: Object, required: false }) public margin?: IMargin;
  /**
   * text legend column 수 입니다.
   */
  @Prop({ type: Number, required: false }) public legendCol?: number;
  /**
   * text legend row 수 입니다.
   */
  @Prop({ type: Number, required: false }) public legendRow?: number;
  /**
   * text legend 모양 입니다.
   */
  @Prop({ type: String, required: false }) public legendShape?: ShapeType;
  /**
   * text legend 최대 Text 폭 입니다.
   */
  @Prop({ type: Number, required: false }) public legendMaxTextWidth?: number;
  /**
   * text의 추가 class name 입니다.
   */
  @Prop({ type: String, required: false }) public className?: string;
  /**
   * text를 설정할 수 있는 함수 입니다.
   */
  @Prop({ type: Function, required: false }) public setText?: (params: IChartTextParams) => string;
}
</script>
