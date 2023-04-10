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
        :text="$t('추가')"
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
        <label>SITE_ID</label>
        <DxSelectBox
          width="200"
          v-model="siteID"
          value-expr="key"
          display-expr="label"
          :data-source="siteDataSourceForSearch"
        />
      </div>
      <div slot="filter" style="display: none">
        <label>START_TIME</label>
        <DxDateBox v-model="startTime" :use-mask-behavior="true" type="date" displayFormat="yyyy-MM-dd" />
      </div>
      <div slot="filter" style="display: none">
        <label>END_TIME</label>
        <DxDateBox v-model="endTime" :use-mask-behavior="true" type="date" displayFormat="yyyy-MM-dd" />
      </div>
      <div slot="filter" style="display: none">
        <DxButton
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="`3 ${$t('Months')}`"
          @click="clickAdd3Month"
        />
      </div>
      <div slot="filter" style="display: none">
        <DxButton
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="`6 ${$t('Months')}`"
          @click="clickAdd6Month"
        />
      </div>
      <div slot="filter" style="display: none">
        <DxButton
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="`1 ${$t('Year')}`"
          @click="clickAdd1Year"
        />
      </div>
      <div slot="filter">
        <DxCheckBox :value="isRTFTarget" text="IS_RTF_TARGET" @value-changed="onRTFTargetCheckChanged" />
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
        :showMarquee="true"
      >
        <WjFlexGridColumn binding="SO_ID" header="SO ID" aggregate="Cnt" />
        <WjFlexGridColumn binding="STAGE_ID" header="STAGE ID" />
        <WjFlexGridColumn binding="ITEM_ID" header="ITEM ID" />
        <WjFlexGridColumn binding="SITE_ID" header="SITE ID" />
        <WjFlexGridColumn binding="BUFFER_ID" header="BUFFER ID" />
        <WjFlexGridColumn binding="DUE_DATE" header="DUE DATE" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />
        <WjFlexGridColumn binding="QTY" header="QTY" />
        <WjFlexGridColumn binding="PRIORITY" header="PRIORITY" />
        <WjFlexGridColumn binding="CUSTOMER_ID" header="CUSTOMER ID" />
        <WjFlexGridColumn binding="DEMAND_TYPE" header="DEMAND TYPE" />
        <WjFlexGridColumn binding="MAX_LATENESS_DAYS" header="MAX LATENESS DAYS" dataType="Number" />
        <WjFlexGridColumn binding="MAX_EARLINESS_DAYS" header="MAX EARLINESS DAYS" dataType="Number" />
        <WjFlexGridColumn binding="IS_RTF_TARGET" header="IS RTF TARGET" />

        <WjFlexGridColumn binding="CREATE_TIME" header="CREATE TIME" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />
        <WjFlexGridColumn binding="CREATE_USER" header="CREATE USER" />
        <WjFlexGridColumn binding="UPDATE_TIME" header="UPDATE TIME" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />
        <WjFlexGridColumn binding="UPDATE_USER" header="UPDATE USER" />
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
                  displayExpr: 'label',
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import pick from "lodash/pick";
import { MainModule } from "@/store/modules/mainStore";
import { ActionLoadOptions, showConfirm, ExtendGrid, RestVirtualCollectionView } from "mozart-component-wijmo";
import { GetTableRemote, AddTable, ModifyTable, RemoveTable, AddOrModifyTable } from "@/api/mainService";
import {
  setOnEditing,
  setCreateProperty,
  setUpdateProperty,
  loadCondition,
  saveCondition,
  removeCondition,
  createKeyRef,
} from "@/utils/commonUtils";
import {
  loadTableDatas,
  loadProperties,
  loadPropertyValues,
  loadDistinctRemoteDatas,
  createPagenateStore,
} from "@/utils/dataUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import ValidationEngine from "devextreme/ui/validation_engine";

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
import "devextreme-vue/text-area";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: {
    DxButton,
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
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class SalesOrderEditView extends Vue {
  public filter = true;

  public tableName: string = "CFG_SALES_ORDER";
  public propertyTableName: string = "CFG_SALES_ORDER_PROPERTY_VALUE";
  public categoryID: string = "SalesOrder";
  public dataKey: string[] = ["SO_ID"];

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};

  public stageDataSource: any = [];
  public itemDataSource: any = [];
  public siteDataSource: any = [];
  public siteDataSourceForSearch: any = [];
  public bufferDataSource: any = [];
  public customerDataSource: any = [];

  public propertyDatas: any[] = [];

  public siteID = "";
  public startTime: Date = (() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  })();
  public endTime: Date = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 6, 0);
  public isRTFTarget = true;

  public showEditButton = false;
  public isChanging = false;
  public isLoadedData = false;
  public isShowEditPopup = false;
  public isShowUploadPopup = false;
  public isAddRow = true;
  public isAddContinue = false;
  public loadingVisible = false;

  public tabIndex = 0;

  public gridWidth = 0;

  public customPropertiesLength = 0;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  constructor() {
    super();
  }

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public onSelectionChanged() {
    const flag = this.dataGrid.selection.row >= 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public async mounted() {
    this.loadingVisible = true;
    this.refreshDataSource();

    this.propertyDatas = await loadProperties(this.categoryID);
    this.customPropertiesLength = this.propertyDatas.filter(
      property => property.propertyID.substring(0, 1) !== "#",
    ).length;

    await this.onLoadCondition();
    this.loadingVisible = false;
    await this.onRefreshData();
  }

  public stageLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_STAGE", obj, "STAGE_ID");
  }

  public itemLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_ITEM_MASTER", obj, "ITEM_ID");
  }

  public async siteLoadFunc(obj: ActionLoadOptions) {
    const sites = await loadDistinctRemoteDatas("CFG_SITE_MASTER", obj, "SITE_ID");

    return sites.data.map((item: any) => ({
      label: item.key,
      key: item.key,
    }));
  }

  public async siteLoadFuncForSearch(obj: ActionLoadOptions) {
    const sites = await loadDistinctRemoteDatas("CFG_SITE_MASTER", obj, "SITE_ID");

    return [
      { key: "", label: this.$t("전체") },
      ...sites.data.map((item: any) => ({
        label: item.key,
        key: item.key,
      })),
    ];
  }

  public bufferLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_BUFFER_MASTER", obj, "BUFFER_ID");
  }

  public customerLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_CUSTOMER", obj, "CUSTOMER_ID");
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.dataGrid?.selectionChanged.addHandler(this.onSelectionChanged);
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        mode: "virtual",
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
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

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];

    const options: any = {
      //DUE_DATE: { ">=": this.startTime, "<=": this.endTime },
      IS_RTF_TARGET: this.isRTFTarget ? "Y" : "N",
    };

    if (this.siteID != "") {
      options["SITE_ID"] = this.siteID;
    }

    const result = await GetTableRemote(this.tableName, obj, options);
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    return data;
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

    const result = await AddTable(tableName, values);
    return JSON.parse(result.data);
  }

  public async replaceFunc(tableName: string, keys: any, values: any) {
    if (!this.tableName) return [];

    setCreateProperty(values);
    setUpdateProperty(values);

    const result = await AddOrModifyTable(tableName, keys, values);
    return JSON.parse(result.data);
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyTable(tableName, key, values);
    return JSON.parse(result.data);
  }

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(tableName, key);
    return JSON.parse(result.data);
  }

  public refreshDataSource() {
    this.stageDataSource = createPagenateStore("STAGE_ID", this.stageLoadFunc);
    this.itemDataSource = createPagenateStore("ITEM_ID", this.itemLoadFunc);
    this.siteDataSource = createPagenateStore("SITE_ID", this.siteLoadFunc);
    this.siteDataSourceForSearch = createPagenateStore("SITE_ID", this.siteLoadFuncForSearch);
    this.bufferDataSource = createPagenateStore("BUFFER_ID", this.bufferLoadFunc);
    this.customerDataSource = createPagenateStore("CUSTOMER_ID", this.customerLoadFunc);
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      setOnEditing(false);

      this.dataSource = new RestVirtualCollectionView(this.loadFunc, {
        virtualizationRange: 100,
        refreshOnEdit: false,
      });
      this.dataGrid.refresh();
    } finally {
      this.loadingVisible = false;
    }
  }

  public clickAdd3Month(e: any) {
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 3, 0);
  }

  public clickAdd6Month(e: any) {
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 6, 0);
  }

  public clickAdd1Year(e: any) {
    this.endTime = new Date(this.startTime.getFullYear() + 1, this.startTime.getMonth(), 0);
  }

  public onRTFTargetCheckChanged(e: any) {
    this.isRTFTarget = e.value;
  }

  @Watch("siteID")
  @Watch("startTime")
  @Watch("endTime")
  @Watch("isRTFTarget")
  public filterChange() {
    this.onRefreshData();
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

  public async onLoadCondition() {
    try {
      const condition = (await loadCondition()) as any;

      this.siteID = condition.siteID || this.siteID;
      this.isRTFTarget = condition.isRTFTarget || this.isRTFTarget;
      this.startTime = condition.startTime || this.startTime;
      this.endTime = condition.endTime || this.endTime;
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onSaveCondition() {
    try {
      const condition = {
        siteID: this.siteID,
        startTime: this.startTime,
        endTime: this.endTime,
        isRTFTarget: this.isRTFTarget,
      };
      await saveCondition(condition);
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onRemoveCondition() {
    try {
      await removeCondition();
    } catch (e) {
      console.log("err", e);
    }
  }

  public onAddRow() {
    this.isAddRow = true;

    this.formData = {
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

  public onEditRow() {
    const selectedRowIndex = this.dataGrid.selection.row;
    if (selectedRowIndex < 0) return;

    const item = this.dataGrid.rows[selectedRowIndex]?.dataItem;
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

    await this.deleteFunc(this.propertyTableName, this.formKey);

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
      this.onRefreshData();
    }
  }

  public onRemoveRow() {
    const selectedRows = this.dataGrid.rows.filter((r: any) => r.isVisible && r.isSelected);
    if (selectedRows.length <= 0) return;

    this.deleteService(selectedRows);
  }

  public async deleteService(target: any) {
    let keys = target.map((r: any) => pick(r.dataItem, this.dataKey));

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

      this.onRefreshData();
    }
  }
}
</script>
