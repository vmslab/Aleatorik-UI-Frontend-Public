<template>
  <div>
    <WjFlexGrid
      :style="`height: ${parentsHeight}px`"
      :itemsSource="dataSource"
      :initialized="onInitialized"
      selectionMode="MultiRange"
      allowSorting="MultiColumn"
      keyActionTab="Cycle"
      :autoGenerateColumns="false"
      :deferResizing="true"
      :quickAutoSize="true"
      :imeEnabled="true"
      :alternatingRowStep="0"
      :isReadOnly="true"
      :allowPinning="false"
      :showMarquee="true"
    >
      <WjFlexGridColumn aggregate="Cnt" binding="SHORT_TYPE" header="SHORT TYPE" />
      <WjFlexGridColumn binding="SHORT_CATEGORY" header="SHORT CATEGORY" />
      <WjFlexGridColumn binding="SHORT_REASON" header="SHORT REASON">
        <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
          <span class="wj-cell-text" always :tooltip="getReasonDetail(cell.item.SHORT_TYPE, cell.item.SHORT_REASON)">
            {{ cell.item.SHORT_REASON }}
          </span>
        </WjFlexGridCellTemplate>
      </WjFlexGridColumn>
      <WjFlexGridColumn binding="SHORT_QTY" header="SHORT QTY" dataType="Number" />
      <WjFlexGridColumn binding="SHORT_DETAIL_INFO" header="SHORT DETAIL INFO" />
      <WjFlexGridColumn binding="ITEM_SITE_BUFFER" header="ITEM SITE BUFFER" />
      <WjFlexGridColumn binding="BOM_ID" header="BOM ID" />
      <WjFlexGridColumn binding="ROUTING_ID" header="ROUTING ID" />
      <WjFlexGridColumn binding="OPERATION_ID" header="OPERATION ID" />
      <WjFlexGridColumn binding="RESOURCE" header="RESOURCE" />
      <WjFlexGridColumn binding="MODULE_KEY" header="MODULE KEY" :visible="false" />
      <WjFlexGridColumn binding="PHASE" header="PHASE" dataType="Number" />
      <WjFlexGridColumn binding="REF_PLAN_ID" header="REF PLAN ID" :visible="false" />
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class BOMMapViewShortLog extends Vue {
  @Prop({ type: [Number, String] }) public parentsHeight?: number | string;
  @Prop({ type: Array }) public selectedShortLog?: Array<Record<string, object>>;
  @Prop({ type: Object }) public reasonDescription?: any;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  public dataSource: any = [];

  constructor() {
    super();
  }

  public mounted() {
    this.dataSource = this.selectedShortLog;
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: this.dataGrid,
      gridOptions: {
        useAutoColumnFit: true,
        useSelector: false,
        useContextMenu: false,
        useCellTemplateTooltip: true,
      },
    });
  }

  public getReasonDetail(shortType: string, shortReason: string) {
    const shortKey = `${shortType.toLowerCase()}@${shortReason}`;
    if (shortKey in this.reasonDescription) return this.reasonDescription[shortKey][0]?.DESCRIPTION;

    return shortReason;
  }
}
</script>
