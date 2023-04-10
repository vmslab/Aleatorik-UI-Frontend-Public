<template>
  <template v-if="isLoading && token"><Loader /></template>
  <template v-else-if="isError && token">Error : {{ (error as any).message }}</template>
  <template v-else>
    <input type="hidden" :value="renderType()" />
    <router-view></router-view>
    <Loader />
  </template>
</template>

<script setup lang="ts">
import { onBeforeMount, onUnmounted, watch, ref } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "vue-query";
import { isElectron, init, theme as themeData, Refresh, getCookie, removeCookie } from "@mozart-ui/common-api";
import { decodeEscapeAtob } from "@mozart-ui/common-ui";
import {
  // store
  useLayoutStore,
  usePathStore,
  useThemeStore,
  useLoadStore,
  useUserStore,
  // component
  Loader,
  // util
  setAppTheme,
} from "@mozart-ui/vue-main";
import router from "./router";

const layout = useLayoutStore();
const theme = useThemeStore();
const path = usePathStore();
const load = useLoadStore();
const user = useUserStore();

const { renderType } = storeToRefs(layout);

const handleResize = () => {
  layout.setLayout({
    ...storeToRefs(layout),
    width: window.innerWidth,
    height: window.innerHeight,
  });
};

const token = ref(decodeEscapeAtob(getCookie("refresh_token")));

if (token.value) {
  load.setLoad({ loading: true });
}

const { isLoading, isError, data, error } = useQuery(["login", token], Refresh, {
  onSuccess: result => {
    if (result && result.data && result.data.success) {
      user.setUser({
        name: result.data.userName,
        email: result.data.email,
        role: result.data.role,
      });
      layout.setLayout({
        ...storeToRefs(layout),
        login: true,
      });
    } else {
      removeCookie("refresh_token");
    }
    load.setLoad({ loading: false });
  },
  onError: (err: any) => {
    console.log(err);
    load.setLoad({ loading: true });
  },
  refetchOnWindowFocus: false,
  enabled: !!token.value,
});

onBeforeMount(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  if (isElectron) {
    const url = new URL((import.meta as any).env.VITE_GRPC_SERVER);
    init(url.host);
  }

  theme.setTheme({
    ...theme,
    themeData,
  });
  setAppTheme();
});

const routePath = () => {
  switch (renderType.value()) {
    case 2:
      if (path.path.startsWith("/user")) {
        router.push(path.path);
      } else {
        router.push("/user");
      }
      break;
    case 3:
      router.push("/dev");
      break;
    default:
      if (location.pathname !== "/") {
        path.setPath({ path: location.pathname });
        router.push("/");
      }
      break;
  }
};

watch(
  renderType.value,
  () => {
    routePath();
  },
  { immediate: true },
);

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>
