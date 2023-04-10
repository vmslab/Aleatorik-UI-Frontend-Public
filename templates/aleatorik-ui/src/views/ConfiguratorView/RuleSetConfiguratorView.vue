<template>
  <div>
    <moz-controller :showFilter="filter">
      <button class="filter-icon" @click="filter = !filter">
        <i
          v-tooltip="{ text: filter ? $t('HideFilter') : $t('ShowFilter') }"
          class="mozart-icons"
          :class="{
            'moz-filter-icon': !filter,
            'moz-filter-icon-tap': filter,
          }"
        />
      </button>

      <div class="spacer" />

      <DxButton
        v-tooltip="{ text: $t('SaveCondition') }"
        icon="download"
        type="default"
        :focusStateEnabled="false"
        @click="onSaveCondition"
      />
      <DxButton
        v-tooltip="{ text: $t('ResetCondition') }"
        icon="clearformat"
        type="default"
        :focusStateEnabled="false"
        @click="onRemoveCondition"
      />
      <DxButton
        v-tooltip="{ text: $t('Save') }"
        class="moz-default-button"
        icon="save"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Save')"
        @click="onSaveData"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Search')"
        @click="onRefreshData"
      />
      <div slot="filter">
        <label>MODULE_TYPE</label>
        <DxSelectBox
          :value="selectedModuleType"
          :items="['PBO', 'PBB', 'PBF']"
          @selection-changed="onRuleSetSelectionChanged"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <RuleSetConfiguratorMain
        ref="ruleSetMainView"
        :key="selectedModuleType"
        :selectedModuleType="selectedModuleType"
      />
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
import { Component, Vue } from "vue-property-decorator";

import { loadCondition, saveCondition, removeCondition } from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import DxSelectBox from "devextreme-vue/select-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";

import "devextreme-vue/text-area";
import RuleSetConfiguratorMain from "@/views/ConfiguratorView/RuleSetConfiguratorMain.vue";

@Component({
  components: {
    DxButton,
    DxSelectBox,
    DxLoadPanel,
    RuleSetConfiguratorMain,
  },
})
export default class RuleSetConfiguratorView extends Vue {
  public filter = true;

  public selectedModuleType = "PBO";

  public isShowEditPopup = false;
  public isAddRow = false;
  public loadingVisible = false;

  public tabIndex = 0;

  public customPropertiesLength = 0;

  constructor() {
    super();
  }

  public ruleSetMainView() {
    return this.$refs.ruleSetMainView as any;
  }

  public async mounted() {
    await this.onLoadCondition();
  }

  public onRefreshData() {
    this.$forceUpdate();
  }

  public onRuleSetSelectionChanged({ selectedItem }: any) {
    this.selectedModuleType = selectedItem;
  }

  public onSaveData() {
    this.ruleSetMainView().onSaveData();
  }

  public async onLoadCondition() {
    try {
      const condition = (await loadCondition()) as any;

      this.selectedModuleType = condition.moduleType;
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onSaveCondition() {
    try {
      const condition = {
        moduleType: this.selectedModuleType,
      };

      await saveCondition(condition);
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onRemoveCondition() {
    try {
      await removeCondition();
    } catch (e) {
      console.log("err", e);
    }
  }
}
</script>
