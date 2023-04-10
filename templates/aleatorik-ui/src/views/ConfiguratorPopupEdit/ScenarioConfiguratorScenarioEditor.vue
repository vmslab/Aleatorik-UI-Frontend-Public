<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="isShowEditPopup"
      :show-title="true"
      title="Scenario Editor"
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
          validation-group="validationScenario"
          :show-colon-after-label="false"
        >
          <DxItem
            data-field="SCENARIO_ID"
            :editor-options="{
              disabled: !isAddRow,
            }"
          >
            <DxRequiredRule message="SCENARIO_ID is required" />
            <DxAsyncRule :validation-callback="validationKey" message="This Key is already registered" />
          </DxItem>
          <DxItem data-field="DESCRIPTION" />
          <DxItem
            data-field="REF_SCENARIO_ID"
            editor-type="dxSelectBox"
            :editor-options="{
              disabled: !isAddRow,
              items: scenarioItems,
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

import { AddTable, ModifyTable, CloneScenarioReference } from "@/api/mainService";
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
export default class ScenarioConfiguratorScenarioEditor extends Vue {
  @Prop({ type: Boolean }) public isShowEditPopup?: boolean;
  @Prop({ type: Boolean }) public isAddRow?: boolean;

  public tableName = "CFG_SCENARIO_MASTER";
  public formKey: any = {};
  public formData: any = {};

  public scenarioItems: string[] = [];

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

  public setFormData(isAddRow: boolean = true, scenarioID?: string) {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      const scenarioDatas = await loadTableDatas("CFG_SCENARIO_MASTER");

      this.scenarioItems = scenarioDatas.map((item: any) => item.SCENARIO_ID);
      this.scenarioItems.unshift("");

      this.formKey = { SCENARIO_ID: scenarioID };
      this.formData = {};
      if (scenarioID) {
        if (isAddRow) {
          this.formData.SCENARIO_ID = scenarioID + "_COPY";
          this.formData.REF_SCENARIO_ID = scenarioID;
        } else {
          this.formData.SCENARIO_ID = scenarioID;
          const scenarioItem = scenarioDatas.find((item: any) => item.SCENARIO_ID == scenarioID);
          if (scenarioItem) {
            this.formData.DESCRIPTION = scenarioItem.DESCRIPTION;
          }
        }
      }

      this.loadingVisible = false;
      resolve(this.dataForm.repaint());
    });
  }

  public onHiding({ result }: any = null) {
    this.$emit("close", {
      flag: false,
      result: result,
      scenarioID: this.formData.SCENARIO_ID,
    });
  }

  public async validationKey({ value }: any) {
    const validationDatas = await loadTableDatas(this.tableName);
    const currentKey = this.formData.SCENARIO_ID;

    return new Promise(resolve => {
      if (!this.isAddRow) {
        resolve(true);
        return;
      }
      const result = !validationDatas.some((item: any) => item.SCENARIO_ID.toLowerCase() == currentKey.toLowerCase());
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

    const result = await CloneScenarioReference(keys, values);
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
      const valid = ValidationEngine.validateGroup("validationScenario");
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
        if (this.formData.REF_SCENARIO_ID) {
          result = await this.cloneFunc(this.formData);
        } else {
          delete this.formData.REF_SCENARIO_ID;
          result = await this.insertFunc(this.tableName, this.formData);
        }
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      } else {
        delete this.formData.REF_SCENARIO_ID;
        result = await this.updateFunc(this.tableName, this.formKey, this.formData);
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      }

      if (result) {
        console.log(result);
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
