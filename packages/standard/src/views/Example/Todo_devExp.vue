<template>
  <div>
    <Controller :show-filter="filter">
      <DxButton
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Add')"
      />
      <!-- :disabled="!isValid"
        @click="onAddRow"  -->
      <DxButton
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Delete')"
      />
      <!-- :disabled="!isValid || !activeDelete"
        @click="onRemoveRow" -->
      <DxButton
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Save')"
      />
      <!-- @click="onSaveData"
        :disabled="!isValid || !isEditing"  -->
      <DxButton
        v-tooltip="{ text: $t('Cancel') }"
        class="moz-default-button"
        icon="cancel"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Cancel')"
      />
      <!-- @click="onCancelUpdate"
        :disabled="!isValid || !isEditing"  -->
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Search')"
      />
      <!-- @click="onRefreshData" -->
    </Controller>
  </div>
  <div class="moz-frame-for-outer-control">
    <DxDataGrid
      ref="dxdatagrid"
      class="moz-edit-datagrid moz-controller-contains-grid"
      height="var(--size-content-height)"
      :data-source="todoItems"
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :column-auto-width="true"
      :selectTextOnEditStart="true"
      column-resizing-mode="widget"
      keyExpr="id"
      :auto-navigate-to-focused-row="false"
      :show-borders="false"
      :show-column-lines="false"
      :selection="{ mode: 'single' }"
      :hover-state-enabled="true"
      @init-new-row="onInitNewRow"
      @row-inserted="onRowInserted"
      @row-updated="onRowUpdated"
      @row-removed="onRowRemoved"
      @toolbar-preparing="onToolbarPreparing"
      @editor-preparing="onEditorPreparing"
    >
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
      <DxColumn :visible="false" data-field="id">
        <DxCustomRule :validationCallback="validateKey" :message="t(`ALREADY_REGISTERED`)" />
      </DxColumn>
      <DxColumn data-field="title">
        <DxRequiredRule />
      </DxColumn>
      <DxColumn data-field="priority"></DxColumn>
      <DxColumn data-field="contents"></DxColumn>
      <DxColumn data-field="expectedDate" data-type="datetime" format="yyyy-MM-dd HH:mm:ss"></DxColumn>
      <DxColumn data-field="isFinished" :set-cell-value="setCellValue"></DxColumn>
      <DxColumn data-field="finishedDate" data-type="datetime" format="yyyy-MM-dd HH:mm:ss"></DxColumn>
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
      :visible="options.loading"
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
import { onMounted, ref, reactive, computed, nextTick } from "vue";
import {
  DxDataGrid,
  DxScrolling,
  DxExport,
  DxColumn,
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
import { generateGUID } from "@aleatorik-ui/common-ui/src";
import { showSnackBar } from "../../utils/dialog";
import Controller from "../../components/Controller.vue";
import DxButton from "devextreme-vue/button";

const { t } = useTranslation();

const filter = ref(false);

const todoItems = ref([] as any[] | null);
const dxdatagrid = ref(null as DxDataGrid | null);
const grid = computed(() => {
  return dxdatagrid.value?.instance;
});
// let file!: File;
// let isShowUploadPopup: boolean = false;
// let excelData: any[] = [];
const options = reactive({ loading: false });

// const loadData = computed(async () => {
//   return await loadData();
// });

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  options.loading = true;
  try {
    const result = await Get("Todo");
    todoItems.value = result.data;
  } catch (e) {
    return [];
  } finally {
    options.loading = false;
  }
};

const onRowInserted = async (e: any) => {
  await Add("Todo", e.data);
  showMessage(t("Add"), true);
};

const onRowUpdated = async (e: any) => {
  const result = await Modify("Todo", e.data);
  showMessage(t("Edit"), result.data);
};

const onRowRemoved = async (e: any) => {
  const result = await Remove("Todo", e.data);
  showMessage(t("Delete"), result.data);
};

const validateKey = (e: any): boolean => {
  const id = e.data.id;
  if (id) {
    if ((todoItems.value as any[])?.filter((t: any) => t.id === id).length > 1) return false;
  } else {
    e.data.id = generateGUID();
  }
  return true;
};

// const onUpload = (text: string[])  => {
//   if (!text || text.length === 0) return;
//   return Text("Advanced", { table: "TODO", text });
// }

// const onAppend = (data: any[])  => {
//   return Add("AppendExcel", {
//     todos: JSON.stringify(parseDatas(data, Entity.entities?.Todo?.properties!)),
//   });
// }

// const onOverride = (data: any[])  => {
//   return Add("OverrideExcel", {
//     todos: JSON.stringify(parseDatas(data, Entity.entities?.Todo?.properties!)),
//   });
// }

// const onDownload = ()  => {
//   await Download("TodoExcel", { options: {} });
// }

const showMessage = (message: any, result: boolean) => {
  showSnackBar({
    message: `${message}!`,
    type: result ? "success" : "error",
  });
};

const onInitNewRow = (e: any) => {
  e.data.priority = 0;
  e.data.isFinished = false;
  e.data.expectedDate = new Date(new Date().setDate(new Date().getDate() + 7));
};

const onToolbarPreparing = (e: any) => {
  for (let item of e.toolbarOptions.items) {
    if (item.widget === "dxButton") item.visible = false;
  }

  nextTick(() => {
    let panels = document.querySelectorAll(".dx-datagrid-header-panel") as NodeListOf<HTMLElement>;
    if (panels != null) {
      panels.forEach(panel => {
        panel.style.display = "none";
      });
    }
  });
  // while (e.toolbarOptions.items.length > 0) e.toolbarOptions.items.unshift();
  // e.toolbarOptions.items.unshift(
  //   {
  //     location: "before",
  //     template: "titleTemplate",
  //   },
  //   // {
  //   //   location: "after",
  //   //   widget: "dxButton",
  //   //   options: {
  //   //     icon: "upload",
  //   //     elementAttr: {
  //   //       class: "dx-datagrid-import-button",
  //   //     },
  //   //     onClick: () => {
  //   //       isShowUploadPopup = true;
  //   //     },
  //   //   },
  //   // },
  // );
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
    // case "isFinished":
    //   e.editorOptions.onValueChanged = (evt: any) => {
    //     if (!e.row) return;
    //     if (evt.value) {
    //       console.log(e.component);
    //       console.log(e.row.rowIndex);
    //       e.component.setCellValue(e.row.rowIndex, "finishedDate", new Date());
    //     }
    //   };
    //   break;
  }
};

const setCellValue = (newData: any, value: any, currentRowData: any) => {
  newData.isFinished = value;
  if (value) {
    newData.finishedDate = new Date();
  }
};
</script>
