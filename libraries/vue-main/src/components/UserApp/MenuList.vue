<template>
  <div class="moz-topleft-trigger-area open">
    <div class="moz-left-closer" @click="onClickLeftHider">
      <i class="mozart-icons left-arrow"></i>
    </div>
  </div>
  <div v-if="drawer">
    <div class="root-menu">
      <span v-if="!secondMenu">{{ rootMenu?.name }}</span>
      <span v-if="secondMenu">{{ secondMenu?.name }}</span>
    </div>
    <Tree
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
      class="moz-drawer"
      :onItemClick="onItemClick"
    >
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DxTreeView } from "devextreme-vue/ui/tree-view";
import { useLayoutStore, useMenuItems, useMenuStore, useMenuLocationStore } from "../../stores/mainStore";
import { addTooltipEvent } from "@mozart-ui/common-ui";
import { menus, IMenu } from "@mozart-ui/common-api";
import { Tree } from "@mozart-ui/vue-component";

const layout = useLayoutStore();
const { drawer } = storeToRefs(layout);

const menuItemsStore = useMenuItems();
const { getMenuSetting } = storeToRefs(menuItemsStore);

const menuModule = useMenuStore();
const { targetId, rootMenuId, currentMenu, rootMenu, secondMenu } = storeToRefs(menuModule);

const menuLocationStore = useMenuLocationStore();
const { menuLocation } = storeToRefs(menuLocationStore);

const router = useRouter();

const dxListView = ref(null);

watch(currentMenu, () => {
  setTimeout(() => {
    const tree = (dxListView.value as any).tree;
    tree.selectNode(currentMenu.value?.menuId, tree.element);
  }, 0);
});

const redirectMenu = (menu?: IMenu, params?: Record<string, any>) => {
  if (!menu) return;
  if (menu.type === "Category") return;
  if (!menu.path) return;
  router.push({
    path: menu.path,
    params: {
      ...params,
    },
  });
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

  menuModule.setCurrentMenu(obj);
  redirectMenu(obj);
};

const onHover = (e: any, item: any) => {
  if (!drawer) {
    let target = e.target;
    if (e.target.nodeName === "I") target = e.target.parentElement;
    addTooltipEvent(target, item.name as string, false, "elright");
  }
};

const onMouseOut = (e: any) => {
  if (!drawer) {
    let target = e.target;
    if (e.target.nodeName === "I") target = e.target.parentElement;
    target.onmouseenter = undefined;
  }
};

const onMenuItemOver = (evt: MouseEvent) => {
  const el = evt.target as HTMLElement;
  if (el.offsetWidth < el.scrollWidth) {
    addTooltipEvent(el, el.innerText, false, "elright");
  }
};

const onMenuItemOut = (evt: MouseEvent) => {
  const ts = document.getElementsByClassName("tooltip");
  if (ts && ts.length > 0) {
    Array.from(ts).forEach(t => {
      document.body.removeChild(t);
    });
  }
};

const onClickLeftHider = (e: any) => {
  const el = e.target as HTMLElement;

  el.classList.add("close-left-drawer");
  el.classList.remove("left-arrow");

  layout.setLayout({
    ...storeToRefs(layout),
    drawer: false,
  });
};
</script>
