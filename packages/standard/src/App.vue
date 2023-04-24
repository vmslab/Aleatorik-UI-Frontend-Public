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
import debounce from 'lodash/debounce';
import { onBeforeMount, onMounted, onUnmounted, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useQuery } from 'vue-query';
import { isElectron, init, theme as themeData, Refresh, getCookie, removeCookie } from '@aleatorik-ui/common-api';
import { decodeEscapeAtob } from '@aleatorik-ui/common-ui';
import Loader from './components/Loader.vue';
import {
  useLayoutStore,
  usePathStore,
  useThemeStore,
  useLoadStore,
  useUserStore,
  useMenuLocationStore,
  useMenuStore
} from './stores/mainStore';
import { setAppTheme } from './utils/theme';
import router from './router';
import { systemPath } from './router/index';

const layout = useLayoutStore();
const theme = useThemeStore();
const path = usePathStore();
const load = useLoadStore();
const user = useUserStore();
const menuLocation = useMenuLocationStore();
const menu = useMenuStore();

const { renderType } = storeToRefs(layout);
const { isEditing } = storeToRefs(menu);

const handleResize = debounce(() => {
  layout.setLayout({
    ...storeToRefs(layout),
    width: window.innerWidth,
    height: window.innerHeight
  });
}, 200);

onBeforeMount(() => {
  menuLocation.setMenuLocation('topandleft');
  window.addEventListener('resize', handleResize);
  window.addEventListener('beforeunload', onBeforeUnload);
});

onMounted(() => {});

const onBeforeUnload = (evt: any) => {
  if (!isEditing.value) return;
  evt.preventDefault();
  evt.returnValue = '';
};

const token = ref(decodeEscapeAtob(getCookie('refresh_token')));

if (token.value) {
  load.setLoad({ loading: true });
}

const { isLoading, isError, data, error } = useQuery(['login', token], Refresh, {
  onSuccess: result => {
    if (result && result.data && result.data.success) {
      user.setUser({
        name: result.data.userName,
        email: result.data.email,
        role: result.data.role
      });
      layout.setLayout({
        ...storeToRefs(layout),
        login: true
      });
    }
    load.setLoad({ loading: false });
  },
  onError: (err: any) => {
    console.log(err);
    load.setLoad({ loading: true });
  },
  refetchOnWindowFocus: false,
  enabled: !!token.value
});

const setTheme = () => {
  if (isElectron) {
    const url = new URL((import.meta as any).env.VITE_GRPC_SERVER);
    init(url.host);
  }

  // TODO: 다크 모드 작업 후 이 코드 주석 해제 할것.
  // 브라우저 설정에 따라 라이트/다크모드 변경
  // theme.theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  theme.theme = 'light';

  theme.setTheme({
    ...theme,
    themeData
  });
  setAppTheme();
};

const routePath = async () => {
  switch (renderType.value()) {
    case 1:
      if (path.path.startsWith(`${systemPath}`)) {
        router.push(path.path);
      } else {
        // router.push("/main");
        router.push(`${systemPath}/main`);
      }
      break;
    default:
      if (location.pathname !== `/`) {
        path.setPath({ path: `${location.pathname}` });
        router.push(`/`);
      }
      break;
  }
};

watch(
  renderType.value,
  () => {
    handleResize();
    setTheme();
    routePath();
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>
