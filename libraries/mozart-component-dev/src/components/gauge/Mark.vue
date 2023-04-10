<template></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { MarkType } from "mozart-common";

@Component({
  name: "Mark",
  components: {},
})
export default class Mark extends Vue {
  /**
   * Mark 값 입니다.<br>
   * `minValue`, `maxValue`사이의 값을 입력해야 합니다.
   */
  @Prop({ type: Number }) public value?: number;
  /**
   * Mark name 입니다.<br>
   * Key로 사용됩니다.
   */
  @Prop({ type: String }) public name?: string;
  /**
   * Mark형태 입니다. (mark, tick)
   */
  @Prop({ type: String, required: false }) public type?: MarkType;
  /**
   * Mark 색상입니다.
   */
  @Prop({ type: String }) public color?: string;
  /**
   * Mark의 넓이 입니다.
   */
  @Prop({ type: Number }) public width?: number;
  /**
   * Mark의 dash-array값 입니다.
   */
  @Prop({ type: String }) public dashArray?: string;
  /**
   * Mark의 type이 tick일 때 tick의 개수 입니다.
   */
  @Prop({ type: Number }) public ticks?: number;
  
}
</script>
