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
      :formatItem="formatItem"
      :showMarquee="true"
      class="moz-readonly-grid rtf-grid"
    >
      <WjFlexGridColumn binding="SO_ID" :header="$t('SO ID')" aggregate="Cnt" :width="90" />
      <WjFlexGridColumn
        binding="ONTIME_RATIO"
        :header="$t('ONTIME RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="120"
      />
      <WjFlexGridColumn
        binding="LATE_RATIO"
        :header="$t('LATE RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="110"
      />
      <WjFlexGridColumn
        binding="RTF_RATIO"
        :header="$t('RTF RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="110"
      />
      <WjFlexGridColumn binding="ITEM_ID" :header="$t('ITEM ID')" :width="120" />
      <WjFlexGridColumn binding="SO_WEEK" :header="$t('SO WEEK')" :width="120" align="center" />
      <WjFlexGridColumn binding="DUE_DATE" :header="$t('DUE DATE')" :width="140" />
      <WjFlexGridColumn binding="SO_QTY" :header="$t('SO QTY')" dataType="Number" format="n" :width="100" />
      <WjFlexGridColumn binding="ONTIME_QTY" :header="$t('ONTIME QTY')" dataType="Number" format="n" :width="110" />
      <WjFlexGridColumn binding="LATE_QTY" :header="$t('LATE QTY')" dataType="Number" format="n" :width="100" />
      <WjFlexGridColumn binding="RTF_QTY" :header="$t('RTF QTY')" dataType="Number" format="n" :width="100" />
      <WjFlexGridColumn binding="SHORT_QTY" :header="$t('SHORT QTY')" dataType="Number" format="n" :width="110" />
      <WjFlexGridColumn binding="RTF_TARGET" :header="$t('RTF TARGET')" :width="110" align="center" />
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Call, Get } from "@/api/mainService";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid, Row } from "@grapecity/wijmo.grid";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class RTFReportMain extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: String }) public selectedPlanID?: string;
  // PLAN_VERSION
  @Prop({ type: String }) public selectedIsRtfTarget?: string;
  // // IS_RTF_TARGET
  @Prop({ type: String }) public selectedSummaryType?: string;
  @Prop({ type: String }) public selectedMonth?: string;
  @Prop({ type: String }) public selectedWeek?: string;

  public beforeSelectedRow: any = null;

  public flexGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;

  public dataSource: any = [];

  constructor() {
    super();
  }

  // @Watch("selectedMonth")
  // public onChange() {
  //   this.refreshData();
  // }

  @Watch("selectedMonth")
  public onChangeMonth() {
    this.refreshData();
  }

  @Watch("selectedWeek")
  public onChangeWeek() {
    this.refreshData();
  }

  public onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: this.flexGrid,
      gridOptions: {
        useSelector: false,
        useAutoColumnFit: false,
        useGroupPanel: false,
        onInitialized: () => {
          if (!this.flexGrid?.rows[0]) return;
          this.$emit("click", this.flexGrid.rows[0].dataItem.SO_ID);

          this.setHighlightRowElement(this.flexGrid.rows[0]);
        },
        onCellClick: (flexGrid, hitTest, e) => {
          this.$emit("click", hitTest.getRow().dataItem.SO_ID);

          this.setHighlightRowElement(hitTest.getRow());
        },
      },
    });
  }

  public async refreshData() {
    this.dataSource = await this.loadFunc();
  }

  public async mounted() {
    this.dataSource = await this.loadFunc();
  }

  public formatItem(s: FlexGrid, e: any) {
    if (!this.isDataCell(s, e)) return;

    const item = e.getRow()?.dataItem;
    const col = e.getColumn().binding;

    const cell = e.cell.querySelector("span") != null ? e.cell.querySelector("span") : e.cell;

    switch (col) {
      case "RTF_QTY":
      case "ONTIME_QTY":
      case "LATE_QTY":
        /**
         * 소수점 처리 로직 변경
         * floor => ceil
         * 2023-03-07, 이진영 수정
         * 로직 변경
         * ceil => backend sql query
         * 2023-03-15 Hawon Kim
         */
        cell.textContent = item[col].toLocaleString();
        break;
      case "RTF_RATIO":
      case "ONTIME_RATIO":
      case "LATE_RATIO":
        cell.textContent = item[col].toFixed(2).toLocaleString() + "%";
        break;
    }

    if (item.RTF_RATIO >= 100) return;

    if (item.RTF_RATIO < 100) {
      e.cell.classList.add("ratio-short");
    }

    switch (col) {
      // case "SHORT_QTY":
      //   if (item.RTF_RATIO < 100) {
      //     const cell = e.cell.querySelector("span") != null ? e.cell.querySelector("span") : e.cell;
      //     cell.textContent = "0";
      //   }
      //   break;
      case "RTF_RATIO":
        if (item.RTF_RATIO < 100) {
          e.cell.classList.add("ratio-short-font");
        }
        break;
    }
  }

  public isDataCell(s: FlexGrid, e: any) {
    return s.cells === e.panel;
  }

  public setHighlightRowElement(row: Row) {
    if (this.beforeSelectedRow != null) {
      this.beforeSelectedRow.cssClass = "";
      this.beforeSelectedRow = null;
    }

    this.$nextTick(() => {
      this.beforeSelectedRow = row;
      row.cssClass = "aleatorik-clicked-state";
    });
  }

  public async loadFunc() {
    if (!this.selectedPlanID) {
      return;
    }

    let param = {
      obj: JSON.stringify({
        PLAN_VERSION: this.selectedPlanID,
        IS_RTF_TARGET: this.selectedIsRtfTarget,
        SUMMARY_TYPE: this.selectedSummaryType,
        SO_MONTH: this.selectedMonth?.replace(/-/gi, "") || "",
        SO_WEEK: this.selectedWeek?.replace(/\//gi, "") || "",
      }),
    };

    const result = await Call("RTF/GetDetail", param, "post");
    const data = JSON.parse(result.data);
    return data;
  }
}
</script>
<style lang="scss">
.wj-flexgrid .wj-cells .wj-row {
  &:nth-child(n) {
    .wj-cell.ratio-short {
      // 흰 배경일때 ratio-short 일때
      background-color: #fbecec !important;

      // 그 상태에서 clicked 했을때
      &.aleatorik-clicked-state {
        background-color: #eae0ec !important;
      }
    }
  }

  &:nth-child(2n) {
    .wj-cell.ratio-short {
      // 파란 배경에서 ratio-short 일때
      background-color: #f5e6ea !important;

      &.aleatorik-clicked-state {
        background-color: #e5daea !important;
      }
    }
  }

  &:hover {
    .wj-cell.ratio-short:not(.wj-header) {
      background-color: #d4cde8 !important;
    }
  }
}
.wj-flexgrid .wj-cells .wj-cell.ratio-short-font span {
  color: #dc5a5a;
}
</style>
