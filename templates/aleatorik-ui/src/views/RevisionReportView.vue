<template>
  <div>
    <moz-controller :showFilter="filter">
      <DxButton
        v-tooltip="{ text: $t('Run') }"
        class="moz-default-button"
        icon="play"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Run')"
        :disabled="!selectedPlanID"
        @click="onExecutePlan"
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
      <i
        v-if="filter"
        slot="title"
        v-tooltip="{ text: $t('HideFilter') }"
        @click="filter = !filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        slot="title"
        v-tooltip="{ text: $t('ShowFilter') }"
        @click="filter = !filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
      <div slot="filter">
        <label>PLAN_VERSION</label>
        <DropDownBox
          :width="677"
          :height="281"
          :pageSize="7"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="planVersion"
          @value-changed="onVersionChanged"
        />
      </div>
      <div slot="filter">
        <label>SOURCE_ID</label>
        <DxTextBox v-model="sourceID" :read-only="true" />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <SplitBox
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :minWidth="400"
        :boxes="[
          { type: 'rate', size: 1, minWidth: 100 },
          { type: 'rate', size: 3, minWidth: 300 },
        ]"
        resizable
        horizontal
      >
        <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
          <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
            <div class="dx-card-title">
              <div class="dx-card-title-text">REVISION TABLE</div>
            </div>
            <DxList
              ref="tableList"
              class="moz-list"
              :width="parentsWidth"
              :height="contentsHeight"
              :data-source="changedTables"
              :search-enabled="true"
              search-mode="contains"
              search-expr="key"
              :allow-item-deleting="false"
              :focus-state-enabled="false"
              :active-state-enabled="false"
              :show-selection-controls="true"
              page-load-mode="scrollBottom"
              key-expr="key"
              selection-mode="none"
              :selected-item-keys="selectedItemKeys"
              @item-click="onItemClick"
            >
              <template #item="{ data: item }">
                <div>
                  <div class="text-area">
                    <div class="moz-body-02">{{ item.key }}</div>
                    <div class="moz-body-02 moz-color-font5">Count ({{ item.count }})</div>
                  </div>
                </div>
              </template>
            </DxList>
          </div>
        </template>
        <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
          <DxDataGrid
            v-cell-tooltip
            v-show="isValid"
            :cache-enabled="true"
            class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
            ref="dataGrid"
            :width="parentsWidth"
            :height="parentsHeight"
            :data-source="dataSource"
            :show-row-lines="false"
            :show-column-lines="false"
            :allow-column-resizing="true"
            :allow-column-reordering="true"
            :column-auto-width="false"
            :hover-state-enabled="true"
            column-resizing-mode="widget"
            no-data-text="No data to display"
            @toolbar-preparing="onToolbarPreparing"
            @context-menu-preparing="onContextMenuPreparing"
            @selection-changed="onSelectionChanged"
            @option-changed="onOptionChanged"
            @exporting="onExporting"
            @row-prepared="onRowPrepared"
          >
            <DxScrolling mode="infinity" />
            <DxPaging />
            <DxPager :show-navigation-buttons="true" />

            <GridLoadPanel :enabled="false" />

            <DxFilterRow :visible="gridContextOptions.checkRowFilter" />
            <DxHeaderFilter :visible="true" />
            <DxSorting mode="multiple" />

            <DxColumnFixing :enabled="true" />

            <DxColumn data-field="COMMAND" width="auto" />
            <template v-for="column in columnSetting">
              <DxColumn
                :key="column.key"
                :data-field="column.name"
                :data-type="
                  column.type
                    ? column.type === 'date'
                      ? 'datetime'
                      : column.type
                    : column.name.endsWith('TIME')
                    ? 'datetime'
                    : 'string'
                "
                :caption="column.caption"
                :format="getDisplayFormat(column.type)"
                :visible="column.visible"
                width="auto"
              />
            </template>
            <DxColumn
              :show-in-column-chooser="false"
              data-filed="_blank"
              caption=""
              :allowEditing="false"
              :allowExporting="false"
              :allowFiltering="false"
              :allowGrouping="false"
              :allowHeaderFiltering="false"
              :allowReordering="false"
              :allowSorting="false"
            />
          </DxDataGrid>
        </template>
      </SplitBox>
      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { createStoreConfig, ActionLoadOptions, showConfirm, showAlert } from "mozart-component-wijmo";
import {
  DxDataGrid,
  DxColumn,
  DxExport,
  DxScrolling,
  DxPager,
  DxPaging,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxSorting,
  DxTexts,
  DxSummary,
  DxTotalItem,
  DxColumnFixing,
  DxRequiredRule,
  DxLoadPanel as GridLoadPanel,
} from "devextreme-vue/data-grid";
import { Get, RunRevisionTable } from "@/api/mainService";
import { createContextMenu } from "@/utils/gridUtils";
import { dateToFormat, setOnEditing, getTableSchema, getVersionDatas } from "@/utils/commonUtils";
import { loadDistinctRemoteDatas } from "@/utils/dataUtils";

import { DxTextBox } from "devextreme-vue/text-box";
import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import CustomStore from "devextreme/data/custom_store";

import { DxList } from "devextreme-vue/list";
import { SplitBox } from "mozart-component-wijmo";
import DropDownBox from "@/components/DropDownBox.vue";
import DropDownMultiSelectBox from "@/components/DropDownMultiSelectBox.vue";
import { CurrentEmail } from "@/utils/common";

interface ColumnInfo {
  key: string;
  name: string;
  caption: string;
  type: string;
  visible: boolean;
}

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxExport,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxTextBox,
    DxButton,
    DxFilterRow,
    DxHeaderFilter,
    DxSorting,
    DxTexts,
    DxSummary,
    DxTotalItem,
    DxColumnFixing,
    DxRequiredRule,
    DxLoadPanel,
    GridLoadPanel,
    DxList,
    SplitBox,
    DropDownBox,
    DropDownMultiSelectBox,
  },
})
export default class RevisionReportView extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;
  public isValid = false;

  public tableName: string = "";
  public dataKey: any = ["REVISION_SEQ"];
  public planVersion: string = "";

  public sourceID: string = "";

  public selectedPlanID: string = "";

  public columnSetting: ColumnInfo[] = [];

  public options: Record<string, any> = {};

  public loadingVisible = false;

  public isChanging = false;

  public dataGrid: any = null;

  // public schemaList: any = [];
  public planVersionItems: any = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];
  public changedTables: any[] = [];
  public selectedItemKeys: any[] = [];

  public gridContextOptions: any = {
    checkRowFilter: true,
    useImportExcel: false,
    useExportExcel: false,
  };

  constructor() {
    super();
  }

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        key: this.dataKey,
        loadFunc: this.loadFunc,
      }) as any,
    );
  }

  public async created() {
    // const urlParams = new URLSearchParams(window.location.search);
    // const planVersion = urlParams.get("v");
    // if (planVersion) {
    //   this.planVersion = this.selectedPlanID = planVersion;
    // }

    await this.refreshDataSource();
    this.selectedPlanID = this.planVersion;
  }

  public async mounted() {
    this.$nextTick(async () => {
      this.dataGrid = (this.$refs.dataGrid as any)?.instance;
    });
  }

  public getDisplayFormat(type: string): string {
    if (!type) return "";

    switch (type) {
      case "date":
        return "yyyy-MM-dd";
      case "datetime":
        return "yyyy-MM-dd HH:mm:ss";
      case "number":
        return ",##0.#########";
    }
    return "";
  }

  public onSelectionChanged({ component, selectedRowKeys }: any) {
    const flag = selectedRowKeys.length > 0;
  }

  public async onRowPrepared(e: any) {
    if (!this.isDataCell(e)) return;

    const appearance = this.getConditionalAppearance(e.data.COMMAND);

    if (!appearance) return;

    // Object.assign(e.rowElement.style, this.getConditionalCssStyles(appearance, true));

    const targetCell = e.cells.find((cell: any) => cell.column.dataField === "COMMAND");
    Object.assign(targetCell?.cellElement.style, this.getConditionalCssStyles(appearance, true));

    // e.cells.forEach(({ column, cellElement }: any) => {
    //   if (column.dataField === "SO_ID")
    //     Object.assign(cellElement.style, this.getConditionalCssStyles(appearance, true));
    // });
  }

  public getConditionalAppearance(command: string) {
    switch (command) {
      case "add":
        return { fill: "CCE5FF", bold: true };
      case "update":
        return { fill: "FFFFCC", bold: true };
      case "delete":
        return { fill: "FFCCCC", bold: true };
      default:
        return { bold: true };
    }
  }

  public getConditionalCssStyles({ fill, font, bold, width }: any, isHeader: boolean) {
    if (isHeader)
      return {
        "background-color": fill ? `#${fill}` : ``,
        "font-weight": bold ? "bold" : undefined,
      };
    return {
      "background-color": `#${fill}`,
      // background: `linear-gradient(90deg, #${fill} 0%, #${fill} ${Math.round(
      //   width,
      // )}%, transparent ${Math.round(width)}%, transparent 100%)`,
      color: `#${font}`,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public isDataCell(e: any) {
    return e.rowType === "data";
  }

  public async setTableSchema({ Columns }: any) {
    return new Promise(async resolve => {
      if (this.columnSetting.length > 0) this.columnSetting = [];

      for await (const info of Columns) {
        if (info.Name === "PLAN_VERSION") continue;
        let type = "";
        switch (info.JsType) {
          case "Date":
            type = "datetime";
            break;
          case "boolean":
            type = "boolean";
            break;
          case "number":
            type = "number";
            break;
          default:
            type = "string";
            break;
        }

        this.columnSetting.push({
          key: info.Name,
          name: info.Name,
          caption: info.Name,
          type: type,
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
    this.planVersionItems = await getVersionDatas(["REVISION"], true);

    if (this.planVersionItems.length === 0) return;
    if (!this.isValid) {
      this.planVersion = this.planVersionItems[0].PLAN_ID;
      this.sourceID = this.planVersionItems[0].SOURCE_ID;
    }
    this.isValid = true;
  }

  // @Watch("gridContextOptions.checkGroupPanel", { immediate: true })
  // public onChangeShowGroupPanel() {
  //   this.$nextTick(() => {
  //     let panel = document.querySelector(".dx-datagrid-header-panel") as HTMLElement;
  //     if (panel != null)
  //       panel.style.display = this.gridContextOptions.checkGroupPanel ? "" : "none";
  //   });
  // }

  public async loadFunc(obj: ActionLoadOptions) {
    const userID = CurrentEmail();
    if (!this.selectedPlanID || !this.tableName || !userID) return [];
    const result = await Get(
      "RevisionReport",
      {
        options: {
          filter: [
            ["PLAN_ID", "=", this.selectedPlanID],
            "and",
            ["TARGET_TABLE", "=", this.tableName],
            "and",
            ["CREATE_USER", "=", userID],
          ],
        },
      },
      "post",
    );
    let data = JSON.parse(result.data);
    return data.map((item: any) => {
      let d: any = {};
      if (["add", "update"].includes(item.COMMAND) && item.NEW_VALUES.length > 0) d = JSON.parse(item.NEW_VALUES)[0];
      if ("delete" === item.COMMAND && item.OLD_VALUES.length > 0) d = JSON.parse(item.OLD_VALUES)[0];
      d.COMMAND = item.COMMAND;
      d.REVISION_SEQ = item.REVISION_SEQ;
      return d;
    });
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    createContextMenu(e, this.gridContextOptions);
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }
  }

  public async onOptionChanged(e: any) {
    switch (e.name) {
      case "editing":
        let changes = e.component.option("editing.changes");
        this.isChanging = changes.length !== 0;
        setOnEditing(this.isChanging);
        break;
      // case "columns":
      //   const fullNames = e.fullName.split(".");
      //   if (fullNames[1] === "groupIndex") this.gridContextOptions.checkGroupPanel = true;

      //   break;
    }
  }

  public onExporting(e: any) {
    e.fileName = `${this.tableName}_${dateToFormat(new Date(), "YYYYMMDD")}`;
  }

  public async onVersionChanged(e: any) {
    this.planVersion = e.PLAN_ID;
    this.sourceID = e.SOURCE_ID;
    await this.refreshDataSource();
  }

  public async refreshDataSource() {
    this.loadingVisible = true;

    await this.setVersionControl();

    this.changedTables = (
      await loadDistinctRemoteDatas("AT_REVISION_LOG", {}, "TARGET_TABLE", {
        PLAN_ID: this.planVersion,
        CREATE_USER: CurrentEmail(),
      })
    ).data
      .filter((item: any) => item.key)
      .sort((item1: any, item2: any) => item2.count - item1.count);

    this.loadingVisible = false;
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    await this.refreshDataSource();

    try {
      this.dataGrid?.refresh();
    } finally {
      this.isValid = true;
      this.loadingVisible = false;
    }
  }

  public async onExecutePlan() {
    const result = await showConfirm({
      message: `${this.$t(`ExecuteMessage`, [this.selectedPlanID])}`,
      // type: `info`,
      // title: `Execute`,
      // message: `Are you sure you want to <b>Execute</b> ${
      //   values.length > 1 ? "these records" : "this record"
      // }?`,
    });

    if (result) {
      await this.executeFunc();

      // setVersionNo(values[0].PLAN_ID);
    }
  }

  public async executeFunc() {
    this.loadingVisible = true;

    try {
      const result = await RunRevisionTable(this.selectedPlanID);
      return JSON.parse(result.data);
    } finally {
      this.loadingVisible = false;

      await this.onRefreshData();
    }
  }

  public async onItemClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    const tableName = item.key;

    this.loadingVisible = true;

    try {
      this.tableName = tableName;
      this.selectedPlanID = this.planVersion;
      this.columnSetting = [];
      const schema = await getTableSchema(tableName);
      await this.setTableSchema(schema);
      this.dataGrid?.refresh();

      this.selectedItemKeys = [tableName];
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
}
</script>
