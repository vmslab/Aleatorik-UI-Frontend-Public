<template>
  <button class="moz-button" :class="getClassNameByType(type || 'default')" v-bind="$props">
    <i v-if="!!icon" :class="`mozart-icons icon-${icon}`" />
    <span>
      {{ text || label }}
      <slot />
    </span>
  </button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

type ButtonType = "default" | "text";

const props = defineProps<{
  icon?: string;
  text?: string | undefined | null;
  label?: string;
  type?: ButtonType;
}>();
const { icon, text, label, type: ButtonType = "default" } = toRefs(props);

const getClassNameByType = (type: ButtonType): string => {
  let className = "";
  switch (type) {
    case "text":
      className = "moz-text-button";
      break;
    case "default":
    default:
      className = "moz-default-button";
      break;
  }

  return className;
};
</script>
