<template>
  <div>
    <div class="moz-top-app">
      <div class="moz-menu-location-top-top">
        <div class="drawer-logo-area">
          <img :src="getImgSrc()" alt="logo" @click="onClickLogo" />
        </div>
      </div>
      <DxMenu
        class="moz-top-menu"
        css-class="moz-top-menu-sub"
        :items="menuLocation === 'topandleft' ? getMenus : getTreeMenus"
        :hide-submenu-on-mouse-leave="false"
        :show-first-submenu-mode="{
          delay: {
            show: 0,
            hide: 0,
          },
          name: 'onHover',
        }"
        :show-submenu-mode="{
          delay: {
            show: 0,
            hide: 0,
          },
          name: 'onHover',
        }"
        :active-state-enabled="false"
        :focus-state-enabled="false"
        orientation="horizontal"
        key-expr="menuId"
        expanded-expr="expanded"
        :select-by-click="true"
        selection-mode="single"
        :animation="null"
        @item-click="onItemClick"
        item-template="item"
      >
        <template v-if="menuLocation === 'topandtree'" #item="{ data }">
          <div class="moz-top-menu-item">
            <div class="flex-center-horizontal">
              <div>
                {{ $t(data.name) }}
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="menuLocation === 'topandleft'" #item="{ data }">
          <div
            :class="
              [data.selectedCategory ? 'selected-category' : '', data.selectedRoot ? 'moz-selected-menu' : ``].join(' ')
            "
            @mousedown="onItemClickSub($event, data)"
          >
            <!-- [
              data.selectedCategory ? 'selected-category' : '',
              rootMenuId === data.menuId ? 'moz-selected-menu' : ``,
            ].join(' ') -->
            <div class="flex-center-horizontal">
              <div>{{ $t(data.name) }}</div>
              <div class="spacer"></div>
              <div :class="`moz-system-manage ${data.type === 'Menu' ? 'moz-menu-link' : ''}`">
                <i
                  v-if="data.type === 'Menu'"
                  class="moz-system-manage-icon dx-icon dx-icon-new-tab"
                  @click="onOpenNewTab($event, data)"
                />
              </div>
            </div>
          </div>
        </template>
      </DxMenu>
      <div class="spacer"></div>
      <div class="moz-top-common-btn-area">
        <i v-if="theme === 'light'" @click="onClickTheme('dark')" class="mozart-icons moz-theme-tap top-app-button"></i>
        <i v-if="theme === `dark`" @click="onClickTheme('light')" class="mozart-icons moz-theme top-app-button"></i>
        <i
          v-if="compact === 'normal'"
          @click="onClickCompact('compact')"
          class="mozart-icons moz-compact-normal top-app-button"
        ></i>
        <i
          v-if="compact === 'compact'"
          @click="onClickCompact('normal')"
          class="mozart-icons moz-compact top-app-button"
        ></i>
      </div>
      <div class="moz-user-info">
        <div class="flex-center-horizontal">
          <span class="moz-body-02" style="font-weight: 700">{{ user.name }}</span>
          <span class="moz-body-03 moz-color-font4 nowrap-text" style="margin-left: 16px; font-weight: 400">
            {{ server.time.format("MMM-DD HH:mm") }}
          </span>
        </div>
        <div class="moz-body-03 moz-color-font5 nowrap-text" style="white-space: nowrap">
          {{ user.email }}
        </div>
      </div>
      <div class="mozart-icons moz-top-user-menu" id="user-menu"></div>
      <DxContextMenu
        :data-source="userMenus"
        :width="200"
        css-class="moz-user-context"
        target="#user-menu"
        show-event="click"
        @item-click="itemClick"
      >
        <template #item="{ data }">
          <div class="menu-item">
            <span>{{ data.text }}</span>
          </div>
        </template>
      </DxContextMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import dayjs from "dayjs";
import DxContextMenu from "devextreme-vue/context-menu";
import DxMenu from "devextreme-vue/menu";
import {
  useUserStore,
  useServerStore,
  useThemeStore,
  useMenuLocationStore,
  useMenuStore,
  useMenuItems,
  IMenu,
} from "../../stores/mainStore";
import { setAppTheme } from "../../utils/theme";
import { useSignout } from "../../utils/user";
import { generateGUID } from "@aleatorik-ui/common-ui";
import { useRouter } from "vue-router";
import { showConfirm } from "../../utils/dialog";
import { systemId } from "../../utils/env";

const user = useUserStore();
const server = useServerStore();
const themeModule = useThemeStore();
const { signout } = useSignout();

const { theme, compact } = storeToRefs(themeModule);

const userMenus = [{ text: "SignOut", id: "logout" }];

const sessionId = generateGUID();
// const serverParameter = new StreamingParameter<Record<string, any>, ServerTimeResponse>(sessionId, {});

const menuLocationStore = useMenuLocationStore();
const { menuLocation } = storeToRefs(menuLocationStore);

const menuModule = useMenuStore();
const { getMenus, currentMenuId, rootMenuId, getTreeMenus, isEditing } = storeToRefs(menuModule);

const menuItems = useMenuItems();
const router = useRouter();

onMounted(async () => {
  const router = useRouter();
  // const current = menuItems.items.find(t => t.menuId === router.currentRoute.value.meta?.id)!;
  const current = menuItems.items.find(t => t.path === router.currentRoute.value.path)!;
  menuModule.setCurrentMenu(current);

  // serverParameter.onRecived = param => {
  //   server.setServer({
  //     time: dayjs(param.time),
  //   });
  // };
  // await ServerTime(serverParameter);
});

onUnmounted(() => {
  // serverParameter.isComplate = true;
});

const getImgSrc = () => {
  if (theme.value === "dark") {
    return new URL("../../assets/logo_wh_menu.png", import.meta.url).href;
  } else {
    return new URL("../../assets/logo_de_menu.png", import.meta.url).href;
  }
};

const redirectMenu = async (menu?: IMenu, params?: Record<string, any>) => {
  if (!menu) return;
  if (menu.categoryId === "Category") return;
  if (!menu.path) return;

  if (isEditing.value) {
    const result = await showConfirm({
      title: `Cancel`,
      message: `Are you sure you want to <b>Leave</b> this page?`,
    });
    if (!result) return;
    menuModule.endEdit();
  }

  router.push({
    path: menu.path,
    params: {
      ...params,
    },
  });
};

const itemClick = async (e: any) => {
  const id = e.itemData.id;
  if (id === "logout") {
    await signout.value();
  }
};

const onClickTheme = (t: "light" | "dark") => {
  themeModule.setTheme({
    ...themeModule,
    theme: t,
  });
  setAppTheme();
};
const onClickCompact = (c: "normal" | "compact") => {
  themeModule.setTheme({
    ...themeModule,
    compact: c,
  });
  setAppTheme();
};

const onItemClick = (e: any) => {
  if (menuLocation.value === "topandtree") {
    menuModule.changeRootMenu(e.itemData);
  } else if (menuLocation.value === "topandleft") {
    if (e.itemData.type === "Category" || e.itemData.menuId === currentMenuId) return;
    menuModule.setCurrentMenu(e.itemData);
  }
  redirectMenu(e.itemData);
};

const onItemClickSub = (evt: any, data: any) => {
  if (evt.which !== 2) return;
  if (data.type !== "Menu") return;

  onOpenNewTab(evt, data);
};

const onOpenNewTab = (e: any, selectItem?: any) => {
  window.open(selectItem.path);
  e.preventDefault();
  e.stopPropagation();
};

const onClickLogo = () => {
  router.push(`/${systemId}`);
};
</script>
