<template>
  <div v-if="line" class="moz-custom-form-inner-line"></div>
  <div
    v-else
    :class="`moz-custom-form-item${
      horizontal ? ' moz-custom-form-item-horizontal' : ' moz-custom-form-item-vertical'
    }`"
  >
    <label
      :class="group ? 'moz-custom-form-group-header' : 'moz-custom-form-label'"
      :style="horizontal ? `width:${labelWidth}px` : '100%'"
    >
      <DxCheckBox v-if="check" v-model="checked" :disabled="disabled"></DxCheckBox>
      {{ $t(name) }}
      <span v-if="required" class="moz-label-required">&nbsp;*</span>
    </label>
    <slot v-bind="{ controlWidth }"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DxCheckBox } from "devextreme-vue/check-box";

@Component({
  components: {
    DxCheckBox,
  },
})
export default class CustomFormItem extends Vue {
  @Prop({ type: Boolean, default: false }) public value!: boolean;
  @Prop({ type: String, required: true, default: "" }) public name!: string;
  @Prop({ type: Number, default: 100 }) public parentWidth!: number;
  @Prop({ type: Number, default: 100 }) public labelWidth!: number;
  @Prop({ type: Boolean, default: false }) public group!: boolean;
  @Prop({ type: Boolean, default: false }) public required!: boolean;
  @Prop({ type: Boolean, default: false }) public check!: boolean;
  @Prop({ type: Boolean, default: false }) public line!: boolean;
  @Prop({ type: Boolean, default: false }) public disabled!: boolean;
  @Prop({ type: Boolean, default: true }) public horizontal!: boolean;

  constructor() {
    super();
  }

  public get controlWidth(): number {
    return this.parentWidth - this.labelWidth;
  }

  public get checked(): boolean {
    return this.value;
  }

  public set checked(value: boolean) {
    this.$emit("input", value);
  }
}
</script>
