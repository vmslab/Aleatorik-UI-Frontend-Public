<template>
  <div>
    <moz-controller :showFilter="filter">
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
        <label>PLAN_ID</label>
        <DropDownGrid
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
        />
      </div>
      <div v-show="selectedPlanID != selectedSourceID" slot="filter">
        <i style="position: relative; opacity: 0.4" class="mozart-icons m-129_icon-arrow-left"></i>
        <i style="position: relative; opacity: 0.7; left: -5px" class="mozart-icons m-129_icon-arrow-left"></i>
        <i style="position: relative; left: -10px" class="mozart-icons m-129_icon-arrow-left"></i>
        <DxTextBox class="read-only-text-box" v-model="selectedSourceID" :read-only="true" />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Optimization Setting') }"
          class="moz-default-button"
          icon="setting"
          type="default"
          :focusStateEnabled="false"
          :disabled="!selectedPlanItem || selectedPlanItem.STATUS !== 'DONE'"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Optimization Start') }"
          class="moz-default-button"
          icon="chart"
          type="default"
          :focusStateEnabled="false"
          :disabled="!selectedPlanItem || selectedPlanItem.STATUS !== 'DONE'"
          @click="runOptimization"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('Show Factors') }"
          class="moz-default-button"
          text="Show Factors"
          type="default"
          :focusStateEnabled="false"
          @click="showFactorPopup = !showFactorPopup"
        />
      </div>
      <i
        v-if="filter"
        slot="title"
        v-tooltip="{ text: $t('HideFilter') }"
        @click="filter = !filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        slot="title"
        v-tooltip="{ text: $t('ShowFilter') }"
        @click="filter = !filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <moz-split-box
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :boxes="[
          { type: 'fix', size: 560 },
          { type: 'rate', size: 1, minWidth: 700 },
        ]"
        horizontal
      >
        <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
          <div class="dx-card" :style="`width:${parentsWidth}px; height:${parentsHeight}px;`">
            <div class="dx-card-title">
              <div class="dx-card-title-text">{{ $t("RTF Ratio") }}</div>
              <div class="spacer"></div>
            </div>
            <div style="padding: 24px">
              <moz-split-box
                :width="parentsWidth"
                :height="contentsHeight"
                :boxes="[
                  { type: 'fix', size: 400 },
                  { type: 'rate', size: 1, minHeight: 360 },
                ]"
              >
                <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
                  <div class="flex">
                    <div
                      :style="`width: ${parentsWidth / 2 - 40}px; height: ${parentsHeight / 2}px;`"
                      v-if="firstEpochMu"
                    >
                      <div :style="`height: ${parentsWidth / 2}px`">
                        <moz-chart
                          className="plan-dashboard-rtf-pie"
                          :data="[
                            {
                              key: 0,
                              rtf: fountainIntl.format((firstEpochMu.OnTime + firstEpochMu.Late) * 100),
                              short: fountainIntl.format(firstEpochMu.Late * 100),
                            },
                          ]"
                          :isTooltip="false"
                          :margin="{ top: 20, right: 60, left: 60, bottom: 80 }"
                          :pieInnerRadius="parentsWidth / 4 - 70"
                          :pieOuterRadius="parentsWidth / 4 - 40"
                          :colorDic="{
                            rtf: '#29beccb3',
                            short: '#e05a69b3',
                          }"
                          pieTooltipType="mouse"
                        >
                          <moz-series field="rtf" caption="RTF" type="pie" />
                          <moz-series field="short" caption="Short" type="pie" />
                          <moz-text
                            text="
                      <div
                        class='plan-dashboard-title-bar'
                        style='background-color:#29becc'
                      ></div>
                      <div class='plan-dashboard-title-text'>RTF Ratio</div>
                      "
                            type="html"
                            location="center"
                            className="flex-center plan-dashboard-title"
                            :margin="{ bottom: 34 }"
                          />
                          <moz-text
                            :text="
                              !firstEpochMu.OnTime
                                ? '-'
                                : fountainIntl.format((firstEpochMu.OnTime + firstEpochMu.Late) * 100) + '%'
                            "
                            location="center"
                            className="plan-dashboard-ratio-text"
                          />
                          <moz-text :text="$t('BeforeLearning')" location="top" className="optimization-chart-text" />
                          <moz-text
                            :text="!firstEpochMu.LateScore ? '-' : fountainIntl.format(firstEpochMu.LateScore)"
                            location="center"
                            className="plan-dashboard-count-text"
                            :margin="{ top: 34 }"
                          />
                        </moz-chart>
                      </div>

                      <div class="flex flex-sa">
                        <div style="padding: 0px 12px">
                          <div style="font-weight: bold; white-space: nowrap">On-Time Delivery</div>
                          <div class="rtf-percent">
                            {{ !firstEpochMu.OnTime ? "-" : fountainIntl.format(firstEpochMu.OnTime * 100) }}%
                          </div>
                          <div class="rtf-text">
                            {{ !firstEpochMu.OnTime ? "-" : fountainIntl.format(firstEpochMu.OnScore) }}
                          </div>
                        </div>
                        <div style="padding: 0px 12px">
                          <div style="font-weight: bold; white-space: nowrap">Late Delivery</div>
                          <div class="rtf-percent">
                            {{ !firstEpochMu.OnTime ? "-" : fountainIntl.format(firstEpochMu.Late * 100) }}%
                          </div>
                          <div class="rtf-text">
                            {{
                              !firstEpochMu.OnTime
                                ? "-"
                                : fountainIntl.format(firstEpochMu.LateScore - firstEpochMu.OnScore)
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-sa top-padding">
                        <div class="flex"><span class="rtf-rect"></span><span class="rect-text">RTF</span></div>
                        <div class="flex"><span class="short-rect"></span><span class="rect-text">Short</span></div>
                      </div>
                    </div>

                    <div
                      class="mozart-icons m-131_icon-arrow-right right-arrow"
                      :style="`margin-top:${parentsWidth / 4}px`"
                    ></div>

                    <div
                      :style="`width: ${parentsWidth / 2 - 40}px; height: ${contentsHeight / 2}px;`"
                      v-if="lastEpochBest"
                    >
                      <div :style="`height: ${parentsWidth / 2}px;`">
                        <moz-chart
                          className="plan-dashboard-rtf-pie"
                          :data="[
                            {
                              key: 0,
                              rtf: ((lastEpochBest.OnTime + lastEpochBest.Late) * 100).toFixed(2),
                              short: (lastEpochBest.Late * 100).toFixed(2),
                            },
                          ]"
                          :isTooltip="false"
                          :margin="{ top: 20, right: 60, left: 60, bottom: 80 }"
                          :pieInnerRadius="parentsWidth / 4 - 70"
                          :pieOuterRadius="parentsWidth / 4 - 40"
                          :colorDic="rtfColorDic"
                          pieTooltipType="mouse"
                        >
                          <moz-series field="rtf" caption="RTF" type="pie" />
                          <moz-series field="short" caption="Short" type="pie" />

                          <moz-text
                            text="
                      <div
                        class='plan-dashboard-title-bar'
                        style='background-color:#29becc'
                      ></div>
                      <div class='plan-dashboard-title-text'>RTF Ratio</div>
                      "
                            type="html"
                            location="center"
                            className="flex-center plan-dashboard-title"
                            :margin="{ bottom: 34 }"
                          />
                          <moz-text
                            :text="
                              !lastEpochBest.OnTime
                                ? '-'
                                : fountainIntl.format((lastEpochBest.OnTime + lastEpochBest.Late) * 100) + '%'
                            "
                            location="center"
                            className="plan-dashboard-ratio-text"
                          />
                          <moz-text :text="$t('AfterLearning')" location="top" className="optimization-chart-text" />
                          <moz-text
                            :text="!lastEpochBest.LateScore ? '-' : fountainIntl.format(lastEpochBest.LateScore)"
                            location="center"
                            className="plan-dashboard-count-text"
                            :margin="{ top: 34 }"
                          />
                        </moz-chart>
                      </div>

                      <div class="flex flex-sa">
                        <div style="padding: 0px 12px">
                          <div style="font-weight: bold; white-space: nowrap">On-Time Delivery</div>
                          <div class="rtf-percent">
                            {{ !lastEpochBest.OnTime ? "-" : fountainIntl.format(lastEpochBest.OnTime * 100) }}%
                          </div>
                          <div class="rtf-text">
                            {{ !lastEpochBest.OnTime ? "-" : fountainIntl.format(lastEpochBest.OnScore) }}
                          </div>
                        </div>
                        <div style="padding: 0px 12px">
                          <div style="font-weight: bold; white-space: nowrap">Late Delivery</div>
                          <div class="rtf-percent">
                            {{ !lastEpochBest.OnTime ? "-" : fountainIntl.format(lastEpochBest.Late * 100) }}%
                          </div>
                          <div class="rtf-text">
                            {{
                              !lastEpochBest.OnTime
                                ? "-"
                                : fountainIntl.format(lastEpochBest.LateScore - lastEpochBest.OnScore)
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="flex flex-sa top-padding">
                        <div class="flex"><span class="rtf-rect"></span><span class="rect-text">RTF</span></div>
                        <div class="flex"><span class="short-rect"></span><span class="rect-text">Short</span></div>
                      </div>
                    </div>
                  </div>
                </template>
                <template slot="box2" slot-scope="{ contentsHeight }">
                  <div :style="`height:${contentsHeight}px`">
                    <div style="height: 14px"></div>
                    <div class="title-bar">{{ $t("OntimeChange") }}</div>
                    <div style="height: 125px">
                      <moz-chart
                        :data="[
                          { key: '202201', YEAR: yearM['1'], BEST: bestM['1'] },
                          { key: '202202', YEAR: yearM['2'], BEST: bestM['2'] },
                          { key: '202203', YEAR: yearM['3'], BEST: bestM['3'] },
                        ]"
                        :showZero="false"
                        :margin="{ top: 10, right: 20, left: 30, bottom: 30 }"
                        :colorDic="rtfColorDic"
                        :isCollisionTextRerender="false"
                      >
                        <moz-axis
                          name="X"
                          caption="년월"
                          type="key"
                          dataType="string"
                          direction="horizontal"
                          location="bottom"
                        ></moz-axis>
                        <moz-axis
                          name="Y"
                          type="series-aggrigation"
                          dataType="number"
                          direction="vertical"
                          location="left"
                          :showBar="false"
                          :fixedMinValue="0"
                          :outerPadding="0.2"
                          :tickCount="5"
                          :showGrid="true"
                        ></moz-axis>
                        <moz-series
                          field="YEAR"
                          caption="Mu"
                          type="bar"
                          keyAxis="X"
                          seriesAxis="Y"
                          :barMaxSize="88"
                          :barInnerPadding="4"
                        ></moz-series>
                        <moz-series
                          field="BEST"
                          caption="Best"
                          type="bar"
                          keyAxis="X"
                          seriesAxis="Y"
                          :barMaxSize="88"
                          :barInnerPadding="4"
                        ></moz-series>
                        <moz-text type="label" position="start"></moz-text>
                      </moz-chart>
                    </div>
                    <div class="title-bar short">{{ $t("ShortChange") }}</div>
                    <div style="height: 125px">
                      <moz-chart
                        :data="[
                          { key: '202201', YEAR: shortM['1'], BEST: shortBest['1'] },
                          { key: '202202', YEAR: shortM['2'], BEST: shortBest['2'] },
                          { key: '202203', YEAR: shortM['3'], BEST: shortBest['3'] },
                        ]"
                        :showZero="false"
                        :margin="{ top: 10, right: 20, left: 30, bottom: 30 }"
                        :colorDic="{ BEST: '#e05a69', YEAR: '#e05a69b3' }"
                      >
                        <moz-axis
                          name="X"
                          caption="년월"
                          type="key"
                          dataType="string"
                          direction="horizontal"
                          location="bottom"
                        ></moz-axis>
                        <moz-axis
                          name="Y"
                          type="series-aggrigation"
                          dataType="number"
                          direction="vertical"
                          location="left"
                          :showBar="false"
                          :fixedMinValue="0"
                          :outerPadding="0.2"
                          :tickCount="5"
                          :showGrid="true"
                        ></moz-axis>
                        <moz-series
                          field="YEAR"
                          caption="Mu"
                          type="bar"
                          keyAxis="X"
                          seriesAxis="Y"
                          :barInnerPadding="4"
                          :barMaxSize="88"
                        ></moz-series>
                        <moz-series
                          field="BEST"
                          caption="Best"
                          type="bar"
                          keyAxis="X"
                          seriesAxis="Y"
                          :barInnerPadding="4"
                          :barMaxSize="88"
                        ></moz-series>
                        <moz-text type="label" position="start"></moz-text>
                      </moz-chart>
                    </div>
                  </div>
                </template>
              </moz-split-box>
            </div>
          </div>
        </template>
        <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
          <div class="dx-card" :style="`width:${parentsWidth}px; height:${parentsHeight}px;`">
            <div class="dx-card-title">
              <div class="dx-card-title-text">{{ $t("Optimization Dashboard") }}</div>
              <div class="spacer"></div>
            </div>
            <div class="flex dx-card-text" :style="`width:${parentsWidth}px;height:${parentsHeight - 340}px;`">
              <div style="position: absolute">
                <div class="target-kpi">
                  <div>
                    <div class="target-name">Target KPI</div>
                    <div class="target-percent">{{ targetKpi }}%</div>
                    <div class="target-text">{{ targetKpiValue }}</div>
                  </div>
                  <div style="display: flex; align-items: end">
                    <svg
                      v-if="targetKpi > 0"
                      class="kpi-arrow"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="72"
                      viewBox="0 0 9 72"
                    >
                      <path
                        data-name="패스 1064"
                        d="M0 72h4V0l-9 20.571h5z"
                        transform="translate(5)"
                        style="fill: #0088f4"
                      />
                    </svg>
                    <svg
                      v-if="targetKpi < 0"
                      class="kpi-arrow"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="78"
                      viewBox="0 0 9 78"
                    >
                      <path d="M0 0h4v78l-9-22.286h5z" transform="translate(5)" style="fill: #e05a69" />
                    </svg>
                  </div>
                </div>
              </div>
              <moz-chart
                v-if="kpiChartData && kpiChartData.length > 0"
                :width="parentsWidth"
                class="thin-line-chart"
                :data="kpiChartData"
                :margin="{ top: 10, right: 20, left: 180, bottom: 40 }"
                :show-zero="false"
              >
                <moz-axis
                  name="X"
                  :caption="$t('EPOCH')"
                  type="key"
                  dataType="number"
                  direction="horizontal"
                  location="bottom"
                  :outerPadding="0.03"
                  :setKeyTickValues="onKeyTickValuesForFactor"
                ></moz-axis>
                <moz-axis
                  name="Y"
                  type="series"
                  dataType="number"
                  direction="vertical"
                  location="left"
                  :showGrid="true"
                  :outerPadding="0.1"
                ></moz-axis>
                <moz-series
                  field="BaseModel_Score"
                  type="area"
                  keyAxis="X"
                  seriesAxis="Y"
                  :areaAffectedPrev="true"
                  :areaSize="60"
                  :onlySeries="true"
                ></moz-series>
                <moz-series
                  field="BaseModel_Score"
                  caption="Base Line"
                  type="line"
                  keyAxis="X"
                  seriesAxis="Y"
                  :lineCircle="false"
                  :lineInnerCircle="false"
                ></moz-series>
                <moz-series
                  field="TotalBest_Score"
                  caption="Total Best"
                  type="line"
                  keyAxis="X"
                  seriesAxis="Y"
                  :lineCircle="false"
                  :lineInnerCircle="false"
                  :lineDashArray="[6, 5]"
                ></moz-series>
                <moz-series
                  field="Mu_Score"
                  caption="Iteration Main"
                  type="line"
                  keyAxis="X"
                  seriesAxis="Y"
                  :lineCircle="false"
                  :lineInnerCircle="false"
                ></moz-series>
                <moz-series
                  field="MovAvg_Score"
                  caption="Moving Average"
                  type="line"
                  keyAxis="X"
                  seriesAxis="Y"
                  :lineCircle="false"
                  :lineInnerCircle="false"
                  :curved="true"
                ></moz-series>
                <moz-text
                  type="legend"
                  location="left"
                  position="end"
                  :legendCol="1"
                  :legendRow="4"
                  legendShape="series"
                  :margin="{ bottom: 50, right: 80 }"
                ></moz-text>
              </moz-chart>
            </div>
            <div class="flex" style="flex-wrap: wrap; border-top: 1px solid var(--color-border3)">
              <div
                class="moz-simple-padding"
                :style="`
                  width: ${parentsWidth / 2 - 1}px;
                  height: 150px;
                  display: flex;
                  ${idx % 2 === 1 ? '' : 'border-right: 1px solid var(--color-border3)'};
                  ${idx >= 2 ? '' : 'border-bottom: 1px solid var(--color-border3)'}`"
                v-for="(item, idx) in kpiDataArray"
                v-bind:key="item.name"
              >
                <div class="target-kpi">
                  <div>
                    <div class="target-name">{{ item.name }}</div>
                    <div class="target-percent">{{ item.percent }}%</div>
                    <div class="target-text">{{ item.value }}</div>
                  </div>
                  <div style="display: flex; align-items: end">
                    <svg
                      v-if="item.percent < 0"
                      class="kpi-arrow"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="78"
                      viewBox="0 0 9 78"
                    >
                      <path d="M0 0h4v78l-9-22.286h5z" transform="translate(5)" style="fill: #e05a69" />
                    </svg>
                    <svg
                      v-if="item.percent > 0"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9"
                      height="72"
                      viewBox="0 0 9 72"
                    >
                      <path d="M0 72h4V0l-9 20.571h5z" transform="translate(5)" style="fill: #29becc" />
                    </svg>
                  </div>
                </div>
                <div :style="`width:${parentsWidth / 2 - 130}px`">
                  <moz-chart
                    class="thin-line-chart"
                    :height="130"
                    :data="item.data"
                    :margin="{ top: 0, bottom: 0 }"
                    :colorDic="{ value: item.percent > 0 ? '#29becc' : '#e05a69' }"
                  >
                    <moz-axis
                      name="X"
                      :caption="$t('EPOCH')"
                      type="key"
                      dataType="number"
                      direction="horizontal"
                      location="bottom"
                      :outerPadding="0.1"
                    />
                    <moz-axis
                      name="Y"
                      type="series"
                      data-type="number"
                      direction="vertical"
                      location="left"
                      :outerPadding="0.4"
                      :tickCount="5"
                      :showGrid="true"
                      :showBar="false"
                    />
                    <moz-series
                      field="value"
                      caption="Value"
                      keyAxis="X"
                      seriesAxis="Y"
                      type="line"
                      :lineCircle="false"
                    />
                  </moz-chart>
                </div>
              </div>
            </div>
          </div>
        </template>
      </moz-split-box>
    </div>
    <RightDrawer title="Factor Report" v-model="showFactorPopup" :closeOnOutsideClick="true">
      <template><FactorView :data="factorChartData" :height="contentsHeight"></FactorView></template>
    </RightDrawer>

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
import { MainModule } from "@/store/modules/mainStore";
import { createStoreConfig, ActionLoadOptions, showConfirm, showAlert } from "mozart-component-wijmo";
import { GetTableRemote, GetTableOption } from "@/api/mainService";
import { OptimizationPlan } from "@/api/mainService";

import { EventBus } from "mozart-common";

import { DxTextBox } from "devextreme-vue/text-box";
import { DxButton } from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import DropDownGrid from "@/components/DropDownGrid.vue";
import RightDrawer from "@/components/RightDrawer.vue";
import FactorView from "./FactorView.vue";

import { getVersionNo, setVersionNo, getVersionDatasByExecution } from "@/utils/commonUtils";

@Component({
  components: { DxTextBox, DxButton, DxLoadPanel, DropDownGrid, RightDrawer, FactorView },
})
export default class OptimizationManager extends Vue {
  public filter: boolean = true;
  public selectedPlanID: string = "";
  public colorDic: Record<string, any> = {};
  public loadingVisible: boolean = false;
  public fountainIntl = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

  public showFactorPopup: boolean = false;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];

  public selectedPlanItem: any = {};
  public selectedSourceID: string = "";

  public epochList: any[] = [];
  public epochFirst: number = 2;
  public epochLast: number = 2;

  public rtfData: any[] = [];
  public eduRtfData: any[] = [];
  public kpiData: any[] = [];
  public bestData: any[] = [];
  public factorData: any[] = [];
  public factorChartData: any[] = [];
  public kpiChartData: any[] = [];
  public bestChartData: any[] = [];

  public rtfColorDic: Record<string, string> = {
    rtf: "#29becc",
    short: "var(--color-error)",
    YEAR: "#8fceceb3",
    BEST: "#8fcece",
  };

  constructor() {
    super();
  }

  public get firstEpoch() {
    const on_m1 = this.rtfData.filter(t => t.KPI_NAME === "ON_M1")[0]?.KPI_VALUE;
    const on_m2 = this.rtfData.filter(t => t.KPI_NAME === "ON_M2")[0]?.KPI_VALUE;
    const on_m3 = this.rtfData.filter(t => t.KPI_NAME === "ON_M3")[0]?.KPI_VALUE;
    const short_m1 = this.rtfData.filter(t => t.KPI_NAME === "SHORT_M1")[0]?.KPI_VALUE;
    const short_m2 = this.rtfData.filter(t => t.KPI_NAME === "SHORT_M2")[0]?.KPI_VALUE;
    const short_m3 = this.rtfData.filter(t => t.KPI_NAME === "SHORT_M3")[0]?.KPI_VALUE;
    const score = this.rtfData.filter(t => t.KPI_NAME === "Score")[0]?.KPI_VALUE;
    const setup = this.rtfData.filter(t => t.KPI_NAME === "Setup")[0]?.KPI_VALUE;
    const onRtf = this.rtfData.filter(t => t.KPI_NAME === "ON_RTF")[0]?.KPI_VALUE;
    const lateRtf = this.rtfData.filter(t => t.KPI_NAME === "LATE_RTF")[0]?.KPI_VALUE;
    const short = this.rtfData.filter(t => t.KPI_NAME === "SHORT")[0]?.KPI_VALUE;

    return {
      Mu_ON_M1: on_m1,
      Mu_ON_M2: on_m2,
      Mu_ON_M3: on_m3,
      Mu_SHORT_M1: short_m1,
      Mu_SHORT_M2: short_m2,
      Mu_SHORT_M3: short_m3,
      Mu_Score: score,
      SETUP: setup,
      ON_RTF: onRtf,
      LATE_RTF: lateRtf,
      SHORT: short,
    };
  }

  public get lastEpoch() {
    const on_m1 = this.eduRtfData.filter(t => t.KPI_NAME === "ON_M1")[0]?.KPI_VALUE;
    const on_m2 = this.eduRtfData.filter(t => t.KPI_NAME === "ON_M2")[0]?.KPI_VALUE;
    const on_m3 = this.eduRtfData.filter(t => t.KPI_NAME === "ON_M3")[0]?.KPI_VALUE;
    const short_m1 = this.eduRtfData.filter(t => t.KPI_NAME === "SHORT_M1")[0]?.KPI_VALUE;
    const short_m2 = this.eduRtfData.filter(t => t.KPI_NAME === "SHORT_M2")[0]?.KPI_VALUE;
    const short_m3 = this.eduRtfData.filter(t => t.KPI_NAME === "SHORT_M3")[0]?.KPI_VALUE;
    const score = this.eduRtfData.filter(t => t.KPI_NAME === "Score")[0]?.KPI_VALUE;
    const setup = this.eduRtfData.filter(t => t.KPI_NAME === "Setup")[0]?.KPI_VALUE;
    const onRtf = this.eduRtfData.filter(t => t.KPI_NAME === "ON_RTF")[0]?.KPI_VALUE;
    const lateRtf = this.eduRtfData.filter(t => t.KPI_NAME === "LATE_RTF")[0]?.KPI_VALUE;
    const short = this.eduRtfData.filter(t => t.KPI_NAME === "SHORT")[0]?.KPI_VALUE;

    return {
      TotalBest_ON_M1: on_m1,
      TotalBest_ON_M2: on_m2,
      TotalBest_ON_M3: on_m3,
      TotalBest_SHORT_M1: short_m1,
      TotalBest_SHORT_M2: short_m2,
      TotalBest_SHORT_M3: short_m3,
      TotalBest_Score: score,
      TotalBest_Setup: setup,
      TotalBest_ON_RTF: onRtf,
      TotalBest_LATE_RTF: lateRtf,
      TotalBest_SHORT: short,
    };
  }

  public get firstEpochMu() {
    if (!this.rtfData) return { OnTime: 0, Late: 0, OnScore: 0, LateScore: 0 };
    const onTime = this.rtfData.filter(t => t.KPI_NAME === "ON_RATIO")[0];
    const onTimeScore = this.rtfData.filter(t => t.KPI_NAME === "ON_RTF")[0];
    const late = this.rtfData.filter(t => t.KPI_NAME === "LATE_RATIO")[0];
    const lateScore = this.rtfData.filter(t => t.KPI_NAME === "LATE_RTF")[0];

    return {
      OnTime: onTime?.KPI_VALUE,
      Late: late?.KPI_VALUE,
      OnScore: onTimeScore?.KPI_VALUE,
      LateScore: lateScore?.KPI_VALUE,
    };
  }

  public get lastEpochBest() {
    if (!this.eduRtfData) return { OnTime: 0, Late: 0, OnScore: 0, LateScore: 0 };
    const onTime = this.eduRtfData.filter(t => t.KPI_NAME === "ON_RATIO")[0];
    const onTimeScore = this.eduRtfData.filter(t => t.KPI_NAME === "ON_RTF")[0];
    const late = this.eduRtfData.filter(t => t.KPI_NAME === "LATE_RATIO")[0];
    const lateScore = this.eduRtfData.filter(t => t.KPI_NAME === "LATE_RTF")[0];
    return {
      OnTime: onTime?.KPI_VALUE,
      Late: late?.KPI_VALUE,
      OnScore: onTimeScore?.KPI_VALUE,
      LateScore: lateScore?.KPI_VALUE,
    };
  }

  public get yearM() {
    if (!this.firstEpoch) return { 1: 0, 2: 0, 3: 0 };
    return {
      1: this.fountainIntl.format(this.firstEpoch.Mu_ON_M1 / 1000000),
      2: this.fountainIntl.format(this.firstEpoch.Mu_ON_M2 / 1000000),
      3: this.fountainIntl.format(this.firstEpoch.Mu_ON_M3 / 1000000),
    };
  }

  public get bestM() {
    if (!this.lastEpoch) return { 1: 0, 2: 0, 3: 0 };
    return {
      1: this.fountainIntl.format(this.lastEpoch.TotalBest_ON_M1 / 1000000),
      2: this.fountainIntl.format(this.lastEpoch.TotalBest_ON_M2 / 1000000),
      3: this.fountainIntl.format(this.lastEpoch.TotalBest_ON_M3 / 1000000),
    };
  }

  public get shortM() {
    if (!this.firstEpoch) return { 1: 0, 2: 0, 3: 0 };
    return {
      1: this.fountainIntl.format(this.firstEpoch.Mu_SHORT_M1 / 1000000),
      2: this.fountainIntl.format(this.firstEpoch.Mu_SHORT_M2 / 1000000),
      3: this.fountainIntl.format(this.firstEpoch.Mu_SHORT_M3 / 1000000),
    };
  }

  public get shortBest() {
    if (!this.lastEpoch) return { 1: 0, 2: 0, 3: 0 };
    return {
      1: this.fountainIntl.format(this.lastEpoch.TotalBest_SHORT_M1 / 1000000),
      2: this.fountainIntl.format(this.lastEpoch.TotalBest_SHORT_M2 / 1000000),
      3: this.fountainIntl.format(this.lastEpoch.TotalBest_SHORT_M3 / 1000000),
    };
  }

  public get targetKpi() {
    if (!this.lastEpoch) return "-";
    return this.getDifference(this.lastEpoch.TotalBest_Score, this.firstEpoch?.Mu_Score);
  }

  public get contentsHeight() {
    return (
      +getComputedStyle(document.documentElement)
        .getPropertyValue("--size-content-height-outer-controller")
        .replace("px", "") -
      +getComputedStyle(document.documentElement).getPropertyValue("--size-card-title-height").replace("px", "")
    );
  }

  public getDifference(a: number, b: number) {
    if (b === 0) return this.fountainIntl.format(a);
    const diff = ((a - b) / b) * 100;
    if (!diff) return 0;
    return this.fountainIntl.format(diff);
  }

  public get targetKpiValue() {
    if (!this.lastEpoch) return "-";
    return this.fountainIntl.format(this.lastEpoch.TotalBest_Score);
  }

  public get kpiDataArray() {
    if (!this.lastEpoch || !this.firstEpoch) return [];
    return [
      {
        name: "Total On-Time RTF",
        percent: this.getDifference(this.lastEpoch.TotalBest_ON_RTF, this.firstEpoch.ON_RTF),
        value: this.lastEpoch.TotalBest_ON_RTF,
        data: this.bestChartData
          .filter(t => t.key > 1)
          .map(t => {
            return { key: t.key, value: t.TotalBest_ON_RTF };
          }),
      },
      {
        name: "Total Lateness RTF",
        percent: this.getDifference(this.lastEpoch.TotalBest_LATE_RTF, this.firstEpoch.LATE_RTF),
        value: this.lastEpoch.TotalBest_LATE_RTF,
        data: this.bestChartData
          .filter(t => t.key > 1)
          .map(t => {
            return { key: t.key, value: t.TotalBest_LATE_RTF };
          }),
      },
      {
        name: "Total Setup",
        percent: this.getDifference(this.lastEpoch.TotalBest_Setup, this.firstEpoch.SETUP),
        value: this.lastEpoch.TotalBest_Setup,
        data: this.bestChartData
          .filter(t => t.key > 1)
          .map(t => {
            return { key: t.key, value: t.TotalBest_Setup };
          }),
      },
      {
        name: "Total Short",
        percent: this.getDifference(this.lastEpoch.TotalBest_SHORT, this.firstEpoch.SHORT),
        value: this.lastEpoch.TotalBest_SHORT,
        data: this.bestChartData
          .filter(t => t.key > 1)
          .map(t => {
            return { key: t.key, value: t.TotalBest_SHORT };
          }),
      },
    ];
  }

  public onKeyTickValuesForFactor(keys: any[]) {
    let result = [];
    const unit = keys.length / 10;
    result.push(keys[0]);
    for (var i = 1; ; i++) {
      const num = i * unit;
      if (num > keys.length + 1) break;
      result.push(num);
    }
    return result;
  }

  public onKeyTickValues(keys: any[]) {
    let result = [];
    for (var i = 0; ; i++) {
      if (keys.length + 1 < i * 100) break;
      result.push(i * 100);
    }
    return result;
  }

  public get kpiNames(): string[] {
    return [...new Set(this.kpiData.map(t => `${t.RECORD_TYPE}_${t.KPI_NAME}`))];
  }

  public get bestKpiNames(): string[] {
    return [...new Set(this.bestData.map(t => `${t.RECORD_TYPE}_${t.KPI_NAME}`))];
  }

  public async mounted() {
    // this.loadingVisible = true;
    this.planVersionItems = await getVersionDatasByExecution();

    const urlParams = new URLSearchParams(window.location.search);
    let version = urlParams.get("v");

    if (!version) {
      version = getVersionNo() || this.selectedPlanID;
    }

    // await this.setKPIChart();
    // await this.setFactorChart();

    await this.setPlanIdControls(version);

    this.onRefreshData();
    // this.loadingVisible = false;
  }

  public async setPlanIdControls(planId: string | null) {
    if (!planId || !this.planVersionItems) return;
    this.selectedPlanItem = this.planVersionItems.find((item: any) => item.PLAN_ID === planId);
    if (!this.selectedPlanItem) {
      //await showAlert({ message: "Not Found Version Data !", type: "error", title: "Error" });
      return;
    }
    this.selectedPlanID = planId;
    this.selectedSourceID = this.selectedPlanItem.SOURCE_ID || planId;
  }

  public generateChartData(data: any[], names: string[]) {
    let result: any[] = [];
    data.forEach((t: any) => {
      if (t.EPOCH === 1) return;
      var item: any = { key: t.EPOCH };

      const existItem = result.find(x => x.key === t.EPOCH);
      if (!existItem) {
        const comName = `${t.RECORD_TYPE}_${t.KPI_NAME}`;

        names.forEach(name => {
          item[name] = 0;
          if (comName === name) item[name] += t.KPI_VALUE;
        });
        item.BaseModel_Score = this.firstEpoch.Mu_Score;
        result.push(item);
      } else {
        names.forEach(name => {
          const comName = `${t.RECORD_TYPE}_${t.KPI_NAME}`;
          if (comName === name) existItem[name] += t.KPI_VALUE;
        });
      }
    });

    return result;
  }

  public generateFactorChartData(data: any[]) {
    data.forEach((t: any) => {
      t.category = t.key.startsWith("Stage01") ? "Demands" : "Rules";
      t.diff = this.fountainIntl.format(t.end - t.first);
    });
    // data.forEach((t: any) => {
    //   const existItem = result.find(x => x.key === t.LEARN_KEY);
    //   if (!existItem) {
    //     const learn = data.filter(s => s.LEARN_KEY === t.LEARN_KEY);

    //     var item: any = {
    //       key: t.LEARN_KEY,
    //       first: learn.find(t => t.EPOCH === this.epochFirst)?.LEARN_VALUES,
    //       end: learn.find(t => t.EPOCH === this.epochLast)?.LEARN_VALUES,
    //       diff: this.fountainIntl.format(
    //         learn.find(t => t.EPOCH === this.epochLast)?.LEARN_VALUES -
    //           learn.find(t => t.EPOCH === this.epochFirst)?.LEARN_VALUES,
    //       ),
    //     };
    //     result.push(item);
    //   }
    // });
    return data;
  }

  public onVersionChanged(e: any) {
    setVersionNo(e.PLAN_ID);
    this.setPlanIdControls(e.PLAN_ID);
  }

  public async setKPIChart() {
    const rtfResult = await GetTableOption("LEARN_KPI2", {
      filter: [["PLAN_ID", "=", this.selectedPlanID], "and", ["RECORD_TYPE", "=", "BaseModel"]],
      select: ["EPOCH", "RECORD_TYPE", "KPI_NAME", "KPI_VALUE"],
    });
    this.rtfData = JSON.parse(rtfResult.data);

    const kpiResult = await GetTableOption("LEARN_KPI2", {
      filter: [["PLAN_ID", "=", this.selectedPlanID], "and", ["KPI_NAME", "=", "Score"]],
      select: ["EPOCH", "RECORD_TYPE", "KPI_NAME", "KPI_VALUE"],
    });
    this.kpiData = JSON.parse(kpiResult.data);
    this.epochList = [
      ...new Set(
        this.kpiData
          .map(t => {
            return t.EPOCH;
          })
          .sort((a: number, b: number) => {
            if (a > b) return 1;
            else if (a < b) return -1;
            else return 0;
          }),
      ),
    ];
    if (this.epochList.length > 0) {
      this.epochFirst = this.epochList.length > 1 ? this.epochList[1] : this.epochList[0];
      this.epochLast = this.epochList[this.epochList.length - 1];
    }
    this.kpiChartData = this.generateChartData(this.kpiData, this.kpiNames);

    const eduRtfResult = await GetTableOption("LEARN_KPI2", {
      filter: [
        ["PLAN_ID", "=", this.selectedPlanID],
        "and",
        ["RECORD_TYPE", "=", "TotalBest"],
        "and",
        ["EPOCH", "=", this.epochList[this.epochList.length - 1]],
      ],
      select: ["EPOCH", "RECORD_TYPE", "KPI_NAME", "KPI_VALUE"],
    });
    this.eduRtfData = JSON.parse(eduRtfResult.data);

    const bestResult = await GetTableOption("LEARN_KPI2", {
      filter: [["PLAN_ID", "=", this.selectedPlanID], "and", ["RECORD_TYPE", "=", "TotalBest"]],
      select: ["EPOCH", "RECORD_TYPE", "KPI_NAME", "KPI_VALUE"],
    });
    this.bestData = JSON.parse(bestResult.data);
    this.bestChartData = this.generateChartData(this.bestData, this.bestKpiNames);
  }

  public async setFactorChart() {
    const factorResult = await GetTableOption("LEARN_FACTOR2", {
      tables: [
        {
          name: "LEARN_FACTOR2",
          select: ["LEARN_KEY AS key", "LEARN_VALUES as first"],
        },
        {
          name: "LEARN_BESTFACTORS",
          select: ["LEARN_VALUES AS end"],
          keys: [
            ["LEARN_FACTOR2.PLAN_ID", "=", "LEARN_BESTFACTORS.PLAN_ID"],
            "and",
            ["LEARN_FACTOR2.LEARN_KEY", "=", "LEARN_BESTFACTORS.LEARN_KEY"],
          ],
          type: "inner join",
        },
      ],
      filter: [
        ["LEARN_FACTOR2.PLAN_ID", "=", this.selectedPlanID],
        "and",
        ["LEARN_FACTOR2.EPOCH", "=", this.epochFirst],
      ],
    });
    this.factorData = JSON.parse(factorResult.data);
    this.factorChartData = this.generateFactorChartData(this.factorData);
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      await this.setKPIChart();
      await this.setFactorChart();
    } finally {
      this.loadingVisible = false;
    }
  }

  public async runOptimization() {
    //if (!this.selectedPlanID) return;

    const result = await showConfirm({
      message: `${this.$t(`OptimizeMessage`, [this.selectedSourceID])}`,
      // type: `info`,
      // title: `Execute`,
      // message: `Are you sure you want to <b>Execute</b> ${
      //   values.length > 1 ? "these records" : "this record"
      // }?`,
    });

    if (!result) return;

    this.optimizationService();
  }

  public async optimizationService() {
    await this.optimizationFunc();

    EventBus.fire("push-route-by-key", {
      params: {
        key: "at-plan-view",
      },
    });
  }

  public async optimizationFunc() {
    this.loadingVisible = true;

    try {
      const result = await OptimizationPlan(this.selectedSourceID);
      return JSON.parse(result.data);
    } finally {
      this.loadingVisible = false;
    }
  }
}
</script>
<style lang="scss" scoped>
.flex-sa {
  justify-content: space-around;
  padding: 0px 12px;
}
.rtf-rect {
  background-color: #29becc;
  width: 16px;
  height: 16px;
  display: inline-block;
}
.short-rect {
  background-color: #e05a69;
  width: 16px;
  height: 16px;
  display: inline-block;
}
.top-padding {
  padding-top: 14px;
}
.rect-text {
  padding-left: 10px;
  font-weight: bold;
}
.rtf-percent {
  font-weight: bold;
  font-size: 24px;
  color: var(--color-font1);
}
.rtf-text {
  font-size: 14px;
  color: var(--color-font3);
}

.target-kpi {
  display: flex;
  width: 130px;
  height: 100px;
  //padding: 8px 12px;
  border-radius: 5px;
  justify-content: space-between;
}
.target-name {
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
}
.target-percent {
  display: flex;
  justify-content: space-between;
  color: var(--color-font1);
  font-weight: bold;
  font-size: 24px;
}
.target-text {
  display: flex;
  font-size: 14px;
}

.title-bar {
  &::before {
    content: "　";
    width: 5px;
    display: inline-block;
    margin-right: 4px;
    background-color: #8fcece;
  }
  &.short {
    &::before {
      background-color: #e05a69;
    }
  }
  font-size: 14px;
  font-weight: bold;
}

.right-arrow {
  font-size: 36px;
  vertical-align: middle;
  // color: var(--common-header-color, #bac6d4);
  color: var(--color-border3);
  font-weight: bold;
}
</style>
