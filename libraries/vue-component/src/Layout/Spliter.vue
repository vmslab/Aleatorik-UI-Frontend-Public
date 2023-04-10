<template>
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      backgroundColor: backgroundColor,
      cursor: cursor,
    }"
    :onmousedown="onMouseDown"
  ></div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";

// interface Props {
//   width?: number;
//   height?: number;
//   horizontal?: boolean;
//   backgroundColor?: string;
//   resizable?: boolean;
//   onMouseDown?: (event: MouseEvent) => {};
//   onClick?: (event: MouseEvent) => {};
// }

// const { width, height, horizontal = false, backgroundColor, resizable, onMouseDown, onClick } = defineProps<Props>();

const props = defineProps({
  width: { type: Number },
  height: { type: Number },
  horizontal: { type: Boolean, default: false },
  backgroundColor: { type: String },
  resizable: { type: Boolean },
  onMouseDown: { type: Function },
  onClick: { type: Function },
});
const { width, height, horizontal, backgroundColor, resizable, onMouseDown, onClick } = toRefs(props);

const cursor = computed(() => {
  if (resizable.value) {
    return horizontal.value ? "col-resize" : "row-resize";
  }
  return "default";
});
</script>
