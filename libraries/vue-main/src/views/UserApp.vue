<template>
  <TopAppBar class="moz-top-bar" ref="top" />
  <dx-drawer
    v-if="login"
    class="moz-drawer"
    :minSize="drawerMin"
    :maxSize="drawerMax"
    :opened="drawer"
    opened-state-mode="push"
    reveal-mode="slide"
    template="drawer-content"
  >
    <template #drawer-content>
      <div v-if="!drawer && menuLocation !== 'left'" className="toggle-menu">
        <i className="mozart-icons m-016_menu" @click="onToggleClick()" />
      </div>
      <MenuList></MenuList>
    </template>
    <div id="content" className="moz-contents">
      <router-view></router-view>
    </div>
  </dx-drawer>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import DxDrawer from "devextreme-vue/drawer";

import TopAppBar from "../components/UserApp/TopAppBar.vue";
import MenuList from "../components/UserApp/MenuList.vue";

import { useLayoutStore, useMenuStore, useMenuLocationStore } from "../stores/mainStore";

const menuModule = useMenuStore();
const menuLocationModule = useMenuLocationStore();
const { menuLocation } = storeToRefs(menuLocationModule);

const layout = useLayoutStore();
const { login, drawer, drawerMin, drawerMax } = storeToRefs(layout);

onBeforeMount(async () => {
  await menuModule.loadData();
});

const onToggleClick = () => {
  const element = document.getElementsByClassName("mozart-icons close-left-drawer")[0];

  element.classList.remove("close-left-drawer");
  element.classList.add("left-arrow");

  layout.setLayout({
    ...storeToRefs(layout),
    drawer: true,
  });
};

// const onClickLogo = () => {
//   console.log("logo");
// };
</script>
