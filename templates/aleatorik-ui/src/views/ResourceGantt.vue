D
<template>
  <div>
    <moz-controller :showFilter="filter">
      <button class="filter-icon" @click="filter = !filter">
        <i
          v-tooltip="{ text: filter ? $t('HideFilter') : $t('ShowFilter') }"
          class="mozart-icons"
          :class="{
            'moz-filter-icon': !filter,
            'moz-filter-icon-tap': filter,
          }"
        />
      </button>

      <div class="spacer" />

      <DxButton text="Excel" icon="download" type="default" :focusStateEnabled="false" @click="onClickMakeExcel" />
      <DxButton text="PDF" icon="pdf" type="default" :focusStateEnabled="false" @click="onClickMakePDF" />
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
        <label>PLAN_VERSION</label>
        <DropDownGrid
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
          :comboBoxWidth="220"
        />
      </div>
      <!-- <div slot="filter">
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
      </div> -->
      <div slot="filter" class="moz-zoom">
        <label>COLUMN_SIZE</label>
        <div class="moz-filter-container">
          <DxButton v-tooltip="{ text: $t('Column Size -') }" icon="minus" @click="onZoomOutClick" />
          <input
            type="range"
            class="moz-slider"
            :min="zoomMin"
            :max="zoomMax"
            :value="zoomValue"
            :step="zoomStep"
            @change="onZoomChanged"
          />
          <DxButton v-tooltip="{ text: $t('Column Size +') }" icon="add" @click="onZoomInClick" />
        </div>
      </div>
      <div slot="filter" class="moz-zoom">
        <label>ROW_SIZE</label>
        <div class="moz-filter-container">
          <DxButton v-tooltip="{ text: $t('Row Size -') }" icon="minus" @click="onSizeDownClick" />
          <input
            type="range"
            class="moz-slider"
            :min="sizeMin"
            :max="sizeMax"
            :value="sizeValue"
            :step="sizeStep"
            @change="onSizeChanged"
          />
          <DxButton v-tooltip="{ text: $t('Row Size +') }" icon="add" @click="onSizeUpClick" />
        </div>
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
          <div>
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
              :loadingChanged="onLoadingChanged"
              :resizeColumn="false"
            />
            <dx-load-panel
              :visible="loading"
              :show-indicator="true"
              :show-pane="true"
              :shading="false"
              :close-on-outside-click="false"
              shading-color="rgba(0,0,0,0.4)"
              message="Please, wait..."
            />
          </div>
        </template>
        <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
          <moz-split-box
            :width="parentsWidth"
            :height="parentsHeight"
            :boxes="[
              { type: 'rate', size: 2, minWidth: 200 },
              { type: 'rate', size: 1, minWidth: 100 },
            ]"
            horizontal
            resizable
          >
            <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
              <WjFlexGrid
                :style="`width: ${parentsWidth}px; height: ${parentsHeight}px`"
                :itemsSource="selectedTasks"
                :initialized="onInitialized"
                selectionMode="MultiRange"
                allowSorting="MultiColumn"
                keyActionTab="Cycle"
                :allowDelete="true"
                :autoGenerateColumns="false"
                :deferResizing="true"
                :quickAutoSize="true"
                :imeEnabled="true"
                :alternatingRowStep="0"
                :isReadOnly="true"
                :allowPinning="false"
                class="moz-edit-datagrid"
              >
                <WjFlexGridColumn aggregate="Cnt" binding="LOT_ID" header="LOT ID" />
                <WjFlexGridColumn binding="ITEM_ID" header="ITEM ID" />
                <WjFlexGridColumn
                  binding="ARRIVAL_TIME"
                  header="ARRIVAL TIME"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn
                  binding="START_TIME"
                  header="START TIME"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn
                  binding="RES_END_TIME"
                  header="RES END TIME"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn binding="END_TIME" header="END TIME" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />
                <WjFlexGridColumn
                  binding="TARGET_DATETIME"
                  header="TARGET DATETIME"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn
                  binding="EXTENDED_TARGET_DATE"
                  header="EXTENDED TARGET DATE"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn binding="PLAN_QTY" header="PLAN QTY" dataType="Number" />
                <WjFlexGridColumn binding="YIELD" header="YIELD" dataType="Number" />
                <WjFlexGridColumn binding="SO_ID" header="SO ID" />
                <WjFlexGridColumn binding="SO_ITEM_ID" header="SO ITEM ID" />

                <WjFlexGridColumn
                  binding="SO_DUE_DATE"
                  header="SO_DUE_DATE"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn
                  binding="EXTENDED_SO_DUE_DATE"
                  header="EXTENDED_SO_DUE_DATE"
                  format="yyyy-MM-dd HH:mm:ss"
                  dataType="Date"
                />
                <WjFlexGridColumn binding="PRIORITY" header="PRIORITY" dataType="Number" />
              </WjFlexGrid>
            </template>
            <template slot="box2" slot-scope="{ parentsHeight }">
              <div class="dx-card" :style="`height:${parentsHeight}px;`">
                <div class="dx-card-title">
                  <div class="dx-card-title-text">Task Info.</div>
                </div>
                <div class="dx-card-text">
                  <table class="moz-table-sales-order" v-if="selectedTask">
                    <tr :key="i" v-for="(key, i) in taskInfoColumns">
                      <td>{{ key }}</td>
                      <td>{{ toFormatString(selectedTask[key]) }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </template>
          </moz-split-box>
        </template>
      </moz-split-box>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DxButton } from "devextreme-vue/button";
import { DxNumberBox } from "devextreme-vue/number-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import dayjs from "dayjs";
import { Column, IGanttHeader, IGanttRow, GanttHeaderType, IGanttTask } from "mozart-common";
import { Get, Download } from "../api/mainService";
import { EventBus } from "mozart-common";
import { setVersionNo, getVersionNo, getVersionDatas, toFormatString } from "@/utils/commonUtils";
import DropDownGrid from "@/components/DropDownGrid.vue";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { ExtendGrid } from "mozart-component-wijmo";

@Component({
  components: {
    DxButton,
    DxNumberBox,
    DxLoadPanel,
    DropDownGrid,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class ResourceGantt extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];

  public selectedPlanID: string = "";
  public selectedTasks: any[] = [];
  public selectedTaskKeys: number[] = [];
  public selectedTask: any = {};

  public taskInfoColumns: string[] = [
    "STAGE_ID",
    "RESOURCE_ID",
    "LOT_ID",
    "ITEM_ID",
    "SITE_ID",
    "BUFFER_ID",
    "BOM_ID",
    "ROUTING_ID",
    "OPERATION_ID",
    "ARRIVAL_TIME",
    "START_TIME",
    "RES_END_TIME",
    "END_TIME",
    "TARGET_DATETIME",
    "EXTENDED_TARGET_DATE",
    "PLAN_QTY",
    "PLAN_UNIT_QTY",
    "PLAN_DATE",
    "PLAN_WEEK",
    "PLAN_MONTH",
    "TARGET_DATE",
    "TARGET_WEEK",
    "TARGET_MONTH",
    "YIELD",
    "USAGE_PER",
    "LOAD",
    "SO_ID",
    "SO_ITEM_ID",
    "SO_SITE_ID",
    "SO_BUFFER_ID",
    "SO_DUE_DATE",
    "EXTENDED_SO_DUE_DATE",
    "PRIORITY",
  ];
  public taskTooltipColumns: string[] = [
    "ITEM_ID",
    "START_TIME",
    "RES_END_TIME",
    "END_TIME",
    "TARGET_DATE",
    "EXTENDED_TARGET_DATE",
  ];

  public options: Record<string, any> = { loading: false };

  public columns: Column[] = [
    // new Column({
    //   field: "STAGE_ID",
    //   width: 100,
    //   merge: true,
    // }),
    new Column({
      field: "RESOURCE_GROUP",
      width: 100,
      merge: true,
    }),
    new Column({
      field: "RESOURCE_ID",
      width: 100,
      merge: true,
    }),
  ];
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  public ganttHeaders: IGanttHeader[] = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
  public ganttWidthRate: number = 0.001;
  public rowCnt: number = 8;

  public zoomMin: number = 10;
  public zoomMax: number = 100;
  public zoomStep: number = 10;
  public zoomValue: number = 30;

  public sizeMin: number = 10;
  public sizeMax: number = 100;
  public sizeStep: number = 10;
  public sizeValue: number = 40;

  public rowHeight: number = 48;
  public taskHeight: number = 43.2;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  public toFormatString(value: any) {
    return toFormatString(value);
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useSelector: false,
        useFilter: true,
        useFooter: true,
      },
    });
  }

  constructor() {
    super();
  }

  public get loading() {
    return this.options.loading;
  }

  public get renderGantt(): boolean {
    return this.minDate < this.maxDate;
  }

  public async mounted() {
    // const versionResult = await Get(
    //   "Resource",
    //   { options: { group: [{ selector: "PLAN_VERSION" }] } },
    //   "post",
    // );
    // if (versionResult && versionResult.data) {
    //   const versions = JSON.parse(versionResult.data);
    //   this.planVersionItems = versions.data;
    //   if (versions.data.length > 0) {
    //     this.selectedPlanID = versions.data[0];
    //   }
    // }
    this.planVersionItems = await getVersionDatas(["DONE"]);
    const planVersion = getVersionNo();

    this.selectedPlanID =
      planVersion && this.planVersionItems.some((item: any) => item.PLAN_ID === planVersion)
        ? planVersion
        : this.planVersionItems[0].PLAN_ID;
    this.setGanttInfo();
  }

  public async onRefreshData() {
    this.options.loading = true;

    await this.setGanttInfo();

    this.options.loading = false;
  }

  public async setGanttInfo() {
    this.selectedTasks = [];
    this.selectedTaskKeys = [];
    this.selectedTask = null;

    const ganttInfoResult = await Get(
      "ResourceGanttInfo",
      { options: { filter: ["PLAN_VERSION", "=", this.selectedPlanID] } },
      "post",
    );
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

  public async getRows(currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) {
    const result = await Get(
      "ResourceGantt",
      {
        options: {
          filter: ["PLAN_VERSION", "=", this.selectedPlanID],
          skip: currentBuffer,
          take: buffer,
        },
      },
      "post",
    );
    if (result && result.data) {
      const data = JSON.parse(result.data);
      resolve(data);
    }
    resolve([]);
  }

  public setVersionControls(version: string) {
    this.selectedPlanID = version;

    this.onRefreshData();
  }

  public async onVersionChanged(e: any) {
    setVersionNo(e.PLAN_ID);
    this.setVersionControls(e.PLAN_ID);
  }

  // public onRowHeightChanged(e: any) {
  //   this.rowHeight = e.value;
  // }

  // public onTaskHeightChanged(e: any) {
  //   this.taskHeight = e.value;
  // }

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
      options: { filter: ["PLAN_VERSION", "=", this.selectedPlanID] },
      goptions: {
        fileName: "ResourceGantt.xlsx",
        columns: [
          // "STAGE_ID",
          "RESOURCE_GROUP",
          "RESOURCE_ID",
        ],
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
      case 10:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "DD" }];
        this.ganttWidthRate = 0.00025;
        break;
      case 20:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.0005;
        break;
      case 30:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.001;
        break;
      case 40:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.0015;
        break;
      case 50:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.002;
        break;
      case 60:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.0025;
        break;
      case 70:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.003;
        break;
      case 80:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.0035;
        break;
      case 90:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.004;
        break;
      default:
        this.ganttHeaders = [{ type: "Month" }, { type: "Day", format: "MM/DD" }];
        this.ganttWidthRate = 0.005;
        break;
    }
  }

  public onSizeValueChanged() {
    let sizeRate;
    switch (this.sizeValue) {
      case 10:
        sizeRate = 0.15;
        break;
      case 20:
        sizeRate = 0.2;
        break;
      case 30:
        sizeRate = 0.3;
        break;
      case 40:
        sizeRate = 0.4;
        break;
      case 50:
        sizeRate = 0.5;
        break;
      case 60:
        sizeRate = 0.6;
        break;
      case 70:
        sizeRate = 0.7;
        break;
      case 80:
        sizeRate = 0.8;
        break;
      case 90:
        sizeRate = 0.9;
        break;
      default:
        sizeRate = 1;
        break;
    }

    this.rowHeight = 120 * sizeRate;
    this.taskHeight = 108 * sizeRate;
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

  public onSizeChanged(e: any) {
    this.sizeValue = +e.target.value;
    this.onSizeValueChanged();
  }

  public onSizeUpClick() {
    if (this.sizeValue >= this.sizeMax) return;
    this.sizeValue += this.sizeStep;
    this.onSizeValueChanged();
  }

  public onSizeDownClick() {
    if (this.sizeValue <= this.sizeMin) return;
    this.sizeValue -= this.sizeStep;
    this.onSizeValueChanged();
  }

  public onGanttRowClick(evt: Event, row: IGanttRow) {
    if (!row.tasks) return;

    this.selectedTasks = row.tasks.map((t, i) => ({ ...t.item, "ROW-ID": i }));

    if (!this.selectedTask) return;
    const rows = row.tasks.map(t => t.item.PLAN_SEQ);

    if (rows[this.selectedTaskKeys[0]] === this.selectedTask.PLAN_SEQ) return;
    this.selectedTaskKeys = [];
    this.selectedTask = null;

    const selectedTasks = document.getElementsByClassName("moz-gantt-task-selected");

    for (let i = 0; i < selectedTasks.length; i++) {
      const element = selectedTasks[i];

      if (element instanceof HTMLElement) {
        element.classList.remove("moz-gantt-task-selected");
      }
    }
  }

  public async onGanttTaskClick(evt: Event, task: IGanttTask, row: IGanttRow) {
    evt.cancelBubble = true;
    this.selectedTask = task.item;

    if (!row.tasks) return;

    const rows = row.tasks.map(t => t.item.PLAN_SEQ);
    const key = rows.findIndex(t => t === task.item.PLAN_SEQ);

    this.selectedTaskKeys = [key];
    this.selectedTasks = row.tasks.map((t, i) => ({ ...t.item, "ROW-ID": i }));
    this.$nextTick(() => {
      // this.dataGrid.navigateToRow(key);
      const selectedRow = this.dataGrid.rows.find((t: any) => t.dataItem.PLAN_SEQ === task.item.PLAN_SEQ);
      const index = selectedRow.dataIndex;

      this.dataGrid.select(index, 0); // move to target row
      this.dataGrid.rows[index].isSelected = true; // select row
      this.dataGrid.refresh(); // refresh display
    });
  }

  public setGanttTaskTooltip(task: IGanttTask, row?: IGanttRow) {
    if (task.item.ALLOC_TYPE === "SETUP") {
      return task.item.ALLOC_TYPE;
    } else if (task.item.ALLOC_TYPE === "NonWorking") {
      return "IDLE";
    } else if (task.item.ALLOC_TYPE === "PM") {
      return "The plan is a PM plan.";
    } else
      return `${this.taskTooltipColumns.reduce((result, key, idx) => {
        return `${result}<tr><td>${key}</td><td>${toFormatString(task.item[key])}</td></tr>`;
      }, "<table class='moz-table-gantt-tooltip'>")}</table>`;
  }

  public onLoadingChanged(loading: boolean) {
    // this.options.loading = loading;
  }

  public onGridSelectionChanged(evt: any) {
    if (evt.selectedRowsData.length === 0) return;
    this.selectedTask = evt.selectedRowsData[0];
  }
}
</script>
