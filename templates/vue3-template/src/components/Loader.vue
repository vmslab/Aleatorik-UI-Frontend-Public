<template>
  <DxLoadPanel
    v-model:visible="loading"
    :show-indicator="true"
    :show-pane="true"
    :shading="true"
    shading-color="rgba(0,0,0,0.4)"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useLoadStore } from "../stores/mainStore";

const load = useLoadStore();
const { loading } = storeToRefs(load);
</script>
