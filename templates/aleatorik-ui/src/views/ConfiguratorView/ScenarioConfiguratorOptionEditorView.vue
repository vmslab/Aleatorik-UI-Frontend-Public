<template>
  <div>
    <div class="dx-card moz-tabs-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
      <div class="dx-card-title">
        <div class="dx-card-title-text">
          EXECUTION OPTION EDITOR <i>{{ moduleKey ? `[ ${moduleKey} ]` : "" }}</i>
        </div>
      </div>
      <DxTabs
        v-if="tabItems && tabItems.length > 0"
        class="moz-card-tabs-colored"
        :data-source="tabItems"
        :selected-index="tabIndex"
        @selectionChanged="onSelectionChanged"
      />
      <template v-for="(source, index) in dataSource">
        <DxDataGrid
          v-cell-tooltip
          v-show="parseInt(index) - 1 === tabIndex"
          :key="index"
          class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
          :ref="`dataGrid ${index}`"
          :width="contentsWidth ? contentsWidth : 'auto'"
          :height="contentsHeight ? `calc(${contentsHeight}px - var(--size-card-title-height))` : 'auto'"
          :data-source="source"
          :show-row-lines="false"
          :show-column-lines="false"
          :allow-column-resizing="true"
          :allow-column-reordering="true"
          :column-auto-width="true"
          :hoverStateEnabled="true"
          columnResizingMode="widget"
          no-data-text="No data to display"
          @context-menu-preparing="onContextMenuPreparing"
          @toolbar-preparing="onToolbarPreparing"
          @option-changed="onOptionChanged"
          @editor-preparing="onEditorPreparing"
          @row-click="onCellClick"
          @saving="onSaving"
        >
          <DxScrolling mode="virtual" />
          <DxPaging />
          <DxPager :show-navigation-buttons="true" />

          <DxEditing mode="batch" :allow-updating="true" start-edit-action="click" />

          <DxGrouping :auto-expand-all="true" />
          <DxSummary>
            <DxTotalItem column="OPTION_ID" alignment="center" summary-type="count" display-format="{0} Rows" />
          </DxSummary>
          <DxColumn data-field="OPTION_CATEGORY" :group-index="0" :allow-editing="false" />
          <DxColumn data-field="SUB_CATEGORY" :group-index="1" :allow-editing="false" />
          <DxColumn data-field="OPTION_ID" :width="200" :allow-editing="false" />
          <DxColumn data-field="OPTION_VALUE" cell-template="value-cell-template" />
          <template #value-cell-template="{ data }">
            <DxSwitch
              class="moz-switch"
              v-if="data.data.UI_TYPE.toLowerCase() === 'toggle'"
              switchedOnText="Y"
              switchedOffText="N"
              :value="data.value.toLowerCase() === 'y'"
            />
            <span v-else-if="data.data.UI_TYPE.toLowerCase() === 'datetime'">{{
              new Date(data.value).toDateString()
            }}</span>
            <span v-else>{{ data.value }}</span>
          </template>
        </DxDataGrid>
      </template>
    </div>
    <DxLoadPanel
      :visible="loadingVisible"
      :show-indicator="true"
      :show-pane="true"
      :shading="false"
      shading-color="rgba(0,0,0,0.4)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  DxDataGrid,
  DxColumn,
  DxExport,
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxPager,
  DxPaging,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxTexts,
  DxSummary,
  DxTotalItem,
  DxColumnFixing,
  DxSelection,
} from "devextreme-vue/data-grid";
import { DxTabs } from "devextreme-vue/tabs";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import { GetScenarioExecutionOption, ModifyTable } from "@/api/mainService";
import { setUpdateProperty } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxSwitch } from "devextreme-vue/switch";
import DxDateBox from "devextreme-vue/date-box";
import DxTagBox from "devextreme-vue/tag-box";

@Component({
  components: {
    DxButton,
    DxSwitch,
    DxDateBox,
    DxTagBox,
    DxDataGrid,
    DxColumn,
    DxExport,
    DxGrouping,
    DxGroupPanel,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxFilterRow,
    DxHeaderFilter,
    DxEditing,
    DxTexts,
    DxSummary,
    DxTotalItem,
    DxColumnFixing,
    DxSelection,
    DxTabs,
    DxLoadPanel,
  },
})
export default class ScenarioConfiguratorOptionEditorView extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: Number }) public contentsWidth?: number;
  @Prop({ type: Number }) public contentsHeight?: number;
  @Prop({ type: String }) public scenarioID?: string;
  @Prop({ type: String }) public moduleKey?: string;

  public tableName = "CFG_EXECUTION_OPTION_CONFIG";

  public tabItems: string[] = [];
  public tabIndex = 0;

  public isChanging = false;
  public loadingVisible = false;

  public tagItems: any[] = [];

  public dataSource = [];

  constructor() {
    super();
  }

  public async mounted() {
    this.loadingVisible = true;
    await this.refresh();
    this.loadingVisible = false;
  }

  public async refresh() {
    this.dataSource = await this.loadFunc();
  }

  public getDataGrid(index: number) {
    const dataGrid = this.$refs[`dataGrid ${index}`] as any;
    if (dataGrid) return dataGrid[0]?.instance;
  }

  public async loadFunc() {
    if (!this.tableName || !this.scenarioID || !this.moduleKey) return [];

    const result = await GetScenarioExecutionOption({
      SCENARIO_ID: this.scenarioID,
      MODULE_KEY: this.moduleKey,
    });
    const data = JSON.parse(result.data);

    this.tabItems = [];
    for (let index = 1; index <= Object.keys(data).length; index++) {
      this.tabItems.push(`PHASE ${index}`);
    }

    return data;
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyTable(tableName, key, values);
    return JSON.parse(result.data);
  }

  public hideHeaderPanel() {
    let panelList = document.querySelectorAll(".dx-datagrid-header-panel") as NodeListOf<HTMLElement>;

    if (panelList != null) {
      panelList.forEach((panel: HTMLElement) => {
        panel.style.display = "none";
      });
    }
  }

  public onCellClick(e: any) {
    switch (e.row?.data.UI_TYPE.toLowerCase()) {
      case "toggle":
        e.setValue(e.value === "N" ? "Y" : "N");
        break;
    }
  }

  public onEditorPreparing(e: any) {
    switch (e.row.data.UI_TYPE.toLowerCase()) {
      case "toggle":
        e.editorName = "dxSwitch";
        e.editorElement.classList.add("moz-switch");
        e.editorOptions.switchedOnText = "Y";
        e.editorOptions.switchedOffText = "N";
        e.editorOptions.value = e.value.toLowerCase() !== "y";
        e.setValue(e.value.toLowerCase() !== "y" ? "Y" : "N");
        e.editorOptions.onValueChanged = (evt: any) => {
          e.setValue(evt.value ? "Y" : "N");
        };
        break;
      case "datetime":
        e.editorName = "dxDateBox";
        e.editorOptions.type = "date";
        e.editorOptions.displayFormat = "yyyy-MM-dd";
        break;
      case "spin":
        e.editorName = "dxNumberBox";
        e.editorOptions.showSpinButtons = true;
        e.editorOptions.value = +e.value;
        break;
      case "multicombo":
        e.editorName = "dxTagBox";
        this.tagItems = e.row.data.RESERVED_VALUES.split(",").map((v: string) => {
          return { Id: v.trim(), Value: v.trim() };
        });

        e.editorOptions.dataSource = this.tagItems;
        e.editorOptions.showSelectionControls = true;
        e.editorOptions.maxDisplayedTags = 3;
        e.editorOptions.showMultiTagOnly = false;
        e.editorOptions.applyValueMode = "useButtons";
        e.editorOptions.displayExpr = "Value";
        e.editorOptions.valueExpr = "Id";
        e.editorOptions.value = e.value ? e.value.split(",").map((v: string) => v.trim()) : [];
        e.editorOptions.onValueChanged = (evt: any) => {
          e.setValue(evt.value.join(","));
        };
        break;
    }
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }

    this.$nextTick(() => {
      this.hideHeaderPanel();
    });
  }

  public async onOptionChanged(e: any) {
    switch (e.name) {
      case "editing":
        let changes = e.component.option("editing.changes");
        this.$emit("change", { flag: changes.length !== 0 });

        this.isChanging = changes.length !== 0;

        break;
    }
  }

  public onSelectionChanged(event: { addedItems: string[]; removedItems: string[] }) {
    if (event.addedItems.length === 0) return;
    this.tabIndex = this.tabItems.indexOf(event.addedItems[0]);
    this.$nextTick(() => {
      this.getDataGrid(this.tabIndex + 1)?.repaint();
      this.hideHeaderPanel();
    });
  }

  public onSaveData() {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      let i = 0;
      for await (const item of this.tabItems) {
        await this.getDataGrid(i + 1)?.saveEditData();
        i++;
      }

      this.loadingVisible = false;
      resolve(true);
    });
  }

  public onSaving(e: any) {
    e.cancel = true;

    if (e.changes.length) {
      e.promise = this.sendUpdateRequest(e.changes, e.component);
    }
  }

  public async sendUpdateRequest(changes: any, component: any) {
    for await (const change of changes) {
      const dataKey = {
        SCENARIO_ID: this.scenarioID,
        MODULE_KEY: this.moduleKey,
        PHASE: change.key.PHASE,
        OPTION_ID: change.key.OPTION_ID,
      };
      await this.updateFunc(this.tableName, dataKey, change.data);
    }
  }
}
</script>
