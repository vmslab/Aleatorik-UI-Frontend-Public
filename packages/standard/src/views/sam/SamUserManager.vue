<template>
  <Controller
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
        type: 'Cancel',
        disabled: !isEditing,
        click: () => {
          extendGrid?.clearChanges();
        },
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
  <div class="user-manager moz-frame-for-outer-control">
    <WjFlexGrid
      :style="{ width: '100%', height: `calc(var(--size-content-inner-height-outer-controller) - 4px)` }"
      :itemsSource="userItems"
      :initialized="onInitialized"
      :isReadOnly="!currentMenu?.isWrite"
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
      :cellEditEnding="onCellEditEnding"
      :prepareCellForEdit="onPrepareCellForEdit"
      :itemFormatter="onItemFormatter"
    >
      <WjFlexGridColumn width="*" binding="email" :header="$t('Email')" :isRequired="true" />
      <WjFlexGridColumn width="*" binding="password" :header="$t('Password')" :isRequired="true" />
      <WjFlexGridColumn width="*" binding="name" :header="$t('Name')" :isRequired="true" />
      <WjFlexGridColumn
        width="*"
        binding="groupId"
        :header="`${$t('Group')}${$t('ID')}`"
        :isRequired="false"
        :dataMap="groupMap"
      />
      <WjFlexGridColumn width="*" binding="department" :header="$t('Department')" :isRequired="false" />
    </WjFlexGrid>

    <DxLoadPanel
      :visible="options.loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      container=".user-manager"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Add, Modify, Remove, Call } from "../../stores/queryStore";
import { onMounted, ref, reactive } from "vue";
import { useMutation, useQuery, useQueryClient } from "vue-query";
import { ExtendGrid } from "@aleatorik-ui/vue-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { CellRangeEventArgs, DataMap, FlexGrid, GridPanel } from "@grapecity/wijmo.grid";

import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { showMessage } from "../../utils/dialog";
import { Controller } from "../../components";
import DxButton from "devextreme-vue/button";

import sha256 from "crypto-js/sha256";
import { systemId } from "../../utils/env";
import { storeToRefs } from "pinia";
import { useMenuStore } from "../../stores/mainStore";

import { domain } from "../../utils/env";

const menuModule = useMenuStore();
const { currentMenu, isEditing } = storeToRefs(menuModule);

const { t } = useTranslation();

const groupMap = ref<DataMap | null>(null);

const userItems = ref<any[] | null>([]);
const groupItems = ref<any[] | null>([]);
const grid = ref<FlexGrid | null>(null);
const extendGrid = ref<ExtendGrid | null>(null);

const options = reactive({ loading: false, filter: true, activeDelete: false });
const callResult = reactive({ add: 0, update: 0, remove: 0 });
const queryClient = useQueryClient();

useQuery("User", ({ queryKey }) => Get(queryKey[0]), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();
    if (result && result.data) userItems.value = result.data.map((item: any) => ({ ...item, isReadOnly: true }));
    else userItems.value = [];

    queryClient.invalidateQueries("GroupBySystem");
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    userItems.value = [];
  },
});
useQuery("GroupBySystem", ({ queryKey }) => Call(`GetGroup/${systemId}`), {
  refetchOnWindowFocus: false,
  enabled: !!userItems,
  onSuccess: result => {
    if (result && result.data) groupItems.value = result.data;
    else groupItems.value = [];

    groupMap.value = new DataMap(groupItems.value, "groupId", "name");
    showMessage("Data load complete", true);
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    groupItems.value = [];
  },
});

const addUser = useMutation(param => Add("User", param), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.add += result.data;
  },
  onError: err => {
    showMessage("An error occurred while adding data", false);
  },
});

const modifyUser = useMutation(param => Modify("User", param), {
  onSuccess: result => {
    if (result && result.data > 0) callResult.update += result.data;
  },
  onError: err => {
    showMessage("An error occurred while updating data", false);
  },
});

const removeUser = useMutation(param => Remove("User", param), {
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
  extendGrid.value = new ExtendGrid({
    flexGrid,
    dataOptions: {
      dataKey: "email",
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

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("User");
  options.loading = false;
};

const onRemove = async () => {
  const _rows = extendGrid.value?.flexGrid.selectedRows || [];

  if (_rows?.length <= 0) {
    showMessage(t("SelectRowForRemove"), false);
    return false;
  }

  const row = _rows.map(row => row.dataItem);
  for await (const item of row) {
    await removeUser.mutateAsync(item);
  }
  showMessage(t(`RemoveSucess`), true);

  loadData();
};

const onSave = async () => {
  const { addedItems, updatedItems } = await extendGrid?.value?.getChangedData()!;

  if (addedItems?.length > 0) {
    for await (const item of addedItems) {
      await addUser.mutateAsync(item.data);
    }
    showMessage(t(`AddSucess`), true);
  }

  if (updatedItems?.length > 0) {
    for await (const item of updatedItems) {
      await modifyUser.mutateAsync(item.key);
    }
    showMessage(t(`UpdatedSuccess`), true);
  }

  await extendGrid.value?.setChangeCommit();
  menuModule.endEdit();
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
  if (isEditing.value != flag) menuModule.beginEdit();
};

const onCellEditEnding = (s: FlexGrid, e: CellRangeEventArgs) => {
  onPasswordEditing(s, e);
};

const onAdminAccountEditing = (s: FlexGrid, e: CellRangeEventArgs) => {
  if (e.getRow().dataItem.email !== `admin@${domain}` && e.getColumn().binding !== "group") return false;

  showMessage("'admin' account can be edited group", false);
  e.cancel = true;
};

const onPasswordEditing = (s: FlexGrid, e: CellRangeEventArgs) => {
  if (e.getColumn().binding !== "password") return;

  if (s.activeEditor.value.length > 0) {
    const pw = sha256(s.activeEditor.value).toString();
    s.setCellData(e.row, e.col, pw);
  } else {
    s.setCellData(e.row, e.col, "");
  }
  e.cancel = true;
};

const onPrepareCellForEdit = (s: FlexGrid, e: any) => {
  if (e.getColumn().binding === "password") {
    s.activeEditor.type = "password";
  }

  if (e.getRow().dataItem.email === `admin@${domain}` && e.getColumn().binding === "groupId") {
    s.activeEditor.type = "hidden";
    s.activeEditor.value = "admin";
    showMessage("'admin' account can be edited group", false);
    e.cancel = true;
  }
};

const onItemFormatter = (panel: GridPanel, row: any, col: any, cell: any) => {
  if (panel.cellType === 1 && panel.columns[col].binding === "password" && !panel.grid.activeEditor) {
    cell.innerText = "";
  }
};
</script>
