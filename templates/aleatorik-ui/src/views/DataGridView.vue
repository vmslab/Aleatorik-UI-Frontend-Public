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
        <label>USE DATA</label>
        <DxSelectBox width="100" v-model="dbType" :items="['CFG', 'ODV', 'OUT']" @value-changed="onDBTypeChanged" />
      </div>
      <div slot="filter">
        <label>DATA TABLE</label>
        <DropDownGrid
          :comboBoxWidth="250"
          :width="320"
          :height="280"
          dataKey="TABLE_NAME"
          :items="tableList"
          :dataFields="[{ name: 'TABLE_NAME', width: '*' }]"
          :selectedValue="tableName"
          @value-changed="onTableNameChanged"
        />
      </div>
      <!-- <div slot="filter">
        <label>DATA KEY</label>
        <DropDownMultiSelectBox
          :key="tableName"
          :width="600"
          :height="320"
          :pageSize="7"
          dataKey="COLUMN_NAME"
          :items="schemaList"
          :dataFields="[{ name: 'COLUMN_NAME' }, { name: 'COLUMN_TYPE' }]"
          :selectedValue="dataKey"
          @value-changed="onDataKeyChanged"
        />
      </div> -->
      <div slot="filter" v-show="['ODV', 'OUT'].includes(this.dbType)">
        <label>PLAN_VERSION</label>
        <DropDownGrid
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="planVersion"
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
      <ExcelAdvancedUploadPopup
        v-if="showImportPopup"
        :visible="showImportPopup"
        :key-columns="selectedDataKey"
        :except-columns="selectedExceptColumns"
        :data="excelData"
        :upload="onUpload"
        :append="onAppend"
        :override="onOverride"
        @reload="onRefreshData"
        @closed="showImportPopup = false"
        @notify="onPopupNotify"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import {
  ActionLoadOptions,
  showConfirm,
  ExcelAdvancedUploadPopup,
  showAlert,
  ExtendGrid,
} from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { InputDateTime, InputNumber } from "@grapecity/wijmo.input";

import { CollectionView } from "@grapecity/wijmo";
import { FlexGrid } from "@grapecity/wijmo.grid";
import {
  Get,
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
  getTableSchema,
  getSchemaInformation,
  getVersionNo,
  setVersionNo,
  getVersionDatas,
  setCreateProperty,
  setUpdateProperty,
} from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import DxSelectBox from "devextreme-vue/select-box";

import DropDownGrid from "@/components/DropDownGrid.vue";
import DropDownMultiSelectBox from "@/components/DropDownMultiSelectBox.vue";

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
    WjFlexGrid,
    WjFlexGridColumn,
    DxButton,
    DxLoadPanel,
    DxSelectBox,
    DropDownGrid,
    DropDownMultiSelectBox,
    ExcelAdvancedUploadPopup,
  },
})
export default class SimpleEditTableWithVersion extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;
  public isValid = false;

  public dbType: string = "CFG";
  public tableName: string = "";
  public dataKey: any = [];
  public exceptColumns: any = [];
  public planVersion: string = "";

  public selectedDBType: string = "CFG";
  public selectedTableName: string = "";
  public selectedDataKey: any = [];
  public selectedExceptColumns: any = [];
  public selectedPlanID: string = "";

  public columnSetting: ColumnInfo[] = [];
  public excelData: any[] = [];

  public options: Record<string, any> = {};

  public autoExpandAll = false;
  public activeDelete = false;
  public loadingVisible = false;

  public isEditing = false;
  public showImportPopup = false;

  public dataGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public dateEditor = new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  });
  public numberEditor = new InputNumber(document.createElement("div"), {
    format: "n",
  });

  public tableList: any = [];
  public planVersionItems: any = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];

  constructor() {
    super();
  }

  public versionWhere() {
    const where = ["ODV", "OUT"].includes(this.dbType) ? { PLAN_VERSION: this.selectedPlanID } : null;
    return where;
  }

  public async onExportExcel() {
    if (!this.selectedTableName) return;

    this.loadingVisible = true;
    try {
      await DownloadExcelTable(this.selectedTableName, {
        options: this.versionWhere() ? { filter: [["PLAN_VERSION", "=", this.versionWhere()?.PLAN_VERSION]] } : {},
      });
    } finally {
      this.loadingVisible = false;
    }
  }

  public onInitialized(grid: FlexGrid) {
    this.dataGrid = grid;
    grid.selectionChanged.addHandler(this.onSelectionChanged);
    grid.cellEditEnded.addHandler(this.onCellEditEnded);

    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
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
        // setContextMenuProps: {
        //   onImportExcel: () => {
        //     this.showImportPopup = true;
        //   },
        //   onExportOriginalData: async () => {
        //     await this.onExportExcel();
        //   },
        // },
      },
    });
  }

  public async mounted() {
    await this.onRefreshData();
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
      if (this.columnSetting.length > 0) this.columnSetting = [];

      for await (const info of Columns) {
        if (this.exceptColumns.includes(info.Name)) continue;
        let type = "";
        switch (info.JsType?.toLowerCase()) {
          case "date":
          case "datetime":
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

  public async setVersionControl() {
    this.planVersionItems = await getVersionDatas(["DONE", "READY"]);

    if (this.planVersionItems.length === 0) return;
    this.isValid = true;

    const planVersion = getVersionNo();

    this.planVersion = planVersion || this.planVersionItems[0].PLAN_ID;
  }

  public async onUpload(file: any) {
    if (!file) return;
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("table", this.selectedTableName);
    return ExcelAdvancedTable(formdata);
  }

  public async onAppend(data: any[]) {
    const dataSet = data.map((d: any) => {
      if (this.exceptColumns) {
        this.exceptColumns.forEach((exceptColumn: any) => {
          delete d[exceptColumn];
        });
      }
      return d;
    });
    return AppendExcelTable(this.selectedTableName, dataSet);
  }

  public async onOverride(data: any[]) {
    const dataSet = data.map((d: any) => {
      if (this.exceptColumns) {
        this.exceptColumns.forEach((exceptColumn: any) => {
          delete d[exceptColumn];
        });
      }
      return d;
    });
    return OverrideExcelTable(this.selectedTableName, dataSet, this.versionWhere());
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.selectedTableName) return [];

    const result = await GetTableRemote(this.selectedTableName, obj, this.versionWhere());
    const data = JSON.parse(result.data);
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

  public onExporting(e: any) {
    e.fileName = `${this.selectedTableName}_${dateToFormat(new Date(), "YYYYMMDD")}`;
  }

  public onDBTypeChanged(e: any) {
    this.refreshDataSource();
  }

  public async onTableNameChanged(e: any) {
    this.tableName = e.TABLE_NAME;

    const schemaInfos = await getSchemaInformation(this.tableName);

    this.dataKey = schemaInfos
      .filter((info: any) => info.IS_PRIMARY_KEY === "Y" || info.IS_IDENTITY === "Y")
      .map((info: any) => info.COLUMN_NAME);

    if (this.extendGrid) this.extendGrid.dataKey = this.dataKey;

    this.exceptColumns = schemaInfos
      .filter((info: any) => info.IS_IDENTITY === "Y")
      .map((info: any) => info.COLUMN_NAME);

    // const data = await getTableSchema(this.tableName);
    // this.schemaList = data.Columns.map((item: any) => {
    //   return { COLUMN_NAME: item.Name, COLUMN_TYPE: item.JsType };
    // });
  }

  // public async onDataKeyChanged(e: any) {
  //   if (e.length === 0) {
  //     this.dataKey = [];
  //     return;
  //   }
  //   this.dataKey = e.map((item: any) => item.COLUMN_NAME);
  // }

  public async onVersionChanged(e: any) {
    this.planVersion = e.PLAN_ID;

    setVersionNo(this.planVersion);
  }

  public async refreshDataSource() {
    const result = await Get("TableNames");
    const data = JSON.parse(result.data);
    this.tableList = data.filter((item: any) => item.TABLE_NAME.startsWith(this.dbType));
    this.tableList.sort((x: any, y: any) => (x.TABLE_NAME > y.TABLE_NAME ? 1 : x.TABLE_NAME === y.TABLE_NAME ? 0 : -1));

    await this.setVersionControl();
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    await this.refreshDataSource();

    if (!this.tableName) {
      this.loadingVisible = false;
      await showAlert({ message: `${this.$t("Invalid Request")}`, type: "error", title: "Error" });
      return;
    }
    try {
      setOnEditing(false);

      this.selectedDBType = this.dbType;
      this.selectedTableName = this.tableName;
      this.selectedDataKey = this.dataKey;
      this.selectedExceptColumns = this.exceptColumns;
      this.selectedPlanID = this.planVersion;

      this.columnSetting = [];
      const schema = await getTableSchema(this.tableName);
      await this.setTableSchema(schema);

      this.dataSource = new CollectionView(await this.loadFunc({}), { refreshOnEdit: false });
      this.extendGrid?.refresh();
    } finally {
      this.isValid = true;
      this.loadingVisible = false;
    }
  }

  public onPopupNotify(e: any) {
    MainModule.showSnackBar({
      message: e.message,
      type: e.type,
    });
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
