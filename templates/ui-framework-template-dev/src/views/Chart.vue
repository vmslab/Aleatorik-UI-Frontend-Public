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
                dataType="string"
                direction="horizontal"
                location="bottom"
                :showGrid="true"
                :rotateAngle="45"
                :setLabel="onSetLabel"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series"
                data-type="number"
                direction="vertical"
                location="left"
                :show-grid="true"
              ></moz-axis>
              <!-- <moz-axis name="VALUE" type="series" dataType="number" direction="vertical" location="right" aggregation="max"></moz-axis> -->
              <moz-series field="MAX" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series
                field="AVG"
                type="area"
                keyAxis="X"
                seriesAxis="Y"
                :opacity="0.5"
              ></moz-series>
              <moz-series field="MIN" type="line" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series
                field="AVG"
                caption="Average of AVG"
                type="agg-line"
                keyAxis="X"
                seriesAxis="Y"
                lineDashArray="10, 5"
                :lineCircle="false"
              ></moz-series>
              <moz-text text="Title" location="top" className="moz-text-title"></moz-text>
              <moz-text
                text="Y Title"
                location="left"
                :angle="270"
                className="moz-text-axis"
              ></moz-text>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
              <moz-text text="MAX" type="label"></moz-text>
              <moz-text text="MIN" type="label" position="start" :margin="{ bottom: 4 }"></moz-text>
              <moz-text text="MAX" type="total"></moz-text>
            </moz-chart>
          </template>
          <template slot="box2">
            <moz-chart
              :data="data3"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :show-zero="false"
              :isTooltip="false"
              :loading="loading"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="string"
                direction="horizontal"
                location="bottom"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series"
                dataType="number"
                direction="vertical"
                location="left"
                :showGrid="true"
              ></moz-axis>
              <moz-series field="AVG" type="box-plot" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series field="MAX" type="box-plot" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series field="MIN" type="box-plot" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
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
              :isCollisionTextLogic="false"
            >
              <moz-axis
                name="X"
                type="key"
                dataType="string"
                direction="horizontal"
                location="bottom"
              ></moz-axis>
              <moz-axis
                name="Y"
                type="series-aggregation"
                dataType="number"
                direction="vertical"
                location="left"
              ></moz-axis>
              <moz-series field="MIN" type="stack" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series field="AVG" type="stack" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-series field="MAX" type="stack" keyAxis="X" seriesAxis="Y"></moz-series>
              <moz-text type="legend" location="bottom"></moz-text>
              <moz-text type="label"></moz-text>
              <moz-text
                text="MAX"
                type="total"
                color="var(--color-font4)"
                :setText="onSetStackTotal"
              ></moz-text>
            </moz-chart>
          </template>
          <template slot="box2">
            <moz-chart
              :data="data"
              :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
              :isTooltip="false"
            >
              <moz-series field="MIN" type="pie"></moz-series>
              <moz-series field="AVG" type="pie"></moz-series>
              <moz-series field="MAX" type="pie"></moz-series>
              <moz-text type="legend" location="bottom" legendShape="series"></moz-text>
              <moz-text type="label"></moz-text>
            </moz-chart>
          </template>
        </moz-split-box>
      </template>
    </moz-split-box>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { IChartData, parseCsv, IChartTextParams } from "mozart-common";

@Component({
  components: {},
})
export default class Chart extends Vue {
  public loading = true;
  public data3: IChartData[] = [];
  public csv: string = `Demand,AVG,MAX,MIN,TARGET,UNSATIS,SATIS,TOTAL
6,121.875,183.333,41.666,100,0,8,8
7,257.291,450,35.666,45.8333333333333,13,11,24
8,391.041,716.666,50.666,27.5,29,11,40
9,524.553,983.333,33,19.6428571428571,45,11,56
10,657.986,1250,25.666,15.2777777777778,61,11,72
11,791.382,1516.666,15.666,12.5,77,11,88
12,924.759,1783.333,0,10.5769230769231,93,11,104
15,1058.125,2050,1000,9.16666666666667,109,11,120`;

  public data = parseCsv(this.csv, d => {
    const item: IChartData = {
      key: d["Demand"],
    };
    item["AVG"] = d["AVG"];
    item["MAX"] = d["MAX"];
    item["MIN"] = d["MIN"];
    return item;
  });

  constructor() {
    super();
  }

  public mounted() {
    setTimeout(() => {
      this.data3 = parseCsv(this.csv, d => {
        const num = +d["Demand"] || 0;
        const item: any = {
          key: num % 2 === 1 ? "Odd" : "Even",
        };
        item["AVG"] = d["AVG"];
        item["MAX"] = d["MAX"];
        item["MIN"] = d["MIN"];
        return item;
      });
      this.loading = false;
    }, 1000);
  }

  public onSetLabel = (params: IChartTextParams) => {
    const { value } = params;
    if (typeof value === "string") {
      return `${value}Str`;
    }
    return String(value);
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
