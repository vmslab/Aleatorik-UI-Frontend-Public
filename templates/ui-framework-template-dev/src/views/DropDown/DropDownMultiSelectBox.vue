<template>
  <DxDropDownBox
    v-if="items && items.length > 0"
    ref="dropdown"
    :width="width"
    :value="selectedValues || ''"
    :defer-rendering="false"
    :data-source="items"
    :display-expr="dataKey"
    :value-expr="dataKey"
    :accept-custom-value="acceptCustomValue"
    @value-changed="onValueChanged"
  >
    <template #content="{}">
      <DxDataGrid
        class="moz-edit-datagrid moz-controller-contains-grid"
        ref="dataGrid"
        :height="height"
        :data-source="items"
        :hover-state-enabled="true"
        :key-expr="dataKey"
        :selected-row-keys="selectedKey"
        @selection-changed="onSelectionChanged"
        @initialized="onInitialized"
      >
        <DxSelection mode="multiple" />

        <DxFilterRow :visible="true" />
        <DxHeaderFilter :visible="true" />
        <template v-for="field in dataFields">
          <DxColumn
            :key="field.key || field.name"
            :data-field="field.name || field.key"
            :caption="field.caption || field.name || field.key"
            :data-type="field.type"
            :customize-text="
              field.type === 'datetime'
                ? getDateTimeValue
                : field.type === 'date'
                ? getDateValue
                : getFormatValue
            "
          />
        </template>
      </DxDataGrid>
    </template>
  </DxDropDownBox>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { toFormatString } from "@/utils/commonUtils";
import "@/utils/dateUtils";
import {
  DxDataGrid,
  DxColumn,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxSelection,
  DxTexts,
} from "devextreme-vue/data-grid";

import DxDropDownBox from "devextreme-vue/drop-down-box";

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxSearchPanel,
    DxFilterRow,
    DxHeaderFilter,
    DxSelection,
    DxTexts,
    DxDropDownBox,
  },
})
export default class DropDownMultiSelectBox extends Vue {
  @Prop({ type: Number, required: true }) public width?: number;
  @Prop({ type: Number, required: true }) public height?: number;
  @Prop({ type: String, required: true }) public dataKey?: string;
  @Prop({ type: Array, required: true }) public items?: string[];
  @Prop({ type: Array, required: true }) public dataFields?: string[];
  @Prop({ type: Array, required: false }) public selectedValues?: string[];
  @Prop({ type: Boolean, required: false }) public acceptCustomValue?: boolean;

  public selectedKey: string[] = [];

  constructor() {
    super();
  }

  public onInitialized(e: any) {
    this.selectedKey = this.selectedValues || [];
    this.$emit("initialized", e);
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public get dropdown() {
    return (this.$refs.dropdown as any)?.instance;
  }

  public getDateValue({ value, valueText }: any): string {
    const dateValue = value as Date;
    if (!dateValue) return valueText;
    return (value as Date)?.toDateString();
  }

  public getDateTimeValue({ value, valueText }: any): string {
    const dateValue = value as Date;
    if (!dateValue) return valueText;
    return dateValue.toDateTimeString();
  }

  public getFormatValue(e: any): string {
    return toFormatString(e);
  }

  public onSelectionChanged({ selectedRowsData }: any) {
    if (!this.dataKey) return;

    this.setSelectedRowKey(selectedRowsData);
  }

  public onValueChanged(e: any) {
    if (!e.value) return;

    if (typeof e.value !== "string") return;

    var values = e.value.split(",").map((value: any) => value.trim());
    this.selectedKey = values;
    this.$emit("value-changed", this.selectedKey);
  }

  public setSelectedRowKey(selectedRowsData: any[]) {
    const rowKey = this.dataKey as string;
    if (!rowKey) return;

    this.selectedKey = selectedRowsData.map((row: any) => row[rowKey]);
    this.$emit("value-changed", this.selectedKey);
  }
}
</script>
