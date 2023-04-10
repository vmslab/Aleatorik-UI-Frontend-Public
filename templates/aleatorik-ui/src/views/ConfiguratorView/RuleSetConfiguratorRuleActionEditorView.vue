<template>
  <div>
    <div class="dx-card moz-tabs-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
      <div class="dx-card-title">
        <div class="dx-card-title-text">
          ACTION MAP <i>{{ this.ruleSetID ? `[ ${this.ruleSetID} ]` : "" }}</i>
        </div>
        <div class="spacer"></div>
        <div class="dx-card-title-action">
          <DxButton v-tooltip="{ text: $t('Cancel') }" icon="cancel" stylingMode="text" @click="cancelChanges" />
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
          :column-auto-width="true"
          :hoverStateEnabled="true"
          no-data-text="No data to display"
          @context-menu-preparing="onContextMenuPreparing"
          @toolbar-preparing="onToolbarPreparing"
          @option-changed="onOptionChanged"
          @row-click="onRowClick"
          @editor-preparing="onEditorPreparing"
          @saving="onSaving"
        >
          <DxScrolling mode="virtual" />
          <DxPaging />
          <DxPager :show-navigation-buttons="true" />

          <DxSelection mode="single" />

          <DxEditing mode="batch" :allow-updating="true" start-edit-action="click" />

          <DxSummary>
            <DxTotalItem column="RULE_POINT" alignment="center" summary-type="count" display-format="{0} Rows" />
          </DxSummary>
          <DxColumn data-field="RULE_TYPE" :group-index="1" :allow-editing="false" :sort-index="0" sort-order="desc" />
          <DxColumn data-field="RULE_POINT" :allow-editing="false" width="30%" />
          <DxColumn
            data-field="TARGET_ID"
            caption="ACTION"
            :allow-editing="true"
            cell-template="value-cell-template"
            width="70%"
          />
          <template #value-cell-template="{ data }">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-right: 10px">
              <span>{{ data.value }}</span>
              <span>
                <DxButton
                  v-if="data.value"
                  class="no-padding-button"
                  v-tooltip="{ text: $t('Edit') + ' Preset' }"
                  icon="edit"
                  stylingMode="text"
                  @click="editPreset"
                />
                <DxButton
                  class="no-padding-button"
                  v-tooltip="{ text: $t('Add') + ' Preset' }"
                  icon="add"
                  stylingMode="text"
                  @click="addPreset"
                />
              </span>
            </div>
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
    <RuleSetConfiguratorPresetEditor
      ref="presetEditor"
      :rulePoint="selectedRulePoint"
      :presetID="selectedPresetID"
      :isAddRow="isAddRow"
      :isShowEditPopup="isShowEditPopup"
      @close="onClosePopup"
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

import { GetRuleActionMap, RemoveTable, AddOrModifyTable } from "@/api/mainService";
import { setCreateProperty, setUpdateProperty } from "@/utils/commonUtils";
import { loadTableDatas } from "@/utils/dataUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxSwitch } from "devextreme-vue/switch";
import DxDateBox from "devextreme-vue/date-box";
import DxTagBox from "devextreme-vue/tag-box";

import RuleSetConfiguratorPresetEditor from "@/views/ConfiguratorPopupEdit/RuleSetConfiguratorPresetEditor.vue";

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
    RuleSetConfiguratorPresetEditor,
  },
})
export default class RuleSetConfiguratorRuleActionEditorView extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: Number }) public contentsWidth?: number;
  @Prop({ type: Number }) public contentsHeight?: number;
  @Prop({ type: String }) public moduleType?: string;
  @Prop({ type: String }) public ruleSetID?: string;

  public tableName = "CFG_RULE_ACTION_MAP";

  public tabItems: string[] = [];
  public tabIndex = 0;

  public isChanging = false;
  public loadingVisible = false;

  public selectedRulePoint = "";
  public selectedPresetID = "";
  public isAddRow = false;
  public isShowEditPopup = false;

  public presetItems: any = {};
  public presetItemTypes: any = {};
  public factorItems: any = {};

  public dataSource = {};

  constructor() {
    super();
  }

  public presetEditor() {
    return this.$refs.presetEditor as any;
  }

  public async mounted() {
    this.loadingVisible = true;
    try {
      await this.refresh();
    } finally {
      this.loadingVisible = false;
    }
  }

  public async refresh() {
    this.dataSource = await this.loadFunc();

    this.presetItems = {};
    this.presetItemTypes = {};
    this.factorItems = {};

    const presetDatas = await loadTableDatas("CFG_PRESET_MASTER");
    presetDatas.forEach((item: any) => {
      if (!this.presetItems[item.RULE_POINT]) this.presetItems[item.RULE_POINT] = [""];

      this.presetItems[item.RULE_POINT].push(item.PRESET_ID);
      this.presetItemTypes[item.PRESET_ID] = item.SORT_TYPE;
    });

    const factorDatas = await loadTableDatas("CFG_FACTOR_MASTER");
    factorDatas.forEach((item: any) => {
      if (!this.factorItems[item.RULE_POINT]) this.factorItems[item.RULE_POINT] = [""];

      this.factorItems[item.RULE_POINT].push(item.FACTOR_ID);
    });
  }

  public getDataGrid(index: number) {
    const dataGrid = this.$refs[`dataGrid ${index}`] as any;
    if (dataGrid) return dataGrid[0]?.instance;
  }

  public async loadFunc() {
    if (!this.tableName || !this.moduleType || !this.ruleSetID) return [];

    const result = await GetRuleActionMap({
      MODULE_TYPE: this.moduleType,
      RULESET_ID: this.ruleSetID,
    });
    const data = JSON.parse(result.data);
    this.tabItems = [];
    for (let index = 1; index <= Object.keys(data).length; index++) {
      this.tabItems.push(`LEVEL ${index}`);
    }

    return data;
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await AddOrModifyTable(tableName, key, values);
    return JSON.parse(result.data);
  }

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(tableName, [key]);
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

  public onEditorPreparing(e: any) {
    if (e.dataField === "TARGET_ID") {
      e.editorName = "dxSelectBox";
      var type = e.row.data.RULE_TYPE?.toLowerCase();
      var rule = e.row.data.RULE_POINT;
      let items: string[] = [];
      if (type === "preset") {
        items = this.presetItems[rule];
      } else if (type === "factor") {
        items = this.factorItems[rule];
      }
      e.editorOptions.items = items;
      var onValueChanged = e.editorOptions.onValueChanged;
      e.editorOptions.onValueChanged = (evt: any) => {
        onValueChanged(evt);
        this.selectionRuleAction(e.component, evt.value);
      };

      e.component.selectRows([e.row.key], false);
      this.selectionRuleAction(e.component, e.value);
    }
  }

  public onRowClick(e: any) {
    if (e.rowType === "data") this.selectionRuleAction(e.component, e.data.TARGET_ID);
  }

  public selectionRuleAction(dataGrid: any, value: any) {
    const selectedKey = dataGrid.getSelectedRowKeys()[0];
    this.selectedRulePoint = selectedKey.RULE_POINT;
    this.selectedPresetID = value;

    this.$emit("selectionChanged", {
      rulePoint: selectedKey.RULE_POINT,
      ruleType: selectedKey.RULE_TYPE,
      sortType: this.presetItemTypes[value],
      targetID: value,
    });
  }

  public addPreset(e: any) {
    this.$nextTick(async () => {
      this.selectedPresetID = "";
      this.isAddRow = true;

      await this.presetEditor().setFormData();

      this.isShowEditPopup = true;

      this.refresh();
    });
  }

  public editPreset(e: any) {
    this.$nextTick(async () => {
      this.isAddRow = false;

      await this.presetEditor().setFormData();

      this.isShowEditPopup = true;

      this.refresh();
    });
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

  public cancelChanges() {
    let i = 0;
    for (const item of this.tabItems) {
      this.getDataGrid(i + 1)?.cancelEditData();
      i++;
    }
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
        RULESET_ID: this.ruleSetID,
        RULE_POINT: change.key.RULE_POINT,
        LEVEL_NO: change.key.LEVEL_NO,
      };

      if (change.data.TARGET_ID) {
        Object.assign(change.data, dataKey);
        await this.updateFunc(this.tableName, dataKey, change.data);
      } else {
        await this.deleteFunc(this.tableName, dataKey);
      }
    }
  }

  public async onClosePopup(e: any) {
    this.isShowEditPopup = e.flag;

    let i = 0;
    for (const item of this.tabItems) {
      this.getDataGrid(i + 1)?.deselectAll();
      i++;
    }

    this.$emit("selectionChanged", {
      rulePoint: "",
      ruleType: "",
      sortType: "",
      targetID: "",
    });

    this.refresh();
  }
}
</script>
<style>
.dx-tabpanel-tabs .dx-tabs {
  height: 25px;
}

.dx-tab {
  padding: 0px;
}

.dx-tab-selected:before {
  bottom: 0;
}

.dx-tab-selected:after {
  bottom: 0;
}

.dx-tabpanel .dx-tabs-wrapper {
  height: 25px;
}

.dx-tabpanel .dx-tab {
  height: 24px;
}
</style>
