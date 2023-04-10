<template>
  <div style="height: 100%">
    <SplitBox
      height="var(--size-content-inner-height-outer-controller-tab)"
      :minWidth="1280"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 500 },
        { type: 'rate', size: 1, minWidth: 500 },
        { type: 'rate', size: 1, minWidth: 580 },
      ]"
      resizable
      horizontal
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">RTF Report</div>
          </div>
          <SplitBox
            :width="parentsWidth"
            :height="parentsHeight"
            :minHeight="540"
            :boxes="[
              { type: 'rate', size: 1, minHeight: 270 },
              { type: 'rate', size: 1, minHeight: 270 },
            ]"
          >
            <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
              <div class="flex-center-horizontal" :style="`width: ${parentsWidth}px; height: ${parentsHeight}px;`">
                <div :style="`width: ${(parentsWidth / 3) * 2}px; height: ${parentsHeight}px;`">
                  <moz-chart
                    className="plan-dashboard-rtf-pie"
                    :data="rtfSummaryData"
                    :isTooltip="false"
                    :margin="{ top: 20, right: 60, left: 60, bottom: 80 }"
                    :pieInnerRadius="100"
                    :pieOuterRadius="140"
                    :colorDic="rtfColorDic"
                    pieTooltipType="mouse"
                  >
                    <moz-series field="rtf" caption="RTF Ratio" type="pie" />
                    <moz-series field="short" caption="Short Ratio" type="pie" />
                    <moz-text type="legend" location="bottom" legendShape="circle" :margin="{ bottom: 20 }" />
                    <moz-text
                      :text="rtfTitleHtml"
                      type="html"
                      location="center"
                      className="flex-center plan-dashboard-title"
                      :margin="{ bottom: 34 }"
                    />
                    <moz-text :text="rtfText" location="center" className="plan-dashboard-ratio-text" />
                    <moz-text
                      :text="rtfCountText"
                      location="center"
                      className="plan-dashboard-count-text"
                      :margin="{ top: 34 }"
                    />
                  </moz-chart>
                </div>
                <div :style="`width: ${(parentsWidth / 3) * 1}px;`">
                  <div class="plan-dashboard-sub-title">On-Time Delivery</div>
                  <div class="plan-dashboard-sub-ratio">{{ rtfOnTimeRatioText }}</div>
                  <div class="plan-dashboard-sub-count">{{ rtfOnTimeCountText }}</div>
                  <div class="plan-dashboard-sub-space"></div>
                  <div class="plan-dashboard-sub-title">Late Delivery</div>
                  <div class="plan-dashboard-sub-ratio">{{ rtfLateRatioText }}</div>
                  <div class="plan-dashboard-sub-count">{{ rtfLateCountText }}</div>
                </div>
              </div>
            </template>
            <template slot="box2">
              <moz-chart
                id="rtf-summary-chart"
                :data="rtfChartData"
                :colorDic="rtfColorDic"
                :show-zero="false"
                :margin="{ top: 20, right: 20, left: 60, bottom: 110 }"
                :isTooltipReverse="true"
                :isCollisionTextLogic="false"
                :isCollisionTextRerender="true"
                :collisionTextPadding="-20"
                :setToolTipText="
                  ({ type, key, text }) =>
                    type === 'key' || typeof text !== 'number' || text === 0 ? text : `${text}%`
                "
                :onDblClickItem="onRtfChartDblClick"
              >
                <moz-axis
                  name="TIME_KEY"
                  type="key"
                  dataType="string"
                  direction="horizontal"
                  location="bottom"
                  :showGrid="true"
                  :outerPadding="0.1"
                />
                <moz-axis
                  name="Y"
                  type="series-aggregation-accumulate"
                  data-type="number"
                  direction="vertical"
                  :fixedMinValue="0"
                  location="left"
                  :show-grid="true"
                  :show-bar="false"
                  :outerPadding="0.1"
                />
                <moz-series
                  field="ontime"
                  caption="On-Time"
                  type="stack"
                  keyAxis="TIME_KEY"
                  seriesAxis="Y"
                  :barMaxSize="50"
                />
                <moz-series
                  field="late"
                  caption="Late"
                  type="stack"
                  keyAxis="TIME_KEY"
                  seriesAxis="Y"
                  :barMaxSize="50"
                />
                <moz-series
                  field="short"
                  caption="Short"
                  type="stack"
                  keyAxis="TIME_KEY"
                  seriesAxis="Y"
                  :barMaxSize="50"
                />
                <moz-text
                  type="legend"
                  location="bottom"
                  legendShape="circle"
                  :margin="{ bottom: 60 }"
                  :legendCol="3"
                  :legendRow="1"
                />
                <moz-text
                  text="ontime"
                  type="label"
                  position="start"
                  color="var(--color-font-white)"
                  :setText="setPercent"
                />
                <moz-text
                  text="late"
                  type="label"
                  position="start"
                  color="var(--color-font-white)"
                  :setText="setPercent"
                />
                <moz-text
                  text="short"
                  type="label"
                  position="start"
                  color="var(--color-font-white)"
                  :setText="setPercent"
                />
              </moz-chart>
              <!-- <DxContextMenu
                :data-source="rtfChartData"
                :width="200"
                target="#rtf-summary-chart"
                @item-click="onMoveRTFReport"
                show-event="dxcontextmenu"
              >
                <template #item="{ data: e }">
                  <div>Show RTF Report (TIME_KEY : {{ e.key }})</div>
                </template>
              </DxContextMenu> -->
            </template>
          </SplitBox>
        </div>
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Pegging Report</div>
          </div>
          <SplitBox
            :width="parentsWidth"
            :height="parentsHeight"
            :minHeight="540"
            :boxes="[
              { type: 'rate', size: 1, minHeight: 270 },
              { type: 'rate', size: 1, minHeight: 270 },
            ]"
          >
            <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
              <div class="flex-center-horizontal" :style="`width: ${parentsWidth}px; height: ${parentsHeight}px;`">
                <div :style="`width: ${(parentsWidth / 3) * 2}px; height: ${parentsHeight}px;`">
                  <moz-chart
                    className="plan-dashboard-peg-pie"
                    :data="pegSummaryData"
                    :isTooltip="false"
                    :margin="{ top: 20, right: 60, left: 60, bottom: 80 }"
                    :pieInnerRadius="100"
                    :pieOuterRadius="140"
                    :colorDic="pegColorDic"
                    pieTooltipType="mouse"
                  >
                    <moz-series field="peg" caption="Peg" type="pie" />
                    <moz-series field="unpeg" caption="Unpeg" type="pie" />
                    <moz-text type="legend" location="bottom" legendShape="circle" :margin="{ bottom: 20 }" />
                    <moz-text
                      :text="pegTitleHtml"
                      type="html"
                      location="center"
                      className="flex-center plan-dashboard-title"
                      :margin="{ bottom: 34 }"
                    />
                    <moz-text :text="pegRatioText" location="center" className="plan-dashboard-ratio-text" />
                    <moz-text
                      :text="pegCountText"
                      location="center"
                      className="plan-dashboard-count-text"
                      :margin="{ top: 34 }"
                    />
                  </moz-chart>
                </div>
                <div :style="`width: ${(parentsWidth / 3) * 1}px;`">
                  <div class="flex-center-horizontal plan-dashboard-title">
                    <div class="plan-dashboard-title-bar" :style="`background-color: ${pegColorDic['unpeg']};`"></div>
                    <div class="plan-dashboard-title-text">Unpeg Reasons</div>
                  </div>
                  <div class="plan-dashboard-sub-space"></div>
                  <div class="plan-dashboard-sub-area">
                    <template v-for="(item, i) in pegUnpegReasons">
                      <div :key="i" class="plan-dashboard-sub-title">
                        {{ `${i + 1}. ${item.key}` }}
                      </div>
                      <div class="plan-dashboard-sub-item">
                        <span class="plan-dashboard-sub-item-ratio">
                          {{ item.ratio }}
                        </span>
                        <span class="plan-dashboard-sub-item-count"> ({{ item.count }}) </span>
                      </div>
                      <div class="plan-dashboard-sub-space"></div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
            <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
              <WjFlexGrid
                :style="{
                  width: parentsWidth,
                  height: parentsHeight,
                }"
                :itemsSource="pegTableData"
                showSelectedHeaders="All"
                selectionMode="None"
                keyActionTab="Cycle"
                :allowDelete="false"
                :autoGenerateColumns="false"
                :deferResizing="false"
                :quickAutoSize="true"
                :imeEnabled="true"
                :alternatingRowStep="0"
                :isReadOnly="true"
                :allowPinning="false"
                :allowSorting="false"
                headersVisibility="Column"
                class="moz-datagrid moz-dashboard-datagrid"
              >
                <WjFlexGridColumn binding="STAGE_ID" header="STAGE ID" width="15*">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <span>{{ cell.item.STAGE_ID }}</span>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="BUFFER_ID" header="BUFFER ID" width="15*">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <span>{{ cell.item.BUFFER_ID }}</span>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="WIP_QTY" header="WIP QTY" width="16*" align="right">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <span>{{ `${cell.item.WIP_QTY?.toLocaleString("ko-KR")}` }}</span>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="PEG_QTY" header="PEG QTY" width="27*" align="right">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <span>
                      {{
                        `${cell.item.PEG_QTY?.toLocaleString("ko-KR")} (${toFixed(
                          (cell.item.PEG_QTY / cell.item.WIP_QTY) * 100,
                        )}%)`
                      }}
                    </span>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="UNPEG_QTY" header="UNPEG QTY" width="27*" align="right">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <span>
                      {{
                        `${cell.item.UNPEG_QTY?.toLocaleString("ko-KR")} (${toFixed(
                          (cell.item.UNPEG_QTY / cell.item.WIP_QTY) * 100,
                        )}%)`
                      }}
                    </span>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
              </WjFlexGrid>
            </template>
          </SplitBox>
        </div>
      </template>
      <template slot="box3" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Resource Utilization Report</div>
          </div>
          <SplitBox
            :width="parentsWidth"
            :height="parentsHeight"
            :minHeigth="200"
            :boxes="[
              { type: 'rate', size: 1, minHeigth: 100 },
              { type: 'rate', size: 1, minHeigth: 100 },
            ]"
          >
            <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
              <WjFlexGrid
                :style="{
                  width: parentsWidth,
                  height: parentsHeight,
                }"
                :itemsSource="resourceUtilTableData"
                showSelectedHeaders="All"
                selectionMode="None"
                keyActionTab="Cycle"
                :allowDelete="false"
                :autoGenerateColumns="false"
                :deferResizing="false"
                :quickAutoSize="true"
                :imeEnabled="true"
                :alternatingRowStep="0"
                :isReadOnly="true"
                :allowPinning="false"
                :allowSorting="false"
                headersVisibility="Column"
                class="moz-datagrid moz-dashboard-datagrid"
              >
                <WjFlexGridColumn binding="RESOURCE_GROUP_ID" header="RESOURCE GROUP ID" :width="150">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <div class="flex-center-horizontal">
                      <div
                        class="plan-dashboard-resource-legend"
                        :style="`background-color:${utilizationColorDic[cell.item.RESOURCE_GROUP_ID]};`"
                      ></div>
                      <div>{{ cell.item.RESOURCE_GROUP_ID }}</div>
                    </div>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn
                  binding="RES_COUNT"
                  header="COUNT"
                  data-type="Number"
                  format="n0"
                  :width="70"
                ></WjFlexGridColumn>
                <WjFlexGridColumn binding="RES_VALUE_AVG" header="AVG" data-type="Number" format="n1" :width="70">
                  <!-- <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <p class="nowrap-text">{{ `${cell.item.AVG.toLocaleString("ko-KR")}` }}</p>
                  </WjFlexGridCellTemplate> -->
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="RES_VALUE_MIN" header="MIN" data-type="Number" format="n1" :width="70">
                  <!-- <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <p class="nowrap-text">{{ `${cell.item.MIN.toLocaleString("ko-KR")}` }}</p>
                  </WjFlexGridCellTemplate> -->
                </WjFlexGridColumn>
                <WjFlexGridColumn binding="RES_VALUE_MAX" header="MAX" data-type="Number" format="n1" :width="70">
                  <!-- <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <p class="nowrap-text">{{ `${cell.item.MAX.toLocaleString("ko-KR")}` }}</p>
                  </WjFlexGridCellTemplate> -->
                </WjFlexGridColumn>

                <WjFlexGridColumn binding="Trend" header="Trend" width="1*" align="center" cssClass="chart-in-column">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <div class="plan-dashboard-kpi-td">
                      <moz-chart
                        class="pan-dashboard-kpi-td-chart"
                        :data="cell.item.Trend"
                        :colorDic="utilizationColorDic"
                      >
                        <moz-axis
                          name="TIME_KEY"
                          type="key"
                          dataType="string"
                          direction="horizontal"
                          location="bottom"
                          :outerPadding="0.1"
                          :visible="false"
                        />
                        <moz-axis
                          name="Y"
                          type="series"
                          data-type="number"
                          direction="vertical"
                          location="left"
                          :outerPadding="0.4"
                          :visible="false"
                        />
                        <moz-series
                          :field="cell.item.RESOURCE_GROUP_ID"
                          keyAxis="TIME_KEY"
                          seriesAxis="Y"
                          type="line"
                        />
                      </moz-chart>
                    </div>
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
              </WjFlexGrid>
            </template>
            <template slot="box2">
              <moz-chart
                :data="resourceUtilChartData"
                :margin="{ top: 20, right: 20, left: 60, bottom: 80 }"
                :colorDic="utilizationColorDic"
              >
                <moz-axis
                  name="TIME_KEY"
                  type="key"
                  dataType="string"
                  direction="horizontal"
                  location="bottom"
                  :outerPadding="0.0"
                />
                <moz-axis
                  name="Y"
                  type="series"
                  data-type="number"
                  direction="vertical"
                  :fixedMinValue="0"
                  location="left"
                  :show-grid="true"
                  :show-bar="false"
                  :outerPadding="0.1"
                />
                <moz-series
                  v-for="item in resourceUtilTableData"
                  :key="item.RESOURCE_GROUP_ID"
                  :field="item.RESOURCE_GROUP_ID"
                  :caption="item.RESOURCE_GROUP_ID"
                  keyAxis="TIME_KEY"
                  seriesAxis="Y"
                  :barInnerPadding="2"
                />
                <!-- <moz-text
                  type="legend"
                  location="bottom"
                  legendShape="square"
                  :margin="{ bottom: 50 }"
                /> -->
              </moz-chart>
            </template>
          </SplitBox>
        </div>
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { Call, Get } from "@/api/mainService";
import { SplitBox } from "mozart-component-wijmo";
import { EventBus } from "mozart-common";
import DxButton from "devextreme-vue/button";

import { DxSparkline, DxSize, DxTooltip } from "devextreme-vue/sparkline";
import { DxContextMenu } from "devextreme-vue/context-menu";
import { WjFlexGrid, WjFlexGridCellTemplate, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

import { loadTableDatas } from "@/utils/dataUtils";

@Component({
  components: {
    DxButton,
    DxSparkline,
    DxSize,
    DxTooltip,
    DxContextMenu,
    SplitBox,
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class KPIReport extends Vue {
  @Prop({ type: String }) public selectedPlanID?: string;

  public tableName = "OUT_PLAN_INDEX";

  public rtfSummaryData: any[] = [];
  public rtfChartData: any[] = [];
  public pegSummaryData: any[] = [];
  public pegTableData: any[] = [];
  public resourceUtilTableData: any[] = [];
  public resourceUtilChartData: any[] = [];

  public rtfChartKeyType: any = {};

  public rtfColorDic: Record<string, string> = {
    rtf: "#29becc",
    short: "var(--color-error)",
    ontime: "#8fcece",
    late: "var(--color-warning)",
  };
  public rtfTitleHtml: string = `<div class='plan-dashboard-title-bar' style='background-color:${this.rtfColorDic["rtf"]}'></div><div class='plan-dashboard-title-text'>RTF Ratio</div>`;
  public rtfText: string = "";
  public rtfCountText: string = "";
  public rtfOnTimeRatioText: string = "";
  public rtfOnTimeCountText: string = "";
  public rtfLateRatioText: string = "";
  public rtfLateCountText: string = "";

  public pegColorDic: Record<string, string> = {
    unpeg: "#9e75e2",
    peg: "#94c2f8",
  };
  public pegTitleHtml: string = `<div class='plan-dashboard-title-bar' style='background-color:${this.pegColorDic["peg"]}'></div><div class='plan-dashboard-title-text'>Pegging Ratio</div>`;
  public pegRatioText: string = "";
  public pegCountText: string = "";
  public pegUnpegReasons: any[] = [];

  public utilizationColorDic: Record<string, any> = {};

  public sum = (curValue: any, newObj: any) => {
    return curValue + newObj.VALUE;
  };

  public toFixed = (value: number, fixed: number = 2) => {
    return value.toFixed(fixed);
    // (Math.round((value + Number.EPSILON) * 100) + Number.EPSILON) / 100;
  };

  public setPercent = (e: any) => {
    return e.value.toFixed(2) + "%";
  };

  constructor() {
    super();
  }

  public mounted() {
    this.onVersionChanged();
    this.log();
  }

  @Watch("utilizationColorDic")
  public log() {
    console.log("utilizationColorDic", JSON.parse(JSON.stringify(this.utilizationColorDic)));
  }

  @Watch("selectedPlanID")
  public async onVersionChanged() {
    this.rtfSummaryData = [];
    this.rtfChartData = [];
    this.pegSummaryData = [];
    this.pegTableData = [];
    this.resourceUtilTableData = [];
    this.resourceUtilChartData = [];

    if (!this.selectedPlanID) return;

    const planReport = await loadTableDatas(this.tableName, {
      PLAN_VERSION: this.selectedPlanID,
    });

    const pegReport = planReport.filter((item: any) => item.CATEGORY === "PEG_RESULT");

    const resourceReportSummary = await this.loadApi("GetResourceReportSummary");
    const resourceReportDetail = await this.loadApi("GetResourceReportDetail");
    // const resourceReportDetail = (await this.loadApi("GetResourceReportDetail")).filter(
    //   (item: any) => item.RES_VALUE > 0,
    //   // 값이 있는 달만 표시되도록
    // );

    const rtfReportSummary = await this.loadApi("GetRTFReportSummary");
    const rtfReportDetail = await this.loadApi("GetRTFReportDetailChart");

    console.log("deta", resourceReportDetail);

    this.calcRTFSummaryData(rtfReportSummary[0]);
    this.calcRTFChartData(rtfReportDetail);

    this.calcPegSummaryData(pegReport);
    this.calcPegTableData();

    this.calcResourceTableData(resourceReportSummary, resourceReportDetail);
    this.calcResourceChartData(resourceReportDetail);
  }

  public async loadApi(api: string) {
    if (!this.selectedPlanID) {
      return [];
    }

    const param = {
      obj: JSON.stringify({
        PLAN_VERSION: this.selectedPlanID,
      }),
    };

    const result = await Call(api, param, "post");
    const data = JSON.parse(result.data);
    return data;
  }

  public async calcPegSummaryData(pegReport: any) {
    const unpegSummaryTable = await Get(
      "UnpegSummary",
      {
        options: {
          filter: [["PLAN_VERSION", "=", this.selectedPlanID]],
        },
      },
      "post",
    );

    const unpegTableData = JSON.parse(unpegSummaryTable.data);

    const unpegQty = Object.keys(unpegTableData).reduce((sum, key) => {
      return sum + unpegTableData[key];
    }, 0);
    const pegObj = pegReport.filter((item: any) => item.INDEX === "PEG_QTY")[0];
    const pegQty: number = pegObj.VALUE;
    const unpegArr = Object.keys(unpegTableData).map(key => {
      return {
        key: key.replace(/@/g, ""),
        value: unpegTableData[key],
      };
    });
    const unpegSort = unpegArr.sort((a, b) => {
      if (a.value < b.value) return 1;
      else if (a.value > b.value) return -1;
      else return 0;
    });
    this.pegUnpegReasons = unpegSort.reduce((result: any[], item, idx) => {
      if (idx < 4) {
        result.push({
          key: item.key,
          value: item.value,
          count: new Intl.NumberFormat().format(item.value),
          ratio: `${Math.round((item.value / (pegQty + unpegQty)) * 100.0 * 100) / 100}%`,
        });
      } else {
        const fitem = result.find(r => r.key === "ETC");
        if (fitem) {
          fitem.value += item.value;
          fitem.count = new Intl.NumberFormat().format(fitem.value);
          fitem.ratio = `${Math.round((fitem.value / (pegQty + unpegQty)) * 100.0 * 100) / 100}%`;
        } else {
          result.push({
            key: "ETC",
            value: item.value,
            count: new Intl.NumberFormat().format(item.value),
            ratio: `${Math.round((item.value / (pegQty + unpegQty)) * 100.0 * 100) / 100}%`,
          });
        }
      }
      return result;
    }, []);

    this.pegSummaryData = [{ key: 0, peg: pegQty, unpeg: unpegQty }];
    this.pegRatioText = `${Math.round((pegQty / (pegQty + unpegQty)) * 100.0 * 100) / 100}%`;
    this.pegCountText = new Intl.NumberFormat().format(pegQty);
  }

  public async calcPegTableData() {
    let param = {
      obj: JSON.stringify({
        PLAN_VERSION: this.selectedPlanID,
      }),
      type: "type",
    };

    console.log(param);

    const result = await Call("GetPeggingList", param, "post");
    this.pegTableData = JSON.parse(result.data);
  }

  public async calcResourceChartData(resourceReportDetail: any) {
    let resourceChartData = [];
    let calcDatas: any = {};

    for await (const data of resourceReportDetail) {
      if (!calcDatas[data.RES_MONTH]) calcDatas[data.RES_MONTH] = [];

      calcDatas[data.RES_MONTH].push(data);
    }

    for await (const dataKey of Object.keys(calcDatas)) {
      const datas = calcDatas[dataKey];
      let item: any = { key: datas[0].RES_MONTH };
      for await (const data of datas) {
        item[data.RESOURCE_GROUP_ID] = data.RES_VALUE;
      }
      resourceChartData.push(item);
    }

    console.log("resourceChartData", JSON.parse(JSON.stringify(resourceChartData)));

    this.resourceUtilChartData = resourceChartData;
  }

  public async calcResourceTableData(resourceReportSummary: any, resourceReportDetail: any) {
    for await (const data of resourceReportSummary) {
      data.Trend = resourceReportDetail
        .filter((item: { RESOURCE_GROUP_ID: string }) => data.RESOURCE_GROUP_ID == item.RESOURCE_GROUP_ID)
        .map((item: any) => ({
          key: item.RES_MONTH,
          [item.RESOURCE_GROUP_ID]: item.RES_VALUE,
        }));
    }

    this.resourceUtilTableData = resourceReportSummary;
    // 원본 배열에 바로 push 할경우 wijmo flexgrid에서 데이터가 변경되지 않는 이슈 있었음 2023-01-11 18:10 Hawon Kim
  }

  public async calcRTFChartData(rtfReport: any) {
    // // 글자순 정렬 (추후 sql order by 로 변경 바람.)
    // rtfReport.sort((a: any, b: any) => {
    //   if (a.INDEX < b.INDEX) {
    //     return -1;
    //   }
    //   if (a.INDEX > b.INDEX) {
    //     return 1;
    //   }
    //   return 0;
    // });

    // this.rtfChartKeyType = {};
    // for await (const data of rtfReport) {
    //   // rtf 차트는 demand qty 기준이기 때문에 없으면 차트에 표시X
    //   if (!this.rtfChartKeyType[data.TIME_KEY] && data.INDEX === "DEMAND_QTY") {
    //     this.rtfChartKeyType[data.TIME_KEY] = { key: data.TIME_KEY, unit: data.TIME_UNIT };
    //   }

    //   this.rtfChartKeyType[data.TIME_KEY] && (this.rtfChartKeyType[data.TIME_KEY][data.INDEX] = data.VALUE);
    // }

    // for await (const dataKey of Object.keys(this.rtfChartKeyType)) {
    //   const data = this.rtfChartKeyType[dataKey];
    //   let item = { key: data.key, unit: data.unit, ontime: 0, late: 0, short: 0 };
    //   if (data.DEMAND_QTY && data.DEMAND_QTY > 0) {
    //     item.ontime = data.ONTIME_RTF_QTY / data.DEMAND_QTY;
    //     item.late = (data.LATENESS_RTF_QTY - data.ONTIME_RTF_QTY) / data.DEMAND_QTY;
    //     item.short = (data.DEMAND_QTY - data.LATENESS_RTF_QTY) / data.DEMAND_QTY;
    //     item.ontime = Math.round(item.ontime * 100.0);
    //     item.late = Math.round(item.late * 100.0);
    //     item.short = Math.round(item.short * 100.0);
    //   }
    //   this.rtfChartData.push(item);
    // }

    this.rtfChartData = rtfReport.map((item: any) => ({
      key: item.SO_MONTH,
      ontime: item.ONTIME_RATIO,
      late: item.LATE_RATIO,
      short: item.SHORT_RATIO,
    }));
  }

  public calcRTFSummaryData(rtfReport: any) {
    // const onTimeQty = rtfReport
    //   .filter((item: any) => item.INDEX === "ONTIME_RTF_QTY" && item.MODULE_KEY === "Module02")
    //   .reduce(this.sum, 0);
    // const lateQty = rtfReport
    //   .filter((item: any) => item.INDEX === "LATENESS_RTF_QTY" && item.MODULE_KEY === "Module02")
    //   .reduce(this.sum, 0);
    // const demandQty = rtfReport
    //   .filter((item: any) => item.INDEX === "DEMAND_QTY" && item.MODULE_KEY === "Module02")
    //   .reduce(this.sum, 0);

    if (!!rtfReport.RTF_RATIO) {
      this.rtfSummaryData = [{ key: 0, rtf: rtfReport.RTF_RATIO, short: 100 - rtfReport.RTF_RATIO }];
    } else {
      this.rtfSummaryData = [{ key: 0, rtf: 0, short: 0 }];
    }

    this.rtfText = `${rtfReport.RTF_RATIO || "-"}%`;
    this.rtfCountText = !!rtfReport.RTF_QTY ? new Intl.NumberFormat().format(rtfReport.RTF_QTY) : "-";
    this.rtfOnTimeRatioText = `${rtfReport.ONTIME_RATIO || "-"}%`;
    this.rtfOnTimeCountText = !!rtfReport.ONTIME_QTY ? new Intl.NumberFormat().format(rtfReport.ONTIME_QTY) : "-";
    this.rtfLateRatioText = `${rtfReport.LATE_RATIO || "-"}%`;
    this.rtfLateCountText = !!rtfReport.LATE_QTY ? new Intl.NumberFormat().format(rtfReport.LATE_QTY) : "-";
  }

  public onRtfChartDblClick(e: any) {
    if (!e || !e.key) return;

    const item = this.rtfChartKeyType[e.key];
    if (!item) return;

    EventBus.fire("open-popup", {
      params: {
        key: "rtf-report",
        params: `?v=${this.selectedPlanID}&u=${item.unit}&t=${item.key}`,
      },
    });
  }

  // public onMoveRTFReport(e: any) {
  //   const item = e.itemData;
  //   if (!item) return;

  //   EventBus.fire("open-popup", {
  //     params: {
  //       key: "rtf-report",
  //       params: `?v=${this.selectedPlanID}&u=${item.unit}&t=${item.key}`,
  //     },
  //   });
  // }
}
</script>
