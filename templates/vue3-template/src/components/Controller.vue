<template>
  <div class="moz-controller-root">
    <div class="moz-controller">
      <div
        v-if="
          !layout.drawer && (menuLocation.menuLocation === 'topandleft' || menuLocation.menuLocation === 'topandtree')
        "
        class="moz-left-toggle-icon"
        @click="onClickToggleDrawer"
      ></div>
      <div class="moz-controller-title">
        <template v-for="(t, i) in title">
          <template v-if="title.length - 1 === i">
            <span :style="menuLocation.menuLocation === 'left' ? '' : 'color: var(--color-accent);'">
              {{ t }}
            </span>
          </template>
          <template v-else>
            <span style="font-weight: normal; margin-right: 4px">{{ `${t} / ` }}</span>
          </template>
        </template>
        <slot name="title"></slot>
      </div>
      <template v-if="filterObj">
        <template v-for="(key, i) in Object.keys(filterObj)">
          <div class="moz-controller-filter">
            <span class="moz-controller-filter-key">{{ key }}</span>
            <span class="moz-controller-filter-value">{{ filterObj[key] }}</span>
          </div>
        </template>
      </template>
      <div class="spacer"></div>
      <div class="moz-controller-actions">
        <slot></slot>
      </div>
    </div>
    <div v-if="showFilter" class="moz-horizontal-filter" ref="filter">
      <slot name="filter"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onUnmounted, computed, watch, toRefs, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { resizeVerticalSize } from "../utils/themeSet";
import { useTranslation } from "i18next-vue";
import { useLayoutStore, useMenuLocationStore } from "../stores/mainStore";
import { useRouter } from "vue-router";
import { EventBus } from "@mozart-ui/common-ui";
import debounce from "lodash/debounce";

const layout = useLayoutStore();
const menuLocation = useMenuLocationStore();
const router = useRouter();

// interface Props {
//   height?: number;
//   showFilter: boolean;
//   setControlHeight?: (value: number) => void;
//   filterObj?: Record<string, any>;
// }
// const { height = 66, showFilter = false, setControlHeight, filterObj } = defineProps<Props>();

const { t } = useTranslation();
const props = defineProps({
  height: { type: Number, default: 66 },
  setControlHeight: { type: Function, required: false },
  filterObj: { type: Object, required: false },
  showFilter: { type: Boolean, default: false },
});
const { height, showFilter, setControlHeight, filterObj } = toRefs(props);

watch([showFilter], () => {
  nextTick(() => {
    resizeLayout(true);
    EventBus.fire("horizontal-filter-toggle");
  });
});

// const observer: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
//   resizeLayout(true);
//   EventBus.fire("horizontal-filter-toggle");
// });
const filter = ref();
const title = computed(() => {
  const navis = (router.currentRoute.value.meta.navis as any[]) || [];
  if (
    (navis && navis.length > 0 && menuLocation.menuLocation === "top") ||
    menuLocation.menuLocation === "topandleft" ||
    menuLocation.menuLocation === "topandtree"
  ) {
    let result: string[] = [];
    navis.reverse().forEach((element, index) => {
      result.push(t(element) as string);
    });
    return result;
  } else if (menuLocation.menuLocation === "left" && navis && navis.length > 0) {
    return [t(navis[0]) as string];
  }
  return [];
});

const resizeLayout = (zero: boolean = false) => {
  const filterEl = filter.value as HTMLElement;
  if (filterEl) {
    resizeVerticalSize(filterEl.clientHeight);
  } else {
    if (zero) {
      resizeVerticalSize(0);
    }
  }
};

const onClickToggleDrawer = () => {
  layout.setLayout({
    ...storeToRefs(layout),
    drawer: true,
  });
};

const onThemeChanged = (evt: any) => {
  resizeLayout();
};

const onToggleDrawer = () => {
  // drawer = false;
  layout.setLayout({
    ...storeToRefs(layout),
    drawer: false,
  });
};

onBeforeMount(() => {
  EventBus.register("theme-changed", onThemeChanged);

  if (setControlHeight?.value) {
    setControlHeight.value(height.value);
  }
});

const handleResize = debounce(() => resizeLayout(true), 200);

onMounted(() => {
  resizeLayout();
  window.addEventListener("resize", handleResize);

  // if (filter.value) {
  //   observer.observe(filter.value as Element);
  // }
});

onUnmounted(() => {
  EventBus.remove("theme-changed", onThemeChanged);
  window.removeEventListener("resize", handleResize);
  // if (observer) {
  //   observer.disconnect();
  // }
});
</script>
