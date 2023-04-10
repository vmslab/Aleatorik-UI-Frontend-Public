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
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Search')"
        @click="onRefreshData"
      />
      <div slot="filter">
        <label>PLAN_VERSION</label>
        <DropDownGrid
          :comboBoxWidth="220"
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
        />
      </div>
      <div slot="filter">
        <label>RESOURCE_GROUP_ID</label>
        <DxTagBox
          :width="comboBoxWidth"
          :value="selectedResourceGrp"
          :items="resourceGrpItems"
          :show-clear-button="true"
          :show-selection-controls="true"
          @value-changed="onResourceGrpChanged"
        />
      </div>
      <div slot="filter">
        <label>START_TIME</label>
        <DxDateBox
          :value="startTime"
          :use-mask-behavior="true"
          type="date"
          displayFormat="yyyy-MM-dd"
          @value-changed="onStartTimeChanged"
        />
      </div>
      <div slot="filter">
        <label>END_TIME</label>
        <DxDateBox
          :value="endTime"
          :use-mask-behavior="true"
          type="date"
          displayFormat="yyyy-MM-dd"
          @value-changed="onEndTimeChanged"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <ResourceLoadReportMain
        :selectedPlanID="selectedPlanID"
        :selectedModuleKey="selectedModuleKey"
        :selectedResourceGrp="selectedResourceGrp"
        :startTime="startTime"
        :endTime="endTime"
        :key="refreshKey"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GetResourceGroupAll } from "@/api/mainService";
import DxButton from "devextreme-vue/button";

import DxDateBox from "devextreme-vue/date-box";
import DxTagBox from "devextreme-vue/tag-box";

import ResourceLoadReportMain from "@/views/ResourceLoadReportMain.vue";

import {
  loadCondition,
  saveCondition,
  removeCondition,
  getVersionNo,
  setVersionNo,
  getVersionDatas,
} from "@/utils/commonUtils";
import DropDownGrid from "@/components/DropDownGrid.vue";
import "@/utils/dateUtils";

@Component({
  components: {
    DxButton,
    DxDateBox,
    DxTagBox,
    ResourceLoadReportMain,
    DropDownGrid,
  },
})
export default class ResourceLoadReport extends Vue {
  public filter: boolean = true;

  public planVersionItems: any[] = [];
  public moduleKeyItems: string[] = [];
  public resourceGrpItems: string[] = [];
  public resourceGrpDatas: Record<string, any> | null = null;
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];

  public selectedPlanID: string = "";
  public selectedModuleKey: string = "";
  public selectedResourceGrp: string[] = [];
  public startTime: Date = new Date();
  public endTime: Date = new Date();
  public refreshKey: number = 0;

  public siteID: string = "";
  public resourceID: string = "";
  public planDate: string = "";
  public detailKey: string = "";

  public comboBoxWidth: number = 200;

  constructor() {
    super();
  }

  public async mounted() {
    this.planVersionItems = await getVersionDatas(["DONE"]);

    const version = getVersionNo();
    const planVersion =
      version && this.planVersionItems.some((item: any) => item.PLAN_ID === version)
        ? version
        : this.planVersionItems[0].PLAN_ID;

    await this.setVersionControls(planVersion);
    await this.onLoadCondition();

    this.$nextTick(() => {
      this.onRefreshData();
    });
  }

  public onRefreshData() {
    this.refreshKey++;
  }

  public async onLoadCondition() {
    try {
      const condition = (await loadCondition()) as any;

      this.startTime = condition.startTime || this.startTime;
      this.endTime = condition.endTime || this.endTime;
      this.selectedModuleKey = condition.moduleKey || this.selectedModuleKey;
      this.selectedResourceGrp = condition.resourceGrp || this.selectedResourceGrp;
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onSaveCondition() {
    try {
      const condition = {
        startTime: this.startTime,
        endTime: this.endTime,
        moduleKey: this.selectedModuleKey,
        resourceGrp: this.selectedResourceGrp,
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

  public async setVersionControls(version: string) {
    this.selectedPlanID = version;

    // let moduleKeyItems: string[] = [];
    let resourceGrpItems: string[] = [];

    // moduleKeyItems = filterVersionDatas["moduleKeys"] || [];

    if (!this.resourceGrpDatas) {
      const resGrpResult = await GetResourceGroupAll();
      this.resourceGrpDatas = JSON.parse(resGrpResult.data);
    }

    if (!this.resourceGrpDatas) return;

    for await (const i of Object.keys(this.resourceGrpDatas)) {
      let item = this.resourceGrpDatas[i] as any;
      if (version !== "ALL" && item.PLAN_VERSION !== version) continue;

      if (resourceGrpItems.includes(item.RESOURCE_GROUP_ID) == false) resourceGrpItems.push(item.RESOURCE_GROUP_ID);
    }
    // Object.keys(this.resourceGrpDatas).forEach(i => {
    //   let item = this.resourceGrpDatas[i] as any;
    //   if (version !== "ALL" && item.PLAN_VERSION !== version) return;

    //   if (resourceGrpItems.includes(item.RESOURCE_GROUP_ID) == false)
    //     resourceGrpItems.push(item.RESOURCE_GROUP_ID);
    // });

    // this.moduleKeyItems = moduleKeyItems;
    this.resourceGrpItems = resourceGrpItems;

    // this.selectedModuleKey = moduleKeyItems[0];
    this.selectedResourceGrp = resourceGrpItems;

    const filterVersionDatas = this.planVersionItems.find((item: any) => item.PLAN_ID == version);
    if (filterVersionDatas) {
      this.startTime = new Date(filterVersionDatas.PLAN_START_TIME);
      this.endTime = this.startTime.addDays(filterVersionDatas.PLAN_PERIOD - 1);
    }
  }

  public async onVersionChanged(e: any) {
    setVersionNo(e.PLAN_ID);
    await this.setVersionControls(e.PLAN_ID);
  }

  public onModuleChanged(e: any) {
    this.selectedModuleKey = e.value;
  }

  public onResourceGrpChanged(e: any) {
    this.selectedResourceGrp = e.value;
  }
  public onStartTimeChanged(e: any) {
    this.startTime = e.value;
  }

  public onEndTimeChanged(e: any) {
    this.endTime = e.value;
  }
}
</script>
