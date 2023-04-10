<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="RuleSet Editor"
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
          validation-group="validationRuleset"
          :show-colon-after-label="false"
        >
          <DxItem
            data-field="RULESET_ID"
            :editor-options="{
              disabled: !isAddRow,
            }"
          >
            <DxRequiredRule message="RULESET_ID is required" />
            <DxAsyncRule :validation-callback="validationKey" message="This Key is already registered" />
          </DxItem>
          <DxItem
            data-field="LEVEL_COUNT"
            editor-type="dxNumberBox"
            :editor-options="{
              disabled: selectedRefID,
              showSpinButtons: true,
              format: ',##0.#########',
            }"
          >
            <DxRequiredRule message="LEVEL_COUNT is required" />
            <DxRangeRule :min="1" message="LEVEL_COUNT be at least 1" />
            <DxRangeRule :max="5" message="LEVEL_COUNT be at most 5" />
          </DxItem>
          <DxItem
            data-field="DESCRIPTION"
            editor-type="dxTextArea"
            :editor-options="{
              height: 82,
            }"
          />
          <DxItem
            v-if="isAddRow"
            data-field="REF_RULESET_ID"
            editor-type="dxSelectBox"
            :editor-options="{
              items: ruleSetItems,
              onValueChanged: changeRefID,
            }"
          />
        </DxForm>
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
import ValidationEngine from "devextreme/ui/validation_engine";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { AddTable, ModifyTable, CloneRuleSetReference } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { setCreateProperty, setUpdateProperty } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";

@Component({
  components: {
    DxLoadPanel,
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
  },
})
export default class RuleSetConfiguratorRuleSetEditor extends Vue {
  @Prop({ type: String }) public moduleType?: string;
  @Prop({ type: String }) public ruleSetID?: string;
  @Prop({ type: Boolean }) public isShowEditPopup?: boolean;
  @Prop({ type: Boolean }) public isAddRow?: boolean;

  public tableName = "CFG_RULESET_MASTER";
  public formKey: any = {};
  public formData: any = {};

  public ruleSetDatas: any[] = [];
  public ruleSetItems: string[] = [];

  public loadingVisible = false;
  public selectedRefID = false;

  constructor() {
    super();
  }

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public get moduleList() {
    return (this.$refs.moduleList as any)?.instance;
  }

  public setFormData(ruleSetID?: string) {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      this.ruleSetDatas = await loadTableDatas(this.tableName, { MODULE_TYPE: this.moduleType });
      this.ruleSetItems = this.ruleSetDatas ? this.ruleSetDatas.map((item: any) => item.RULESET_ID) : [];

      if (this.ruleSetItems.length > 0) {
        this.ruleSetItems.unshift("");
      }

      this.formKey = { RULESET_ID: this.ruleSetID };
      this.formData = { RULESET_ID: this.ruleSetID, MODULE_TYPE: this.moduleType, LEVEL_COUNT: 1 };

      if (this.ruleSetID) {
        this.formData.RULESET_ID = this.ruleSetID;
        const ruleSetItem = this.ruleSetDatas.find((item: any) => item.RULESET_ID == this.ruleSetID);
        if (ruleSetItem) {
          this.formData.RULESET_ID = ruleSetItem.RULESET_ID;
          this.formData.MODULE_TYPE = ruleSetItem.MODULE_TYPE;
          this.formData.LEVEL_COUNT = ruleSetItem.LEVEL_COUNT;
          this.formData.DESCRIPTION = ruleSetItem.DESCRIPTION;
        }
      } else if (ruleSetID) {
        this.formData.REF_RULESET_ID = ruleSetID;
        const refItem = this.ruleSetDatas.find((item: any) => item.RULESET_ID === ruleSetID);
        if (refItem) {
          this.formData.LEVEL_COUNT = refItem.LEVEL_COUNT;
        }
      }

      this.loadingVisible = false;
      resolve(this.dataForm.repaint());
    });
  }

  public changeRefID(e: any) {
    this.selectedRefID = false;
    const refItem = this.ruleSetDatas.find(item => item.RULESET_ID === e.value);
    if (refItem) {
      this.selectedRefID = true;
      this.formData.LEVEL_COUNT = refItem.LEVEL_COUNT;
      this.dataForm.repaint();
    }
  }

  public onHiding({ itemKey }: any = null) {
    this.$emit("close", { flag: false, itemKey });
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = this.formData.RULESET_ID;

    return new Promise(resolve => {
      if (!this.isAddRow) resolve(true);
      const result = !validationDatas.some((item: any) => item.RULESET_ID.toLowerCase() == currentKey.toLowerCase());
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

  public async cloneFunc(keys: any) {
    let values = {};
    setCreateProperty(values);
    setUpdateProperty(values);

    const result = await CloneRuleSetReference(keys, values);
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
      const valid = ValidationEngine.validateGroup("validationRuleset");
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
        if (this.formData.REF_RULESET_ID) {
          result = await this.cloneFunc(this.formData);
        } else {
          delete this.formData.REF_RULESET_ID;
          result = await this.insertFunc(this.tableName, this.formData);
        }
        // result = await this.insertFunc(this.tableName, this.formData);
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
        this.onHiding({ itemKey: this.formKey.RULESET_ID || this.formData.RULESET_ID });
        return;
      }

      MainModule.showSnackBar({ message: `${this.$t(`ErrorMessage`)}`, type: "error" });
    } finally {
      this.loadingVisible = false;
    }
  }
}
</script>
