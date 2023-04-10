<template>
  <div class="moz-frame-no-control">
    <DxDataGrid
      ref="dxdatagrid"
      class="moz-datagrid moz-controller-contains-grid"
      :height="600"
      :data-source="userSource"
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :column-auto-width="true"
      :selectTextOnEditStart="true"
      column-resizing-mode="widget"
      keyExpr="email"
      :auto-navigate-to-focused-row="false"
      :show-borders="false"
      :show-column-lines="false"
      :selection="{ mode: 'single' }"
      :hover-state-enabled="true"
      @row-inserted="onRowInserted"
      @row-updated="onRowUpdated"
      @row-removed="onRowRemoved"
      @toolbar-preparing="onToolbarPreparing"
      @editor-preparing="onEditorPreparing"
    >
      <template #titleTemplate>
        <div class="moz-controller-title">{{ "User Manage" }}</div>
      </template>
      <DxLoadPanel :enabled="false" />
      <dx-scrolling mode="infinite" />
      <dx-export :enabled="true" />
      <dx-editing :allow-updating="true" :allow-deleting="true" :allow-adding="true" mode="batch">
        <DxTexts
          :delete-row="t(`Delete`)"
          :undelete-row="t(`CANCEL_DELETE`)"
          :confirmDeleteMessage="t(`RemoveMessage`, [t(`menu_lang`)])"
        ></DxTexts
      ></dx-editing>
      <DxFilterRow :visible="true" />
      <DxHeaderFilter :visible="true" />
      <DxColumn data-field="email">
        <DxCustomRule :validationCallback="validateKey" :message="t(`ALREADY_REGISTERED`)" />
      </DxColumn>
      <DxColumn data-field="name">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn
        data-field="password"
        :editor-options="{ mode: 'password' }"
        :customize-text="() => ''"
        :setCellValue="(d: any, v: any) => {
          d.password = sha256(v).toString();
        }"
      >
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="groupName">
        <DxLookup :data-source="groupSource" value-expr="groupId" display-expr="groupName" />
      </DxColumn>
      <DxColumn data-field="department"></DxColumn>
    </DxDataGrid>
    <!-- <moz-excel-advanced-upload-popup
      v-if="isShowUploadPopup"
      :visible="isShowUploadPopup"
      :text="true"
      :key-columns="['ID']"
      :data="excelData"
      :upload="onUpload"
      :append="onAppend"
      :override="onOverride"
      :download="onDownload"
      @reload="loadData"
      @closed="isShowUploadPopup = false"
    ></moz-excel-advanced-upload-popup> -->

    <DxLoadPanel
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get, Add, Modify, Remove } from "../../stores/templateStore";
import { onMounted, ref, reactive, computed } from "vue";
import {
  DxDataGrid,
  DxScrolling,
  DxExport,
  DxColumn,
  DxLookup,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxCustomRule,
  DxTexts,
  DxRequiredRule,
} from "devextreme-vue/data-grid";
import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { showMessage } from "../../utils/dialog";
import { systemId } from "../../utils/env";

import sha256 from "crypto-js/sha256";

const { t } = useTranslation();

const userItems = ref([]);
const userSource = computed(() => {
  return userItems.value;
});

const groupItems = ref([]);
const groupSource = computed(() => {
  return groupItems.value;
});

const dxdatagrid = ref(null);
const grid = computed(() => {
  return (dxdatagrid.value as any)?.instance;
});

const loading = ref(false);
const isLoading = reactive({ loading: false });

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  isLoading.loading = true;
  try {
    const result = await Get("User");
    userItems.value = result.data;

    const groupResult = await Get("GroupBySystem", { systemId: systemId }, "post");
    groupItems.value = groupResult.data;
  } catch (e) {
    return [];
  } finally {
    isLoading.loading = false;
  }
};

const onRowInserted = async (e: any) => {
  await Add("User", e.data);
  showMessage(t("Add"), true);
};

const onRowUpdated = async (e: any) => {
  const result = await Modify("User", e.data);
  showMessage(t("Edit"), result.data);
};

const onRowRemoved = async (e: any) => {
  const result = await Remove("User", e.data);
  showMessage(t("Delete"), result.data);
};

const validateKey = (e: any): boolean => {
  const email = e.data.email;
  if (email && !userItems.value.some((t: any) => t.email === email)) {
    return true;
  }
  return false;
};

const onToolbarPreparing = (e: any) => {
  e.toolbarOptions.items.unshift({
    location: "before",
    template: "titleTemplate",
  });
};

const onEditorPreparing = (e: any) => {
  switch (e.dataField) {
    case "contents":
      e.editorName = "dxTextArea";
      e.editorOptions.height = 100;
      e.editorOptions.onFocusOut = () => {
        e.component.closeEditCell();
      };
      break;
  }
};
</script>
