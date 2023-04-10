<template>
  <DxDropDownBox
    ref="dropdown"
    :width="comboBoxWidth"
    :value="selectedValue || ''"
    :defer-rendering="false"
    :data-source="loadedItems"
    :display-expr="displayExpr || getKeyExpr()"
    :value-expr="valueExpr || getKeyExpr()"
    :accept-custom-value="true"
    :focusStateEnabled="false"
    @value-changed="onValueChanged"
    :dropDownOptions="{
      width: width,
    }"
    @content-ready="onContentReady"
    @opened="setColumnWidth"
  >
    <template #content="{}">
      <div>
        <WjFlexGrid
          :style="{ width: `${width}px`, minHeight: `${height}px` }"
          :itemsSource="source || []"
          :initialized="onInitialized"
          selectionMode="MultiRange"
          keyActionTab="Cycle"
          :allowDelete="false"
          :autoGenerateColumns="false"
          :deferResizing="false"
          :quickAutoSize="true"
          :imeEnabled="true"
          :alternatingRowStep="0"
          :isReadOnly="true"
          :allowPinning="false"
          headersVisibility="Column"
          autoSizeMode="Both"
        >
          <WjFlexGridColumn
            v-for="field in dataFields"
            :key="field.key || field.name"
            :binding="field.key || field.name"
            :header="field.caption || field.key || field.name"
            :format="getDisplayFormat(field.type)"
            :dataType="getType(field.type)"
          />
        </WjFlexGrid>
        <Pagination
          :current-page="source.pageIndex + 1"
          :total-page="source.pageCount"
          @change="pageMove"
        />
      </div>
    </template>
  </DxDropDownBox>
</template>

<script lang="ts">
import { union } from "lodash";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { createStoreConfig, ActionLoadOptions, ExtendGrid } from "mozart-component-wijmo";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

import DxDropDownBox from "devextreme-vue/drop-down-box";
import { CollectionView } from "@grapecity/wijmo";
import { WjCollectionViewNavigator } from "@grapecity/wijmo.vue2.input";
import Pagination from "@/components/Pagination.vue";

@Component({
  name: "DropDown",
  components: {
    DxDropDownBox,
    WjFlexGrid,
    WjFlexGridColumn,
    WjCollectionViewNavigator,
    Pagination,
  },
})
export default class DropDownBox extends Vue {
  @Prop({ type: Number, required: false }) public comboBoxWidth?: number;
  @Prop({ type: Number, required: false }) public width?: number;
  @Prop({ type: Number, required: false }) public height?: number;
  @Prop({ type: [String, Array], required: true }) public dataKey?: string | string[];
  @Prop({ type: Array }) public items?: any;
  @Prop({ type: Function }) public dataSource?: any;

  @Prop({ type: Array, required: true }) public dataFields?: object[];
  @Prop({ type: String, required: false }) public selectedValue?: string;
  @Prop({ type: Number, required: false }) public pageSize?: number;

  @Prop({ type: String, required: false }) public displayExpr?: string;
  @Prop({ type: String, required: false }) public valueExpr?: string;

  public selectedKey: any[] = [];
  public loadedItems: any[] = [];
  public source: any = null;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  constructor() {
    super();
  }

  @Watch("items", { immediate: true })
  public onItemsChanged() {
    this.loadedItems = this.items;
    this.source = new CollectionView(this.items, {
      pageSize: this.pageSize,
      pageChanged: this.setColumnWidth,
    });
    console.log(this.source);
  }

  @Watch("dataSource", { immediate: true })
  public onSourceChanged() {
    if (typeof this.dataSource !== "function") return;

    this.loadedItems = [];
    this.source = new DataSource({
      store: new CustomStore(
        createStoreConfig({
          key: this.dataKey,
          loadFunc: this.dataSource,
          onLoaded: this.onLoadedItems,
        }) as any,
      ),
      paginate: true,
      pageSize: this.pageSize || 7,
    });

    this.dataGrid?.refresh();
  }

  public getKeyExpr() {
    if (this.dataKey) {
      const expr = typeof this.dataKey === "string" ? this.dataKey : this.dataKey[0];
      return expr;
    }
  }

  public onLoadedItems(result: any) {
    this.loadedItems = union(this.loadedItems, result.data);
  }

  public get dropdown() {
    return (this.$refs.dropdown as any)?.instance;
  }

  public getDisplayFormat(type: string): string {
    if (!type) return "";

    switch (type) {
      case "date":
      case "datetime":
        return "yyyy-MM-dd HH:mm:ss";
      // case "number":
      //   return ",##0";
    }
    return "";
  }

  public getType(type: string): string | undefined {
    if (!type) return undefined;

    switch (type) {
      case "date":
      case "datetime":
        return "Date";
      case "number":
        return "Number";
    }
    return "";
  }

  public onContentReady(e: any) {
    e.component.option("inputAttr", { readonly: true });
  }

  public onSelectionChanged() {
    const selectedRowsData = this.dataGrid.rows.filter((r: any) => r.isSelected);
    if (!selectedRowsData || selectedRowsData.length === 0 || !this.dataKey) return;

    // console.log(selectedRowsData[0].dataItem, selectedRowsData[0]);

    this.setSelectedRowKey(selectedRowsData[0].dataItem);
    this.dropdown.close();
  }

  public onRowPrepared(e: any) {
    this.$emit("row-prepared", e);
  }

  public onValueChanged(e: any) {
    if (!this.dataKey || (e.value && e.value === this.selectedKey[0])) return;

    this.selectedKey = [e.value];
    let values: any = {};

    const rowData = this.loadedItems.find(x => x[this.getKeyExpr() || 0] === e.value);
    if (rowData) {
      values = { value: e.value, ...rowData };
    } else {
      values.value = e.value;
      values[this.getKeyExpr() || 0] = e.value;
    }

    this.$emit("value-changed", values);
  }

  public setSelectedRowKey(selectedRowsData: any) {
    if (!this.dataKey) return;

    const value = selectedRowsData[this.getKeyExpr() || 0];
    if (value === this.selectedKey[0]) return;
    selectedRowsData.value = value;

    this.selectedKey = [value];

    console.log("setSelectedRowKey", selectedRowsData);

    this.$emit("value-changed", selectedRowsData);
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    grid.hostElement?.addEventListener("click", this.onRowClick);
    grid.selectionChanged.addHandler(this.onSelectionChanged);
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: this.dataKey || "",
        validateKey: "save",
      },
      gridOptions: {
        useAutoColumnFit: true,
        useFooter: false,
        useSelector: false,
      },
    });
  }

  public setColumnWidth() {
    this.dataGrid.headersVisibility = "Column";
    this.dataGrid.autoSizeMode = "Both";
    this.dataGrid.autoSizeColumns();
  }

  public onRowClick(e: Event) {
    var hti = this.dataGrid.hitTest(e);
    var col = hti.col;
    var row = hti.row;
    this.dataGrid.select(0, 0);
    if (hti.panel === this.dataGrid.cells) {
      var item = hti.panel.rows[row].dataItem;
      console.log(item);

      hti.panel.rows[row].isSelected = true;
    }
  }

  public pageMove(page: number) {
    this.source.moveToPage(page - 1);
  }
}
</script>
