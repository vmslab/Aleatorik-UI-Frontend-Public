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
      class="moz-readonly-grid"
    >
      <WjFlexGridColumn binding="SO_MONTH" :header="$t('MONTH')" aggregate="Cnt" :width="80" align="center" />
      <WjFlexGridColumn
        binding="SO_WEEK"
        :header="$t('SO WEEK')"
        :visible="selectedSummaryType === 'WEEK'"
        :width="80"
        align="center"
      />
      <WjFlexGridColumn
        binding="SO_QTY"
        :header="$t('SO QTY')"
        dataType="Number"
        format="n"
        aggregate="Sum"
        :width="80"
      />
      <WjFlexGridColumn
        binding="RTF_QTY"
        :header="$t('RTF QTY')"
        dataType="Number"
        format="n0"
        aggregate="Sum"
        :width="90"
      />

      <WjFlexGridColumn
        binding="ONTIME_RATIO"
        :header="$t('ONTIME RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="selectedSummaryType === 'MONTH' ? 100 : 80"
      />
      <WjFlexGridColumn
        binding="LATE_RATIO"
        :header="$t('LATE RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="selectedSummaryType === 'MONTH' ? 100 : 80"
      />
      <WjFlexGridColumn
        binding="RTF_RATIO"
        :header="$t('RTF RATIO')"
        dataType="Number"
        format="n2"
        aggregate="Avg"
        :width="selectedSummaryType === 'MONTH' ? 100 : 80"
      />
    </WjFlexGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Call, Get } from "@/api/mainService";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid, Row } from "@grapecity/wijmo.grid";

@Component({
  components: { WjFlexGrid, WjFlexGridColumn },
})
export default class RTFReportSummary extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: String }) public selectedPlanID?: string;
  @Prop({ type: String }) public selectedSummaryType?: string;
  @Prop({ type: String }) public selectedIsRtfTarget?: string;
  @Prop({ type: Number }) public trigger?: number;

  public selectedDate?: string = "";

  public beforeSelectedRow: any = null;

  public timeUnit = "";
  public timeKey = "";

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
        useMerge: ["MONTH"],
        setContextMenuProps: {
          useLayout: {
            mode: process.env.NODE_ENV === "development" ? "localStorage" : "uiframework",
            key: "summary",
          },
        },
        onInitialized: () => {
          let queryIndex = grid.rows.findIndex(row => {
            const rowTimeKey = this.timeUnit === "MONTH" ? row.dataItem.MONTH : row.dataItem.WEEK;
            return this.timeKey === rowTimeKey;
          });

          if (queryIndex < 0) {
            queryIndex = 0;
          }

          const row = grid.rows[queryIndex];
          const item = row?.dataItem;
          if (!item) return;

          if (item.GROUP_IDX != 1) {
            // 1이면 집계 row임
            this.$emit("click", {
              month: item.SO_MONTH,
              week: item.SO_WEEK,
            });
          }

          this.setHighlightRowElement(row);
        },
        onCellClick: (flexGrid, hitTest, e) => {
          const item = hitTest.getRow().dataItem;

          this.$emit("click", {
            month: item.GROUP_IDX == 0 ? item.SO_MONTH : "",
            week: item.SO_WEEK,
          });

          this.setHighlightRowElement(hitTest.getRow());
        },
        onRefreshed: () => {
          let queryIndex = grid.rows.findIndex(row => {
            const rowTimeKey = this.timeUnit === "MONTH" ? row.dataItem.MONTH : row.dataItem.WEEK;
            return this.timeKey === rowTimeKey;
          });

          if (queryIndex < 0) {
            queryIndex = 0;
          }

          const row = grid.rows[queryIndex];
          const item = row?.dataItem;
          if (!item) return;

          this.$emit("click", {
            month: item.GROUP_IDX == 0 ? item.SO_MONTH : "",
            week: item.SO_WEEK,
          });

          this.setHighlightRowElement(row);
        },
      },
    });
  }

  public created() {
    const urlParams = new URLSearchParams(window.location.search);

    this.timeUnit = urlParams.get("u")?.toUpperCase() || "MONTH";
    this.timeUnit = ["MONTH", "WEEK"].includes(this.timeUnit) ? this.timeUnit : "MONTH";
    this.timeKey = urlParams.get("t") || "";
  }

  @Watch("selectedPlanID")
  public onChangePlanID() {
    this.onRefreshData();
  }
  @Watch("selectedIsRtfTarget")
  public onChangeTarget() {
    this.onRefreshData();
  }
  @Watch("selectedSummaryType")
  public onChangeType() {
    this.onRefreshData();
  }

  @Watch("trigger")
  public requestRefresh() {
    this.onRefreshData();
  }

  public async mounted() {
    await this.onRefreshData();
  }

  public async onRefreshData() {
    this.dataSource = await this.loadFunc();
  }

  public formatItem(s: FlexGrid, e: any) {
    if (!this.isDataCell(s, e)) return;

    const item = e.getRow()?.dataItem;
    const col = e.getColumn().binding;

    const cell = e.cell.querySelector("span") != null ? e.cell.querySelector("span") : e.cell;

    if (item.GROUP_IDX == 1) {
      e.cell.classList.add("summary");
    }

    switch (col) {
      case "RTF_QTY":
        cell.textContent = Math.floor(item[col]).toLocaleString();
        break;
      case "ONTIME_RATIO":
      case "RTF_RATIO":
      case "LATE_RATIO":
        cell.textContent = item[col].toFixed(2).toLocaleString() + "%";
        break;
    }
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
      }),
      type: this.selectedSummaryType,
    };

    const result = await Call("RTF/GetSummary", param, "post");
    const data = JSON.parse(result.data);
    return data;
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
}
</script>
<style lang="scss">
.summary {
  background-color: #d6def8 !important;
  font-weight: bold;
}
</style>
