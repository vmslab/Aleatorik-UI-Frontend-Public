<template>
  <div>
    <moz-controller :showFilter="filter">
      <DxButton text="Excel" icon="download" type="default" @click="onClickMakeExcel"></DxButton>
      <DxButton text="PDF" icon="pdf" type="default" @click="onClickMakePDF"></DxButton>
      <DxButton
        v-tooltip="{ text: $t('Filter') }"
        icon="filter"
        type="default"
        :text="$t('Filter')"
        @click="filter = !filter"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :text="$t('Search')"
        @click="onRefreshData"
      ></DxButton>
      <div slot="filter" v-if="selectedSoIDs">
        <label>SALES ORDER</label>
        <DropDownBox
          :width="350"
          :height="300"
          dataKey="SO_ID"
          :items="soItems"
          :dataFields="soFields"
          :selectedValue="selectedSoIDs"
          selection="multiple"
          :acceptCustomValue="true"
          @value-changed="onSoValueChanged"
          @initialized="onInitialized"
        />
      </div>
      <div slot="filter">
        <label>ROW HEIGHT</label>
        <DxNumberBox
          :width="comboBoxWidth / 2"
          :value="rowHeight"
          :show-spin-buttons="true"
          @value-changed="onRowHeightChanged"
        />
      </div>
      <div slot="filter">
        <label>TASK HEIGHT</label>
        <DxNumberBox
          :width="comboBoxWidth / 2"
          :value="taskHeight"
          :show-spin-buttons="true"
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
    <div class="moz-frame-for-outer-control" ref="pdfarea">
      <moz-split-box
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :boxes="[
          { type: 'rate', size: 7, minWidth: 200 },
          { type: 'rate', size: 3, minWidth: 200 },
        ]"
        resizable
      >
        <template slot="box1" slot-scope="{ parentsHeight }">
          <moz-gantt
            v-if="renderGantt"
            ref="gantt"
            :columns="columns"
            :getRows="getRows"
            :minDate="minDate"
            :maxDate="maxDate"
            :rowHeight="rowHeight"
            :taskHeight="taskHeight"
            :ganttHeaders="ganttHeaders"
            :ganttWidthRate="ganttWidthRate"
            :styleObject="{
              height: `${parentsHeight}px`,
            }"
            :onRowClick="onGanttRowClick"
            :onTaskClick="onGanttTaskClick"
            :setGanttHeaderText="setGanttHeaderText"
            :setTaskTooltip="setGanttTaskTooltip"
            :setHighlightTask="filterExpr"
            :isEndPosition="true"
          />
        </template>
        <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
          <moz-split-box
            :width="parentsWidth"
            :height="parentsHeight"
            :boxes="[
              { type: 'rate', size: 1, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 200 },
            ]"
            horizontal
            resizable
          >
            <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
              <DxDataGrid
                class="moz-edit-datagrid"
                :height="parentsHeight"
                :width="parentsWidth"
                :data-source="selectedTasks"
                :row-alternation-enabled="true"
                :show-row-lines="false"
                :show-column-lines="false"
                :allow-column-resizing="true"
                :allow-column-reordering="true"
                :column-auto-width="true"
                :hoverStateEnabled="true"
                :selected-row-keys="selectedTaskKeys"
                key-expr="ROW-ID"
                columnResizingMode="widget"
                no-data-text="No data to display"
                @selection-changed="onGridSelectionChanged"
              >
                <DxHeaderFilter :visible="true" />

                <DxColumn data-field="ITEM_ID" :allow-sorting="false" />
                <DxColumn data-field="SITE_ID" :allow-sorting="false" />
                <DxColumn data-field="BUFFER_ID" :allow-sorting="false" />
                <DxColumn data-field="LOT_ID" :allow-sorting="false" />
                <DxColumn data-field="OPERATION_ID" :allow-sorting="false" />
                <DxColumn data-field="RESOURCE_ID" :allow-sorting="false" />
                <DxColumn
                  data-field="TARGET_DATETIME"
                  data-type="datetime"
                  :customize-text="getDateTimeValue"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="ARRIVAL_TIME"
                  data-type="datetime"
                  :customize-text="getDateTimeValue"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="START_TIME"
                  data-type="datetime"
                  :customize-text="getDateTimeValue"
                  :sort-index="1"
                  sort-order="asc"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="END_TIME"
                  data-type="datetime"
                  :customize-text="getDateTimeValue"
                  :sort-index="2"
                  sort-order="asc"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="OUT_PLAN_UNIT_QTY"
                  :customize-text="getFormatValue"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="USAGE_PER"
                  :customize-text="getPercentValue"
                  :allow-sorting="false"
                />
                <DxColumn
                  data-field="LOAD"
                  :customize-text="getFormatValue"
                  :allow-sorting="false"
                />

                <DxScrolling mode="infinite" />
                <DxSelection mode="single" />
              </DxDataGrid>
            </template>
            <template slot="box2" slot-scope="{ parentsHeight }">
              <div class="dx-card" :style="`height:${parentsHeight}px;`">
                <div class="dx-card-title">
                  <div class="dx-card-title-text">Task Info.</div>
                </div>
                <div class="dx-card-text">
                  <table v-if="selectedTask">
                    <tr :key="i" v-for="(key, i) in Object.keys(selectedTask)">
                      <td>{{ key }}</td>
                      <td>{{ getTypeString(selectedTask[key]) }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </template>
          </moz-split-box>
        </template>
      </moz-split-box>
    </div>
    <DxLoadPanel
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
import html2canvas from "html2canvas";
import { DxButton } from "devextreme-vue/button";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import {
  DxDataGrid,
  DxColumn,
  DxExport,
  DxScrolling,
  DxFilterRow,
  DxSelection,
  DxHeaderFilter,
} from "devextreme-vue/data-grid";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import dayjs from "dayjs";
import { Column, IGanttHeader, IGanttRow, GanttHeaderType, IGanttTask } from "mozart-common";
import { Get, Download } from "@/api/mainService";
import { EventBus } from "mozart-common";
import DropDownBox from "@/views/DropDown/DropDownBox.vue";
import { loadTableDatas } from "@/utils/dataUtils";
import { toFormatString, toPercentString } from "@/utils/commonUtils";
import "@/utils/dateUtils";

@Component({
  components: {
    DxButton,
    DxSelectBox,
    DxNumberBox,
    DxLoadPanel,
    DxDataGrid,
    DxColumn,
    DxExport,
    DxScrolling,
    DxFilterRow,
    DxSelection,
    DxHeaderFilter,
    DropDownBox,
  },
})
export default class ProductionGantt extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;

  public selectedTasks: any[] = [];
  public selectedTaskKeys: number[] = [];
  public selectedTask: any = {};
  public options: Record<string, any> = { loading: false };

  public soItems: any[] = [];
  public soFields: any[] = [
    { name: "SO_ID" },
    { name: "ITEM_ID" },
    { name: "DUE_DATE", type: "datetime" },
    { name: "QTY", type: "number" },
  ];
  public selectedSoIDs: string = "";

  public rowHeight: number = 24;
  public taskHeight: number = 20;

  public columns: Column[] = [
    new Column({
      field: "SITE_ID",
      width: 100,
      merge: true,
    }),
    new Column({
      field: "BUFFER_ID",
      width: 100,
      merge: true,
    }),
    new Column({
      field: "ITEM_ID",
      width: 100,
      merge: true,
    }),
  ];
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public ganttHeaders: IGanttHeader[] = [
    { type: "Month" },
    { type: "Day", format: "MM/DD" },
    // { type: "Shift" },
  ];
  public ganttWidthRate: number = 0.0015;
  public rowCnt: number = 8;

  public zoomMin: number = 0;
  public zoomMax: number = 100;
  public zoomStep: number = 20;
  public zoomValue: number = 20;

  public filterExpr = (task: IGanttTask) => {
    return task?.item.SO_ID === this.gantt?.getSelectedTask()?.task?.item.SO_ID;
  };

  constructor() {
    super();
  }

  public get loading() {
    return this.options.loading;
  }

  public get renderGantt(): boolean {
    return this.minDate < this.maxDate;
  }

  public get gantt() {
    return this.$refs.gantt as any;
  }

  public getDateValue({ value, valueText }: any): string {
    const dateValue = value as Date;
    if (!dateValue) return valueText;
    return (value as Date)?.toDateString();
  }

  public getDateTimeValue({ value, valueText }: any): string {
    const dateValue = value as Date;
    if (!dateValue) return valueText;
    return dateValue.toDateTimeString();
  }

  public getPercentValue(e: any): string {
    return toPercentString(e);
  }

  public getFormatValue(e: any): string {
    return toFormatString(e);
  }

  public getTypeString(value: any): string {
    if (typeof value === "number")
      return this.getFormatValue({ value, valueText: value.toString() });

    const dateValue = dayjs(value);
    if (dateValue.isValid())
      return this.getDateValue({ value: dateValue.toDate(), valueText: value });

    return value;
  }

  public async created() {
    this.soItems = await loadTableDatas("SALES_ORDER");

    if (this.selectedSoIDs.length === 0 && this.soItems && this.soItems.length > 0)
      this.selectedSoIDs = this.soItems[0].SO_ID;

    const urlParams = new URLSearchParams(window.location.search);
    const soID = urlParams.get("s");
    if (soID) this.selectedSoIDs = soID;

    this.setGanttInfo();
  }

  public onRefreshData() {
    this.setGanttInfo();
  }

  public onSoValueChanged(e: any) {
    this.selectedSoIDs = e.SO_ID;
    this.setGanttInfo();
  }

  public onInitialized(e: any) {
    this.setGanttInfo();
  }

  public async setGanttInfo() {
    const ganttInfoResult = await Get(
      "ProductionGanttInfo",
      {
        options: {
          filter: [
            ["SO_ID", "=", this.selectedSoIDs],
            "and",
            ["START_TIME", "column", "END_TIME", "<>"],
          ],
        },
      },
      "post",
    );
    if (ganttInfoResult && ganttInfoResult.data) {
      const data = JSON.parse(ganttInfoResult.data) as {
        MIN_START_TIME: string;
        MAX_END_TIME: string;
        MAX_TARGET_DATETIME: string;
      }[];

      if (data.length > 0) {
        const info = data[0];
        this.minDate = dayjs(info.MIN_START_TIME).toDate().addDays(-1);
        const maxEnd = dayjs(info.MAX_END_TIME).toDate().addDays(1);
        const maxTarget = dayjs(info.MAX_TARGET_DATETIME).toDate().addDays(1);
        this.maxDate = maxEnd > maxTarget ? maxEnd : maxTarget;
      }
    }
  }

  public async getRows(
    currentBuffer: number,
    buffer: number,
    resolve: (value: IGanttRow[]) => void,
  ) {
    const result = await Get(
      "ProductionGantt",
      {
        options: {
          filter: [
            ["SO_ID", "=", this.selectedSoIDs],
            "and",
            ["START_TIME", "column", "END_TIME", "<>"],
          ],
          skip: currentBuffer,
          take: buffer,
        },
      },
      "post",
    );
    if (result && result.data) {
      resolve(JSON.parse(result.data));
    }
    resolve([]);
  }

  public onRowHeightChanged(e: any) {
    this.rowHeight = e.value;
  }

  public onTaskHeightChanged(e: any) {
    this.taskHeight = e.value;
  }

  public async onClickMakePDF() {
    const gantt = this.$refs.gantt;
    if (!gantt) return;
    this.options.loading = true;
    const element = (await (gantt as any).createPdfElement({ height: 600 })) as HTMLElement;
    if (!element) {
      this.options.loading = false;
      return;
    }
    setTimeout(async () => {
      try {
        const rect = element.getBoundingClientRect();
        const canvas = await html2canvas(element, {
          allowTaint: true,
          useCORS: true,
          width: rect.width,
          height: rect.height,
        });
        const imageData = canvas.toDataURL("image/png");

        const imgWidth = rect.width;
        const imgHeight = rect.height;

        EventBus.fire("create-pdf-from-images", {
          params: {
            options: {
              orientation: "l",
              imgWidth,
              imgHeight,
              imageData,
              filename: "간트.pdf",
            },
          },
        });
        document.body.removeChild(element);
      } finally {
        this.options.loading = false;
      }
    }, 1000);
  }

  public async onClickMakeExcel() {
    await Download("ProductionGantt", {
      options: {
        filter: [
          ["SO_ID", "=", this.selectedSoIDs],
          "and",
          ["START_TIME", "column", "END_TIME", "<>"],
        ],
      },
      goptions: {
        fileName: "ProductionGantt.xlsx",
        columns: ["SITE_ID", "BUFFER_ID", "ITEM_ID"],
        widthRate: 0.0015,
        headers: [{ type: "Month" }, { type: "Day", format: "MM/dd" }],
      },
    });
  }

  public setGanttHeaderText(text: string, type: GanttHeaderType, to: Date, from: Date) {
    // if (type === "Shift") {
    //   const hour = dayjs(to).hour();
    //   if (hour > 0 && hour <= 12) {
    //     return "DY";
    //   } else {
    //     return "NN";
    //   }
    // } else {
    //   return text;
    // }
    return text;
  }

  public onZoomValueChanged() {
    switch (this.zoomValue) {
      case 0:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day" }];
        this.ganttWidthRate = 0.0005;
        break;
      case 20:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.001;
        break;
      case 40:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          // { type: "Shift" },
        ];
        this.ganttWidthRate = 0.0015;
        break;
      case 60:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          // { type: "Shift" },
        ];
        this.ganttWidthRate = 0.002;
        break;
      case 80:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          // { type: "Shift" },
        ];
        this.ganttWidthRate = 0.0025;
        break;
      default:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          // { type: "Shift" },
        ];
        this.ganttWidthRate = 0.003;
        break;
    }
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

  public onGanttRowClick(evt: Event, row: IGanttRow) {
    if (!row.tasks) return;
    this.selectedTasks = row.tasks.map((t, i) => ({ ...t.item, "ROW-ID": i }));
  }

  public onGanttTaskClick(evt: Event, task: IGanttTask, row: IGanttRow) {
    this.selectedTask = task.item;
    if (!row.tasks) return;
    const rows = row.tasks.map(t => t.item);
    const key = rows.findIndex(t => t === task.item);
    this.selectedTaskKeys = [key];
  }

  public setGanttTaskTooltip(task: IGanttTask, row?: IGanttRow) {
    const tooltipItems = [
      "SO_ID",
      "LOT_ID",
      "ITEM_ID",
      "OPERATION_ID",
      "BUFFER_ID",
      "RESOURCE_ID",
      "TARGET_DATE",
      "START_TIME",
      "END_TIME",
      "OUT_PLAN_UNIT_QTY",
      "LOAD",
      "PLAN_SEQ",
    ];

    let result = "<table>";
    tooltipItems.forEach(item => {
      result += `<tr><td style='padding-right: 10px'>${item}</td><td>${this.getTypeString(
        task.item[item],
      )}</td></tr>`;
    });
    return result + "</table>";
  }

  public onGridSelectionChanged(evt: any) {
    if (evt.selectedRowsData.length === 0) return;
    this.selectedTask = evt.selectedRowsData[0];
  }
}
</script>
