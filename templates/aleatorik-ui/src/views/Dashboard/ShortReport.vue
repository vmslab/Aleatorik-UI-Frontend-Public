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
            <div class="dx-card-title-text">Short Summary</div>
          </div>
          <DxList
            ref="errorListBox"
            class="moz-list"
            :width="parentsWidth"
            :height="contentsHeight"
            :data-source="shortList"
            :allow-item-deleting="false"
            :focus-state-enabled="false"
            :active-state-enabled="false"
            :show-selection-controls="true"
            :repaint-changes-only="true"
            page-load-mode="scrollBottom"
            key-expr="REASON"
            selection-mode="none"
            :selected-item-keys="selectedShortKeys"
            @item-click="onShortClick"
          >
            <template #item="{ data: item }">
              <div
                v-tooltip="{
                  text: getReasonDetail(item.REASON),
                }"
              >
                <div class="text-area">
                  <div class="moz-body-02">{{ item.REASON }}</div>
                  <div class="moz-body-02 moz-color-font5">
                    {{ `Count (${item.DATA.length}), ${item.CATEGORY}` }}
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
            :itemsSource="shortData"
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
            <WjFlexGridColumn binding="TARGET_ID" header="TARGET_ID" />
            <WjFlexGridColumn binding="TARGET_ITEM_ID" header="TARGET_ITEM_ID" />

            <WjFlexGridColumn binding="DUE_DATE" header="DUE_DATE" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />

            <WjFlexGridColumn binding="SO_QTY" header="SO_QTY" dataType="Number" />
            <WjFlexGridColumn binding="RTF_QTY" header="RTF_QTY" />
            <WjFlexGridColumn binding="SHORT_QTY" header="SHORT_QTY" />
            <WjFlexGridColumn binding="SHORT_DETAIL_INFO" header="SHORT_DETAIL_INFO" />
            <WjFlexGridColumn binding="ITEM_SITE_BUFFER" header="ITEM_SITE_BUFFER" />
            <WjFlexGridColumn binding="BOM_ID" header="BOM_ID" />
            <WjFlexGridColumn binding="ROUTING_ID" header="ROUTING_ID" />
            <WjFlexGridColumn binding="OPERATION_ID" header="OPERATION_ID" />
            <WjFlexGridColumn binding="RESOURCE" header="RESOURCE" />
            <WjFlexGridColumn binding="FROM_DATE" header="FROM_DATE" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />
            <WjFlexGridColumn binding="TO_DATE" header="TO_DATE" format="yyyy-MM-dd HH:mm:ss" dataType="Date" />

            <WjFlexGridColumn binding="COUNT" header="COUNT" />
            <WjFlexGridColumn binding="TARGET_TYPE" header="TARGET_TYPE" />
            <WjFlexGridColumn binding="STAGE_ID" header="STAGE_ID" />
            <WjFlexGridColumn binding="MODULE_KEY" header="MODULE_KEY" />
            <WjFlexGridColumn binding="PHASE" header="PHASE" dataType="Number" />
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
  },
})
export default class ShortReport extends Vue {
  @Prop({ type: String }) public selectedPlanID?: string;

  public tableName = "OUT_SHORT_LOG";

  public shortList: any[] = [];
  public selectedShortKeys: any[] = [];

  public shortData: any[] = [];

  public reasonDescription: any = [];

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
            active: () => {
              return this.selectedShortKeys[0] === "HAWAMaterialShort";
            },
            clicked: ({ hitTest }) => {
              const table = "ITEM_SITE_BUFFER_PROPERTY_VALUE";
              const keys = "ITEM_ID,SITE_ID,BUFFER_ID";
              const values = encodeURIComponent(hitTest?.getRow().dataItem.ITEM_SITE_BUFFER);

              EventBus.fire("open-popup", {
                params: {
                  key: "revision-edit-table",
                  params: `?v=${this.selectedPlanID}&t=${table}&k=${keys}&d=${values}`,
                },
              });
            },
          });
          extendGrid.contextMenu?.addMenuItem({
            header: "Show BOM Map View",
            cmd: "OPN_BOM",
            active: ({ hitTest }) => {
              return hitTest?.getRow().dataItem.TARGET_ID;
            },
            clicked: ({ hitTest }) => {
              const bomMapID = encodeURIComponent(hitTest?.getRow().dataItem.TARGET_ID);
              EventBus.fire("open-popup", {
                params: {
                  key: "bom-map-view",
                  params: `?s=${bomMapID}`,
                },
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
    const logMaster = await loadTableDatas("AT_SHORT_LOG_MASTER", { SHORT_TYPE: "SHORT" });

    for await (const item of logMaster) {
      const shortKey = item.SHORT_REASON;
      if (shortKey in this.reasonDescription) continue;

      this.reasonDescription[shortKey] = item.DESCRIPTION;
    }
    this.onVersionChanged();
  }

  public getReasonDetail(shortReason: string) {
    const shortKey = shortReason;
    if (shortKey in this.reasonDescription) return this.reasonDescription[shortKey];

    return shortReason;
  }

  @Watch("selectedPlanID")
  public async onVersionChanged() {
    if (!this.selectedPlanID) return;

    const shortLogTable = await Get(
      "ShortSummary",
      {
        options: {
          filter: [["PLAN_VERSION", "=", this.selectedPlanID], "and", ["SHORT_TYPE", "=", "Short"]],
        },
      },
      "post",
    );

    const shortLog = JSON.parse(shortLogTable.data);

    this.setShortList(shortLog);
  }

  public onShortClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    this.selectedShortKeys = [item.REASON];
    this.shortData = item.DATA;
  }

  // public onContextMenuPreparing(e: any) {
  //   if (!e.items) e.items = [];

  //   const data = e.row?.data;
  //   if (!data) return;

  //   if (this.selectedShortKeys[0] === "HAWAMaterialShort") {
  //     const table = "ITEM_SITE_BUFFER_PROPERTY_VALUE";
  //     const keys = "ITEM_ID,SITE_ID,BUFFER_ID";
  //     const values = encodeURIComponent(data.ITEM_SITE_BUFFER);
  //     e.items.push({
  //       text: "Modify",
  //       onItemClick: () => {
  //         EventBus.fire("open-popup", {
  //           params: {
  //             key: "revision-edit-table",
  //             params: `?v=${this.selectedPlanID}&t=${table}&k=${keys}&d=${values}`,
  //           },
  //         });
  //       },
  //     });
  //   }

  //   const bomMapID = encodeURIComponent(data.TARGET_ID);
  //   e.items.push({
  //     text: " Show BOM Map View",
  //     icon: "new-tab",
  //     onItemClick: () => {
  //       EventBus.fire("open-popup", {
  //         params: {
  //           key: "bom-map-view",
  //           params: `?s=${bomMapID}`,
  //         },
  //       });
  //     },
  //   });
  // }

  public setShortList(shortLog: any) {
    this.shortData = [];
    this.shortList = [];
    Object.keys(shortLog).forEach(key => {
      const summaryInfo = key.split("@");
      const REASON = summaryInfo[0];
      const CATEGORY = summaryInfo[1];

      this.shortList.push({ REASON, CATEGORY, DATA: shortLog[key] });
    });

    this.shortList.sort((a: any, b: any) => {
      if (a.DATA.length < b.DATA.length) return 1;
      else if (a.DATA.length > b.DATA.length) return -1;
      else return 0;
    });

    this.$nextTick(() => {
      this.selectedShortKeys = [this.shortList[0].REASON];
      this.shortData = this.shortList[0].DATA;
    });
  }
}
</script>
