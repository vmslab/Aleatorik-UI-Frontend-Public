<template>
  <div ref="root" :style="`width: ${width}px; height: ${height}px;`">
    <div class="moz-root" ref="innerRoot">
      <SideApp class="moz-side-app" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import SideApp from "./views/SideApp.vue";
import { setTheme } from "./utils/common";
import themeData from "./theme/theme.json";
import { MIN_WIDTH, MIN_HEIGHT, ScrollBar, EventBus } from "mozart-common";

@Component({
  components: {
    SideApp,
  },
})
export default class App extends Vue {
  public width: number = 0;
  public height: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  public get appStyle(): object {
    return {
      display: "flex",
      height: `${MainModule.topHeight}px`,
      padding: "10px",
    };
  }

  public async created() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    MainModule.setThemeData(themeData);
    setTheme();
    EventBus.register("load-system-setting", this.onLoadSystemSetting);
    EventBus.register("save-system-setting", this.onSaveSystemSetting);
    EventBus.register("remove-system-setting", this.onRemoveSystemSetting);
  }

  public mounted() {
    this.intervalId = setInterval(() => {
      if (!this.$refs.root) return;
      if (!this.$refs.innerRoot) return;
      new ScrollBar(this.$refs.root as HTMLElement);
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }, 500);
  }

  public destroyed() {
    window.removeEventListener("resize", this.handleResize);
    EventBus.remove("load-system-setting", this.onLoadSystemSetting);
    EventBus.remove("save-system-setting", this.onSaveSystemSetting);
    EventBus.remove("remove-system-setting", this.onRemoveSystemSetting);
  }

  public async onLoadSystemSetting(evt: any) {
    const { resolve } = evt.detail.params;
    resolve();
  }

  public onSaveSystemSetting(evt: any) {
    const { params, resolve } = evt.detail.params;
    resolve(false);
  }

  public onRemoveSystemSetting(evt: any) {
    const { params, resolve } = evt.detail.params;
    resolve(false);
  }

  public handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    MainModule.setWindow({
      width: window.innerWidth < MIN_WIDTH ? MIN_WIDTH : window.innerWidth,
      height: window.innerHeight < MIN_HEIGHT ? MIN_HEIGHT : window.innerHeight,
    });
  }
}
</script>
