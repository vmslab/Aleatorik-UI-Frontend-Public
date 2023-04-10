<template>
  <div>
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller)"
      :minHeight="400"
      :boxes="[
        { type: 'rate', size: 1, minHeight: 200 },
        { type: 'rate', size: 1, minHeight: 200 },
      ]"
      resizable
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
        <DxDataGrid
          :cache-enabled="true"
          class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
          ref="dataGrid"
          :width="parentsWidth"
          :height="parentsHeight"
          :data-source="dataSource"
          :row-alternation-enabled="true"
          :show-row-lines="false"
          :show-column-lines="false"
          :allow-column-resizing="true"
          :allow-column-reordering="true"
          :column-auto-width="true"
          :hoverStateEnabled="true"
          columnResizingMode="widget"
          no-data-text="No data to display"
          @context-menu-preparing="onContextMenuPreparing"
          @row-prepared="onRowPrepared"
          @cell-prepared="onCellPrepared"
          @row-click="onRowClick"
        >
          <DxFilterRow :visible="showRowFilter" />
          <DxHeaderFilter :visible="true" />
          <DxSummary>
            <DxTotalItem
              column="SO_ID"
              alignment="center"
              summary-type="count"
              display-format="{0} Rows"
            />
          </DxSummary>

          <DxColumn data-field="SO_ID" caption="SO_ID" />
          <DxColumn data-field="ITEM_ID" caption="ITEM_ID" />
          <DxColumn data-field="SO_MONTH" caption="SO_MONTH" />
          <DxColumn data-field="SO_WEEK" caption="SO_WEEK" />
          <DxColumn
            data-field="DUE_DATE"
            caption="DUE_DATE"
            data-type="date"
            :customize-text="getDateValue"
          />
          <DxColumn
            data-field="LATEST_PLAN_DATE"
            caption="LATEST_PLAN_DATE"
            data-type="date"
            :customize-text="getDateValue"
          />
          <DxColumn
            data-field="SO_QTY"
            caption="SO_QTY"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="MAX_LATE_DAYS"
            caption="MAX_LATE_DAYS"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="ONTIME_QTY"
            caption="ONTIME_QTY"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="LATE_QTY"
            caption="LATE_QTY"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="RTF_QTY"
            caption="RTF_QTY"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="SHORT_QTY"
            caption="SHORT_QTY"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn
            data-field="LATE_DAYS"
            caption="LATE_DAYS"
            data-type="number"
            :customize-text="getFormatValue"
          />
          <DxColumn data-field="RTF_RATIO" caption="RTF_RATIO" dataType="number" format="percent" />
        </DxDataGrid>
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
        <RTFReportDetail
          :parentsWidth="parentsWidth"
          :parentsHeight="parentsHeight"
          :moduleKey="moduleKey"
          :soID="soID"
          :key="detailKey"
        />
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { createStoreConfig, SplitBox, showConfirm } from "mozart-component-wijmo";
import {
  DxDataGrid,
  DxSummary,
  DxTotalItem,
  DxColumn,
  DxExport,
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
} from "devextreme-vue/data-grid";
import { Get } from "@/api/mainService";
import CustomStore from "devextreme/data/custom_store";

import { loadLayout, saveLayout, removeLayout } from "@/utils/gridUtils";
import { toFormatString } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import RTFReportDetail from "@/views/RTFReportDetail.vue";

@Component({
  components: {
    DxDataGrid,
    DxSummary,
    DxTotalItem,
    DxColumn,
    DxExport,
    DxGrouping,
    DxGroupPanel,
    DxScrolling,
    DxSearchPanel,
    DxFilterRow,
    DxHeaderFilter,
    RTFReportDetail,
    SplitBox,
  },
})
export default class RTFReportMain extends Vue {
  @Prop({ type: String }) public selectedModuleKey?: string;
  // MODULE_KEY
  @Prop({ type: Date }) public startTime?: Date;
  // START_TIME
  @Prop({ type: Date }) public endTime?: Date;
  // END_TIME

  public beforeSelectedCell: any = null;
  public beforeSelectedCellStyle: string = "";

  public moduleKey: string = "";
  public soID: string = "";
  public detailKey: string = "";

  public showRowFilter: boolean = false;

  constructor() {
    super();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public getDateValue({ value }: any): string {
    return (value as Date).toDateString();
  }

  public getFormatValue(e: any): string {
    return toFormatString(e);
  }

  public async onRowPrepared(e: any) {
    if (!this.isDataCell(e)) return;

    const appearance = this.getRatioConditionalAppearance({ value: e.data.RTF_RATIO });

    e.cells.forEach(({ column, cellElement }: any) => {
      if (column.dataField === "RTF_RATIO")
        Object.assign(cellElement.style, this.getRatioConditionalCssStyles(appearance, false));
      else if (column.dataField === "SO_ID")
        Object.assign(cellElement.style, this.getRatioConditionalCssStyles(appearance, true));
    });
  }

  public async onCellPrepared(e: any) {
    if (!this.isDataCell(e)) return;

    if (e.column.dataField === "LATE_DAYS") {
      const appearance = this.getDayConditionalAppearance(e);
      Object.assign(e.cellElement.style, this.getDayConditionalCssStyles(appearance));
    }
  }

  public isDataCell(e: any) {
    return e.rowType === "data";
  }

  public getDayConditionalAppearance(e: any) {
    const { value } = e;

    if (value > 0) {
      return { font: "red", fill: "240, 128, 128" };
    } else {
      return { font: "blue", fill: "135, 206, 250" };
    }
  }

  public getDayConditionalCssStyles({ font, fill }: any) {
    return {
      "background-color": `rgba(${fill}, 0.5)`,
      color: `${font}`,
    };
  }

  public getRatioConditionalAppearance(e: any) {
    const { value } = e;

    let threadhold = Math.round(value * 100);
    if (threadhold < 100 && threadhold >= 90) {
      return { font: "9C6500", fill: "FFEB9C", width: threadhold };
    }
    if (threadhold < 90) {
      return { font: "EE0006", fill: "FFC7CE", width: threadhold };
    }
    return { font: "006100", fill: "C6EFCE", width: 100 };
  }

  public getRatioConditionalCssStyles({ fill, font, bold, width }: any, isHeader: boolean) {
    if (isHeader) return { "background-color": `#${fill}` };
    return {
      "background-color": `#${fill}`,
      // background: `linear-gradient(90deg, #${fill} 0%, #${fill} ${Math.round(
      //   width,
      // )}%, transparent ${Math.round(width)}%, transparent 100%)`,
      color: `#${font}`,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public async onRowClick({ data, rowElement, rowType }: any) {
    if (rowType !== "data") return;

    this.detailKey = this.soID = data.SO_ID;

    if (this.beforeSelectedCell != null && this.beforeSelectedCellStyle != null) {
      this.beforeSelectedCell.style.cssText = this.beforeSelectedCellStyle;
      this.beforeSelectedCell = null;
    }

    this.beforeSelectedCell = rowElement;
    this.beforeSelectedCellStyle = rowElement.style.cssText;
    Object.assign(rowElement.style, this.getHighlightCssStyles());
  }

  public getHighlightCssStyles() {
    return {
      "background-color": `lightgray`,
      "font-weight": "bold",
    };
  }

  public mounted() {
    this.moduleKey = this.selectedModuleKey || "";

    if (this.dataGrid) loadLayout(this.dataGrid);
    else showConfirm({ message: "Not Found Data Grid Instance !", type: "error", title: "Error" });
  }

  public get dataSource() {
    return {
      store: new CustomStore(
        createStoreConfig({
          loadFunc: this.loadFunc,
        }) as any,
      ),
    };
  }

  public async loadFunc() {
    let param = {
      obj: JSON.stringify({
        MODULE_KEY: this.selectedModuleKey,
        START_TIME: this.startTime,
        END_TIME: this.endTime,
      }),
    };

    const result = await Get("RTFReport", param, "post");
    const data = JSON.parse(result.data);
    return data;
  }

  public async onSaveLayout() {
    try {
      await saveLayout(this.dataGrid);
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onRemoveLayout() {
    try {
      await removeLayout(this.dataGrid);
    } catch (e) {
      console.log("err", e);
    }
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    e.items.push({
      text: "Show Column Chooser",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.showColumnChooser();
      },
    });

    e.items.push({
      text: "Show Filter Row",
      icon: this.showRowFilter ? "check" : "",
      beginGroup: true,
      onItemClick: () => {
        this.showRowFilter = !this.showRowFilter;
      },
    });

    if (e.column && (e.target == "headerPanel" || (e.row && e.row.rowType == "group"))) {
      let expandItems = [
        {
          text: "Expand All",
          onItemClick: (args: any) => {
            this.dataGrid.expandAll();
          },
        },
      ];
      let collapseItems = [
        {
          text: "Collapse All",
          onItemClick: (args: any) => {
            this.dataGrid.collapseAll();
          },
        },
      ];

      if (e.row && e.row.rowType == "group") {
        expandItems.push({
          text: `Expand Group '${e.row.key}'`,
          onItemClick: (args: any) => {
            this.dataGrid.expandRow(e.row.key);
          },
        });
        collapseItems.push({
          text: `Collapse Group '${e.row.key}'`,
          onItemClick: (args: any) => {
            this.dataGrid.collapseRow(e.row.key);
          },
        });
      }

      e.items.push({
        text: "Expand",
        beginGroup: true,
        items: expandItems,
      });
      e.items.push({
        text: "Collpase",
        items: collapseItems,
      });
    }

    e.items.push({
      text: "Layout",
      beginGroup: true,
      items: [
        {
          text: "Save Layout",
          onItemClick: (args: any) => {
            this.onSaveLayout();
          },
        },
        {
          text: "Remove Layout",
          onItemClick: (args: any) => {
            this.onRemoveLayout();
          },
        },
      ],
    });

    e.items.push({
      text: "Export to Excel",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.exportToExcel();
      },
    });
  }
}
</script>
