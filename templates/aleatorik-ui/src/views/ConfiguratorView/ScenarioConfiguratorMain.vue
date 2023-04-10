<template>
  <div>
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller)"
      :minWidth="400"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 3, minWidth: 200 },
      ]"
      horizontal
      resizable
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">MODULE LIST</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton v-tooltip="{ text: $t('Move Up') }" icon="up" stylingMode="text" @click="clickUpButton" />
              <DxButton v-tooltip="{ text: $t('Move Down') }" icon="down" stylingMode="text" @click="clickDownButton" />
              <DxButton v-tooltip="{ text: $t('Add') + ' Module' }" icon="add" stylingMode="text" @click="addModule" />
              <DxButton
                v-tooltip="{ text: $t('Edit') + ' Module' }"
                icon="edit"
                stylingMode="text"
                @click="editModule"
              />
              <DxButton
                v-tooltip="{ text: $t('Delete') + ' Module' }"
                icon="trash"
                stylingMode="text"
                @click="removeModule"
              />
            </div>
          </div>
          <DxList
            ref="moduleList"
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
            <DxItemDragging :data="dataSource" :allow-reordering="true" :on-drag-end="dragEndItem" />
            <template #item="{ data: item }">
              <div>
                <div class="text-area">
                  <div class="moz-body-02">{{ item.MODULE_KEY }}</div>
                  <div class="moz-body-02 moz-color-font5">
                    {{ `${item.MODULE_KEY}, ${item.MODULE_TYPE}, PHASE(${item.PHASE_COUNT}), SEQ(${item.SEQUENCE})` }}
                  </div>
                </div>
              </div>
            </template>
          </DxList>
        </div>
        <ScenarioConfiguratorModuleEditor
          ref="moduleEditor"
          :scenarioID="selectedScenarioID"
          :modulekey="moduleKey"
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
        <ScenarioConfiguratorOptionEditorView
          ref="optionEditor"
          :parentsWidth="parentsWidth"
          :parentsHeight="parentsHeight"
          :contentsWidth="contentsWidth"
          :contentsHeight="contentsHeight"
          :scenarioID="selectedScenarioID"
          :moduleKey="selectedItemKeys[0]"
          :key="selectedScenarioID + '@' + selectedItemKeys[0]"
          @change="onChangeOption"
        />
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { showConfirm } from "mozart-component-wijmo";
import { SplitBox } from "mozart-component-wijmo";
import { DxList, DxItemDragging, DxMenuItem } from "devextreme-vue/list";
import ArrayStore from "devextreme/data/array_store";

import { ModifyTable, RemoveTable } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { setUpdateProperty, setOnEditing } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import ScenarioConfiguratorModuleEditor from "@/views/ConfiguratorPopupEdit/ScenarioConfiguratorModuleEditor.vue";
import ScenarioConfiguratorOptionEditorView from "@/views/ConfiguratorView/ScenarioConfiguratorOptionEditorView.vue";

@Component({
  components: {
    SplitBox,
    DxList,
    DxItemDragging,
    DxMenuItem,
    DxButton,
    DxLoadPanel,
    ScenarioConfiguratorModuleEditor,
    ScenarioConfiguratorOptionEditorView,
  },
})
export default class ScenarioConfiguratorMain extends Vue {
  @Prop({ type: String }) public selectedScenarioID?: string;
  // SCENARIO_ID

  public tableName = "CFG_EXECUTION_PLAN";
  public optionTableName = "CFG_EXECUTION_OPTION_CONFIG";
  public dataKey = "MODULE_KEY";

  public moduleKey = "";
  public moduleItems: any[] = [];

  public selectedItemKeys: any[] = [];

  public isAddRow = false;
  public isShowEditPopup = false;
  public loadingVisible = false;

  public isChanging = false;
  public isOptionChanging = false;

  public dataSource: any = [];

  constructor() {
    super();
  }

  public moduleList() {
    return (this.$refs.moduleList as any)?.instance;
  }

  public moduleEditor() {
    return this.$refs.moduleEditor as any;
  }

  public optionEditor() {
    return this.$refs.optionEditor as any;
  }

  public async mounted() {
    this.refresh();
  }

  public async refresh() {
    if (!this.selectedScenarioID) return;

    var selectedKey = this.selectedItemKeys;
    this.moduleItems = await loadTableDatas(this.tableName, {
      SCENARIO_ID: this.selectedScenarioID,
    });

    this.dataSource = new ArrayStore({
      key: this.dataKey,
      data: this.moduleItems.sort((x: any, y: any) => x.SEQUENCE - y.SEQUENCE),
    });
    this.selectedItemKeys = [];

    this.$nextTick(() => {
      this.selectedItemKeys = selectedKey;
      this.moduleList()?.repaint();
    });
  }

  public async onItemClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    if (item.MODULE_KEY === this.selectedItemKeys[0]) {
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

    this.selectedItemKeys = [item.MODULE_KEY];
  }

  public clickUpButton() {
    return new Promise(resolve => {
      const selectedIdx = this.moduleItems.findIndex((item: any) => {
        return item.MODULE_KEY === this.selectedItemKeys[0];
      });

      if (selectedIdx < 1) return resolve(false);

      const targetItem = this.moduleItems[selectedIdx];
      const beforeItem = this.moduleItems[selectedIdx - 1];

      const beforeSeq = beforeItem.SEQUENCE;
      beforeItem.SEQUENCE = targetItem.SEQUENCE;
      targetItem.SEQUENCE = beforeSeq;

      this.$nextTick(() => {
        this.selectedItemKeys = [targetItem.MODULE_KEY];

        this.isChanging = true;
        setOnEditing(this.isOptionChanging || this.isChanging);

        resolve(true);
      });
    });
  }

  public clickDownButton() {
    return new Promise(resolve => {
      const selectedIdx = this.moduleItems.findIndex((item: any) => {
        return item.MODULE_KEY === this.selectedItemKeys[0];
      });

      if (selectedIdx >= this.moduleItems.length - 1 || selectedIdx < 0) return resolve(false);

      const targetItem = this.moduleItems[selectedIdx];
      const nextItem = this.moduleItems[selectedIdx + 1];

      const nextSeq = nextItem.SEQUENCE;
      nextItem.SEQUENCE = targetItem.SEQUENCE;
      targetItem.SEQUENCE = nextSeq;

      this.$nextTick(() => {
        this.selectedItemKeys = [targetItem.MODULE_KEY];

        this.isChanging = true;
        setOnEditing(this.isOptionChanging || this.isChanging);

        resolve(true);
      });
    });
  }

  public async dragEndItem(e: any) {
    this.loadingVisible = true;
    try {
      let loopCheck = 0;
      let idx = e.fromIndex;
      let flag = 0;
      if (e.fromIndex < e.toIndex) {
        flag = 1;
      } else {
        flag = -1;
      }

      this.selectedItemKeys = [this.moduleItems[idx].MODULE_KEY];

      while (idx !== e.toIndex) {
        if (flag > 0) {
          await this.clickDownButton();
        } else {
          await this.clickUpButton();
        }

        idx += flag;
        loopCheck++;

        if (loopCheck > 100) {
          MainModule.showSnackBar({ message: `${this.$t(`ErrorMessage`)}`, type: "error" });
          return;
        }
      }

      this.isChanging = true;
      setOnEditing(this.isOptionChanging || this.isChanging);
    } finally {
      this.loadingVisible = false;
    }
  }

  public async addModule() {
    this.moduleKey = "";
    this.isAddRow = true;

    await this.moduleEditor().setFormData();

    this.isShowEditPopup = true;
  }

  public async removeModule() {
    if (!this.selectedItemKeys || this.selectedItemKeys.length === 0) return;

    try {
      const moduleKey = this.selectedItemKeys[0];

      const dialog = await showConfirm({
        message: `${this.$t(`RemoveMessage`, [moduleKey])}`,
        // title: `Delete`,
        // message: `Are you sure you want to <b>Delete</b> '${moduleKey}'?`,
      });
      if (!dialog) return;

      this.loadingVisible = true;
      const result = await this.deleteFunc(this.tableName, [
        {
          SCENARIO_ID: this.selectedScenarioID,
          MODULE_KEY: moduleKey,
        },
      ]);

      if (result) {
        const optionResult = await this.deleteFunc(this.optionTableName, [
          {
            SCENARIO_ID: this.selectedScenarioID,
            MODULE_KEY: moduleKey,
          },
        ]);

        const sortedCount = await this.sortModule();
        console.log(
          `Affected Module(s) : ${result.count}${
            optionResult ? "\nAffected Option(s) : " + optionResult.count : ""
          }\nSorted Module(s) : ${sortedCount}`,
        );
        this.refresh();
        this.selectedItemKeys = [];
      }
    } finally {
      this.loadingVisible = false;
    }
  }

  public async sortModule() {
    const moduleItems = await loadTableDatas(this.tableName, {
      SCENARIO_ID: this.selectedScenarioID,
    });

    moduleItems.sort((x: any, y: any) => x.SEQUENCE - y.SEQUENCE);

    let sortedCount = 0;
    let index = 1;
    for await (const item of moduleItems) {
      if (item.SEQUENCE === index) {
        index++;
        continue;
      }

      const result = await this.updateFunc(
        this.tableName,
        { SCENARIO_ID: item.SCENARIO_ID, MODULE_KEY: item.MODULE_KEY },
        { SEQUENCE: index },
      );

      index++;
      if (result) sortedCount += result.count;
    }

    return sortedCount;
  }

  public async editModule() {
    if (this.isShowEditPopup) return;
    if (!this.selectedItemKeys || this.selectedItemKeys.length === 0) return;

    const moduleKey = this.selectedItemKeys[0];

    this.moduleKey = moduleKey;
    this.isAddRow = false;

    await this.moduleEditor().setFormData();

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

    let updatedCount = 0;

    for await (const item of this.moduleItems) {
      const result = await this.updateFunc(
        this.tableName,
        { SCENARIO_ID: item.SCENARIO_ID, MODULE_KEY: item.MODULE_KEY },
        { SEQUENCE: item.SEQUENCE },
      );

      updatedCount += result.count;
    }

    await this.optionEditor().onSaveData();

    this.isOptionChanging = false;
    setOnEditing(false);
    this.refresh();
  }
}
</script>
