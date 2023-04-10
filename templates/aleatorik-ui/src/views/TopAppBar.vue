<template>
  <div class="moz-top-app">
    <div class="spacer"></div>
    <div class="moz-top-common-btn-area">
      <i
        v-if="theme === `light`"
        id="theme-btn"
        @click="onClickTheme"
        class="mozart-icons moz-theme top-app-button"
      ></i>
      <i
        id="theme-btn"
        v-if="theme === `dark`"
        @click="onClickTheme"
        class="mozart-icons moz-theme-tap top-app-button"
      ></i>
      <i
        v-if="compact === 'normal'"
        v-tooltip="{ text: $t('Normal') }"
        @click="onClickCompact"
        class="mozart-icons moz-compact-normal top-app-button"
      ></i>
      <i
        v-if="compact === 'compact'"
        v-tooltip="{ text: $t('Compact') }"
        @click="onClickCompact"
        class="mozart-icons moz-compact top-app-button"
      ></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxToolbar, DxItem } from "devextreme-vue/toolbar";
import { setTheme } from "@/utils/common";
import { MainModule } from "@/store/modules/mainStore";
import { changeColorTheme, changeSizeTheme } from "mozart-common";

export interface IEditParams {
  result: boolean;
  add?: boolean;
  data: any;
}

@Component({
  components: {
    DxButton,
    DxToolbar,
    DxItem,
  },
})
export default class TopAppBar extends Vue {
  constructor() {
    super();
  }

  public get navis(): string[] | undefined {
    return this.$router.currentRoute.meta?.navis;
  }

  public get theme() {
    return MainModule.getTheme;
  }

  public get compact() {
    return MainModule.getCompact;
  }

  public onClickTheme() {
    MainModule.setTheme(this.theme === "light" ? "dark" : "light");
    setTheme();
    changeColorTheme({ color: MainModule.getTheme, size: MainModule.getCompact });
  }

  public onClickCompact() {
    MainModule.setCompact(this.compact === "normal" ? "compact" : "normal");
    setTheme();
    changeSizeTheme({ color: MainModule.getTheme, size: MainModule.getCompact });
  }

  public get isDev(): boolean {
    return MainModule.isDev;
  }

  public get userName(): string | null {
    return MainModule.getName;
  }

  public get logedOn(): boolean {
    return MainModule.getLogedOn;
  }

  public get SystemId(): string {
    if (this.$router && this.$router.currentRoute) {
      const pathArr = this.$router.currentRoute.path.split("/");
      return pathArr.length > 1 ? pathArr[pathArr.length - 1] : "";
    }
    return "";
  }

  public get menuTitle(): string {
    const arr = this.$route.meta?.navis;
    if (arr && arr.length > 0) {
      return arr[0];
    }
    return "";
  }

  public onToggleDrawer() {
    MainModule.toggle();
  }

  public onTest() {}
}
</script>
