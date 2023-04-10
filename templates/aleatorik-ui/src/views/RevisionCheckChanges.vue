<template>
  <WjFlexGrid
    :style="`
      width: ${parentsWidth}px;
      height: calc(${parentsHeight}px - 3px);`"
    :itemsSource="dataSource"
    :initialized="onInitialized"
    showSelectedHeaders="All"
    selectionMode="MultiRange"
    allowSorting="MultiColumn"
    keyActionTab="Cycle"
    :allowAddNew="false"
    :allowDelete="false"
    :autoGenerateColumns="false"
    :deferResizing="true"
    :quickAutoSize="true"
    :imeEnabled="true"
    :alternatingRowStep="0"
  >
    <WjFlexGridColumn binding="REVISION_SEQ" header="SEQUENCE" :isReadOnly="true" />
    <WjFlexGridColumn binding="COMMAND" header="COMMAND" :isReadOnly="true" />
    <WjFlexGridColumn
      v-for="column in columnSetting"
      :key="column.key"
      :binding="column.name"
      :header="column.caption"
      :dataType="column.dataType"
      :format="column.format"
      :editor="column.editor"
      :isReadOnly="true"
    />
  </WjFlexGrid>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { GetTableRemote } from "@/api/mainService";
import { dateToFormat, getTableSchema } from "@/utils/commonUtils";
import { ExtendGrid } from "mozart-component-wijmo";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

import { CurrentEmail } from "@/utils/common";

interface ColumnInfo {
  key: string;
  name: string;
  caption: string;
  dataType: string | null;
  visible: boolean;
  format: string | null;
}

@Component({
  components: { WjFlexGrid, WjFlexGridColumn },
})
export default class RevisionCheckChanges extends Vue {
  @Prop({ type: [Number, String] }) public parentsWidth?: number | string;
  @Prop({ type: [Number, String] }) public parentsHeight?: number | string;
  @Prop({ type: String }) public planVersion?: string;
  @Prop({ type: String }) public tableName?: string;

  public dataKey: any = ["REVISION_SEQ"];

  public sourceID: string = "";

  public columnSetting: ColumnInfo[] = [];
  public MngProps = ["PLAN_VERSION", "UPDATE_TIME", "UPDATE_USER"];

  public flexGrid: any;
  public extendGrid: any;

  constructor() {
    super();
  }

  public async mounted() {
    await this.initialize();
    this.flexGrid?.refresh();
  }

  @Watch("planVersion")
  public async onVersionChanged() {
    await this.initialize();
    this.flexGrid?.refresh();
  }

  @Watch("tableName")
  public async onTableChanged() {
    await this.initialize();
    this.flexGrid?.refresh();
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public dataSource: any = [];

  public onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useSelector: false,
        useContextMenu: false,
        useFooter: false,
        useFilter: true,
        useGroupPanel: false,
        useParseDate: true,
        useAutoColumnFit: true,
      },
    });

    grid.formatItem.addHandler(this.formatItem, this);
  }

  public async initialize() {
    if (!this.tableName || !this.planVersion) return;
    this.columnSetting = [];
    const schema = await getTableSchema(this.tableName);
    if (!schema.Columns) return;
    await this.setTableSchema(schema);
    this.dataSource = await this.loadFunc();
  }

  public async formatItem(s: FlexGrid, e: any) {
    if (!this.isDataCell(s, e)) return;

    const command = e.getRow().dataItem.COMMAND;
    const appearance = this.getConditionalAppearance(command);
    if (!appearance) return;

    if (command === "delete" || command === "add") {
      Object.assign(e.cell.style, this.getConditionalCssStyles(appearance));
    }

    if (command === "update") {
      const updatedColumns = e.getRow().dataItem.UPDATED_COLUMNS;
      if (updatedColumns.includes(s.columns[e.col].binding))
        Object.assign(e.cell.style, this.getConditionalCssStyles(appearance));
    }
  }

  public getConditionalAppearance(command: string) {
    switch (command) {
      case "add":
        return { fill: "CCE5FF" };
      case "update":
        return { fill: "FFFFCC" };
      case "delete":
        return { fill: "FFCCCC" };
      default:
        return { bold: true };
    }
  }

  public getConditionalCssStyles({ fill, font, bold }: any) {
    return {
      "background-color": fill ? `#${fill}` : ``,
      "font-weight": bold ? "bold" : undefined,
    };
  }

  public isDataCell(s: FlexGrid, e: any) {
    return s.cells === e.panel;
  }

  public async setTableSchema({ Columns }: any) {
    return new Promise(async resolve => {
      if (this.columnSetting.length > 0) this.columnSetting = [];

      for await (const info of Columns) {
        if (this.MngProps.includes(info.Name)) continue;
        let type = "";
        switch (info.JsType?.toLowerCase()) {
          case "date":
          case "dateTime":
            type = "Date";
            break;
          case "boolean":
            type = "Boolean";
            break;
          case "number":
            type = "Number";
            break;
          default:
            type = "String";
            break;
        }

        this.columnSetting.push({
          key: info.Name,
          name: info.Name,
          caption: info.Name,
          dataType: type,
          format: type === "Date" ? "yyyy-MM-dd HH:mm:ss" : type === "Number" ? "n" : null,
          // width: calcColumnWidth(info.Name),
          // minWidth: calcColumnWidth(info.Name),
          visible: true,
        });
      }

      resolve(true);
    });
  }

  public async loadFunc() {
    const userID = CurrentEmail();
    if (!this.planVersion || !this.tableName || !userID) return [];

    const result = await GetTableRemote("AT_REVISION_LOG", {
      filter: [
        ["COMMAND", "!=", "copy"],
        "and",
        ["PLAN_ID", "=", this.planVersion],
        "and",
        ["TARGET_TABLE", "=", this.tableName],
        "and",
        ["CREATE_USER", "=", userID],
      ],
      sort: [{ selector: "REVISION_SEQ", desc: true }],
    });
    let data = JSON.parse(result.data);
    return data.data.map((d: any) => {
      let values: any = {};
      switch (d.COMMAND) {
        case "add":
          values = JSON.parse(d.NEW_VALUES);
          break;
        case "update":
          const newValues = JSON.parse(d.NEW_VALUES)[0];
          const oldValues = JSON.parse(d.OLD_VALUES)[0];
          if (!newValues) return [];
          const newValuesKey = Object.entries(newValues);

          let updatedColumns: any[] = [];
          newValuesKey.forEach(newKeyValue => {
            var oldValue = oldValues[newKeyValue[0]];
            if (oldValue === newKeyValue[1]) return;
            updatedColumns.push(newKeyValue[0]);
          });
          values.UPDATED_COLUMNS = updatedColumns;

          values = { ...values, ...newValues };
          break;
        case "delete":
          values = JSON.parse(d.OLD_VALUES)[0];
          break;
      }
      return { ...values, ...d };
    });
  }
}
</script>
