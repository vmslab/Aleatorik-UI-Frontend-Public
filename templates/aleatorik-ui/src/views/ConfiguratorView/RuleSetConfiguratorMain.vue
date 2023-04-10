<template>
  <div>
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller)"
      :minWidth="600"
      :boxes="[
        { type: 'rate', size: 2, minWidth: 200 },
        { type: 'rate', size: 4, minWidth: 400 },
        { type: 'rate', size: 3, minWidth: 300 },
      ]"
      horizontal
      resizable
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">RULESET LIST</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton
                v-tooltip="{ text: $t('Add') + ' RuleSet' }"
                icon="add"
                stylingMode="text"
                @click="addRuleSet"
              />
              <DxButton
                v-tooltip="{ text: $t('Clone') + ' RuleSet' }"
                icon="copy"
                stylingMode="text"
                @click="cloneRuleSet"
              />
              <DxButton
                v-tooltip="{ text: $t('Edit') + ' RuleSet' }"
                icon="edit"
                stylingMode="text"
                @click="editRuleSet"
              />
              <DxButton
                v-tooltip="{ text: $t('Delete') + ' RuleSet' }"
                icon="trash"
                stylingMode="text"
                @click="removeRuleSet"
              />
            </div>
          </div>
          <DxList
            ref="ruleSetList"
            class="moz-list"
            :data-source="dataSource"
            :allow-item-deleting="false"
            :focus-state-enabled="false"
            :active-state-enabled="false"
            :show-selection-controls="true"
            :repaint-changes-only="true"
            page-load-mode="scrollBottom"
            :key-expr="dataKey"
            selection-mode="none"
            :selected-item-keys="selectedItemKeys"
            @item-click="onItemClick"
          >
            <template #item="{ data: item }">
              <div>
                <div class="text-area">
                  <div class="moz-body-02">{{ item.RULESET_ID }}</div>
                  <div class="moz-body-02 moz-color-font5">
                    {{ "(" + item.LEVEL_COUNT + ")" + (item.DESCRIPTION ? ", " + item.DESCRIPTION : "") }}
                  </div>
                </div>
              </div>
            </template>
          </DxList>
        </div>
        <RuleSetConfiguratorRuleSetEditor
          ref="ruleSetEditor"
          :moduleType="selectedModuleType"
          :ruleSetID="ruleSetID"
          :isAddRow="isAddRow"
          :isShowEditPopup="isShowEditPopup"
          @close="onClosePopup"
        />
        <DxLoadPanel
          :visible="loadingVisible"
          :show-indicator="true"
          :show-pane="true"
          :shading="false"
          shading-color="rgba(0,0,0,0.4)"
        />
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight, contentsWidth, contentsHeight }">
        <RuleSetConfiguratorRuleActionEditorView
          ref="ruleActionEditView"
          :parentsWidth="parentsWidth"
          :parentsHeight="parentsHeight"
          :contentsWidth="contentsWidth"
          :contentsHeight="contentsHeight"
          :moduleType="selectedModuleType"
          :ruleSetID="selectedItemKeys[0]"
          :key="`${selectedModuleType}@${selectedItemKeys[0]}`"
          @change="onChangeOption"
          @selectionChanged="onSelectionChanged"
        />
      </template>
      <template slot="box3" slot-scope="{ parentsWidth, parentsHeight, contentsWidth, contentsHeight }">
        <RuleSetConfiguratorPresetFactorEditorView
          ref="presetEditView"
          v-show="selectedRuleType.toLowerCase() === 'preset'"
          :parentsWidth="parentsWidth"
          :parentsHeight="parentsHeight"
          :contentsWidth="contentsWidth"
          :contentsHeight="contentsHeight"
          :presetID="selectedTargetID"
          :sortType="selectedSortType"
          :rulePoint="selectedRulePoint"
          :key="`${selectedRulePoint}@${selectedModuleType}@${selectedItemKeys[0]}`"
          @change="onChangeOption"
        />
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { SplitBox, showConfirm } from "mozart-component-wijmo";
import { DxList, DxItemDragging, DxMenuItem } from "devextreme-vue/list";
import ArrayStore from "devextreme/data/array_store";

import { ModifyTable, RemoveTable } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { setUpdateProperty, setOnEditing } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import RuleSetConfiguratorRuleSetEditor from "@/views/ConfiguratorPopupEdit/RuleSetConfiguratorRuleSetEditor.vue";
import RuleSetConfiguratorRuleActionEditorView from "@/views/ConfiguratorView/RuleSetConfiguratorRuleActionEditorView.vue";
import RuleSetConfiguratorPresetFactorEditorView from "@/views/ConfiguratorView/RuleSetConfiguratorPresetFactorEditorView.vue";

@Component({
  components: {
    SplitBox,
    DxList,
    DxItemDragging,
    DxMenuItem,
    DxButton,
    DxLoadPanel,
    RuleSetConfiguratorRuleSetEditor,
    RuleSetConfiguratorRuleActionEditorView,
    RuleSetConfiguratorPresetFactorEditorView,
  },
})
export default class RuleSetConfiguratorMain extends Vue {
  @Prop({ type: String }) public selectedModuleType?: string;

  public tableName = "CFG_RULESET_MASTER";
  public mapTableName = "CFG_RULE_ACTION_MAP";
  public dataKey = "RULESET_ID";

  public ruleSetID = "";
  public ruleSetItems: any[] = [];

  public selectedItemKeys: any[] = [];

  public selectedRulePoint = "";
  public selectedRuleType = "";
  public selectedTargetID = "";
  public selectedSortType = "";

  public isAddRow = false;
  public isShowEditPopup = false;
  public loadingVisible = false;

  public isChanging = false;
  public isOptionChanging = false;

  public dataSource: any = [];

  constructor() {
    super();
  }

  public ruleSetList() {
    return (this.$refs.ruleSetList as any)?.instance;
  }

  public ruleSetEditor() {
    return this.$refs.ruleSetEditor as any;
  }

  public ruleActionEditView() {
    return this.$refs.ruleActionEditView as any;
  }

  public presetEditView() {
    return this.$refs.presetEditView as any;
  }

  public async mounted() {
    this.refresh();
  }

  public async refresh() {
    var selectedKey = this.selectedItemKeys;
    this.ruleSetItems = await loadTableDatas(this.tableName, {
      MODULE_TYPE: this.selectedModuleType,
    });

    this.dataSource = new ArrayStore({
      key: this.dataKey,
      data: this.ruleSetItems,
    });
    this.selectedItemKeys = [];

    this.selectedRulePoint = "";
    this.selectedRuleType = "";
    this.selectedTargetID = "";
    this.selectedSortType = "";

    this.$nextTick(() => {
      this.selectedItemKeys = selectedKey;
      this.ruleSetList()?.repaint();
    });
  }

  public async onItemClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    if (item.RULESET_ID === this.selectedItemKeys[0]) {
      return;
    }

    if (this.isOptionChanging) {
      const result = await showConfirm({
        message: `${this.$t(`ChangeModuleMessage`)}`,
        // message: `Are you sure you want to <b>Change</b> module?`,
      });
      if (!result) return;

      this.isOptionChanging = false;
    }

    this.selectedRuleType = "";
    this.selectedTargetID = "";
    this.selectedSortType = "";
    this.selectedRulePoint = "";

    this.$nextTick(() => {
      this.presetEditView().refresh();
    });

    this.selectedItemKeys = [item.RULESET_ID];
  }

  public async addRuleSet() {
    this.ruleSetID = "";
    this.isAddRow = true;

    await this.ruleSetEditor().setFormData();

    this.isShowEditPopup = true;
  }

  public async cloneRuleSet() {
    if (!this.selectedItemKeys || this.selectedItemKeys.length === 0) return;

    this.ruleSetID = "";
    this.isAddRow = true;

    await this.ruleSetEditor().setFormData(this.selectedItemKeys[0]);

    this.isShowEditPopup = true;
  }

  public async removeRuleSet() {
    if (!this.selectedItemKeys || this.selectedItemKeys.length === 0) return;

    try {
      const ruleSetID = this.selectedItemKeys[0];

      const dialog = await showConfirm({
        message: `${this.$t(`RemoveMessage`, [ruleSetID])}`,
        // title: `Delete`,
        // message: `Are you sure you want to <b>Delete</b> '${ruleSetID}'?`,
      });
      if (!dialog) return;

      this.loadingVisible = true;

      const result = await this.deleteFunc(this.tableName, [
        {
          RULESET_ID: ruleSetID,
        },
      ]);

      const actionMapResult = await this.deleteFunc(this.mapTableName, [
        {
          RULESET_ID: ruleSetID,
        },
      ]);

      if (result) {
        console.log(
          `Affected RuleSet(s) : ${result.count}${
            actionMapResult ? "\nAffected Action Map(s) : " + actionMapResult.count : ""
          }`,
        );
        this.refresh();
      }
    } finally {
      this.selectedItemKeys = [];
      this.loadingVisible = false;
    }
  }

  public async editRuleSet() {
    if (this.isShowEditPopup) return;
    if (!this.selectedItemKeys || this.selectedItemKeys.length === 0) return;

    const ruleSetID = this.selectedItemKeys[0];

    this.ruleSetID = ruleSetID;
    this.isAddRow = false;

    await this.ruleSetEditor().setFormData();

    this.isShowEditPopup = true;
  }

  public async onClosePopup(e: any) {
    this.isShowEditPopup = e.flag;

    if (e.itemKey) {
      await this.refresh();
      this.selectedItemKeys = [];
      this.$nextTick(() => {
        this.selectedItemKeys = [e.itemKey];
      });
    }
  }

  public onChangeOption(e: any) {
    this.isOptionChanging = e.flag;
    setOnEditing(this.isOptionChanging || this.isChanging);
  }

  public onSelectionChanged(e: any) {
    this.selectedRulePoint = e.rulePoint;
    this.selectedRuleType = e.ruleType;
    this.selectedTargetID = e.targetID;
    this.selectedSortType = e.sortType;

    this.$nextTick(() => {
      this.presetEditView().refresh();
    });
  }

  public async updateFunc(tableName: string, key: any, values: any) {
    if (!this.tableName) return [];

    setUpdateProperty(values);

    const result = await ModifyTable(tableName, key, values);
    return JSON.parse(result.data);
  }

  public async deleteFunc(tableName: string, key: any) {
    if (!this.tableName) return [];
    const result = await RemoveTable(tableName, key);
    return JSON.parse(result.data);
  }

  public async onSaveData() {
    const result = await showConfirm({
      message: `${this.$t(`SaveMessage`)}`,
      // type: `info`,
      // title: `Save`,
      // message: `Are you sure you want to <b>Save</b> edit data?`,
    });
    if (!result) return;

    await this.ruleActionEditView().onSaveData();
    await this.presetEditView().onSaveData();

    this.isOptionChanging = false;
    setOnEditing(false);
    this.refresh();
  }
}
</script>
