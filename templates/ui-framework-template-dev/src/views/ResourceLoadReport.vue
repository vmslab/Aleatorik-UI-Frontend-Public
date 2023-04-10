<template>
  <div>
    <moz-controller :showFilter="filter">
      <DxButton
        v-tooltip="{ text: $t('SaveCondition') }"
        icon="download"
        type="default"
        @click="onSaveCondition"
      ></DxButton>
      <DxButton
        v-tooltip="{ text: $t('ResetCondition') }"
        icon="clearformat"
        type="default"
        @click="onRemoveCondition"
      ></DxButton>
      <DxButton
        v-tooltip="{ text: $t('Filter') }"
        icon="filter"
        type="default"
        :text="$t('Filter')"
        @click="filter = !filter"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :text="$t('Search')"
        @click="onRefreshData"
      ></DxButton>
      <div slot="filter">
        <label>MODULE_KEY</label>
        <DxSelectBox
          :width="comboBoxWidth"
          :value="selectedModuleKey"
          :items="moduleKeyItems"
          @value-changed="onModuleChanged"
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
        :selectedModuleKey="selectedModuleKey"
        :selectedResourceGrp="selectedResourceGrp"
        :startTime="startTime"
        :endTime="endTime"
        :key="timeStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GetResourceGroupAll } from "@/api/mainService";
import DxButton from "devextreme-vue/button";

import DxDateBox from "devextreme-vue/date-box";
import DxSelectBox from "devextreme-vue/select-box";
import DxTagBox from "devextreme-vue/tag-box";

import ResourceLoadReportMain from "@/views/ResourceLoadReportMain.vue";

import { loadCondition, saveCondition, removeCondition } from "@/utils/commonUtils";

@Component({
  components: {
    DxButton,
    DxDateBox,
    DxSelectBox,
    DxTagBox,
    ResourceLoadReportMain,
  },
})
export default class ResourceLoadReport extends Vue {
  public filter: boolean = true;

  public moduleKeyItems: string[] = ["Module02", "Module01"];
  public resourceGrpItems: string[] = [];
  public resourceGrpDatas: Record<string, any> = {};

  public selectedModuleKey: string = "";
  public selectedResourceGrp: string[] = [];
  public startTime: Date = new Date("2022-01-01");
  public endTime: Date = new Date("2022-04-30");
  public timeStamp: string = "";

  public siteID: string = "";
  public resourceID: string = "";
  public planDate: string = "";
  public detailKey: string = "";

  public comboBoxWidth: number = 200;

  constructor() {
    super();
  }

  public async created() {
    const resGrpResult = await GetResourceGroupAll();
    this.resourceGrpDatas = JSON.parse(resGrpResult.data).data;

    for await (const i of Object.keys(this.resourceGrpDatas)) {
      let item = this.resourceGrpDatas[i] as any;

      if (this.resourceGrpItems.includes(item.RESOURCE_GROUP_ID) == false)
        this.resourceGrpItems.push(item.RESOURCE_GROUP_ID);
    }

    this.selectedModuleKey = this.moduleKeyItems[0];
    this.selectedResourceGrp = this.resourceGrpItems;

    this.onLoadCondition();

    this.$nextTick(() => {
      this.onRefreshData();
    });
  }

  public onRefreshData() {
    this.timeStamp = new Date().toTimeString();
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

  public onModuleChanged(e: any) {
    this.selectedModuleKey = e.value;

    this.onRefreshData();
  }

  public onResourceGrpChanged(e: any) {
    this.selectedResourceGrp = e.value;

    this.onRefreshData();
  }

  public onStartTimeChanged(e: any) {
    this.startTime = e.value;

    this.onRefreshData();
  }

  public onEndTimeChanged(e: any) {
    this.endTime = e.value;

    this.onRefreshData();
  }
}
</script>
