<template>
  <div
    role="application"
    aria-label="Chrome color picker"
    :class="['vc-chrome moz-color-picker', disableAlpha ? 'vc-chrome__disable-alpha' : '']"
    :style="`width:${width}px;`"
  >
    <div class="vc-chrome-saturation-wrap">
      <saturation v-model="colors" @change="colorChange"></saturation>
    </div>
    <div class="vc-chrome-body">
      <div class="vc-chrome-controls">
        <div class="vc-chrome-color-wrap">
          <div
            :aria-label="`current color is ${hex}`"
            class="vc-chrome-active-color"
            :style="{ background: activeColor }"
          ></div>
          <checkboard v-if="!disableAlpha"></checkboard>
        </div>

        <div class="vc-chrome-sliders">
          <div class="vc-chrome-hue-wrap">
            <hue v-model="colors" @change="colorChange"></hue>
          </div>
          <div class="vc-chrome-alpha-wrap" v-if="!disableAlpha">
            <alpha v-model="colors" @change="colorChange"></alpha>
          </div>
        </div>
      </div>

      <div class="vc-chrome-fields-wrap" v-if="!disableFields">
        <div class="vc-chrome-fields" v-show="fieldsIndex === 0">
          <!-- hex -->
          <div class="vc-chrome-field">
            <editableInput
              v-if="!hasAlpha"
              label="hex"
              :value="hex"
              @change="inputChange"
            ></editableInput>
            <editableInput
              v-if="hasAlpha"
              label="hex8"
              :value="hex8"
              @change="inputChange"
            ></editableInput>
          </div>
        </div>
        <div class="vc-chrome-fields" v-show="fieldsIndex === 1">
          <!-- rgba -->
          <div class="vc-chrome-field">
            <editableInput label="r" :value="colors.r" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field">
            <editableInput label="g" :value="colors.g" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field">
            <editableInput label="b" :value="colors.b" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field" v-if="!disableAlpha">
            <editableInput
              label="a"
              :value="colors.a"
              :arrow-offset="0.01"
              :max="1"
              @change="inputChange"
            ></editableInput>
          </div>
        </div>
        <div class="vc-chrome-fields" v-show="fieldsIndex === 2">
          <!-- hsla -->
          <div class="vc-chrome-field">
            <editableInput label="h" :value="hsl.h" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field">
            <editableInput label="s" :value="hsl.s" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field">
            <editableInput label="l" :value="hsl.l" @change="inputChange"></editableInput>
          </div>
          <div class="vc-chrome-field" v-if="!disableAlpha">
            <editableInput
              label="a"
              :value="colors.a"
              :arrow-offset="0.01"
              :max="1"
              @change="inputChange"
            ></editableInput>
          </div>
        </div>
        <!-- btn -->
        <div
          class="vc-chrome-toggle-btn"
          role="button"
          aria-label="Change another color definition"
          @click="toggleViews"
        >
          <div class="vc-chrome-toggle-icon">
            <svg
              style="width: 24px; height: 24px"
              viewBox="0 0 24 24"
              @mouseover="showHighlight"
              @mouseenter="showHighlight"
              @mouseout="hideHighlight"
            >
              <path
                fill="#333"
                d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"
              />
            </svg>
          </div>
          <div class="vc-chrome-toggle-icon-highlight" v-show="highlight"></div>
        </div>
        <!-- btn -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { TinyColor, ColorInput, RGB, RGBA, HSL, HSLA } from "@ctrl/tinycolor";
import editableInput from "./common/EditableInput.vue";
import saturation from "./common/Saturation.vue";
import hue from "./common/Hue.vue";
import alpha from "./common/Alpha.vue";
import checkboard from "./common/Checkboard.vue";

@Component({
  name: "ColorPicker",
  components: { editableInput, saturation, hue, alpha, checkboard },
})
export default class ColorPicker extends Vue {
  @Prop({ required: true }) public value!: ColorInput;
  @Prop({ type: Number, default: 150 }) public width!: number;
  @Prop({ type: Boolean, required: false }) public disableAlpha?: boolean;
  @Prop({ type: Boolean, required: false }) public disableFields?: boolean;
  public val = new TinyColor(this.value);
  public fieldsIndex: number = 0;
  public highlight: boolean = false;

  constructor() {
    super();
  }

  public get colors() {
    return this.val;
  }

  public set colors(newVal: TinyColor) {
    this.val = newVal;
  }

  public get hex() {
    return this.colors.toHexString();
  }

  public get hex8() {
    return this.colors.toHex8String();
  }

  public get hsl() {
    return this.colors.toHsl();
  }

  public get activeColor() {
    return "rgba(" + [this.colors.r, this.colors.g, this.colors.b, this.colors.a].join(",") + ")";
  }

  public get hasAlpha() {
    return this.colors.a < 1;
  }

  @Watch("value")
  public onChangeNewVal(newVal: ColorInput) {
    this.val = new TinyColor(newVal);
  }

  public mounted() {
    if (this.value) {
      this.val = new TinyColor(this.value);
    }
  }

  public colorChange(data: ColorInput) {
    this.colors = new TinyColor(data);
    this.$emit("change", this.colors.toHexString());
  }

  public inputChange(data?: string | number, label?: "hex" | "hex8" | "r" | "g" | "b" | "a" | "h" | "s" | "l") {
    if (!data) return;
    if (!label) return;
    
    if (this.fieldsIndex === 1) {  // rgb | rgba
      let { r, g, b, a } = this.colors;
      if (label === "r") {
        r = +data;
      } else if (label === "g") {
        g = +data;
      } else if (label === "b") {
        b = +data;
      } else {
        a = +data;
      }
      this.colorChange({ r, g, b, a });
    } else if (this.fieldsIndex === 2) {  // hsl | hsla
      let { h, s, l } = this.colors.toHsl();
      let a = this.colors.a;
      if (label === "h") {
        h = +data;
      } else if (label === "s") {
        s = +data;
      } else if (label === "l") {
        l = +data;
      } else {
        a = +data;
      }
      this.colorChange({ h, s, l, a });
    } else {  // hex | hex8
      this.colorChange(data);
    }
  }

  public toggleViews() {
    if (this.fieldsIndex >= 2) {
      this.fieldsIndex = 0;
      return;
    }
    this.fieldsIndex++;
  }

  public showHighlight() {
    this.highlight = true;
  }

  public hideHighlight() {
    this.highlight = false;
  }

  public simpleCheckForValidColor(data: any) {
    var keysToCheck = ["r", "g", "b", "a", "h", "s", "l", "v"];
    var checked = 0;
    var passed = 0;

    for (var i = 0; i < keysToCheck.length; i++) {
      var letter = keysToCheck[i];
      if (data[letter]) {
        checked++;
        if (!isNaN(data[letter])) {
          passed++;
        }
      }
    }

    if (checked === passed) {
      return data;
    }
  }

  public paletteUpperCase(palette: string[]) {
    return palette.map(c => c.toUpperCase());
  }

  public isTransparent(color: string) {
    return new TinyColor(color).getAlpha() === 0;
  }
}
</script>
