<template>
  <div>
    <div class="moz-frame">
      <moz-controller>
        <DxColorBox v-model="color" :width="200" @opened="onOpened" />
      </moz-controller>
      <div v-for="(c, i) in colors" :key="i" class="flex-center-horizontal">
        <div style="width: 50px">{{ c.key }}</div>
        <div
          :style="`width: 200px; background-color:${c.primary}; color:${getTextColor(c.primary)}`"
        >
          {{ c.primary }}
        </div>
        <div
          :style="`width: 200px; background-color:${c.complimentary}; color:${getTextColor(
            c.complimentary,
          )}`"
        >
          {{ c.complimentary }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DxColorBox from "devextreme-vue/color-box";
import { getMaterialColors, getTextColor } from "mozart-common";

@Component({
  components: {
    DxColorBox,
  },
})
export default class MaterialColors extends Vue {
  public color: string = "#0000FF";
  public colors: any[] = [];

  constructor() {
    super();
  }

  public mounted() {
    this.colors = getMaterialColors(this.color);
  }

  public getTextColor(color: string) {
    return getTextColor(color);
  }

  @Watch("color")
  public onChangedColor(newVal: string, oldVal: string) {
    if (newVal === oldVal) return;
    this.colors = getMaterialColors(newVal);
  }

  public onOpened(evt: any) {
    const popupContent = evt.component.content() as HTMLElement;
    if (!popupContent) return;
    const popup = popupContent.parentElement;
    if (!popup) return;
    const rect = popup.getBoundingClientRect();
    if (rect.width < 450) {
      const left = rect.width - 450;
      popup.style.width = "450px";
      if (window.innerWidth < rect.left + 450) {
        popup.style.left = `${left}px`;
      }
    }
  }
}
</script>
