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
      :data-source="entityProps"
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
      no-data-text="No data to display"
      @toolbar-preparing="onToolbarPreparing"
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
      <DxColumn data-field="Name"></DxColumn>
      <DxColumn data-field="ColumnName"></DxColumn>
      <DxColumn data-field="Type">
        <DxLookup :data-source="types" />
      </DxColumn>
      <DxColumn
        data-field="Size"
        data-type="number"
        :editor-options="{ showSpinButtons: true }"
      ></DxColumn>
      <DxColumn data-field="PrimaryKey" data-type="boolean"></DxColumn>
      <DxColumn data-field="Nullable" data-type="boolean"></DxColumn>
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
import { IEntityDef, IEntityPropDef, generateGUID } from "mozart-common";

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
export default class TableEditPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public value!: boolean;
  @Prop({ type: Object, required: true }) public entity!: IEntityDef;
  @Prop({ type: Array, required: true }) public entityProps!: IEntityPropDef[];

  public types: string[] = [
    "string",
    "bool",
    "int",
    "long",
    "short",
    "float",
    "double",
    "decimal",
    "date",
    "time",
    "datetime",
    "datetimeoffset",
  ];

  constructor() {
    super();
  }

  public get open(): boolean {
    return this.value;
  }

  public set open(value: boolean) {
    this.$emit("input", value);
  }

  public onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift(
      {
        location: "before",
        widget: "dxTextBox",
        options: {
          value: this.entity.Name,
          placeholder: "Name",
          onValueChanged: (event: any) => {
            this.entity.Name = event.value;
          },
        },
      },
      {
        location: "before",
        widget: "dxTextBox",
        options: {
          value: this.entity.TableName,
          placeholder: "Table Name",
          onValueChanged: (event: any) => {
            this.entity.TableName = event.value;
          },
        },
      },
    );
  }

  public onInitNewRow(e: any) {
    e.data.ID = generateGUID();
  }

  public onSave() {
    this.$emit("save", this.entity, this.entityProps);
    this.open = false;
  }

  public onCancel() {
    this.open = false;
  }
}
</script>
