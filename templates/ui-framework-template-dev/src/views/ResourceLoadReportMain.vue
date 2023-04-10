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
        <DxPivotGrid
          class="moz-edit-pivot moz-edit-pivot-mouse-action"
          ref="pivotGrid"
          :width="parentsWidth"
          :height="parentsHeight"
          :data-source="dataSource"
          :allow-sorting-by-summary="true"
          :allow-sorting="true"
          :allow-filtering="true"
          :show-borders="true"
          :show-column-grand-totals="false"
          :show-row-grand-totals="false"
          :show-row-totals="false"
          :show-column-totals="false"
          :hoverStateEnabled="true"
          @context-menu-preparing="onContextMenuPreparing"
          @cell-prepared="onCellPrepared"
          @cell-click="onCellClick"
        >
          <DxFieldChooser :enabled="true" :allow-search="true" apply-changes-mode="onDemand" />
        </DxPivotGrid>
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight }">
        <ResourceLoadReportDetail
          :parentsWidth="parentsWidth"
          :parentsHeight="parentsHeight"
          :moduleKey="moduleKey"
          :siteID="siteID"
          :resourceID="resourceID"
          :planDate="planDate"
          :key="detailKey"
        />
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { createStoreConfig, SplitBox } from "mozart-component-wijmo";
import { DxPivotGrid, DxFieldChooser } from "devextreme-vue/pivot-grid";
import { GetResourceLoadReport } from "@/api/mainService";
import CustomStore from "devextreme/data/custom_store";

import ResourceLoadReportDetail from "@/views/ResourceLoadReportDetail.vue";

@Component({
  components: {
    DxPivotGrid,
    DxFieldChooser,
    ResourceLoadReportDetail,
    SplitBox,
  },
})
export default class ResourceLoadReportMain extends Vue {
  @Prop({ type: String }) public selectedModuleKey?: string;
  // MODULE_KEY
  @Prop({ type: Array }) public selectedResourceGrp?: string[];
  // RESOURCE_GROUP
  @Prop({ type: Date }) public startTime?: Date;
  // START_TIME
  @Prop({ type: Date }) public endTime?: Date;
  // END_TIME

  public beforeSelectedCell: any = null;
  public beforeSelectedCellStyle: string = "";

  public moduleKey: string = "";
  public siteID: string = "";
  public resourceID: string = "";
  public planDate: string = "";
  public detailKey: string = "";

  constructor() {
    super();
  }

  public get pivotGrid() {
    return (this.$refs.pivotGrid as any).instance;
  }

  public async onCellPrepared({ cell, area, cellElement }: any) {
    cell.area = area;
    if (this.isDataCell(cell) || this.isTotalCell(cell)) {
      const appearance = this.getConditionalAppearance(cell);
      Object.assign(cellElement.style, this.getConditionalCssStyles(appearance));
    }
  }

  public isDataCell(cell: any) {
    return cell.area === "data" && cell.rowType === "D" && cell.columnType === "D";
  }

  public isTotalCell(cell: any) {
    return (
      cell.type === "T" ||
      cell.type === "GT" ||
      cell.rowType === "T" ||
      cell.rowType === "GT" ||
      cell.columnType === "T" ||
      cell.columnType === "GT"
    );
  }

  public getConditionalAppearance(cell: any) {
    if (this.isTotalCell(cell)) {
      return { fill: "F2F2F2", font: "3F3F3F", bold: true };
    }
    const { value } = cell;

    let threadhold = Math.round(value * 100);
    if (threadhold < 100 && threadhold > 10) {
      return { font: "9C6500", fill: "FFEB9C", width: threadhold };
    }
    if (threadhold <= 10) {
      return { font: "EE0006", fill: "FFC7CE", width: threadhold };
    }
    return { font: "006100", fill: "C6EFCE", width: 100 };
  }

  public getConditionalCssStyles({ fill, font, bold, width }: any) {
    return {
      background: `linear-gradient(90deg, #${fill} 0%, #${fill} ${Math.round(
        width,
      )}%, transparent ${Math.round(width)}%, transparent 100%)`,
      color: `#${font}`,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public async onCellClick({ cell, area, cellElement, columnFields, rowFields }: any) {
    if (area != "data") return;
    cell.area = area;

    let planDateIdx = columnFields.findIndex((x: any) => x.dataField == "PLAN_DATE");
    // PivotGrid ColumnField 중 PLAN_DATE의 Index를 탐색
    let siteIdx = rowFields.findIndex((x: any) => x.dataField == "SITE_ID");
    let resourceIdx = rowFields.findIndex((x: any) => x.dataField == "RESOURCE_ID");
    // PivotGrid RowField 중 SITE_ID와 RESOURCE_ID의 Index를 탐색
    if (planDateIdx < 0 || resourceIdx < 0) return;

    let planDate = cell.columnPath[planDateIdx];
    // 선택한 셀의 PLAN_DATE의 값
    let siteID = cell.rowPath[siteIdx];
    let resourceID = cell.rowPath[resourceIdx];
    // 선택한 셀의 SITE_ID와 RESOURCE_ID의 값

    this.resourceID = resourceID;
    this.planDate = planDate;
    this.siteID = siteID;
    // 찾은 값을 Sub Grid를 구현한 Component에 전달

    this.detailKey = siteID + "@" + resourceID + "@" + planDate;
    // key 값을 변경하여 Sub Grid를 구현한 Component를 Rerendering (선택한 cell이 같을 경우에 Rerendering 하지 않음)

    if (this.beforeSelectedCell != null && this.beforeSelectedCellStyle != null) {
      this.beforeSelectedCell.style.cssText = this.beforeSelectedCellStyle;
      this.beforeSelectedCell = null;
    }

    if (this.isDataCell(cell)) {
      this.beforeSelectedCell = cellElement;
      this.beforeSelectedCellStyle = cellElement.style.cssText;
      Object.assign(cellElement.style, this.getHighlightCssStyles());
    }
    // 선택한 셀에 Style 효과
  }

  public getHighlightCssStyles() {
    return {
      "background-color": `lightgray`,
      "font-weight": "bold",
    };
  }

  public async mounted() {
    this.moduleKey = this.selectedModuleKey || "";
  }

  public get dataSource() {
    return {
      fields: [
        { dataField: "SITE_ID", area: "row", expanded: true },
        { dataField: "RESOURCE_GROUP", area: "row", expanded: true },
        { dataField: "RESOURCE_ID", area: "row", expanded: true },

        { dataField: "PLAN_YEAR", area: "column", expanded: true },
        { dataField: "PLAN_WEEK", area: "column", expanded: true },
        { dataField: "PLAN_DATE", area: "column", expanded: true },

        {
          dataField: "LOAD_RATIO",
          area: "data",
          summaryType: "sum",
          dataType: "number",
          format: "percent",
        },
      ],
      store: new CustomStore(
        createStoreConfig({
          loadFunc: this.loadFunc,
        }) as any,
      ),
    };
  }

  public async loadFunc() {
    const result = await GetResourceLoadReport({
      MODULE_KEY: this.selectedModuleKey,
      RESOURCE_GROUP_ID: this.selectedResourceGrp,
      START_TIME: this.startTime,
      END_TIME: this.endTime,
    });
    return JSON.parse(result.data);
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    e.items.push({
      text: "Export to Excel",
      beginGroup: true,
      onItemClick: () => {
        this.pivotGrid.exportToExcel();
      },
    });
  }
}
</script>
