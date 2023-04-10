<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="Preset Editor"
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
          validation-group="validationPreset"
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
              disabled: !isAddRow,
            }"
          >
            <DxRequiredRule message="PRESET_ID is required" />
            <DxAsyncRule :validation-callback="validationKey" message="This Key is already registered" />
          </DxItem>
          <DxItem
            data-field="SORT_TYPE"
            editor-type="dxSelectBox"
            :editor-options="{
              items: ['WeightSorted', 'WeightSum'],
            }"
          >
            <DxRequiredRule message="SORT_TYPE is required" />
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
            data-field="REF_PRESET_ID"
            editor-type="dxSelectBox"
            :editor-options="{
              items: presetItems,
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

import { AddTable, ModifyTable } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { createKey, setCreateProperty, setUpdateProperty } from "@/utils/commonUtils";
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
export default class RuleSetConfiguratorPresetEditor extends Vue {
  @Prop({ type: String }) public rulePoint?: string;
  @Prop({ type: String }) public presetID?: string;
  @Prop({ type: Boolean }) public isShowEditPopup?: boolean;
  @Prop({ type: Boolean }) public isAddRow?: boolean;

  public tableName = "CFG_PRESET_MASTER";
  public formKey: any = {};
  public formData: any = {};

  public presetItems: string[] = [];

  public loadingVisible = false;

  constructor() {
    super();
  }

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public get moduleList() {
    return (this.$refs.moduleList as any)?.instance;
  }

  public setFormData() {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      const presetDatas = (await loadTableDatas(this.tableName)).filter(
        (item: any) => item.RULE_POINT === this.rulePoint,
      );
      this.presetItems = presetDatas ? presetDatas.map((item: any) => item.RULESET_ID) : [];

      if (this.presetItems.length > 0) {
        this.presetItems.unshift("");
      }

      this.formKey = { RULE_POINT: this.rulePoint, PRESET_ID: this.presetID };
      this.formData = {
        RULE_POINT: this.rulePoint,
        PRESET_ID: this.isAddRow ? "" : this.presetID,
        SORT_TYPE: "WeightSorted",
      };

      if (this.presetID && !this.isAddRow) {
        this.formData.PRESET_ID = this.presetID;
        const presetItem = presetDatas.find((item: any) => item.PRESET_ID == this.presetID);
        if (presetItem) {
          this.formData.PRESET_ID = presetItem.PRESET_ID;
          this.formData.SORT_TYPE = presetItem.SORT_TYPE;
          this.formData.DESCRIPTION = presetItem.DESCRIPTION;
        }
      }

      this.loadingVisible = false;
      resolve(this.dataForm.repaint());
    });
  }

  public onHiding({ result }: any = null) {
    this.$emit("close", { flag: false, result: result });
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = createKey(this.formData.RULE_POINT, this.formData.PRESET_ID);

    return new Promise(resolve => {
      if (!this.isAddRow) resolve(true);
      const result = !validationDatas.some(
        (item: any) => createKey(item.RULE_POINT, item.PRESET_ID).toLowerCase() == currentKey.toLowerCase(),
      );
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
      const valid = ValidationEngine.validateGroup("validationPreset");
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
