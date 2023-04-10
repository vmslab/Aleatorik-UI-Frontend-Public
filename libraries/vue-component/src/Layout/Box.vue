<template>
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      backgroundColor: backgroundColor,
    }"
    ref="box"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs } from "vue";
import { ScrollBar } from "mozart-common";

// interface Props {
//   width?: number;
//   height?: number;
//   backgroundColor?: string;
//   scroll?: boolean;
//   auto?: boolean;
// }

// const { width, height, backgroundColor, scroll = false, auto = true } = defineProps<Props>();

const props = defineProps({
  width: { type: Number },
  height: { type: Number },
  backgroundColor: { type: String },
  scroll: { type: Boolean, default: false },
  auto: { type: Boolean, default: true },
});
const { width, height, backgroundColor, scroll, auto } = toRefs(props);

const box = ref(null as HTMLElement | null);

onMounted(() => {
  if (scroll.value) {
    new ScrollBar(box.value as HTMLElement, {
      autoHide: auto.value,
    });
  }
});
</script>
