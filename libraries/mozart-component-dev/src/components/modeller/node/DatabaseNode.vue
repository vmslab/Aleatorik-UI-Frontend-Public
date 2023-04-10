<template>
  <div class="dx-card">
    <div class="dx-card-title">
      <div class="dx-card-title-text">Database</div>
      <div class="spacer"></div>
      <div class="dx-card-title-action">
        <DxButton v-tooltip="{ text: $t('Edit') }" icon="edit" @click="onToggle" />
      </div>
    </div>
    <div class="dx-card-text">
      <div
        v-if="collaps"
      >
        <div class="flex-center"><i class="mozart-icons m-060_icon-database" style="font-size: 40px;"></i></div>
        <div class="flex-center">{{ connection.Name }}</div>
      </div>
      <DxForm
        v-else
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
            onValueChanged: onDBTypeChanged,
          }"
          :label="{ text: $t('DBType') }"
        >
          <DxRequiredRule />
        </DxSimpleItem>
        <DxSimpleItem data-field="DataSource" :label="{ text: $t(`Host`) }">
          <DxRequiredRule />
        </DxSimpleItem>
        <DxSimpleItem :visible="userVisible" data-field="UserID" :label="{ text: $t(`UserID`) }"> </DxSimpleItem>
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
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import {
  DxForm,
  DxSimpleItem,
  DxRequiredRule,
} from "devextreme-vue/form";
import { IConnectionInfo, generateGUID } from "mozart-common";

@Component({
  components: {
    DxButton,
    DxForm,
    DxSimpleItem,
    DxRequiredRule,
  },
})
export default class DatabaseNode extends Vue {
  @Prop({ type: Number, required: true, default: 1 }) public id!: number;
  @Prop({ type: Object, required: true }) public data!: Record<string, any>;

  public databaseTypes: string[] = [
    "Oracle",
    "SqlServer",
    "MySql",
    "PostgreSQL",
    "SQLite",
    "Firebird",
  ];

  public userVisible: boolean = true;
  public databaseVisible: boolean = true;
  public collaps: boolean = false;

  constructor() {
    super();
  }

  public mounted() {
  }

  public get connection(): IConnectionInfo {
    const conn = {
      ID: generateGUID(),
      Name: "",
      DBType: "",
      DataSource: "",
      UserId: "",
      Password: "",
      Database: "",
      Collaps: false,
    };
    if (!this.data["connection"]) {
      this.data["connection"] = conn;
    }
    return this.data["connection"];
  }

  public onDBTypeChanged(event: any) {
    this.userVisible = event.value !== "SQLite";
    this.databaseVisible = event.value !== "Oracle" && event.value !== "SQLite";
  }

  public onToggle(e: any) {
    this.collaps = !this.collaps;
  }
}
</script>
