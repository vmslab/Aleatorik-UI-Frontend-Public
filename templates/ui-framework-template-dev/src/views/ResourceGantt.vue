D
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
            :classList="['moz-gantt-root']"
            :columns="columns"
            :getRows="getRows"
            :minDate="minDate"
            :maxDate="maxDate"
            :shiftHours="['12', '24']"
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
            :setRenderCell="setRenderCell"
            :setGanttRowClass="setRowClass"
            :setGridRowClass="setRowClass"
            :setGridCellClass="setGridCellClass"
          ></moz-gantt>
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
                <!-- @context-menu-preparing="onContextMenuPreparing"
                @selection-changed="onSelectionChanged" -->
                <!-- <DxFilterRow :visible="showRowFilter" /> -->
                <DxHeaderFilter :visible="true" />

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
                    <tr v-for="(key, i) in Object.keys(selectedTask)">
                      <td>{{ key }}</td>
                      <td>{{ selectedTask[key] }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </template>
          </moz-split-box>
        </template>
      </moz-split-box>
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
import { Get, Download } from "../api/mainService";
import { EventBus } from "mozart-common";

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
  },
})
export default class ResourceGantt extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;

  public selectedTasks: any[] = [];
  public selectedTaskKeys: number[] = [];
  public selectedTask: any = {};
  public options: Record<string, any> = { loading: false };

  public rowHeight: number = 48;
  public taskHeight: number = 40;

  public columns: Column[] = [
    new Column({
      field: "STAGE_ID",
      width: 100,
      merge: true,
    }),
    // new Column({
    //   field: "RESOURCE_GROUP",
    //   width: 100,
    //   merge: true,
    // }),
    new Column({
      field: "RESOURCE_ID",
      width: 100,
    }),
    new Column({
      field: "RESOURCE_ID",
      caption: "STATE",
      width: 50,
    }),
  ];
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public ganttHeaders: IGanttHeader[] = [
    { type: "Month" },
    { type: "Day", format: "MM/DD" },
    { type: "Shift" },
  ];
  public ganttWidthRate: number = 0.0015;
  public rowCnt: number = 8;

  public zoomMin: number = 0;
  public zoomMax: number = 100;
  public zoomStep: number = 20;
  public zoomValue: number = 40;

  constructor() {
    super();
  }

  public get loading() {
    return this.options.loading;
  }

  public get renderGantt(): boolean {
    return this.minDate < this.maxDate;
  }

  public async created() {
    this.setGanttInfo();
  }

  public onRefreshData() {
    this.setGanttInfo();
  }

  public async setGanttInfo() {
    const ganttInfoResult = await Get("ResourceGanttInfo", { options: { filter: [] } }, "post");
    if (ganttInfoResult && ganttInfoResult.data) {
      const data = JSON.parse(ganttInfoResult.data) as {
        MIN_START_TIME: string;
        MAX_END_TIME: string;
      }[];

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
      "ResourceGantt",
      {
        options: {
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
    await Download("ResourceGantt", {
      options: {},
      goptions: {
        fileName: "ResourceGantt.xlsx",
        columns: ["STAGE_ID", "RESOURCE_ID"],
        widthRate: 0.0015,
        headers: [{ type: "Month" }, { type: "Day", format: "MM/dd" }],
      },
    });
  }

  public setGanttHeaderText(text: string, type: GanttHeaderType, to: Date, from: Date) {
    if (type === "Shift") {
      const hour = dayjs(to).hour();
      if (hour > 0 && hour <= 12) {
        return "DY";
      } else {
        return "NN";
      }
    } else {
      return text;
    }
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
          { type: "Shift" },
        ];
        this.ganttWidthRate = 0.0015;
        break;
      case 60:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          { type: "Shift" },
        ];
        this.ganttWidthRate = 0.002;
        break;
      case 80:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          { type: "Shift" },
        ];
        this.ganttWidthRate = 0.0025;
        break;
      default:
        this.ganttHeaders = [
          { type: "Month" },
          { type: "Day", format: "MM/DD" },
          { type: "Shift" },
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
    return `${Object.keys(task.item)
      .filter(key =>
        [
          "MODULE_KEY",
          "RESOURCE_ID",
          "PLAN_SEQ",
          "STAGE_ID",
          "LOT_ID",
          "ITEM_ID",
          "END_TIME",
        ].includes(key),
      )
      .reduce((result, key, idx) => {
        return `${result}<tr><td>${key}</td><td>${task.item[key]}</td></tr>`;
      }, "<table>")}</table>`;
  }

  public onGridSelectionChanged(evt: any) {
    if (evt.selectedRowsData.length === 0) return;
    this.selectedTask = evt.selectedRowsData[0];
  }

  public setRenderCell(row: IGanttRow, column: Column, value: any) {
    if (column.caption === "STATE") {
      if (value === "RES0201") {
        return "<div class='flex-center'><div style='width:20px; height: 20px; background-color:red; border-radius:50%'></div></div>";
      }
      return "";
    }
    return value;
  }

  public setRowClass(row: IGanttRow) {
    if (!row.tasks) return "";
    if (row.tasks.some(t => dayjs(t.endTime).isAfter(dayjs("2022-03-16 06:00:00")))) {
      return "moz-gantt-error-row";
    }
    return "";
  }

  public setGridCellClass(row: IGanttRow, column: any, value: any) {
    if (!value) return "";
    if (!column.caption && value === "RES0201") {
      return "moz-gantt-error-cell";
    }
    return "";
  }
}
</script>
