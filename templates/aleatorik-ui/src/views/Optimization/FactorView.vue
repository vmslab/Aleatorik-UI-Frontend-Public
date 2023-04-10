<template>
  <div>
    <WjFlexGrid
      class="factor-view"
      :itemsSource="data"
      showSelectedHeaders="All"
      selectionMode="MultiRange"
      allowSorting="MultiColumn"
      keyActionTab="Cycle"
      :autoGenerateColumns="false"
      :deferResizing="true"
      :quickAutoSize="true"
      :imeEnabled="true"
      :alternatingRowStep="0"
      :isReadOnly="true"
      :initialized="onInitialized"
    >
      <WjFlexGridColumn binding="category" header="카테고리" :minWidth="75" />
      <WjFlexGridColumn binding="key" header="이름" :minWidth="360" />
      <WjFlexGridColumn binding="first" header="초기값" />
      <WjFlexGridColumn binding="end" header="최적값" />
      <WjFlexGridColumn binding="diff" header="변화량" cell-template="diff" alignment="right">
        <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
          <span v-if="cell.item.diff >= 0" style="color: var(--color-success)">{{
            cell.item.diff
          }}</span>
          <span v-else style="color: var(--color-error)">({{ Math.abs(cell.item.diff) }})</span>
        </WjFlexGridCellTemplate>
      </WjFlexGridColumn>
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";

import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate },
})
export default class PerformanceReport extends Vue {
  @Prop({ type: Array }) public data?: any[];
  @Prop({ type: Number }) public height?: number;

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useFooter: false,
        useGroupPanel: false,
        useMerge: ["category"],
        useParseDate: false,
        useSelector: false,
        useAutoColumnFit: false,
        useCellTemplateTooltip: false,
      },
    });
  }
}
</script>
<style lang="scss" scoped>
.factor-view {
  height: calc(var(--size-content-height-outer-controller) - var(--size-card-title-height));
}
</style>
