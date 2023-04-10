<template>
  <div class="vc-alpha">
    <div class="vc-alpha-checkboard-wrap">
      <checkboard></checkboard>
    </div>
    <div class="vc-alpha-gradient" :style="{ background: gradientColor }"></div>
    <div
      class="vc-alpha-container"
      ref="container"
      @mousedown="handleMouseDown"
      @touchmove="handleChange"
      @touchstart="handleChange"
    >
      <div class="vc-alpha-pointer" :style="{ left: colors.a * 100 + '%' }">
        <div class="vc-alpha-picker"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import checkboard from "./Checkboard.vue";
import { TinyColor } from "@ctrl/tinycolor";

@Component({
  name: "Alpha",
  components: { checkboard },
})
export default class Alpha extends Vue {
  @Prop({ type: Object, required: true }) public value!: TinyColor;

  public get colors() {
    return this.value;
  }

  public get hsl() {
    return this.colors.toHsl();
  }

  public get gradientColor() {
    const rgbStr = [this.colors.r, this.colors.g, this.colors.b].join(",");
    return "linear-gradient(to right, rgba(" + rgbStr + ", 0) 0%, rgba(" + rgbStr + ", 1) 100%)";
  }

  public handleChange(e: any, skip: any) {
    !skip && e.preventDefault();
    var container = this.$refs.container as unknown as HTMLElement;
    if (!container) {
      // for some edge cases, container may not exist. see #220
      return;
    }
    var containerWidth = container.clientWidth;
    var xOffset = container.getBoundingClientRect().left + window.pageXOffset;
    var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
    var left = pageX - xOffset;
    var a;
    if (left < 0) {
      a = 0;
    } else if (left > containerWidth) {
      a = 1;
    } else {
      a = Math.round((left * 100) / containerWidth) / 100;
    }
    if (this.colors.a !== a) {
      this.$emit("change", {
        h: this.hsl.h,
        s: this.hsl.s,
        l: this.hsl.l,
        a: a,
        source: "rgba",
      });
    }
  }

  public handleMouseDown(e:any) {
    this.handleChange(e, true);
    window.addEventListener("mousemove", this.handleChange as any);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  public handleMouseUp() {
    this.unbindEventListeners();
  }

  public unbindEventListeners() {
    window.removeEventListener("mousemove", this.handleChange as any);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
}
</script>
