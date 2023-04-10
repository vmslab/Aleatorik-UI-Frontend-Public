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
      <RTFReportMain
        :selectedModuleKey="selectedModuleKey"
        :startTime="startTime"
        :endTime="endTime"
        :key="timeStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import DxButton from "devextreme-vue/button";

import DxDateBox from "devextreme-vue/date-box";
import DxSelectBox from "devextreme-vue/select-box";

import RTFReportMain from "@/views/RTFReportMain.vue";

import { loadCondition, saveCondition, removeCondition } from "@/utils/commonUtils";

@Component({
  components: {
    DxButton,
    DxDateBox,
    DxSelectBox,
    RTFReportMain,
  },
})
export default class RTFReport extends Vue {
  public filter: boolean = true;

  public moduleKeyItems: string[] = ["Module02", "Module01"];
  public versionDatas: Array<object> = [];

  public selectedModuleKey: string = "";
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
    this.selectedModuleKey = this.moduleKeyItems[0];

    this.onLoadCondition();
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
