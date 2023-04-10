<template>
  <div>
    <dx-drawer
      class="moz-drawer"
      :minSize="70"
      :maxSize="256"
      :opened="drawer"
      opened-state-mode="push"
      reveal-mode="slide"
      template="drawer-content"
    >
      <template #drawer-content>
        <div class="moz-side-menu">
          <div
            class="side-top-area"
            :style="`
              width: ${drawerMax}px;
            `"
          >
            <div class="toggle-menu">
              <i class="mozart-icons m-016_menu drawer-toggle-icon" @click="onToggleClick()" />
            </div>
            <div class="drawer-logo-area">
              <img v-if="drawer" />
            </div>
          </div>
          <dx-list
            :data-source="items"
            :height="height"
            :onItemClick="onItemClick"
            :hover-state-enabled="true"
            :focus-state-enabled="true"
            page-load-mode="scrollBottom"
          >
            <template #item="{ data: item }">
              <div class="menu-list">
                <span>{{ item.name }}</span>
              </div>
            </template>
          </dx-list>
        </div>
      </template>
      <div id="content" class="moz-contents">
        <TopAppBar ref="top" />
        <router-view></router-view>
      </div>
    </dx-drawer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxDrawer } from "devextreme-vue/drawer";
import TopAppBar from "../views/TopAppBar.vue";

import { MainModule } from "@/store/modules/mainStore";
import { DxList } from "devextreme-vue/list";
import { RouteRecordPublic } from "vue-router";

@Component({
  components: {
    TopAppBar,
    DxDrawer,
    DxList,
  },
})
export default class SideApp extends Vue {
  public rootMenuTitle: string = "";

  constructor() {
    super();
  }

  public get drawer(): boolean {
    return MainModule.getDrawer;
  }

  public get drawerMax(): number {
    return MainModule.drawerMax;
  }

  public set drawer(value: boolean) {
    MainModule.setDrawer(value);
  }

  public get height(): number {
    return MainModule.getHeight;
  }

  public get logedOn(): boolean {
    return MainModule.getLogedOn;
  }

  public get userName(): string | null {
    return MainModule.getName;
  }

  public get items(): RouteRecordPublic[] {
    return this.$router.getRoutes();
  }

  public onToggleClick() {
    MainModule.toggle();
  }

  public onRootClick(item: any) {
    this.rootMenuTitle = item.NAME;
  }

  public onItemClick(item: any) {
    this.$router.push(
      {
        path: item.itemData.path || "/",
      },
      () => {
        //
      },
      (err: Error) => {
        // console.log(err);
      },
    );
  }
}
</script>
<style lang="scss" scoped>
.menu-list {
  width: inherit;
  padding-left: var(--size-padding2);
  color: var(--color-font5);

  &:hover {
    background-color: var(--color-secondary);
  }
  span {
    display: table-cell;
    vertical-align: middle;
  }
}
</style>
