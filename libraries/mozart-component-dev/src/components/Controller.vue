<template>
  <div class="moz-controller-root">
    <div class="moz-controller">
      <div
        v-if="!drawer && (menuLocation === 'topandleft' || menuLocation === 'topandtree')"
        class="moz-left-toggle-icon"
        @click="onClickToggleDrawer"
      ></div>
      <div class="moz-controller-title">
        <slot name="breadcrumb">
          <template v-for="(t, i) in title">
            <template v-if="title.length - 1 === i">
              <span :style="option.menuLocation === 'left' ? '' : 'color: var(--color-accent);'">
                {{ t }}
              </span>
            </template>
            <template v-else>
              <span style="font-weight: normal; margin-right: 4px">{{ `${t} / ` }}</span>
            </template>
          </template>
        </slot>
        <slot name="title"></slot>
      </div>
      <template v-if="filterObj">
        <template v-for="(key, i) in Object.keys(filterObj)">
          <div class="moz-controller-filter">
            <span class="moz-controller-filter-key">{{ key }}</span>
            <span class="moz-controller-filter-value">{{ filterObj[key] }}</span>
          </div>
        </template>
      </template>
      <div class="spacer"></div>
      <div class="moz-controller-actions">
        <slot></slot>
      </div>
    </div>
    <div v-if="showFilter" class="moz-horizontal-filter" ref="filter">
      <slot name="filter"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { BaseStore } from "../store/modules/baseStore";
import { EventBus, resizeVerticalSize } from "mozart-common";

@Component({
  name: "Contoller",
  components: {
    DxButton,
  },
})
export default class Contoller extends Vue {
  /**
   * BaseSotre를 상속한 vuex store입니다.
   */
  @Prop({ type: Object }) public module?: BaseStore<any>;
  /**
   * 높이 입니다.
   */
  @Prop({ type: Number, default: 66 }) height!: number;
  /**
   * 새로고침 버튼 표시 여부 입니다.
   */
  @Prop({ type: Boolean, default: false }) public showRefresh?: boolean;
  /**
   * 외부의 Control Height Setting 함수 입니다.
   */
  @Prop({ type: Function, required: false }) public setControlHeight?: (value: number) => void;
  /**
   * Filter 값 입니다.
   */
  @Prop({ type: Object, required: false }) public filterObj?: Record<string, any>;
  /**
   * Filter 보이기 여부 입니다.
   */
  @Prop({ type: Boolean, default: false }) public showFilter!: boolean;

  //public filter: boolean = this.showFilterAlways;
  public filterHeight: number = 0;
  public gridMenu: boolean = false;
  public excel: boolean = false;
  public filterString: string = "";
  public navis: string[] = [];
  public drawer: boolean = false;
  public menuLocation: string = "";
  public option: Record<string, any> = {};

  public initialControlHeight: number = 0;

  public observer: ResizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      this.resizeLayout(true);
      EventBus.fire("horizontal-filter-toggle");
    },
  );

  constructor() {
    super();
  }

  public created() {
    EventBus.register("theme-changed", this.onThemeChanged);
    EventBus.register("close-left-drawer", this.onToggleDrawer);
    if (this.setControlHeight) {
      this.setControlHeight(this.height);
    }
  }

  public mounted() {
    this.refresh();
    this.resizeLayout();
    EventBus.fire("get-drawer-state", { params: { option: this.option } });
    this.drawer = this.option.drawer;

    this.menuLocation = this.option.menuLocation;
    if (this.$refs.filter) {
      this.observer.observe(this.$refs.filter as Element);
    }

    EventBus.fire("get-options", { params: { options: this.option } });
    if (this.option.params && this.option.params.menutype === "Popup") this.drawer = true;
  }

  public beforeDestroy() {
    EventBus.remove("theme-changed", this.onThemeChanged);
    EventBus.remove("close-left-drawer", this.onToggleDrawer);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  public refresh() {
    EventBus.fire("get-navis", { params: { navis: this.navis, option: this.option } });
  }

  public get loading(): boolean {
    if (this.module) {
      return this.module.isLoading;
    }
    return false;
  }

  public get title(): string[] {
    if (
      (this.navis && this.navis.length > 0 && this.option.menuLocation === "top") ||
      this.option.menuLocation === "topandleft" ||
      this.option.menuLocation === "topandtree"
    ) {
      let result: string[] = [];
      this.navis.reverse().forEach((element, index) => {
        result.push(this.$t(element) as string);
      });
      return result;
    } else if (this.option.menuLocation === "left" && this.navis && this.navis.length > 0) {
      return [this.$t(this.navis[0]) as string];
    }
    return [];
  }

  // @Watch("showFilter", { immediate: true })
  // public onShowFilterChanged(newVal: boolean) {
  //   this.$nextTick(() => {
  //     this.resizeLayout(true);
  //     // TODO: 다른 방법은 없을까?...
  //     EventBus.fire("horizontal-filter-toggle");
  //   });
  // }

  public resizeLayout(zero: boolean = false) {
    const filter = this.$refs.filter as HTMLElement;
    if (filter) {
      resizeVerticalSize(filter.clientHeight);
    } else {
      if (zero) {
        resizeVerticalSize(0);
      }
    }
  }

  public onRefreshClick() {
    /**
     * 새로고침 버튼 클릭 이벤트 입니다.
     */
    this.$emit("refreshClick");
  }

  public onClickToggleDrawer() {
    EventBus.fire("open-left-drawer", { params: { option: this.option } });
    this.drawer = this.option.drawer;
  }

  public onThemeChanged(evt: any) {
    this.resizeLayout();
  }

  public onToggleDrawer() {
    this.drawer = false;
  }

  // public render(h: CreateElement): VNode {
  //   const children: VNode[] = [];
  //   let titleBlock: any[] = [];

  //   this.title.forEach((t, i) => {
  //     if (this.title.length - 1 === i) {
  //       const fontStyle = this.option.menuLocation === "left" ? "" : "color:var(--color-accent)";
  //       titleBlock.push(h("span", { style: fontStyle }, t));
  //     } else {
  //       titleBlock.push(h("span", t + " / "));
  //     }
  //   });

  //   children.push(h("div", { class: "moz-controller-title" }, [titleBlock]));

  //   if (this.filterObj) {
  //     for (const key of Object.keys(this.filterObj)) {
  //       children.push(
  //         h(
  //           "div",
  //           {
  //             class: "moz-controller-filter",
  //           },
  //           [
  //             h("span", { class: "moz-controller-filter-key" }, this.$t(key) as string),
  //             h("span", { class: "moz-controller-filter-value" }, this.filterObj[key]),
  //           ],
  //         ),
  //       );
  //     }
  //   }

  //   children.push(h("div", { class: "spacer" }));

  //   const defaultSlot = this.$slots.default;
  //   const buttons = [];
  //   if (defaultSlot && defaultSlot.length > 0) {
  //     buttons.push(...defaultSlot);
  //   }

  //   if (this.showRefresh) {
  //     buttons.push(
  //       h(DxButton, {
  //         props: {
  //           icon: "refresh",
  //           loading: this.loading,
  //         },
  //         on: {
  //           click: this.onRefreshClick,
  //         },
  //         directives: [
  //           {
  //             name: "tooltip",
  //             value: { text: this.$t("Refresh") },
  //           },
  //         ],
  //       }),
  //     );
  //   }

  //   children.push(h("div", { class: "moz-controller-actions" }, buttons));

  //   return h("div", { class: "moz-controller" }, children);
  // }
}
</script>
