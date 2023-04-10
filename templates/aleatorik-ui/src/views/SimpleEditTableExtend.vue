<template>
  <div>
    <moz-controller>
      <DxButton
        v-if="checkViewType('C')"
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Add')"
        @click="onAddRow"
      />
      <DxButton
        v-if="checkViewType('D')"
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
        v-if="checkViewType('C') || checkViewType('U') || checkViewType('D')"
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
        v-if="checkViewType('C') || checkViewType('U') || checkViewType('D')"
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
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <WjFlexGrid
        style="width: 100%; height: var(--size-content-inner-height-outer-controller)"
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
        :formatItem="formatItem"
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
        :visible="showImportPopup"
        :key-columns="dataKey"
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
import { Component, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { ActionLoadOptions, showConfirm, ExcelAdvancedUploadPopup, ExtendGrid } from "mozart-component-wijmo";
import { DxLoadPanel as GridLoadPanel } from "devextreme-vue/data-grid";
import {
  GetTableRemote,
  SaveChanges,
  ExcelAdvancedTable,
  AppendExcelTable,
  OverrideExcelTable,
  DownloadExcelTable,
} from "@/api/mainService";
import { setOnEditing, setCreateProperty, setUpdateProperty, getTableSchema } from "@/utils/commonUtils";
import "@/utils/dateUtils";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { WjFlexGridFilter } from "@grapecity/wijmo.vue2.grid.filter";
import { WjGroupPanel } from "@grapecity/wijmo.vue2.grid.grouppanel";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { EventBus } from "mozart-common";

import sample from "@/utils/sampleDatas";
import { InputDateTime, InputNumber } from "@grapecity/wijmo.input";
import { CollectionView } from "@grapecity/wijmo";

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
    GridLoadPanel,
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridFilter,
    WjGroupPanel,
    ExcelAdvancedUploadPopup,
  },
})
export default class SimpleEditTableExtend extends Vue {
  public data: any[] = [];
  public tableName: string = "";
  public dataKey: string[] = [];

  public columnSetting: ColumnInfo[] = [];
  public excelData: any[] = [];

  public mergedCol: string[] = [];
  public editCol: string[] = [];

  public useMngProperty = false;

  public viewType = "r";

  public options: Record<string, any> = {};

  public activeDelete = false;
  public isEditing = false;
  public isShowUploadPopup = false;
  public loadingVisible = false;
  public isValid = false;
  public showImportPopup = false;

  public gridWidth = 0;

  public dataGrid: any;
  public extendGrid: ExtendGrid | null = null;
  public gridFilter: any = null;
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

  public async mounted() {
    const params: any = { params: { options: this.options } };
    EventBus.fire("get-options", params);

    if (this.options == null || this.options.params == null) {
      this.options.params = sample.standard;
    }

    if (this.options && this.options.params) {
      this.tableName = this.setStringParam("tableName");
      this.dataKey = this.setArrayParam("dataKey");
      if (this.extendGrid) this.extendGrid.dataKey = this.dataKey;

      const columnInfos = this.setArrayParam("columnSetting");
      if (columnInfos.length > 0) {
        this.setColumnSettings(columnInfos);
      } else {
        const schema = await getTableSchema(this.tableName);
        this.setTableSchema(schema);
      }

      this.mergedCol = this.setArrayParam("mergedCol");
      this.editCol = this.setArrayParam("editCol");

      if (this.editCol.length > 0) this.viewType = "rud";
      else this.viewType = this.setStringParam("viewType").toLowerCase();

      this.useMngProperty = this.setBooleanParam("useMngProperty");
    }

    await this.onRefreshData();
  }

  public onInitialized(grid: any) {
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
        onSaveEditData: async (addItems: Array<any>, updateItems: Array<any>, removedItems: Array<any>) => {
          this.loadingVisible = true;
          try {
            const result = await this.saveFunc(addItems, updateItems, removedItems);
            console.log(result);
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
                options: {},
              });
            } finally {
              this.loadingVisible = false;
            }
          },
        },
      },
    });
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

  public checkViewType(type: string): boolean {
    return this.viewType.includes(type.toLowerCase());
  }

  public checkManageProp(column: string): boolean {
    if (this.useMngProperty) {
      switch (column) {
        case "CREATE_TIME":
        case "CREATE_USER":
        case "UPDATE_TIME":
        case "UPDATE_USER":
          return false;
      }
    }

    return true;
  }

  public formatItem(s: any, e: any) {
    if (e.panel !== s.cells) return;
    if (!this.checkViewType("u")) return;

    const binding = s.columns[e.col]?.binding;
    if (this.editCol.includes(binding)) {
      e.cell.style.backgroundColor = "#ffffe0";
    }
  }

  public async setTableSchema({ Columns }: any) {
    return new Promise(async resolve => {
      for await (const info of Columns) {
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
          // width: calcColumnWidth(infos[0]),
          // minWidth: calcColumnWidth(infos[0]),
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

  public async onUpload(file: any) {
    if (!file) return;
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("table", this.tableName);
    return ExcelAdvancedTable(formdata);
  }

  public async onAppend(data: any[]) {
    return await AppendExcelTable(this.tableName, data);
  }

  public async onOverride(data: any[]) {
    return await OverrideExcelTable(this.tableName, data);
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];

    const result = await GetTableRemote(this.tableName, obj);
    const data = JSON.parse(result.data);

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

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      setOnEditing(false);

      this.dataSource = new CollectionView(await this.loadFunc({}), {
        refreshOnEdit: false,
      });
      this.extendGrid?.refresh();
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
