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

      <DxButton id="mode-btn" v-tooltip="{ text: $t('View Mode') }" icon="menu" type="default" v-show="false" />
      <!-- <DxDropDownButton
          v-tooltip="{ text: $t('View Mode') }"
          :items=""
          :drop-down-options="{ width: 230 }"
          icon="menu"
          type="default"
          @item-click="onModeChanged"
        /> -->
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :focusStateEnabled="false"
        :text="$t('Search')"
        @click="onRefreshData"
      />
      <div slot="filter" v-show="viewMode !== 'Std'">
        <label>PLAN_VERSION</label>
        <DropDownGrid
          :width="750"
          :height="286"
          dataKey="PLAN_ID"
          :items="planVersionItems"
          :dataFields="versionFields"
          :selectedValue="selectedPlanID"
          @value-changed="onVersionChanged"
          :comboBoxWidth="220"
        />
      </div>
      <div slot="filter" v-show="viewMode !== 'SO'">
        <label>SO_ITEM_ID</label>
        <DxSelectBox
          v-model="selectedSOItemID"
          value-expr="key"
          display-expr="key"
          search-expr="ITEM_ID"
          :search-enabled="true"
          :data-source="SOItemDataSource"
          @value-changed="onSOItemIDChanged"
        />
      </div>
      <div slot="filter" v-show="viewMode !== 'SO'">
        <label>SO_SITE_ID</label>
        <DxSelectBox
          v-model="selectedSOSiteID"
          value-expr="key"
          display-expr="key"
          search-expr="SITE_ID"
          :search-enabled="true"
          :data-source="SOSiteDataSource"
        />
      </div>
      <div slot="filter" v-show="viewMode === 'SO'">
        <label>SO_ID</label>
        <DropDownGrid
          :key="selectedPlanID"
          :width="630"
          :height="320"
          dataKey="SO_ID"
          :items="SODataSource"
          :dataFields="soFields"
          :selectedValue="selectedSOID"
          @value-changed="onSOIDChanged"
        />
      </div>
      <!-- <div slot="filter">
          <label>LAYOUT DIRECTION</label>
          <DxButtonGroup
            :items="[
              { icon: '', text: '↑', direction: 'BT' },
              { icon: '', text: '→', direction: 'LR' },
            ]"
            :selected-item-keys="direction"
            key-expr="direction"
            styling-mode="outlined"
            @item-click="onDirectionChanged"
          />
        </div>
        <div slot="filter">
          <label>LAYOUT ALIGN</label>
          <DxButtonGroup
            :items="[
              { icon: '', text: '↖', align: 'UL' },
              { icon: '', text: '↗', align: 'UR' },
              { icon: '', text: '↙', align: 'DL' },
              { icon: '', text: '↘', align: 'DR' },
            ]"
            :selected-item-keys="align"
            key-expr="align"
            styling-mode="outlined"
            @item-click="onAlignChanged"
          />
        </div> -->
    </moz-controller>
    <div ref="graphContainer" class="moz-frame-for-outer-control">
      <moz-graph
        ref="graph"
        :elements="elements"
        :layout="layout"
        :tooltip="tooltip"
        :eventHandlerList="eventHandlerList"
        :container="container"
        :navigator="{ container: '.moz-graph-navigator-top' }"
        :customToolbarBtns="[
          {
            name: 'legend',
            click: onShowLegendToggle,
          },
        ]"
        class="bom-map-view"
      >
        <div
          v-if="elements && viewMode === 'SO'"
          class="dx-card moz-graph-slot"
          :style="`width: 276px; height: ${collapse ? '37px' : 'auto'}; position: absolute; top: 0px; left: 0px;`"
        >
          <div class="dx-card-title">
            <div class="dx-card-title-text">Sales Order Information</div>
            <div class="spacer"></div>
            <div class="dx-card-title-action">
              <DxButton
                v-tooltip="{ text: $t(collapse ? 'Expand' : 'Collapse') }"
                :icon="collapse ? 'add' : 'minus'"
                stylingMode="text"
                @click="collapse = !collapse"
              ></DxButton>
            </div>
          </div>
          <div class="dx-card-text" style="overflow: hidden; border-bottom: 1px solid var(--color-border1)">
            <table class="moz-table-sales-order">
              <tr>
                <td>Due Date</td>
                <td>{{ soDueDate }}</td>
              </tr>
              <tr>
                <td>Qty</td>
                <td>{{ soQty }}</td>
              </tr>
              <tr>
                <td>Priority</td>
                <td>{{ soPriority }}</td>
              </tr>
              <tr>
                <td>Earliness & Lateness Days</td>
                <td>{{ soELDays }}</td>
              </tr>
            </table>
          </div>
          <div class="dx-card-text" style="overflow: hidden">
            <table class="moz-table-sales-order">
              <tr>
                <td>RTF</td>
                <td>{{ soRTF }}</td>
              </tr>
              <tr>
                <td>On-Time Delivery</td>
                <td>{{ soOnTimeDelivery }}</td>
              </tr>
              <tr>
                <td>Short</td>
                <td>{{ soShort }}</td>
              </tr>
            </table>
          </div>
        </div>
        <div
          v-if="elements"
          v-show="showLegend"
          class="moz-graph-slot flex-center-horizontal moz-graph-index"
          style="
            width: 573px;
            height: 34px;
            position: absolute;
            bottom: 0px;
            left: 0px;
            padding: 0px 6px;
            border: solid 1px var(--color-border3);
          "
        >
          <div
            style="
              width: 24px;
              height: 13px;
              background-color: var(--color-error);
              border: solid 1px #993d48;
              border-radius: 2px;
            "
          ></div>
          <div style="margin: 0px 6px">Short</div>
          <div
            style="width: 24px; height: 13px; background-color: #f8c359; border: solid 1px #e68600; border-radius: 2px"
          ></div>
          <div style="margin: 0px 6px">Warning</div>
          <div style="width: 1px; height: 6px; background-color: var(--color-border3); margin-right: 6px"></div>
          <div
            style="width: 24px; height: 13px; background-color: white; border: solid 1px #6f7580; border-radius: 2px"
          ></div>
          <div style="margin: 0px 6px">Dummy</div>
          <div
            style="width: 24px; height: 13px; background-color: #65d197; border: solid 1px #339a88; border-radius: 2px"
          ></div>
          <div style="margin: 0px 6px">Operation</div>
          <div style="width: 1px; height: 6px; background-color: var(--color-border3); margin-right: 6px"></div>
          <div style="width: 29px; height: 1px; background-color: #565f6e"></div>
          <div
            style="
              width: 0;
              height: 0;
              border-bottom: 5px solid transparent;
              border-top: 5px solid transparent;
              border-left: 10px solid #565f6e;
              border-right: 0px solid transparent;
            "
          ></div>
          <div style="margin: 0px 6px">Normal</div>
          <div style="width: 29px; height: 1px; background-color: #e68600"></div>
          <div
            style="
              width: 0;
              height: 0;
              border-bottom: 5px solid transparent;
              border-top: 5px solid transparent;
              border-left: 10px solid #e68600;
              border-right: 0px solid transparent;
            "
          ></div>
          <div style="margin: 0px 6px">Assembly</div>
          <div style="width: 29px; height: 1px; background-color: #00ba2b"></div>
          <div
            style="
              width: 0;
              height: 0;
              border-bottom: 5px solid transparent;
              border-top: 5px solid transparent;
              border-left: 10px solid #00ba2b;
              border-right: 0px solid transparent;
            "
          ></div>
          <div style="margin-left: 6px">Split</div>
        </div>
      </moz-graph>
      <BottomDrawer title="SHORT LOG" className="bom-detail-drawer" v-model="detail" :closeOnOutsideClick="true">
        <template slot-scope="{ contentsHeight }">
          <div>
            <BOMMapViewShortLog
              v-if="detail"
              :parentsHeight="contentsHeight"
              :selectedShortLog="selectedShortLog"
              :reasonDescription="reasonDescription"
              :key="selectedItem"
            />
          </div>
        </template>
      </BottomDrawer>
      <DxContextMenu
        :data-source="viewModeItems"
        :width="200"
        target="#mode-btn"
        @item-click="onModeChanged"
        show-event="dxclick"
      >
        <template #item="{ data: e }">
          <div>
            {{ e.text }}
          </div>
        </template>
      </DxContextMenu>
      <DxLoadPanel
        :visible="loadingVisible"
        :show-indicator="true"
        :show-pane="true"
        :shading="false"
        shading-color="rgba(0,0,0,0.4)"
      />
    </div>
    <BOMMapISBPopup
      v-if="showISBDetail"
      :visible="showISBDetail"
      :width="ISBDetailWidth"
      :height="ISBDetailHeight"
      :planVersion="selectedPlanID"
      :soId="selectedSOID"
      :itemId="selectedItemId"
      :siteId="selectedSiteId"
      :bufferId="selectedBufferId"
      @close="onCloseISBPopup"
    />
    <BOMMapBOMPopup
      v-if="showBOMDetail"
      :visible="showBOMDetail"
      :width="BOMDetailWidth"
      :height="BOMDetailHeight"
      :planVersion="selectedPlanID"
      :soId="selectedSOID"
      :bomId="selectedBomId"
      @close="onCloseBOMPopup"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { ElementsDefinition } from "mozart-common";
import { createStoreConfig, ActionLoadOptions } from "mozart-component-wijmo";
import CustomStore from "devextreme/data/custom_store";
import DataSource from "devextreme/data/data_source";
import groupBy from "lodash/groupBy";
import dayjs from "dayjs";

import { Get, GetTableRemote, GetTableOption } from "@/api/mainService";
import { setVersionNo, getVersionNo, getVersionDatas } from "@/utils/commonUtils";
import { loadTableDatas, loadDistinctRemoteDatas, createPagenateStore } from "@/utils/dataUtils";
import { DxButton } from "devextreme-vue/button";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxCheckBox } from "devextreme-vue/check-box";
import DxButtonGroup from "devextreme-vue/button-group";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import DxDrawer from "devextreme-vue/drawer";
import { DxContextMenu } from "devextreme-vue/context-menu";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";

import DropDownGrid from "@/components/DropDownGrid.vue";
import BottomDrawer from "@/components/BottomDrawer.vue";
import BOMMapViewShortLog from "@/views/Map/BOMMapViewShortLog.vue";
import BOMMapISBPopup from "@/views/Map/BOMMapISBPopup.vue";
import BOMMapBOMPopup from "@/views/Map/BOMMapBOMPopup.vue";

@Component({
  components: {
    DxButton,
    DxSelectBox,
    DxCheckBox,
    DxButtonGroup,
    DxLoadPanel,
    DxDrawer,
    DxContextMenu,
    DxPopup,
    DxToolbarItem,
    DropDownGrid,
    BottomDrawer,
    BOMMapViewShortLog,
    BOMMapISBPopup,
    BOMMapBOMPopup,
  },
})
export default class BomMapView extends Vue {
  public filter: boolean = true;
  public detail: boolean = false;

  public showISBDetail: boolean = false;
  public showBOMDetail: boolean = false;

  public comboBoxWidth: number = 150;
  public loadingVisible: boolean = false;

  public collapse: boolean = false;

  public viewModeItems = [
    { data: "SO", text: this.$t("SALES ORDER VIEW") },
    { data: "Plan", text: this.$t("ITEM VIEW (Plan)") },
    { data: "Std", text: this.$t("ITEM VIEW (Std)") },
  ];

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];
  public soFields: any[] = [
    { name: "SO_ID", width: 100 },
    { name: "ITEM_ID", width: 100 },
    { name: "SITE_ID", width: 100 },
    { name: "DUE_DATE", dataType: "Date", width: 130 },
    { name: "MAX_LATENESS_DAYS", dataType: "Number", width: 40 },
    { name: "PRIORITY", dataType: "Number", width: 40 },
    { name: "IS_RTF_TARGET", width: 40 },
    { name: "QTY", dataType: "Number", width: 70 },
  ];

  public selectedPlanID: string = "";
  public selectedSOSiteID: string = "";
  public selectedSOItemID: string = "";
  public selectedSOID: string = "";

  public selectedItem: string = "";
  public selectedShortLog: any = [];

  public viewMode = "SO";

  public SODataSource: any = null;

  public SOItemDataSource: any = [];
  public SOSiteDataSource: any = [];

  public itemIdSplitor = "∥";

  public elements: ElementsDefinition | null = null;
  // public direction = ["LR"];
  // public align = ["DL"];
  public layout: any = {
    name: "dagre",
    rankDir: "LR",
    align: "DL",
  };
  public tooltip: Function | string | null = (data: any) => {
    if (data.type === "ISB") {
      const datas = data.id.split("||");
      return `<p>ITEM_ID: ${datas[0]}</p><p>SITE_ID: ${datas[1]}</p>${datas[2] ? `<p>BUFFER_ID: ${datas[2]}</p>` : ""}`;
    } else if (data.type === "BOM") {
      return `<p>BOM_ID: ${data.id}</p>`;
    }
  };
  public container?: Element | null = null;
  public eventHandlerList?: Record<string, Function> = {
    click: this.onItemClick,
    dblclick: this.onItemDblClick,
  };
  // public drawer?: any;

  public ISBDetailWidth = 488;
  public ISBDetailHeight = 750;
  public BOMDetailWidth = 633;
  public BOMDetailHeight = 560;

  // public openDetail: boolean = false;
  public reasonDescription: any = {};

  public soDueDate: string = "";
  public soQty: string = "";
  public soPriority: string = "";
  public soELDays: string = "";

  public soRTF: string = "";
  public soOnTimeDelivery: string = "";
  public soShort: string = "";

  public selectedItemId: string = "";
  public selectedSiteId: string = "";
  public selectedBufferId: string = "";
  public selectedBomId: string = "";

  public showLegend: boolean = true;

  public async mounted() {
    this.container = this.$refs.graphContainer as Element;

    this.loadingVisible = true;
    this.planVersionItems = await getVersionDatas(["DONE"]);
    const planVersion = getVersionNo();

    this.selectedPlanID =
      planVersion && this.planVersionItems.some((item: any) => item.PLAN_ID === planVersion)
        ? planVersion
        : this.planVersionItems[0].PLAN_ID;

    const logMaster = await loadTableDatas("AT_SHORT_LOG_MASTER");
    this.reasonDescription = groupBy(
      logMaster,
      item => `${item.SHORT_TYPE.toLowerCase()}${this.itemIdSplitor}${item.SHORT_REASON}`,
    );

    // for await (const item of logMaster) {
    //   const shortKey = `${item.SHORT_TYPE.toLowerCase()}@${item.SHORT_REASON}`;
    //   if (shortKey in this.reasonDescription) continue;

    //   this.reasonDescription[shortKey] = item.DESCRIPTION;
    // }

    const urlParams = new URLSearchParams(window.location.search);
    const soID = urlParams.get("s");
    if (soID) {
      this.selectedSOID = soID;
      await this.onRefreshData();
    } else {
      this.refreshDataSource();
      await this.onRefreshData();
    }

    this.loadingVisible = false;
  }

  public async SOItemLoadFunc(obj: ActionLoadOptions) {
    if (!this.selectedPlanID) return [];

    if (this.viewMode === "Std") {
      return loadDistinctRemoteDatas("CFG_SALES_ORDER", obj, "ITEM_ID");
    } else {
      return loadDistinctRemoteDatas("ODV_SALES_ORDER", obj, "ITEM_ID", {
        PLAN_VERSION: this.selectedPlanID,
      });
    }
  }

  public async SOSiteLoadFunc(obj: any) {
    if (!this.selectedPlanID || !this.selectedSOItemID) return [];

    if (this.viewMode === "Std") {
      return loadDistinctRemoteDatas("CFG_SALES_ORDER", obj, "SITE_ID", {
        ITEM_ID: this.selectedSOItemID,
      });
    } else {
      return loadDistinctRemoteDatas("ODV_SALES_ORDER", obj, "SITE_ID", {
        PLAN_VERSION: this.selectedPlanID,
        ITEM_ID: this.selectedSOItemID,
      });
    }
  }

  public async SOLoadFunc() {
    if (!this.selectedPlanID) return [];
    const where = {
      PLAN_VERSION: this.selectedPlanID,
    };
    const result = await GetTableRemote("ODV_SALES_ORDER", {}, where);
    const data = JSON.parse(result.data);
    return data.data;
  }

  public async refreshDataSource() {
    this.SODataSource = await this.SOLoadFunc();
    this.SOItemDataSource = createPagenateStore("SO_ID", this.SOItemLoadFunc);
    this.SOSiteDataSource = createPagenateStore("SO_ID", this.SOSiteLoadFunc);
  }

  public onCustomItemCreating(e: any) {
    if (!e.text) return;
    if (!this.planVersionItems.map((item: any) => item.PLAN_ID).includes(e.text)) return;

    this.selectedPlanID = e.text;
  }

  public async onRefreshData() {
    if (
      !this.selectedPlanID ||
      (this.viewMode === "SO" && !this.selectedSOID) ||
      (this.viewMode !== "SO" && (!this.selectedSOSiteID || !this.selectedSOItemID))
    ) {
      this.elements = null;
      return;
    }

    this.loadingVisible = true;
    try {
      const result = await Get(
        "BomMapItems",
        {
          options: this.viewMode === "Std" ? {} : { filter: ["PLAN_VERSION", "=", this.selectedPlanID] },
          destination: JSON.stringify(
            this.viewMode === "SO"
              ? { SO_ID: this.selectedSOID }
              : { SITE_ID: this.selectedSOSiteID, ITEM_ID: this.selectedSOItemID },
          ),
          viewMode: this.viewMode,
        },
        "post",
      );
      const datas = JSON.parse(result.data);

      const fountainIntl = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
      const numberIntl = new Intl.NumberFormat("ko-KR", { useGrouping: true });

      if (this.viewMode === "SO") {
        const salesOrderResult = await GetTableRemote("ODV_SALES_ORDER", {
          filter: [["PLAN_VERSION", "=", this.selectedPlanID], "and", ["SO_ID", "=", this.selectedSOID]],
        });
        if (salesOrderResult && salesOrderResult.data) {
          const soDatas = JSON.parse(salesOrderResult.data);
          if (soDatas.data.length > 0) {
            const soData = soDatas.data[0];
            this.soDueDate = dayjs(soData.DUE_DATE).format("YYYY-MM-DD");
            this.soQty = numberIntl.format(soData.QTY);
            this.soPriority = `${soData.PRIORITY}`;
            this.soELDays = `${soData.MAX_EARLINESS_DAYS}, ${soData.MAX_LATENESS_DAYS}`;

            const stageOutRTFResult = await GetTableOption("OUT_STAGE_OUT_PLAN", {
              isSummaryQuery: true,
              filter: [
                ["PLAN_VERSION", "=", this.selectedPlanID],
                "and",
                ["SO_ID", "=", this.selectedSOID],
                "and",
                ["MODULE_KEY", "=", "Module02"],
              ],
              groupSummary: [
                {
                  selector: "PLAN_QTY",
                  summaryType: "sum",
                },
              ],
            });
            if (stageOutRTFResult && stageOutRTFResult.data) {
              const rtfDatas = JSON.parse(stageOutRTFResult.data);
              /**
               * 2023-03-09, 이진영 수정, 좌측 상단 rtf / on-time / late qty 반올림 처리, Module01-02 중복으로 조회하는 문제 수정
               */
              if (rtfDatas.length > 0) {
                const rtfData = rtfDatas[0];
                const rtfQty = rtfData.sum_PLAN_QTY || 0;
                const rtfRate = rtfQty === 0 ? 0 : (rtfQty / soData.QTY) * 100;
                this.soRTF = `${fountainIntl.format(rtfRate)}% (${numberIntl.format(Math.round(rtfQty))})`;

                const shortQty = soData.QTY - rtfQty;
                const shortRate = shortQty === 0 ? 0 : (shortQty / soData.QTY) * 100;
                this.soShort = `${fountainIntl.format(shortRate)}% (${numberIntl.format(Math.round(shortQty))})`;
              }
            }
            const stageOutOnTimeResult = await GetTableOption("OUT_STAGE_OUT_PLAN", {
              isSummaryQuery: true,
              filter: [
                ["PLAN_VERSION", "=", this.selectedPlanID],
                "and",
                ["SO_ID", "=", this.selectedSOID],
                "and",
                ["END_TIME", "column", "TARGET_DATETIME", "<="],
                ["MODULE_KEY", "=", "Module02"],
              ],
              groupSummary: [
                {
                  selector: "PLAN_QTY",
                  summaryType: "sum",
                },
              ],
            });
            if (stageOutOnTimeResult && stageOutOnTimeResult.data) {
              const onTimeDatas = JSON.parse(stageOutOnTimeResult.data);
              if (onTimeDatas.length > 0) {
                const onTimeData = onTimeDatas[0];
                const onTimeQty = onTimeData.sum_PLAN_QTY || 0;
                const onTimeRate = onTimeQty === 0 ? 0 : (onTimeQty / soData.QTY) * 100;
                this.soOnTimeDelivery = `${fountainIntl.format(onTimeRate)}% (${numberIntl.format(
                  Math.round(onTimeQty),
                )})`;
              }
            }
          }
        }
      }

      this.elements = datas;
    } finally {
      this.loadingVisible = false;
    }

    this.$nextTick(() => {
      const legendBtnEl = document.querySelector(".toolbar-btn-legend");
      if (legendBtnEl) {
        if (this.showLegend) legendBtnEl.classList.add("toolbar-btn-active");
        else legendBtnEl.classList.remove("toolbar-btn-active");
      }

      this.$nextTick(() => {
        const graphSlotEl = document.querySelector(".moz-graph-slot");
        graphSlotEl?.removeEventListener("mousedown", this.cancelBubble);
        graphSlotEl?.addEventListener("mousedown", this.cancelBubble);
      });
    });
  }

  public cancelBubble = (e: any) => {
    e.cancelBubble = true;
  };

  public async onModeChanged(e: any) {
    const data = e.itemData.data;
    if (!data) return;
    if (this.viewMode === data) return;

    this.viewMode = data;
    this.selectedSOID = "";
    this.selectedSOItemID = "";
    this.selectedSOSiteID = "";

    this.refreshDataSource();
    // this.onRefreshData();
  }

  // public onDirectionChanged(e: any) {
  //   const direction = e.itemData.direction;
  //   if (!direction) return;
  //   if (this.direction[0] === direction) return;

  //   this.direction = [direction];
  //   this.layout.rankDir = direction;
  //   this.onRefreshData();
  // }

  // public onAlignChanged(e: any) {
  //   const align = e.itemData.align;
  //   if (!align) return;
  //   if (this.align[0] === align) return;

  //   this.layout.align = align;
  //   this.align = [align];
  //   this.onRefreshData();
  // }

  public async onVersionChanged(e: any) {
    if (!e.value) return;
    this.setVersionControls(e.value);
  }

  public onSOIDChanged(e: any) {
    if (!e.value) return;
    this.selectedSOID = e.value;

    this.selectedSOItemID = e.ITEM_ID;
    this.selectedSOSiteID = e.SITE_ID;
  }

  public onSOItemIDChanged(e: any) {
    this.SOSiteDataSource = new DataSource({
      store: new CustomStore(
        createStoreConfig({
          key: "SO_ID",
          loadFunc: this.SOSiteLoadFunc,
        }) as any,
      ),
      paginate: true,
    });
  }

  public async setVersionControls(version: string) {
    this.selectedPlanID = version;
    setVersionNo(this.selectedPlanID);
    this.loadingVisible = true;

    this.refreshDataSource();

    this.loadingVisible = false;
    // this.onRefreshData();
  }

  public async onItemDblClick(e: any) {
    const item = e.target;
    if (item && item.group && item.group() == "nodes") {
      const id = item.data("id");
      const ids = id.split(this.itemIdSplitor);
      if (item.data("type") === "ISB") {
        this.selectedItemId = ids[0];
        this.selectedSiteId = ids[1];
        this.selectedBufferId = ids[2];
        this.showISBDetail = true;
      } else if (item.data("type") === "BOM") {
        this.selectedBomId = id;
        this.showBOMDetail = true;
      }
    }
  }

  public async onItemClick(e: any) {
    const item = e.target;

    if (item && item.group && item.group() == "nodes" && item.data("type") !== "BUFFER") {
      this.selectedItem = item.id();
      const shortLogs = item.data("shortLogList");
      if (shortLogs && shortLogs.length > 0) {
        this.selectedShortLog = item.data("shortLogList");
        this.detail = true;
      }
    }
  }

  public onCloseISBPopup(e: any) {
    this.showISBDetail = e.visible;
  }

  public onCloseBOMPopup(e: any) {
    this.showBOMDetail = e.visible;
  }

  public onShowLegendToggle() {
    this.showLegend = !this.showLegend;
    const legendBtnEl = document.querySelector(".toolbar-btn-legend");
    if (legendBtnEl) {
      if (this.showLegend) legendBtnEl.classList.add("toolbar-btn-active");
      else legendBtnEl.classList.remove("toolbar-btn-active");
    }
  }

  constructor() {
    super();
  }
}
</script>
