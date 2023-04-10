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
        v-tooltip="{ text: $t('SelectVersion') }"
        class="moz-default-button"
        type="default"
        :focusStateEnabled="false"
        :text="$t('SelectVersion')"
        @click="openCompareSelect = true"
        style="display: none"
      />
      <DxButton
        v-tooltip="{ text: $t('DefineKPI') }"
        class="moz-default-button"
        type="default"
        :focusStateEnabled="false"
        :text="$t('DefineKPI')"
        @click="openCompareSetting = true"
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
        <label>BASE PLAN VERSION</label>
        <DxSelectBox
          width="250"
          v-model="basePlanVersionItem"
          :searchEnabled="true"
          displayExpr="PLAN_ID"
          searchExpr="PLAN_ID"
          :items="summarySource"
          @valueChanged="onBaseVersionChanged"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <SplitBox
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :minHeight="450"
        :boxes="[
          { type: 'rate', size: 1, minHeight: 150 },
          { type: 'rate', size: 2, minHeight: 300 },
        ]"
        resizable
      >
        <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
          <WjFlexGrid
            :style="`width: ${parentsWidth}px;height: ${parentsHeight}px;`"
            :itemsSource="summarySource"
            :initialized="onInitialized"
            showSelectedHeaders="All"
            selectionMode="MultiRange"
            keyActionTab="Cycle"
            :allowDelete="true"
            :autoGenerateColumns="false"
            :deferResizing="true"
            :quickAutoSize="true"
            :imeEnabled="true"
            :alternatingRowStep="0"
            :isReadOnly="true"
            :allowPinning="false"
            :loadedRows="onRowPrepared"
            class="moz-conditional-grid"
            :showMarquee="true"
          >
            <WjFlexGridColumn binding="PLAN_ID" header="PLAN ID" />
            <WjFlexGridColumn binding="SOURCE_ID" header="SOURCE ID" />
            <WjFlexGridColumn binding="SCENARIO_ID" header="SCENARIO ID" />
            <WjFlexGridColumn binding="DESCRIPTION" header="DESCRIPTION" />
            <WjFlexGridColumn binding="KPI_TOTAL_SCORE" header="KPI TOTAL SCORE" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- value-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, false) }}
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="RTF_TOTAL" header="RTF TOTAL" format="n2" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- percent-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, true) }}%
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="ONTIME_RTF" header="ONTIME RTF" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- percent-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, true) }}%
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="LATE_RTF" header="LATE RTF" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- percent-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, true) }}%
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="AVG_RESOURCE_UTILIZATION" header="AVG RESOURCE UTILIZATION" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- percent-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, true) }}%
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="TOTAL_SETUP_COUNT" header="TOTAL SETUP COUNT" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- value-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, false) }}
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="TOTAL_WIP_QTY" header="TOTAL WIP QTY" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- value-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, false) }}
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="PEG_RATE" header="PEG RATE" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- percent-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, true) }}%
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="TOTAL_UNPEG_QTY" header="TOTAL UNPEG QTY" align="right">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <!-- value-gap-template -->
                <div>
                  {{ new Intl.NumberFormat().format(cell.row.dataItem[cell.col.binding]) }}
                  <span v-show="isGap(cell)">
                    (
                    <span :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'">
                      <i
                        :class="`mozart-icons ${
                          isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                        }`"
                        :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                      />
                      {{ gapValueFromBase(cell, false) }}
                    </span>
                    )
                  </span>
                </div>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
          </WjFlexGrid>
        </template>
        <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
          <WjFlexGrid
            :style="`width: ${parentsWidth}px;height: ${parentsHeight}px;`"
            :itemsSource="versionDataSource"
            :initialized="onDetailInitialized"
            showSelectedHeaders="All"
            selectionMode="MultiRange"
            keyActionTab="Cycle"
            :allowDelete="true"
            :autoGenerateColumns="false"
            :deferResizing="true"
            :quickAutoSize="true"
            :imeEnabled="true"
            :alternatingRowStep="0"
            :isReadOnly="true"
            :allowPinning="false"
            class="moz-conditional-grid"
            :showMarquee="true"
          >
            <WjFlexGridColumnGroup header="KPI" align="center">
              <WjFlexGridColumnGroup binding="CATEGORY" header="CATEGORY" />
              <WjFlexGridColumnGroup binding="KPI" header="KPI" />
              <WjFlexGridColumnGroup binding="MODULE_KEY" header="MODULE KEY" />
              <WjFlexGridColumnGroup binding="TIME_KEY" header="TIME KEY" />
            </WjFlexGridColumnGroup>
            <WjFlexGridColumnGroup header="PLAN VERSION" align="center">
              <WjFlexGridColumnGroup
                v-for="(col, i) in summarySource"
                :key="`${col.PLAN_ID}${i}`"
                :binding="col.PLAN_ID"
                :header="col.PLAN_ID"
                dataType="Number"
                align="right"
                :cssClass="col.PLAN_ID == basePlanVersionItem.PLAN_ID ? 'accent' : ''"
              />
            </WjFlexGridColumnGroup>
          </WjFlexGrid>
        </template>
      </SplitBox>

      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
      <ATPlanCompareSelectPopup
        width="calc(var(--size-content-inner-width) - 600px)"
        height="calc(var(--size-content-inner-height-outer-controller) - 200px)"
        :visible="openCompareSelect"
        :version="basePlanVersionItem"
        @action="showCompareView"
        @close="closeCompare"
      />
      <ATPlanCompareSettingPopup
        width="500px"
        height="400px"
        :visible="openCompareSetting"
        :kpis="kpis"
        @close="closeSetting"
        @action="updateSetting"
      />
    </div>
  </div>
</template>

<script lang="ts">
import groupBy from "lodash/groupBy";

import { Component, Vue, Watch } from "vue-property-decorator";
import { ExtendGrid, SplitBox } from "mozart-component-wijmo";
import { EventBus } from "mozart-common";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { setVersionNo } from "@/utils/commonUtils";
import { Get, GetTableRemote } from "@/api/mainService";

import DxButton from "devextreme-vue/button";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxForm, DxItem, DxRequiredRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";

import DxDateBox from "devextreme-vue/date-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import DxSelectBox from "devextreme-vue/select-box";

import ATPlanCompareSelectPopup from "@/views/Plan/ATPlanCompareSelectPopup.vue";
import ATPlanCompareSettingPopup from "@/views/Plan/ATPlanCompareSettingPopup.vue";
import {
  WjFlexGrid,
  WjFlexGridColumn,
  WjFlexGridCellTemplate,
  WjFlexGridColumnGroup,
} from "@grapecity/wijmo.vue2.grid";

export interface IKPI {
  enable: boolean;
  id: string;
  caption: string;
  weight: number;
}

@Component({
  components: {
    DxLoadPanel,
    DxButton,
    DxRequiredRule,
    DxRangeRule,
    DxPopup,
    DxForm,
    DxItem,
    DxDateBox,
    DxNumberBox,
    DxSelectBox,
    DxToolbarItem,
    DxAsyncRule,
    SplitBox,
    ATPlanCompareSelectPopup,
    ATPlanCompareSettingPopup,
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
    WjFlexGridColumnGroup,
  },
})
export default class ATPlanCompareView extends Vue {
  public filter: boolean = true;

  public tableName: string = "OUT_PLAN_INDEX";
  public dataKey: string = "PLAN_ID";

  public options: Record<string, any> = {};

  public selectedPlans: string = "";
  public basePlanVersionItem: any = { PLAN_ID: "" };

  public autoExpandAll = false;
  public checkRowFilter = true;
  public checkGroupPanel = false;

  public isLoadedData = false;
  public loadingVisible = false;

  public openCompareSelect = false;
  public openCompareSetting = false;

  public summarySource: any[] = [];

  public versionDataSource: any[] = [];

  public initKpis: IKPI[] = [
    {
      enable: false,
      id: "RTF_TOTAL",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "ONTIME_RTF",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "LATE_RTF",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "AVG_RESOURCE_UTILIZATION",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "TOTAL_SETUP_COUNT",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "TOTAL_WIP_QTY",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "PEG_RATE",
      caption: "",
      weight: 100,
    },
    {
      enable: false,
      id: "TOTAL_UNPEG_QTY",
      caption: "",
      weight: 100,
    },
  ];
  public kpis: IKPI[] = [];

  constructor() {
    super();
  }

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  public detailGrid: any = null;
  public detailExtendGrid: ExtendGrid | null = null;

  public dataSource: any = [];

  public selectedRow: any = [];

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        onInitialized: grid => {
          // clear menu
          // console.log(grid?.contextMenu?.getFlatMenuItem());
          // grid?.contextMenu?.getFlatMenuItem().forEach((menu, i) => {
          //   grid.contextMenu?.removeMenuItem(i);
          // });

          const menus = this.createContextMenu();
          menus.forEach(menu => {
            grid?.contextMenu?.addMenuItem({
              header: menu.header,
              cmd: menu.cmd,
              active: menu.active,
              clicked: menu.handler,
            });
          });
        },
        useAutoColumnFit: true,
        useSelector: false,
        useFilter: false,
        useFooter: false,
      },
    });
  }

  public onDetailInitialized(grid: any) {
    this.detailGrid = grid;
    this.detailExtendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        onInitialized: grid => {
          const menus = this.createDetailContextMenu();
          menus.forEach(menu => {
            grid?.contextMenu?.addMenuItem({
              header: menu.header,
              cmd: menu.cmd,
              active: menu.active,
              clicked: menu.handler,
            });
          });
        },
        useAutoColumnFit: true,
        useSelector: false,
      },
    });
  }

  public createContextMenu() {
    const menus = [];

    menus.push({
      cmd: "show-plan-dashboard",
      header: "Show Plan Dashboard",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "plan-dashboard" },
        });
      },
    });
    menus.push({
      cmd: "show-gantt-chart",
      header: "Show Gantt Chart",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "resource-gantt" },
        });
      },
    });
    menus.push({
      cmd: "show-rtf-report",
      header: "Show RTF Report",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-report" },
        });
      },
    });
    menus.push({
      cmd: "show-compare-rtf-report",
      header: "Show Compare RTF Report",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        return data.SOURCE_ID;
      },
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-compare-by-so", params: `?v=${data.PLAN_ID}` },
        });
      },
    });

    return menus;
  }

  public createDetailContextMenu() {
    const menus = [];

    // 옵션별로 추가여부를 고를 수 없음.
    // if (["CATEGORY", "KPI", "MODULE_KEY", "TIME_KEY", "PLAN_VERSION"].includes(e.column.dataField))
    //   return;

    menus.push({
      cmd: "show-plan-dashboard",
      header: "Show Plan Dashboard",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "plan-dashboard" },
        });
      },
    });
    menus.push({
      cmd: "show-gantt-chart",
      header: "Show Gantt Chart",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "resource-gantt" },
        });
      },
    });
    menus.push({
      cmd: "show-rtf-report",
      header: "Show RTF Report",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-report" },
        });
      },
    });
    menus.push({
      cmd: "show-compare-rtf-report",
      header: "Show Compare RTF Report",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        const versionItem = this.summarySource.find((item: any) => item.PLAN_ID === data.PLAN_ID);

        return versionItem && versionItem.SOURCE_ID;
      },
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;

        const data = grid.rows[hitTest.row].dataItem;
        // setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-compare-by-so", params: `?v=${data.PLAN_ID}` },
        });
      },
    });

    return menus;
  }

  public sum = (curValue: any, newObj: any) => {
    return curValue + newObj.VALUE;
  };

  public numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

  public async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const planIDs = urlParams.get("v");

    if (!planIDs) {
      this.openCompareSelect = true;
      return;
    }

    this.selectedPlans = planIDs;
    const result: any = await new Promise((resolve: any) => {
      const params = {
        resolve,
      };
      EventBus.fire("load-system-setting", { params });
    });
    if (result && result.kpiSetting) {
      this.kpis = result.kpiSetting;
    } else {
      this.kpis = this.initKpis;
    }

    this.loadingVisible = true;
    try {
      await this.setDataSource(planIDs);
    } catch {}
    this.loadingVisible = false;
  }

  public isGap(e: any) {
    return e.row.dataItem[e.col.binding] !== this.basePlanVersionItem[e.col.binding];
  }
  public isGapUpperCase(e: any) {
    return e.row.dataItem[e.col.binding] > this.basePlanVersionItem[e.col.binding];
  }
  public gapValueFromBase(e: any, isPercent: boolean) {
    return `${this.numberFormat.format(
      (e.row.dataItem[e.col.binding] - this.basePlanVersionItem[e.col.binding]) * (isPercent ? 100 : 1),
    )}`;
  }

  public async setDataSource(planIDs: string) {
    this.summarySource = [];
    this.versionDataSource = [];

    try {
      const planResult = await Get(
        "ATPlan",
        {
          option: {
            filter: ["PLAN_ID", "IN", planIDs],
            sort: [{ selector: "PLAN_ID", desc: true }],
          },
        },
        "post",
      );
      const planData = JSON.parse(planResult.data)?.data;

      const planSummaryResult = await GetTableRemote("OUT_PLAN_INDEX", {
        filter: ["PLAN_VERSION", "IN", planIDs],
      });
      const planSummaryDatas = JSON.parse(planSummaryResult.data)?.data;
      const planSummaryMap = groupBy(planSummaryDatas, "PLAN_VERSION");
      const summarySource = planData.map((item: any) => {
        const summaryDatas = planSummaryMap[item.PLAN_ID];

        this.calcRTFSummary(summaryDatas, item);
        this.calcResourceUtilization(summaryDatas, item);
        this.calcPeggingResult(summaryDatas, item);

        this.calcKPIScore(item);

        return item;
      });

      if (this.basePlanVersionItem) {
        const baseVersion = summarySource.find((item: any) => item.PLAN_ID === this.basePlanVersionItem.PLAN_ID);
        this.basePlanVersionItem = baseVersion || summarySource[0];
      } else {
        const baseVersion = summarySource.find((item: any) => !item.SOURCE_ID);
        this.basePlanVersionItem = baseVersion || summarySource[0];
      }

      this.summarySource = this.sortDataSource(summarySource);

      const versionSummary = groupBy(
        planSummaryDatas,
        item => `${item.CATEGORY}@${item.INDEX}@${item.MODULE_KEY}@${item.TIME_KEY}`,
      );

      const versionDatas: any[] = [];
      for (const key of Object.keys(versionSummary)) {
        const first = versionSummary[key][0];
        if (!first) return;
        const item = {
          CATEGORY: first.CATEGORY,
          KPI: first.INDEX,
          MODULE_KEY: first.MODULE_KEY,
          TIME_KEY: first.TIME_KEY,
        };

        const group = groupBy(versionSummary[key], "PLAN_VERSION");

        this.summarySource.forEach((source: any) => {
          const fgroup = group[source.PLAN_ID];
          if (fgroup?.length > 0) {
            const fitem = fgroup[0];
            (item as any)[source.PLAN_ID] = fitem.VALUE;
          } else {
            (item as any)[source.PLAN_ID] = "-";
          }
        });
        versionDatas.push(item);
      }
      this.versionDataSource = versionDatas;
    } catch (e) {
      console.log("e", e);
      this.loadingVisible = false;
    } finally {
      this.loadingVisible = false;
    }
  }

  public calcKPIScore(planItem: any) {
    let kpiPoint = 0;
    this.kpis.forEach((kpi: IKPI) => {
      if (!kpi.enable) return;

      kpiPoint += planItem[kpi.id] * kpi.weight;
    });

    planItem["KPI_TOTAL_SCORE"] = kpiPoint;
  }

  public calcPeggingResult(summaryDatas: any[], planItem: any) {
    const wipItems = summaryDatas.filter((item: any) => item.INDEX === "TOTAL_WIP_QTY");
    const pegItems = summaryDatas.filter((item: any) => item.INDEX === "PEG_QTY");
    const unpegItems = summaryDatas.filter((item: any) => item.INDEX === "UNPEG_QTY");

    const wipTotalQty = wipItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);
    const pegTotalQty = pegItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);
    const unpegTotalQty = unpegItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);

    planItem.TOTAL_WIP_QTY = wipTotalQty;
    planItem.PEG_RATE = pegTotalQty / wipTotalQty;
    planItem.TOTAL_UNPEG_QTY = unpegTotalQty;
  }

  public calcResourceUtilization(summaryDatas: any[], planItem: any) {
    const resourceItems = summaryDatas.filter(
      (item: any) =>
        item.CATEGORY === "RESOURCE" &&
        item.INDEX === "ResGroup02" && // 시연용으로 추가한 조건
        item.INDEX !== "SETUP_COUNT" &&
        item.INDEX !== "TOTAL_SETUP_COUNT",
    );
    const setupItems = summaryDatas.filter((item: any) => item.INDEX === "SETUP_COUNT");

    const resourceTotalUtilization = resourceItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);
    const setupTotalCount = setupItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);

    planItem.AVG_RESOURCE_UTILIZATION = resourceTotalUtilization / resourceItems.length / 100;
    planItem.TOTAL_SETUP_COUNT = setupTotalCount;
  }

  public calcRTFSummary(summaryDatas: any[], planItem: any) {
    const lateRtfItems = summaryDatas.filter((item: any) => item.INDEX === "LATENESS_RTF_QTY");
    const ontimeRtfItems = summaryDatas.filter((item: any) => item.INDEX === "ONTIME_RTF_QTY");
    const demandItems = summaryDatas.filter((item: any) => item.INDEX === "DEMAND_QTY");

    const lateTotalQty = lateRtfItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);
    const ontimeTotalQty = ontimeRtfItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);
    const demandTotalQty = demandItems.reduce((sum, item) => {
      return sum + item.VALUE;
    }, 0);

    planItem.RTF_TOTAL = lateTotalQty / demandTotalQty;
    planItem.ONTIME_RTF = ontimeTotalQty / demandTotalQty;
    planItem.LATE_RTF = (lateTotalQty - ontimeTotalQty) / demandTotalQty;
  }

  @Watch("checkGroupPanel", { immediate: true })
  public onChangeShowGroupPanel() {
    this.$nextTick(() => {
      let panel = document.querySelector(".dx-datagrid-header-panel") as HTMLElement;
      if (panel != null) panel.style.display = this.checkGroupPanel ? "" : "none";
    });
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];
    const data = e.row.data;

    e.items.push({
      text: " Show Plan Dashboard",
      icon: "new-tab",
      beginGroup: true,
      onItemClick: () => {
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "plan-dashboard" },
        });
      },
    });

    e.items.push({
      text: " Show Gantt Chart",
      icon: "new-tab",
      onItemClick: () => {
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "resource-gantt" },
        });
      },
    });

    e.items.push({
      text: " Show RTF Report",
      icon: "new-tab",
      onItemClick: () => {
        setVersionNo(data.PLAN_ID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-report" },
        });
      },
    });

    if (data.SOURCE_ID) {
      e.items.push({
        text: " Show Compare RTF Report",
        icon: "new-tab",
        onItemClick: () => {
          EventBus.fire("open-popup", {
            params: { key: "rtf-compare-by-so", params: `?v=${data.PLAN_ID}` },
          });
        },
      });
    }
  }

  public onDetailContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    if (!e.column.dataField) return;

    if (["CATEGORY", "KPI", "MODULE_KEY", "TIME_KEY", "PLAN_VERSION"].includes(e.column.dataField)) return;

    const planID = e.column.dataField;

    e.items.push({
      text: " Show Plan Dashboard",
      icon: "new-tab",
      beginGroup: true,
      onItemClick: () => {
        setVersionNo(planID);

        EventBus.fire("open-popup", {
          params: { key: "plan-dashboard" },
        });
      },
    });

    e.items.push({
      text: " Show Gantt Chart",
      icon: "new-tab",
      onItemClick: () => {
        setVersionNo(planID);

        EventBus.fire("open-popup", {
          params: { key: "resource-gantt" },
        });
      },
    });

    e.items.push({
      text: " Show RTF Report",
      icon: "new-tab",
      onItemClick: () => {
        setVersionNo(planID);

        EventBus.fire("open-popup", {
          params: { key: "rtf-report" },
        });
      },
    });

    const versionItem = this.summarySource.find((item: any) => item.PLAN_ID === planID);
    if (versionItem && versionItem.SOURCE_ID) {
      e.items.push({
        text: " Show Compare RTF Report",
        icon: "new-tab",
        onItemClick: () => {
          EventBus.fire("open-popup", {
            params: { key: "rtf-compare-by-so", params: `?v=${planID}` },
          });
        },
      });
    }
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }
  }

  public async onOptionChanged(e: any) {
    switch (e.name) {
      case "columns":
        const fullNames = e.fullName.split(".");

        if (fullNames[1] === "groupIndex") this.checkGroupPanel = true;

        break;
    }
  }

  public showCompareView(e: any) {
    this.openCompareSelect = false;

    EventBus.fire("push-route-by-key", {
      params: { key: "at-plan-compare-view", params: { v: `${e.planIDs}` } },
    });
  }

  public closeCompare(e: any) {
    this.openCompareSelect = false;
  }

  public async updateSetting(e: any) {
    this.openCompareSetting = false;
    this.kpis = e.kpiSetting;
    await this.onRefreshData();
  }

  public closeSetting(e: any) {
    this.openCompareSetting = false;
  }

  public async onRowPrepared(e: any) {
    this.dataGrid?.rows?.forEach((row: any) => {
      if (row.dataItem.PLAN_ID === this.basePlanVersionItem.PLAN_ID) {
        row.cssClass = "accent";
      }
    });
  }
  public getConditionalAppearance() {
    return { fill: "C6EFCE", bold: true };
  }

  public getConditionalCssStyles({ fill, font, bold, width }: any, isHeader: boolean) {
    if (isHeader)
      return {
        "background-color": fill ? `#${fill}` : ``,
        "font-weight": bold ? "bold" : undefined,
      };
    return {
      "background-color": `#${fill}`,
      // background: `linear-gradient(90deg, #${fill} 0%, #${fill} ${Math.round(
      //   width,
      // )}%, transparent ${Math.round(width)}%, transparent 100%)`,
      color: `#${font}`,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public sortDataSource(source: any[]) {
    return source.sort((item1: any, item2: any) =>
      item1.PLAN_ID === this.basePlanVersionItem.PLAN_ID
        ? -1
        : item1.KPI_TOTAL_SCORE > item2.KPI_TOTAL_SCORE
        ? -1
        : item1.KPI_TOTAL_SCORE < item2.KPI_TOTAL_SCORE
        ? 1
        : item1.PLAN_ID < item2.PLAN_ID
        ? -1
        : item1.PLAN_ID > item2.PLAN_ID
        ? 1
        : 0,
    );
  }

  public async onBaseVersionChanged(e: any) {
    const summarySource = this.summarySource;
    this.summarySource = [];

    this.$nextTick(() => {
      this.summarySource = this.sortDataSource(summarySource);
      this.dataGrid?.refresh();
      // this.detailGrid?.refresh();
    });
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      await this.setDataSource(`${this.selectedPlans}`);
      this.$nextTick(() => {
        this.dataGrid.refresh();
        this.detailGrid?.refresh();
      });
    } catch {}
    this.loadingVisible = false;
  }

  public setColumnWidth() {
    // this.dataGrid.headersVisibility = "Column";
    this.detailGrid.autoSizeMode = "Both";
    this.detailGrid.autoSizeColumns();
  }
}
</script>
