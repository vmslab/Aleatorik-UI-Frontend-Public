<template>
  <div class="moz-frame-no-control">
    <Splitter :changed="loading">
      <Splitter pane-size="40%" direction="horizontal">
        <Chart :data="data" :margin="{ top: 60, right: 60, left: 60, bottom: 80 }" :show-zero="false" :isZoom="true">
          <Axis
            name="X"
            type="key"
            dataType="string"
            direction="horizontal"
            location="bottom"
            :showGrid="true"
            :rotateAngle="45"
            :setLabel="onSetLabel"
          ></Axis>
          <Axis name="Y" type="series" data-type="number" direction="vertical" location="left" :show-grid="true"></Axis>
          <!-- <Axis name="VALUE" type="series" dataType="number" direction="vertical" location="right" aggregation="max"></Axis> -->
          <Series field="MAX" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="AVG" type="area" keyAxis="X" seriesAxis="Y" :opacity="0.5"></Series>
          <Series field="MIN" type="line" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="AVG" type="agg-line" keyAxis="X" seriesAxis="Y" lineDashArray="10, 5" :lineCircle="false"></Series>
          <Text text="Title" location="top" className="moz-text-title"></Text>
          <Text text="Y Title" location="left" :angle="270" className="moz-text-axis"></Text>
          <Text type="legend" location="bottom" legendShape="series"></Text>
          <Text text="MAX" type="label"></Text>
          <Text text="MIN" type="label" position="start" :margin="{ bottom: 4 }"></Text>
          <Text text="MAX" type="total"></Text>
        </Chart>
        <Chart
          :data="data3"
          :margin="{ top: 60, right: 60, left: 60, bottom: 80 }"
          :show-zero="false"
          :isTooltip="false"
          :loading="loading"
        >
          <Axis name="X" type="key" dataType="string" direction="horizontal" location="bottom"></Axis>
          <Axis name="Y" type="series" dataType="number" direction="vertical" location="left" :showGrid="true"></Axis>
          <Series field="AVG" type="box-plot" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="MAX" type="box-plot" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="MIN" type="box-plot" keyAxis="X" seriesAxis="Y"></Series>
          <Text type="legend" location="bottom" legendShape="series"></Text>
        </Chart>
      </Splitter>
      <Splitter pane-min-size="30%" direction="horizontal">
        <Chart :data="data" :margin="{ top: 60, right: 60, left: 60, bottom: 80 }">
          <Axis name="X" type="key" dataType="string" direction="horizontal" location="bottom"></Axis>
          <Axis name="Y" type="series-aggregation" dataType="number" direction="vertical" location="left"></Axis>
          <Series field="MIN" type="stack" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="AVG" type="stack" keyAxis="X" seriesAxis="Y"></Series>
          <Series field="MAX" type="stack" keyAxis="X" seriesAxis="Y"></Series>
          <Text type="legend" location="bottom"></Text>
          <Text type="label"></Text>
          <Text text="MAX" type="total" color="var(--color-font4)" :setText="onSetStackTotal"></Text>
        </Chart>
        <Chart :data="data" :margin="{ top: 60, right: 60, left: 60, bottom: 80 }" :isTooltip="false">
          <Series field="MIN" type="pie"></Series>
          <Series field="AVG" type="pie"></Series>
          <Series field="MAX" type="pie"></Series>
          <Text type="legend" location="bottom" legendShape="series"></Text>
          <Text type="label"></Text>
        </Chart>
      </Splitter>
    </Splitter>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { IChartData, parseChartCsv, ChartValue, IChartTextParams } from "@mozart-ui/common-ui";
import { Splitter, Chart, Axis, Series, Text } from "@mozart-ui/vue-component";

const loading = ref(true);
const data3 = ref(new Array<IChartData>());
const csv: string = `Demand,AVG,MAX,MIN,TARGET,UNSATIS,SATIS,TOTAL
6,121.875,183.333,41.666,100,0,8,8
7,257.291,450,35.666,45.8333333333333,13,11,24
8,391.041,716.666,50.666,27.5,29,11,40
9,524.553,983.333,33,19.6428571428571,45,11,56
10,657.986,1250,25.666,15.2777777777778,61,11,72
11,791.382,1516.666,15.666,12.5,77,11,88
12,924.759,1783.333,0,10.5769230769231,93,11,104
15,1058.125,2050,1000,9.16666666666667,109,11,120`;

const data = parseChartCsv(csv, d => {
  const item: IChartData = {
    key: d["Demand"],
  };
  item["AVG"] = d["AVG"];
  item["MAX"] = d["MAX"];
  item["MIN"] = d["MIN"];
  return item;
});

onMounted(async () => {
  setTimeout(() => {
    data3.value = parseChartCsv(csv, d => {
      const num = +d["Demand"] || 0;
      const item: any = {
        key: num % 2 === 1 ? "Odd" : "Even",
      };
      item["AVG"] = d["AVG"];
      item["MAX"] = d["MAX"];
      item["MIN"] = d["MIN"];
      return item;
    });
    loading.value = false;
  }, 1000);
});

const onSetLabel = (params: IChartTextParams) => {
  const { value } = params;
  if (typeof value === "string") {
    return `${value}Str`;
  }
  return String(value);
};

const onSetStackTotal = (params: IChartTextParams) => {
  const { value } = params;
  if (typeof value === "number") {
    return `(${Math.ceil(value)})`;
  }
  return String(value);
};
</script>
