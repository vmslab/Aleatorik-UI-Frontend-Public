<template>
  <Controller :show-filter="options.filter">
    <DxButton
      v-tooltip="{ text: $t('Add') }"
      class="moz-default-button"
      icon="add"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Add')"
      @click="extendgrid?.addRow()"
    />
    <DxButton
      v-tooltip="{ text: $t('Remove') }"
      class="moz-default-button"
      icon="trash"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Remove')"
      :disabled="!options.activeDelete"
      @click="extendgrid?.removeRow()"
    />
    <DxButton
      v-tooltip="{ text: $t('Save') }"
      class="moz-default-button"
      icon="save"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Save')"
      :disabled="!isEditing"
      @click="extendgrid?.saveEditData()"
    />
    <DxButton
      v-tooltip="{ text: $t('Cancel') }"
      class="moz-default-button"
      icon="cancel"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Cancel')"
      :disabled="!isEditing"
      @click="extendgrid?.clearChanges()"
    />
    <DxButton
      v-tooltip="{ text: $t('Search') }"
      class="moz-default-button"
      icon="search"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Search')"
      @click="loadData()"
    />
    <template #title>
      <i
        v-if="options.filter"
        v-tooltip="{ text: t('HideFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        v-tooltip="{ text: t('ShowFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
    </template>
    <template #filter>
      <div>
        <label>{{ $t("Finished") }} {{ $t("Status") }}</label>
        <WjMultiSelect
          placeholder=""
          :showSelectAllCheckbox="true"
          :itemsSource="finishedSelect"
          displayMemberPath="state"
          checkedMemberPath="checked"
          :checkedItemsChanged="onCheckedItemsChanged"
        ></WjMultiSelect>
      </div>
    </template>
  </Controller>
  <div class="todo moz-frame-for-outer-control">
    <WjFlexGrid
      style="width: 100%; height: var(--size-content-height)"
      :itemsSource="
        todoItems?.filter(item => options.checkedItems.some(checkItem => checkItem.value === item.isFinished))
      "
      :initialized="onInitialized"
      selectionMode="MultiRange"
      allowSorting="MultiColumn"
      keyActionTab="Cycle"
      :allowDelete="true"
      :autoGenerateColumns="false"
      :deferResizing="true"
      :quickAutoSize="true"
      :imeEnabled="true"
      :alternatingRowStep="0"
      :selectionChanged="onSelectionChanged"
      :cellEditEnded="onCellEditEnded"
      :isReadOnly="!currentMenu?.isWrite"
    >
      <WjFlexGridColumn :visible="false" binding="id" header="id" />
      <WjFlexGridColumn width="*" binding="title" :header="$t('Title')" :isRequired="true" />
      <WjFlexGridColumn width="*" binding="priority" :header="$t('Priority')" dataType="Number" />
      <WjFlexGridColumn width="*" binding="contents" :header="$t('Content')" :isRequired="false" />
      <WjFlexGridColumn
        width="*"
        binding="expectedDate"
        :header="$t('ExpectedDate')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
      />
      <WjFlexGridColumn width="*" binding="isFinished" :header="$t('IsFinished')" dataType="Boolean" />
      <WjFlexGridColumn
        width="*"
        binding="finishedDate"
        :header="$t('finishedDate')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
      />
    </WjFlexGrid>

    <DxLoadPanel
      :visible="options.loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      container=".todo"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Add, Modify, Remove } from "../../stores/templateStore";
import { onMounted, ref, reactive } from "vue";
import { useQuery, useQueryClient, useMutation } from "vue-query";
import { ExtendGrid } from "@aleatorik-ui/vue-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { WjMultiSelect } from "@grapecity/wijmo.vue2.input";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { InputDateTime } from "@grapecity/wijmo.input";

import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { generateGUID } from "@aleatorik-ui/common-ui/src";
import { showMessage } from "../../utils/dialog";
import Controller from "../../components/Controller.vue";
import DxButton from "devextreme-vue/button";

import { storeToRefs } from "pinia";
import { useMenuStore } from "../../stores/mainStore";

const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);

const { t } = useTranslation();

const finishedSelect = ref([
  { state: t("Finished"), checked: true, value: true },
  { state: t("InProgress"), checked: true, value: false },
]);

const todoItems = ref<any[] | null>([]);
const grid = ref<FlexGrid | null>(null);
const extendgrid = ref<ExtendGrid | null>(null);

const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  checkedItems: [{ value: false }, { value: true }] as any[],
});
const callResult = reactive({ add: 0, update: 0, remove: 0 });
const queryClient = useQueryClient();

const dateEditor = ref<InputDateTime>(
  new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  }),
);

useQuery("Todo", ({ queryKey }) => Get(queryKey[0]), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();
    if (result && result.data) todoItems.value = result.data;
    else todoItems.value = [];

    showMessage("Data load complete", true);
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    todoItems.value = [];
  },
});

const addTodo = useMutation(param => Add("Todo", param), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.add += result.data;
  },
  onError: err => {
    showMessage("An error occurred while adding data", false);
  },
});

const modifyTodo = useMutation(param => Modify("Todo", param), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.update += result.data;
  },
  onError: err => {
    showMessage("An error occurred while updating data", false);
  },
});

const removeTodo = useMutation(param => Remove("Todo", param), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.remove += result.data;
  },
  onError: err => {
    showMessage("An error occurred while removing data", false);
  },
});

onMounted(async () => {
  await loadData();
});

const onInitialized = (flexGrid: FlexGrid) => {
  grid.value = flexGrid;
  flexGrid.beginningEdit.addHandler((s, e) => {
    switch (e.getColumn().binding) {
      case "contents":
        e.getRow().height = 150;
        break;
    }
  });
  flexGrid.cellEditEnded.addHandler((s, e) => {
    switch (e.getColumn().binding) {
      case "contents":
        e.getRow().height = null;
        break;
      case "isFinished":
        if (!e.getRow().dataItem["finishedDate"] && s.getCellData(e.row, e.col, false)) {
          e.getRow().dataItem["finishedDate"] = new Date();
          s.refreshCells(false);
        }
        break;
    }
  });
  extendgrid.value = new ExtendGrid({
    flexGrid,
    dataOptions: {
      dataKey: "id",
      validateKey: "save",
    },
    gridOptions: {
      useParseDate: true,
      onInitialized(extendGrid) {
        loadData();
      },
      onInitialzeRowData: async () => {
        let data: any = {};

        data.id = generateGUID();
        data.priority = 0;
        data.isFinished = false;
        data.expectedDate = new Date(new Date().setDate(new Date().getDate() + 7));

        return data;
      },
      onSaveEditData: async (addItems, updateItems, removeItems) => {
        options.loading = true;
        try {
          if (addItems?.length > 0) {
            callResult.add = 0;
            for await (const item of addItems) {
              await addTodo.mutateAsync(item.data);
            }
            showMessage(`Added ${callResult.add} Row${callResult.add > 1 ? "s" : ""}`, callResult.add > 0);
          }

          if (updateItems?.length > 0) {
            callResult.update = 0;
            for await (const item of updateItems) {
              await modifyTodo.mutateAsync(item.data);
            }
            showMessage(`Updated ${callResult.update} Row${callResult.update > 1 ? "s" : ""}`, callResult.update > 0);
          }

          if (removeItems?.length > 0) {
            callResult.remove = 0;
            for await (const item of removeItems) {
              await removeTodo.mutateAsync(item.data);
            }
            showMessage(`Removed ${callResult.remove} Row${callResult.remove > 1 ? "s" : ""}`, callResult.remove > 0);
          }
        } catch {
          options.loading = false;
          return false;
        }

        options.loading = false;
        return true;
      },
    },
  });
};

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("Todo");
  options.loading = false;
};

const onSelectionChanged = () => {
  const flexGrid = grid.value;
  if (!flexGrid) return;
  const selectedRows = flexGrid.rows.filter((r: any) => r.isVisible && r.isSelected);
  const flag = selectedRows.length > 0;
  if (options.activeDelete != flag) options.activeDelete = flag;

  onCellEditEnded();
};

const onCellEditEnded = () => {
  const exGrid = extendgrid.value;
  if (!exGrid) return;
  const flag = exGrid.isEditing;
  if (isEditing.value != flag) menuModule.setIsEditing(flag);
};

const onCheckedItemsChanged = (s: any) => {
  options.checkedItems = s.checkedItems;
};
</script>
