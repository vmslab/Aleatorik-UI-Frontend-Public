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
      <DxFilterRow :visible="gridContextOptions.checkRowFilter" />
      <DxHeaderFilter :visible="true" />
      <DxSummary>
        <DxTotalItem
          column="MODULE_KEY"
          alignment="center"
          summary-type="count"
          display-format="{0} Rows"
        />
      </DxSummary>

      <DxColumn data-field="MODULE_KEY" caption="MODULE_KEY" />
      <DxColumn
        data-field="PHASE"
        caption="PHASE"
        data-type="number"
        :customize-text="getFormatValue"
      />
      <DxColumn
        data-field="SHORT_SEQ"
        caption="SHORT_SEQ"
        data-type="number"
        :customize-text="getFormatValue"
      />
      <DxColumn data-field="SHORT_TYPE" caption="SHORT_TYPE" />
      <DxColumn data-field="SHORT_CATEGORY" caption="SHORT_CATEGORY" />
      <DxColumn data-field="SHORT_REASON" caption="SHORT_REASON" />
      <DxColumn
        data-field="SHORT_QTY"
        caption="SHORT_QTY"
        data-type="number"
        :customize-text="getFormatValue"
      />
      <DxColumn data-field="SHORT_DETAIL_INFO" caption="SHORT_DETAIL_INFO" />
      <DxColumn data-field="ITEM_SITE_BUFFER" caption="ITEM_SITE_BUFFER" />
      <DxColumn data-field="OPERATION_ID" caption="OPERATION_ID" />
      <DxColumn data-field="RESOURCE_ID" caption="RESOURCE_ID" />
      <DxColumn data-field="BOM_ID" caption="BOM_ID" />
      <DxColumn data-field="ROUTING_ID" caption="ROUTING_ID" />
      <DxColumn data-field="REF_PLAN_ID" caption="REF_PLAN_ID" />
    </DxDataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { createStoreConfig } from "mozart-component-wijmo";
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

import { loadLayout, saveLayout, removeLayout, createContextMenu } from "@/utils/gridUtils";
import { toFormatString } from "@/utils/commonUtils";

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
  @Prop({ type: String }) public soID?: string;
  // SITE_ID
  @Prop({ type: String }) public moduleKey?: string;
  // MODULE_KEY

  public gridContextOptions = {
    checkRowFilter: false,
  };

  constructor() {
    super();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public getFormatValue(e: any): string {
    return toFormatString(e);
  }

  public mounted() {}

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        loadFunc: this.loadFunc,
        onLoaded: this.onLoaded,
      }) as any,
    );
  }

  public isFirstLoad = true;
  public async onLoaded() {
    if (this.isFirstLoad) {
      await loadLayout(this.dataGrid, "shortLog");
      this.isFirstLoad = false;
    }
  }

  public async loadFunc() {
    if (!this.soID) return [];

    let param = {
      obj: JSON.stringify({
        MODULE_KEY: this.moduleKey,
        TARGET_ID: this.soID,
        TARGET_TYPE: "SalesOrder",
      }),
    };
    const result = await Get("RTFReportDetail", param, "post");

    return JSON.parse(result.data);
  }

  public async onSaveLayout() {
    try {
      await saveLayout(this.dataGrid, "shortLog");
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onRemoveLayout() {
    try {
      await removeLayout(this.dataGrid, "shortLog");
    } catch (e) {
      console.log("err", e);
    }
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    createContextMenu(e, this.gridContextOptions);
    e.items.push({
      text: "Show Production Plan",
      icon: "new-tab",
      beginGroup: true,
      onItemClick: () => {
        window.open(
          // `/view/97D8D7CB-F4E8-E7A6-4C42-B3F317D78FA2/4BDFB139-2DA4-5778-C2DE-AA89E7E384AE/aleatorikui?s=${this.soID}`,
          `/production-gantt?s=${this.soID}`,
          "_blank",
        );
      },
    });
  }
}
</script>
