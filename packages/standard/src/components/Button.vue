<template>
  <button class="moz-default-button" v-bind="$props">
    <i v-if="!!icon" :class="`mozart-icons icon-${icon}`" />
    <span>
      {{ text || label }}
      <slot />
    </span>
  </button>
</template>
<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  icon?: string;
  text?: string | undefined | null;
  label?: string;
}>();
const { icon, text, label } = toRefs(props);
</script>
