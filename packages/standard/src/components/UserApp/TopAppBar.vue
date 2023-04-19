<template>
  <div>
    <div class="moz-top-app">
      <div class="drawer-logo-area">
        <router-link :to="`/${systemId}`">
          <img :src="getImgSrc()" alt="mozart cloud logo" />
        </router-link>
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
              <div>{{ $t(data.name) }}</div>
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
            <div>{{ $t(data.name) }}</div>
            <div :class="`moz-system-manage ${data.type === 'Menu' ? 'moz-menu-link' : ''}`">
              <i
                v-if="data.type === 'Menu'"
                class="moz-system-manage-icon dx-icon dx-icon-new-tab"
                @click="onOpenNewTab($event, data)"
              />
            </div>
          </div>
        </template>
      </DxMenu>

      <div class="spacer"></div>

      <div class="user-info-area">
        <button class="top-menu-button" @click="hasNotification = !hasNotification">
          <!-- alarm with red dot icon -->
          <svg v-if="hasNotification" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <g transform="translate(0 .226)">
              <path data-name="사각형 424" transform="translate(0 -.226)" style="fill: none" d="M0 0h20v20H0z" />
              <path
                d="M12.494 22.494A2.5 2.5 0 0 0 14.989 20H10a2.494 2.494 0 0 0 2.494 2.494z"
                transform="translate(-2 -3.128)"
                style="fill: #8998b5"
              />
              <path
                data-name="빼기 4"
                d="M-3755.1-2419.6h-16a.9.9 0 0 1-.9-.9v-1a.9.9 0 0 1 .263-.637l1.737-1.736v-3.979a7.994 7.994 0 0 1 1.333-4.571 6.406 6.406 0 0 1 3.853-2.623 7.609 7.609 0 0 1 1.714-.182 8.064 8.064 0 0 1 1.69.176h.018a6.566 6.566 0 0 1 1.843.742 4.823 4.823 0 0 0-1.875 1.116 4.746 4.746 0 0 0-.376-.105 6.171 6.171 0 0 0-1.3-.135 5.9 5.9 0 0 0-1.281.13h-.012c-2.348.557-3.807 2.643-3.807 5.444v4.352a.907.907 0 0 1-.263.636l-1.464 1.463h13.654l-1.463-1.463a.894.894 0 0 1-.263-.636v-1.43a4.762 4.762 0 0 0 1.8-.391v1.448l1.737 1.736a.9.9 0 0 1 .263.637v1a.9.9 0 0 1-.901.908zm-2.9-7.13v-1.121a5.74 5.74 0 0 0-1.75-4.382 2.985 2.985 0 0 1 1.649-.494 3.022 3.022 0 0 1 .352.021 7.835 7.835 0 0 1 1.548 4.856v.445a2.971 2.971 0 0 1-1.8.677z"
                transform="translate(3773.1 2435.5)"
                style="fill: #8998b5"
              />
              <circle data-name="타원 202" cx="3" cy="3" r="3" transform="translate(12 2.774)" style="fill: #cb5353" />
            </g>
          </svg>

          <!-- alarm icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path data-name="사각형 424" style="fill: none" d="M0 0h20v20H0z" />
            <path
              d="M12.494 22.494A2.5 2.5 0 0 0 14.989 20H10a2.494 2.494 0 0 0 2.494 2.494z"
              transform="translate(-2 -2.902)"
              style="fill: #8998b5"
            />
            <path
              data-name="빼기 4"
              d="M-3755.1-2419.6h-16a.9.9 0 0 1-.9-.9v-1a.9.9 0 0 1 .263-.636l1.737-1.736v-3.979a7.989 7.989 0 0 1 1.333-4.571 6.4 6.4 0 0 1 3.853-2.623 7.509 7.509 0 0 1 1.714-.182 8.01 8.01 0 0 1 1.69.177h.018c3.154.75 5.192 3.574 5.192 7.2v3.979l1.737 1.736a.9.9 0 0 1 .263.636v1a.9.9 0 0 1-.9.899zm-14.827-1.8h13.654l-1.464-1.464a.9.9 0 0 1-.263-.636v-4.352c0-2.8-1.456-4.881-3.8-5.442a6.211 6.211 0 0 0-1.3-.134 5.924 5.924 0 0 0-1.28.129h-.012c-2.349.557-3.808 2.643-3.808 5.444v4.352a.9.9 0 0 1-.263.636z"
              transform="translate(3773.1 2435.726)"
              style="fill: #8998b5"
            />
          </svg>
        </button>
        <button class="top-menu-button" id="user-menu-top">
          <i class="mozart-icons icon-user"></i>
        </button>
      </div>

      <DxContextMenu
        :data-source="userMenus"
        :width="200"
        css-class="moz-user-context"
        target="#user-menu-top"
        show-event="click"
        @item-click="itemClick"
        :position="{
          at: 'top left',
          boundary: '#app',
          boundaryOffset: '0 40',
        }"
      >
        <template #item="{ data }">
          <div v-if="data.id == 'header'">
            <div class="user-name">
              {{ user.name }}
            </div>
            <div class="user-email">
              {{ user.email }}
            </div>
          </div>
          <div v-else class="menu-item">
            <i
              class="mozart-icons"
              :class="{
                [data.css]: !!data.css,
              }"
            ></i>
            <span>{{ $t(data.text) }}</span>
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
import { useTranslation } from "i18next-vue";
import { StreamingParameter } from "@aleatorik-ui/common";
import { ServerTime } from "@aleatorik-ui/common-api";

// dev func
const hasNotification = ref(false);

const sessionId = generateGUID();
const serverParameter = new StreamingParameter<Record<string, any>, any>(sessionId, {});

const user = useUserStore();
const server = useServerStore();
const themeModule = useThemeStore();
const { signout } = useSignout();

const { theme, compact } = storeToRefs(themeModule);
const { t } = useTranslation();

const userMenus = [
  { text: t("UserInfo"), id: "header" },
  { text: t("기준 정보 관리"), id: "manage_base_info", css: "password" },
  { text: t(`ChangeUserInfo`), id: "info", css: "user-setting" },
  { text: t("menu_setting"), id: "setting", css: "setting" },
  { text: t(`Logout`), id: "logout", css: "logout" },
];

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
</script>
