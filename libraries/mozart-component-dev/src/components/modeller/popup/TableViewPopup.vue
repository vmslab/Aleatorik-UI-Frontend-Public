<template>
  <DxPopup
    class="moz-popup"
    :visible="open"
    :resize-enabled="true"
    :drag-enabled="true"
    :width="800"
    :height="600"
    title="Table"
    @hiding="onCancel"
  >
    <DxDataGrid
      class="moz-simple-grid"
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :column-auto-width="true"
      column-resizing-mode="widget"
      keyExpr="ID"
      :auto-navigate-to-focused-row="false"
      :show-borders="false"
      :show-column-lines="false"
      :selection="{ mode: 'single' }"
      :hover-state-enabled="true"
      @init-new-row="onInitNewRow"
    >
      <DxEditing
        :allow-updating="true"
        :allow-deleting="true"
        :allow-adding="true"
        :use-icons="true"
        mode="cell"
      >
      </DxEditing>
    </DxDataGrid>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{
        text: $t(`Save`),
        stylingMode: 'outlined',
        class: 'moz-button',
        onClick: onSave,
      }"
    ></DxToolbarItem>
  </DxPopup>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import {
  DxDataGrid,
  DxScrolling,
  DxSorting,
  DxExport,
  DxColumn,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxFormItem,
  DxLookup,
  DxTexts,
} from "devextreme-vue/data-grid";
import { generateGUID } from "mozart-common";

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxButton,
    DxTextBox,
    DxDataGrid,
    DxScrolling,
    DxSorting,
    DxExport,
    DxColumn,
    DxFilterRow,
    DxHeaderFilter,
    DxEditing,
    DxFormItem,
    DxLookup,
    DxTexts,
  },
})
export default class TableViewPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public value!: boolean;
  @Prop({ type: Array, required: true }) public data!: any[];

  constructor() {
    super();
  }

  public get open(): boolean {
    return this.value;
  }

  public set open(value: boolean) {
    this.$emit("input", value);
  }

  public onInitNewRow(e: any) {
    e.data.ID = generateGUID();
  }

  public onSave() {
    this.$emit("save", "");
    this.open = false;
  }

  public onCancel() {
    this.open = false;
  }
}
</script>
