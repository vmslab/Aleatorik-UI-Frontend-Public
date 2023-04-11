<template>
  <Controller :show-filter="options.filter">
    <Button
      v-tooltip="{ text: $t('Add') }"
      class="moz-default-button"
      icon="plus"
      :focusStateEnabled="false"
      :text="$t('Add')"
      @click="extendgrid?.addRow()"
    />
    <Button
      v-tooltip="{ text: $t('Remove') }"
      class="moz-default-button"
      icon="trash"
      :focusStateEnabled="false"
      :text="$t('Remove')"
      :disabled="!options.activeDelete"
      @click="extendgrid?.removeRow()"
    />
    <Button
      v-tooltip="{ text: $t('Save') }"
      class="moz-default-button"
      icon="save"
      :focusStateEnabled="false"
      :text="$t('Save')"
      :disabled="!isEditing"
      @click="extendgrid?.saveEditData()"
    />
    <Button
      v-tooltip="{ text: $t('Cancel') }"
      class="moz-default-button"
      icon="cancel"
      :focusStateEnabled="false"
      :text="$t('Cancel')"
      :disabled="!isEditing"
      @click="extendgrid?.clearChanges()"
    />
    <Button
      v-tooltip="{ text: $t('Search') }"
      class="moz-default-button"
      icon="search"
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
      :itemsSource="cfgSiteMasterList"
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
      <WjFlexGridColumn :width="100" binding="siteId" :header="$t('SiteId')" :isRequired="true" />
      <WjFlexGridColumn :width="100" binding="siteType" :header="$t('SiteType')" />
      <WjFlexGridColumn
        :width="150"
        binding="createTime"
        :header="$t('CreateTime')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
      />
      <WjFlexGridColumn :width="100" binding="createUser" :header="$t('CreateUser')" />
      <WjFlexGridColumn
        :width="150"
        binding="updateTime"
        :header="$t('UpdateTime')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
      />
      <WjFlexGridColumn :width="100" binding="updateUser" :header="$t('UpdateUser')" />
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
import { Get, Add, Modify, Remove, Call } from "../../stores/queryStore";
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
import Button from "../../components/Button.vue";

const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);

const { t } = useTranslation();

const finishedSelect = ref([
  { state: t("Finished"), checked: true, value: true },
  { state: t("InProgress"), checked: true, value: false },
]);

const cfgSiteMasterList = ref<any[] | null>([]);
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

useQuery("cfgSiteMaster", ({ queryKey }) => Call("cfgSiteMaster/list"), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();

    if (result && result.data) cfgSiteMasterList.value = result.data;
    else cfgSiteMasterList.value = [];

    showMessage("Data load complete", true);
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    cfgSiteMasterList.value = [];
  },
});

const add = useMutation(param => Call("cfgSiteMaster/add", param, "POST"), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.add += result.data;
  },
  onError: err => {
    showMessage("An error occurred while adding data", false);
  },
});

const modify = useMutation((param: any) => Call(`cfgSiteMaster/${param?.siteId}`, param, "PUT"), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.update += result.data;
  },
  onError: err => {
    showMessage("An error occurred while updating data", false);
  },
});

const remove = useMutation((param: any) => Call(`cfgSiteMaster/${param?.siteId}`, param, "DELETE"), {
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
    }
  });
  flexGrid.cellEditEnded.addHandler((s, e) => {
    switch (e.getColumn().binding) {
    }
  });
  extendgrid.value = new ExtendGrid({
    flexGrid,
    dataOptions: {
      dataKey: "siteId",
      validateKey: "save",
    },
    gridOptions: {
      useParseDate: true,
      onInitialized(extendGrid) {
        loadData();
      },
      // onInitialzeRowData: async () => {
      //   let data: any = {};

      //   return data;
      // },
      onSaveEditData: async (addItems, updateItems, removeItems) => {
        options.loading = true;
        try {
          console.log("addItems", addItems);
          console.log("updateItems", updateItems);
          console.log("removeItems", removeItems);

          if (addItems?.length > 0) {
            callResult.add = 0;
            for await (const item of addItems) {
              await add.mutateAsync(item.data);
            }
            showMessage(`Added ${callResult.add} Row${callResult.add > 1 ? "s" : ""}`, callResult.add > 0);
          }

          if (updateItems?.length > 0) {
            callResult.update = 0;
            for await (const item of updateItems) {
              console.log("m", item);
              await modify.mutateAsync(item.data);
            }
            showMessage(`Updated ${callResult.update} Row${callResult.update > 1 ? "s" : ""}`, callResult.update > 0);
          }

          if (removeItems?.length > 0) {
            callResult.remove = 0;
            for await (const item of removeItems) {
              console.log(removeItems);
              console.log("d", item);
              await remove.mutateAsync(item.key);
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
  queryClient.invalidateQueries("cfgSiteMaster");
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
