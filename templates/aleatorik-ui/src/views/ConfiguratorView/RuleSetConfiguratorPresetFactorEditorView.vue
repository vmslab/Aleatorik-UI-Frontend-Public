<template>
  <div>
    <div class="dx-card moz-tabs-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
      <div class="dx-card-title">
        <div class="dx-card-title-text">
          PRESET <i>{{ this.presetID ? `[ ${this.presetID} ]` : "" }}</i>
        </div>
        <div class="spacer"></div>
        <div class="dx-card-title-action">
          <DxButton
            v-if="sortType === 'WeightSorted'"
            v-tooltip="{ text: $t('Move Up') }"
            icon="up"
            stylingMode="text"
            @click="clickUpButton"
          />
          <DxButton
            v-if="sortType === 'WeightSorted'"
            v-tooltip="{ text: $t('Move Down') }"
            icon="down"
            stylingMode="text"
            @click="clickDownButton"
          />
          <DxButton v-tooltip="{ text: $t('Add') + ' Factor' }" icon="add" stylingMode="text" @click="addFactor" />
          <DxButton
            v-tooltip="{ text: $t('Delete') + ' Factor' }"
            icon="trash"
            stylingMode="text"
            @click="removeFactor"
          />
        </div>
      </div>
      <DxDataGrid
        v-cell-tooltip
        class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
        ref="dataGrid"
        :width="contentsWidth ? contentsWidth : 'auto'"
        :height="contentsHeight ? contentsHeight : 'auto'"
        :data-source="dataSource"
        :show-row-lines="false"
        :show-column-lines="false"
        :column-auto-width="false"
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
        <DxRowDragging :allow-reordering="true" :on-reorder="onReorder" :show-drag-icons="false" />

        <DxEditing mode="batch" :allow-updating="true" start-edit-action="click" />

        <DxSummary>
          <DxTotalItem column="FACTOR_ID" alignment="center" summary-type="count" display-format="{0} Rows" />
        </DxSummary>
        <DxColumn data-field="FACTOR_ID" :allow-editing="true" :allow-sorting="false" width="70%" />
        <DxColumn v-if="sortType === 'WeightSorted'" data-field="SEQ" :allow-editing="false" width="30%" />
        <DxColumn
          v-if="sortType === 'WeightSum'"
          data-field="WEIGHT"
          data-type="number"
          format=",##0.#########"
          :allow-editing="true"
          width="30%"
        />
        <!-- <DxColumn data-field="PARAMETER_VALUE" :allow-editing="false" /> -->
        <!-- <template #value-cell-template="{ data }">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-right: 10px;
              "
            >
              <span>{{ data.value }}</span>
              <span>
                <DxButton
                  class="no-padding-button"
                  v-tooltip="{ text: $t('Add') + ' Factor' }"
                  icon="add"
                  stylingMode="text"
                  @click="addFactor"
                />
                <DxButton
                  class="no-padding-button"
                  v-tooltip="{ text: $t('Edit') + ' Factor' }"
                  icon="edit"
                  stylingMode="text"
                  @click="editFactor"
                />
              </span>
            </div>
          </template> -->
      </DxDataGrid>
    </div>
    <DxLoadPanel
      :visible="loadingVisible"
      :show-indicator="true"
      :show-pane="true"
      :shading="false"
      shading-color="rgba(0,0,0,0.4)"
    />
    <RuleSetConfiguratorFactorEditor
      ref="factorEditor"
      :rulePoint="rulePoint"
      :factorID="selectedFactorID"
      :presetID="presetID"
      :sortType="sortType"
      :isAddRow="isAddRow"
      :isShowEditPopup="isShowEditPopup"
      @close="onClosePopup"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { showConfirm } from "mozart-component-wijmo";
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
  DxRowDragging,
} from "devextreme-vue/data-grid";
import { DxTabs } from "devextreme-vue/tabs";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import ArrayStore from "devextreme/data/array_store";

import { RemoveTable, ModifyTable } from "@/api/mainService";
import { setOnEditing, setUpdateProperty } from "@/utils/commonUtils";
import { loadTableDatas } from "@/utils/dataUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxSwitch } from "devextreme-vue/switch";
import DxDateBox from "devextreme-vue/date-box";
import DxTagBox from "devextreme-vue/tag-box";

import RuleSetConfiguratorFactorEditor from "@/views/ConfiguratorPopupEdit/RuleSetConfiguratorFactorEditor.vue";

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
    DxRowDragging,
    DxTabs,
    DxLoadPanel,
    RuleSetConfiguratorFactorEditor,
  },
})
export default class RuleSetConfiguratorPresetFactorEditorView extends Vue {
  @Prop({ type: Number }) public parentsWidth?: number;
  @Prop({ type: Number }) public parentsHeight?: number;
  @Prop({ type: Number }) public contentsWidth?: number;
  @Prop({ type: Number }) public contentsHeight?: number;
  @Prop({ type: String }) public presetID?: string;
  @Prop({ type: String }) public sortType?: string;
  @Prop({ type: String }) public rulePoint?: string;

  public tableName = "CFG_PRESET_FACTOR_MAP";
  public dataKey = ["PRESET_ID", "FACTOR_ID"];

  public isChanging = false;
  public loadingVisible = false;

  public selectedFactorID = "";

  public isAddRow = false;
  public isShowEditPopup = false;

  public factorDatas: any[] = [];
  public factorItems: any = {};

  constructor() {
    super();
  }

  public factorEditor() {
    return this.$refs.factorEditor as any;
  }

  public dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public get dataSource() {
    let sortingRule;
    if (this.sortType === "WeightSorted") sortingRule = (x: any, y: any) => x.SEQ - y.SEQ;
    else if (this.sortType === "WeightSum")
      sortingRule = (x: any, y: any) => (x.FACTOR_ID < y.FACTOR_ID ? 1 : x.FACTOR_ID > y.FACTOR_ID ? -1 : 0);
    else sortingRule = (x: any, y: any) => 0;

    return {
      store: new ArrayStore({
        key: this.dataKey,
        data: this.factorDatas.sort(sortingRule),
      }),
      reshapeOnPush: true,
    };
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
    this.factorDatas = await loadTableDatas(this.tableName, { PRESET_ID: this.presetID });
    this.dataGrid()?.refresh();

    this.factorItems = this.factorDatas.map((item: any) => item.FACTOR_ID);
    this.factorItems.unshift("");
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyTable(tableName, key, values);
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
    if (e.dataField === "FACTOR_ID") {
      e.editorName = "dxSelectBox";

      e.editorOptions.items = this.factorItems;

      e.component.selectRows([e.row.key], false);
      this.selectionFactor(e.component);
    }
  }

  public onRowClick(e: any) {
    this.selectionFactor(e.component);
  }

  public selectionFactor(dataGrid: any) {
    const selectedKey = dataGrid.getSelectedRowKeys()[0];
    this.selectedFactorID = selectedKey.FACTOR_ID;
  }

  public addFactor(e: any) {
    this.$nextTick(async () => {
      this.isAddRow = true;

      await this.factorEditor().setFormData();

      this.isShowEditPopup = true;

      this.refresh();
    });
  }

  public async removeFactor(e: any) {
    const selectedKey = this.dataGrid().getSelectedRowKeys()[0];

    try {
      const dialog = await showConfirm({
        message: `${this.$t(`RemoveMessage`, [selectedKey.FACTOR_ID])}`,
        // title: `Delete`,
        // message: `Are you sure you want to <b>Delete</b> '${selectedKey.FACTOR_ID}'?`,
      });
      if (!dialog) return;

      this.loadingVisible = true;
      const result = await this.deleteFunc(this.tableName, selectedKey);

      if (result) {
        // const optionResult = await this.deleteFunc(this.optionTableName, [
        //   {
        //     SCENARIO_ID: this.selectedScenarioID,
        //     MODULE_KEY: moduleKey,
        //   },
        // ]);

        console.log(
          `Affected RuleSet(s) : ${result.count}`,
          // ${optionResult ? "\nAffected Option(s) : " + optionResult.count : ""}`,
        );
        this.refresh();
      }
    } finally {
      this.loadingVisible = false;
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

  public clickUpButton() {
    return new Promise(resolve => {
      const selectedKey = this.dataGrid().getSelectedRowKeys()[0];

      const selectedIdx = this.factorDatas.findIndex((item: any) => {
        return item.FACTOR_ID === selectedKey.FACTOR_ID;
      });

      if (selectedIdx < 1) return;

      const targetItem = this.factorDatas[selectedIdx];
      const beforeItem = this.factorDatas[selectedIdx - 1];

      this.dataSource.store.push([
        {
          type: "update",
          data: { SEQ: beforeItem.SEQ },
          key: { PRESET_ID: beforeItem.PRESET_ID, FACTOR_ID: beforeItem.FACTOR_ID },
        },
        {
          type: "update",
          data: { SEQ: targetItem.SEQ },
          key: { PRESET_ID: targetItem.PRESET_ID, FACTOR_ID: targetItem.FACTOR_ID },
        },
      ]);

      const beforeSeq = beforeItem.SEQ;
      beforeItem.SEQ = targetItem.SEQ;
      targetItem.SEQ = beforeSeq;

      this.$nextTick(() => {
        this.dataGrid().selectRows([selectedKey], false);

        this.isChanging = true;
        setOnEditing(this.isChanging);

        resolve(true);
      });
    });
  }

  public clickDownButton() {
    return new Promise(resolve => {
      const selectedKey = this.dataGrid().getSelectedRowKeys()[0];

      const selectedIdx = this.factorDatas.findIndex((item: any) => {
        return item.FACTOR_ID === selectedKey.FACTOR_ID;
      });

      if (selectedIdx >= this.factorDatas.length - 1 || selectedIdx < 0) return;

      const targetItem = this.factorDatas[selectedIdx];
      const nextItem = this.factorDatas[selectedIdx + 1];

      this.dataSource.store.push([
        {
          type: "update",
          data: { SEQ: targetItem.SEQ },
          key: { PRESET_ID: targetItem.PRESET_ID, FACTOR_ID: targetItem.FACTOR_ID },
        },
        {
          type: "update",
          data: { SEQ: nextItem.SEQ },
          key: { PRESET_ID: nextItem.PRESET_ID, FACTOR_ID: nextItem.FACTOR_ID },
        },
      ]);

      const nextSeq = nextItem.SEQ;
      nextItem.SEQ = targetItem.SEQ;
      targetItem.SEQ = nextSeq;

      this.$nextTick(() => {
        this.dataGrid().selectRows([selectedKey], false);

        this.isChanging = true;
        setOnEditing(this.isChanging);

        resolve(true);
      });
    });
  }

  public async onReorder(e: any) {
    this.dataGrid().selectRows([{ PRESET_ID: e.itemData.PRESET_ID, FACTOR_ID: e.itemData.FACTOR_ID }], false);

    let idx = e.fromIndex;
    let flag = 0;
    if (e.fromIndex < e.toIndex) {
      flag = 1;
    } else {
      flag = -1;
    }

    while (idx !== e.toIndex) {
      if (flag > 0) {
        await this.clickDownButton();
      } else {
        await this.clickUpButton();
      }

      idx += flag;
    }

    this.isChanging = true;
    setOnEditing(this.isChanging);
  }

  public onSaveData() {
    return new Promise(async resolve => {
      this.loadingVisible = true;

      await this.dataGrid().saveEditData();

      this.loadingVisible = false;
      resolve(true);
    });
  }

  public onSaving(e: any) {
    e.cancel = true;

    if (this.isChanging) {
      if (this.sortType === "WeightSorted") {
        e.promise = this.sendUpdateRequest(this.factorDatas);
      } else {
        e.promise = this.sendUpdateRequest(e.changes);
      }
    }
  }

  public async sendUpdateRequest(changes: any) {
    for await (const change of changes) {
      const dataKey = {
        PRESET_ID: this.sortType === "WeightSorted" ? change.PRESET_ID : change.key.PRESET_ID,
        FACTOR_ID: this.sortType === "WeightSorted" ? change.FACTOR_ID : change.key.FACTOR_ID,
      };

      await this.updateFunc(this.tableName, dataKey, this.sortType === "WeightSorted" ? change : change.data);
    }
  }

  public async onClosePopup(e: any) {
    this.isShowEditPopup = e.flag;

    this.refresh();
  }
}
</script>
