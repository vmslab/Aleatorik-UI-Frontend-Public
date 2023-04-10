<template>
  <div class="vc-editable-input">
    <input
      :aria-labelledby="labelId"
      class="vc-input__input"
      v-model="val"
      @keydown="handleKeyDown"
      @input="update"
      ref="input"
    />
    <span :for="label" class="vc-input__label" :id="labelId">{{ labelSpanText }}</span>
    <span class="vc-input__desc">{{ desc }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({
  name: "EditableInput",
  components: {},
})
export default class EditableInput extends Vue {
  @Prop({ type: [String, Number],required: true }) public value!: string|number;
  @Prop({ type: String, required:true }) public label!: "hex" | "hex8" | "r" | "g" | "b" | "a" | "h" | "s" | "l";
  @Prop({ type: String }) public labelText?: string;
  @Prop({ type: String }) public desc?: string;
  @Prop({ type: Number }) public max?: number;
  @Prop({ type: Number }) public min?: number;
  @Prop({ type: Number }) public arrowOffset?: number;

  public get val() {
    return this.value;
  }

  public set val(v: any) {
    if (!(this.max === undefined) && +v > this.max) {
      (this.$refs.input as any).value = this.max;
    }
  }

  public get labelId() {
    return `input__label__${this.label}__${Math.random().toString().slice(2, 5)}`;
  }

  public get labelSpanText() {
    return this.labelText || this.label;
  }

  public update(e: any) {
    this.handleChange(e.target.value);
  }

  public handleChange(data: string | number) {
    this.$emit("change", data, this.label);
  }

  public handleKeyDown(e: any) {
    let val = this.val;
    let number = Number(val);
    if (number) {
      let amount = this.arrowOffset || 1;
      // Up
      if (e.keyCode === 38) {
        val = number + amount;
        this.handleChange(val);
        e.preventDefault();
      }
      // Down
      if (e.keyCode === 40) {
        val = number - amount;
        this.handleChange(val);
        e.preventDefault();
      }
    }
  }
}
</script>
