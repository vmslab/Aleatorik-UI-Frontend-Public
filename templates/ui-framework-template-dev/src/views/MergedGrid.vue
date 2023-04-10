<template>
  <div>
    <moz-controller>
      <DxButton
        v-if="checkViewType('C')"
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :text="$t('Add')"
        @click="onAddRow"
      />
      <DxButton
        v-if="checkViewType('D')"
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :text="$t('Delete')"
        :disabled="!showEditButton"
        @click="onRemoveRow"
      />
      <DxButton
        v-if="checkViewType('C') || checkViewType('U') || checkViewType('D')"
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :text="$t('Save')"
        @click="onSaveData"
        :disabled="isChanging"
      />
      <DxButton
        v-if="checkViewType('C') || checkViewType('U') || checkViewType('D')"
        v-tooltip="{ text: $t('Cancel') }"
        class="moz-default-button"
        icon="cancel"
        type="default"
        :text="$t('Cancel')"
        @click="onCancelUpdate"
        :disabled="isChanging"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :text="$t('Search')"
        @click="onRefreshData"
      ></DxButton>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <DxDataGrid
        v-grid-merge="{
          columns: mergedCol,
          affectedPrev: true,
        }"
        :cache-enabled="true"
        class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
        ref="dataGrid"
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :remote-operations="{ groupPaging: true }"
        :data-source="dataSource"
        :row-alternation-enabled="true"
        :show-row-lines="false"
        :show-column-lines="false"
        :allow-column-resizing="true"
        :allow-column-reordering="true"
        :column-auto-width="true"
        :hoverStateEnabled="true"
        :columns="columns"
        columnResizingMode="widget"
        no-data-text="No data to display"
        @initialized="onInitialized"
        @init-new-row="onInitNewRow"
        @toolbar-preparing="onToolbarPreparing"
        @context-menu-preparing="onContextMenuPreparing"
        @selection-changed="onSelectionChanged"
        @option-changed="onOptionChanged"
      >
        <DxEditing mode="batch" :allow-updating="true" start-edit-action="dblClick" />

        <DxScrolling mode="virtual" />
        <DxPaging />
        <DxPager />

        <DxSelection
          mode="multiple"
          select-all-mode="allPages"
          :show-check-boxes-mode="checkViewType('D') ? 'always' : 'none'"
        />

        <template v-if="isLoadedData">
          <DxFilterRow :visible="checkRowFilter" />
          <DxHeaderFilter :visible="true" />
          <DxGroupPanel :visible="checkGroupPanel" />
          <DxGrouping :contextMenuEnabled="useShowGroupPanel" :auto-expand-all="false" />
        </template>

        <DxSummary v-if="dataKey">
          <DxTotalItem
            :column="dataKey[0]"
            alignment="center"
            summary-type="count"
            display-format="{0} Rows"
          />
        </DxSummary>
        <DxColumnFixing :enabled="true" />

        <template v-for="column in columnSetting">
          <DxColumn
            :key="column"
            :data-field="column"
            :data-type="getDataType(column)"
            :customize-text="
              getDataType(column) === 'datetime'
                ? getDateTimeValue
                : getDataType(column) === 'date'
                ? getDateValue
                : getFormatValue
            "
            :allow-editing="
              checkViewType('U') &&
              checkManageProp(column) &&
              (editCol.length == 0 || editCol.includes(column))
            "
            :min-width="120"
          />
        </template>
      </DxDataGrid>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { showConfirm } from "mozart-component-wijmo";
import {
  createStoreConfig,
  ActionLoadOptions,
  setParams,
  makeParams,
} from "mozart-component-wijmo";
import {
  DxDataGrid,
  DxColumn,
  DxExport,
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxPager,
  DxPaging,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxTexts,
  DxSummary,
  DxTotalItem,
  DxColumnFixing,
  DxSelection,
  DxRequiredRule,
} from "devextreme-vue/data-grid";
import { Get, Add, Modify, Remove } from "@/api/mainService";
import { CurrentUser } from "@/utils/common";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import CustomStore from "devextreme/data/custom_store";

import { EventBus } from "mozart-common";

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxExport,
    DxGrouping,
    DxGroupPanel,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxButton,
    DxFilterRow,
    DxHeaderFilter,
    DxEditing,
    DxTexts,
    DxSummary,
    DxTotalItem,
    DxColumnFixing,
    DxSelection,
    DxRequiredRule,
  },
})
export default class MergedGrid extends Vue {
  public data: any[] = [];
  public tableName: string = "";
  public dataKey: string[] = [];

  public useShowRowFilter: boolean = true;
  public useShowGroupPanel: boolean = true;
  public columnSetting: string[] = [];
  public columnTypeInfos: any = {};
  public mergedCol: string[] = [];
  public editCol: string[] = [];

  public useMngProperty: boolean = false;

  public viewType: string = "R";

  public options: Record<string, any> = {};

  public autoExpandAll: boolean = false;
  public checkRowFilter: boolean = true;
  public checkGroupPanel: boolean = false;
  public showEditButton: boolean = false;

  public isChanging: boolean = true;
  public columns: any[] = [];

  public isLoadedData = false;

  constructor() {
    super();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public async onInitialized() {
    const promise = new Promise((resolve: any) => {
      const params = {
        resolve,
      };
      EventBus.fire("load-user-setting", { params });
    });

    promise.then((result: any) => {
      if (result) {
        setParams(this.dataGrid, result);
      }
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

  public getDataType(column: string): string {
    const type = this.columnTypeInfos[column];
    if (type) {
      return type;
    }

    return "string";
  }

  public getDateValue({ value }: any): string {
    return (value as Date)?.toDateString();
  }

  public getDateTimeValue({ value }: any): string {
    return (value as Date)?.toDateTimeString();
  }

  public getFormatValue({ value, valueText }: any): string {
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    switch (typeof value) {
      case "number":
        return valueText.replace(regexp, ",");
    }

    return valueText;
  }

  public showRowFilter(): boolean {
    return this.useShowRowFilter && this.checkRowFilter;
  }

  public showGroupPanel(): boolean {
    return this.useShowGroupPanel && this.checkGroupPanel;
  }

  public onInitNewRow(e: any) {}

  public onSelectionChanged({ selectedRowKeys }: any) {
    const flag = selectedRowKeys.length > 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public mounted() {
    // this.setLeaveEvent();
    const params: any = { params: { options: this.options } };
    EventBus.fire("get-options", params);

    if (this.options && this.options.params) {
      this.tableName = this.setStringParam("tableName");
      this.dataKey = this.setArrayParam("dataKey");

      this.useShowRowFilter = this.setBooleanParam("showRowFilter");
      this.useShowGroupPanel = this.setBooleanParam("showGroupPanel");

      if (!this.useShowRowFilter) this.checkRowFilter = false;
      if (!this.useShowGroupPanel) this.checkGroupPanel = false;

      this.columnSetting = [];
      const columnInfos = this.setArrayParam("columnSetting");
      columnInfos.forEach((info: any) => {
        if (info.includes(":")) {
          const infos = info.split(":");
          this.columnSetting.push(infos[0]);
          this.columnTypeInfos[infos[0]] = infos[1];
        } else {
          this.columnSetting.push(info);
        }
      });

      this.mergedCol = this.setArrayParam("mergedCol");
      this.editCol = this.setArrayParam("editCol");

      if (this.editCol.length > 0) this.viewType = "rud";
      else this.viewType = this.setStringParam("viewType").toLowerCase();

      this.useMngProperty = this.setBooleanParam("useMngProperty");
    } else {
      this.tableName = "OUT_PRODUCTION_PLAN";
      this.dataKey = ["PLAN_SEQ"];

      this.checkRowFilter = this.useShowRowFilter = false;
      this.useShowGroupPanel = true;

      this.columnSetting = [
        "MODULE_KEY",
        "SO_ID",
        "PLAN_SEQ",
        "MO_ID",
        "LOT_ID",
        "ITEM_ID",
        "IN_PLAN_QTY",
        "START_TIME",
        "END_TIME",
        "CREATE_TIME",
        "UPDATE_USER",
      ];
      this.columnTypeInfos = {
        IN_PLAN_QTY: "number",
        START_TIME: "datetime",
        END_TIME: "date",
      };
      this.mergedCol = ["MODULE_KEY", "SO_ID"];
      // this.editCol = ["SO_ID", "MO_ID", "LOT_ID", "ITEM_ID", "IN_PLAN_QTY", "START_TIME"];

      this.viewType = "crud";
    }
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

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        key: this.dataKey,
        loadFunc: this.loadFunc,
        insertFunc: this.insertFunc,
        updateFunc: this.updateFunc,
        deleteFunc: this.deleteFunc,
      }) as any,
    );
  }

  @Watch("checkGroupPanel", { immediate: true })
  public onChangeShowGroupPanel() {
    this.$nextTick(() => {
      let panel = document.querySelector(".dx-datagrid-header-panel") as HTMLElement;
      if (panel != null) panel.style.display = this.showGroupPanel() ? "" : "none";
    });
  }

  public async loadFunc(obj: ActionLoadOptions) {
    const result = await Get("ProdPlan", { option: obj }, "post");
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    return data;
  }

  public setCreateProperty(values: any) {
    values.CREATE_TIME = new Date();
    values.CREATE_USER = CurrentUser();
  }

  public setUpdateProperty(values: any) {
    values.UPDATE_TIME = new Date();
    values.UPDATE_USER = CurrentUser();
  }

  public async insertFunc(values: any) {
    if (this.useMngProperty) {
      this.setCreateProperty(values);
      this.setUpdateProperty(values);
    }
    const result = await Add("ProdPlan", { values: JSON.stringify(values) });
    return JSON.parse(result.data);
  }

  public async updateFunc(key: any, values: any) {
    if (this.useMngProperty) {
      this.setUpdateProperty(values);
    }
    const result = await Modify("ProdPlan", {
      keys: JSON.stringify(key),
      values: JSON.stringify(values),
    });
    return JSON.parse(result.data);
  }

  public async deleteFunc(key: any) {
    const result = await Remove("ProdPlan", { keys: JSON.stringify(key) });
    return JSON.parse(result.data);
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    e.items.push({
      text: "Show Column Chooser",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.showColumnChooser();
      },
    });

    if (this.useShowRowFilter) {
      e.items.push({
        text: "Show Filter Row",
        icon: this.showRowFilter() ? "check" : "",
        beginGroup: true,
        onItemClick: () => {
          this.checkRowFilter = !this.checkRowFilter;
        },
      });
    }

    if (this.useShowGroupPanel) {
      e.items.push({
        text: "Show Group Panel",
        icon: this.showGroupPanel() ? "check" : "",
        onItemClick: (e: any) => {
          this.checkGroupPanel = !this.checkGroupPanel;
        },
      });

      if (e.column && (e.target == "headerPanel" || (e.row && e.row.rowType == "group"))) {
        let expandItems = [
          {
            text: "Expand All",
            onItemClick: (args: any) => {
              this.dataGrid.expandAll();
            },
          },
        ];
        let collapseItems = [
          {
            text: "Collapse All",
            onItemClick: (args: any) => {
              this.dataGrid.collapseAll();
            },
          },
        ];

        if (e.row && e.row.rowType == "group") {
          expandItems.push({
            text: `Expand Group '${e.row.key}'`,
            onItemClick: (args: any) => {
              this.dataGrid.expandRow(e.row.key);
            },
          });
          collapseItems.push({
            text: `Collapse Group '${e.row.key}'`,
            onItemClick: (args: any) => {
              this.dataGrid.collapseRow(e.row.key);
            },
          });
        }

        e.items.push({
          text: "Expand",
          beginGroup: true,
          items: expandItems,
        });
        e.items.push({
          text: "Collpase",
          items: collapseItems,
        });
      }
    }

    e.items.push({
      text: "Export to Excel",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.exportToExcel();
      },
    });

    e.items.push({
      text: "Add Row",
      beginGroup: true,
      onItemClick: (e: any) => {
        this.onAddRow();
      },
    });

    e.items.push({
      text: "Delete Row",
      onItemClick: () => {
        this.onRemoveRow(e.rowIndex);
      },
    });
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }
  }

  public onOptionChanged(e: any) {
    switch (e.name) {
      case "editing":
        let changes = e.component.option("editing.changes");

        this.isChanging = changes.length == 0;
        break;
      case "columns":
        let idx = e.fullName.indexOf("groupIndex");
        if (idx > 0) this.checkGroupPanel = true;
        break;
    }
  }

  public onRefreshData() {
    this.dataGrid.refresh();
  }

  public onAddRow() {
    this.dataGrid.addRow();
    this.dataGrid.deselectAll();
  }

  public onRemoveRow(index: number) {
    let rowIdx = Number.isInteger(index) ? index : -1;
    const selectedRows = this.dataGrid.getSelectedRowKeys();
    if (rowIdx < 0 && selectedRows && selectedRows.length > 0) {
      this.deleteService(selectedRows);
    } else {
      let targetRow = this.dataGrid.getKeyByRowIndex(rowIdx);
      this.deleteService([targetRow]);
    }
  }

  public async deleteService(target: any) {
    let keys = target.map((item: any) => {
      let keyObj: any = {};
      this.dataKey.forEach((key: string) => {
        keyObj[key] = item[key];
      });
      return keyObj;
    });

    const result = await showConfirm({
      title: `Delete`,
      message: `Are you sure you want to <b>Delete</b> ${
        keys.length > 1 ? "these records" : "this record"
      }?`,
    });

    if (result) {
      this.isLoadedData = false;

      this.deleteFunc(keys).then(result => {
        this.$forceUpdate();
      });
    }
  }

  public async onSaveData() {
    const result = await showConfirm({
      type: `info`,
      title: `Save`,
      message: `Are you sure you want to <b>Save</b> edit data?`,
    });
    if (result) {
      this.dataGrid.saveEditData();
      this.dataGrid.deselectAll();
    }
  }

  public async onCancelUpdate() {
    const result = await showConfirm({
      title: `Cancel`,
      message: `Are you sure you want to <b>Cancel</b> edit data?`,
    });
    if (result) {
      this.dataGrid.cancelEditData();
      this.dataGrid.deselectAll();
    }
  }
}
</script>
