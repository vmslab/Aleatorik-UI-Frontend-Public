<template>
  <div class="vc-checkerboard" :style="bgStyle"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({
  name: "Checkboard",
  components: {},
})
export default class Checkboard extends Vue {
  @Prop({ type: Number, default: 8 }) public size!: number;
  @Prop({ type: String, default: "#fff" }) public white!: string;
  @Prop({ type: String, default: "#e6e6e6" }) public grey!: string;
  public _checkboardCache: any = {};

  public get bgStyle() {
    return "background-image:url(" + this.getCheckboard(this.white, this.grey, this.size) + ")";
  }

  public getCheckboard(c1: string, c2: string, size: number) {
    var key = c1 + "," + c2 + "," + size;
    if (this._checkboardCache && this._checkboardCache[key]) {
      return this._checkboardCache[key];
    } else {
      var checkboard = this.renderCheckboard(c1, c2, size);
      if (!this._checkboardCache) this._checkboardCache = {};
      this._checkboardCache[key] = checkboard;
      return checkboard;
    }
  }

  public renderCheckboard(c1: string, c2: string, size: number) {
    // Dont Render On Server
    if (typeof document === "undefined") {
      return null;
    }

    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size * 2;
    var ctx = canvas.getContext("2d");
    // If no context can be found, return early.
    if (!ctx) {
      return null;
    }

    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, size, size);
    ctx.translate(size, size);
    ctx.fillRect(0, 0, size, size);
    return canvas.toDataURL();
  }
}
</script>
