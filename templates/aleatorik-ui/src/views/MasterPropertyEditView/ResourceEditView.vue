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
          display-expr="key"
          search-expr="SITE_ID"
          :search-enabled="true"
          :show-clear-button="true"
          :data-source="siteDataSource"
        />
      </div>
      <div slot="filter">
        <label>RESOURCE_GROUP_ID</label>
        <DxTagBox
          width="200px"
          v-model="resourceGroupID"
          value-expr="key"
          display-expr="key"
          :data-source="resourceGroupDataSource"
          :show-clear-button="true"
          :show-selection-controls="true"
        />
      </div>
      <div slot="filter">
        <DxCheckBox :value="isActive" text="IS_ACTIVE" @value-changed="onActiveCheckChanged" />
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
        <WjFlexGridColumn binding="RESOURCE_ID" header="RESOURCE ID" aggregate="Cnt" />
        <WjFlexGridColumn binding="SITE_ID" header="SITE ID" />
        <WjFlexGridColumn binding="LOCATION" header="LOCATION" />
        <WjFlexGridColumn binding="CATEGORY" header="CATEGORY" />
        <WjFlexGridColumn binding="RESOURCE_TYPE" header="RESOURCE TYPE" />
        <WjFlexGridColumn binding="RESOURCE_GROUP_ID" header="RESOURCE GROUP ID" />
        <WjFlexGridColumn binding="STAGE_ID" header="STAGE ID" />
        <WjFlexGridColumn binding="CAPACITY_TYPE" header="CAPACITY TYPE" />
        <WjFlexGridColumn binding="CAPACITY_MODE" header="CAPACITY MODE" />
        <WjFlexGridColumn binding="IS_ACTIVE" header="IS ACTIVE" />
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
      title="Resource Config"
      :width="600"
      :height="578"
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
          validation-group="validationResource"
          :show-colon-after-label="false"
        >
          <DxTabbedItem cssClass="moz-popup-tabs-colored">
            <DxTabPanelOptions :selected-index="tabIndex" />
            <DxTab title="Basic Information">
              <DxItem
                data-field="RESOURCE_ID"
                :editor-options="{
                  disabled: !isAddRow,
                }"
              >
                <DxRequiredRule message="RESOURCE_ID is required" />
                <DxAsyncRule
                  v-if="isAddRow"
                  :validation-callback="validationKey"
                  message="This Key is already registered"
                />
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
              <DxItem data-field="LOCATION" />
              <DxItem
                data-field="CATEGORY"
                editor-type="dxSelectBox"
                :editor-options="{
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  items: [`Resource`, `Tool`],
                }"
              >
                <DxRequiredRule message="CATEGORY is required" />
              </DxItem>
              <DxItem
                data-field="RESOURCE_TYPE"
                editor-type="dxSelectBox"
                :editor-options="{
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  items: [`Table`, `Inifinite`, `Batch`],
                }"
              >
                <DxRequiredRule message="RESOURCE_TYPE is required" />
              </DxItem>
              <DxItem
                data-field="RESOURCE_GROUP_ID"
                editor-type="dxSelectBox"
                :editor-options="{
                  valueExpr: 'key',
                  displayExpr: 'key',
                  searchExpr: 'RESOURCE_GROUP_ID',
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  dataSource: resourceGroupDataSource,
                }"
              >
                <DxRequiredRule message="RESOURCE_GROUP_ID is required" />
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
              <DxItem data-field="CAPACITY_TYPE" />
              <DxItem
                data-field="CAPACITY_MODE"
                editor-type="dxSelectBox"
                :editor-options="{
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  items: [`Finite`, `Inifinite`],
                }"
              >
                <DxRequiredRule message="CAPACITY_MODE is required" />
              </DxItem>
              <DxItem
                data-field="IS_ACTIVE"
                editor-type="dxRadioGroup"
                :editor-options="{ items: ['Y', 'N'], layout: 'horizontal' }"
              />
              <DxItem
                data-field="#Capacity"
                editor-type="dxSelectBox"
                :editor-options="{
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  items: calendarItems,
                }"
              >
                <DxLabel text="Capacity calendar" />
                <DxRequiredRule message="Capacity calendar is required" />
              </DxItem>
              <DxItem
                data-field="#SetupID"
                editor-type="dxSelectBox"
                :editor-options="{
                  searchEnabled: true,
                  showClearButton: true,
                  acceptCustomValue: true,
                  items: setupInfoItems,
                }"
              >
                <DxLabel text="SETUP Condition" />
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
  DxLabel,
  DxRequiredRule,
  DxRangeRule,
  DxAsyncRule,
  DxTabbedItem,
  DxTabPanelOptions,
  DxTab,
} from "devextreme-vue/form";
import DxRadioGroup from "devextreme-vue/radio-group";
import { DxScrollView } from "devextreme-vue/scroll-view";
import DxSelectBox from "devextreme-vue/select-box";
import DxTagBox from "devextreme-vue/tag-box";
import { DxCheckBox } from "devextreme-vue/check-box";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: {
    DxButton,
    DxPopup,
    DxToolbarItem,
    DxForm,
    DxGroupItem,
    DxItem,
    DxLabel,
    DxRequiredRule,
    DxRangeRule,
    DxAsyncRule,
    DxRadioGroup,
    DxSelectBox,
    DxTagBox,
    DxCheckBox,
    DxTabbedItem,
    DxTabPanelOptions,
    DxTab,
    DxScrollView,
    DxLoadPanel,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class ResourceEditView extends Vue {
  public filter = true;

  public tableName: string = "CFG_RESOURCE_MASTER";
  public propertyTableName: string = "CFG_RESOURCE_PROPERTY_VALUE";
  public categoryID: string = "Resource";
  public dataKey: string[] = ["RESOURCE_ID"];
  public tabIndex = 0;

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};

  public resourceGroupDataSource: any = [];
  public stageDataSource: any = [];
  public siteDataSource: any = [];

  public calendarItems: string[] = [];
  public setupInfoItems: string[] = [];
  public propertyDatas: any[] = [];

  public siteID = "";
  public resourceGroupID: string[] = [];
  public isActive = true;

  public showEditButton = false;
  public isChanging = false;
  public isLoadedData = false;
  public isShowEditPopup = false;
  public isShowUploadPopup = false;
  public isAddRow = true;
  public isAddContinue = false;
  public loadingVisible = false;

  public gridWidth = 0;
  public gridColumnWidthInfos: any = {};

  public customPropertiesLength = 0;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.dataGrid?.selectionChanged.addHandler(this.onSelectionChanged);
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
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

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public onSelectionChanged({ selectedRowKeys }: any) {
    if (!selectedRowKeys) return;

    const flag = selectedRowKeys?.length > 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public async mounted() {
    this.loadingVisible = true;
    this.refreshDataSource();
    const calendarDatas = await loadTableDatas("CFG_CALENDAR_MASTER", {
      CALENDAR_TYPE: "#Capacity",
    });
    this.calendarItems = calendarDatas.map((item: any) => item.CALENDAR_ID);
    const setupInfoDatas = await loadTableDatas("CFG_SETUP_INFO");
    this.setupInfoItems = setupInfoDatas.map((item: any) => item.SETUP_ID);
    this.setupInfoItems.unshift("");

    this.propertyDatas = await loadProperties(this.categoryID);
    this.customPropertiesLength = this.propertyDatas.filter(
      property => property.propertyID.substring(0, 1) !== "#",
    ).length;

    await this.onLoadCondition();
    this.loadingVisible = false;
    await this.onRefreshData();
  }

  public resourceGroupLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_RESOURCE_GROUP_MASTER", obj, "RESOURCE_GROUP_ID");
  }

  public stageLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_STAGE", obj, "STAGE_ID");
  }

  public siteLoadFunc(obj: ActionLoadOptions) {
    return loadDistinctRemoteDatas("CFG_SITE_MASTER", obj, "SITE_ID");
  }

  @Watch("siteID")
  @Watch("resourceGroupID")
  @Watch("isActive")
  public filterChange() {
    this.onRefreshData();
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];
    const result = await GetTableRemote(this.tableName, obj, {
      SITE_ID: this.siteID,
      RESOURCE_GROUP_ID: this.resourceGroupID,
      IS_ACTIVE: this.isActive ? "Y" : "N",
    });
    const data = JSON.parse(result.data);

    this.isLoadedData = data.totalCount > 0;
    return data;
  }

  public parseFormData(data: any) {
    return {
      RESOURCE_ID: data.RESOURCE_ID,
      SITE_ID: data.SITE_ID,
      LOCATION: data.LOCATION,
      CATEGORY: data.CATEGORY,
      RESOURCE_TYPE: data.RESOURCE_TYPE,
      RESOURCE_GROUP_ID: data.RESOURCE_GROUP_ID,
      STAGE_ID: data.STAGE_ID,
      CAPACITY_TYPE: data.CAPACITY_TYPE,
      CAPACITY_MODE: data.CAPACITY_MODE,
      IS_ACTIVE: data.IS_ACTIVE.trim(),
    };
  }

  public parsePropertyKey(key: any, propertyID: string) {
    key.PROPERTY_ID = propertyID;
    return key;
  }

  public parsePropertyData(data: any) {
    return this.propertyDatas.map((item: any) => {
      let parseData;

      if (item.propertyID === "#Capacity") {
        parseData = {
          PROPERTY_ID: item.propertyID,
          CALENDAR_ID: data[item.propertyID],
        };
      } else {
        parseData = {
          PROPERTY_ID: item.propertyID,
          VALUE: data[item.propertyID] instanceof Date ? data[item.propertyID].toDateString() : data[item.propertyID],
        };
      }

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
    this.resourceGroupDataSource = createPagenateStore("RESOURCE_GROUP_ID", this.resourceGroupLoadFunc);
    this.stageDataSource = createPagenateStore("STAGE_ID", this.stageLoadFunc);
    this.siteDataSource = createPagenateStore("SITE_ID", this.siteLoadFunc);
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

  public onActiveCheckChanged(e: any) {
    this.isActive = e.value;
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = createKeyRef(this.dataKey, this.formData);

    return new Promise(resolve => {
      if (!this.isAddRow) {
        resolve(true);
        return;
      }

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
      this.resourceGroupID = condition.resourceGroupID || this.resourceGroupID;
      this.isActive = condition.isActive || this.isActive;
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onSaveCondition() {
    try {
      const condition = {
        siteID: this.siteID,
        resourceGroupID: this.resourceGroupID,
        isActive: this.isActive,
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
      CATEGORY: "Resource",
      RESOURCE_TYPE: "Table",
      CAPACITY_MODE: "Finite",
      IS_ACTIVE: "Y",
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
    try {
      this.loadingVisible = true;

      const valid = ValidationEngine.validateGroup("validationResource");
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

      await this.deleteFunc(this.propertyTableName, [this.formKey]);

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
    } finally {
      this.loadingVisible = false;
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
