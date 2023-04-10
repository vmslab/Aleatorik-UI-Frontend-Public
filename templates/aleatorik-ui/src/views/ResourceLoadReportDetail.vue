<template>
  <div>
    <WjFlexGrid
      :style="`width: ${parentsWidth}px; height: ${parentsHeight}px;`"
      :itemsSource="dataSource"
      :initialized="onInitialized"
      showSelectedHeaders="All"
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
      :loadedRows="onLoadedRows"
      :formatItem="formatItem"
      :showMarquee="true"
    >
      <WjFlexGridColumn binding="RESOURCE_ID" header="RESOURCE_ID" aggregate="Cnt" />
      <WjFlexGridColumn binding="PLAN_DATE" header="PLAN_DATE" />
      <WjFlexGridColumn binding="ALLOCATION_KEY" header="ALLOCATION_KEY" />
      <WjFlexGridColumn binding="LOT_GROUP_KEY" header="LOT_GROUP_KEY" />
      <WjFlexGridColumn binding="LOT_ID" header="LOT_ID" />
      <WjFlexGridColumn binding="BOM_ID" header="BOM_ID" />
      <WjFlexGridColumn binding="OPERATION_ID" header="OPERATION_ID" />
      <WjFlexGridColumn binding="ARRIVAL_TIME" header="ARRIVAL_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
      <WjFlexGridColumn binding="PLAN_QTY" header="PLAN_QTY" dataType="Number" format=",##0.#########" />
      <WjFlexGridColumn binding="USAGE_PER" header="USAGE_PER" dataType="Number" format=",##0.#########" />
      <WjFlexGridColumn binding="LOAD" header="LOAD" dataType="Number" format=",##0.#########" />
      <WjFlexGridColumn binding="START_TIME" header="START_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
      <WjFlexGridColumn binding="END_TIME" header="END_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
      <WjFlexGridColumn binding="RES_END_TIME" header="RES_END_TIME" dataType="Date" format="yyyy-MM-dd HH:mm:ss" />
      <WjFlexGridColumn binding="PHASE" header="PHASE" dataType="Number" format=",##0.#########" />
      <WjFlexGridColumn binding="LEVEL" header="LEVEL" dataType="Number" format=",##0.#########" />
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GetResourceLoadReportDetail } from "@/api/mainService";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";
import dayjs from "dayjs";

@Component({
  components: { WjFlexGrid, WjFlexGridColumn },
})
export default class ResourceLoadReportDetail extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: String }) public planVersion?: string;
  // PLAN_VERSION
  @Prop({ type: String }) public siteID?: string;
  // SITE_ID
  @Prop({ type: String }) public moduleKey?: string;
  // MODULE_KEY
  @Prop({ type: String }) public resourceID?: string;
  // RESOURCE_ID
  @Prop({ type: String }) public planDate?: string;
  // PLAN_DATE

  public flexGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  constructor() {
    super();
  }

  public onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: this.flexGrid,
      gridOptions: {
        useSelector: false,
        useAutoColumnFit: false,
        useGroupPanel: false,
      },
    });
  }

  public formatItem(s: FlexGrid, e: any) {
    if (!this.isDataCell(s, e)) return;

    const item = e.getRow()?.dataItem;

    switch (e.getColumn().header) {
      case "PLAN_DATE":
        if (e.cell.querySelector("span") != null) {
          e.cell.querySelector("span").textContent = dayjs(item.PLAN_DATE).format("YYYY-MM-DD");
        }
        break;
    }
  }

  public isDataCell(s: FlexGrid, e: any) {
    return s.cells === e.panel;
  }

  public onLoadedRows(s: FlexGrid, e: any) {
    s.autoSizeColumns();
  }

  public async mounted() {
    this.dataSource = (await this.loadFunc()).data;
  }

  public async loadFunc() {
    if (!this.planDate) return [];

    const result = await GetResourceLoadReportDetail({
      PLAN_VERSION: this.planVersion,
      SITE_ID: this.siteID,
      RESOURCE_ID: this.resourceID,
      PLAN_DATE: this.planDate,
    });

    return JSON.parse(result.data);
  }
}
</script>
