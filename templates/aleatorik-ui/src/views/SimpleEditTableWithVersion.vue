<template>
  <div>
    <moz-controller :showFilter="filter">
      <button class="filter-icon" @click="filter = !filter">
        <i
          v-tooltip="{ text: filter ? $t('HideFilter') : $t('ShowFilter') }"
          class="mozart-icons"
          :class="{
            'moz-filter-icon': !filter,
            'moz-filter-icon-tap': filter,
          }"
        />
      </button>

      <div class="spacer" />

      <DxButton
        v-if="!isReadOnly && !isVersionDone"
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Add')"
        :disabled="!isValid"
        @click="onAddRow"
      />
      <DxButton
        v-if="!isReadOnly && !isVersionDone"
        v-tooltip="{ text: $t('Clone') }"
        class="moz-default-button"
        icon="copy"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Clone')"
        :disabled="!isValid"
        @click="onCloneData"
      />
      <DxButton
        v-if="!isReadOnly && !isVersionDone"
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Delete')"
        :disabled="!isValid || !activeDelete"
        @click="onRemoveRow"
      />
      <DxButton
        v-if="!isReadOnly && !isVersionDone"
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Save')"
        @click="onSaveData"
        :disabled="!isValid || !isEditing"
      />
      <DxButton
        v-if="!isReadOnly && !isVersionDone"
        v-tooltip="{ text: $t('Cancel') }"
        class="moz-default-button"
        icon="cancel"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Cancel')"
        @click="onCancelUpdate"
        :disabled="!isValid || !isEditing"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Search')"
        @click="onRefreshData"
      />

      <div slot="filter">
        <label>PLAN_VERSION</label>
        <DropDownGrid
          :comboBoxWidth="220"
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <WjFlexGrid
        style="width: 100%; height: calc(var(--size-content-inner-height-outer-controller) - 3px)"
        :itemsSource="dataSource"
        :initialized="onInitialized"
        showSelectedHeaders="All"
        selectionMode="MultiRange"
        allowSorting="MultiColumn"
        keyActionTab="Cycle"
        :allowDelete="true"
        :autoGenerateColumns="false"
        :deferResizing="true"
        :quickAutoSize="true"
        :imeEnabled="true"
        :alternatingRowStep="0"
        :showMarquee="true"
        :isReadOnly="isReadOnly"
      >
        <WjFlexGridColumn
          v-for="(column, index) in columnSetting"
          :key="column.key"
          :binding="column.name"
          :header="column.caption"
          :dataType="column.dataType"
          :format="column.format"
          :editor="column.editor"
          :isRequired="dataKey.includes(column.name)"
          :aggregate="index === 0 ? 'Cnt' : 'None'"
        />
      </WjFlexGrid>

      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
      <!-- <ExcelAdvancedUploadPopup
        :visible="showImportPopup"
        :key-columns="dataKey"
        :data="excelData"
        :upload="onUpload"
        :append="onAppend"
        :override="onOverride"
        @reload="onRefreshData"
        @closed="showImportPopup = false"
        @notify="onPopupNotify"
      /> -->
      <ATPlanCloneDialog
        v-if="showCloneDialog"
        :key="showCloneDialog"
        :visible="showCloneDialog"
        :version="selectedPlanID"
        @close="onCloneClose"
        @complete="onCloneComplete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { ActionLoadOptions, showConfirm, ExcelAdvancedUploadPopup, ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { InputDateTime, InputNumber } from "@grapecity/wijmo.input";

import { CollectionView } from "@grapecity/wijmo";
import { FlexGrid } from "@grapecity/wijmo.grid";

import {
  GetTableRemote,
  SaveChanges,
  ExcelAdvancedTable,
  AppendExcelTable,
  OverrideExcelTable,
  DownloadExcelTable,
} from "@/api/mainService";
import {
  dateToFormat,
  setOnEditing,
  setCreateProperty,
  setUpdateProperty,
  setVersionNo,
  getVersionNo,
  getVersionDatas,
  getTableSchema,
} from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { EventBus } from "mozart-common";

import ATPlanCloneDialog from "@/views/Plan/ATPlanCloneDialog.vue";
import DropDownGrid from "@/components/DropDownGrid.vue";

import sample from "@/utils/sampleDatas";

interface ColumnInfo {
  key: string;
  name: string;
  caption: string;
  dataType: string | null;
  visible: boolean;
  editor: object | null;
  format: string | null;
}

@Component({
  components: {
    DxButton,
    DxLoadPanel,
    WjFlexGrid,
    WjFlexGridColumn,
    ATPlanCloneDialog,
    DropDownGrid,
    ExcelAdvancedUploadPopup,
  },
})
export default class SimpleEditTableWithVersion extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;
  public isValid = false;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];
  public selectedPlanID: string = "";

  public tableName: string = "";
  public dataKey: string[] = [];

  public hideVersion = true;
  public isReadOnly = true;
  public isVersionDone = false;
  public columnSetting: ColumnInfo[] = [];
  public excelData: any[] = [];

  public options: Record<string, any> = {};

  public activeDelete = false;
  public showCloneDialog = false;
  public loadingVisible = false;

  public isEditing = false;
  public isLoadedData = false;
  public showImportPopup = false;

  public gridWidth = 0;

  public dataGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public dateEditor = new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  });
  public numberEditor = new InputNumber(document.createElement("div"), {
    format: "n",
  });

  constructor() {
    super();
  }

  public onInitialized(grid: FlexGrid) {
    this.dataGrid = grid;
    grid.selectionChanged.addHandler(this.onSelectionChanged);
    grid.cellEditEnded.addHandler(this.onCellEditEnded);

    this.extendGrid = new ExtendGrid({
      name: "main",
      flexGrid: this.dataGrid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
        onInitialzeRowData: () => {
          return { PLAN_VERSION: this.selectedPlanID };
        },
        onSaveEditData: async (addItems: Array<any>, updateItems: Array<any>, removedItems: Array<any>) => {
          this.loadingVisible = true;
          try {
            const result = await this.saveFunc(addItems, updateItems, removedItems);
            console.log(result);
            return true;
          } catch {
            return false;
          } finally {
            this.loadingVisible = false;
          }
        },
        setContextMenuProps: {
          useExportExcel: true,
          onImportExcel: () => {
            this.showImportPopup = true;
          },
          onExportOriginalData: async () => {
            this.loadingVisible = true;
            try {
              await DownloadExcelTable(this.tableName, {
                options: { filter: ["PLAN_VERSION", "=", this.getSelectedVersion()] },
              });
            } finally {
              this.loadingVisible = false;
            }
          },
        },
      },
    });
  }

  public async mounted() {
    const params: any = { params: { options: this.options } };
    EventBus.fire("get-options", params);

    if (this.options == null || this.options.params == null) {
      this.options.params = sample.version;
    }

    if (this.options && this.options.params) {
      this.tableName = this.setStringParam("tableName");
      this.dataKey = this.setArrayParam("dataKey");
      if (this.extendGrid) this.extendGrid.dataKey = this.dataKey;

      this.hideVersion = this.setBooleanParam("hideVersion");
      this.isReadOnly = this.setBooleanParam("isReadOnly");

      const columnInfos = this.setArrayParam("columnSetting");
      if (columnInfos.length > 0) {
        await this.setColumnSettings(columnInfos);
      } else {
        const schema = await getTableSchema(this.tableName);
        await this.setTableSchema(schema);
      }
    }
    await this.setVersionControl();
    await this.onRefreshData();
  }

  public checkManageProp(column: string): boolean {
    switch (column) {
      case "CREATE_TIME":
      case "CREATE_USER":
      case "UPDATE_TIME":
      case "UPDATE_USER":
        return false;
    }

    return true;
  }

  public getSelectedVersion() {
    return this.selectedPlanID;
  }

  public onVersionChanged(e: any) {
    this.selectedPlanID = e.PLAN_ID;
    const planVersionItem = this.planVersionItems.find((item: any) => item.PLAN_ID === e.PLAN_ID);

    if (planVersionItem.STATUS === "DONE") {
      this.isVersionDone = true;
    } else {
      this.isVersionDone = false;
    }

    setVersionNo(this.selectedPlanID);
  }

  public onSelectionChanged() {
    if (!this.dataGrid) return;
    const selectedRows = this.dataGrid.rows.filter((r: any) => r.isVisible && r.isSelected);
    const flag = selectedRows.length > 0;
    if (this.activeDelete != flag) this.activeDelete = flag;
  }

  public onCellEditEnded() {
    this.$nextTick(() => {
      if (!this.extendGrid) return;
      const flag = this.extendGrid.isEditing;
      if (this.isEditing != flag) this.isEditing = flag;
    });
  }

  public async setTableSchema({ Columns }: any) {
    return new Promise(async resolve => {
      for await (const info of Columns) {
        if (this.hideVersion && info.Name === "PLAN_VERSION") continue;

        let type = "";
        switch (info.JsType?.toLowerCase()) {
          case "date":
          case "dateTime":
            type = "Date";
            break;
          case "boolean":
            type = "Boolean";
            break;
          case "number":
            type = "Number";
            break;
          default:
            type = "String";
            break;
        }

        this.columnSetting.push({
          key: info.Name,
          name: info.Name,
          caption: info.Name,
          dataType: type,
          editor: type === "Date" ? this.dateEditor : type === "Number" ? this.numberEditor : null,
          format: type === "Date" ? "yyyy-MM-dd HH:mm:ss" : type === "Number" ? "n2" : null,
          visible: true,
        });
      }

      resolve(true);
    });
  }

  public setColumnSettings(columnInfos: string[]) {
    return new Promise(async resolve => {
      for await (const info of columnInfos) {
        const infoSet = info.split(";");
        const infos = infoSet[0].split(":");
        if (this.hideVersion && infos[0] === "PLAN_VERSION") continue;

        let type = infos.length > 1 ? infos[1] : "String";
        switch (type.toLowerCase()) {
          case "date":
          case "dateTime":
            type = "Date";
            break;
          case "boolean":
            type = "Boolean";
            break;
          case "number":
            type = "Number";
            break;
          default:
            type = "String";
            break;
        }
        this.columnSetting.push({
          key: infos[0],
          name: infos[0],
          caption: infoSet.length > 1 ? infoSet[1] : infos[0],
          dataType: type,
          editor: type === "Date" ? this.dateEditor : type === "Number" ? this.numberEditor : null,
          format: type === "Date" ? "yyyy-MM-dd HH:mm:ss" : type === "Number" ? "n" : null,
          visible: true,
        });
      }

      resolve(true);
    });
  }

  public async setVersionControl() {
    this.planVersionItems = await getVersionDatas(["DONE", "READY"]);

    if (this.planVersionItems.length === 0) return;
    // this.isValid = true;

    const planVersion = getVersionNo();

    this.selectedPlanID = planVersion || this.planVersionItems[0].PLAN_ID;
  }

  public setStringParam(key: string, defaultValue: string = "") {
    if (!key) return defaultValue;
    let data = this.options.params[key];

    if (!data) return defaultValue;
    return data.toString();
  }

  public setArrayParam(key: string, defaultValue: string[] = []) {
    if (!key) return defaultValue;
    let data = this.options.params[key];

    if (!data) return defaultValue;
    return this.trimSplit(data, ",");
  }

  public setBooleanParam(key: string, defaultValue: boolean = true) {
    if (!key) return defaultValue;
    let data = this.options.params[key];

    if (typeof data === "boolean") return data;

    if (!data) return defaultValue;

    return data.toString().toLowerCase() === "true";
  }

  public trimSplit(data: string, delemeter: string): string[] {
    try {
      return data.split(delemeter).map((x: any) => x.trim());
    } catch {
      return [];
    }
  }

  public async onUpload(file: any) {
    if (!file) return;
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("table", this.tableName);
    return ExcelAdvancedTable(formdata);
  }

  public async onAppend(data: any[]) {
    return AppendExcelTable(this.tableName, data);
  }

  public async onOverride(data: any[]) {
    return OverrideExcelTable(this.tableName, data, {
      PLAN_VERSION: this.selectedPlanID,
    });
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName || !this.selectedPlanID) return [];

    const result = await GetTableRemote(this.tableName, obj, {
      PLAN_VERSION: this.selectedPlanID,
    });
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    this.isValid = true;

    return data.data;
  }

  public async saveFunc(addedItems: any[], updatedItems: any[], removedItems: any[]) {
    if (!this.tableName) return [];
    try {
      const addRows = addedItems.map(item => {
        item.data = setUpdateProperty(setCreateProperty(item.data));
        return JSON.stringify(item);
      });
      const updateRows = updatedItems.map(item => {
        item.data = setUpdateProperty(item.data);
        return JSON.stringify(item);
      });
      const removeRows = removedItems.map(item => JSON.stringify(item));
      const result = await SaveChanges(this.tableName, addRows, updateRows, removeRows);
      return JSON.parse(result.data);
    } catch (e) {
      return e;
    }
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }
  }

  public onExporting(e: any) {
    e.fileName = `${this.tableName}_${dateToFormat(new Date(), "YYYYMMDD")}`;
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      setOnEditing(false);

      this.dataSource = new CollectionView(await this.loadFunc({}), { refreshOnEdit: false });
      this.extendGrid?.refresh();
    } catch (e) {
      console.log("err :: ", e);
    } finally {
      this.loadingVisible = false;
    }
  }

  public onPopupNotify(e: any) {
    MainModule.showSnackBar({
      message: e.message,
      type: e.type,
    });
  }

  public onCloneData() {
    this.showCloneDialog = !this.showCloneDialog;
  }

  public async onCloneComplete() {
    this.planVersionItems = await getVersionDatas(["DONE", "READY"]);

    this.selectedPlanID = this.planVersionItems[0].PLAN_ID;
    this.showCloneDialog = false;
  }

  public onCloneClose() {
    this.showCloneDialog = false;
  }

  public onAddRow() {
    this.extendGrid?.addRow();
  }

  public onRemoveRow() {
    this.extendGrid?.removeRow();
  }

  public async onSaveData() {
    const result = await showConfirm({
      message: `${this.$t(`SaveMessage`)}`,
      // type: `info`,
      // title: `Save`,
      // message: `Are you sure you want to <b>Save</b> edit data?`,
    });
    if (result) {
      this.extendGrid?.saveEditData();
    }
  }

  public async onCancelUpdate() {
    const result = await showConfirm({
      message: `${this.$t(`CancelMessage`)}`,
      // title: `Cancel`,
      // message: `Are you sure you want to <b>Cancel</b> edit data?`,
    });
    if (result) {
      this.extendGrid?.clearChanges();
    }
  }
}
</script>
