<template>
  <div class="moz-frame">
    <moz-controller>
      <!-- <moz-icon-btn slot="defalut" @click="onRefreshChart">Refresh</moz-icon-btn>
      <moz-icon-btn slot="defalut" @click="onConvertImage">Image</moz-icon-btn> -->
    </moz-controller>
    <moz-split-box
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height)"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 1, minWidth: 200 },
      ]"
      horizontal
      resizable
    >
      <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
        <moz-split-box
          :width="parentsWidth"
          :height="parentsHeight"
          :boxes="[
            { type: 'rate', size: 1, minWidth: 200 },
            { type: 'rate', size: 1, minWidth: 200 },
          ]"
          resizable
        >
          <template slot="box1">
            <moz-chart
              :data="data"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :show-zero="false"
              :isZoom="true"
              :isCollisionTextLogic="false"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="number"
                direction="horizontal"
                location="bottom"
                :showGrid="true"
                :outerPadding="0.1"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series"
                data-type="number"
                direction="vertical"
                location="left"
                :show-grid="true"
              ></moz-axis>
              <moz-series field="MAX" keyAxis="X" seriesAxis="Y" :barMaxSize="30"></moz-series>
              <moz-series
                field="AVG"
                type="area"
                keyAxis="X"
                seriesAxis="Y"
                :opacity="0.5"
                :onlySeries="true"
              ></moz-series>
              <moz-series field="AVG" type="line" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series
                field="MIN"
                type="area"
                keyAxis="X"
                seriesAxis="Y"
                :opacity="0.5"
                :onlySeries="true"
              ></moz-series>
              <moz-series field="MIN" type="line" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-text text="Title" location="top" className="moz-text-title"></moz-text>
              <moz-text
                text="Y Title"
                location="left"
                :angle="270"
                className="moz-text-axis"
              ></moz-text>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
              <moz-text text="MIN" type="label" position="start" :margin="{ bottom: 4 }"></moz-text>
              <moz-text text="AVG" type="label" position="start" :margin="{ bottom: 4 }"></moz-text>
              <moz-text text="MAX" type="label" position="start" :margin="{ top: 4 }"></moz-text>
            </moz-chart>
          </template>
          <template slot="box2">
            <moz-chart
              :data="data3"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :show-zero="false"
              :is-zoom="true"
              :setToolTipText="onSetLineAreaTooltip"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="Date"
                direction="horizontal"
                location="bottom"
                :markers="markers"
                :setLabel="onSetDateLabel"
                :outerPadding="0.05"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series"
                dataType="number"
                direction="vertical"
                location="left"
                :showGrid="true"
                :fixedMinValue="0"
                :outerPadding="0.15"
              ></moz-axis>
              <moz-series
                field="DATA1"
                type="area"
                keyAxis="X"
                seriesAxis="Y"
                :areaAffectedPrev="true"
                :onlySeries="true"
              ></moz-series>
              <moz-series field="DATA1" type="line" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series
                field="DATA2"
                type="area"
                keyAxis="X"
                seriesAxis="Y"
                :areaAffectedPrev="true"
                :onlySeries="true"
              ></moz-series>
              <moz-series field="DATA2" type="line" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
              <moz-text type="label" position="start" :margin="{ bottom: 8 }"></moz-text>
            </moz-chart>
          </template>
        </moz-split-box>
      </template>
      <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
        <moz-split-box
          :width="parentsWidth"
          :height="parentsHeight"
          :boxes="[
            { type: 'rate', size: 1, minWidth: 200 },
            { type: 'rate', size: 1, minWidth: 200 },
          ]"
          resizable
        >
          <template slot="box1">
            <moz-chart
              :data="data"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :collision-text-padding="-1"
              :isCollisionTextLogic="false"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="number"
                direction="vertical"
                location="left"
                :outerPadding="0.1"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series-aggregation"
                dataType="number"
                direction="horizontal"
                location="bottom"
              ></moz-axis>
              <moz-series
                field="MIN"
                type="stack"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="22"
              ></moz-series>
              <moz-series
                field="AVG"
                type="stack"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="22"
              ></moz-series>
              <moz-series
                field="MAX"
                type="stack"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="22"
              ></moz-series>
              <moz-text type="legend" location="bottom"></moz-text>
              <moz-text type="label"></moz-text>
              <moz-text
                text="MAX"
                type="total"
                color="var(--color-font4)"
                :margin="{ left: 8 }"
                :setText="onSetStackTotal"
              ></moz-text>
            </moz-chart>
          </template>
          <template slot="box2">
            <moz-chart
              :data="data"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :isTooltip="false"
              :isCollisionTextRerender="false"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="number"
                direction="horizontal"
                location="bottom"
                :showGrid="true"
                :outerPadding="0.1"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series"
                dataType="number"
                direction="vertical"
                location="left"
                :showGrid="true"
              ></moz-axis>
              <moz-series
                field="MIN"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="50"
                :barInnerPadding="4"
              ></moz-series>
              <moz-series
                field="AVG"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="50"
                :barInnerPadding="4"
              ></moz-series>
              <moz-series
                field="MAX"
                keyAxis="X"
                seriesAxis="Y"
                :barMaxSize="50"
                :barInnerPadding="4"
              ></moz-series>
              <moz-text text="Title" location="top" className="moz-text-title"></moz-text>
              <moz-text
                text="Y Title"
                location="left"
                :angle="270"
                className="moz-text-axis"
              ></moz-text>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
              <moz-text type="label" :angle="90"></moz-text>
            </moz-chart>
          </template>
        </moz-split-box>
      </template>
    </moz-split-box>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import dayjs from "dayjs";
import { IChartData, parseCsv, IChartTextParams, IChartTooltipParams } from "mozart-common";

@Component({
  components: {},
})
export default class Chart2 extends Vue {
  public csv: string = `Demand,AVG,MAX,MIN,TARGET,UNSATIS,SATIS,TOTAL
6,121.875,183.333,41.666,100,0,8,8
7,257.291,450,35.666,45.8333333333333,13,11,24
8,391.041,716.666,50.666,27.5,29,11,40
9,524.553,983.333,33,19.6428571428571,45,11,56
10,657.986,1250,25.666,15.2777777777778,61,11,72
11,791.382,1516.666,15.666,12.5,77,11,88
12,924.759,1783.333,0,10.5769230769231,93,11,104
15,1058.125,2050,1000,9.16666666666667,109,11,120`;

  public data3 = [
    {
      key: dayjs("2020-02-01").toDate(),
      DATA1: 56,
      DATA2: 124,
    },
    {
      key: dayjs("2020-03-01").toDate(),
      DATA1: 74,
      DATA2: 118,
    },
    {
      key: dayjs("2020-04-01").toDate(),
      DATA1: 68,
      DATA2: 128,
    },
    {
      key: dayjs("2020-05-01").toDate(),
      DATA1: 60,
      DATA2: 120,
    },
    {
      key: dayjs("2020-06-01").toDate(),
      DATA1: 70,
      DATA2: 127,
    },
    {
      key: dayjs("2020-07-01").toDate(),
      DATA1: 65,
      DATA2: 114,
    },
  ];
  public markers = [dayjs("2020-03-15").toDate(), dayjs("2020-05-15").toDate()];

  public data = parseCsv(this.csv, d => {
    const item: IChartData = {
      key: +d["Demand"],
    };
    item["AVG"] = d["AVG"];
    item["MAX"] = d["MAX"];
    item["MIN"] = d["MIN"];
    return item;
  });

  public onSetDateLabel = (params: IChartTextParams) => {
    const { value } = params;
    return dayjs(value).format("YY-MM");
  };

  public onSetLineAreaTooltip = (params: IChartTooltipParams) => {
    const { type, key, text, numberFormat } = params;
    if (type === "value" && key === "X") {
      if (text instanceof Date) {
        return dayjs(text).format("YY-MM");
      }
    }
    if (typeof text === "number" && numberFormat) {
      return numberFormat(text);
    }
    return String(text);
  };

  public onSetStackTotal = (params: IChartTextParams) => {
    const { value } = params;
    if (typeof value === "number") {
      return `(${Math.ceil(value)})`;
    }
    return String(value);
  };
}
</script>
