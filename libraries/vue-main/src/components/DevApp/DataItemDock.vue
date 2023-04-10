<template>
  <DxDataGrid
    ref="gridRef"
    class="moz-edit-datagrid moz-edit-datagrid-show-toolbar"
    width="100%"
    height="100%"
    :data-source="data?.props"
    :allow-column-reordering="true"
    :allow-column-resizing="true"
    :column-auto-width="true"
    column-resizing-mode="widget"
    keyExpr="id"
    :auto-navigate-to-focused-row="false"
    :show-borders="false"
    :show-column-lines="false"
    :selection="{ mode: 'single' }"
    :hover-state-enabled="true"
    no-data-text="No data to display"
    @init-new-row="onInitNewRow"
  >
    <DxEditing :allow-updating="true" :allow-deleting="true" :allow-adding="true" :use-icons="true" mode="cell">
    </DxEditing>
    <DxToolbar>
      <DxItem location="before" template="name-template" />
      <DxItem location="before" template="table-name-template" />
      <DxItem location="before" template="group-template" />
      <DxItem location="after" template="add-button-template" />
      <DxItem location="after" template="save-button-template" />
    </DxToolbar>
    <DxColumn data-field="name"></DxColumn>
    <DxColumn data-field="columnName"></DxColumn>
    <DxColumn data-field="type">
      <DxLookup :data-source="types" />
    </DxColumn>
    <DxColumn data-field="size" data-type="number" :editor-options="{ showSpinButtons: true }"></DxColumn>
    <DxColumn data-field="primaryKey" data-type="boolean"></DxColumn>
    <DxColumn data-field="nullable" data-type="boolean"></DxColumn>
    <template #name-template>
      <div class="flex-center-horizontal">
        <label>Name</label>
        <DxTextBox
          :value="dataItem.name"
          @value-changed="(evt: any) => {
            if (!evt.value) return;
            dataItem.name = evt.value;
          }"
        />
      </div>
    </template>
    <template #table-name-template>
      <div class="flex-center-horizontal">
        <label>Table Name</label>
        <DxTextBox
          :value="dataItem.tableName"
          @value-changed="(evt: any) => {
            if (!evt.value) return;
            dataItem.tableName = evt.value;
          }"
        />
      </div>
    </template>
    <template #group-template>
      <div class="flex-center-horizontal">
        <label>Group</label>
        <DxTextBox
          :value="dataItem.group"
          @value-changed="(evt: any) => {
            if (!evt.value) return;
            dataItem.group = evt.value;
          }"
        />
      </div>
    </template>
    <template #add-button-template>
      <DxButton class="moz-default-button" icon="add" type="default" text="Add" @click="onAddClick" />
    </template>
    <template #save-button-template>
      <DxButton class="moz-default-button" icon="save" type="default" text="Save" @click="onSaveClick" />
    </template>
  </DxDataGrid>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "vue-query";
import { generateGUID } from "@mozart-ui/common-ui";
import { types } from "@mozart-ui/protos";
import { EntityDef, EntityPropDef } from "@mozart-ui/protos/src/generated/Protos/ModelService";
import { Add, Modify } from "@mozart-ui/common-api";
import { useAlarmStore } from "../../stores/mainStore";
import queryClient from "../../utils/query";
import { DxDataGrid, DxColumn, DxEditing, DxLookup, DxToolbar, DxItem } from "devextreme-vue/data-grid";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxButton } from "devextreme-vue/button";

const props = defineProps<{
  data?: EntityDef;
  mode?: string;
}>();

const gridRef = ref(null);

const alarm = useAlarmStore();

const dataItem: EntityDef = props.data || {
  id: generateGUID(),
  name: "",
  props: [] as EntityPropDef[],
};

const mutation = useMutation(props.mode === "Add" ? Add : Modify, {
  onSuccess: result => {
    alarm.setAlarm({
      message:
        result.data.count > 0
          ? `DataItem ${props.mode === "Add" ? "added" : "modified"}!`
          : `${props.mode} DataItem failed!`,
      type: result.data.count > 0 ? "success" : "error",
    });
    if (result.data.count > 0) {
      queryClient.invalidateQueries("model");
    }
  },
});

const onInitNewRow = (e: any) => {
  e.data.id = generateGUID();
  e.data.entityName = dataItem.name;
  e.data.primaryKey = false;
  e.data.nullable = true;
};

const onAddClick = () => {
  (gridRef.value as any)?.instance?.addRow();
};

const onSaveClick = () => {
  mutation.mutate({ type: "DataItem", payload: dataItem });
};
</script>
