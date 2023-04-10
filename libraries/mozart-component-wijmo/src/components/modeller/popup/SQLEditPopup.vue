<template>
  <DxPopup
    class="moz-popup"
    :visible="open"
    :resize-enabled="true"
    :drag-enabled="true"
    :width="1024"
    :height="760"
    title="SQL"
    @hiding="onCancel"
    @resize="onResize"
  >
    <split-box
      :width="contentWidth"
      :height="contentHeight"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 3, minWidth: 200 },
      ]"
      :inner-margin="3"
      spliterColor="var(--color-border2)"
      horizontal
      resizable
    >
      <template slot="box1" slot-scope="{ parentsHeight, parentsWidth }">
        <DxTreeView
          class="moz-sql-tree"
          :items="conn.Tables"
          display-expr="Name"
          items-expr="Columns"
          :height="parentsHeight"
          :width="parentsWidth"
        />
      </template>
      <template slot="box2" slot-scope="{ parentsHeight, parentsWidth }">
        <split-box
          :width="parentsWidth"
          :height="parentsHeight"
          :boxes="[
            { type: 'rate', size: 3, minWidth: 200 },
            { type: 'rate', size: 2, minWidth: 200 },
          ]"
          :inner-margin="3"
          spliterColor="var(--color-border2)"
          resizable
        >
          <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
            <SQLEditor
              v-model="sql.Contents"
              :width="parentsWidth"
              :height="parentsHeight"
              :on-input-field="onInputField"
              :dbs="dbs"
              @ctrl-enter="onExecute"
            ></SQLEditor>
          </template>
          <template slot="box2" slot-scope="{ parentsHeight }">
            <div class="flex-center-horizontal" style="padding: 4px">
              <div @click="result = false" :style="`margin: 4px; cursor: pointer; ${result ? '' : 'font-weight: bold;'}`">Params</div>
              <div @click="result = true" :style="`margin: 4px; cursor: pointer; ${result ? 'font-weight: bold;' : ''}`">Result</div>
            </div>
            <DxDataGrid
              v-show="!result"
              class="moz-simple-grid"
              :height="parentsHeight - 35"
              :data-source="sql.Params"
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :column-auto-width="true"
              column-resizing-mode="widget"
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
              <DxColumn data-field="Type">
                <DxLookup :data-source="types" />
              </DxColumn>
            </DxDataGrid>
            <DxDataGrid
              v-show="result"
              class="moz-simple-grid"
              :height="parentsHeight - 35"
              :data-source="results"
              :columns="columns"
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :column-auto-width="true"
              column-resizing-mode="widget"
              :auto-navigate-to-focused-row="false"
              :show-borders="false"
              :show-column-lines="false"
              :selection="{ mode: 'single' }"
              :hover-state-enabled="true"
              no-data-text="No data to display"
            >
            </DxDataGrid>
          </template>
        </split-box>
      </template>
    </split-box>
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
import { DxTextBox } from "devextreme-vue/text-box";
import { DxSortable } from "devextreme-vue/sortable";
import { DxTreeView } from "devextreme-vue/tree-view";
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
import {
  generateGUID,
  IConnectionInfo,
  ISchema,
  getElementHeight,
  getElementWidth,
  findElement,
  ISqlDef,
} from "mozart-common";

import SplitBox from "../../Layout/SplitBox.vue";
import SQLEditor from "../../sql/SQLEditor.vue";

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxButton,
    DxTextBox,
    DxSortable,
    DxTreeView,
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
    SplitBox,
    SQLEditor,
  },
})
export default class SQLEditPopup extends Vue {
  @Prop({ type: Boolean, required: true }) public value!: boolean;
  @Prop({ type: Object, required: true }) public sql!: ISqlDef;
  @Prop({ type: Object, required: true }) public conn!: IConnectionInfo;

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

  public dbs: ISchema[] = [];

  public contentEl: HTMLElement | null = null;
  public contentWidth: number = 0;
  public contentHeight: number = 0;

  public result: boolean = false;
  public results: any[] = [];
  public columns: any[] = [];

  constructor() {
    super();
  }

  public mounted() {
    this.dbs = this.createDbList();
  }

  public get open(): boolean {
    return this.value;
  }

  public set open(value: boolean) {
    this.$emit("input", value);
  }

  @Watch("value")
  public onValueChanged(newVal: boolean) {
    if (newVal) {
      const el = findElement(".dx-overlay-content", { parents: this.$el as HTMLElement });
      if (el) {
        this.$nextTick(() => {
          const content = findElement(".dx-popup-content", { parents: el as HTMLElement });
          if (content) {
            this.contentEl = content;
            this.onResize();
          }
        });
      }
    }
  }

  public async onInputField() {
    const fields = await this.getTableCloumn();
    return fields;
  }

  public createDbList(): ISchema[] {
    if (!this.conn || !this.conn.Tables) return [];
    return [
      {
        dbName: this.conn.Name,
        tables: this.conn.Tables.map(tbl => {
          return {
            tblName: tbl.Name,
            tableColumns: tbl.Columns.map(col => {
              return {
                columnName: col.Name,
                columnType: col.Type,
                dbName: this.conn.Name,
                tblName: tbl.Name,
                commentName: "",
              };
            }),
          };
        }),
      },
    ];
  }

  public onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift({
      location: "before",
      widget: "dxTextBox",
      options: {
        value: this.sql.Name,
        placeholder: "Name",
        onValueChanged: (event: any) => {
          this.sql.Name = event.value;
        },
      },
    });
  }

  public onInitNewRow(e: any) {
    e.data.ID = generateGUID();
  }

  public getTableCloumn() {
    return new Promise((resolve, reject) => {
      resolve(["username", "password"]);
    });
  }

  public onResize() {
    if (!this.contentEl) return;
    this.contentWidth = getElementWidth(this.contentEl);
    this.contentHeight = getElementHeight(this.contentEl);
  }

  public onExecute() {
    const promise = new Promise((resolve: any) => {
      this.$emit("execute", { sql: this.sql.Contents }, resolve);
    });
    promise.then(result => {
      if (result instanceof Array) {
        this.results = result;
        this.columns = Object.keys(result[0]).map(key => {
          return {
            dataField: key,
          };
        });
      } else {

      }
      this.result = true;
    });
  }

  public onSave() {
    this.$emit("save", this.sql);
    this.open = false;
  }

  public onCancel() {
    this.open = false;
  }
}
</script>
