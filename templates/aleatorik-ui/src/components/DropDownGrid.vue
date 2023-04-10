<template>
  <DxDropDownBox
    ref="dropdown"
    :width="comboBoxWidth"
    :value="selectedValue || ''"
    :defer-rendering="false"
    :data-source="items"
    :display-expr="displayExpr || getKeyExpr()"
    :value-expr="valueExpr || getKeyExpr()"
    :accept-custom-value="true"
    :focusStateEnabled="false"
    :show-close-button="true"
    @value-changed="onValueChanged"
    :dropDownOptions="{
      width: width,
      closeOnOutsideClick: !isDroppedDown,
    }"
    @content-ready="onContentReady"
    @opened="onOpened"
  >
    <template #content="{}">
      <div id="dropdownContent">
        <WjFlexGridSearch ref="search" placeholder="Search" />
        <WjFlexGrid
          :style="`width: ${width}px; height: ${height}px;`"
          :initialized="onInitialized"
          :isReadOnly="true"
          :autoSearch="true"
          selectionMode="Row"
          allowSorting="SingleColumn"
          autoSizeMode="Both"
          :itemsSource="collectionView || []"
          keyActionTab="Cycle"
          :autoGenerateColumns="false"
          :deferResizing="true"
          :quickAutoSize="true"
          :imeEnabled="true"
          :alternatingRowStep="0"
          :formatItem="formatItem"
          :showMarquee="true"
        >
          <WjFlexGridColumn
            v-for="field in dataFields"
            :key="field.key || field.name"
            :binding="field.name || field.key"
            :header="field.caption || field.name || field.key"
            :dataType="field.dataType"
            :format="field.format || field.dataType === 'Date' ? 'yyyy-MM-dd HH:mm:ss' : ''"
            :width="field.width || null"
          />
        </WjFlexGrid>
      </div>
    </template>
  </DxDropDownBox>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { WjFlexGridSearch } from "@grapecity/wijmo.vue2.grid.search";
import { WjInputDateRange } from "@grapecity/wijmo.vue2.input";
import { FlexGrid, CellRangeEventArgs, CellRange, AutoSizeMode } from "@grapecity/wijmo.grid";
import { DateTime, Control, CollectionView } from "@grapecity/wijmo";

import DxDropDownBox from "devextreme-vue/drop-down-box";
import { DxTextBox } from "devextreme-vue/text-box";
import { ExtendGrid } from "mozart-component-wijmo";

@Component({
  name: "DropDownGrid",
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridSearch,
    WjInputDateRange,
    DxTextBox,
    DxDropDownBox,
  },
})
export default class DropDownGrid extends Vue {
  @Prop({ type: String, required: false, default: "dropdown-grid" }) public name?: string;

  @Prop({ type: Number, required: false }) public comboBoxWidth?: number;
  @Prop({ type: Number, required: false }) public width?: number;
  @Prop({ type: Number, required: false }) public height?: number;
  @Prop({ type: [String, Array], required: true }) public dataKey?: string | string[];
  @Prop({ type: Array }) public items?: any;

  @Prop({ type: Array, required: true }) public dataFields?: string[];
  @Prop({ type: String, required: false }) public selectedValue?: string;

  @Prop({ type: String, required: false }) public displayExpr?: string;
  @Prop({ type: String, required: false }) public valueExpr?: string;

  @Prop({ type: String, required: false }) public selectMode?: "click" | "dblclick";

  public extendGrid: ExtendGrid | null = null;
  public flexGrid: FlexGrid | null = null;

  public collectionView: CollectionView | null = null;

  public isDroppedDown = false;

  constructor() {
    super();
  }

  @Watch("items", { immediate: true })
  public onItemsChanged() {
    if (!this.items) return;
    let option: any = {};
    const rowIndex = this.items.findIndex((x: any) => x[this.getKeyExpr() || 0] === this.selectedValue);
    if (rowIndex >= 0) {
      option.currentPosition = rowIndex;
    }
    this.collectionView = new CollectionView(this.items, option);
  }

  public mounted() {
    this.dropdownContent?.addEventListener("mouseenter", () => {
      this.isDroppedDown = true;
    });
    this.dropdownContent?.addEventListener("mouseleave", () => {
      this.isDroppedDown = false;
    });
  }

  public getKeyExpr() {
    if (this.dataKey) {
      const expr = typeof this.dataKey === "string" ? this.dataKey : this.dataKey[0];
      return expr;
    }
  }

  public get dropdown() {
    return (this.$refs.dropdown as any)?.instance;
  }

  public get dropdownContent() {
    return document.getElementById("dropdownContent");
  }

  public get search() {
    return Control.getControl((this.$refs.search as any)?.$el);
  }

  public onInitialized(grid: any) {
    this.flexGrid = grid;

    this.extendGrid = new ExtendGrid({
      name: this.name,
      flexGrid: grid,
      gridOptions: {
        useSelector: false,
        useContextMenu: false,
        useFooter: false,
        useFilter: false,
        useGroupPanel: false,
        useParseDate: true,
        useAutoColumnFit: false,
        onInitialized: async grid => {
          if (!grid || !this.search) return;
          (this.search as any).grid = this.flexGrid;
        },
      },
    });

    this.flexGrid?.selectionChanged.addHandler(this.onSelectionChanged, this);
    this.flexGrid?.hostElement.addEventListener("dblclick", this.onDblClicked.bind(this));
  }

  public onContentReady(e: any) {
    e.component.option("inputAttr", { readonly: true });
  }

  public onOpened(e: any) {
    this.extendGrid?.refresh();
  }

  public onSelectionChanged(s: FlexGrid, e: CellRangeEventArgs) {
    if (this.selectMode && this.selectMode === "dblclick") return;
    if (e.row < 0) return;

    this.setSelectedRowKey(e.getRow().dataItem);

    this.dropdown.close();
  }

  public onDblClicked(e: MouseEvent) {
    if (!this.selectMode || this.selectMode === "click") return;

    const ht = this.flexGrid?.hitTest(e);

    if (!ht || ht.row < 0) return;

    this.setSelectedRowKey(ht.getRow().dataItem);

    this.dropdown.close();
  }

  public onRowPrepared(e: any) {
    this.$emit("row-prepared", e);
  }

  public formatItem(s: FlexGrid, e: any) {
    this.$emit("format-item", s, e);
  }

  public onValueChanged(e: any) {
    if (!this.dataKey || (e.value && e.value === this.selectedValue)) return;

    this.selectedValue = e.value;
    let values: any = {};

    const rowIndex = this.items.findIndex((x: any) => x[this.getKeyExpr() || 0] === e.value);
    if (rowIndex >= 0) {
      this.flexGrid?.collectionView.moveCurrentToPosition(rowIndex);
      values = { value: e.value, ...this.items[rowIndex] };
    } else {
      values.value = e.value;
      values[this.getKeyExpr() || 0] = e.value;
    }

    this.$emit("value-changed", values);
  }

  public setSelectedRowKey(selectedRowsData: any) {
    if (!this.dataKey) return;

    const value = selectedRowsData[this.getKeyExpr() || 0];
    if (value === this.selectedValue) return;
    selectedRowsData.value = value;

    this.$emit("value-changed", selectedRowsData);
  }
}
</script>
