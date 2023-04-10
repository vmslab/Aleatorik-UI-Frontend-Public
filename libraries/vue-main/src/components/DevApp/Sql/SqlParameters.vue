<template>
  <DxDataGrid
    class="moz-edit-datagrid moz-edit-datagrid-show-toolbar"
    width="100%"
    height="100%"
    :data-source="props.params"
    :allow-column-reordering="true"
    :allow-column-resizing="true"
    :column-auto-width="true"
    column-resizing-mode="widget"
    keyExpr="name"
    :auto-navigate-to-focused-row="false"
    :show-borders="false"
    :show-column-lines="false"
    :selection="{ mode: 'single' }"
    :hover-state-enabled="true"
    no-data-text="No data to display"
  >
    <DxEditing :allow-updating="true" :allow-deleting="true" :allow-adding="true" :use-icons="true" mode="cell">
    </DxEditing>
    <DxColumn data-field="name"></DxColumn>
    <DxColumn data-field="type">
      <DxLookup :data-source="types" />
    </DxColumn>
  </DxDataGrid>
</template>

<script setup lang="ts">
import { types } from "@aleatorik-ui/protos";
import { SqlParam } from "@aleatorik-ui/protos/src/generated/Protos/ModelService";
import { DxDataGrid, DxColumn, DxEditing, DxLookup, DxToolbar, DxItem } from "devextreme-vue/data-grid";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxButton } from "devextreme-vue/button";

const props = defineProps<{
  params?: SqlParam[];
}>();
</script>
