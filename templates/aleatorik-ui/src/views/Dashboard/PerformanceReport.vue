<template>
  <div>
    <SplitBox
      width="var(--size-content-inner-width)"
      :height="parentsHeight"
      :minWidth="500"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 100 },
        { type: 'rate', size: 4, minWidth: 400 },
      ]"
      horizontal
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
        <WjFlexGrid
            :style="{
              width: `${parentsWidth}px`,
              height: `${contentsHeight}px`,
            }"
          :itemsSource="performanceReport"
          showSelectedHeaders="All"
          selectionMode="MultiRange"
          keyActionTab="Cycle"
          :allowDelete="false"
          :autoGenerateColumns="false"
          :deferResizing="false"
          :quickAutoSize="true"
          :imeEnabled="true"
          :alternatingRowStep="0"
          :isReadOnly="true"
          :allowPinning="false"
          headersVisibility="Column"
          class="moz-datagrid moz-dashboard-datagrid"
        >
          <WjFlexGridColumn binding="SECTION" header="SECTION" />
          <WjFlexGridColumn
            binding="ELAPSED_TIME"
            header="ELAPSED TIME"
            width="27*"
            align="right"
          />
        </WjFlexGrid>
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
        <moz-chart
          :width="parentsWidth"
          :height="contentsHeight"
          :data="performanceChartData"
          :colorDic="performanceColorDic"
          :show-zero="false"
          :margin="{ top: 30, right: 40, left: 40, bottom: 40 }"
          :delayedTooltip="500"
        >
          <moz-axis
            name="PLAN_VERSION"
            type="key"
            dataType="string"
            direction="horizontal"
            location="bottom"
            :showGrid="true"
            :visible="false"
            :outerPadding="0.2"
            :renderCustomTooltip="renderCustomTooltip"
          />
          <moz-axis
            name="Y"
            type="series"
            data-type="number"
            direction="vertical"
            location="right"
            :show-grid="true"
            :show-bar="false"
            :outerPadding="0.2"
          />
          <moz-series
            field="Engine_Total"
            type="area"
            keyAxis="PLAN_VERSION"
            seriesAxis="Y"
            :onlySeries="true"
            :areaAffectedPrev="true"
          />
          <moz-series
            field="Engine_Total"
            caption="Engine_Total"
            type="line"
            keyAxis="PLAN_VERSION"
            seriesAxis="Y"
          />
          <moz-series
            className="fill-circle"
            field="TARGET"
            caption="TARGET"
            type="line"
            keyAxis="PLAN_VERSION"
            seriesAxis="Y"
            :onlySeries="true"
            :lineInnerCircle="false"
          />
        </moz-chart>
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { GetTableRemote } from "@/api/mainService";

import { ActionLoadOptions, SplitBox } from "mozart-component-wijmo";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import groupBy from "lodash/groupBy";

import { WjFlexGrid, WjFlexGridCellTemplate, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

dayjs.extend(utc);

@Component({
  components: {
    SplitBox,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class PerformanceReport extends Vue {
  @Prop({ type: [Number, String] }) public parentsHeight?: number | string;
  @Prop({ type: String }) public selectedPlanID?: string;

  public tableName = "OUT_EXECUTION_TIME_LOG";

  public performanceReport: any = [];
  public performanceChartData: any = [];
  public performanceColorDic: Record<string, string> = {
    TOTAL: "var(--color-error)",
    ELAPSED_TIME: "var(--color-info)",
  };

  constructor() {
    super();
  }

  public mounted() {
    this.onVersionChanged();
  }

  @Watch("selectedPlanID")
  public async onVersionChanged() {
    if (!this.selectedPlanID) return;

    this.performanceChartData = [];
    this.performanceReport = await this.getData(this.tableName, {
      filter: ["PLAN_VERSION", "=", this.selectedPlanID],
    });

    const plan = await this.getData("CFG_PLAN_CONTROL", {
      filter: ["PLAN_ID", "=", this.selectedPlanID],
    });
    const endTime = dayjs(plan[0].ENGINE_END).locale("kr");
    const startTime = endTime.subtract(1, "month");

    const plans = await this.getData("TABLE", {
      tables: [
        {
          name: this.tableName,
          select: ["PLAN_VERSION", `SECTION`, "ELAPSED_TIME"],
        },
        {
          name: "CFG_PLAN_CONTROL",
          keys: [`${this.tableName}.PLAN_VERSION`, "=", "CFG_PLAN_CONTROL.PLAN_ID"],
          select: ["PLAN_STATUS", "INBOUND_START", "INBOUND_END", "ENGINE_START", "ENGINE_END"],
          type: "inner join",
        },
      ],
      filter: [
        ["ENGINE_END", ">=", startTime.utcOffset(0, true).toDate()],
        "and",
        ["ENGINE_END", "<=", endTime.utcOffset(0, true).toDate()],
      ],
      sort: [{ selector: "ENGINE_END", desc: false }],
    });

    const elapsedTimes = groupBy(plans, "PLAN_VERSION");

    for (const key in elapsedTimes) {
      const items: any = elapsedTimes[key];
      let chartItem: any = { key, PLAN_VERSION: key, PLAN_DATE: items[0].ENGINE_END, DATA: {} };
      items.forEach((item: any) => {
        chartItem.DATA[item.SECTION] = item.ELAPSED_TIME;
        if (item.SECTION === "Engine_Total") {
          chartItem[item.SECTION] = item.ELAPSED_TIME;
          if (key === this.selectedPlanID) {
            chartItem.TARGET = item.ELAPSED_TIME;
          }
        }
      });
      this.performanceChartData.push(chartItem);
    }
  }

  public async getData(tableName: string, option: ActionLoadOptions) {
    const result = await GetTableRemote(tableName, option);
    const data = JSON.parse(result.data);
    return data.data;
  }

  public renderCustomTooltip(params: any) {
    const { key, displayText, setToolTipText: func } = params;

    const datas = this.performanceChartData.find((data: any) => data.PLAN_VERSION === key);
    if (!datas) return;

    let html = "<div style='display: flex; align-items: center;'>";
    html += `<span class="label">${func({
      type: "key",
      key: "",
      text: displayText,
    })}</span>: ${func({
      type: "value",
      key: key,
      text: key,
    })}`;
    html += "</div>";
    html += "<div style='display: flex; align-items: center;'>";
    html += `<span class="label">${func({
      type: "key",
      key: "",
      text: "PLAN_DATE",
    })}</span>: ${func({
      type: "value",
      key: datas.PLAN_DATE,
      text: dayjs(datas.PLAN_DATE).format("YYYY-MM-DD HH:mm:ss"),
    })}`;
    html += "</div><br>";

    for (const dataKey in datas.DATA) {
      html += "<div style='display: flex; align-items: center;'>";
      html += "<span class='dot'></span >";
      // html += `<span class="dot" style="background-color:var(--color-info)"></span>`;
      html += `<span class="label">${func({
        type: "key",
        dataKey,
        text: dataKey,
      })}</span>: ${func({
        type: "value",
        dataKey,
        text: +datas.DATA[dataKey].toFixed(2),
      })}`;
      html += "</div>";
    }
    // serieses.forEach((series: any) => {
    //   const bin = bins[series.field];
    //   if (!bin) return;
    //   html += "<div style='display: flex; align-items: center;'>";
    //   html += `<span class="dot" style="background-color:var(--color-info)"></span>`;
    //   html += `<span class="label">${func({
    //     type: "key",
    //     key,
    //     text: series.displayText,
    //   })}</span>: ${func({
    //     type: "value",
    //     key: series.field,
    //     text: series.totalValue || bin[series.aggregation!].valueData,
    //   })}`;
    //   html += "</div>";
    // });

    return html;
  }

  public async created() {}
}
</script>
