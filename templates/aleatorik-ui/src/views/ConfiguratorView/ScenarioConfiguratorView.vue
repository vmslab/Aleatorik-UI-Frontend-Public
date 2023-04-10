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
        v-tooltip="{ text: $t('SaveCondition') }"
        icon="download"
        type="default"
        :focusStateEnabled="false"
        @click="onSaveCondition"
      />
      <DxButton
        v-tooltip="{ text: $t('ResetCondition') }"
        icon="clearformat"
        type="default"
        :focusStateEnabled="false"
        @click="onRemoveCondition"
      />
      <DxButton
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Save')"
        @click="onSaveData"
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
        <label>SCENARIO_ID</label>
        <DropDownBox
          ref="scenarioCombo"
          :width="400"
          :height="300"
          :dataKey="dataKey"
          :items="scenarioItems"
          :dataFields="scenarioFields"
          :selectedValue="selectedScenarioID"
          @value-changed="onScenarioValueChanged"
          :comboBoxWidth="170"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Add') + ' Scenario' }"
          class="moz-default-button"
          icon="add"
          type="default"
          :focusStateEnabled="false"
          @click="addScenario"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Clone') + ' Scenario' }"
          class="moz-default-button"
          icon="copy"
          type="default"
          :focusStateEnabled="false"
          @click="cloneScenario"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Edit') + ' Scenario' }"
          class="moz-default-button"
          icon="edit"
          @click="editScenario"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Delete') + ' Scenario' }"
          class="moz-default-button"
          icon="trash"
          @click="removeScenario"
        />
      </div>
    </moz-controller>
    <ScenarioConfiguratorScenarioEditor
      ref="scenarioEditor"
      :isAddRow="isAddRow"
      :isShowEditPopup="isShowEditPopup"
      @close="onClosePopup"
    />
    <div class="moz-frame-for-outer-control">
      <ScenarioConfiguratorMain
        ref="moduleListBox"
        :key="selectedScenarioID"
        :selectedScenarioID="selectedScenarioID"
      />
    </div>
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
import { Component, Vue } from "vue-property-decorator";
import { showConfirm } from "mozart-component-wijmo";
import { GetTableRemote, RemoveTable } from "@/api/mainService";

import { ActionLoadOptions } from "mozart-component-wijmo";

import { loadCondition, saveCondition, removeCondition } from "@/utils/commonUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import "devextreme-vue/text-area";

import DropDownBox from "@/components/DropDownBox.vue";
import ScenarioConfiguratorMain from "@/views/ConfiguratorView/ScenarioConfiguratorMain.vue";
import ScenarioConfiguratorScenarioEditor from "@/views/ConfiguratorPopupEdit/ScenarioConfiguratorScenarioEditor.vue";

@Component({
  components: {
    DxButton,
    DxLoadPanel,
    DropDownBox,
    ScenarioConfiguratorMain,
    ScenarioConfiguratorScenarioEditor,
  },
})
export default class ScenarioConfiguratorView extends Vue {
  public filter = true;

  public tableName: string = "CFG_SCENARIO_MASTER";
  public planTableName = "CFG_EXECUTION_PLAN";
  public optionTableName = "CFG_EXECUTION_OPTION_CONFIG";
  public dataKey: string = "SCENARIO_ID";

  public scenarioItems: any = [];
  public scenarioFields: any[] = [
    { name: "SCENARIO_ID", type: "string" },
    { name: "DESCRIPTION", type: "string" },
    { name: "CREATE_TIME", type: "datetime" },
  ];

  public selectedScenarioID = "";

  public isShowEditPopup = false;
  public isAddRow = false;
  public loadingVisible = false;

  public tabIndex = 0;

  public customPropertiesLength = 0;

  constructor() {
    super();
  }

  public scenarioCombo() {
    return this.$refs.scenarioCombo as any;
  }

  public scenarioEditor() {
    return this.$refs.scenarioEditor as any;
  }

  public moduleListBox() {
    return this.$refs.moduleListBox as any;
  }

  public async mounted() {
    await this.onLoadCondition();
    await this.scenarioRefresh();
  }

  public async scenarioRefresh() {
    const result = await GetTableRemote(this.tableName, {});
    const data = JSON.parse(result.data);
    this.scenarioItems = data.data;

    if (!this.selectedScenarioID) this.selectedScenarioID = data.data[0][this.dataKey];
  }

  public onScenarioValueChanged(value: any) {
    this.selectedScenarioID = value.SCENARIO_ID;
  }

  public async onRefreshData() {
    await this.scenarioRefresh();
  }

  public onSaveData() {
    this.moduleListBox().onSaveData();
  }

  public onLoadCondition() {
    return new Promise(async resolve => {
      try {
        const condition = (await loadCondition()) as any;

        this.selectedScenarioID = condition.scenarioID || this.selectedScenarioID;
      } catch (e) {
        console.log("err", e);
      }
      resolve(true);
    });
  }

  public async onSaveCondition() {
    try {
      const condition = {
        scenarioID: this.selectedScenarioID,
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

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(tableName, key);
    return JSON.parse(result.data);
  }

  public async addScenario() {
    this.isAddRow = true;

    await this.scenarioEditor().setFormData();

    this.isShowEditPopup = true;
  }

  public async cloneScenario() {
    if (!this.selectedScenarioID) return;
    const scenarioID = this.selectedScenarioID;
    this.isAddRow = true;

    await this.scenarioEditor().setFormData(this.isAddRow, scenarioID);

    this.isShowEditPopup = true;
  }

  public async editScenario() {
    if (!this.selectedScenarioID) return;
    const scenarioID = this.selectedScenarioID;
    this.isAddRow = false;

    await this.scenarioEditor().setFormData(this.isAddRow, scenarioID);

    this.isShowEditPopup = true;
  }

  public async removeScenario() {
    if (!this.selectedScenarioID) return;

    const dialog = await showConfirm({
      message: `${this.$t(`RemoveMessage`, [this.selectedScenarioID])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> '${this.selectedScenarioID}'?`,
    });
    if (!dialog) return;

    const result = await this.deleteFunc(this.tableName, [
      {
        SCENARIO_ID: this.selectedScenarioID,
      },
    ]);

    const planResult = await this.deleteFunc(this.planTableName, [
      {
        SCENARIO_ID: this.selectedScenarioID,
      },
    ]);

    const optionResult = await this.deleteFunc(this.optionTableName, [
      {
        SCENARIO_ID: this.selectedScenarioID,
      },
    ]);

    if (result) {
      console.log(
        `Affected Data(s) : ${result.count}${planResult ? "\nAffected Plan(s) : " + planResult.count : ""}${
          optionResult ? "\nAffected Option(s) : " + optionResult.count : ""
        }`,
      );

      this.selectedScenarioID = "";
      await this.scenarioRefresh();
    }
  }

  public async onClosePopup(e: any) {
    this.isShowEditPopup = e.flag;

    await this.scenarioRefresh();
    // this.loadingVisible = true;
    // const scenarioDatas = await loadTableDatas(this.tableName);
    // this.scenarioItems = scenarioDatas;

    if (e.result) this.selectedScenarioID = e.scenarioID;

    // this.loadingVisible = false;
  }
}
</script>
