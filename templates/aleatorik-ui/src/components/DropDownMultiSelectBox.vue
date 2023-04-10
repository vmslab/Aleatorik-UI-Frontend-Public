<template>
  <DxDropDownBox
    ref="dropdown"
    :width="comboBoxWidth"
    :value="selectedValue || ''"
    :defer-rendering="false"
    :data-source="loadedItems"
    :display-expr="displayExpr || getKeyExpr()"
    :value-expr="valueExpr || getKeyExpr()"
    :accept-custom-value="acceptCustomValue"
    :focusStateEnabled="false"
    @value-changed="onValueChanged"
    :dropDownOptions="{
      width: width,
    }"
  >
    <template #content="{}">
      <DxDataGrid
        class="moz-edit-datagrid moz-controller-contains-grid"
        ref="dataGrid"
        :remote-operations="true"
        :width="width"
        :height="height"
        :data-source="source || []"
        :hover-state-enabled="true"
        :key-expr="getKeyExpr()"
        :selected-row-keys="selectedKey"
        @selection-changed="onSelectionChanged"
      >
        <DxSelection mode="multiple" />
        <DxPaging :page-size="pageSize || 7" />
        <DxPager :show-navigation-buttons="true" />

        <DxFilterRow :visible="true" />
        <DxHeaderFilter :visible="true" />
        <DxSorting mode="multiple" />
        <template v-for="field in dataFields">
          <DxColumn
            :key="field.key || field.name"
            :data-field="field.name || field.key"
            :caption="field.caption || field.name || field.key"
            :data-type="field.type === 'date' ? 'datetime' : field.type"
            :format="getDisplayFormat(field.type)"
            width="auto"
          />
        </template>
      </DxDataGrid>
    </template>
  </DxDropDownBox>
</template>

<script lang="ts">
import { union } from "lodash";
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { createStoreConfig, ActionLoadOptions } from "mozart-component-wijmo";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import {
  DxDataGrid,
  DxColumn,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxSorting,
  DxSelection,
  DxTexts,
  DxPaging,
  DxPager,
} from "devextreme-vue/data-grid";

import DxDropDownBox from "devextreme-vue/drop-down-box";

@Component({
  name: "DropDownMultiSelectBox",
  components: {
    DxDataGrid,
    DxColumn,
    DxSearchPanel,
    DxFilterRow,
    DxHeaderFilter,
    DxSorting,
    DxSelection,
    DxTexts,
    DxPaging,
    DxPager,
    DxDropDownBox,
  },
})
export default class DropDownMultiSelectBox extends Vue {
  @Prop({ type: Number, required: false }) public comboBoxWidth?: number;
  @Prop({ type: Number, required: false }) public width?: number;
  @Prop({ type: Number, required: false }) public height?: number;
  @Prop({ type: [String, Array], required: true }) public dataKey?: string | string[];
  @Prop({ type: Array }) public items?: any;
  @Prop({ type: Function }) public dataSource?: any;

  @Prop({ type: Array, required: true }) public dataFields?: string[];
  @Prop({ type: [Array, Object], required: false }) public selectedValue?: any;
  @Prop({ type: Boolean, required: false }) public acceptCustomValue?: boolean;
  @Prop({ type: Number, required: false }) public pageSize?: number;

  @Prop({ type: String, required: false }) public displayExpr?: string;
  @Prop({ type: String, required: false }) public valueExpr?: string;

  public selectedKey: any[] = [];
  public loadedItems: any[] = [];
  public source: any = null;

  constructor() {
    super();
  }

  @Watch("items", { immediate: true })
  public onItemsChanged() {
    this.loadedItems = this.source = this.items;
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

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public get dropdown() {
    return (this.$refs.dropdown as any)?.instance;
  }

  public getDisplayFormat(type: string): string {
    if (!type) return "";

    switch (type) {
      case "date":
        return "yyyy-MM-dd";
      case "datetime":
        return "yyyy-MM-dd HH:mm:ss";
      case "number":
        return ",##0";
    }
    return "";
  }

  public onSelectionChanged({ selectedRowsData }: any) {
    if (!selectedRowsData || !this.dataKey) return;

    this.setSelectedRowKey(selectedRowsData);
  }

  public onValueChanged(e: any) {
    // if (!this.dataKey || e.value === this.selectedKey) return;
    // this.selectedKey = e.value;
    // let values: any = e.value;
    // this.$emit("value-changed", values);
  }

  public setSelectedRowKey(selectedRowsData: any) {
    const rowKey = this.dataKey as string;
    if (!rowKey) return;

    this.selectedKey = selectedRowsData.map((row: any) => row[rowKey]);
    this.$emit("value-changed", selectedRowsData);
  }
}
</script>
