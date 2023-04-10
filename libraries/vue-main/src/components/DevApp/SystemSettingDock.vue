<template>
  <div>{{ text }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  system?: Record<string, any>;
}>();
const text: string = `${props.system?.SYSTEM_ID}:setting`;
</script>
