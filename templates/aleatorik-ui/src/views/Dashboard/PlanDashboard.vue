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
      <div slot="filter" class="perfomance-report-button">
        <DxButton
          v-tooltip="{ text: $t('Show Performance Report') }"
          class="moz-default-button"
          icon="chart"
          type="default"
          :focusStateEnabled="false"
          :text="$t('Show Performance Report')"
          @click="showPerformaceReport"
        />
      </div>
      <div slot="filter" v-show="selectedSourceID?.length > 0">
        <DxButton
          v-tooltip="{ text: $t('Open Compare RTF Report') }"
          class="moz-default-button"
          icon="link"
          type="default"
          :focusStateEnabled="false"
          :text="$t('Open Compare RTF Report')"
          @click="showRTFCompareView"
        />
      </div>
    </moz-controller>
    <DxTabs
      class="moz-layout-tabs"
      width="var(--size-content-width)"
      :data-source="tabItems"
      :selected-index="tabIndex"
      @selectionChanged="onSelectionChanged"
    >
      <template #item="{ data }">
        <div class="flex-center nowrap-text">
          <div>{{ data.text }}</div>
          <div v-if="data.state === 3" class="aleatorik-error-state"></div>
          <div v-else-if="data.state === 2" class="aleatorik-warning-state"></div>
          <div v-else-if="data.state === 1" class="aleatorik-success-state"></div>
          <div v-else></div>
        </div>
      </template>
    </DxTabs>
    <div class="moz-frame-for-outer-control-tab">
      <KPIReport v-show="tabIndex === 0" :key="`K${selectedPlanID}`" :selectedPlanID="selectedPlanID" />
      <ErrorReport
        v-show="tabIndex === 1"
        :key="`E${selectedPlanID}`"
        :selectedPlanID="selectedPlanID"
        @set-state="onSetErrorState"
      />
      <ShortReport v-show="tabIndex === 2" :key="`S${selectedPlanID}`" :selectedPlanID="selectedPlanID" />
      <!-- <KPIReport
        v-show="tabIndex === 0"
        :key="`K${selectedPlanIDKPI}`"
        :selectedPlanID="selectedPlanIDKPI"
      />
      <ErrorReport
        v-show="tabIndex === 1"
        :key="`E${selectedPlanIDErr}`"
        :selectedPlanID="selectedPlanIDErr"
        @set-state="onSetErrorState"
      />
      <ShortReport
        v-show="tabIndex === 2"
        :key="`S${selectedPlanIDShort}`"
        :selectedPlanID="selectedPlanIDShort"
      /> -->
      <BottomDrawer title="Performance Report" v-model="detail" :closeOnOutsideClick="true">
        <template slot-scope="{ contentsHeight }">
          <PerformanceReport
            :parentsHeight="contentsHeight"
            :key="`P${selectedPlanIDPerform}`"
            :selectedPlanID="selectedPlanIDPerform"
          />
        </template>
      </BottomDrawer>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { EventBus } from "mozart-common";

import { DxButton } from "devextreme-vue/button";
import DropDownGrid from "@/components/DropDownGrid.vue";
import { DxTabs } from "devextreme-vue/tabs";

import { getVersionNo, setVersionNo, getVersionDatas } from "@/utils/commonUtils";

import KPIReport from "@/views/Dashboard/KPIReport.vue";
import ErrorReport from "@/views/Dashboard/ErrorReport.vue";
import ShortReport from "@/views/Dashboard/ShortReport.vue";
import PerformanceReport from "@/views/Dashboard/PerformanceReport.vue";
import BottomDrawer from "@/components/BottomDrawer.vue";

@Component({
  components: {
    DxButton,
    DxTabs,
    KPIReport,
    ErrorReport,
    ShortReport,
    PerformanceReport,
    BottomDrawer,
    DropDownGrid,
  },
})
export default class PlanDashboard extends Vue {
  public filter: boolean = true;
  public detail: boolean = false;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];

  public tabItems = [
    {
      text: "KPI Report",
    },
    {
      text: "Error Report",
      state: 0,
    },
    {
      text: "Short Report",
    },
  ];
  public tabIndex = 0;

  public selectedPlanID: string = "";
  public selectedSourceID: string = "";
  public selectedPlanIDKPI: string = "";
  public selectedPlanIDErr: string = "";
  public selectedPlanIDShort: string = "";
  public selectedPlanIDPerform: string = "";

  public comboBoxWidth: number = 200;

  constructor() {
    super();
  }

  public async mounted() {
    this.planVersionItems = await getVersionDatas(["DONE"]);

    let version = getVersionNo() || null;
    if (!version) version = this.planVersionItems[0]?.PLAN_ID;

    this.setVersionControls(version);
  }

  // public setTabVersion(planVersion: string) {
  //   switch (this.tabIndex) {
  //     case 0:
  //       this.selectedPlanIDKPI = planVersion;
  //       break;
  //     case 1:
  //       this.selectedPlanIDErr = planVersion;
  //       break;
  //     case 2:
  //       this.selectedPlanIDShort = planVersion;
  //   }
  // }

  public onSelectionChanged(event: { addedItems: any[]; removedItems: any[] }) {
    if (event.addedItems.length === 0) return;
    this.tabIndex = this.tabItems.indexOf(event.addedItems[0]);

    // this.setTabVersion(this.selectedPlanID);
  }

  public setVersionControls(version: string | null) {
    if (!version) return;
    this.selectedSourceID = "";

    const versionItem = this.planVersionItems.find((item: any) => item.PLAN_ID === version);
    if (versionItem.SOURCE_ID && ["Revision", "MultiRun"].includes(versionItem.EXECUTION_TYPE))
      this.selectedSourceID = versionItem.SOURCE_ID;

    this.selectedPlanID = version;
    // this.setTabVersion(this.selectedPlanID);
  }

  public onVersionChanged(e: any) {
    // this.tabIndex = 0;
    setVersionNo(e.PLAN_ID);
    this.setVersionControls(e.PLAN_ID);
  }

  public async onRefreshData() {
    this.planVersionItems = await getVersionDatas(["DONE"]);
  }

  public showPerformaceReport() {
    this.selectedPlanIDPerform = this.selectedPlanID;
    this.detail = true;
  }

  public showRTFCompareView() {
    EventBus.fire("open-popup", {
      params: { key: "rtf-compare-by-so", params: `?v=${this.selectedPlanID}` },
    });
  }

  public onSetErrorState(state: number) {
    const fitem = this.tabItems.find(t => t.text === "Error Report");
    if (!fitem) return;
    fitem.state = state;
  }
}
</script>
