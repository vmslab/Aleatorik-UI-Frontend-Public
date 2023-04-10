<template>
  <div
    class="vc-saturation"
    :style="{ background: bgColor }"
    ref="container"
    @mousedown="handleMouseDown"
    @touchmove="handleChange"
    @touchstart="handleChange"
  >
    <div class="vc-saturation--white"></div>
    <div class="vc-saturation--black"></div>
    <div class="vc-saturation-pointer" :style="`left: ${pointerLeft}; top: ${pointerTop};`">
      <div class="vc-saturation-circle"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { clamp } from "mozart-common";
import { ColorInput, TinyColor } from "@ctrl/tinycolor";

@Component({
  name: "Saturation",
  components: {},
})
export default class Saturation extends Vue {
  @Prop({ type: Object, required: true }) public value!: TinyColor;

  public get colors() {
    return this.value;
  }

  public get hsl() {
    return this.colors.toHsl();
  }

  public get hsv() {
    return this.colors.toHsv();
  }

  public get bgColor() {
    return `hsl(${this.hsl.h}, 100%, 50%)`;
  }

  public get pointerTop() {
    return -(this.hsv.v * 100) + 1 + 100 + "%";
  }

  public get pointerLeft() {
    return this.hsv.s * 100 + "%";
  }

  public handleChange(e: any) {
    e.preventDefault();

    var container = this.$refs.container as any;
    if (!container) {
      // for some edge cases, container may not exist. see #220
      return;
    }
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;
    var xOffset = container.getBoundingClientRect().left + window.pageXOffset;
    var yOffset = container.getBoundingClientRect().top + window.pageYOffset;
    var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
    var pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
    var left = clamp(pageX - xOffset, 0, containerWidth);
    var top = clamp(pageY - yOffset, 0, containerHeight);
    var saturation = left / containerWidth;
    var bright = clamp(-(top / containerHeight) + 1, 0, 1);
    this.onChange({
      h: this.hsv.h,
      s: saturation,
      v: bright,
      a: this.hsv.a,
    });
  }

  public onChange(param: ColorInput) {
    this.$emit("change", param);
  }

  public handleMouseDown(e: MouseEvent) {
    // this.handleChange(e, true)
    window.addEventListener("mousemove", this.handleChange);
    window.addEventListener("mouseup", this.handleChange);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  public handleMouseUp(e: MouseEvent) {
    this.unbindEventListeners();
  }

  public unbindEventListeners() {
    window.removeEventListener("mousemove", this.handleChange);
    window.removeEventListener("mouseup", this.handleChange);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
}
</script>
