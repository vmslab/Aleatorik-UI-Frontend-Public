<template>
  <Controller
    :show-filter-button="false"
    :actions="[
      {
        type: 'Add',
        click: () => {
          extendGrid?.addRow();
        },
      },
      {
        type: 'Remove',
        disabled: !options.activeDelete,
        click: onRemove,
      },
      {
        type: 'Save',
        disabled: !isEditing,
        click: onSave,
      },
      {
        type: 'Search',
        click: () => {
          loadData();
        },
      },
    ]"
  >
  </Controller>
  <div class="todo moz-frame-for-outer-control">
    <WjFlexGrid
      style="width: 100%; height: var(--size-content-height)"
      :itemsSource="dataSource"
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
      :isReadOnly="!currentMenu?.isWrite"
      showSelectedHeaders="All"
      :showMarquee="true"
    >
      <WjFlexGridColumn :width="100" binding="siteID" :header="$t('SiteID')" :isRequired="true" />
      <WjFlexGridColumn :width="100" binding="siteType" :header="$t('SiteType')" />
      <WjFlexGridColumn
        :width="150"
        binding="createTime"
        :header="$t('CreateTime')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        :isReadOnly="true"
      />
      <WjFlexGridColumn :width="100" binding="createUser" :header="$t('CreateUser')" :isReadOnly="true" />
      <WjFlexGridColumn
        :width="150"
        binding="updateTime"
        :header="$t('UpdateTime')"
        :editor="dateEditor"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
        :isReadOnly="true"
      />
      <WjFlexGridColumn :width="100" binding="updateUser" :header="$t('UpdateUser')" :isReadOnly="true" />
    </WjFlexGrid>

    <LoadPanel :loading="options.loading" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { useQuery, useQueryClient, useMutation } from "vue-query";
import { ExtendGrid } from "@aleatorik-ui/vue-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { InputDateTime } from "@grapecity/wijmo.input";

import { useTranslation } from "i18next-vue";
import { showMessage } from "../../utils/dialog";
import { storeToRefs } from "pinia";
import { useMenuStore } from "../../stores/mainStore";
import { Call } from "../../stores/queryStore";

import Controller from "../../components/Controller.vue";
import LoadPanel from "../../components/LoadPanel.vue";

/**
 * CONSTANT
 */
const menuModule = useMenuStore();
const { isEditing, currentMenu } = storeToRefs(menuModule);

const { t } = useTranslation(); // 다국어
const queryClient = useQueryClient();

const dateEditor = ref<InputDateTime>(
  new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  }),
);

/**
 * STATE
 */
const options = reactive({
  loading: false,
  filter: true,
  activeDelete: false,
  checkedItems: [{ value: false }, { value: true }] as any[],
});

const dataSource = ref<any[] | null>([]); // data list
const grid = ref<FlexGrid | null>(null);
const extendGrid = ref<ExtendGrid | null>(null);

/**
 * Initialize
 */
onMounted(async () => {
  await loadData();
});

// grid initialize
const onInitialized = (flexGrid: FlexGrid) => {
  grid.value = flexGrid;
  extendGrid.value = new ExtendGrid({
    flexGrid,
    dataOptions: {
      dataKey: "siteID",
      validateKey: "save",
    },
    gridOptions: {
      useParseDate: true,
      onInitialized(extendGrid) {
        loadData();
      },
    },
  });
};

// data loaded cache reset and reload
const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("MdmSiteMaster");
  options.loading = false;
};

/**
 * API Call
 */
// data load api
useQuery("MdmSiteMaster", ({ queryKey }) => Call("MdmSiteMaster"), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();

    if (result && result.data) dataSource.value = result.data;
    else dataSource.value = [];
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    dataSource.value = [];
  },
});

// data add api
const addQuery = useMutation(param => Call("MdmSiteMaster", param, "POST"), {
  onSuccess: result => {
    // console.log("addQuery success", result);
  },
  onError: err => {
    showMessage("An error occurred while adding data", false);
  },
});

// data modify api
const modifyQuery = useMutation((param: any) => Call(`MdmSiteMaster/${param?.siteID}`, param, "PUT"), {
  onSuccess: result => {
    // console.log("modifyQuery success", result);
  },
  onError: err => {
    showMessage("An error occurred while updating data", false);
  },
});

// data remove api
const removeQuery = useMutation((param: any) => Call(`MdmSiteMaster/${param?.siteID}`, param, "DELETE"), {
  onSuccess: result => {
    // console.log("removeQuery success", result);
  },
  onError: err => {
    showMessage("An error occurred while removing data", false);
  },
});

/**
 * Event
 */
const onRemove = async () => {
  const _rows = extendGrid.value?.flexGrid.selectedRows || [];

  if (_rows?.length <= 0) {
    showMessage(t("SelectRowForRemove"), false);
    return false;
  }

  const row = _rows.map(row => row.dataItem);
  for await (const item of row) {
    await removeQuery.mutateAsync(item);
  }
  showMessage(t(`RemoveSucess`), true);

  loadData();
};

const onSave = async () => {
  const { addedItems, updatedItems } = await extendGrid?.value?.getChangedData()!;

  if (addedItems?.length > 0) {
    for await (const item of addedItems) {
      await addQuery.mutateAsync(item.data);
    }
    showMessage(t(`AddSucess`), true);
  }

  if (updatedItems?.length > 0) {
    for await (const item of updatedItems) {
      await modifyQuery.mutateAsync(item.key);
    }
    showMessage(t(`UpdatedSuccess`), true);
  }

  await extendGrid.value?.setChangeCommit();
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
  const exGrid = extendGrid.value;
  if (!exGrid) return;
  const flag = exGrid.isEditing;
  if (isEditing.value != flag) menuModule.setIsEditing(flag);
};
</script>
