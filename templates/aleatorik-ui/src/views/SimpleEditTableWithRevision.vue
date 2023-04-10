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
        v-tooltip="{ text: $t('CheckChanges') }"
        class="moz-default-button"
        icon="verify"
        type="default"
        :focusStateEnabled="false"
        :text="$t('CheckChanges')"
        :disabled="
          !isValid ||
          !tableName ||
          !revisionID ||
          !this.tableList?.find(table => table.TABLE_NAME === tableName)?.REVISION_COUNT > 0
        "
        @click="showChangesLog = !showChangesLog"
      />
      <DxButton
        v-tooltip="{ text: $t('Run') }"
        class="moz-default-button"
        icon="play"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Run')"
        :disabled="!isValid || !revisionID"
        @click="onShowMultiRunPopup"
      />
      <div class="moz-filter-separator" />
      <DxButton
        v-if="!isReadOnly"
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Add')"
        :disabled="!isValid || !tableName"
        @click="onAddRow"
      />
      <DxButton
        v-if="!isReadOnly"
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Delete')"
        :disabled="!isValid || !tableName || !activeDelete"
        @click="onRemoveRow"
      />
      <DxButton
        v-if="!isReadOnly"
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Save')"
        @click="onSaveData"
        :disabled="!isValid || !tableName || !isEditing"
      />
      <DxButton
        v-if="!isReadOnly"
        v-tooltip="{ text: $t('Cancel') }"
        class="moz-default-button"
        icon="cancel"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Cancel')"
        @click="onCancelUpdate"
        :disabled="!isValid || !tableName || !isEditing"
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
          :items="
            isOnlyRevision
              ? planVersionItems.filter(item => revisionIDItems.some(revItem => revItem.SOURCE_ID === item.PLAN_ID))
              : planVersionItems
          "
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
          @format-item="onVersionFormatItem"
        />
      </div>
      <div v-show="revisionID" slot="filter">
        <i style="position: relative; opacity: 0.4" class="mozart-icons m-131_icon-arrow-right"></i>
        <i style="position: relative; opacity: 0.7; left: -5px" class="mozart-icons m-131_icon-arrow-right"></i>
        <i style="position: relative; left: -10px" class="mozart-icons m-131_icon-arrow-right"></i>
        <DxTextBox class="read-only-text-box" v-model="revisionID" :read-only="true" />
      </div>
      <div v-show="revisionID" slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Delete') + ' Revision' }"
          class="moz-default-button"
          icon="trash"
          @click="onRemoveRevision"
        />
        <!-- <a
          style="
            color: var(--color-accent);
            font-size: var(--font-size-body02);
            text-decoration: underline;
          "
          href="javascript:void(0);"
          @click="onRemoveRevision"
          >{{ $t("Delete") }}</a
        > -->
      </div>
      <div slot="filter">
        <DxCheckBox v-model="isOnlyRevision" text="Only under revision items" @valueChanged="onOnlyRevisionChanged" />
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
        <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsInnerHeight }">
          <div>
            <DxLoadPanel
              :visible="loadingDataList"
              :show-indicator="true"
              :show-pane="true"
              :shading="false"
              shading-color="rgba(0,0,0,0.4)"
            />
            <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
              <div class="dx-card-title">
                <div class="dx-card-title-text">DATA TABLE</div>
              </div>
              <DxList
                key="tableName"
                ref="tableList"
                class="moz-list moz-list-search-padding"
                :width="parentsWidth"
                :height="contentsInnerHeight"
                :data-source="tableList"
                :search-enabled="true"
                search-mode="contains"
                search-expr="TABLE_NAME"
                :allow-item-deleting="false"
                :focus-state-enabled="false"
                :active-state-enabled="false"
                :show-selection-controls="true"
                :repaint-changes-only="true"
                page-load-mode="scrollBottom"
                key-expr="TABLE_NAME"
                selection-mode="none"
                :selected-item-keys="selectedItemKeys"
                @item-click="onItemClick"
                @scroll="onScroll"
              >
                <template #item="{ data: item }">
                  <div>
                    <div class="text-area">
                      <div :class="{ 'moz-body-02': true, 'revision-table': item.REVISION_COUNT > 0 }">
                        {{ item.TABLE_NAME.substring(4) }}
                        <span class="moz-body-02 moz-color-font5" v-show="item.REVISION_COUNT > 0">
                          ({{ item.REVISION_COUNT }})</span
                        >
                      </div>
                      <!-- <div class="moz-body-02 moz-color-font5" v-show="item.REVISION_COUNT > 0">
                      Revision Count ({{ item.REVISION_COUNT }})
                    </div> -->
                    </div>
                  </div>
                </template>
              </DxList>
            </div>
          </div>
        </template>
        <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
          <div>
            <DxLoadPanel
              :visible="loadingDataGrid"
              :show-indicator="true"
              :show-pane="true"
              :shading="false"
              shading-color="rgba(0,0,0,0.4)"
            />
            <WjFlexGrid
              :style="`
                width: ${parentsWidth}px;
                height: calc(${parentsHeight}px - 3px);`"
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
          </div>
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
    <DxPopup
      class="moz-popup"
      :visible="showChangesLog"
      :show-title="true"
      title="Changes Log"
      :width="ChangesLogWidth"
      :height="ChangesLogHeight"
      @hiding="
        () => {
          showChangesLog = false;
        }
      "
    >
      <div
        class="moz-frame-for-outer-control"
        :style="`width: ${ChangesLogWidth}px; height: ${getParentsHeight(ChangesLogHeight) - getToolbarSize()}px;`"
      >
        <RevisionCheckChanges
          :tableName="tableName"
          :planVersion="revisionID"
          :parentsWidth="getContentsWidth(ChangesLogWidth)"
          :parentsHeight="getContentsHeight(ChangesLogHeight) - getToolbarSize()"
        />
      </div>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t('Close'),
          stylingMode: 'outlined',
          class: 'moz-button',
          onClick: () => (showChangesLog = !showChangesLog),
        }"
      />
    </DxPopup>
    <ATPlanMultiRunPopup
      :visible="showEditPopup"
      :targetPlan="targetPlan"
      :scenarioDatas="scenarioDatas"
      :isRevision="true"
      @action="onAction"
      @close="showEditPopup = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { ActionLoadOptions, showConfirm, showAlert, ExtendGrid } from "mozart-component-wijmo";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { InputDateTime, InputNumber } from "@grapecity/wijmo.input";
import { CollectionView } from "@grapecity/wijmo";
import { Get, Remove, GetTableRemote, GetRevisionTable, SaveChangesRevision } from "@/api/mainService";
import {
  dateToFormat,
  setOnEditing,
  setCreateProperty,
  setUpdateProperty,
  getVersionDatas,
  getTableSchema,
  getSchemaInformation,
  getParentsHeight,
  getContentsWidth,
  getContentsHeight,
  getToolbarSize,
} from "@/utils/commonUtils";
import "@/utils/dateUtils";

import { DxTextBox } from "devextreme-vue/text-box";
import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxForm, DxItem, DxRequiredRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";

import { EventBus } from "mozart-common";

import { DxList } from "devextreme-vue/list";
import { SplitBox } from "mozart-component-wijmo";
import DropDownGrid from "@/components/DropDownGrid.vue";
import { DxCheckBox } from "devextreme-vue/check-box";
import { CurrentEmail } from "@/utils/common";

import groupBy from "lodash/groupBy";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import RevisionCheckChanges from "@/views/RevisionCheckChanges.vue";
import ATPlanMultiRunPopup from "@/views/Plan/ATPlanMultiRunPopup.vue";
import { DxScrollView } from "devextreme-vue/scroll-view";

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
    InputDateTime,
    InputNumber,
    CollectionView,
    DxTextBox,
    DxButton,
    DxLoadPanel,
    DxList,
    DxPopup,
    DxToolbarItem,
    SplitBox,
    DropDownGrid,
    RevisionCheckChanges,
    DxScrollView,
    DxForm,
    DxItem,
    DxRequiredRule,
    DxRangeRule,
    DxAsyncRule,
    DxCheckBox,
    ATPlanMultiRunPopup,
  },
})
export default class SimpleEditTableWithRevision extends Vue {
  public filter: boolean = true;
  public showChangesLog: boolean = false;
  public showEditPopup: boolean = false;
  public isValid = false;
  public activeDelete = false;
  public isEditing = false;

  public targetPlan: any = {};

  // public ChangesLogWidth = 1000;
  public ChangesLogWidth = 1500;
  public ChangesLogHeight = 700;
  public comboBoxWidth: number = 150;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];
  public revisionIDItems: any[] = [];
  public selectedPlanID: string = "";
  public revisionID: string = "";
  public revisionData: any = {};

  public isOnlyRevision = false;

  public scenarioDatas: any[] = [];

  public tableName: string = "";
  public dataKey: string[] = [];
  public targetTable: string = "";

  public tableList: any = [];
  public selectedItemKeys: any[] = [];

  public hideVersion = true;
  public isReadOnly = false;
  public columnSetting: ColumnInfo[] = [];

  public options: Record<string, any> = {};

  public autoExpandAll = false;
  public loadingVisible = false;
  public loadingDataList = false;
  public loadingDataGrid = false;

  public isLoadedData = false;

  public gridWidth = 0;

  public flexGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;
  public dataList: any = null;

  public dataSource: any = [];
  public revisionLogs: any = {};
  public updatedLogs: any[] = [];
  public insertedLogs: any[] = [];

  public dateEditor = new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  });
  public numberEditor = new InputNumber(document.createElement("div"), {
    format: "n",
  });

  constructor() {
    super();
  }

  public getParentsHeight(height: number) {
    return getParentsHeight(height);
  }
  public getContentsWidth(width: number) {
    return getContentsWidth(width);
  }
  public getContentsHeight(height: number) {
    return getContentsHeight(height);
  }
  public getToolbarSize() {
    return getToolbarSize();
  }

  public async mounted() {
    this.dataList = (this.$refs.tableList as any)?.instance;

    await this.setVersionControl();
    await this.setScenarioControl();
  }

  public async onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;
    grid.selectionChanged.addHandler(this.onSelectionChanged);
    grid.cellEditEnded.addHandler(this.onCellEditEnded);

    this.extendGrid = new ExtendGrid({
      flexGrid: this.flexGrid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
        onInitialized: async extendGrid => {
          const urlParams = new URLSearchParams(window.location.search);
          const planVersion = urlParams.get("v");
          const targetTable = urlParams.get("t");
          const filterKeys = urlParams.get("k");
          const filterValues = urlParams.get("d");
          if (planVersion) {
            this.selectedPlanID = planVersion;
          }
          await this.setRevisionID();
          await this.setTableList();
          if (targetTable) {
            this.targetTable = "ODV_" + targetTable;

            await this.setTableData(this.targetTable);
          }
          this.$nextTick(() => {
            if (filterKeys && filterValues && extendGrid.filter) {
              const keys = filterKeys?.split(",");
              const values = filterValues?.split("@");
              if (keys == null || keys.length < 2 || values == null || values.length < 2) return;

              for (const i in keys) {
                if (keys[i] === "PLAN_VERSION") continue;

                const key = keys[i];
                const value = values[i];

                const valueFilter = extendGrid.filter.getColumnFilter(key).valueFilter;
                if (!valueFilter) continue;

                valueFilter.showValues = {};
                valueFilter.showValues[value] = true;
                extendGrid.filter.apply();
              }
            }
          });
        },
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
      },
    });
  }

  public onSelectionChanged() {
    if (!this.flexGrid) return;
    const selectedRows = this.flexGrid.rows.filter((r: any) => r.isVisible && r.isSelected);
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

  public async setTableList() {
    this.loadingDataList = true;
    try {
      const result = await Get("TableNames");
      const data = JSON.parse(result.data);
      let tableList = data.filter((item: any) => item.TABLE_NAME.startsWith("ODV"));

      if (this.revisionID) {
        const revisionLogs = await this.getData("AT_REVISION_LOG", {
          filter: [
            ["COMMAND", "!=", "copy"],
            "and",
            ["COMMAND", "!=", "create"],
            "and",
            ["PLAN_ID", "=", this.revisionID],
            "and",
            ["CREATE_USER", "=", CurrentEmail()],
          ],
        });

        this.revisionLogs = groupBy(revisionLogs, "TARGET_TABLE");

        tableList = tableList
          .map((item: any) => {
            const tableRevision = this.revisionLogs[item.TABLE_NAME];
            return { TABLE_NAME: item.TABLE_NAME, REVISION_COUNT: tableRevision?.length || 0 };
          })
          .sort((item1: any, item2: any) =>
            this.targetTable === item1.TABLE_NAME ? -1 : item2.REVISION_COUNT - item1.REVISION_COUNT,
          );
      } else {
        tableList.sort((item1: any, item2: any) => (this.targetTable === item1.TABLE_NAME ? -1 : 0));
      }

      this.tableList = tableList;
    } finally {
      this.loadingDataList = false;

      this.dataList?.option("searchValue", "");
      this.dataList?.repaint();
    }
  }

  public async onItemClick(e: any) {
    if (this.extendGrid?.isEditing && !(await this.onCancelUpdate())) return;

    const item = e.itemData;
    if (!item) return;

    await this.setTableData(item.TABLE_NAME);
  }

  public onScroll(e: any) {
    const selected = this.selectedItemKeys;
    this.selectedItemKeys = [];
    this.$nextTick(() => {
      this.selectedItemKeys = selected;
    });
  }

  public async getData(tableName: string, option: ActionLoadOptions) {
    const result = await GetTableRemote(tableName, option);
    const data = JSON.parse(result.data);
    return data.data;
  }

  public async setTableData(tableName: string) {
    if (!tableName) return;

    this.extendGrid?.filter?.clear();
    if (tableName === this.selectedItemKeys[0]) {
      return;
    }
    await this.extendGrid?.clearChanges();

    this.loadingDataGrid = true;
    try {
      this.tableName = tableName;
      const schemaInfos = await getSchemaInformation(this.tableName);
      if (!schemaInfos || schemaInfos.length === 0) {
        await showAlert({
          message: `${this.$t("Invalid Request")}`,
          type: "error",
          title: "Error",
        });
        return;
      }

      this.dataKey = schemaInfos
        .filter((info: any) => info.IS_PRIMARY_KEY === "Y" || info.IS_IDENTITY === "Y")
        .map((info: any) => info.COLUMN_NAME);
      if (this.extendGrid) this.extendGrid.dataKey = this.dataKey;

      const targetRevision = this.revisionLogs[this.tableName];
      this.updatedLogs =
        targetRevision?.filter((log: any) => log.COMMAND === "update").map((log: any) => JSON.parse(log.DATA_KEY)) ||
        [];
      this.insertedLogs =
        targetRevision?.filter((log: any) => log.COMMAND === "add").map((log: any) => JSON.parse(log.NEW_VALUES)) || [];

      this.columnSetting = [];
      const schema = await getTableSchema(this.tableName);
      if (!schema || schema.length === 0) {
        await showAlert({
          message: `${this.$t("Invalid Request")}`,
          type: "error",
          title: "Error",
        });
        return;
      }
      await this.setTableSchema(schema);

      this.dataSource = new CollectionView(await this.loadFunc({}), { refreshOnEdit: false });

      this.selectedItemKeys = [tableName];
    } finally {
      this.flexGrid?.refresh();
      this.loadingDataGrid = false;
    }
  }

  public getSelectedVersion() {
    return this.selectedPlanID;
  }

  public async setRevisionID() {
    // this.loadingVisible = true;
    try {
      this.revisionID = "";
      this.tableName = "";
      this.dataKey = [];
      if (this.extendGrid) this.extendGrid.dataKey = this.dataKey;
      this.columnSetting = [];
      this.dataSource = [];
      this.selectedItemKeys = [];

      const revisionDatas = await getVersionDatas(["REVISION"], true);
      const revision = revisionDatas?.find((data: any) => data.SOURCE_ID === this.selectedPlanID);
      this.revisionID = revision?.PLAN_ID;
      this.revisionData = revision;
    } finally {
      this.flexGrid?.refresh();
      // this.loadingVisible = false;
    }
  }

  public async onVersionChanged(e: any) {
    this.selectedPlanID = e.PLAN_ID;

    await this.setRevisionID();
    await this.setTableList();
  }

  public onVersionFormatItem(s: FlexGrid, e: any) {
    if (s.cells !== e.panel) return;

    const planVersion = e.getRow().dataItem.PLAN_ID;
    if (this.revisionIDItems.some((item: any) => item.SOURCE_ID === planVersion)) {
      e.cell.classList.add("rev-version");
    }
  }

  public async onOnlyRevisionChanged() {
    if (!this.isOnlyRevision) return;

    const underRevisionItems = this.planVersionItems.filter(item =>
      this.revisionIDItems.some(revItem => revItem.SOURCE_ID === item.PLAN_ID),
    );

    if (underRevisionItems.length === 0) {
      await showAlert({ message: `${this.$t(`NoSuchItem`)}`, type: "error", title: "Error" });
      this.$nextTick(() => {
        this.isOnlyRevision = false;
      });
    }
  }

  public async onRemoveRevision() {
    const result = await showConfirm({
      message: `${this.$t(`RemoveMessage`, [this.revisionID])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> ${
      //   keys.length > 1 ? "these records" : "this record"
      // }?`,
    });
    if (result) {
      this.loadingDataGrid = true;
      try {
        const result = await Remove("ATPlan", {
          keys: JSON.stringify([{ PLAN_ID: this.revisionID }]),
        });
        return JSON.parse(result.data);
      } finally {
        this.loadingDataGrid = false;

        this.selectedPlanID = "";
        await this.onRefreshData();
        // this.onOnlyRevisionChanged();
      }
    }
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
          format: type === "Date" ? "yyyy-MM-dd HH:mm:ss" : type === "Number" ? "n" : null,
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
    this.revisionIDItems = await getVersionDatas(["REVISION"], true);
    this.planVersionItems = await getVersionDatas(["DONE", "READY"]);

    if (this.isOnlyRevision) {
      const underRevisionItems = this.planVersionItems.filter(item =>
        this.revisionIDItems.some(revItem => revItem.SOURCE_ID === item.PLAN_ID),
      );
      if (underRevisionItems.length === 0) return;

      this.selectedPlanID = this.selectedPlanID || underRevisionItems[0].PLAN_ID;
    } else {
      if (this.planVersionItems.length === 0) return;

      this.selectedPlanID = this.selectedPlanID || this.planVersionItems[0]?.PLAN_ID;
    }

    this.isValid = true;
  }

  public async setScenarioControl() {
    this.scenarioDatas = await this.loadScenario();
  }

  public async loadScenario() {
    const result = await GetTableRemote("CFG_SCENARIO_MASTER", {});
    const data = JSON.parse(result.data);
    return data.data;
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

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];

    const result = await GetRevisionTable(this.tableName, this.selectedPlanID, obj);
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
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
      //TODO: Revision Save 처리
      const result = await SaveChangesRevision(this.tableName, this.selectedPlanID, addRows, updateRows, removeRows);
      return JSON.parse(result.data);
    } catch (e) {
      return e;
    }
  }

  public onExporting(e: any) {
    e.fileName = `${this.tableName}_${dateToFormat(new Date(), "YYYYMMDD")}`;
  }

  public async onRefreshData() {
    this.loadingDataGrid = true;
    try {
      await this.setVersionControl();
      await this.setScenarioControl();
      await this.setRevisionID();
      await this.setTableList();

      setOnEditing(false);
      this.flexGrid?.refresh();
    } finally {
      this.loadingDataGrid = false;
    }
  }

  public onPopupNotify(e: any) {
    MainModule.showSnackBar({
      message: e.message,
      type: e.type,
    });
  }

  public formatItem(s: FlexGrid, e: any) {
    if (s.cells !== e.panel) return;

    const item = e.getRow().dataItem;
    this.insertedLogs.forEach((row: any) => {
      for (const key of this.dataKey) {
        if (row[key] && row[key] !== item[key]) return;
      }
      e.cell.classList.add("rev-added-row");
    });
    this.updatedLogs.forEach((row: any) => {
      for (const key of this.dataKey) {
        if (row[key] && row[key] !== item[key]) return;
      }
      e.cell.classList.add("rev-updated-row");
    });
  }

  public onCheckChanges() {
    EventBus.fire("open-popup", {
      params: { key: "revision-report-view", params: `?r=${this.revisionID}` },
    });
  }

  public onShowMultiRunPopup() {
    this.targetPlan = this.revisionIDItems.find((item: any) => item.PLAN_ID === this.revisionID);

    this.showEditPopup = true;
  }

  public onAction() {
    this.showEditPopup = false;
    EventBus.fire("push-route-by-key", {
      params: {
        key: "at-plan-view",
      },
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
    if (!result) return;

    this.loadingDataGrid = true;
    try {
      const done = await this.extendGrid?.saveEditData();
      if (!done) return;
      this.isEditing = false;

      if (!this.revisionID) {
        const revisionDatas = await getVersionDatas(["REVISION"], true);
        const revision = revisionDatas?.find((data: any) => data.SOURCE_ID === this.selectedPlanID);
        this.revisionID = revision?.PLAN_ID;
      }
      const selectedTable = this.tableName;
      await this.onRefreshData();
      await this.setTableData(selectedTable);
    } finally {
      this.loadingDataGrid = false;
    }
  }

  public async onCancelUpdate() {
    const result = await showConfirm({
      message: `${this.$t(`CancelMessage`)}`,
      // title: `Cancel`,
      // message: `Are you sure you want to <b>Cancel</b> edit data?`,
    });
    if (result) {
      await this.extendGrid?.clearChanges();
      this.isEditing = false;
      return true;
    }
    return false;
  }
}
</script>
<style>
.rev-version span {
  color: var(--color-warning) !important;
  font-weight: bold;
}

.rev-added-row {
  background-color: #cce5ff;
  font-weight: bold;
}

.rev-updated-row {
  background-color: #ffffcc;
  font-weight: bold;
}
</style>
