<template>
  <div ref="botDrawer" :class="`dx-card right-drawer ${this.value ? 'is-open' : ''}`">
    <div class="dx-card-title">
      <div class="dx-card-title-text">{{ title }}</div>
      <div class="spacer" />
      <div class="dx-card-title-action">
        <DxButton
          v-tooltip="{ text: $t('Close') }"
          icon="close"
          stylingMode="text"
          @click="onCancelClick"
        />
      </div>
    </div>
    <slot :contentsHeight="contentsHeight" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxForm } from "devextreme-vue/form";

@Component({
  components: { DxButton, DxForm },
})
export default class RightDrawer extends Vue {
  @Prop({ type: Boolean, required: true, default: false }) public value?: boolean;
  @Prop({ type: Boolean, default: false }) public closeOnOutsideClick!: boolean;
  @Prop({ type: String }) public title?: string;

  public contentsHeight?: number = 0;

  constructor() {
    super();
  }

  public getStringToHeight(val: string, def: number = 0) {
    if (val.endsWith("px")) {
      return +val.replace("px", "");
    } else {
      return def;
    }
  }

  public mounted() {
    const cardTitleHeight = getComputedStyle(document.documentElement).getPropertyValue(
      "--size-card-title-height",
    );
    const borderOuter = getComputedStyle(document.documentElement).getPropertyValue(
      "--border-outer",
    );
    const borderSize = borderOuter === "none" ? 0 : 1;

    const titleHeight = this.getStringToHeight(cardTitleHeight, 55) + borderSize;

    const drawerHeight = getComputedStyle(
      document.getElementsByClassName("bottom-drawer")[0],
    ).getPropertyValue("height");
    this.contentsHeight = this.getStringToHeight(drawerHeight) - titleHeight;
  }

  @Watch("value")
  public onValueChanged(newVal: boolean) {
    if (newVal) {
      document.addEventListener("mouseup", this.onOutsideClick);
    } else {
      document.removeEventListener("mouseup", this.onOutsideClick);
    }
  }

  public onOutsideClick(event: any) {
    if (!this.closeOnOutsideClick) return;

    const view = this.$refs.botDrawer as Element;
    if (!view) return;

    if (view.contains(event.target)) return;

    this.$emit("input", false);
  }

  public onCancelClick() {
    this.$emit("input", false);
  }
}
</script>
