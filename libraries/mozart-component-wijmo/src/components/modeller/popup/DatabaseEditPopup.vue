<template>
  <DxPopup
    class="moz-popup"
    :visible="open"
    :resize-enabled="true"
    :drag-enabled="true"
    :width="400"
    :height="420"
    title="Database"
    @hiding="onCancel"
  >
    <DxForm
      class="moz-form"
      :form-data="connection"
      :showColonAfterLabel="false"
      validation-group="connectionData"
    >
      <DxSimpleItem data-field="Name" :label="{ text: $t(`Name`) }">
        <DxRequiredRule />
      </DxSimpleItem>
      <DxSimpleItem
        data-field="DBType"
        editor-type="dxSelectBox"
        :editor-options="{
          dataSource: databaseTypes,
        }"
        :label="{ text: $t('DBType') }"
      >
        <DxRequiredRule />
      </DxSimpleItem>
      <DxSimpleItem data-field="DataSource" :label="{ text: $t(`Host`) }">
        <DxRequiredRule />
      </DxSimpleItem>
      <DxSimpleItem :visible="userVisible" data-field="UserID" :label="{ text: $t(`UserID`) }">
      </DxSimpleItem>
      <DxSimpleItem
        data-field="Password"
        :editor-options="{
          mode: 'password',
        }"
        :label="{ text: $t(`Password`) }"
      >
      </DxSimpleItem>
      <DxSimpleItem
        :visible="databaseVisible"
        data-field="Database"
        :label="{ text: $t(`Database`) }"
      >
      </DxSimpleItem>
    </DxForm>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{
        text: $t(`Test`),
        stylingMode: 'outlined',
        class: 'moz-button',
        onClick: onTest,
      }"
    ></DxToolbarItem>
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
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxButton } from "devextreme-vue/button";
import { DxForm, DxSimpleItem, DxRequiredRule } from "devextreme-vue/form";
import { IConnectionInfo, generateGUID, IFlowModule } from "mozart-common";

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxButton,
    DxForm,
    DxSimpleItem,
    DxRequiredRule,
  },
})
export default class DatabaseEditPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public value!: boolean;
  @Prop({ type: Object, required: true }) public data!: IFlowModule;

  public databaseTypes: string[] = [
    "Oracle",
    "SqlServer",
    "MySql",
    "PostgreSQL",
    "SQLite",
    "Firebird",
  ];

  public connection: IConnectionInfo | null = null;

  constructor() {
    super();
  }

  public get open(): boolean {
    return this.value;
  }

  public set open(value: boolean) {
    this.$emit("input", value);
  }

  public get userVisible(): boolean {
    return this.connection != null && this.connection.DBType !== "SQLite";
  }

  public get databaseVisible(): boolean {
    return (
      this.connection != null &&
      this.connection.DBType !== "Oracle" &&
      this.connection.DBType !== "SQLite"
    );
  }

  @Watch("data")
  public onChangeData() {
    if (Reflect.has(this.data.info, "connection")) {
      this.connection = Object.assign({}, this.data.info["connection"]);
    } else {
      this.connection = {
        ID: generateGUID(),
        Name: "",
        DBType: "",
        DataSource: "",
        UserID: "",
        Password: "",
        Database: "",
      };
    }
  }

  public onTest() {
    this.$emit("test", this.connection);
  }

  public onSave() {
    this.$emit("save", this.connection);
    this.open = false;
  }

  public onCancel() {
    this.onChangeData();
    this.open = false;
  }
}
</script>
