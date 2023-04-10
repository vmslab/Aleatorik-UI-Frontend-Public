<template>
  <div>
    <DxPopup
      class="moz-popup"
      :visible="visible"
      :show-title="true"
      title="Multi Plan Config"
      :width="800"
      :height="414"
      @hidden="handleClose"
    >
      <div class="moz-area-padding">
        <DxForm
          ref="multiPlanForm"
          class="moz-form"
          :form-key="multiFormKey"
          :form-data="multiFormData"
          :show-colon-after-label="false"
        >
          <DxItem
            data-field="PLAN_ID"
            :editor-options="{
              readOnly: true,
            }"
          >
            <DxRequiredRule message="PLAN_ID is required" />
          </DxItem>
          <DxItem
            data-field="SOURCE_ID"
            :editor-options="{
              readOnly: true,
            }"
          >
            <DxLabel :text="isRevision ? 'REVISION_ID' : 'SOURCE_ID'" />
          </DxItem>
          <DxItem
            data-field="PLAN_START_TIME"
            editor-type="dxDateBox"
            :editor-options="{
              displayFormat: 'yyyy-MM-dd',
              useMaskBehavior: true,
              readOnly: multiFormData.SOURCE_ID !== 'Current',
            }"
          />
          <DxItem
            data-field="PLAN_PERIOD"
            editor-type="dxNumberBox"
            :editor-options="{
              format: ',##0.#########',
              showSpinButtons: true,
              readOnly: multiFormData.SOURCE_ID !== 'Current',
            }"
          />
          <DxItem data-field="EXECUTION_PLAN" template="executionPlan" />
          <template #executionPlan>
            <div>
              <WjFlexGrid
                style="width: 100%; height: 170px"
                :itemsSource="executionSource"
                :initialized="onInitialized"
                selectionMode="Cell"
                keyActionTab="Cycle"
                :autoGenerateColumns="false"
                :deferResizing="true"
                :quickAutoSize="true"
                :imeEnabled="true"
                :alternatingRowStep="0"
                :allowDelete="false"
                :allowDragging="false"
                :allowPinning="false"
                :allowSorting="false"
                :formatItem="formatItem"
                :cellEditEnded="cellEditEnded"
                :beginningEdit="beginningEdit"
              >
                <WjFlexGridColumn :width="40" :isReadOnly="true" binding="DELETE_BTN" header=" ">
                  <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                    <DxButton v-show="allowDeleting(cell)" icon="trash" stylingMode="text" @click="onDelete" />
                  </WjFlexGridCellTemplate>
                </WjFlexGridColumn>
                <WjFlexGridColumn
                  binding="SCENARIO_ID"
                  align="between"
                  :dataMap="dataMap"
                  dataMapEditor="DropDownList"
                  :isReadOnly="!allowEditing()"
                  :width="150"
                />
                <WjFlexGridColumn binding="PLAN_ID" :isReadOnly="true" :width="150" />
                <WjFlexGridColumn binding="DESCRIPTION" width="*" />
                <WjFlexGridColumn binding="CREATE_TIME" :visible="false" :isReadOnly="true" />
              </WjFlexGrid>
            </div>
          </template>
        </DxForm>
      </div>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          id: 'popupBtn',
          text: $t('Add'),
          stylingMode: 'outlined',
          class: 'moz-button',
          onClick: onMultiSaveData,
        }"
      />
    </DxPopup>
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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

import { MultiRunPlan, RunRevisionTable } from "@/api/mainService";
import { ExtendGrid, IMenuItemEventArgs } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid, DataMap, CellRange } from "@grapecity/wijmo.grid";
import { DxForm, DxItem, DxRequiredRule, DxLabel } from "devextreme-vue/form";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { dateToFormat, setVersionNo } from "@/utils/commonUtils";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import DxButton from "devextreme-vue/button";

@Component({
  name: "ATPlanMultiRunPopup",
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
    DxPopup,
    DxToolbarItem,
    DxForm,
    DxItem,
    DxRequiredRule,
    DxLabel,
    DxLoadPanel,
    DxButton,
  },
})
export default class ATPlanMultiRunPopup extends Vue {
  @Prop({ type: Boolean, required: true, default: false }) public visible?: boolean;
  @Prop({ type: Object, required: false }) public targetPlan?: any;
  @Prop({ type: Array, required: false }) public scenarioDatas?: any[];

  @Prop({ type: Boolean, required: false, default: false }) public isRevision?: boolean;
  @Prop({ type: Boolean, required: false, default: true }) public isSetAfterRun?: boolean;

  @Prop({ type: [Number, String], required: false }) public width?: number | string;
  @Prop({ type: [Number, String], required: false }) public height?: number | string;

  public loadingVisible = false;

  public multiFormKey: any = {};
  public multiFormData: any = {};
  public executionData: any = [];

  public executionSource: any = [];
  public flexGrid: FlexGrid | null = null;
  public extendGrid: ExtendGrid | null = null;

  constructor() {
    super();
  }

  public get dataMap() {
    return new DataMap(this.scenarioDatas, "SCENARIO_ID", "SCENARIO_ID");
  }

  public mounted() {
    this.extendGrid?.refresh();
  }

  public onInitialized(grid: FlexGrid) {
    this.flexGrid = grid;

    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useSelector: false,
        useContextMenu: false,
        useFooter: false,
        useFilter: false,
        useGroupPanel: false,
        useParseDate: false,
        useAutoColumnFit: false,
      },
    });
  }

  public beginningEdit(s: FlexGrid, e: any) {
    if (s.columns[e.col].binding !== "SCENARIO_ID") return;

    setTimeout(() => {
      if (!this.scenarioDatas) return;
      const element = document.getElementsByClassName(
        "wj-dropdown-panel wj-grid-listbox wj-control wj-content wj-listbox",
      )[0];
      console.log(element);
      this.setDropdownScrollEvent(element, this.scenarioDatas.length);
    }, 200);
  }

  public formatItem(s: FlexGrid, e: any) {
    if (e.row > 4 && e.getColumn().binding !== "DELETE_BTN") {
      e.cell.style.backgroundColor = "lightgray";
    }
  }

  public cellEditEnded(s: FlexGrid, e: any) {
    if (s.columns[e.col].binding !== "SCENARIO_ID") return;

    const newValue = s.getCellData(e.row, e.col, false);
    if (!newValue) return;

    const scenarioData = this.scenarioDatas?.find((item: any) => item.SCENARIO_ID === newValue);

    s.setCellData(e.row, "PLAN_ID", `${this.multiFormData.PLAN_ID}-R${this.leftPad(e.row)}`);
    s.setCellData(e.row, "DESCRIPTION", scenarioData?.DESCRIPTION);

    const fillData = this.executionSource.filter((item: any) => item.SCENARIO_ID?.length > 0);
    if (fillData && fillData.length === this.executionSource.length) {
      (s.collectionView as any).addNew({ CREATE_TIME: new Date() });
      (s.collectionView as any).commitNew();

      s.startEditing(true, e.row, "DESCRIPTION");
    }
  }

  public onDelete() {
    this.executionSource.pop();
    const lastIdx = this.executionSource.length - 1;
    this.executionSource[lastIdx] = {
      CREATE_TIME: this.executionSource[lastIdx].CREATE_TIME,
    };

    this.flexGrid?.collectionView.refresh();
    this.flexGrid?.refresh(true);

    this.$nextTick(() => {
      this.flexGrid?.startEditing(true, lastIdx, "SCENARIO_ID");
      this.flexGrid?.focus();
    });
  }

  @Watch("visible")
  public onVisibleChanged() {
    if (this.visible) {
      this.multiFormData = {
        PLAN_ID: this.isRevision
          ? this.targetPlan?.PLAN_ID.substring(0, this.targetPlan?.PLAN_ID.length - 4)
          : `MM${dateToFormat(new Date(), "YYYYMMDDHHmmss")}`,
        SOURCE_ID: this.targetPlan?.PLAN_ID || "Current",
        PLAN_START_TIME: this.targetPlan?.PLAN_START_TIME || new Date().trimDate(),
        PLAN_PERIOD: this.targetPlan?.PLAN_PERIOD || 90,
      };

      this.$nextTick(() => {
        this.executionData = [];
        if (this.isRevision && this.targetPlan) {
          const srcScenario = this.targetPlan.SCENARIO_ID;
          const scenarioData = this.scenarioDatas?.find((item: any) => item.SCENARIO_ID === srcScenario);
          this.executionData.push({
            SCENARIO_ID: srcScenario,
            PLAN_ID: this.targetPlan.PLAN_ID,
            CREATE_TIME: this.targetPlan.CREATE_TIME,
            DESCRIPTION: scenarioData?.DESCRIPTION,
          });
        }
        this.executionData.push({ CREATE_TIME: new Date() });
        this.executionSource = this.executionData;
      });
    }
  }

  public updateMultiPlanID() {
    const planID = `MM${dateToFormat(new Date(), "YYYYMMDDHHmmss")}`;
    (this.$refs.multiPlanForm as any)?.instance?.updateData("PLAN_ID", planID);
    return planID;
  }

  public async onMultiSaveData(e: any) {
    const multiRunScenario = this.executionData.filter((item: any) => item.SCENARIO_ID?.length > 0);
    const result = await this.multiRunFunc(this.multiFormData, multiRunScenario);

    if (this.isSetAfterRun) {
      setVersionNo(multiRunScenario[multiRunScenario.length - 1].PLAN_ID);
    }
    this.$emit("action", {
      result,
      executions: multiRunScenario.map((data: any) => data.PLAN_ID),
    });
  }

  public async multiRunFunc(option: any, values: any) {
    this.loadingVisible = true;

    try {
      let data = JSON.parse(JSON.stringify(values));
      let result;
      if (this.isRevision) {
        result = await RunRevisionTable(data[0].PLAN_ID, data[0].DESCRIPTION);
        data.splice(0, 1);
      }

      if (data.length > 0) {
        result = await MultiRunPlan(
          option,
          data.map((value: any) => JSON.stringify(value)),
        );
      }
      return JSON.parse(result?.data);
    } finally {
      this.loadingVisible = false;
    }
  }

  public allowUpdating(e: any) {
    return e.row.rowIndex < 5;
  }

  public allowEditing() {
    return this.executionData.length < 6;
  }

  public allowDeleting(e: any) {
    // if (this.isRevision)
    //   return this.executionData.length > 2 && this.executionData.length - 1 === e.row.rowIndex;
    // return this.executionData.length > 1 && this.executionData.length - 1 === e.row.rowIndex;
    if (this.isRevision) return this.executionData.length > 2 && this.executionData.length - 1 === e.row.index;
    return this.executionData.length > 1 && this.executionData.length - 1 === e.row.index;
  }

  public leftPad = (value: any) => {
    if (value >= 10) {
      return value;
    }
    return `0${value}`;
  };

  public handleClose() {
    this.$emit("close", {});
  }

  public setDropdownScrollEvent(element: any, srcSize: number) {
    element.addEventListener("wheel", (evt: any) => {
      if (element.scrollTop < 0 || element.scrollTop > srcSize * 25) return;
      evt.deltaY > 0 ? (element.scrollTop += 20) : (element.scrollTop -= 20);
    });
  }
}
</script>
