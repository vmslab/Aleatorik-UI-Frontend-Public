<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="Module Editor"
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
          validation-group="validationModule"
          :show-colon-after-label="false"
        >
          <DxItem
            data-field="SCENARIO_ID"
            :editor-options="{
              disabled: true,
            }"
          />
          <DxItem
            data-field="MODULE_KEY"
            :editor-options="{
              disabled: !isAddRow,
            }"
          >
            <DxRequiredRule message="MODULE_KEY is required" />
            <DxAsyncRule :validation-callback="validationKey" message="This Key is already registered" />
          </DxItem>
          <DxItem
            data-field="MODULE_TYPE"
            editor-type="dxSelectBox"
            :editor-options="{
              items: ['PBB', 'PBO', 'PBF'],
            }"
          >
            <DxRequiredRule message="MODULE_TYPE is required" />
          </DxItem>
          <DxItem
            data-field="STAGE_ID"
            editor-type="dxSelectBox"
            :editor-options="{
              items: stageItems,
            }"
          >
            <DxRequiredRule message="STAGE_ID is required" />
          </DxItem>
          <DxItem
            data-field="REF_MODULE_KEY"
            editor-type="dxSelectBox"
            :editor-options="{
              items: moduleItems,
            }"
          />
          <DxItem
            data-field="PHASE_COUNT"
            editor-type="dxNumberBox"
            :editor-options="{
              showSpinButtons: true,
              format: ',##0.#########',
            }"
          >
            <DxRequiredRule message="PHASE_COUNT is required" />
            <!-- <DxPatternRule pattern="`^[0-9]+$" message="PHASE_COUNT must be at integer" /> -->
            <DxRangeRule :min="1" message="PHASE_COUNT be at least 1" />
            <DxRangeRule :max="10" message="PHASE_COUNT be at most 10" />
          </DxItem>
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

import { AddTable, ModifyTable, RemoveTable } from "@/api/mainService";
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
export default class ScenarioConfiguratorModuleEditor extends Vue {
  @Prop({ type: String }) public scenarioID?: string;
  @Prop({ type: String }) public modulekey?: string;
  @Prop({ type: Boolean }) public isShowEditPopup?: boolean;
  @Prop({ type: Boolean }) public isAddRow?: boolean;

  public tableName = "CFG_EXECUTION_PLAN";
  public optionTableName = "CFG_EXECUTION_OPTION_CONFIG";
  public formKey: any = {};
  public formData: any = {};

  public stageItems: string[] = [];
  public moduleItems: string[] = [];

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
      const stageDatas = await loadTableDatas("CFG_STAGE");
      this.stageItems = stageDatas ? stageDatas.map((item: any) => item.STAGE_ID) : [];
      const moduleDatas = (await loadTableDatas("CFG_EXECUTION_PLAN")).filter(
        (item: any) => item.SCENARIO_ID === this.scenarioID,
      );
      this.moduleItems = moduleDatas ? moduleDatas.map((item: any) => item.MODULE_KEY) : [];

      let moduleSeq = 1;
      if (moduleDatas.length > 0) {
        this.moduleItems.unshift("");
        moduleSeq = Math.max(...moduleDatas.map((item: any) => item.SEQUENCE)) + 1;
      }

      this.formKey = { SCENARIO_ID: this.scenarioID, MODULE_KEY: this.modulekey };
      this.formData = { SCENARIO_ID: this.scenarioID, SEQUENCE: moduleSeq };
      if (this.modulekey) {
        this.formData.MODULE_KEY = this.modulekey;
        const moduleItem = moduleDatas.find(
          (item: any) => item.SCENARIO_ID == this.scenarioID && item.MODULE_KEY == this.modulekey,
        );
        if (moduleItem) {
          this.formData.MODULE_TYPE = moduleItem.MODULE_TYPE;
          this.formData.STAGE_ID = moduleItem.STAGE_ID;
          this.formData.REF_MODULE_KEY = moduleItem.REF_MODULE_KEY;
          this.formData.PHASE_COUNT = moduleItem.PHASE_COUNT;
          this.formData.SEQUENCE = moduleItem.SEQUENCE;
        }
      }

      this.loadingVisible = false;
      resolve(this.dataForm.repaint());
    });
  }

  public onHiding({ itemKey }: any = null) {
    this.$emit("close", { flag: false, itemKey });
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = this.formData.MODULE_KEY;

    return new Promise(resolve => {
      if (!this.isAddRow) resolve(true);
      const result = !validationDatas
        .filter((item: any) => item.SCENARIO_ID == this.formData.SCENARIO_ID)
        .some((item: any) => item.MODULE_KEY.toLowerCase() == currentKey.toLowerCase());
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

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(tableName, key);
    return JSON.parse(result.data);
  }

  public async onSaveData() {
    this.loadingVisible = true;
    try {
      const valid = ValidationEngine.validateGroup("validationModule");
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
        } else {
          result = await this.deleteFunc(this.optionTableName, [
            {
              SCENARIO_ID: this.formKey.SCENARIO_ID,
              MODULE_KEY: this.formKey.MODULE_KEY,
              PHASE: { ">": this.formData.PHASE_COUNT },
            },
          ]);
        }
      }

      if (result) {
        this.onHiding({ itemKey: this.formKey.MODULE_KEY || this.formData.MODULE_KEY });
        return;
      }

      MainModule.showSnackBar({ message: `${this.$t(`ErrorMessage`)}`, type: "error" });
    } finally {
      this.loadingVisible = false;
    }
  }
}
</script>
