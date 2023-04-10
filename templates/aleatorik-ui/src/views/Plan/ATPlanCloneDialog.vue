<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="visible"
      :show-title="true"
      width="600"
      height="auto"
      title="Plan Clone"
      @hidden="handleClose"
    >
      <div class="moz-area-padding">
        <DxForm class="moz-form" ref="dxForm" :form-key="formKey" :form-data="formData" :show-colon-after-label="false">
          <DxItem data-field="PLAN_ID" :label="{ text: $t(`PLAN_ID`) }">
            <DxRequiredRule message="PLAN_ID is required" />
            <DxAsyncRule :validation-callback="validationPlanID" message="PLAN_ID is already registered" />
          </DxItem>
          <DxItem
            data-field="SOURCE_ID"
            :label="{ text: $t(`SOURCE_ID`) }"
            editor-type="dxSelectBox"
            :editor-options="{
              searchEnabled: true,
              dataSource: planVersionItems,
              searchMode: 'contains',
              searchExpr: 'PLAN_VERSION',
              displayExpr: 'PLAN_VERSION',
              valueExpr: 'PLAN_VERSION',
              onValueChanged: onValueChanged,
            }"
          >
            <DxRequiredRule message="SOURCE_ID is required" />
          </DxItem>
          <DxItem
            data-field="PLAN_TYPE"
            :label="{ text: $t(`PLAN_TYPE`) }"
            editor-type="dxSelectBox"
            :editor-options="{
              items: [`Auto`, `Manual`],
            }"
          >
            <DxRequiredRule message="PLAN_TYPE is required" />
          </DxItem>
          <DxItem data-field="DESCRIPTION" />
          <DxItem
            data-field="PLAN_START_TIME"
            editor-type="dxDateBox"
            :editor-options="{
              displayFormat: 'yyyy-MM-dd',
              useMaskBehavior: true,
            }"
          >
            <DxRequiredRule message="PLAN_START_TIME is required" />
          </DxItem>
          <DxItem
            data-field="PLAN_PERIOD"
            editor-type="dxNumberBox"
            :editor-options="{
              showSpinButtons: true,
              format: ',##0.#########',
            }"
          >
            <DxRequiredRule message="PLAN_PERIOD is required" />
            <DxRangeRule min="1" message="PLAN_PERIOD must be at least 1" />
          </DxItem>
          <DxItem
            data-field="SCENARIO_ID"
            :label="{ text: $t(`SCENARIO_ID`) }"
            editor-type="dxSelectBox"
            :editor-options="{
              items: scenarioIDs,
            }"
          >
            <DxRequiredRule message="SCENARIO_ID is required" />
          </DxItem>
        </DxForm>
      </div>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t('Clone'),
          stylingMode: 'outlined',
          class: 'moz-button',
          onClick: onClone,
        }"
      >
      </DxToolbarItem>
    </DxPopup>
    <DxLoadPanel
      :visible="onWorking"
      :show-indicator="true"
      :show-pane="true"
      :shading="false"
      :close-on-outside-click="false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxForm, DxItem, DxRequiredRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { Get, ClonePlan } from "@/api/mainService";
import { getVersionDatas, setCreateProperty, setUpdateProperty, setVersionNo } from "@/utils/commonUtils";

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxForm,
    DxItem,
    DxRequiredRule,
    DxRangeRule,
    DxAsyncRule,
    DxLoadPanel,
  },
})
export default class ATPlanCloneDialog extends Vue {
  @Prop({ type: Boolean, required: true }) public visible?: boolean;
  @Prop({ type: String, required: false }) public version?: boolean;

  public formKey: any = {};
  public formData: any = {};

  public planVersionItems: any[] = [];
  public scenarioIDs: string[] = [];
  public onWorking = false;

  public get dxForm() {
    return (this.$refs.dxForm as any).instance;
  }

  public onValueChanged({ value }: any) {
    this.onWorking = true;

    try {
      const sourceItem = this.planVersionItems.find((item: any) => item.PLAN_ID == value);

      this.formData["PLAN_TYPE"] = sourceItem.PLAN_TYPE;
      this.formData["SCENARIO_ID"] = sourceItem.SCENARIO_ID;
      this.formData["PLAN_PERIOD"] = sourceItem.PLAN_PERIOD;
      this.formData["PLAN_START_TIME"] = sourceItem.PLAN_START_TIME;
      this.formData["DESCRIPTION"] = `Source ID : ${value}`;

      let initPlanID = value + "-R";
      let planID = `${initPlanID}01`;
      let i = 2;

      while (this.planVersionItems.some((item: any) => item.PLAN_ID === planID)) {
        const postFix = i < 10 ? "0" + i : i;
        planID = `${initPlanID}${postFix}`;
        i++;
      }

      this.formData["PLAN_ID"] = planID;
      this.dxForm.repaint();
    } finally {
      this.onWorking = false;
    }
  }

  public async mounted() {
    if (!this.version) return;

    this.onWorking = true;
    this.planVersionItems = await getVersionDatas(null);
    const result = await Get("Scenario");
    const scenarioItems = JSON.parse(result.data);
    this.scenarioIDs = scenarioItems.map((scenario: any) => scenario.SCENARIO_ID);

    const versionItem = this.planVersionItems.find((item: any) => item.PLAN_ID == this.version);
    const sourceID = versionItem.SOURCE_ID || this.version;

    this.formData["SOURCE_ID"] = sourceID;
    this.onValueChanged({ value: sourceID });

    this.onWorking = false;
  }

  public async validationPlanID({ value }: any) {
    const versionDatas = await getVersionDatas();

    return new Promise(resolve => {
      const result = !versionDatas.some((item: any) => item.PLAN_ID.toLowerCase() == value.toLowerCase());
      resolve(result);
    });
  }

  public async onClone() {
    this.onWorking = true;

    let values = this.formData;
    setCreateProperty(values);
    setUpdateProperty(values);
    const result = await ClonePlan(values);

    this.onWorking = false;

    setVersionNo(this.formData.PLAN_ID);
    this.$emit("complete", false);
  }

  public handleClose() {
    this.$emit("close", false);
  }
}
</script>
