<template>
  <dx-drawer
    v-if="login"
    class="moz-drawer"
    :minSize="DRAWER_MIN"
    :maxSize="DRAWER_MAX"
    :opened="drawer"
    opened-state-mode="push"
    reveal-mode="slide"
    template="drawer-content"
  >
    <template #drawer-content>
      <div className="moz-side-menu">
        <div className="side-top-area">
          <div className="toggle-menu">
            <i className="mozart-icons m-016_menu" @click="onToggleClick()" />
          </div>
          <div v-if="drawer" className="drawer-logo-area" @click="onClickLogo">Logo</div>
        </div>
        <MenuList></MenuList>
      </div>
    </template>
    <div id="content" className="moz-contents">
      <TopAppBar class="moz-top-bar" ref="top" />
      <router-view></router-view>
    </div>
  </dx-drawer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import DxDrawer from "devextreme-vue/drawer";
import { DRAWER_MAX, DRAWER_MIN } from "@mozart-ui/common-ui";

import { useLayoutStore, TopAppBar, MenuList } from "@mozart-ui/vue-main";

const layout = useLayoutStore();
const { login, drawer } = storeToRefs(layout);

const onToggleClick = () => {
  layout.setLayout({
    ...storeToRefs(layout),
    drawer: !layout.drawer,
  });
};

const onClickLogo = () => {
  console.log("logo");
};
</script>
