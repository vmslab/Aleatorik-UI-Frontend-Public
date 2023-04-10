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
        <label>{{ $t("PLAN VERSION") }}</label>
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
        <label>{{ $t("SUMMARY") }}</label>
        <DxRadioGroup
          :value="selectedSummaryType"
          :data-source="[
            { label: 'Month', value: 'MONTH' },
            { label: 'Week', value: 'WEEK' },
          ]"
          display-expr="label"
          value-expr="value"
          layout="horizontal"
          @value-changed="onTypeChange"
        />
      </div>
      <div slot="filter">
        <label>{{ $t("IS RTF TARGET") }}</label>
        <DxSelectBox
          :value="selectedIsRtfTarget"
          :data-source="[
            { label: '전체', value: '' },
            { label: 'Y', value: 'Y' },
            { label: 'N', value: 'N' },
          ]"
          display-expr="label"
          value-expr="value"
          @value-changed="onTargetChange"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <SplitBox
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :minHeight="400"
        :boxes="[
          { type: 'rate', size: 3, minHeight: 300 },
          { type: 'rate', size: 1, minHeight: 100 },
        ]"
        resizable
      >
        <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
          <SplitBox
            :width="parentsWidth"
            :height="parentsHeight"
            :minWidth="300"
            :boxes="[
              { type: 'rate', size: 1, minWidth: 100 },
              { type: 'rate', size: 2, minWidth: 200 },
            ]"
            resizable
            :horizontal="true"
          >
            <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
              <RTFReportSummary
                :parentsWidth="parentsWidth"
                :parentsHeight="parentsHeight"
                :selectedPlanID="selectedPlanID"
                :selectedIsRtfTarget="selectedIsRtfTarget"
                :selectedSummaryType="selectedSummaryType"
                :trigger="refreshKey"
                @click="onSummaryGridClick"
              />
            </template>
            <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
              <RTFReportMain
                :parentsWidth="parentsWidth"
                :parentsHeight="parentsHeight"
                :selectedPlanID="selectedPlanID"
                :selectedIsRtfTarget="selectedIsRtfTarget"
                :selectedSummaryType="selectedSummaryType"
                :selectedMonth="month"
                :selectedWeek="week"
                @click="onMainGridClick"
              />
            </template>
          </SplitBox>
        </template>
        <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
          <RTFReportDetail
            :parentsWidth="parentsWidth"
            :parentsHeight="parentsHeight"
            :selectedPlanID="selectedPlanID"
            :selectedSOID="selectedSOID"
          />
        </template>
      </SplitBox>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { SplitBox } from "mozart-component-wijmo";
import DxButton from "devextreme-vue/button";

import DxDateBox from "devextreme-vue/date-box";
import { DxTagBox } from "devextreme-vue/tag-box";
import DxRadioGroup from "devextreme-vue/radio-group";
import DxSelectBox from "devextreme-vue/select-box";

import RTFReportSummary from "@/views/AOR1000201S.vue";
import RTFReportMain from "@/views/AOR1000202S.vue";
import RTFReportDetail from "@/views/AOR1000203S.vue";

import DropDownGrid from "@/components/DropDownGrid.vue";

import { getVersionNo, setVersionNo, getVersionDatas } from "@/utils/commonUtils";

@Component({
  components: {
    DxButton,
    DxDateBox,
    DxTagBox,
    DxRadioGroup,
    DxSelectBox,
    SplitBox,
    RTFReportSummary,
    RTFReportMain,
    RTFReportDetail,
    DropDownGrid,
  },
})
export default class RTFReport extends Vue {
  public filter: boolean = true;

  public planVersionItems: any[] = [];
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
  public selectedSummaryType: string = "MONTH";
  public selectedIsRtfTarget: string = "";

  public selectedDate: string = "";

  public selectedSOID: string = "";
  // public startTime: Date = new Date();
  // public endTime: Date = new Date();
  public refreshKey: number = 0;

  public summaryType: string = "";
  public month: string = "";
  public week: string = "";

  public comboBoxWidth: number = 200;

  constructor() {
    super();
  }

  public async mounted() {
    this.planVersionItems = await getVersionDatas(["DONE"]);

    let planVersion = "";
    const version = getVersionNo();
    const urlParams = new URLSearchParams(window.location.search);
    const queryVersion = urlParams.get("v");
    if (queryVersion) {
      planVersion = queryVersion;
    } else {
      planVersion =
        version && this.planVersionItems.some((item: any) => item.PLAN_ID === version)
          ? version
          : this.planVersionItems[0].PLAN_ID;
    }

    setVersionNo(planVersion);
    this.setVersionControls(planVersion);

    let timeUnit = urlParams.get("u")?.toUpperCase() || "MONTH";
    timeUnit = ["MONTH", "WEEK"].includes(timeUnit) ? timeUnit : "MONTH";
    const timeKey = urlParams.get("t") || "";

    this.$nextTick(() => {
      this.onRefreshData(timeUnit, timeKey);
    });
  }

  public onTypeChange(e: any) {
    this.selectedSummaryType = e.value;

    this.onRefreshData();
  }

  public onTargetChange(e: any) {
    this.selectedIsRtfTarget = e.value;

    this.onRefreshData();
  }

  public onRefreshData(summaryType: string = "", timeKey: string = "") {
    this.refreshKey++;
    this.selectedSOID = "";
    this.summaryType = summaryType;
    this.month = summaryType === "MONTH" ? timeKey : "";
    this.week = summaryType === "WEEK" ? timeKey : "";
  }

  public onSummaryGridClick({ month, week }: any) {
    this.month = month;
    this.week = week;
  }

  public onMainGridClick(soID: string) {
    this.selectedSOID = soID;
  }

  public setVersionControls(version: string) {
    this.selectedPlanID = version;
  }

  public async onVersionChanged(e: any) {
    setVersionNo(e.PLAN_ID);
    this.setVersionControls(e.PLAN_ID);

    this.onRefreshData();
  }
}
</script>
