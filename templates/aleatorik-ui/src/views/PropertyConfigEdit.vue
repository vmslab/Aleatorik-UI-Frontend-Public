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
        :disabled="true"
      />
      <!-- <DxButton
        v-tooltip="{ text: $t('Edit') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Edit')"
        :disabled="!showEditButton"
        @click="onEditRow"
      /> -->
      <DxButton
        v-tooltip="{ text: $t('Edit') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Edit')"
        :disabled="true"
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
        <label>CATEGORY</label>
        <DxDropDownBox
          :width="500"
          :value="selectedCode"
          :defer-rendering="false"
          :data-source="codeDatas"
          display-expr="CODE_ID"
          value-expr="CODE_ID"
        >
          <template #content="{}">
            <WjFlexGrid
              :itemsSource="codeDatas"
              :initialized="onCodeGridInitialized"
              showSelectedHeaders="All"
              selectionMode="Row"
              allowSorting="MultiColumn"
              keyActionTab="Cycle"
              :allowDelete="true"
              :autoGenerateColumns="false"
              :deferResizing="true"
              :quickAutoSize="true"
              :imeEnabled="true"
              :alternatingRowStep="0"
              :isReadOnly="true"
              :selectedItems="selectedCode"
            >
              <WjFlexGridColumn
                :binding="col"
                :header="col.replace(/_/g, ' ')"
                v-for="col in codeColumns"
                :key="col"
                width="*"
              />
            </WjFlexGrid>
          </template>
        </DxDropDownBox>
      </div>
      <div slot="filter">
        <DxCheckBox :value="selectedIsActive" text="IS_ACTIVE" @value-changed="onActiveCheckChange" />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <WjFlexGrid
        :style="`
          width: var(--size-content-inner-width);
          height: var(--size-content-inner-height-outer-controller);
        `"
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
        <WjFlexGridColumn binding="CATEGORY" header="CATEGORY" aggregate="Cnt" />

        <WjFlexGridColumn binding="PROPERTY_ID" header="PROPERTY ID" />
        <WjFlexGridColumn binding="VALUE_TYPE" header="VALUE TYPE" />
        <WjFlexGridColumn binding="DESCRIPTION" header="DESCRIPTION" />
        <WjFlexGridColumn binding="IS_ACTIVE" header="IS ACTIVE" />
        <WjFlexGridColumn binding="RESERVED_WORD" header="RESERVED WORD" />
        <WjFlexGridColumn binding="DEFAULT_VALUE" header="DEFAULT VALUE" />

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

    <!-- <DxPopup
      class="moz-popup"
      :show-title="true"
      title="Property Config"
      :width="400"
      :height="380"
      :visible="isShowEditPopup"
      @hiding="
        () => {
          isShowEditPopup = false;
        }
      "
    >
      <DxScrollView width="100%" height="100%">
        <DxTexts
          :saveRowChanges="isAddRow ? $t('Add') : $t('Modify')"
          :cancelRowChanges="$t('Cancel')"
        />
        <DxForm
          class="moz-form"
          :show-colon-after-label="false"
          :form-key="dataKey"
          :form-data="formData"
          validation-group="validationFactor"
        >
          <DxItem :col-span="2" item-type="group">
            <DxItem :col-span="2" data-field="CATEGORY" />
            <DxItem :col-span="2" data-field="PROPERTY_ID" />
            <DxItem :col-span="2" data-field="VALUE_TYPE" />
            <DxItem :col-span="2" data-field="DESCRIPTION" />
            <DxItem
              :col-span="2"
              data-field="IS_ACTIVE"
              editor-type="dxRadioGroup"
              :editor-options="{ dataSource: ['Y', 'N'], layout: 'horizontal' }"
            />
            <DxItem :col-span="2" data-field="RESERVED_WORD" />
            <DxItem :col-span="2" data-field="DEFAULT_VALUE" />
          </DxItem>
        </DxForm>
      </DxScrollView>
    </DxPopup> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { createStoreConfig, ActionLoadOptions, showConfirm, showAlert, ExtendGrid } from "mozart-component-wijmo";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxScrollView } from "devextreme-vue/scroll-view";
import { DxForm, DxItem, DxRequiredRule, DxPatternRule } from "devextreme-vue/form";

import { GetTableRemote, GetTableAll, AddTable, ModifyTable, RemoveTable } from "@/api/mainService";
import { loadLayout, saveLayout, removeLayout, createContextMenu } from "@/utils/gridUtils";
import {
  setOnEditing,
  setCreateProperty,
  setUpdateProperty,
  loadCondition,
  saveCondition,
  removeCondition,
} from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import CustomStore from "devextreme/data/custom_store";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { DxCheckBox } from "devextreme-vue/check-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import DxDropDownBox from "devextreme-vue/drop-down-box";

import DxRadioGroup from "devextreme-vue/radio-group";

import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { CollectionView } from "@grapecity/wijmo";
// import debounce from "lodash/debounce";

@Component({
  components: {
    DxButton,
    DxCheckBox,
    DxNumberBox,
    DxItem,
    DxDropDownBox,
    DxPopup,
    DxScrollView,
    DxForm,
    DxRequiredRule,
    DxPatternRule,
    DxRadioGroup,
    DxLoadPanel,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class PropertyConfigEdit extends Vue {
  public filter: boolean = true;

  public tableName: string = "CFG_PROPERTY_MASTER";
  public dataKey: string[] = ["PROPERTY_ID"];
  public removeText: string = "PROPERTY_ID";

  public autoExpandAll: boolean = false;
  public showEditButton: boolean = false;

  public codeColumns: string[] = ["CODE_ID", "CODE_NAME"];

  public selectedIsActive: boolean = true;
  public selectedCode: any = [];

  public popupVisible: boolean = false;
  public codeDatas: any = [];

  public isAddRow: boolean = false;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public codeGrid: any = null;
  public codeExtendGrid: ExtendGrid | null = null;
  // public codeSource: any = [];

  public initial: boolean = false;

  public debounce?: any;
  public isShowEditPopup?: boolean = false;

  public loadingVisible = false;

  // public formKey: any = {};
  public formData: any = {};

  public gridContextOptions = {
    checkRowFilter: true,
    checkGroupPanel: false,
    useExportExcel: true,
    useLayout: true,
    onAddRow: this.onAddRow,
    onRemoveRow: this.onRemoveRow,
  };

  constructor() {
    super();
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      setOnEditing(false);

      this.dataSource = new CollectionView(await this.loadFunc({}));
      this.dataGrid.refresh();
    } finally {
      this.loadingVisible = false;
    }
  }

  public async prepareCodes() {
    this.codeDatas = await this.loadFunc2();
    // this.codeSource = new CollectionView(this.codeDatas);
    this.selectedCode = this.codeDatas.map((r: any) => r.CODE_ID);

    // initial select
    this.$nextTick(() => {
      this.codeGrid.rows.forEach((row: any) => {
        row.isSelected = true;
      });

      this.$nextTick(() => {
        this.codeGrid.refresh();
        // this.onRefreshData();
        this.initial = true;
      });
    });
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
        onCellDblClick: this.onRowDblClick,
      },
    });
  }

  public onCodeGridInitialized(grid: any) {
    this.codeGrid = grid;

    this.codeGrid?.selectionChanged.addHandler(this.onCodeSelectionChanged);
    this.codeExtendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: "CODE_ID",
        validateKey: "save",
      },
      gridOptions: {
        useFooter: false,
        useSelector: true,
      },
    });
  }

  public get dropdown() {
    return (this.$refs.dropdown as any).instance;
  }

  public onSelectionChanged() {
    const flag = this.codeGrid.rows.filter((r: any) => r.isSelected).length > 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public onCodeSelectionChanged() {
    // this.selectedCode = selectedRowsData.map((x: any) => x.CODE_ID);
    this.selectedCode = this.codeGrid.rows.filter((r: any) => r.isSelected).map((r: any) => r.dataItem.CODE_ID);

    // simple debounce
    if (!!this.debounce) {
      clearTimeout(this.debounce);
    }

    this.debounce = setTimeout(() => {
      this.onRefreshData();
      this.debounce = undefined;
    }, 100);
  }

  public onActiveCheckChange(e: any) {
    this.selectedIsActive = e.value;

    this.$nextTick(() => {
      this.onRefreshData();
    });
  }

  public async created() {
    this.onLoadCondition();
  }

  public mounted() {
    // if (this.dataGrid) loadLayout(this.dataGrid);
    // else showAlert({ message: "Not Found Data Grid Instance !", type: "error", title: "Error" });
    this.prepareCodes();
  }

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];
    const where = {
      CATEGORY: this.selectedCode,
      IS_ACTIVE: this.selectedIsActive ? "Y" : "N",
    };
    // 조회 조건에 선택한 데이터를 객체로 생성

    const result = await GetTableRemote(this.tableName, obj, where);
    // 생성된 객체를 stringfy하여 Server에 전송

    const data = JSON.parse(result.data);
    return data.data;
  }

  public async loadFunc2() {
    const result = await GetTableAll("CFG_CODE");

    let resultData = JSON.parse(result.data).data;
    return resultData;
  }

  public async insertFunc(values: any) {
    if (!this.tableName) return [];

    setCreateProperty(values);
    setUpdateProperty(values);
    // Form에서 생성되지 않는 데이터를 설정

    const result = await AddTable(this.tableName, values);
    // values 데이터를 stringfy하여 Server에 전송

    return JSON.parse(result.data);
    // Server의 결과를 Parse
  }

  public async updateFunc(key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);
    // Form에서 생성되지 않는 데이터를 설정

    const result = await ModifyTable(this.tableName, key, values);
    // key 데이터는 CustomStore에서 설정한 key에 해당하는 데이터가 Arguments로 전달됩니다.
    // key, values 데이터를 stringfy하여 Server에 전송

    return JSON.parse(result.data);
    // Server의 결과를 Parse
  }

  public async deleteFunc(key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(this.tableName, key);
    // key 데이터는 CustomStore에서 설정한 key에 해당하는 데이터가 Arguments로 전달됩니다.
    // key 데이터를 stringfy하여 Server에 전송

    return JSON.parse(result.data);
    // Server의 결과를 Parse
  }

  public async onOptionChanged(e: any) {
    switch (e.name) {
      case "editing":
        let changes = e.component.option("editing.changes");

        setOnEditing(changes.length !== 0);
        break;
      case "columns":
        const fullNames = e.fullName.split(".");

        if (fullNames[1] === "groupIndex") this.gridContextOptions.checkGroupPanel = true;

        break;
    }
  }

  public onInitNewRow(e: any) {
    e.data.IS_ACTIVE = "Y";
  }

  public onEditingStart(e: any) {
    e.data.IS_ACTIVE = e.data.IS_ACTIVE.trim();
  }

  public async onLoadCondition() {
    try {
      const condition = (await loadCondition()) as any;

      this.selectedCode = condition.category || this.selectedCode;
      this.selectedIsActive = condition.isActive || this.selectedIsActive;
      this.dataGrid.refresh();
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onSaveCondition() {
    try {
      const condition = {
        category: this.selectedCode,
        isActive: this.selectedIsActive,
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

    this.$nextTick(() => {
      this.dataGrid.addRow();
    });
  }

  public hasDataKey(data: any) {
    return this.dataKey.every((key: string) => {
      return !!data[key];
    });
  }

  public onRowDblClick(grid: any, hitTest: any, e: any) {
    this.isAddRow = false;

    if (hitTest.panel === grid.cells) {
      const row = hitTest.getRow();

      this.onEditRow(row.dataItem);
    }
  }

  public onEditRow(data?: object) {
    this.isAddRow = false;
    let formData;

    if (!this.hasDataKey(data)) {
      let rows = this.dataGrid.selectedRows;
      if (rows.length <= 0) {
        return;
      }

      formData = rows[rows.length - 1].dataItem;
    }

    this.formData = formData || data;
    this.isShowEditPopup = true;
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
    let recordString = "";
    let keys = target.map((item: any) => {
      if (recordString.length > 0) recordString += ", ";

      recordString += "'" + item[this.removeText] + "'";

      let keyObj: any = {};
      this.dataKey.forEach((key: string) => {
        keyObj[key] = item[key];
      });
      return keyObj;
    });

    const result = await showConfirm({
      message: `${this.$t(`RemoveMessage`, [keys[0].PROPERTY_ID])}`,
      // title: `Delete`,
      // message: `<b>Are you sure you want to delete ${
      //   keys.length > 1 ? "these records" : "this record"
      // }?</b>
      //   [${recordString}]`,
    });
    if (result) {
      await this.deleteFunc(keys);
      this.dataGrid.refresh();
    }
  }
}
</script>
