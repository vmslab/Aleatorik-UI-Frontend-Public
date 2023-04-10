<template>
  <div style="height: 100%">
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height-outer-controller-tab)"
      :minWidth="400"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 3, minWidth: 600 },
      ]"
      resizable
      horizontal
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
        <div class="dx-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Error Summary</div>
          </div>
          <DxList
            ref="errorListBox"
            class="moz-list"
            :width="parentsWidth"
            :height="contentsHeight"
            :data-source="errorList"
            :allow-item-deleting="false"
            :focus-state-enabled="false"
            :active-state-enabled="false"
            :show-selection-controls="true"
            :repaint-changes-only="true"
            page-load-mode="scrollBottom"
            key-expr="TARGET"
            selection-mode="none"
            :selected-item-keys="selectedErrorKeys"
            @item-click="onErrorClick"
          >
            <template #item="{ data: item }">
              <div>
                <div class="text-area">
                  <div class="moz-body-02">{{ item.TARGET }}</div>
                  <div class="moz-body-02 moz-color-font5">
                    {{ `Count (${item.DATA.length}), ${item.CATEGORY}, ${item.SEVERITY}` }}
                  </div>
                </div>
              </div>
            </template>
          </DxList>
        </div>
      </template>
      <template slot="box2" slot-scope="{ parentsWidth, parentsHeight, contentsHeight }">
        <div class="dx-card moz-tabs-card" :style="`width:${parentsWidth}px;height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Detailed Information</div>
          </div>
          <WjFlexGrid
            :style="{
              width: `${parentsWidth}px`,
              height: `${contentsHeight}px`,
            }"
            class="moz-datagrid moz-report-grid"
            :itemsSource="errorData"
            :initialized="onInitialized"
            showSelectedHeaders="All"
            selectionMode="None"
            keyActionTab="Cycle"
            :allowDelete="false"
            :autoGenerateColumns="false"
            :deferResizing="false"
            :quickAutoSize="true"
            :imeEnabled="true"
            :alternatingRowStep="0"
            :isReadOnly="true"
            :allowPinning="false"
            headersVisibility="Column"
          >
            <WjFlexGridColumn binding="TARGET_DATA" header="TARGET DATA" width="*" />
            <WjFlexGridColumn binding="REFERRED_KEY" header="REFERRED KEY" width="*" />
            <WjFlexGridColumn binding="REASON_CODE" header="REASON CODE" width="*">
              <WjFlexGridCellTemplate cellType="Cell" v-slot="cell">
                <span always v-tooltip="{ text: getReasonDetail(cell.item.REASON_CODE) }">{{
                  cell.item.REASON_CODE
                }}</span>
              </WjFlexGridCellTemplate>
            </WjFlexGridColumn>
            <WjFlexGridColumn binding="REASON_DETAIL" header="REASON DETAIL" width="*" />
          </WjFlexGrid>
        </div>
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from "vue-property-decorator";
import { Get } from "@/api/mainService";
import { loadTableDatas } from "@/utils/dataUtils";
import { ExtendGrid, SplitBox } from "mozart-component-wijmo";
import groupBy from "lodash/groupBy";

import { EventBus } from "mozart-common";

import DxButton from "devextreme-vue/button";
import { DxList, DxItemDragging, DxMenuItem } from "devextreme-vue/list";

import { WjFlexGrid, WjFlexGridCellTemplate, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: {
    DxButton,
    DxList,
    SplitBox,
    WjFlexGrid,
    WjFlexGridColumn,
    WjFlexGridCellTemplate,
  },
})
export default class ErrorReport extends Vue {
  @Prop({ type: String }) public selectedPlanID?: string;

  public tableName = "OUT_ERROR_LOG";

  public errorList: any[] = [];
  public selectedErrorKeys: any[] = [];

  public errorData: any[] = [];

  public errorSeqSet: string[] = ["Critical", "Warning", "Info"];
  public reasonDescription: any = {};

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;
  public dataSource: any = [];

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        onInitialized: extendGrid => {
          extendGrid.contextMenu?.addMenuItem({
            header: "Modify",
            cmd: "MOV_MOD",
            active: ({ hitTest }) => {
              return hitTest?.getRow().dataItem?.TARGET_KEY?.split("@")?.length > 1;
            },
            clicked: ({ hitTest }) => {
              const item = hitTest?.getRow().dataItem;

              const targetKey = item.TARGET_KEY?.split("@");

              const table = targetKey[0];
              const keys = targetKey[1];
              const values = encodeURIComponent(item.TARGET_DATA);

              let params = {};
              if (table === "SALES_ORDER") {
                params = {
                  key: "rev-sales-order-edit-view",
                  params: `?v=${this.selectedPlanID}&k=${keys}&d=${values}`,
                };
              } else {
                params = {
                  key: "revision-edit-table",
                  params: `?v=${this.selectedPlanID}&t=${table}&k=${keys}&d=${values}`,
                };
              }

              EventBus.fire("open-popup", {
                params: params,
              });
            },
          });
        },
        useFilter: false,
        useFooter: false,
        useSelector: false,
        useAutoColumnFit: false,
        setContextMenuProps: {
          useAutoSizeColumn: false,
          useExportExcel: false,
          useFixedColumn: false,
          useGroupColumn: false,
          useLayout: { mode: "none" },
          useSortColumn: false,
        },
      },
    });
  }

  public async mounted() {
    const logMaster = await loadTableDatas("AT_ERROR_LOG_MASTER");
    this.reasonDescription = groupBy(logMaster, "ERROR_REASON");
    this.onVersionChanged();
  }

  @Watch("selectedPlanID")
  public async onVersionChanged() {
    if (!this.selectedPlanID) return;

    const errorLogTable = await Get(
      "ErrorSummary",
      {
        options: {
          filter: [["PLAN_VERSION", "=", this.selectedPlanID]],
        },
      },
      "post",
    );

    if (!errorLogTable || !errorLogTable.data) return;

    this.setErrorList(JSON.parse(errorLogTable.data));
  }

  public onErrorClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    this.selectedErrorKeys = [item.TARGET];
    this.errorData = item.DATA;
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    const data = e.row?.data;
    if (!data) return;

    const targetKey = data.TARGET_KEY?.split("@");
    if (targetKey.length < 2) return;

    const table = targetKey[0];
    const keys = targetKey[1];
    const values = encodeURIComponent(data.TARGET_DATA);

    let params = {};
    if (table === "SALES_ORDER") {
      params = {
        key: "rev-sales-order-edit-view",
        params: `?v=${this.selectedPlanID}&k=${keys}&d=${values}`,
      };
    } else {
      params = {
        key: "revision-edit-table",
        params: `?v=${this.selectedPlanID}&t=${table}&k=${keys}&d=${values}`,
      };
    }

    e.items.push({
      text: "Modify",
      onItemClick: () => {
        EventBus.fire("open-popup", {
          params: params,
        });
      },
    });
  }

  public setErrorList(errorLog: any) {
    this.errorData = [];
    this.errorList = [];
    const stateToNum = (state: string) => {
      switch (state) {
        case "Critical":
          return 3;
        case "Warning":
          return 2;
        case "Info":
          return 1;
        default:
          return 0;
      }
    };
    Object.keys(errorLog).forEach(key => {
      const summaryInfo = key.split("@");
      const TARGET = summaryInfo[0];
      const CATEGORY = summaryInfo[1];
      const SEVERITY = summaryInfo[2];

      this.errorList.push({ TARGET, CATEGORY, SEVERITY, DATA: errorLog[key] });
    });

    const errState = this.errorList.reduce((result: number, err: any) => {
      const state = stateToNum(err.SEVERITY);
      if (result < state) return state;
      return result;
    }, 0);

    this.$emit("set-state", errState);

    this.errorList.sort((x: any, y: any) => {
      let sort = this.errorSeqSet.indexOf(x.SEVERITY) - this.errorSeqSet.indexOf(y.SEVERITY);
      if (sort === 0) {
        sort = y.DATA.length - x.DATA.length;
      }

      return sort;
    });

    this.$nextTick(() => {
      if (!this.errorList) return;

      this.selectedErrorKeys = [this.errorList[0]?.TARGET];
      this.errorData = this.errorList[0]?.DATA;
    });
  }

  public getReasonDetail(errorReason: string) {
    if (errorReason in this.reasonDescription) return this.reasonDescription[errorReason][0]?.DESCRIPTION;

    return errorReason;
  }
}
</script>
