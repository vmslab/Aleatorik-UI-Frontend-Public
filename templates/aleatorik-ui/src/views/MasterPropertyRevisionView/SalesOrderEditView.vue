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
        :disabled="!revisionID"
        @click="showChangesLog = !showChangesLog"
      />
      <DxButton
        v-tooltip="{ text: $t('Run') }"
        class="moz-default-button"
        icon="play"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Run')"
        :disabled="!revisionID"
        @click="onShowMultiRunPopup"
      />
      <div class="moz-filter-separator" />
      <DxButton
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Add')"
        @click="onAddRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Edit') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Edit')"
        :disabled="!showEditButton"
        @click="onEditRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Delete')"
        :disabled="!showEditButton"
        @click="onRemoveRow"
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
      </div>
      <div slot="filter">
        <DxCheckBox v-model="isOnlyRevision" text="Only under revision items" @valueChanged="onOnlyRevisionChanged" />
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
        :isReadOnly="true"
        :formatItem="formatItem"
        :showMarquee="true"
      >
        <WjFlexGridColumn binding="SO_ID" aggregate="Cnt" />
        <WjFlexGridColumn binding="STAGE_ID" />
        <WjFlexGridColumn binding="ITEM_ID" />
        <WjFlexGridColumn binding="SITE_ID" />
        <WjFlexGridColumn binding="BUFFER_ID" />
        <WjFlexGridColumn binding="DUE_DATE" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
        <WjFlexGridColumn binding="QTY" dataType="Number" format=",##0.#########" />
        <WjFlexGridColumn binding="PRIORITY" dataType="Number" format=",##0.#########" />
        <WjFlexGridColumn binding="CUSTOMER_ID" />
        <WjFlexGridColumn binding="DEMAND_TYPE" />
        <WjFlexGridColumn binding="MAX_LATENESS_DAYS" dataType="Number" format=",##0.#########" />
        <WjFlexGridColumn binding="MAX_EARLINESS_DAYS" dataType="Number" format=",##0.#########" />
        <WjFlexGridColumn binding="IS_RTF_TARGET" />
        <WjFlexGridColumn binding="CREATE_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
        <WjFlexGridColumn binding="CREATE_USER" />
        <WjFlexGridColumn binding="UPDATE_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
        <WjFlexGridColumn binding="UPDATE_USER" />
      </WjFlexGrid>

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
      :visible="isShowEditPopup"
      :show-title="true"
      title="Sales Order Config"
      :width="600"
      :height="680"
      @hiding="
        () => {
          isShowEditPopup = false;
        }
      "
    >
      <DxScrollView width="100%" height="100%">
        <DxForm
          ref="dataForm"
          class="moz-form"
          :form-key="formKey"
          :form-data="formData"
          validation-group="validationSO"
          :show-colon-after-label="false"
        >
          <DxTabbedItem cssClass="moz-popup-tabs-colored">
            <DxTabPanelOptions :selected-index="tabIndex" />
            <DxTab title="Basic Information">
              <DxItem
                data-field="SO_ID"
                :editor-options="{
                  disabled: !isAddRow,
                }"
              >
                <DxRequiredRule message="SO_ID is required" />
                <DxAsyncRule
                  v-if="isAddRow"
                  :validation-callback="validationKey"
                  message="This Key is already registered"
                />
              </DxItem>
              <DxItem
                data-field="STAGE_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'STAGE_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: stageDataSource,
                }"
              >
                <DxRequiredRule message="STAGE_ID is required" />
              </DxItem>
              <DxItem
                data-field="ITEM_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'ITEM_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: itemDataSource,
                }"
              >
                <DxRequiredRule message="ITEM_ID is required" />
              </DxItem>
              <DxItem
                data-field="SITE_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'SITE_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: siteDataSource,
                }"
              >
                <DxRequiredRule message="SITE_ID is required" />
              </DxItem>
              <DxItem
                data-field="BUFFER_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'BUFFER_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: bufferDataSource,
                }"
              >
                <DxRequiredRule message="BUFFER_ID is required" />
              </DxItem>
              <DxItem
                data-field="DUE_DATE"
                editor-type="dxDateBox"
                :editor-options="{
                  displayFormat: 'yyyy-MM-dd',
                  useMaskBehavior: true,
                }"
              >
                <DxRequiredRule message="DUE_DATE is required" />
              </DxItem>
              <DxItem
                data-field="QTY"
                editor-type="dxNumberBox"
                :editor-options="{
                  showSpinButtons: true,
                  format: ',##0.#########',
                }"
              >
                <DxRequiredRule message="QTY is required" />
                <DxRangeRule min="0" message="QTY must be at least 0" />
              </DxItem>
              <DxItem
                data-field="PRIORITY"
                editor-type="dxNumberBox"
                :editor-options="{
                  showSpinButtons: true,
                  format: ',##0.#########',
                }"
              />
              <DxItem
                data-field="CUSTOMER_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'CUSTOMER_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: customerDataSource,
                }"
              />
              <DxItem data-field="DEMAND_TYPE" />
              <DxItem
                data-field="MAX_LATENESS_DAYS"
                editor-type="dxNumberBox"
                :editor-options="{
                  showSpinButtons: true,
                  format: ',##0.#########',
                }"
              />
              <DxItem
                data-field="MAX_EARLINESS_DAYS"
                editor-type="dxNumberBox"
                :editor-options="{
                  showSpinButtons: true,
                  format: ',##0.#########',
                }"
              />
              <DxItem
                data-field="IS_RTF_TARGET"
                editor-type="dxRadioGroup"
                :editor-options="{ items: ['Y', 'N'], layout: 'horizontal' }"
              />
              <DxItem
                data-field="#ShippingDate"
                editor-type="dxDateBox"
                :editor-options="{
                  displayFormat: 'yyyy-MM-dd',
                  useMaskBehavior: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                }"
              >
                <DxLabel text="MONTHLY SHIP LIMIT" />
              </DxItem>
              <DxItem
                data-field="#ShippingDaysOfWeek"
                editor-type="dxSelectBox"
                :editor-options="{
                  items: ['', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRY', 'SAT'],
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                }"
              >
                <DxLabel text="WEEKLY SHIP LIMIT" />
              </DxItem>
            </DxTab>
            <DxTab title="Properties" v-if="customPropertiesLength > 0">
              <template v-for="property in propertyDatas">
                <DxItem
                  v-if="property.propertyID.substring(0, 1) !== '#'"
                  :key="property.propertyID"
                  :data-field="property.propertyID"
                  :editor-type="property.reservedWord.length > 0 ? 'dxSelectBox' : 'dxTextBox'"
                  :editor-options="
                    property.reservedWord.length > 0
                      ? {
                          items: property.reservedWord.split(',').map(s => s.trim()),
                          searchEnabled: true,
                          showClearButton: true,
                          acceptCustomValue: true,
                        }
                      : {}
                  "
                />
              </template>
            </DxTab>
          </DxTabbedItem>
        </DxForm>
      </DxScrollView>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t('KeepAdd'),
          stylingMode: 'outlined',
          class: 'moz-button',
          onClick: onSaveContinue,
          visible: isAddRow,
        }"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: isAddRow ? $t('Add') : $t('Modify'),
          stylingMode: 'outlined',
          class: 'moz-button',
          onClick: onSaveData,
        }"
      />
    </DxPopup>
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
      :visible="showPlanEditPopup"
      :targetPlan="targetPlan"
      :scenarioDatas="scenarioDatas"
      :isRevision="true"
      @action="onAction"
      @close="showPlanEditPopup = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import pick from "lodash/pick";
import { MainModule } from "@/store/modules/mainStore";
import { ActionLoadOptions, showConfirm, showAlert, ExtendGrid } from "mozart-component-wijmo";
import {
  GetTableRemote,
  GetRevisionTable,
  AddRevisionTable,
  ModifyRevisionTable,
  RemoveRevisionTable,
  AddOrModifyRevisionTable,
  Remove,
} from "@/api/mainService";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { CollectionView } from "@grapecity/wijmo";
import {
  setOnEditing,
  setCreateProperty,
  setUpdateProperty,
  createKeyRef,
  getVersionDatas,
  getParentsHeight,
  getContentsWidth,
  getContentsHeight,
  getToolbarSize,
} from "@/utils/commonUtils";
import {
  loadTableDatas,
  loadProperties,
  loadPropertyValues,
  loadDistinctRemoteDatas,
  createPagenateStore,
} from "@/utils/dataUtils";
import "@/utils/dateUtils";
import { CurrentEmail } from "@/utils/common";

import DxButton from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import ValidationEngine from "devextreme/ui/validation_engine";

import { EventBus } from "mozart-common";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import {
  DxForm,
  DxGroupItem,
  DxItem,
  DxTabbedItem,
  DxTabPanelOptions,
  DxTab,
  DxLabel,
  DxRequiredRule,
  DxPatternRule,
  DxRangeRule,
  DxAsyncRule,
} from "devextreme-vue/form";
import DxRadioGroup from "devextreme-vue/radio-group";
import { DxCheckBox } from "devextreme-vue/check-box";
import DxSelectBox from "devextreme-vue/select-box";
import { DxTagBox } from "devextreme-vue/tag-box";
import DxDateBox from "devextreme-vue/date-box";
import { DxScrollView } from "devextreme-vue/scroll-view";
import DropDownGrid from "@/components/DropDownGrid.vue";
import RevisionCheckChanges from "@/views/RevisionCheckChanges.vue";
import ATPlanMultiRunPopup from "@/views/Plan/ATPlanMultiRunPopup.vue";
import "devextreme-vue/text-area";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    DxButton,
    DxTextBox,
    DxPopup,
    DxToolbarItem,
    DxForm,
    DxGroupItem,
    DxItem,
    DxTabbedItem,
    DxTabPanelOptions,
    DxTab,
    DxLabel,
    DxRequiredRule,
    DxPatternRule,
    DxRangeRule,
    DxAsyncRule,
    DxRadioGroup,
    DxCheckBox,
    DxSelectBox,
    DxTagBox,
    DxDateBox,
    DxScrollView,
    DxLoadPanel,
    DropDownGrid,
    RevisionCheckChanges,
    ATPlanMultiRunPopup,
  },
})
export default class SalesOrderEditView extends Vue {
  public filter = true;

  public targetPlan: any = {};
  public ChangesLogWidth = 1500;
  public ChangesLogHeight = 700;

  public tableName: string = "ODV_SALES_ORDER";
  public propertyTableName: string = "ODV_SALES_ORDER_PROPERTY_VALUE";
  public categoryID: string = "SalesOrder";
  public dataKey: string[] = ["PLAN_VERSION", "SO_ID"];

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};

  public stageDataSource: any = [];
  public itemDataSource: any = [];
  public siteDataSource: any = [];
  public bufferDataSource: any = [];
  public customerDataSource: any = [];

  public propertyDatas: any[] = [];

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

  public showEditButton = false;
  public isChanging = false;
  public isLoadedData = false;
  public isShowEditPopup = false;
  public isShowUploadPopup = false;
  public isAddRow = true;
  public isAddContinue = false;
  public loadingVisible = false;

  public showChangesLog = false;
  public showPlanEditPopup = false;

  public tabIndex = 0;
  public gridWidth = 0;
  public customPropertiesLength = 0;

  public flexGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;

  public dataSource: any = [];
  public revisionLogs: any = {};
  public updatedLogs: any[] = [];
  public insertedLogs: any[] = [];

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

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public onSelectionChanged() {
    if (!this.flexGrid) return;

    const flag = this.flexGrid.selection.row >= 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public async getData(tableName: string, option: ActionLoadOptions) {
    const result = await GetTableRemote(tableName, option);
    const data = JSON.parse(result.data);
    return data.data;
  }

  public onInitialized(grid: any) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
        onInitialized: async extendGrid => {
          extendGrid.flexGrid.selectionChanged.addHandler(this.onSelectionChanged);

          const urlParams = new URLSearchParams(window.location.search);
          const planVersion = urlParams.get("v");
          const filterKeys = urlParams.get("k");
          const filterValues = urlParams.get("d");
          if (planVersion) {
            this.selectedPlanID = planVersion;
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
        onCellDblClick: (grid, hitTest, e) => {
          if (hitTest.panel === grid.cells) {
            const item = hitTest.getRow().dataItem;
            const key = pick(item, this.dataKey);

            this.showEditForm({
              key,
              data: item,
            });
          }
        },
      },
    });
  }

  public async mounted() {
    await this.onRefreshData();
    this.loadingVisible = true;

    this.propertyDatas = await loadProperties(this.categoryID);
    this.customPropertiesLength = this.propertyDatas.filter(
      property => property.propertyID.substring(0, 1) !== "#",
    ).length;

    this.loadingVisible = false;
  }

  public async setRevisionID() {
    this.revisionID = "";

    const revisionDatas = await getVersionDatas(["REVISION"], true);
    const revision = revisionDatas?.find((data: any) => data.SOURCE_ID === this.selectedPlanID);
    this.revisionID = revision?.PLAN_ID;
    this.revisionData = revision;

    if (this.revisionID) {
      this.revisionLogs = await this.getData("AT_REVISION_LOG", {
        filter: [
          ["COMMAND", "!=", "copy"],
          "and",
          ["COMMAND", "!=", "create"],
          "and",
          ["PLAN_ID", "=", this.revisionID],
          "and",
          ["CREATE_USER", "=", CurrentEmail()],
          "and",
          ["TARGET_TABLE", "=", this.tableName],
        ],
      });

      const targetRevision = this.revisionLogs;
      this.updatedLogs =
        targetRevision?.filter((log: any) => log.COMMAND === "update").map((log: any) => JSON.parse(log.DATA_KEY)) ||
        [];
      this.insertedLogs =
        targetRevision?.filter((log: any) => log.COMMAND === "add").map((log: any) => JSON.parse(log.NEW_VALUES)) || [];
    }
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
  }

  public async setScenarioControl() {
    this.scenarioDatas = await this.loadScenario();
  }

  public async loadScenario() {
    const result = await GetTableRemote("CFG_SCENARIO_MASTER", {});
    const data = JSON.parse(result.data);
    return data.data;
  }

  public stageLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_STAGE", obj, "STAGE_ID");
  }

  public itemLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_ITEM_MASTER", obj, "ITEM_ID");
  }

  public siteLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_SITE_MASTER", obj, "SITE_ID");
  }

  public bufferLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_BUFFER_MASTER", obj, "BUFFER_ID");
  }

  public customerLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_CUSTOMER", obj, "CUSTOMER_ID");
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName || !this.selectedPlanID) return [];
    const result = await GetRevisionTable(this.tableName, this.selectedPlanID, obj);
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    return data.data;
  }

  public parseFormData(data: any) {
    return {
      SO_ID: data.SO_ID,
      STAGE_ID: data.STAGE_ID,
      ITEM_ID: data.ITEM_ID,
      SITE_ID: data.SITE_ID,
      BUFFER_ID: data.BUFFER_ID,
      DUE_DATE: data.DUE_DATE,
      QTY: data.QTY,
      PRIORITY: data.PRIORITY,
      CUSTOMER_ID: data.CUSTOMER_ID,
      DEMAND_TYPE: data.DEMAND_TYPE,
      MAX_LATENESS_DAYS: data.MAX_LATENESS_DAYS,
      MAX_EARLINESS_DAYS: data.MAX_EARLINESS_DAYS,
      IS_RTF_TARGET: data.IS_RTF_TARGET.trim(),
    };
  }

  public parsePropertyKey(key: any, propertyID: string) {
    key.PROPERTY_ID = propertyID;
    return key;
  }

  public parsePropertyData(data: any) {
    return this.propertyDatas.map((item: any) => {
      let parseData: any = {
        PROPERTY_ID: item.propertyID,
        VALUE: data[item.propertyID] instanceof Date ? data[item.propertyID].toDateString() : data[item.propertyID],
      };
      this.dataKey.forEach((key: any) => {
        parseData[key] = data[key];
      });

      return parseData;
    });
  }

  public async insertFunc(tableName: string, values: any) {
    if (!this.tableName) return [];

    setCreateProperty(values);
    setUpdateProperty(values);

    const result = await AddRevisionTable(tableName, this.selectedPlanID, values);
    return JSON.parse(result.data);
  }

  public async replaceFunc(tableName: string, keys: any, values: any) {
    if (!this.tableName) return [];

    setCreateProperty(values);
    setUpdateProperty(values);

    const result = await AddOrModifyRevisionTable(tableName, this.selectedPlanID, keys, values);
    return JSON.parse(result.data);
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyRevisionTable(tableName, this.selectedPlanID, key, values);
    return JSON.parse(result.data);
  }

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveRevisionTable(tableName, this.selectedPlanID, key);
    return JSON.parse(result.data);
  }

  public async refreshDataSource() {
    this.dataSource = new CollectionView(await this.loadFunc({}));
    this.stageDataSource = createPagenateStore("STAGE_ID", this.stageLoadFunc);
    this.itemDataSource = createPagenateStore("ITEM_ID", this.itemLoadFunc);
    this.siteDataSource = createPagenateStore("SITE_ID", this.siteLoadFunc);
    this.bufferDataSource = createPagenateStore("BUFFER_ID", this.bufferLoadFunc);
    this.customerDataSource = createPagenateStore("CUSTOMER_ID", this.customerLoadFunc);
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    await this.setVersionControl();
    await this.setScenarioControl();
    await this.setRevisionID();
    await this.refreshDataSource();
    setOnEditing(false);
    this.loadingVisible = false;
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = createKeyRef(this.dataKey, this.formData);

    return new Promise(resolve => {
      const result = !validationDatas.some(
        (item: any) => createKeyRef(this.dataKey, item).toLowerCase() == currentKey.toLowerCase(),
      );
      resolve(result);
    });
  }

  public onShowMultiRunPopup() {
    this.targetPlan = this.revisionIDItems.find((item: any) => item.PLAN_ID === this.revisionID);

    this.showPlanEditPopup = true;
  }

  public onAction() {
    this.showPlanEditPopup = false;
    EventBus.fire("push-route-by-key", {
      params: {
        key: "at-plan-view",
      },
    });
  }

  public onAddRow() {
    this.isAddRow = true;

    this.formData = {
      PLAN_VERSION: this.revisionID || this.selectedPlanID,
      IS_RTF_TARGET: "Y",
    };

    this.propertyDatas.forEach((item: any) => {
      this.formData[item.propertyID] = item.defaultValue;
    });

    this.$nextTick(() => {
      this.isShowEditPopup = true;
      this.tabIndex = 0;
      this.dataForm.repaint();
    });
  }

  public onRowDblClick(e: any) {
    if (e.data) {
      this.showEditForm(e);
    }
  }

  public onEditRow() {
    const selectedRowIndex = this.flexGrid?.selection.row;
    if (!selectedRowIndex || selectedRowIndex < 0) return;

    const item = this.flexGrid?.rows[selectedRowIndex]?.dataItem;
    if (!item) return;

    const key = pick(item, this.dataKey);

    this.showEditForm({
      key,
      data: item,
    });
  }

  public async showEditForm({ key, data }: any) {
    this.isAddRow = false;
    const propertyValues = await loadPropertyValues(this.propertyTableName, key, this.propertyDatas);

    this.formKey = key;
    this.formData = this.parseFormData(data);

    this.propertyDatas.forEach((item: any) => {
      const property = propertyValues.find((prop: any) => prop.PROPERTY_ID === item.propertyID);
      if (property) {
        this.formData[property.PROPERTY_ID] = property.VALUE || property.CALENDAR_ID;
      } else {
        this.formData[item.propertyID] = item.defaultValue;
      }
    });

    this.$nextTick(() => {
      this.isShowEditPopup = true;
      this.tabIndex = 0;
      this.dataForm.repaint();
    });
  }

  public async onSaveContinue() {
    this.isAddContinue = true;
    await this.onSaveData();

    this.formData = {};

    this.propertyDatas.forEach((item: any) => {
      this.formData[item.propertyID] = item.defaultValue;
    });
    this.isAddContinue = false;
  }

  public async onSaveData() {
    this.loadingVisible = true;
    try {
      const valid = ValidationEngine.validateGroup("validationSO");
      if (!valid.isValid) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
      if (valid.status === "pending") {
        const validResult = await valid.complete;

        if (!validResult || !validResult.isValid) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      }

      let result = null;
      if (this.isAddRow) {
        result = await this.insertFunc(this.tableName, this.parseFormData(this.formData));
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      } else {
        result = await this.updateFunc(this.tableName, this.formKey, this.parseFormData(this.formData));
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      }

      let affected = 0;
      this.parsePropertyData(this.formData).forEach(async (values: any) => {
        if (!values) return;

        let propResult;

        const propertyKey = this.parsePropertyKey(this.formKey, values.PROPERTY_ID);
        if (values.VALUE || values.CALENDAR_ID) {
          propResult = await this.replaceFunc(this.propertyTableName, propertyKey, values);
        }
        // else {
        //   propResult = await this.deleteFunc(this.propertyTableName, propertyKey);
        // }

        if (propResult && propResult.count > 0) {
          affected += propResult.count;
        }
      });

      if (result) {
        this.isShowEditPopup = this.isAddContinue;
        await this.onRefreshData();
      }
    } finally {
      this.loadingVisible = false;
    }
  }

  public onRemoveRow() {
    const selectedRows = this.flexGrid?.rows.filter((r: any) => r.isVisible && r.isSelected);
    if (!selectedRows || selectedRows.length <= 0) return;
    this.deleteService(selectedRows);
  }

  public async deleteService(target: any) {
    // let recordString = "";
    let keys = target.map((item: any) => {
      // if (recordString.length > 0) recordString += ", ";

      // recordString += "'" + item[this.removeText] + "'";

      let keyObj: any = {};
      this.dataKey.forEach((key: string) => {
        keyObj[key] = item[key];
      });
      return keyObj;
    });

    const result = await showConfirm({
      message: `${this.$t(`RemoveManyMessage`, [keys.length])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> ${
      //   keys.length > 1 ? "these records" : "this record"
      // }?`,
    });

    if (result) {
      this.isLoadedData = false;

      await this.deleteFunc(this.tableName, keys);
      await this.deleteFunc(this.propertyTableName, keys);

      await this.onRefreshData();
    }
  }

  public async onVersionChanged(e: any) {
    this.selectedPlanID = e.PLAN_ID;
    this.extendGrid?.filter?.clear();

    await this.setRevisionID();
    await this.onRefreshData();
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
      this.loadingVisible = true;
      try {
        const result = await Remove("ATPlan", {
          keys: JSON.stringify([{ PLAN_ID: this.revisionID }]),
        });
        return JSON.parse(result.data);
      } finally {
        this.loadingVisible = false;

        await this.onRefreshData();
      }
    }
  }

  public getConditionalAppearance(command: string) {
    switch (command) {
      case "add":
        return { fill: "CCE5FF", bold: true };
      case "update":
        return { fill: "FFFFCC", bold: true };
      case "revision":
        return { fontStr: "var(--color-warning)", bold: true };
      // case "delete":
      //   return { fill: "FFCCCC", bold: true };
      default:
        return { bold: true };
    }
  }

  public getConditionalCssStyles({ fill, font, fontStr, bold, width }: any, isHeader: boolean) {
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
      color: fontStr ? fontStr : `#${font}`,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public onCheckChanges() {
    EventBus.fire("open-popup", {
      params: { key: "revision-report-view", params: `?r=${this.revisionID}` },
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
