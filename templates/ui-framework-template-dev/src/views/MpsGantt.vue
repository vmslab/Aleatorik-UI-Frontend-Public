<template>
  <div>
    <moz-controller :showFilter="filter">
      <DxButton text="Search" icon="search" type="default" @click="onClickSearch"></DxButton>
      <DxButton text="PDF" icon="pdf" type="default" @click="onClickMakePDF"></DxButton>
      <DxButton
        v-tooltip="{ text: $t('Filter') }"
        icon="filter"
        type="default"
        :text="$t('Filter')"
        @click="filter = !filter"
      />
      <div slot="filter">
        <label>Row Height</label>
        <DxNumberBox
          :width="comboBoxWidth / 2"
          :value="rowHeight"
          :show-spin-buttons="true"
          :min=20
          @value-changed="onRowHeightChanged"
        />
      </div>
      <div slot="filter">
        <label>Task Height</label>
        <DxNumberBox
          :width="comboBoxWidth / 2"
          :value="taskHeight"
          :show-spin-buttons="true"
          :min=20
          @value-changed="onTaskHeightChanged"
        />
      </div>
      <div slot="filter" class="moz-zoom">
        <DxButton v-tooltip="{ text: $t('Minus') }" icon="minus" @click="onZoomOutClick"></DxButton>
        <input
          type="range"
          class="moz-slider"
          :min="zoomMin"
          :max="zoomMax"
          :value="zoomValue"
          :step="zoomStep"
          @change="onZoomChanged"
        />
        <DxButton v-tooltip="{ text: $t('Add') }" icon="add" @click="onZoomInClick"></DxButton>
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control"  ref="pdfarea">
      <moz-gantt
        v-if="renderGantt"
        :columns="columns"
        :getRows="getRows"
        :minDate="minDate"
        :maxDate="maxDate"
        :shiftHours="[8, 20]"
        :rowHeight="rowHeight"
        :taskHeight="taskHeight"
        :ganttHeaders="ganttHeaders"
        ganttTaskLine="last"
        :ganttWidthRate="ganttWidthRate"
        :setGanttHeaderText="setGanttHeaderText"
        :dataRefreshTrottleTime="1000"
        :dayStartTime=8
      ></moz-gantt>
    </div>
    <dx-load-panel
      :visible="loading"
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
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import DxDateBox from 'devextreme-vue/date-box';
import dayjs from "dayjs";
import { Column, IGanttHeader, IGanttRow, GanttHeaderType } from "mozart-common";
import { EventBus } from "mozart-common";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { mps } from "mozart-dev";

@Component({
  components: {
    DxButton,
    DxTextBox,
    DxNumberBox,
    DxSelectBox,
    DxDateBox,
    DxLoadPanel,
  },
})
export default class MpsGantt2 extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;
  public columns: Column[] = [
    new Column({
      field: "GANTT_GROUP_ID",
      caption: "Resource Group",
      width: 110,
      merge: true,
      textAlign: "left"
    }),
    new Column({
      field: "GANTT_ID",
      caption: "Resource",
      width: 75,
      merge: true,
      textAlign: "left"
    }),
  ];
  public minDate: Date = dayjs().startOf('day').add(8, 'hour').toDate();
  public maxDate: Date = dayjs().startOf('day').add(1, 'year').add(8, 'hour').toDate();
  public minDate2: Date = dayjs().startOf('day').add(8, 'hour').toDate();
  public ganttHeaders: IGanttHeader[] = [
    { type : "Year"},
    { type: "Month" },
    { type: "Day" },
  ];
  public ganttWidthRate: number = 0.00025;
  public rowCnt: number = 8;
  public versionNoItems: any[] = [];
  public selectedVersionNo: any = {};
  public resourceGroupIdItems: any[] = [];
  public selectedResourceGroupId: any = {};
  public resourceIdItems: any[] = [];
  public selectedResourceId: any = {};


  public zoomMin: number = 0;
  public zoomMax: number = 100;
  public zoomStep: number = 20;
  public zoomValue: number = 60;

  public rowHeight: number = 20;
  public taskHeight: number = 20;
  // public ganttResult: any = {};

  public options: Record<string, any> = { loading: false };

  constructor() {
    super();
  }

  public get loading() {
    return this.options.loading;
  }

  public isInit: boolean = true; // 화면 오픈시 컬럼헤더만 먼저 그려주기 위해
  public renderGantt:boolean = true;

  public setVersionControls(version: string, isReload: boolean) {
    this.selectedVersionNo = version;
    // this.setGanttInfo();
    // this.setGantt();
  }

  public async onVersionChanged(e: any) {
    this.setVersionControls(e.value, false);
  }

  public async getRows(
    currentBuffer: number,
    buffer: number,
    resolve: (value: IGanttRow[]) => void,
  ) {
    resolve(mps as any);
  }

  public onZoomChanged(e: any) {
    this.zoomValue = +e.target.value;
    this.onZoomValueChanged();
  }

  public onZoomInClick() {
    if (this.zoomValue >= this.zoomMax) return;
    this.zoomValue += this.zoomStep;
    this.onZoomValueChanged();
  }

  public onZoomOutClick() {
    if (this.zoomValue <= this.zoomMin) return;
    this.zoomValue -= this.zoomStep;
    this.onZoomValueChanged();
  }

  public onZoomValueChanged() {
    switch (this.zoomValue) {
      case 0:
        this.ganttHeaders = [{ type: "Year" }];
        this.ganttWidthRate = 0.00004;
        break;
      case 20:
        this.ganttHeaders = [{ type: "Year" }, { type: "Month" }];
        this.ganttWidthRate = 0.00006;
        break;
      case 40:
        this.ganttHeaders = [
          { type : "Year"},
          { type: "Week", },
          { type: "Day" },
        ];
        this.ganttWidthRate = 0.00025;
        break;
      case 60:
        this.ganttHeaders = [
          { type: "Year" },
          { type: "Month" }, 
          { type: "Day" }];
        this.ganttWidthRate = 0.00025;
        break;
      case 80:
        this.ganttHeaders = [
          { type: "Year" },
          { type: "Day", format: "MM/DD" },
          { type: "Shift" },
        ];
        this.ganttWidthRate = 0.001;
        break;
      default:
        this.ganttHeaders = [
          { type: "Year" },
          { type: "Day", format: "MM/DD" },
          { type: "Hour", format: "HH" },
        ];
        this.ganttWidthRate = 0.007;
        break;
    }
  }

  public setGanttHeaderText(text: string, type: GanttHeaderType, to: Date, from: Date) {
    if (type === "Shift") {
      const hour = dayjs(from).hour();
      if (hour > 8 && hour <= 20) {
        return "Day";
      // } else if (hour > 0 && hour <= 8) {
      //   return "C조";
      } else {
        return "Night";
      }
    } else {
      return text;
    }
  }

  public onRowHeightChanged(e: any) {
    this.rowHeight = e.value;
    console.log(this.rowHeight);
  }

  public onTaskHeightChanged(e: any) {
    this.taskHeight = e.value;
  }

  public onClickMakePDF() {
    EventBus.fire("download-pdf", {
      params: { element: this.$refs.pdfarea, options: this.options },
    });
  }

  public onClickSearch() {
    // (this.$refs.mpsGantt as any).renderGantt();
    // console.log("minDate maxDate");
    // console.log(this.minDate);
    // console.log(this.maxDate);
    // this.renderGantt = false;
    this.isInit = false;
    if(this.minDate === this.minDate2){
      try{
        this.renderGantt = false;
      }
      finally{
        this.$nextTick(()=>{
          this.renderGantt = true;
        })
        // this.renderGantt = true;
      }
    }else{      
      this.minDate = this.minDate2;
    }
  }
}
</script>
