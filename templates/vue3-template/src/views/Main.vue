<template>
  <TopAppBar class="moz-top-bar" ref="top" />
  <dx-drawer
    v-show="login"
    class="moz-left-drawer"
    :opened="drawer"
    opened-state-mode="push"
    reveal-mode="expand"
    template="drawer-content"
    :minSize="drawerMin"
    :maxSize="drawerMax"
    :animationEnabled="false"
  >
    <template #drawer-content>
      <div className="moz-side-menu">
        <MenuList></MenuList>
      </div>
    </template>
    <div id="content" className="moz-contents">
      <router-view></router-view>
    </div>
  </dx-drawer>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { TopAppBar, MenuList } from "../components";
import DxDrawer from "devextreme-vue/drawer";
import { useLayoutStore, useMenuStore } from "../stores/mainStore";

const menuModule = useMenuStore();
const layout = useLayoutStore();
const { login, drawer, drawerMin, drawerMax } = storeToRefs(layout);

onMounted(async () => {
  await menuModule.loadData();
});
</script>
