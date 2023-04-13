<template>
  <!-- <DxLoadPanel
    :visible="loading"
    :show-indicator="true"
    :show-pane="true"
    :shading="true"
    :hideOnOutsideClick="false"
    :container="container"
    :message="message"
    shading-color="rgba(0,0,0,0.4)"
  /> -->
  <template></template>
</template>
<script setup lang="ts">
import { toRefs } from "vue";
// import { DxLoadPanel } from "devextreme-vue/load-panel";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    container?: string;
    message?: string;
  }>(),
  {
    loading: false,
    container: undefined,
    message: "Please wait...",
  },
);
const { loading, container, message } = toRefs(props);
</script>
