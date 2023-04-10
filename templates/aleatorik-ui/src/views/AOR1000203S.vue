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
      :imeEnabled="true"
      :alternatingRowStep="0"
      :isReadOnly="true"
      :showMarquee="true"
    >
      <WjFlexGridColumn binding="SHORT_TYPE" header="SHORT_TYPE" aggregate="Cnt" :width="120" />
      <WjFlexGridColumn binding="SHORT_CATEGORY" header="SHORT_CATEGORY" :width="150" />
      <WjFlexGridColumn binding="SHORT_REASON" header="SHORT_REASON" :width="150">
        <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
          <span class="wj-cell-text" always :tooltip="getReasonDetail(cell.item.SHORT_TYPE, cell.item.SHORT_REASON)">
            {{ cell.item.SHORT_REASON }}
          </span>
        </WjFlexGridCellTemplate>
      </WjFlexGridColumn>
      <WjFlexGridColumn binding="SHORT_QTY" header="SHORT_QTY" dataType="Number" format=",##0.#########" :width="110" />
      <WjFlexGridColumn binding="SHORT_DETAIL_INFO" header="SHORT_DETAIL_INFO" :width="150" />
      <WjFlexGridColumn binding="ITEM_SITE_BUFFER" header="ITEM_SITE_BUFFER" :width="200" />
      <WjFlexGridColumn binding="BOM_ID" header="BOM_ID" width="1*" />
      <WjFlexGridColumn binding="ROUTING_ID" header="ROUTING_ID" width="1*" />
      <WjFlexGridColumn binding="OPERATION_ID" header="OPERATION_ID" :width="140" />
      <WjFlexGridColumn binding="RESOURCE" header="RESOURCE" :width="120" />
      <WjFlexGridColumn binding="MODULE_KEY" header="MODULE_KEY" :visible="false" />
      <WjFlexGridColumn binding="PHASE" header="PHASE" data-type="Number" format=",##0.#########" :visible="false" />
      <WjFlexGridColumn binding="REF_PLAN_ID" header="REF_PLAN_ID" :visible="false" />
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Get } from "@/api/mainService";
import { ExtendGrid, IMenuItemEventArgs } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";

import { loadTableDatas } from "@/utils/dataUtils";
import { EventBus } from "mozart-common";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class ResourceLoadReportDetail extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: String }) public selectedPlanID?: string;
  // PLAN_VERSION
  @Prop({ type: String }) public selectedSOID?: string;
  // SO_ID

  public reasonDescription: any = [];

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
        useGroupPanel: false,
        useCellTemplateTooltip: true,
        setContextMenuProps: {
          useLayout: {
            mode: process.env.NODE_ENV === "development" ? "localStorage" : "uiframework",
            key: "shortLog",
          },
        },
        onInitialized: extendGrid => {
          extendGrid.contextMenu?.addMenuItem({ header: "-" });
          extendGrid.contextMenu?.addMenuItem({
            header: "Show BOM Map View",
            cmd: "OPN_BOM",
            active: ({ hitTest }: IMenuItemEventArgs) => {
              return !!hitTest?.getRow()?.dataItem?.SO_ID;
            },
            clicked: ({ hitTest }: IMenuItemEventArgs) => {
              EventBus.fire("open-popup", {
                params: { key: "bom-map-view", params: `?s=${this.selectedSOID}` },
              });
            },
          });
        },
      },
    });
  }

  public getReasonDetail(shortType: string, shortReason: string) {
    const shortKey = `${shortType.toLowerCase()}@${shortReason}`;
    if (shortKey in this.reasonDescription) return this.reasonDescription[shortKey];

    return shortReason;
  }

  public async created() {
    const logMaster = await loadTableDatas("AT_SHORT_LOG_MASTER");

    for await (const item of logMaster) {
      const shortKey = `${item.SHORT_TYPE.toLowerCase()}@${item.SHORT_REASON}`;
      if (shortKey in this.reasonDescription) continue;

      this.reasonDescription[shortKey] = item.DESCRIPTION;
    }
  }

  @Watch("selectedSOID")
  public onPropsChange() {
    this.refreshData();
  }
  public async refreshData() {
    this.dataSource = await this.loadFunc();
  }

  public async mounted() {
    this.dataSource = await this.loadFunc();
  }

  public async loadFunc() {
    if (!this.selectedSOID) return [];

    let param = {
      obj: JSON.stringify({
        PLAN_VERSION: this.selectedPlanID,
        TARGET_ID: this.selectedSOID,
        TARGET_TYPE: "SalesOrder",
      }),
    };
    const result = await Get("RTFReportDetail", param, "post");

    return JSON.parse(result.data);
  }
}
</script>
