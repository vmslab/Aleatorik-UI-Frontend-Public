<template>
  <div>
    <div class="moz-frame">
      <dx-data-grid
        ref="dxdatagrid"
        class="moz-datagrid moz-controller-contains-grid"
        height="var(--size-content-height)"
        :data-source="items"
        :allow-column-reordering="true"
        :allow-column-resizing="true"
        :column-auto-width="true"
        column-resizing-mode="widget"
        keyExpr="ID"
        :auto-navigate-to-focused-row="false"
        :show-borders="false"
        :show-column-lines="false"
        :selection="{ mode: 'single' }"
        :hover-state-enabled="true"
        @row-inserted="onRowInserted"
        @row-updated="onRowUpdated"
        @row-removed="onRowRemoved"
        @toolbar-preparing="onToolbarPreparing"
      >
        <template #titleTemplate>
          <div class="moz-controller-title">{{ "Todo" }}</div>
        </template>
        <dx-load-panel :enabled="false" />
        <dx-scrolling mode="infinite" />
        <dx-export :enabled="true" />
        <dx-editing :allow-updating="true" :allow-deleting="true" :allow-adding="true" mode="batch">
          <DxTexts
            :delete-row="$t(`Delete`)"
            :undelete-row="$t(`CANCEL_DELETE`)"
            :confirmDeleteMessage="$t(`RemoveMessage`, [$t(`menu_lang`)])"
          ></DxTexts
        ></dx-editing>
        <dx-filter-row :visible="true" />
        <dx-header-filter :visible="true" />
        <dx-column :visible="true" data-field="ID">
          <dx-form-item :visible="false" />
          <dx-custom-rule :validationCallback="validateKey" :message="$t(`ALREADY_REGISTERED`)" />
        </dx-column>
        <dx-column data-field="TITLE"></dx-column>
        <dx-column data-field="PRIORITY"></dx-column>
        <dx-column data-field="CONTENTS">
          <dx-form-item :col-span="2" :editor-options="{ height: 100 }" editor-type="dxTextArea" />
        </dx-column>
        <dx-column data-field="EXPECTED_DATE">
          <dx-form-item editor-type="dxDateTime" />
        </dx-column>
        <dx-column data-field="IS_FINISHED"></dx-column>
        <dx-column data-field="FINISHED_DATE">
          <dx-form-item editor-type="dxDateTime" />
        </dx-column>
      </dx-data-grid>
    </div>

    <moz-excel-advanced-upload-popup
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
    ></moz-excel-advanced-upload-popup>

    <dx-load-panel
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :close-on-outside-click="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  DxDataGrid,
  DxScrolling,
  DxSorting,
  DxExport,
  DxColumn,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxFormItem,
  DxRequiredRule,
  DxCustomRule,
  DxLookup,
  DxTexts,
} from "devextreme-vue/data-grid";
import { DxTextArea } from "devextreme-vue/text-area";
import { DxButton } from "devextreme-vue/button";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxFileUploader } from "devextreme-vue/file-uploader";

import { MainModule } from "@/store/modules/mainStore";
import { TodoModule } from "@/store/modules/todoStore";
import { ITodo } from "@/generated/types";
import { addData } from "mozart-component-wijmo";
import Entity from "@/generated/entity";
import { Add, Excel, Download, Text } from "@/api/mainService";
import { parseDatas } from "@/utils/request";

@Component({
  components: {
    DxDataGrid,
    DxScrolling,
    DxSorting,
    DxLoadPanel,
    DxExport,
    DxColumn,
    DxFilterRow,
    DxHeaderFilter,
    DxEditing,
    DxFormItem,
    DxRequiredRule,
    DxCustomRule,
    DxLookup,
    DxTexts,
    DxTextArea,
    DxButton,
    DxSelectBox,
    DxDateBox,
    DxPopup,
    DxToolbarItem,
    DxFileUploader,
  },
})
export default class Todo extends Vue {
  public items: ITodo[] = [];
  public file!: File;
  public isShowUploadPopup: boolean = false;
  public excelData: any[] = [];

  constructor() {
    super();
  }

  public get module() {
    return TodoModule;
  }

  public async mounted() {
    await this.loadData();
  }

  public get loading(): boolean {
    return this.module.isLoading;
  }

  public get grid() {
    return (this.$refs.dxdatagrid as any).instance;
  }

  public get uploader() {
    return (this.$refs.uploader as any).instance;
  }

  public async loadData() {
    await TodoModule.loadData(true);
    this.items = TodoModule.getItems;
  }

  public async onRowInserted(e: any) {
    const item = await this.module.getNewItem();
    e.data.TODO_ID = item.TODO_ID;
    const result = await this.module.addData(e.data);
    this.showMessage(this.$t("Add"), result);
  }

  public async onRowUpdated(e: any) {
    const result = await this.module.modifyData(e.data);
    this.showMessage(this.$t("Edit"), result);
  }

  public async onRowRemoved(e: any) {
    const result = await this.module.removeData(e.data);
    this.showMessage(this.$t("Delete"), result);
  }

  public validateKey(e: any): boolean {
    const id = e.data.ID;
    if (id) {
      if (this.module.getItems.filter(t => t.ID === id).length > 1) return false;
    }
    return true;
  }

  public async onAdded(data: any) {
    this.isShowUploadPopup = false;
    const result = await Excel("Todo", data);
    const res = JSON.parse(result.data);
    addData(this.module, this.grid, res, Entity.entities.Todo!.properties);
  }

  // public async onUpload(file: any) {
  //   if (!file) return;
  //   const formdata = new FormData();
  //   formdata.append("file", file);
  //   formdata.append("table", "TODO");
  //   return Excel("Advanced", formdata);
  // }

  public async onUpload(text: string[]) {
    if (!text || text.length === 0) return;
    return Text("Advanced", { table: "TODO", text });
  }

  public async onAppend(data: any[]) {
    return Add("AppendExcel", {
      todos: JSON.stringify(parseDatas(data, Entity.entities?.Todo?.properties!)),
    });
  }

  public async onOverride(data: any[]) {
    return Add("OverrideExcel", {
      todos: JSON.stringify(parseDatas(data, Entity.entities?.Todo?.properties!)),
    });
  }

  public async onDownload() {
    await Download("TodoExcel", { options: {} });
  }

  public showMessage(message: any, result: boolean) {
    MainModule.showSnackBar({
      message: `${message}!`,
      type: result ? "success" : "error",
    });
  }

  public onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift(
      {
        location: "before",
        template: "titleTemplate",
      },
      {
        location: "after",
        widget: "dxButton",
        options: {
          icon: "upload",
          elementAttr: {
            class: "dx-datagrid-import-button",
          },
          onClick: () => {
            this.isShowUploadPopup = true;
          },
        },
      },
    );
  }
}
</script>
