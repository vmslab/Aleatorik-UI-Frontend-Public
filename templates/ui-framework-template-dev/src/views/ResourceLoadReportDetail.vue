<template>
  <div>
    <DxDataGrid
      class="moz-edit-datagrid moz-controller-contains-grid footer-has-grid"
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
    >
      <DxFilterRow :visible="showRowFilter" />
      <DxHeaderFilter :visible="true" />
      <DxSummary>
        <DxTotalItem
          column="RESOURCE_ID"
          alignment="center"
          summary-type="count"
          display-format="{0} Rows"
        />
      </DxSummary>

      <DxColumn data-field="RESOURCE_ID" caption="RESOURCE_ID" />
      <DxColumn data-field="PLAN_DATE" caption="PLAN_DATE" />
      <DxColumn data-field="ALLOCATION_KEY" caption="ALLOCATION_KEY" />
      <DxColumn data-field="LOT_GROUP_KEY" caption="LOT_GROUP_KEY" />
      <DxColumn data-field="LOT_ID" caption="LOT_ID" />
      <DxColumn data-field="BOM_ID" caption="BOM_ID" />
      <DxColumn data-field="OPERATION_ID" caption="OPERATION_ID" />
      <DxColumn data-field="ARRIVAL_TIME" caption="ARRIVAL_TIME" />
      <DxColumn data-field="PLAN_QTY" caption="PLAN_QTY" />
      <DxColumn data-field="USAGE_PER" caption="USAGE_PER" />
      <DxColumn data-field="LOAD" caption="LOAD" />
      <DxColumn data-field="START_TIME" caption="START_TIME" />
      <DxColumn data-field="END_TIME" caption="END_TIME" />
      <DxColumn data-field="PHASE" caption="PHASE" />
      <DxColumn data-field="LEVEL" caption="LEVEL" />
    </DxDataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { createStoreConfig, showConfirm } from "mozart-component-wijmo";
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
import { GetResourceLoadReportDetail } from "@/api/mainService";
import CustomStore from "devextreme/data/custom_store";

import { loadLayout, saveLayout, removeLayout } from "@/utils/gridUtils";

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
  },
})
export default class ResourceLoadReportDetail extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: String }) public siteID?: string;
  // SITE_ID
  @Prop({ type: String }) public moduleKey?: string;
  // MODULE_KEY
  @Prop({ type: String }) public resourceID?: string;
  // RESOURCE_ID
  @Prop({ type: String }) public planDate?: string;
  // PLAN_DATE

  public showRowFilter: boolean = false;

  constructor() {
    super();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public mounted() {
    if (this.dataGrid) loadLayout(this.dataGrid);
    else showConfirm({ message: "Not Found Data Grid Instance !", type: "error", title: "Error" });
  }

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        loadFunc: this.loadFunc,
      }) as any,
    );
  }

  public async loadFunc() {
    if (!this.planDate) return [];

    const result = await GetResourceLoadReportDetail({
      MODULE_KEY: this.moduleKey,
      SITE_ID: this.siteID,
      RESOURCE_ID: this.resourceID,
      PLAN_DATE: this.planDate,
    });

    return JSON.parse(result.data);
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
