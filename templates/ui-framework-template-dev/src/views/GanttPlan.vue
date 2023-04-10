<template>
  <div>
    <div class="moz-frame">
      <moz-controller></moz-controller>
      <moz-gantt
        v-if="renderGantt"
        :columns="columns"
        :getRows="getRows"
        :minDate="minDate"
        :maxDate="maxDate"
        :ganttHeaders="ganttHeaders"
        :ganttWidthRate="ganttWidthRate"
      ></moz-gantt>
    </div>
    <dx-load-panel
      :visible="!renderGantt"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :close-on-outside-click="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import dayjs from "dayjs";
import { Column, IGanttHeader, IGanttRow } from "mozart-common";
import { Get } from "../api/mainService";

@Component({
  components: {
    DxLoadPanel,
  },
})
export default class GanttPlan extends Vue {
  public columns: Column[] = [
    new Column({
      field: "EQP_ID",
      width: 100,
      merge: true,
    }),
    new Column({
      field: "STEP_ID",
      width: 100,
      merge: true,
    }),
  ];
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public ganttHeaders: IGanttHeader[] = [{ type: "Day" }, { type: "Hour" }];
  public ganttWidthRate: number = 0.02;
  public rowCnt: number = 8;

  constructor() {
    super();
  }

  public get renderGantt(): boolean {
    return this.minDate < this.maxDate;
  }

  public async created() {
    const result = await Get("PlanGanttInfo");
    if (result && result.data) {
      const data = JSON.parse(result.data) as { MIN_START_TIME: string; MAX_END_TIME: string; }[];
      if (data.length > 0) {
        const info = data[0];
        this.minDate = dayjs(info.MIN_START_TIME).toDate();
        this.maxDate = dayjs(info.MAX_END_TIME).toDate();
      }
    }
  }

  public async getRows(
    currentBuffer: number,
    buffer: number,
    resolve: (value: IGanttRow[]) => void,
  ) {
    const result = await Get(
      "PlanGantt",
      { option: { skip: currentBuffer, take: buffer } },
      "post",
    );
    if (result && result.data) {
      resolve(JSON.parse(result.data));
    }
    resolve([]);
  }
}
</script>
