<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="Preset Factor Editor"
      :width="600"
      height="auto"
      @hiding="onHiding"
    >
      <div class="moz-area-padding">
        <DxForm
          ref="dataForm"
          class="moz-form"
          :form-key="formKey"
          :form-data="formData"
          validation-group="validationFactor"
          :show-colon-after-label="false"
        >
          <DxItem
            data-field="RULE_POINT"
            :editor-options="{
              disabled: true,
            }"
          />
          <DxItem
            data-field="PRESET_ID"
            :editor-options="{
              disabled: true,
            }"
          />
          <DxItem
            data-field="FACTOR_ID"
            editor-type="dxSelectBox"
            :editor-options="{
              disabled: !isAddRow,
              items: factorItems,
            }"
          >
            <DxRequiredRule message="FACTOR_ID is required" />
            <DxAsyncRule :validation-callback="validationKey" message="This Key is already registered" />
          </DxItem>
          <DxItem
            v-if="sortType === 'WeightSorted'"
            data-field="SEQ"
            editor-type="dxNumberBox"
            :editor-options="{
              showSpinButtons: true,
              format: ',##0.#########',
            }"
          >
            <DxRequiredRule message="SEQ is required" />
            <DxAsyncRule :validation-callback="validationSeq" message="This SEQ is already registered" />
          </DxItem>
          <DxItem
            v-if="sortType === 'WeightSum'"
            data-field="WEIGHT"
            editor-type="dxNumberBox"
            :editor-options="{
              showSpinButtons: true,
              format: ',##0.#########',
            }"
          >
            <DxRequiredRule message="WEIGHT is required" />
          </DxItem>
          <!-- <DxItem
            data-field="PARAMETER_VALUE"
            editor-type="dxTextArea"
            :editor-options="{
              height: 82,
              readOnly: true,
            }"
          /> -->
        </DxForm>
        <!-- <hr style="margin: 20px 0 5px 0" />

        <div class="dx-card">
          <div class="dx-card-title">
            <div class="dx-card-title-text">PARAMETER EDITOR</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton
                v-tooltip="{ text: $t('Add') + ' Parameter' }"
                icon="add"
                stylingMode="text"
                @click="addParameter"
              />
              <DxButton
                v-tooltip="{ text: $t('Delete') + ' Parameter' }"
                icon="minus"
                stylingMode="text"
                @click="removeParameter"
              />
            </div>
          </div>
          <div class="dx-card-text">
            <DxDataGrid
      v-cell-tooltip
              class="moz-simple-grid none-header-border-has-padding"
              ref="dataGrid"
              :data-source="dataSource"
              @toolbar-preparing="onToolbarPreparing"
            >
              <DxEditing mode="batch" :allow-updating="true" start-edit-action="click" />
              <DxScrolling mode="virtual" />
              <DxSelection
                mode="multiple"
                select-all-mode="allPages"
                show-check-boxes-mode="always"
              />

              <DxSummary>
                <DxTotalItem
                  column="Parameter_Name"
                  alignment="center"
                  summary-type="count"
                  display-format="{0} Rows"
                />
              </DxSummary>
              <DxColumn data-field="Parameter_Name" />
              <DxColumn data-field="Value" />
            </DxDataGrid>
          </div>
        </div> -->
      </div>
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
    <DxLoadPanel
      :visible="loadingVisible"
      :show-indicator="true"
      :show-pane="true"
      :shading="false"
      shading-color="rgba(0,0,0,0.4)"
    />
  </div>
</template>

<script lang="ts">
import { MainModule } from "@/store/modules/mainStore";
import { Component, Vue, Prop } from "vue-property-decorator";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import {
  DxDataGrid,
  DxColumn,
  DxScrolling,
  DxEditing,
  DxTexts,
  DxSummary,
  DxSelection,
  DxTotalItem,
} from "devextreme-vue/data-grid";
import { DxForm, DxItem, DxLabel, DxRequiredRule, DxPatternRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";
import ValidationEngine from "devextreme/ui/validation_engine";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { AddTable, ModifyTable } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { setCreateProperty, setUpdateProperty } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxScrolling,
    DxEditing,
    DxTexts,
    DxSummary,
    DxSelection,
    DxTotalItem,
    DxLoadPanel,
    DxButton,
    DxPopup,
    DxToolbarItem,
    DxForm,
    DxItem,
    DxLabel,
    DxRequiredRule,
    DxPatternRule,
    DxRangeRule,
    DxAsyncRule,
  },
})
export default class RuleSetConfiguratorPresetEditor extends Vue {
  @Prop({ type: String }) public rulePoint?: string;
  @Prop({ type: String }) public factorID?: string;
  @Prop({ type: String }) public presetID?: string;
  @Prop({ type: String }) public sortType?: string;
  @Prop({ type: Boolean }) public isShowEditPopup?: boolean;
  @Prop({ type: Boolean }) public isAddRow?: boolean;

  public tableName = "CFG_PRESET_FACTOR_MAP";
  public factorTableName = "CFG_FACTOR_MASTER";
  public formKey: any = {};
  public formData: any = {};

  public factorItems: string[] = [];
  public parameterItems: any[] = [];

  public loadingVisible = false;

  constructor() {
    super();
  }

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  // public get dataGrid() {
  //   return (this.$refs.dataGrid as any)?.instance;
  // }

  // public get dataSource() {
  //   return new ArrayStore({
  //     key: ["Parameter_Name"],
  //     data: this.parameterItems,
  //   });
  // }

  // public hideHeaderPanel() {
  //   let panelList = document.querySelectorAll(
  //     ".dx-datagrid-header-panel",
  //   ) as NodeListOf<HTMLElement>;

  //   if (panelList != null) {
  //     panelList.forEach((panel: HTMLElement) => {
  //       panel.style.display = "none";
  //     });
  //   }
  // }

  // public onToolbarPreparing(e: any) {
  //   for (let item of e.toolbarOptions.items) {
  //     if (item.widget === "dxButton") item.visible = false;
  //   }

  //   this.$nextTick(() => {
  //     this.hideHeaderPanel();
  //   });
  // }

  public setFormData() {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      const factorDatas = await loadTableDatas(this.factorTableName, {
        RULE_POINT: this.rulePoint,
      });
      this.factorItems = factorDatas ? factorDatas.map((item: any) => item.FACTOR_ID) : [];

      this.formKey = { PRESET_ID: this.presetID, FACTOR_ID: this.factorID };
      this.formData = {
        RULE_POINT: this.rulePoint,
        PRESET_ID: this.presetID,
        FACTOR_ID: this.isAddRow ? "" : this.factorID,
      };

      if (this.factorID && !this.isAddRow) {
        this.formData.FACTOR_ID = this.factorID;
        const factorItem = factorDatas.find((item: any) => item.FACTOR_ID == this.factorID);
        if (factorItem) {
          this.formData.PRESET_ID = factorItem.PRESET_ID;
          this.formData.FACTOR_ID = factorItem.FACTOR_ID;
          this.formData.PARAMETER_VALUE = factorItem.PARAMETER_VALUE;
        }
      }

      this.loadingVisible = false;
      this.dataForm.repaint();
      resolve(true);
    });
  }

  public onHiding({ result }: any = null) {
    this.$emit("close", { flag: false, result: result });
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName, { PRESET_ID: this.presetID });
    const currentKey = this.formData.FACTOR_ID;

    return new Promise(resolve => {
      if (!this.isAddRow) resolve(true);
      const result = !validationDatas.some((item: any) => item.FACTOR_ID.toLowerCase() == currentKey.toLowerCase());
      resolve(result);
    });
  }

  public async validationSeq({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName, { PRESET_ID: this.presetID });
    const currentKey = this.formData.SEQ;

    return new Promise(resolve => {
      if (!this.isAddRow) resolve(true);
      const result = !validationDatas.some((item: any) => item.SEQ == currentKey);
      resolve(result);
    });
  }

  public async insertFunc(tableName: string, values: any) {
    if (!this.tableName) return [];

    setCreateProperty(values);
    setUpdateProperty(values);

    const result = await AddTable(tableName, values);
    return JSON.parse(result.data);
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyTable(tableName, key, values);
    return JSON.parse(result.data);
  }

  public async onSaveData() {
    this.loadingVisible = true;
    try {
      const valid = ValidationEngine.validateGroup("validationFactor");
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

      delete this.formData.RULE_POINT;

      let result = null;
      if (this.isAddRow) {
        result = await this.insertFunc(this.tableName, this.formData);
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      } else {
        result = await this.updateFunc(this.tableName, this.formKey, this.formData);
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      }

      if (result) {
        this.onHiding({ result });
        return;
      }

      MainModule.showSnackBar({ message: `${this.$t(`ErrorMessage`)}`, type: "error" });
    } finally {
      this.loadingVisible = false;
    }
  }
}
</script>
