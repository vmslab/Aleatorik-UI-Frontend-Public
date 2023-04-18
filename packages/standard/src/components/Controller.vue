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
        <template v-for="(t, i) in title" :key="i">
          <template v-if="title.length - 1 === i">
            <span
              :class="{
                accent: menuLocation.menuLocation !== 'left',
              }"
            >
              {{ t }}
            </span>
          </template>
          <template v-else>
            <span>{{ t }}</span>
            <span class="breadcrumb-dividor"></span>
          </template>
        </template>
        <slot name="favorite">
          <button class="favorite-icon title-icon" v-tooltip="{ text: $t('즐겨찾기') }">
            <i class="mozart-icons icon-favorite" />
          </button>
        </slot>
        <slot name="title"></slot>
      </div>

      <div class="spacer"></div>
      <div class="moz-controller-actions">
        <button class="filter-icon title-icon" @click="showFilter = !showFilter" v-if="showFilterButton">
          <i
            v-tooltip="{ text: showFilter ? $t('HideFilter') : $t('ShowFilter') }"
            class="mozart-icons"
            :class="{
              'icon-table-filter-off': !showFilter,
              'icon-table-filter-on': showFilter,
            }"
          />
        </button>

        <div class="spacer" v-if="showFilterButton" />

        <Button
          v-for="(action, index) in actionButtons"
          :key="`action_${index}`"
          class="moz-default-button"
          @click="action.click"
          v-bind="action"
        />
        <slot name="action"></slot>
      </div>
    </div>
    <div v-if="showFilter" class="moz-horizontal-filter moz-controller-filter" ref="filter">
      <slot name="filter"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onUnmounted, computed, watch, toRefs, nextTick, reactive, Ref } from "vue";
import { storeToRefs } from "pinia";
import { resizeVerticalSize } from "../utils/themeSet";
import { useTranslation } from "i18next-vue";
import { useLayoutStore, useMenuLocationStore } from "../stores/mainStore";
import { useRouter } from "vue-router";
import { EventBus } from "@aleatorik-ui/common-ui";
import debounce from "lodash/debounce";
import Button from "./Button.vue";

/**
 * CONSTANT
 */
interface Actions {
  type: "Add" | "Remove" | "Edit" | "Save" | "Cancel" | "Search";
  icon?: string;
  text?: string;
  disabled?: boolean;
  click?: Function;
}

interface Props {
  height?: number;
  setControlHeight?: Function;
  showFilterButton?: boolean;
  actions?: Actions[];
}

const layout = useLayoutStore();
const menuLocation = useMenuLocationStore();
const router = useRouter();
const { t } = useTranslation();

/**
 * props
 */
const props = withDefaults(defineProps<Props>(), {
  height: 66,
  showFilterButton: true,
});
const { height, setControlHeight, showFilterButton, actions } = toRefs(props);

/**
 * state
 */
const showFilter = ref(showFilterButton.value);
const filter = ref();
const actionButtons: Ref<any[]> = ref([]);

const handleResize = debounce(() => resizeLayout(true), 200);

/**
 * life hook
 */
onBeforeMount(() => {
  EventBus.register("theme-changed", onThemeChanged);

  if (setControlHeight?.value) {
    setControlHeight.value(height.value);
  }
});

onMounted(() => {
  resizeLayout();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  EventBus.remove("theme-changed", onThemeChanged);
  window.removeEventListener("resize", handleResize);
  // if (observer) {
  //   observer.disconnect();
  // }
});

watch([showFilter], () => {
  nextTick(() => {
    resizeLayout(true);
    EventBus.fire("horizontal-filter-toggle");
  });
});

watch([actions], () => {
  nextTick(() => {
    actionButtons.value =
      actions?.value?.map(action => {
        const _action = {
          icon: null,
          text: t(action.type),
          ...action,
        };
        switch (action.type) {
          case "Add":
            _action.icon = "plus";
            break;
          case "Remove":
            _action.icon = "trash";
            break;
          case "Save":
            _action.icon = "save";
            break;
          case "Cancel":
            _action.icon = "cancel";
            break;
          case "Search":
            _action.icon = "search";
            break;
        }

        return _action;
      }) || [];
  });
});

const title = computed(() => {
  const navis = (router.currentRoute.value.meta.navis as any[]) || [];
  if (
    (navis && navis.length > 0 && menuLocation.menuLocation === "top") ||
    menuLocation.menuLocation === "topandleft" ||
    menuLocation.menuLocation === "topandtree"
  ) {
    let result: string[] = [];
    navis.reverse()?.forEach((element, index) => {
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
</script>
