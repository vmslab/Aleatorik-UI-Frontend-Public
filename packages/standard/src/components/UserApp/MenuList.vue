<template>
  <div
    :class="{
      'moz-topleft-trigger-area': true,
      open: drawer,
    }"
  >
    <div :class="{ 'moz-left-closer': drawer }" @click="onClickLeftHider">
      <i class="mozart-icons left-arrow"></i>
    </div>
  </div>
  <div v-show="drawer">
    <div class="root-menu">
      <span v-if="!secondMenu">{{ rootMenu?.name }}</span>
      <span v-if="secondMenu">{{ secondMenu?.name }}</span>
    </div>
    <Tree
      :class="{ 'dx-left-drawer-treeview': true, 'closed-node': !drawer }"
      ref="dxListView"
      :items="[
        ...getMenuSetting.map(menu => {
          return {
            id: menu.menuId,
            parentId: menu.categoryId,
            expanded: menu.type === 'Category' ? true : false,
            name: menu.name,
            path: menu.path,
            type: menu.type,
          };
        }),
      ]"
      :root-value="menuLocation === 'topandleft' ? targetId : rootMenuId"
      mode="plat"
      class="moz-side-menu"
      :onItemClick="onItemClick"
    >
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useLayoutStore, useMenuItems, useMenuStore, useMenuLocationStore, IMenu } from "../../stores/mainStore";
import { Tree } from "@aleatorik-ui/vue-component-wijmo";
import { showConfirm } from "../../utils/dialog";

const layout = useLayoutStore();
const { drawer } = storeToRefs(layout);

const menuItemsStore = useMenuItems();
const { getMenuSetting } = storeToRefs(menuItemsStore);

const menuModule = useMenuStore();
const { targetId, rootMenuId, currentMenu, rootMenu, secondMenu, isEditing } = storeToRefs(menuModule);

const menuLocationStore = useMenuLocationStore();
const { menuLocation } = storeToRefs(menuLocationStore);

const router = useRouter();

const dxListView = ref(null);

watch(
  currentMenu,
  () => {
    nextTick(() => {
      const tree = (dxListView.value as any).tree;
      tree.selectNode(currentMenu.value?.menuId, tree.element);
    });
  },
  { immediate: true },
);

const redirectMenu = async (menu?: IMenu, params?: Record<string, any>) => {
  if (!menu) return false;
  if (menu.type === "Category") return false;
  if (!menu.path) return false;

  if (isEditing.value) {
    const result = await showConfirm({
      title: `Cancel`,
      message: `Are you sure you want to <b>Leave</b> this page?`,
    });
    if (!result) return false;
    menuModule.endEdit();
  }

  router.push({
    path: menu.path,
    params: {
      ...params,
    },
  });
  return true;
};

const onItemClick = async (e: any) => {
  if (e.itemData.type === "Category") return;

  let obj = e.itemData;

  if (!obj.menuId) {
    obj = {
      menuId: obj.id,
      name: obj.name,
      categoryId: obj.parentId,
      type: obj.type,
      path: obj.path,
    };
  }

  const isChanged = await redirectMenu(obj);
  if (isChanged) menuModule.setCurrentMenu(obj);
};

// const onHover = (e: any, item: any) => {
//   if (!drawer) {
//     let target = e.target;
//     if (e.target.nodeName === "I") target = e.target.parentElement;
//     addTooltipEvent(target, item.name as string, false, "elright");
//   }
// };

// const onMouseOut = (e: any) => {
//   if (!drawer) {
//     let target = e.target;
//     if (e.target.nodeName === "I") target = e.target.parentElement;
//     target.onmouseenter = undefined;
//   }
// };

// const onMenuItemOver = (evt: MouseEvent) => {
//   const el = evt.target as HTMLElement;
//   if (el.offsetWidth < el.scrollWidth) {
//     addTooltipEvent(el, el.innerText, false, "elright");
//   }
// };

// const onMenuItemOut = (evt: MouseEvent) => {
//   const ts = document.getElementsByClassName("tooltip");
//   if (ts && ts.length > 0) {
//     Array.from(ts).forEach(t => {
//       document.body.removeChild(t);
//     });
//   }
// };

const onClickLeftHider = (e: any) => {
  // const el = e.target as HTMLElement;
  // el.classList.add("close-left-drawer");
  // el.classList.remove("left-arrow");
  layout.setLayout({
    ...storeToRefs(layout),
    drawer: false,
  });
};

// const onToggleLeftDrawer = (e: any) => {
//   layout.setLayout({
//     ...storeToRefs(layout),
//     drawer: true,
//   });
//   const { option } = e.detail.params;
//   option.drawer = drawer;
// };

// const onGetDrawerState = (e: any) => {
//   const { option } = e.detail.params;
//   option.drawer = drawer;
//   option.menuLocation = menuLocation;
//   console.log(option);
// };
</script>
