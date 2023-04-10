<template>
  <DxDataGrid
    class="moz-edit-datagrid"
    width="100%"
    height="100%"
    :data-source="props.results"
    :allow-column-reordering="true"
    :allow-column-resizing="true"
    :column-auto-width="true"
    column-resizing-mode="widget"
    :auto-navigate-to-focused-row="false"
    :show-borders="false"
    :show-column-lines="false"
    :selection="{ mode: 'single' }"
    :hover-state-enabled="true"
    no-data-text="No data to display"
  >
  </DxDataGrid>
</template>

<script setup lang="ts">
import { DxDataGrid, DxColumn } from "devextreme-vue/data-grid";

const props = defineProps<{
  results?: any[];
}>();
</script>
