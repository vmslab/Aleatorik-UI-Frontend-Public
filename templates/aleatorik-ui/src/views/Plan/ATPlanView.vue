<template>
  <div>
    <!-- <DxContextMenu
      :data-source="addModeItems"
      :width="200"
      target="#add-mode-btn"
      @item-click="
        e => {
          const data = e.itemData.data;
          if (!data) return;

          if (data === 'AddSingle') onAddRow();
          else if (data === 'AddMulti') onAddMultiRow();
        }
      "
      show-event="dxclick"
    >
      <template #item="{ data: e }">
        <div>
          {{ e.text }}
        </div>
      </template>
    </DxContextMenu> -->
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
        v-tooltip="{ text: $t('Run') }"
        class="moz-default-button"
        icon="play"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Run')"
        @click="onAddRow"
      />
      <!-- <DxButton
        v-tooltip="isCreateItem ? { text: $t('Edit') } : { text: $t('Open') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :focusStateEnabled="false"
        :text="isCreateItem ? $t('Edit') : $t('Open')"
        :disabled="!showEditButton"
        @click="onEditRow"
      /> -->
      <DxButton
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Delete')"
        :disabled="!showEditButton"
        @click="onRemoveRow"
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
        <label>{{ $t("FROM DATE") }}</label>
        <DxDateBox
          :value="fromDate.toDate()"
          :use-mask-behavior="true"
          type="date"
          displayFormat="yyyy-MM-dd"
          @value-changed="onEndTimeChanged"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('1주일') }"
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="$t('1주일')"
          @click="setDateWeekBefore"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('1개월') }"
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="$t('1개월')"
          @click="setDateMonthBefore"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('3개월') }"
          class="moz-default-button"
          type="default"
          :focusStateEnabled="false"
          :text="$t('3개월')"
          @click="setDate3MonthBefore"
        />
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <WjFlexGrid
        style="
          width: var(--size-content-inner-width);
          height: calc(var(--size-content-inner-height-outer-controller) - 3px);
        "
        class="moz-readonly-grid grid-select-pointer"
        :itemsSource="dataSource"
        :initialized="onInitialized"
        showSelectedHeaders="All"
        selectionMode="MultiRange"
        allowSorting="MultiColumn"
        keyActionTab="Cycle"
        :allowDelete="true"
        :autoGenerateColumns="false"
        :deferResizing="true"
        :imeEnabled="true"
        :alternatingRowStep="0"
        :isReadOnly="true"
        :allowPinning="false"
        :showMarquee="true"
      >
        <WjFlexGridColumn binding="PLAN_ID" header="PLAN ID" aggregate="Cnt" :width="160" />

        <WjFlexGridColumn
          binding="PLAN_START_TIME"
          header="PLAN START DATE"
          format="yyyy-MM-dd"
          dataType="Date"
          :width="140"
          align="center"
        />
        <WjFlexGridColumn binding="PLAN_PERIOD" header="PLAN PERIOD" :width="120" />
        <WjFlexGridColumn binding="SCENARIO_ID" header="SCENARIO ID" :width="140" />
        <WjFlexGridColumn binding="PLAN_TYPE" header="PLAN TYPE" :width="100" align="center" />
        <WjFlexGridColumn binding="EXECUTION_TYPE" header="EXECUTION TYPE" :width="135" align="center" />
        <WjFlexGridColumn binding="SOURCE_ID" header="SOURCE ID" :width="100" />
        <WjFlexGridColumn binding="DESCRIPTION" header="DESCRIPTION" :width="150" />
        <WjFlexGridColumn binding="CREATE_USER" header="CREATE USER" :width="120" />
        <WjFlexGridColumn binding="PLAN_STATUS" header="PLAN STATUS" :width="120" align="center">
          <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
            <div class="status" :class="getLevelClass(cell.item.PLAN_STATUS)">
              <div class="dot"></div>
              {{ cell.item.PLAN_STATUS }}
            </div>
          </WjFlexGridCellTemplate>
        </WjFlexGridColumn>
        <WjFlexGridColumn
          binding="CREATE_TIME"
          header="CREATE TIME"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          :width="140"
          align="center"
        />
        <WjFlexGridColumn
          binding="INBOUND_START"
          header="INBOUND START"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          :width="140"
          align="center"
        />
        <WjFlexGridColumn
          binding="INBOUND_END"
          header="INBOUND END"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          :width="140"
          align="center"
        />
        <WjFlexGridColumn
          binding="ENGINE_START"
          header="ENGINE START"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          :width="140"
          align="center"
        />
        <WjFlexGridColumn
          binding="ENGINE_END"
          header="ENGINE END"
          format="yyyy-MM-dd HH:mm:ss"
          dataType="Date"
          :width="140"
          align="center"
        />
      </WjFlexGrid>
      <DxPopup
        class="moz-popup"
        :visible="isShowEditPopup"
        :show-title="true"
        :title="isAddRow ? $t('Plan Add') : $t('Plan Edit')"
        :width="585"
        height="auto"
        @hiding="isShowEditPopup = false"
      >
        <div class="moz-area-padding plan-popup">
          <DxForm
            ref="dxForm"
            class="moz-form"
            :form-key="formKey"
            :form-data="formData"
            validation-group="validationPlan"
            :show-colon-after-label="false"
          >
            <DxItem
              data-field="PLAN_ID"
              :editor-options="{
                disabled: !isAddRow,
              }"
            >
              <DxRequiredRule message="PLAN_ID is required" />
              <DxAsyncRule :validation-callback="validationPlanID" message="PLAN_ID is already registered" />
            </DxItem>
            <DxItem
              data-field="SCENARIO_ID"
              :label="{ text: $t(`SCENARIO_ID`) }"
              editor-type="dxSelectBox"
              :editor-options="{
                items: scenarioDatas,
                disabled: !isCreated,
                valueExpr: 'SCENARIO_ID',
                displayExpr: 'SCENARIO_ID',
                searchExpr: 'SCENARIO_ID',
                searchEnabled: true,
                showClearButton: true,
              }"
            >
              <DxRequiredRule message="SCENARIO_ID is required" />
            </DxItem>

            <DxItem
              data-field="PLAN_START_TIME"
              editor-type="dxDateBox"
              :label="{
                text: $t('PLAN START DATE'),
              }"
              :editor-options="{
                disabled: !isCreated,
                displayFormat: 'yyyy-MM-dd',
                useMaskBehavior: true,
              }"
            >
              <DxRequiredRule message="PLAN_START_TIME is required" />
            </DxItem>
            <DxItem
              data-field="PLAN_PERIOD"
              editor-type="dxNumberBox"
              :editor-options="{
                disabled: !isCreated,
                showSpinButtons: true,
                format: ',##0.#########',
              }"
            >
              <DxRequiredRule message="PLAN_PERIOD is required" />
              <DxRangeRule min="1" message="PLAN_PERIOD must be at least 1" />
            </DxItem>

            <DxItem
              class="desc"
              data-field="DESCRIPTION"
              editor-type="dxTextArea"
              :editor-options="{
                height: 70,
              }"
            ></DxItem>
          </DxForm>
        </div>
        <!-- text: isAddRow ? $t('Add') : isCreated ? $t('Modify') : $t('Close'), -->
        <DxToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          :options="{
            stylingMode: 'outlined',
            text: isAddRow ? $t('Run') : $t('Edit'),
            class: 'moz-button',
            onClick: onSaveData,
          }"
        />
      </DxPopup>
      <ATPlanMultiRunPopup
        :visible="isShowMultiPlanPopup"
        :targetPlan="targetPlan"
        :scenarioDatas="scenarioDatas"
        @action="isShowMultiPlanPopup = false"
        @close="isShowMultiPlanPopup = false"
      />
      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
      <ATPlanCompareSelectPopup
        width="calc(var(--size-content-inner-width) - 600px)"
        height="calc(var(--size-content-inner-height-outer-controller) - 200px)"
        :visible="openCompareSelect"
        :version="compareBaseVersionItem"
        @action="showCompareView"
        @close="closeCompare"
      />
      <!-- <ATPlanCloneDialog
        v-if="showCloneDialog"
        :key="showCloneDialog"
        :visible="showCloneDialog"
        :version="selectedPlanID"
        @close="onCloneClose"
        @complete="onCloneComplete"
      /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { EventBus } from "mozart-common";
import { ActionLoadOptions, showConfirm, ExtendGrid } from "mozart-component-wijmo";

import { DxLoadPanel } from "devextreme-vue/load-panel";
import { Get, Add, Modify, Remove, OptimizationPlan, GetTableRemote, MultiRunPlan } from "@/api/mainService";
import { getMonitoringSocketURL } from "@/utils/request";
import {
  setVersionNo,
  setOnEditing,
  loadCondition,
  saveCondition,
  removeCondition,
  setCreateProperty,
  setUpdateProperty,
  getVersionDatas,
  dateToFormat,
} from "@/utils/commonUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import ValidationEngine from "devextreme/ui/validation_engine";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxForm, DxItem, DxRequiredRule, DxRangeRule, DxAsyncRule } from "devextreme-vue/form";

import DxDateBox from "devextreme-vue/date-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import DxSelectBox from "devextreme-vue/select-box";
import { DxContextMenu } from "devextreme-vue/context-menu";

import ATPlanCompareSelectPopup from "@/views/Plan/ATPlanCompareSelectPopup.vue";
import ATPlanMultiRunPopup from "@/views/Plan/ATPlanMultiRunPopup.vue";
import { WjFlexGrid, WjFlexGridColumn, WjFlexGridCellTemplate } from "@grapecity/wijmo.vue2.grid";
import { CollectionView } from "@grapecity/wijmo";
import dayjs, { Dayjs } from "dayjs";

@Component({
  components: {
    DxLoadPanel,
    DxButton,
    DxRequiredRule,
    DxRangeRule,
    DxPopup,
    DxForm,
    DxItem,
    DxDateBox,
    DxNumberBox,
    DxSelectBox,
    DxToolbarItem,
    DxContextMenu,
    DxAsyncRule,
    ATPlanCompareSelectPopup,
    ATPlanMultiRunPopup,
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class ATPlanView extends Vue {
  public filter: boolean = true;

  public tableName: string = "ATPlan";
  public dataKey: string[] = ["PLAN_ID"];

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};
  public multiFormKey: any = {};
  public multiFormData: any = {};
  public executionData: any = [];
  public targetPlan: any = {};

  public fromDate: Dayjs = dayjs().add(-1, "month").startOf("day");

  public scenarioDatas: any[] = [];
  public selectedPlanID: string = "";

  public showEditButton = false;

  public isAddRow = false;
  public isChanging = false;
  public isCreated = false;
  public isDoneItem = false;
  public isCreateItem = false;
  public isRunningItem = false;

  public isLoadedData = false;
  public isShowEditPopup = false;
  public isShowMultiPlanPopup = false;
  public loadingVisible = true;

  public openCompareSelect = false;
  public compareBaseVersionItem: any = {};

  public socket: WebSocket | null = null;
  private intervalId: NodeJS.Timer | null = null;

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  public selectedRow: any = [];

  public lastPlanInfoKey: string = "PLM2000100S/LAST_PLAN_INFO";

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    grid.hostElement?.addEventListener("dblclick", this.onRowDblClick);
    grid.selectionChanged.addHandler(this.onSelectionChanged);

    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "save",
      },
      gridOptions: {
        onInitialized: grid => {
          const menus = this.createContextMenu();
          menus.forEach(menu => {
            grid?.contextMenu?.addMenuItem({
              header: menu.header,
              cmd: menu.cmd,
              active: menu.active,
              clicked: menu.handler,
            });
          });
        },
        setContextMenuProps: {
          onAddRow: undefined,
          onRemoveRow: undefined,
        },
      },
    });
  }

  public addModeItems = [
    { data: "AddSingle", text: this.$t("Add Execution") },
    { data: "AddMulti", text: this.$t("Add Multi Execution") },
  ];

  constructor() {
    super();
  }

  public getLevelClass(level: any): string {
    switch (level) {
      case "READY":
      case "REVISION":
        return "";
      case "CREATE":
        return "create";
      case "OPTIMIZING":
      case "COPYING":
      case "RUN":
        return "run";
      case "DONE":
        return "done";
      default:
        return "error";
    }
  }

  public onSelectionChanged() {
    const selectedRowsData = this.dataGrid.rows.filter((r: any) => r.isSelected).map((item: any) => item.dataItem);

    const flag = selectedRowsData.length > 0;
    const flag2 = selectedRowsData.length > 0 && selectedRowsData[0].PLAN_STATUS === "DONE";
    const flag3 = selectedRowsData.length > 0 && selectedRowsData[0].PLAN_STATUS === "CREATE";
    const flag4 =
      selectedRowsData.length > 0 &&
      (selectedRowsData[0].PLAN_STATUS === "COPYING" ||
        selectedRowsData[0].PLAN_STATUS === "RUN" ||
        selectedRowsData[0].PLAN_STATUS === "REVISION");

    if (flag) {
      this.selectedPlanID = selectedRowsData[0].PLAN_ID;
      this.selectedRow = selectedRowsData;
    }

    if (this.showEditButton != flag) this.showEditButton = flag;
    if (this.isDoneItem != flag2) this.isDoneItem = flag2;
    if (this.isCreateItem != flag3) this.isCreateItem = flag3;
    if (this.isRunningItem != flag4) this.isRunningItem = flag4;

    if (flag && flag4) {
      // 체크 대상이고 실행중 아이템이면
      this.showEditButton = false; // 삭제 버튼 비활성화
    }
  }

  public async created() {
    this.intervalId = setInterval(async () => {
      await this.connectWebSocket();
    }, 2000);
  }

  public async mounted() {
    await this.onRefreshData();
  }

  public destroyed() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public async connectWebSocket() {
    if (this.socket && this.socket.readyState === 1) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      return;
    }

    this.socket = new WebSocket(getMonitoringSocketURL());
    if (this.socket) {
      this.socket.onopen = () => {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      };
      this.socket.onmessage = async (evt: MessageEvent) => {
        const result = JSON.parse(evt.data);

        if (result.obj === "DONE" || result.obj === "RUN") {
          await this.onRefreshData();
        }
      };
    }
    this.socket.onerror = (evt: any) => {
      this.socket?.close();
    };
    this.socket.onclose = () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(async () => {
        await this.connectWebSocket();
      }, 1000);
    };
  }

  public async loadFunc(obj: ActionLoadOptions) {
    const where = {
      START_TIME: this.fromDate.format("YYYY-MM-DD HH:mm:ss:SSS"),
      END_TIME: dayjs().format("YYYY-MM-DD HH:mm:ss:SSS"),
      // PLAN_TYPE: this.planType,
    };
    const result = await Get(this.tableName, { option: obj, where: JSON.stringify(where) }, "post");
    const data = JSON.parse(result.data);

    if (!this.isLoadedData) this.isLoadedData = data.totalCount > 0;
    return data.data;
  }

  public async loadScenario() {
    const result = await GetTableRemote("CFG_SCENARIO_MASTER", {});
    const data = JSON.parse(result.data);
    return data.data;
  }

  public async insertFunc(values: any) {
    this.loadingVisible = true;

    try {
      let option = {
        PLAN_ID: values.PLAN_ID,
        PLAN_PERIOD: values.PLAN_PERIOD,
        PLAN_START_TIME: values.PLAN_START_TIME,
        SOURCE_ID: "Current",
      };

      let value = {
        PLAN_ID: values.PLAN_ID,
        DESCRIPTION: values.DESCRIPTION,
        SCENARIO_ID: values.SCENARIO_ID,
        PLAN_START_TIME: values.PLAN_START_TIME,
        EXECUTION_TYPE: values.EXECUTION_TYPE, // SingleRun
      };

      if (window.localStorage) {
        localStorage.setItem(
          this.lastPlanInfoKey,
          JSON.stringify({
            SCENARIO_ID: values.SCENARIO_ID,
            PLAN_START_TIME: values.PLAN_START_TIME,
            PLAN_PERIOD: values.PLAN_PERIOD,
          }),
        );
      }

      let result = await MultiRunPlan(option, [JSON.stringify(value)]);

      return JSON.parse(result?.data);
    } finally {
      this.loadingVisible = false;
    }
  }

  public async updateFunc(key: any, values: any) {
    this.loadingVisible = true;

    try {
      setUpdateProperty(values);
      const result = await Modify(this.tableName, {
        keys: JSON.stringify(key),
        values: JSON.stringify(values),
      });
      return JSON.parse(result.data);
    } finally {
      this.loadingVisible = false;
    }
  }

  public async deleteFunc(key: any) {
    this.loadingVisible = true;

    try {
      const result = await Remove(this.tableName, { keys: JSON.stringify(key) });
      return JSON.parse(result.data);
    } finally {
      this.loadingVisible = false;
    }
  }

  public async validationPlanID({ value }: any) {
    const versionDatas = await getVersionDatas();

    return new Promise(resolve => {
      const result = !versionDatas.some((item: any) => item.PLAN_ID.toLowerCase() == value.toLowerCase());
      resolve(result);
    });
  }

  public createContextMenu() {
    const menus = [];

    menus.push({
      cmd: "add-plan",
      header: "Add Plan",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        this.onAddRow();
      },
    });

    menus.push({
      cmd: "edit-plan",
      header: "Edit Plan",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        // console.log(grid, cv, col, hitTest);
        this.onEditRow(hitTest.row);
      },
    });

    menus.push({
      cmd: "delete-plan",
      header: "Delete Plan",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        // const data = grid.rows[rowIndex].dataItem;
        this.onRemoveRow(hitTest.row);
      },
    });

    menus.push({
      header: "-",
    });

    menus.push({
      cmd: "run-multi-scenario",
      header: "Run Multi Scenario",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        return data.PLAN_STATUS === "DONE";
      },
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        this.onAddMultiRow(data);
      },
    });

    menus.push({
      cmd: "compare-plan-kpi",
      header: "Compare Plan KPI",
      active: () => true,
      handler: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        this.openCompareSelect = true;
        this.compareBaseVersionItem = data;
      },
    });

    menus.push({
      cmd: "run-optimize-source-plan",
      header: "Run Optimize Source Plan", //Run Optimize Source Plan (${data.SOURCE_ID})
      active: () => true,
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;

        const targetID = data.SOURCE_ID;

        const result = await showConfirm({
          message: `${this.$t(`OptimizeMessage`, [targetID])}`,
        });

        if (!result) return;

        await OptimizationPlan(targetID);
        await this.onRefreshData();
      },
    });

    menus.push({
      cmd: "run-optimize-plan",
      header: "Run Optimize Plan", // Run Optimize Plan (${planID})
      active: () => true,
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        const targetID = data.planID;

        const result = await showConfirm({
          message: `${this.$t(`OptimizeMessage`, [targetID])}`,
        });

        if (!result) return;

        await OptimizationPlan(targetID);
        await this.onRefreshData();
      },
    });

    menus.push({
      header: "-",
    });

    menus.push({
      cmd: "open-optimization-manager",
      header: "Open Optimization Manager",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        return data.EXECUTION_TYPE === "Optimization";
      },
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;

        EventBus.fire("open-popup", {
          params: { key: "optimization-manager", params: `?v=${data.PLAN_ID}` },
        });
      },
    });

    menus.push({
      cmd: "open-revision-manager",
      header: "Open Revision Manager",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        return data.PLAN_STATUS === "DONE";
      },
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;

        EventBus.fire("push-route-by-key", {
          params: { key: "revision-edit-table", params: { v: `${data.PLAN_ID}` } },
        });
      },
    });
    menus.push({
      cmd: "open-sales-order-manager",
      header: "Open Sales Order Manager",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        return data.PLAN_STATUS === "DONE";
      },
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;

        EventBus.fire("push-route-by-key", {
          params: {
            key: "rev-sales-order-edit-view",
            params: { v: `${data.PLAN_ID}` },
          },
        });
      },
    });
    menus.push({
      cmd: "open-compare-rtf-report",
      header: "Open Compare RTF Report",
      active: (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;
        return data.PLAN_STATUS === "DONE";
      },
      handler: async (arg: any) => {
        const { grid, cv, col, hitTest } = arg;
        const data = grid.rows[hitTest.row].dataItem;

        EventBus.fire("push-route-by-key", {
          params: { key: "rtf-compare-by-so", params: { v: `${data.PLAN_ID}` } },
        });
      },
    });

    return menus;
  }

  public showCompareView(e: any) {
    this.openCompareSelect = false;

    EventBus.fire("open-popup", {
      params: { key: "at-plan-compare-view", params: `?v=${e.planIDs}` },
    });
  }

  public closeCompare(e: any) {
    this.openCompareSelect = false;
  }

  public async onRefreshData() {
    this.loadingVisible = true;
    try {
      setOnEditing(false);

      this.dataSource = new CollectionView(await this.loadFunc({}));
      this.scenarioDatas = await this.loadScenario();

      this.extendGrid?.refresh();
    } finally {
      this.loadingVisible = false;
    }
  }

  public updatePlanID() {
    /* 신규가 아니라 수정 상태로 팝업 OPEN 시 간헐적으로 PLAN ID가 새로 채번되는 오류 수정 */
    if (this.isCreated === false) return;

    (this.$refs.dxForm as any)?.instance?.updateData(
      "PLAN_ID",
      `${this.formData.PLAN_TYPE?.substring(0, 1)}S${dateToFormat(new Date(), "YYYYMMDDHHmmss")}`,
    );
  }

  public onAddRow() {
    this.isAddRow = true;
    this.isCreated = true;

    let lastPlanInfo;
    try {
      if (window.localStorage) {
        lastPlanInfo = JSON.parse(localStorage.getItem(this.lastPlanInfoKey) || "{}");
      }
    } catch (e) {
      lastPlanInfo = {};
    }

    this.formData = {
      PLAN_TYPE: "Manual",
      DESCRIPTION: "",
      PLAN_START_TIME: !!lastPlanInfo.PLAN_START_TIME ? lastPlanInfo.PLAN_START_TIME : new Date().trimDate(),
      PLAN_PERIOD: !!lastPlanInfo.PLAN_PERIOD ? lastPlanInfo.PLAN_PERIOD : 90,
      SCENARIO_ID: !!lastPlanInfo.SCENARIO_ID ? lastPlanInfo.SCENARIO_ID : "",
    };
    this.$nextTick(() => {
      this.updatePlanID();
      this.isShowEditPopup = true;
    });
  }

  public onAddMultiRow(targetData: any) {
    this.targetPlan = targetData;

    this.isShowMultiPlanPopup = true;
  }

  public onRowDblClick(e: any) {
    var hti = this.dataGrid.hitTest(e);
    var col = hti.col;
    var row = hti.row;
    this.dataGrid.select(0, 0);
    if (hti.panel === this.dataGrid.cells) {
      // var item = hti.panel.rows[row].dataItem;

      // this.isAddRow = false;
      // this.isCreated = item.PLAN_STATUS === "CREATE";
      // // this.formKey = item.key;
      // let keyObj: any = {};
      // this.dataKey.forEach((key: string) => {
      //   keyObj[key] = item[key];
      // });
      // this.formKey = keyObj;

      // this.formData = {
      //   PLAN_ID: item.PLAN_ID,
      //   PLAN_TYPE: item.PLAN_TYPE,
      //   DESCRIPTION: item.DESCRIPTION,
      //   PLAN_START_TIME: item.PLAN_START_TIME,
      //   PLAN_PERIOD: item.PLAN_PERIOD,
      //   SCENARIO_ID: item.SCENARIO_ID,
      //   SOURCE_ID: item.SOURCE_ID,
      // };

      // this.$nextTick(() => {
      //   this.isShowEditPopup = true;
      // });
      this.onEditRow(row);
    }
  }

  public async onSaveData(e: any) {
    this.loadingVisible = true;
    try {
      const valid = ValidationEngine.validateGroup("validationPlan");
      if (!valid.isValid) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
      if (valid.status === "pending") {
        const validResult = await valid.complete;

        if (!validResult || !validResult.isValid) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
      }

      let result = null;
      if (this.isAddRow) {
        this.formData.EXECUTION_TYPE = "SingleRun";
        result = await this.insertFunc(this.formData);
      } else {
        result = await this.updateFunc(this.formKey, this.formData);
        if (result.count === 0) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });

          return;
        }
      }
      // else if (this.isCreated) {
      //   result = await this.updateFunc(this.formKey, this.formData);
      // } else {
      //   this.isShowEditPopup = false;
      //   return;
      // }

      await this.onRefreshData();

      if (result) {
        this.dataGrid?.refresh();
        this.isShowEditPopup = false;
        setVersionNo(this.formData.PLAN_ID);
      }
    } finally {
      this.loadingVisible = false;
    }
  }

  public findRowByDataKey(searchRow: any) {
    return this.dataGrid.rows.find((row: any) => {
      return this.dataKey.every((key: string) => {
        return row.dataItem[key] == searchRow[key];
      });
    });
  }

  public onEditRow(index: number) {
    this.isAddRow = false;
    // const selectedRows = this.dataGrid.getSelectedRowKeys();

    let rowIndex = Number.isInteger(index) ? index : -1;
    const selectedRows = this.selectedRow;

    if (rowIndex < 0 && selectedRows && selectedRows.length > 0) {
      rowIndex = this.findRowByDataKey(selectedRows[selectedRows.length - 1])?.dataIndex || 0;
    }

    if (rowIndex < 0) return;

    // const rows = this.dataGrid.getVisibleRows();
    const row = this.dataGrid.rows[rowIndex].dataItem;
    this.isCreated = row.PLAN_STATUS === "CREATE";
    this.formData = {
      PLAN_ID: row.PLAN_ID,
      PLAN_TYPE: row.PLAN_TYPE,
      DESCRIPTION: row.DESCRIPTION,
      PLAN_START_TIME: row.PLAN_START_TIME,
      PLAN_PERIOD: row.PLAN_PERIOD,
      SCENARIO_ID: row.SCENARIO_ID,
      SOURCE_ID: row.SOURCE_ID,
    };

    let keyObj: any = {};
    this.dataKey.forEach((key: string) => {
      keyObj[key] = row[key];
    });
    this.formKey = keyObj;

    this.$nextTick(() => {
      this.isShowEditPopup = true;
    });
  }

  public onRemoveRow(index: number) {
    let rowIndex = Number.isInteger(index) ? index : -1;
    const selectedRows = this.selectedRow;

    if (rowIndex < 0 && selectedRows && selectedRows.length > 0) {
      this.removeService(selectedRows);
    } else {
      this.removeService([this.dataGrid.rows[rowIndex].dataItem]);
    }
  }

  public async removeService(target: any) {
    let keys = target.map((item: any) => {
      let keyObj: any = {};
      this.dataKey.forEach((key: string) => {
        keyObj[key] = item[key];
      });
      return keyObj;
    });

    const result = await showConfirm({
      message: `${this.$t(`RemoveMessage`, [`${keys.map((key: any) => key.PLAN_ID)}`])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> ${
      //   keys.length > 1 ? "these records" : "this record"
      // }?`,
    });
    if (result) {
      this.isLoadedData = false;

      await this.deleteFunc(keys);
      await this.onRefreshData();
    }
  }

  public onEndTimeChanged(e: any) {
    this.fromDate = dayjs(e.value).startOf("day");
    this.onRefreshData();
  }

  public setDateWeekBefore() {
    this.fromDate = dayjs().add(-1, "week").startOf("day");
  }
  public setDateMonthBefore() {
    this.fromDate = dayjs().add(-1, "month").startOf("day");
  }
  public setDate3MonthBefore() {
    this.fromDate = dayjs().add(-3, "month").startOf("day");
  }
}
</script>
<style lang="scss" scoped>
.status {
  padding: 3px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-radius: 100px;
  height: 16px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.create {
    background-color: #fcf5d0;
    color: #ac991b;

    .dot {
      background-color: #ac991b;
    }
  }
  &.run {
    background-color: #e1e9ff;
    color: #707cf2;

    .dot {
      background-color: #707cf2;
      animation: on-working-effect 1s step-end infinite;
    }
  }
  &.done {
    background-color: #dffaef;
    color: #357e63;

    .dot {
      background-color: #357e63;
    }
  }
  &.error {
    background-color: #fae5df;
    color: #dc5a5a;

    .dot {
      background-color: #dc5a5a;
    }
  }
}

@keyframes on-working-effect {
  50% {
    background-color: #e1e9ff;
  }
  100% {
    background-color: var(--color-font1);
  }
}
</style>
