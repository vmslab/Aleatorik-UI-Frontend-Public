<template>
  <div>
    <moz-controller>
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
        <WjFlexGridColumn binding="LOT_ID" header="LOT ID" aggregate="Cnt" />
        <WjFlexGridColumn binding="LOT_TYPE" header="LOT TYPE" />
        <WjFlexGridColumn binding="LOT_QTY" header="LOT QTY" dataType="Number" />
        <WjFlexGridColumn binding="STATUS" header="STATUS" />
        <WjFlexGridColumn binding="ITEM_ID" header="ITEM ID" />
        <WjFlexGridColumn binding="SITE_ID" header="SITE ID" />
        <WjFlexGridColumn binding="BUFFER_ID" header="BUFFER ID" />
        <WjFlexGridColumn binding="ROUTING_ID" header="ROUTING ID" />
        <WjFlexGridColumn binding="OPERATION_ID" header="OPERATION ID" />
        <WjFlexGridColumn binding="RESOURCE_ID" header="RESOURCE ID" />

        <WjFlexGridColumn
          binding="AVAILABLE_TIME"
          header="AVAILABLE TIME"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
        />
        <WjFlexGridColumn binding="TRACK_IN_TIME" header="TRACK IN TIME" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />

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
      title="Wip Config"
      :width="600"
      :height="612"
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
          validation-group="validationWip"
          :show-colon-after-label="false"
        >
          <DxTabbedItem cssClass="moz-popup-tabs-colored">
            <DxTabPanelOptions :selected-index="tabIndex" />
            <DxTab title="Basic Information">
              <DxItem
                data-field="LOT_ID"
                :editor-options="{
                  disabled: !isAddRow,
                }"
              >
                <DxRequiredRule message="LOT_ID is required" />
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
                data-field="LOT_TYPE"
                editor-type="dxSelectBox"
                :editor-options="{
                  items: ['Wip', 'Inventory'],
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                }"
              >
                <DxRequiredRule message="LOT_TYPE is required" />
              </DxItem>
              <DxItem
                data-field="LOT_QTY"
                editor-type="dxNumberBox"
                :editor-options="{
                  showSpinButtons: true,
                  format: ',##0.#########',
                }"
              >
                <DxRequiredRule message="LOT_QTY is required" />
              </DxItem>
              <DxItem
                data-field="STATUS"
                editor-type="dxSelectBox"
                :editor-options="{
                  items: ['Wait', 'Run'],
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                }"
              >
                <DxRequiredRule message="STATUS is required" />
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
                data-field="ROUTING_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'ROUTING_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: routingDataSource,
                  onValueChanged: onRoutingValueChanged,
                }"
              />
              <DxItem
                :key="selectedRoutingID"
                data-field="OPERATION_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'OPERATION_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: operationDataSource,
                  noDataText: 'Select Valid ROUTING_ID',
                }"
              />
              <DxItem
                data-field="RESOURCE_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'RESOURCE_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: resourceDataSource,
                }"
              />
              <DxItem
                data-field="AVAILABLE_TIME"
                editor-type="dxDateBox"
                :editor-options="{
                  displayFormat: 'yyyy-MM-dd',
                  useMaskBehavior: true,
                }"
              >
                <DxRequiredRule message="AVAILABLE_TIME is required" />
              </DxItem>
              <DxItem
                data-field="TRACK_IN_TIME"
                editor-type="dxDateBox"
                :editor-options="{
                  displayFormat: 'yyyy-MM-dd',
                  useMaskBehavior: true,
                }"
              >
                <DxRequiredRule message="TRACK_IN_TIME is required" />
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
                          // items: property.reservedWord.split(',').map(s => s.trim()), // console
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
import { ActionLoadOptions, showConfirm, RestVirtualCollectionView, ExtendGrid } from "mozart-component-wijmo";
import { GetTableRemote, AddTable, ModifyTable, RemoveTable, AddOrModifyTable } from "@/api/mainService";
import { setOnEditing, setCreateProperty, setUpdateProperty, createKeyRef } from "@/utils/commonUtils";
import {
  loadTableDatas,
  loadProperties,
  loadPropertyValues,
  createPagenateStore,
  loadDistinctRemoteDatas,
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
  DxRangeRule,
  DxAsyncRule,
} from "devextreme-vue/form";
import DxRadioGroup from "devextreme-vue/radio-group";
import { DxCheckBox } from "devextreme-vue/check-box";
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
    DxRangeRule,
    DxAsyncRule,
    DxRadioGroup,
    DxCheckBox,
    DxTagBox,
    DxDateBox,
    DxScrollView,
    DxLoadPanel,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class WipEditView extends Vue {
  public tableName: string = "CFG_WIP";
  public propertyTableName: string = "CFG_WIP_PROPERTY_VALUE";
  public categoryID: string = "wip";
  public dataKey: string[] = ["LOT_ID"];

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};

  public stageDataSource: any = [];
  public itemDataSource: any = [];
  public bufferDataSource: any = [];
  public siteDataSource: any = [];
  public routingDataSource: any = [];
  public operationDataSource: any = [];
  public resourceDataSource: any = [];

  public selectedRoutingID = "";

  public propertyDatas: any[] = [];

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
    this.loadingVisible = false;
    await this.onRefreshData();
  }

  public stageLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_STAGE", obj, "STAGE_ID");
  }

  public itemLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_ITEM_MASTER", obj, "ITEM_ID");
  }

  public bufferLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_BUFFER_MASTER", obj, "BUFFER_ID");
  }

  public siteLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_SITE_MASTER", obj, "SITE_ID");
  }

  public routingLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_ROUTING_MASTER", obj, "ROUTING_ID");
  }

  public resourceLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_RESOURCE_MASTER", obj, "RESOURCE_ID");
  }

  public oprationLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_ROUTING_OPERATION", obj, "OPERATION_ID", {
      ROUTING_ID: this.selectedRoutingID,
    });
  }

  public async onRoutingValueChanged({ value }: any) {
    this.operationDataSource = createPagenateStore("OPERATION_ID", this.oprationLoadFunc);
    this.selectedRoutingID = value;
  }

  public refreshDataSource() {
    this.stageDataSource = createPagenateStore("STAGE_ID", this.stageLoadFunc);
    this.itemDataSource = createPagenateStore("ITEM_ID", this.itemLoadFunc);
    this.bufferDataSource = createPagenateStore("BUFFER_ID", this.bufferLoadFunc);
    this.siteDataSource = createPagenateStore("SITE_ID", this.siteLoadFunc);
    this.routingDataSource = createPagenateStore("ROUTING_ID", this.routingLoadFunc);
    this.resourceDataSource = createPagenateStore("RESOURCE_ID", this.resourceLoadFunc);
    this.operationDataSource = createPagenateStore("OPERATION_ID", this.oprationLoadFunc);
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
    const result = await GetTableRemote(this.tableName, obj);
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    return data;
  }

  public parseFormData(data: any) {
    return {
      LOT_ID: data.LOT_ID,
      STAGE_ID: data.STAGE_ID,
      LOT_TYPE: data.LOT_TYPE,
      LOT_QTY: data.LOT_QTY,
      STATUS: data.STATUS,
      ITEM_ID: data.ITEM_ID,
      SITE_ID: data.SITE_ID,
      BUFFER_ID: data.BUFFER_ID,
      ROUTING_ID: data.ROUTING_ID,
      OPERATION_ID: data.OPERATION_ID,
      RESOURCE_ID: data.RESOURCE_ID,
      AVAILABLE_TIME: data.AVAILABLE_TIME,
      TRACK_IN_TIME: data.TRACK_IN_TIME,
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

  public onAddRow() {
    this.isAddRow = true;

    this.formData = {
      LOT_TYPE: "Wip",
      STATUS: "Wait",
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
    const valid = ValidationEngine.validateGroup("validationWip");
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
