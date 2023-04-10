<template>
  <div>
    <div class="moz-top-app">
      <div class="moz-menu-location-top-top">
        <div class="drawer-logo-area">
          <img src="" alt="logo" />
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
            <div class="flex-center-horizontal">
              <div>
                {{ $t(data.name) }}
              </div>
              <div class="spacer"></div>
              <div :class="`moz-system-manage ${data.type === 'Menu' ? 'moz-menu-link' : ''}`">
                <i v-if="data.type === 'Menu'" class="moz-system-manage-icon dx-icon dx-icon-new-tab" />
                <!-- @click="onOpenNewTab($event, data)" -->
              </div>
            </div>
          </div>
        </template>
      </DxMenu>
      <div class="spacer"></div>
      <div class="moz-top-common-btn-area">
        <i
          v-if="theme.theme === 'light'"
          @click="onClickTheme('dark')"
          class="mozart-icons moz-theme-tap top-app-button"
        ></i>
        <i
          v-if="theme.theme === `dark`"
          @click="onClickTheme('light')"
          class="mozart-icons moz-theme top-app-button"
        ></i>
        <i
          v-if="theme.compact === 'normal'"
          @click="onClickCompact('compact')"
          class="mozart-icons moz-compact-normal top-app-button"
        ></i>
        <i
          v-if="theme.compact === 'compact'"
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
import { ref, onMounted, onUnmounted } from "vue";
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
} from "../../stores/mainStore";
import { setAppTheme } from "../../utils/theme";
import { useSignout } from "../../utils/user";
import { StreamingParameter } from "@aleatorik-ui/common";
import { generateGUID } from "@aleatorik-ui/common-ui";
import { ServerTime } from "@aleatorik-ui/common-api";
import { storeToRefs } from "pinia";
import { ServerTimeResponse } from "@aleatorik-ui/protos/src/generated/Protos/ServerService";
import { IMenu } from "@aleatorik-ui/common-api";
import { useRouter } from "vue-router";

const user = useUserStore();
const server = useServerStore();
const theme = useThemeStore();
const { signout } = useSignout();

const userMenus = [{ text: "SignOut", id: "logout" }];

const sessionId = generateGUID();
const serverParameter = new StreamingParameter<Record<string, any>, ServerTimeResponse>(sessionId, {});

const menuLocationStore = useMenuLocationStore();
const { menuLocation } = storeToRefs(menuLocationStore);

const menuModule = useMenuStore();
const { getMenus, currentMenuId, getTreeMenus } = storeToRefs(menuModule);

const menuItems = useMenuItems();
const router = useRouter();

onMounted(async () => {
  const router = useRouter();
  const current = menuItems.items.find(t => t.menuId === router.currentRoute.value.meta?.id)!;
  menuModule.setCurrentMenu(current);

  serverParameter.onRecived = param => {
    server.setServer({
      time: dayjs(param.time),
    });
  };
  await ServerTime(serverParameter);
});

onUnmounted(() => {
  serverParameter.isComplate = true;
});

const redirectMenu = (menu?: IMenu, params?: Record<string, any>) => {
  if (!menu) return;
  if (menu.categoryId === "Category") return;
  if (!menu.path) return;
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
  theme.setTheme({
    ...theme,
    theme: t,
  });
  setAppTheme();
};
const onClickCompact = (c: "normal" | "compact") => {
  theme.setTheme({
    ...theme,
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

const onItemleftClick = (e: any) => {
  console.log(e);
};

const onItemClickSub = (evt: any, data: any) => {
  if (evt.which !== 2) return;
  if (data.type !== "Menu") return;

  onOpenNewTab(evt, data);
};

const onOpenNewTab = (e: any, selectItem?: any) => {
  e.preventDefault();
  e.stopPropagation();
};
</script>
