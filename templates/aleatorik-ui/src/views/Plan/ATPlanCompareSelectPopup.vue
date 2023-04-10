<template>
  <DxPopup
    class="moz-popup"
    :visible="visible"
    :show-title="true"
    :width="width"
    :height="height"
    title="Select Plan Versions"
    @hidden="handleClose"
  >
    <div class="moz-area-padding">
      <WjFlexGrid
        :style="{
          width: `calc(${typeof width === 'string' ? width : width + 'px'} - (var(--size-content-padding) * 2))`,
          height: `calc(${
            typeof height === 'string' ? height : height + 'px'
          } - var(--size-card-title-height) - var(--size-toolbar-bottom) - (var(--size-content-padding) * 2))`,
        }"
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
        :allowPinning="false"
        :showMarquee="true"
      >
        <WjFlexGridColumn binding="PLAN_ID" header="PLAN ID" width="*" />
        <WjFlexGridColumn binding="SOURCE_ID" header="SOURCE_ID" width="*" />
        <WjFlexGridColumn binding="SCENARIO_ID" header="SCENARIO ID" width="*" />
        <WjFlexGridColumn
          binding="PLAN_START_TIME"
          header="PLAN START TIME"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          width="*"
        />
        <WjFlexGridColumn binding="PLAN_PERIOD" header="PLAN PERIOD" width="*" />
        <WjFlexGridColumn binding="PLAN_TYPE" header="PLAN TYPE" width="*" />
        <WjFlexGridColumn binding="DESCRIPTION" header="DESCRIPTION" width="*" />
      </WjFlexGrid>
    </div>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{
        text: $t('Open'),
        stylingMode: 'outlined',
        class: 'moz-button',
        onClick: handleAction,
      }"
    >
    </DxToolbarItem>
  </DxPopup>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { ActionLoadOptions, showAlert, ExtendGrid } from "mozart-component-wijmo";
import { Get } from "@/api/mainService";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { CollectionView } from "@grapecity/wijmo";

@Component({
  name: "ATPlanCompareSelectPopup",
  components: {
    DxPopup,
    DxToolbarItem,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class ATPlanCompareSelectPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public visible?: boolean;
  @Prop({ type: Object, required: false }) public version?: any;

  @Prop({ type: [Number, String], required: false }) public width?: number | string;
  @Prop({ type: [Number, String], required: false }) public height?: number | string;

  @Prop({ type: [Array, Object], required: false }) public selectedValue?: any;

  public tableName: string = "ATPlan";
  public dataKey: string = "PLAN_ID";

  public loadedData: any[] = [];
  public loadingVisible = false;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public selectedRow: any = [];

  constructor() {
    super();
  }

  public async mounted() {
    await this.onRefreshData();
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.dataGrid?.hostElement?.addEventListener("click", this.onRowClick);
    this.dataGrid?.selectionChanged.addHandler(this.onSelectionChanged);
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        // mode: "virtual",
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
        useAutoColumnFit: true,
      },
    });
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      // setOnEditing(false);

      this.dataSource = new CollectionView(await this.loadFunc({}));
      this.dataGrid.refresh();
    } finally {
      this.loadingVisible = false;
    }
  }

  @Watch("visible")
  public async onVisibleChanged() {
    if (this.visible) await this.dataGrid?.refresh();

    this.$nextTick(() => {
      this.selectRelatedRows(this.version);
    });
  }

  public selectRelatedRows(version: any) {
    if (!version || !this.loadedData) return;

    const filterRows = this.dataGrid.rows.filter(
      (item: any) =>
        item.PLAN_ID === version.PLAN_ID ||
        item.PLAN_ID === version.SOURCE_ID ||
        item.SOURCE_ID === version.PLAN_ID ||
        (version.SOURCE_ID && item.SOURCE_ID === version.SOURCE_ID),
    );

    if (filterRows.length > 0) {
      const index = filterRows[0].dataIndex;

      this.dataGrid.select(index, 0); // move to target row
      this.dataGrid.rows[index].isSelected = true; // select row
      this.dataGrid.refresh(); // refresh display
    }
  }

  public onRowClick(e: any) {
    const hti = this.dataGrid.hitTest(e);
    const col = hti.col;
    const row = hti.row;
    if (hti.panel === this.dataGrid.cells) {
      hti.panel.rows[row].isSelected = true;
      this.dataGrid.refresh();
    }
    if (hti.panel === this.dataGrid.columnHeaders) {
      // grid header clicked
      const header = hti.panel.columns[col].header;
      // console.log("Clicked on " + header);
    }
  }

  public async loadFunc(obj: ActionLoadOptions) {
    const result = await Get(this.tableName, { option: obj, where: JSON.stringify({ PLAN_STATUS: "DONE" }) }, "post");
    const data = JSON.parse(result.data);

    this.loadedData = data.data;

    return data.data;
  }

  @Watch("checkGroupPanel", { immediate: true })
  public onChangeShowGroupPanel() {
    this.$nextTick(() => {
      let panel = document.querySelector(".dx-datagrid-header-panel") as HTMLElement;
      if (panel != null) panel.style.display = "none";
    });
  }

  public onSelectionChanged(e: any) {
    const selectedRow = this.dataGrid.rows.filter((r: any) => r.isSelected).map((item: any) => item.dataItem);

    if (selectedRow.length === 1) {
      this.selectRelatedRows(selectedRow[0]);
    }

    this.setSelectedRowKey(selectedRow);

    this.selectedRow = selectedRow;
  }

  public setSelectedRowKey(selectedRowsData: any) {
    this.$emit("value-changed", selectedRowsData);
  }

  public handleClose() {
    this.$emit("close", {});
  }

  public async handleAction() {
    const selectedRows = this.selectedRow;
    if (selectedRows.length === 0) {
      await showAlert({
        message: "Required select at least one item!",
        type: "error",
        title: "Error",
      });
      return;
    }

    const selectedKeys = selectedRows.map((item: any) => item[this.dataKey]);

    this.$emit("action", { planIDs: selectedKeys });
  }
}
</script>
