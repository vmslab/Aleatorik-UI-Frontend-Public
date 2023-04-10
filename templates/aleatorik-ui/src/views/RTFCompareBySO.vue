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
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <WjFlexGrid
        style="width: 100%; height: calc(var(--size-content-inner-height-outer-controller) - 3px)"
        :itemsSource="dataSource"
        :initialized="onInitialized"
        showSelectedHeaders="All"
        selectionMode="MultiRange"
        allowSorting="MultiColumn"
        keyActionTab="Cycle"
        :allowDelete="true"
        :autoGenerateColumns="false"
        :deferResizing="true"
        :quickAutoSize="true"
        :imeEnabled="true"
        :alternatingRowStep="0"
        :isReadOnly="true"
        :formatItem="formatItem"
        :showMarquee="true"
      >
        <WjFlexGridColumnGroup binding="SO_ID" header="SO_ID" aggregate="Cnt" />
        <WjFlexGridColumnGroup binding="EDIT_TYPE" header="EDIT_TYPE" />
        <WjFlexGridColumnGroup binding="ITEM_ID" header="ITEM_ID" />
        <WjFlexGridColumnGroup binding="SORT" header="SORT" />
        <WjFlexGridColumnGroup binding="DUE_DATE" header="DUE_DATE" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
        <WjFlexGridColumnGroup binding="SO_QTY" header="SO_QTY" dataType="Number" format="n" />
        <WjFlexGridColumnGroup :header="`ORIGINAL (${selectedSourceID})`" align="center">
          <WjFlexGridColumnGroup binding="ONTIME_QTY" header="ONTIME_QTY" dataType="Number" format=",##0.#########" />
          <WjFlexGridColumnGroup binding="ONTIME_RATIO" header="ONTIME_RATIO" dataType="Number" format="p2" />
          <WjFlexGridColumnGroup binding="LATE_QTY" header="LATE_QTY" dataType="Number" format=",##0.#########" />
          <WjFlexGridColumnGroup binding="LATE_RATIO" header="LATE_RATIO" dataType="Number" format="p2" />
          <WjFlexGridColumnGroup binding="RTF_QTY" header="RTF_QTY" dataType="Number" format=",##0.#########" />
          <WjFlexGridColumnGroup
            binding="RTF_RATIO"
            header="RTF_RATIO"
            dataType="Number"
            format="p2"
            cssClass="main-column"
          />
        </WjFlexGridColumnGroup>
        <WjFlexGridColumnGroup :header="`MODIFIED (${selectedPlanID})`" align="center">
          <WjFlexGridColumnGroup binding="REV_ONTIME_QTY" header="ONTIME_QTY" dataType="Number" format=",##0.#########">
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <div :style="getGapStyle(cell)">
                {{ cell.item.REV_ONTIME_QTY }}
              </div>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
          <WjFlexGridColumnGroup binding="REV_ONTIME_RATIO" header="ONTIME_RATIO" dataType="Number" format="p2">
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <span :style="getGapStyle(cell)">
                {{ format(cell.item[cell.col.binding], cell.col.format) }}
                <span v-show="isGap(cell)" style="color: inherit">
                  (
                  <span style="color: inherit">
                    <i
                      :class="`mozart-icons ${
                        isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                      }`"
                      :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                    />
                    {{ gapValueFromBase(cell, true) }}
                  </span>
                  )
                </span>
              </span>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
          <WjFlexGridColumnGroup binding="REV_LATE_QTY" header="LATE_QTY" dataType="Number" format=",##0.#########">
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <div :style="getGapStyle(cell)">
                {{ cell.item.REV_LATE_QTY }}
              </div>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
          <WjFlexGridColumnGroup binding="REV_LATE_RATIO" header="LATE_RATIO" dataType="Number" format="p2">
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <span :style="getGapStyle(cell)">
                {{ format(cell.item[cell.col.binding], cell.col.format) }}
                <span v-show="isGap(cell)" style="color: inherit">
                  (
                  <span style="color: inherit">
                    <i
                      :class="`mozart-icons ${
                        isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                      }`"
                      :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                    />
                    {{ gapValueFromBase(cell, true) }}
                  </span>
                  )
                </span>
              </span>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
          <WjFlexGridColumnGroup binding="REV_RTF_QTY" header="RTF_QTY" dataType="Number" format=",##0.#########">
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <div :style="getGapStyle(cell)">
                {{ cell.item.REV_RTF_QTY }}
              </div>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
          <WjFlexGridColumnGroup
            binding="REV_RTF_RATIO"
            header="RTF_RATIO"
            dataType="Number"
            format="p2"
            cssClass="main-column"
          >
            <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
              <span :style="getGapStyle(cell)">
                {{ format(cell.item[cell.col.binding], cell.col.format) }}
                <span v-show="isGap(cell)" style="color: inherit">
                  (
                  <span style="color: inherit">
                    <i
                      :class="`mozart-icons ${
                        isGapUpperCase(cell) ? 'm-159_icon-arrow-head-fill-up' : 'm-158_icon-arrow-head-fill-down'
                      }`"
                      :style="isGapUpperCase(cell) ? 'color: var(--color-error);' : 'color: var(--color-info);'"
                    />
                    {{ gapValueFromBase(cell, true) }}
                  </span>
                  )
                </span>
              </span>
            </WjFlexGridCellTemplate>
          </WjFlexGridColumnGroup>
        </WjFlexGridColumnGroup>
      </WjFlexGrid>

      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import values from "lodash/values";
import merge from "lodash/merge";
import keyBy from "lodash/keyBy";

import { Component, Vue, Watch } from "vue-property-decorator";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { getVersionNo, setVersionNo, getVersionDatasByExecution } from "@/utils/commonUtils";
import { Get, GetTableRemote } from "@/api/mainService";
import { ExtendGrid, IMenuItemEventArgs } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumnGroup, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { Globalize } from "@grapecity/wijmo";

import { EventBus } from "mozart-common";

import DxButton from "devextreme-vue/button";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxForm, DxItem, DxRequiredRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";

import DxDateBox from "devextreme-vue/date-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import DxSelectBox from "devextreme-vue/select-box";
import DropDownGrid from "@/components/DropDownGrid.vue";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumnGroup,
    WjFlexGridCellTemplate,
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
    DropDownGrid,
  },
})
export default class RTFCompareBySO extends Vue {
  public filter: boolean = true;

  public tableName: string = "ODV_SALES_ORDER";

  public flexGrid: FlexGrid | undefined;
  public extendGrid: ExtendGrid | undefined;

  public dataSource: any = [];

  public options: Record<string, any> = {};

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
  public selectedSourceID: string = "";

  public loadingVisible = false;

  constructor() {
    super();
  }

  public sum = (curValue: any, newObj: any) => {
    return curValue + newObj.VALUE;
  };

  public numberFormat = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

  public format(value: any, format: string) {
    return Globalize.format(value, format);
  }

  public getGapStyle(cell: any) {
    return !this.isGap(cell)
      ? ""
      : this.isGapUpperCase(cell)
      ? "color: var(--color-error);"
      : "color: var(--color-info);";
  }

  public isGap(cell: any) {
    return cell.item[cell.col.binding] !== cell.item[cell.col.header];
  }
  public isGapUpperCase(cell: any) {
    if (typeof cell.item[cell.col.header] !== "number") return true;

    return cell.item[cell.col.binding] > cell.item[cell.col.header];
  }
  public gapValueFromBase(cell: any, isPercent: boolean) {
    if (typeof cell.item[cell.col.header] !== "number") return "infinity";

    return `${this.numberFormat.format(
      (cell.item[cell.col.binding] - cell.item[cell.col.header]) * (isPercent ? 100 : 1),
    )}%`;
  }

  public async mounted() {
    this.loadingVisible = true;

    const urlParams = new URLSearchParams(window.location.search);
    let version = urlParams.get("v") || getVersionNo();

    console.log(version);

    await this.setVersionControl(version);
    await this.onRefreshData();

    this.loadingVisible = false;
  }

  public onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: this.flexGrid,
      gridOptions: {
        useSelector: false,
        useAutoColumnFit: false,
        useGroupPanel: false,
        onInitialized: grid => {
          this.extendGrid?.contextMenu?.addMenuItem({ header: "-" });
          this.extendGrid?.contextMenu?.addMenuItem({
            header: "Show BOM Map View",
            cmd: "openBOM",
            active: ({ hitTest }: IMenuItemEventArgs) => {
              return !!hitTest?.getRow()?.dataItem?.SO_ID;
            },
            clicked: ({ hitTest }: IMenuItemEventArgs) => {
              setVersionNo(this.selectedPlanID);
              EventBus.fire("open-popup", {
                params: {
                  key: "bom-map-view",
                  params: `?s=${hitTest?.getRow().dataItem.SO_ID}`,
                },
              });
            },
          });
        },
      },
    });
  }

  public async setDataSource() {
    this.loadingVisible = true;
    try {
      this.dataSource = [];
      if (!this.selectedSourceID) return;

      let summaryReport = await this.getRtfSummary(this.selectedSourceID, this.selectedPlanID);
      let rtfSummary = merge(
        keyBy(summaryReport.sourceSummary, "SO_ID"),
        keyBy(summaryReport.revisionSummary, "SO_ID"),
      );
      await this.setRevisionEditType(rtfSummary);

      this.dataSource = values(rtfSummary).sort(this.summarySortingRule);
    } finally {
      this.loadingVisible = false;
    }
  }

  public summarySortingRule(x: any, y: any): number {
    if (x.EDIT_TYPE === "add" && y.EDIT_TYPE !== "add") return -1;
    if (x.EDIT_TYPE !== "add" && y.EDIT_TYPE === "add") return 1;

    if (x.EDIT_TYPE === "update" && y.EDIT_TYPE !== "update") return -1;
    if (x.EDIT_TYPE !== "update" && y.EDIT_TYPE === "update") return 1;

    if (x.EDIT_TYPE === "delete" && y.EDIT_TYPE !== "delete") return -1;
    if (x.EDIT_TYPE !== "delete" && y.EDIT_TYPE === "delete") return 1;

    const xRTFRate = x.REV_RTF_RATIO - x.RTF_RATIO - 0;
    const yRTFRate = y.REV_RTF_RATIO - y.RTF_RATIO - 0;
    if (xRTFRate !== 0 && yRTFRate === 0) return -1;
    if (xRTFRate === 0 && yRTFRate !== 0) return 1;

    if (xRTFRate > yRTFRate) return xRTFRate < 0 && yRTFRate < 0 ? 1 : -1;
    if (xRTFRate < yRTFRate) return xRTFRate < 0 && yRTFRate < 0 ? -1 : 1;

    const xLateRate = x.REV_LATE_RATIO - x.LATE_RATIO - 0;
    const yLateRate = y.REV_LATE_RATIO - y.LATE_RATIO - 0;
    if (xLateRate !== 0 && yLateRate === 0) return -1;
    if (xLateRate === 0 && yLateRate !== 0) return 1;

    if (xLateRate > yLateRate) return xLateRate < 0 && yLateRate < 0 ? 1 : -1;
    if (xLateRate < yLateRate) return xLateRate < 0 && yLateRate < 0 ? -1 : 1;

    const xOntimeRate = x.REV_ONTIME_RATIO - x.ONTIME_RATIO - 0;
    const yOntimeRate = y.REV_ONTIME_RATIO - y.ONTIME_RATIO - 0;
    if (xOntimeRate !== 0 && yOntimeRate === 0) return -1;
    if (xOntimeRate === 0 && yOntimeRate !== 0) return 1;

    if (xOntimeRate > yOntimeRate) return xOntimeRate < 0 && yOntimeRate < 0 ? 1 : -1;
    if (xOntimeRate < yOntimeRate) return xOntimeRate < 0 && yOntimeRate < 0 ? -1 : 1;

    return x.SO_ID < y.SO_ID ? -1 : x.SO_ID > y.SO_ID ? 1 : 0;
  }

  public async setRevisionEditType(rtfSummary: any) {
    const result = await GetTableRemote("AT_REVISION_LOG", {
      filter: [
        ["COMMAND", "!=", "copy"],
        "and",
        ["PLAN_ID", "=", this.selectedPlanID],
        "and",
        ["TARGET_TABLE", "=", this.tableName],
      ],
      sort: [{ selector: "REVISION_SEQ", desc: true }],
    });
    let data = JSON.parse(result.data);
    data.data.forEach((d: any) => {
      switch (d.COMMAND) {
        case "add":
          const addedSOID = JSON.parse(d.NEW_VALUES)?.SO_ID;
          const addedTarget = rtfSummary[addedSOID];
          addedTarget.EDIT_TYPE = "add";
          break;
        case "update":
          const updatedSOID = JSON.parse(d.DATA_KEY).SO_ID;
          const updatedTarget = rtfSummary[updatedSOID];
          updatedTarget.EDIT_TYPE = "update";
          break;
        case "delete":
          const deletedSOID = JSON.parse(d.OLD_VALUES)[0]?.SO_ID;
          const deletedTarget = rtfSummary[deletedSOID];
          deletedTarget.EDIT_TYPE = "delete";
      }
    });
  }

  public async getRtfSummary(source: string, revision: string) {
    let param = {
      source: source,
      revision: revision,
    };

    const result = await Get("RTFCompareSummary", param, "post");
    const data = JSON.parse(result.data);
    return data;
  }

  public async setVersionControl(version: string | null = null) {
    this.planVersionItems = (await getVersionDatasByExecution(["Revision", "MultiRun", "Optimizing"])).filter(
      (item: any) => item.SOURCE_ID?.length > 0,
    );

    if (version) {
      this.selectedPlanID = version;
      const selectedPlanItem = this.planVersionItems.find((item: any) => item.PLAN_ID === version);
      this.selectedSourceID = selectedPlanItem.SOURCE_ID;
    } else {
      this.selectedPlanID = this.planVersionItems[0]?.PLAN_ID;
      this.selectedSourceID = this.planVersionItems[0]?.SOURCE_ID;
    }
  }

  public async onVersionChanged(e: any) {
    await this.setVersionControl(e.PLAN_ID);
    setVersionNo(e.PLAN_ID);
    await this.setDataSource();
  }

  public isDataCell(s: FlexGrid, e: any) {
    return s.cells === e.panel;
  }

  public isColumnHeader(s: FlexGrid, e: any) {
    return s.columnHeaders === e.panel;
  }

  public formatItem(s: FlexGrid, e: any) {
    if (this.isColumnHeader(s, e)) {
      e.cell.classList.add("wj-merge");
    } else if (this.isDataCell(s, e)) {
      if (e.getColumn().header === "RTF_RATIO") return;
      const item = e.getRow()?.dataItem;
      switch (item?.EDIT_TYPE) {
        case "update":
          e.cell?.classList.add("cell-updated");
          e.cell?.classList.remove("cell-added");
          e.cell?.classList.remove("cell-deleted");
          break;
        case "add":
          e.cell?.classList.remove("cell-updated");
          e.cell?.classList.add("cell-added");
          e.cell?.classList.remove("cell-deleted");
          break;
        case "delete":
          e.cell?.classList.remove("cell-updated");
          e.cell?.classList.remove("cell-added");
          e.cell?.classList.add("cell-deleted");
          break;
        default:
          e.cell?.classList.remove("cell-updated");
          e.cell?.classList.remove("cell-added");
          e.cell?.classList.remove("cell-deleted");
          break;
      }
    }
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      await this.setVersionControl(this.selectedPlanID);
      await this.setDataSource();
      this.flexGrid?.refresh();
      //this.flexGrid?.autoSizeColumns();
    } catch {}
    this.loadingVisible = false;
  }
}
</script>
<style>
.main-column {
  background-color: #fffacd;
}
</style>
