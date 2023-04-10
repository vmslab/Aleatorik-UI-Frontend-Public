<template>
  <div>
    <moz-controller>
      <DxButton
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :text="$t('Add')"
        @click="onAddRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Edit') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :text="$t('Edit')"
        :disabled="!showEditButton"
        @click="onEditRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :text="$t('Delete')"
        :disabled="!showEditButton"
        @click="onRemoveRow"
      />
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <DxDataGrid
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
        :column-auto-width="false"
        :hoverStateEnabled="true"
        columnResizingMode="widget"
        no-data-text="No data to display"
        :multiSelection="false"
        @selection-changed="onSelectionChanged"
        @context-menu-preparing="onContextMenuPreparing"
        @row-dbl-click="onRowDblClick"
      >
        <DxScrolling mode="virtual" />
        <DxSelection mode="single" select-all-mode="allPages" show-check-boxes-mode="always" />

        <DxFilterRow :visible="gridContextOptions.checkRowFilter" />
        <DxHeaderFilter :visible="true" />

        <DxGroupPanel :visible="gridContextOptions.checkGroupPanel" />
        <DxGrouping :contextMenuEnabled="true" :auto-expand-all="false" />

        <DxSummary>
          <DxTotalItem
            column="CUSTOMER_ID"
            alignment="center"
            summary-type="count"
            display-format="{0} Rows"
          />
        </DxSummary>
        <DxColumn data-field="CUSTOMER_ID" width="auto" />
        <DxColumn data-field="CUSTOMER_NAME" width="auto" />
        <DxColumn
          data-filed="_blank"
          caption=""
          :allowEditing="false"
          :allowExporting="false"
          :allowFiltering="false"
          :allowGrouping="false"
          :allowHeaderFiltering="false"
          :allowReordering="false"
          :allowResizing="false"
          :allowSorting="false"
        />
      </DxDataGrid>
    </div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="Register Customer"
      :width="600"
      :height="200"
      @hiding="
        () => {
          isShowEditPopup = false;
        }
      "
    >
      <DxScrollView width="100%" height="100%">
        <div class="moz-area-padding">
          <DxForm
            ref="dataForm"
            class="moz-form"
            :form-key="formKey"
            :form-data="formData"
            validation-group="customerData"
          >
            <DxSimpleItem
              data-field="CUSTOMER_ID"
              :editor-options="{
                disabled: !isAddRow,
              }"
            >
              <DxRequiredRule message="CUSTOMER_ID is required" />
              <DxAsyncRule
                :validation-callback="validationKey"
                message="This Key is already registered"
              />
            </DxSimpleItem>
            <DxSimpleItem data-field="CUSTOMER_NAME">
              <DxRequiredRule message="CUSTOMER_NAME is required" />
            </DxSimpleItem>
          </DxForm>
        </div>
      </DxScrollView>
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
import { Component, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { showConfirm } from "mozart-component-dev";
import { DxTextBox } from "devextreme-vue/text-box";
import {
  DxDataGrid,
  DxScrolling,
  DxPaging,
  DxPager,
  DxSelection,
  DxFilterRow,
  DxHeaderFilter,
  DxGroupPanel,
  DxGrouping,
  DxSummary,
  DxTotalItem,
  DxColumnFixing,
  DxColumn,
} from "devextreme-vue/data-grid";
import { DxForm, DxItem, DxRequiredRule, DxAsyncRule, DxSimpleItem } from "devextreme-vue/form";
import { DxScrollView } from "devextreme-vue/scroll-view";
import { GetTableRemote, AddTable, ModifyTable, RemoveTable } from "@/api/mainService";
import { loadLayout, createContextMenu } from "@/utils/gridUtils";
import { loadTableDatas } from "@/utils/dataUtils";
import ValidationEngine from "devextreme/ui/validation_engine";
import { DxButton } from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import CustomStore from "devextreme/data/custom_store";
import { createStoreConfig, ActionLoadOptions } from "mozart-component-dev";

@Component({
  components: {
    DxButton,
    DxDataGrid,
    DxScrolling,
    DxPaging,
    DxPager,
    DxSelection,
    DxFilterRow,
    DxHeaderFilter,
    DxGroupPanel,
    DxGrouping,
    DxSummary,
    DxTotalItem,
    DxColumnFixing,
    DxColumn,
    DxPopup,
    DxToolbarItem,
    DxLoadPanel,
    DxForm,
    DxItem,
    DxRequiredRule,
    DxAsyncRule,
    DxScrollView,
    DxSimpleItem,
    DxTextBox,
  },
})
export default class CustomerMgmt extends Vue {
  public tableName: string = "AT_CUSTOMER_MASTER";
  public dataKey: string[] = ["CUSTOMER_ID"];
  public formKey: any = {};
  public formData: any = {};

  public gridContextOptions = {
    checkRowFilter: true,
    checkGroupPanel: false,
    onAddRow: this.onAddRow,
    onRemoveRow: this.onRemoveRow,
  };

  public showEditButton: boolean = false;
  public isShowEditPopup: boolean = false;
  public isAddRow: boolean = true;
  public loadingVisible: boolean = false;

  constructor() {
    super();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any).instance;
  }

  public async mounted() {
    await loadLayout(this.dataGrid);
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

  public async loadFunc(obj: ActionLoadOptions) {
    if (!this.tableName) return [];
    const result = await GetTableRemote(this.tableName, obj);
    const data = JSON.parse(result.data);
    return data;
  }

  public async insertFunc(values: any) {
    if (!this.tableName) return [];
    const result = await AddTable(this.tableName, values);
    return JSON.parse(result.data);
  }

  public async updateFunc(key: any, values: any) {
    if (!this.tableName) return [];
    const result = await ModifyTable(this.tableName, key, values);
    return JSON.parse(result.data);
  }

  public async deleteFunc(key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(this.tableName, key);
    return JSON.parse(result.data);
  }

  public async showEditForm({ key, data }: any) {
    this.isAddRow = false;
    this.formKey = key;
    this.formData = data;

    this.$nextTick(() => {
      this.isShowEditPopup = true;
    });
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
      message: `${this.$t(`RemoveManyMessage`, [keys.length])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> ${
      //   keys.length > 1 ? "these records" : "this record"
      // }?`,
    });

    if (result) {
      await this.deleteFunc(keys);
      this.dataGrid.refresh();
    }
  }

  public validationKey({ value }: any) {
    return new Promise(async resolve => {
      if (!this.isAddRow) return resolve(true);
      const validationDatas = await loadTableDatas(this.tableName);

      const result = !validationDatas.some(
        (item: any) => item.CUSTOMER_ID.toLowerCase() == value.toLowerCase(),
      );
      resolve(result);
    });
  }

  public onSelectionChanged({ selectedRowKeys }: any) {
    const flag = selectedRowKeys.length > 0;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    createContextMenu(e, this.gridContextOptions);
  }

  public onAddRow() {
    this.isAddRow = true;
    this.formData = {};
    this.$nextTick(() => {
      this.isShowEditPopup = true;
    });
  }

  public onEditRow(index: number) {
    const selectedRows = this.dataGrid.getSelectedRowKeys();

    let rowIdx = Number.isInteger(index) ? index : -1;

    if (rowIdx < 0 && selectedRows && selectedRows.length > 0) {
      rowIdx = this.dataGrid.getRowIndexByKey(selectedRows[selectedRows.length - 1]);
    }

    if (rowIdx < 0) return;

    const rows = this.dataGrid.getVisibleRows();
    const row = rows[rowIdx];
    this.showEditForm(row);
  }

  public onRowDblClick(e: any) {
    if (e.data) {
      this.showEditForm(e);
    }
  }

  public async onSaveData() {
    const valid = ValidationEngine.validateGroup("customerData");
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
      result = await this.insertFunc(this.formData);
      if (result.count === 0) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
    } else {
      result = await this.updateFunc(this.formKey, this.formData);
      if (result.count === 0) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
    }

    if (result) {
      this.dataGrid.refresh();
      this.dataGrid.deselectAll();
      this.isShowEditPopup = false;
    }
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
}
</script>
