<template>
  <DxPopup
    class="moz-popup"
    :visible="visible"
    :show-title="true"
    :width="width"
    :height="height"
    title="Define KPI Total Score"
    @hidden="handleClose"
  >
    <div class="moz-area-padding">
      <DxTextArea v-model="kpiFormula" :height="78" :readOnly="true" />
      <WjFlexGrid
        :style="{
          width: `calc(${
            typeof width === 'string' ? width : width + 'px'
          } - (var(--size-content-padding) * 2))`,
          height: `calc(${
            typeof height === 'string' ? height : height + 'px'
          } - var(--size-card-title-height) - var(--size-toolbar-bottom) - (var(--size-content-padding) * 2) - 60px)`,
        }"
        :itemsSource="kpiDatas"
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
        :allowPinning="false"
        class="moz-edit-datagrid moz-kpi-setting-datagrid"
      >
        <WjFlexGridColumn binding="id" header="KPI" width="1*" :isReadOnly="true" />
        <WjFlexGridColumn
          binding="weight"
          header="weight"
          width="1*"
          align="right"
          dataType="Number"
        />
      </WjFlexGrid>
    </div>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{
        text: $t('Save'),
        stylingMode: 'outlined',
        class: 'moz-button',
        onClick: onSave,
      }"
    >
    </DxToolbarItem>
  </DxPopup>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxTextArea } from "devextreme-vue/text-area";

import { EventBus } from "mozart-common";

import { IKPI } from "./ATPlanCompareView.vue";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

@Component({
  name: "ATPlanCompareSelectPopup",
  components: {
    DxPopup,
    DxToolbarItem,
    DxTextArea,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class ATPlanCompareSettingPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public visible?: boolean;
  @Prop({ type: [Number, String], required: false }) public width?: number | string;
  @Prop({ type: [Number, String], required: false }) public height?: number | string;
  @Prop({ type: Array, required: true }) public kpis!: IKPI[];

  public kpiDatas: IKPI[] = [];
  public kpiFormula: string = "";

  constructor() {
    super();
  }

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        onInitialized: grid => {
          this.dataGrid?.selectionChanged.addHandler(this.onSelectionChanged);
          this.dataGrid?.rowUpdated.addHandler(this.onRowUpdated);
        },
        useAutoColumnFit: false,
        useFilter: false,
        useFooter: false,
      },
    });
  }

  @Watch("visible", { immediate: true })
  public onVisibleChanged() {
    this.$nextTick(() => {
      if (this.visible) {
        this.kpiDatas = JSON.parse(JSON.stringify(this.kpis));

        this.dataGrid.refresh();

        this.$nextTick(() => {
          this.dataGrid.rows.forEach((row: any) => {
            const data = row.dataItem;
            if (data.enable) {
              row.isSelected = true;
            }
          });
          this.dataGrid.refresh();
          this.makeFormula();
        });
      }
    });
  }

  public mounted() {}

  public makeFormula() {
    const list: string[] = [];
    // this.kpiDatas?.forEach(item => {
    //   item.enable = component?.isRowSelected(item.id);
    //   if (!item.enable) return;
    //   list.push(`[${item.id}] * ${item.weight}`);
    // });
    // this.kpiFormula = `KPI 종합점수 = ${list.join(" + ") || 0}`;

    const selectedDatas = this.dataGrid.rows
      .filter((row: any) => row.isSelected)
      .map((row: any) => row.dataItem);

    selectedDatas.forEach((row: any) => {
      list.push(`[${row.id}] * ${row.weight}`);
    });
    this.kpiFormula = `KPI 종합점수 = ${list.join(" + ") || 0}`;
  }

  public handleClose() {
    this.$emit("close", {});
  }

  public onRowUpdated(e: any) {
    this.makeFormula();
  }

  public async onSelectionChanged(e: any, c: any) {
    this.makeFormula();

    this.dataGrid.rows[c.row].dataItem.enable = this.dataGrid.rows[c.row].isSelected;

    // if (e.currentSelectedRowKeys.length === 1) {
    //   this.$nextTick(() => {
    //     const rowIndex = e.component.getRowIndexByKey(e.currentSelectedRowKeys[0]);
    //     const weightEl = e.component.getCellElement(rowIndex, "weight");
    //     e.component.focus(weightEl);
    //   });
    // }
  }

  public async onSave(e: any) {
    await new Promise((resolve: any) => {
      const params = {
        params: {
          setting: {
            kpiSetting: this.kpiDatas,
          },
        },
        resolve,
      };

      EventBus.fire("save-system-setting", { params });
    });

    this.$emit("action", { kpiSetting: this.kpiDatas });
  }
}
</script>
