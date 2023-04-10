<template>
  <div :class="['vc-hue', directionClass]">
    <div
      class="vc-hue-container"
      role="slider"
      :aria-valuenow="hsl.h"
      aria-valuemin="0"
      aria-valuemax="360"
      ref="container"
      @mousedown="handleMouseDown"
      @touchmove="handleChange"
      @touchstart="handleChange"
    >
      <div
        class="vc-hue-pointer"
        :style="{ top: pointerTop, left: pointerLeft }"
        role="presentation"
      >
        <div class="vc-hue-picker"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { TinyColor } from "@ctrl/tinycolor";

@Component({
  name: "Hue",
  components: {},
})
export default class Hue extends Vue {
  @Prop({ type: Object, required: true }) public value!: TinyColor;
  @Prop({ type: String, default: "horizontal" }) public direction?: String;
  private oldHue: number = 0;
  private pullDirection: string = "";

  public get colors() {
    const h = this.hsl.h;
    if (h !== 0 && h - this.oldHue > 0) this.pullDirection = "right";
    if (h !== 0 && h - this.oldHue < 0) this.pullDirection = "left";
    this.oldHue = h;
    return this.value;
  }

  public get hsl() {
    return this.value.toHsl();
  }

  public get directionClass() {
      return {
        'vc-hue--horizontal': this.direction === 'horizontal',
        'vc-hue--vertical': this.direction === 'vertical'
      }
    }

  public get pointerTop() {
    if (this.direction === "vertical") {
      if (this.hsl.h === 0 && this.pullDirection === "right") return 0;
      return -((this.hsl.h * 100) / 360) + 100 + "%";
    } else {
      return 0;
    }
  }

  public get pointerLeft() {
    if (this.direction === "vertical") {
      return 0;
    } else {
      if (this.hsl.h === 0 && this.pullDirection === "right") return "100%";
      return (this.hsl.h * 100) / 360 + "%";
    }
  }

  public handleChange(e:any, skip:any) {
    !skip && e.preventDefault();
    var container = this.$refs.container as unknown as HTMLElement;
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
    var left = pageX - xOffset;
    var top = pageY - yOffset;
    var h;
    var percent;
    if (this.direction === "vertical") {
      if (top < 0) {
        h = 360;
      } else if (top > containerHeight) {
        h = 0;
      } else {
        percent = -((top * 100) / containerHeight) + 100;
        h = (360 * percent) / 100;
      }
      if (this.hsl.h !== h) {
        this.$emit("change", {
          h: h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: this.hsl.a,
          source: "hsl",
        });
      }
    } else {
      if (left < 0) {
        h = 0;
      } else if (left > containerWidth) {
        h = 360;
      } else {
        percent = (left * 100) / containerWidth;
        h = (360 * percent) / 100;
      }
      if (this.hsl.h !== h) {
        this.$emit("change", {
          h: h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: this.hsl.a,
          source: "hsl",
        });
      }
    }
  }

  public handleMouseDown(e: MouseEvent) {
    this.handleChange(e, true);
    window.addEventListener("mousemove", this.handleChange as any);
    window.addEventListener("mouseup", this.handleMouseUp);
  }

  public handleMouseUp(e: MouseEvent) {
    this.unbindEventListeners();
  }

  public unbindEventListeners() {
    window.removeEventListener("mousemove", this.handleChange as any);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
}
</script>
