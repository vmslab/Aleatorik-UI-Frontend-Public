<template>
  <DxPopup
    class="moz-popup"
    :visible="visible"
    :show-title="true"
    title="ItemSiteBuffer Detail Information"
    :width="width"
    :height="height"
    @hiding="onHiding"
  >
    <div
      class="dx-card moz-isb-detail"
      :style="`width: ${width}px; height: ${getParentsHeight(height) - getToolbarSize()}px;`"
    >
      <div class="dx-card-text" style="height: 100%; max-height: 100%">
        <table class="moz-table-isb-detail">
          <tr>
            <td>Item ID</td>
            <td>{{ itemId }}</td>
          </tr>
          <tr>
            <td>Site ID</td>
            <td>{{ siteId }}</td>
          </tr>
          <tr>
            <td>Buffer ID</td>
            <td>{{ bufferId }}</td>
          </tr>
          <tr>
            <td>Item Type</td>
            <td>{{ itemType }}</td>
          </tr>
        </table>
        <div style="height: var(--size-card-top-padding)"></div>
        <div class="flex-center-horizontal">
          <div class="moz-bom-popup-title">
            <div class="moz-bom-popup-title-bar"></div>
            <div class="moz-bom-popup-title-text">Pegging Info</div>
          </div>
          <div style="width: var(--size-card-rbl-padding)"></div>
          <div class="moz-bom-popup-title">
            <div class="moz-bom-popup-title-bar"></div>
            <div class="moz-bom-popup-title-text">Release</div>
          </div>
        </div>
        <div class="flex-center-horizontal">
          <table class="moz-table-isb-detail">
            <tr>
              <td>Wip Qty</td>
              <td>{{ wipQty }}</td>
            </tr>
            <tr>
              <td>So Peg Qty</td>
              <td>{{ soPegQty }}</td>
            </tr>
            <tr>
              <td>Unpeg Qty</td>
              <td>{{ unpegQty }}</td>
            </tr>
          </table>
          <div style="width: var(--size-card-rbl-padding)"></div>
          <table class="moz-table-isb-detail">
            <tr>
              <td>InTarget Qty</td>
              <td>{{ inTargetQty }}</td>
            </tr>
            <tr>
              <td>Release Qty</td>
              <td>{{ releaseQty }}</td>
            </tr>
            <tr>
              <td>Difference</td>
              <td :style="diffErr ? `color: var(--color-error)` : ``">{{ difference }}</td>
            </tr>
          </table>
        </div>
        <div style="height: var(--size-card-top-padding)"></div>
        <div class="moz-bom-popup-title">
          <div class="moz-bom-popup-title-bar"></div>
          <div class="moz-bom-popup-title-text">Production Plan</div>
        </div>
        <table class="moz-table-isb-detail">
          <tr>
            <td>Traget Date</td>
            <td>
              <span>{{ targetDate }}</span>
              <span>({{ extendedTargetDate }})</span>
            </td>
          </tr>
          <tr>
            <td>Plan Date</td>
            <td>
              <span>{{ planDateFrom }}</span>
              <span :style="planDateFromSpanErr ? `color: var(--color-error)` : ``">({{ planDateFromSpan }}d)</span>
              <span v-if="planCount > 1">~</span>
              <span v-if="planCount > 1">{{ planDateTo }}</span>
              <span v-if="planCount > 1" :style="planDateToSpanErr ? `color: var(--color-error)` : ``"
                >({{ planDateToSpan }}d)</span
              >
            </td>
          </tr>
          <tr>
            <td>Target Qty</td>
            <td>
              <span>{{ targetQty }}</span>
              <span>(Units : {{ targetUnitQty }})</span>
            </td>
          </tr>
          <tr>
            <td>Plan Qty</td>
            <td>
              <span>{{ planQty }}</span>
              <span>(Units : {{ planUnitQty }})</span>
              <span><i class="mozart-icons m-145_icon-tail-arrow-right"></i></span>
              <span>Difference</span>
              <span>:</span>
              <span :style="ptDiffErr ? `color: var(--color-error)` : ``">{{ ptDiff }}</span>
              <span :style="ptUnitDiffErr ? `color: var(--color-error)` : ``">(Units : {{ ptUnitDiff }})</span>
            </td>
          </tr>
        </table>
        <div style="height: var(--size-card-top-padding)"></div>
        <div class="moz-bom-popup-title">
          <div class="moz-bom-popup-title-bar"></div>
          <div class="moz-bom-popup-title-text">Property</div>
        </div>
        <div class="dx-card moz-tabs-card" style="height: 170px">
          <DxTabs
            class="moz-card-tabs-colored"
            :data-source="tabItems"
            :selected-index="tabIndex"
            @selectionChanged="onTabSelectionChanged"
          />
          <WjFlexGrid
            style="width: 100%; height: calc(170px - var(--size-card-title-height))"
            :itemsSource="dataSource"
            :initialized="onInitialized"
            selectionMode="None"
            allowSorting="MultiColumn"
            keyActionTab="Cycle"
            :allowDelete="true"
            :autoGenerateColumns="false"
            :deferResizing="true"
            :quickAutoSize="true"
            :imeEnabled="true"
            :alternatingRowStep="0"
            :isReadOnly="true"
            :allowPinning="false"
            class="moz-edit-datagrid white-header"
          >
            <WjFlexGridColumn binding="PROPERTY_ID" header="PROPERTY ID" width="1*" />
            <WjFlexGridColumn binding="VALUE" header="VALUE" width="1*" />
            <WjFlexGridColumn binding="CALENDAR_ID" header="CALENDAR ID" width="1*" />
          </WjFlexGrid>
        </div>
      </div>
    </div>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{
        text: $t('Close'),
        stylingMode: 'outlined',
        class: 'moz-button',
        onClick: onHiding,
      }"
    />
  </DxPopup>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import dayjs from "dayjs";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";

import { DxTabs } from "devextreme-vue/tabs";

import { EventBus } from "mozart-common";
import { getParentsHeight, getContentsWidth, getContentsHeight, getToolbarSize } from "@/utils/commonUtils";
import { GetTableOption } from "@/api/mainService";
import { getSummaryQty, getGroupQuery } from "@/utils/query";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

interface IRoutingResource {
  PROPERTY_ID: string;
  VALUE: string;
  CALENDAR_ID: string;
}

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxTabs,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class BOMMapISBPopup extends Vue {
  @Prop({ type: Boolean }) public visible?: boolean;
  @Prop({ type: [Number, String] }) public width?: number | string;
  @Prop({ type: [Number, String] }) public height?: number | string;

  @Prop({ type: String, required: true }) public planVersion!: string;
  @Prop({ type: String, required: true }) public soId!: string;
  @Prop({ type: String, required: true }) public itemId!: string;
  @Prop({ type: String, required: true }) public siteId!: string;
  @Prop({ type: String, required: true }) public bufferId!: string;

  public itemType: string = "";

  public wipQty: string = "";
  public soPegQty: string = "";
  public unpegQty: string = "";

  public inTargetQty: string = "";
  public releaseQty: string = "";
  public difference: string = "";
  public diffErr: boolean = false;

  public targetDate: string = "";
  public extendedTargetDate: string = "";
  public planCount: number = 0;
  public planDateFrom: string = "";
  public planDateTo: string = "";
  public planDateFromSpan: string = "";
  public planDateFromSpanErr: boolean = false;
  public planDateToSpan: string = "";
  public planDateToSpanErr: boolean = false;
  public planQty: string = "";
  public planUnitQty: string = "";
  public targetQty: string = "";
  public targetUnitQty: string = "";
  public ptDiff: string = "";
  public ptDiffErr: boolean = false;
  public ptUnitDiff: string = "";
  public ptUnitDiffErr: boolean = false;

  public numberIntl = new Intl.NumberFormat("ko-KR", { useGrouping: true });
  public fountainIntl = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
  public dateFormat = "YYYY-MM-DD HH:mm:ss";

  public tabItems: string[] = [];
  public tabIndex: number = 0;

  public dataSource: IRoutingResource[] = [];
  public itemDataSource: IRoutingResource[] = [];
  public siteDataSource: IRoutingResource[] = [];
  public bufferDataSource: IRoutingResource[] = [];
  public isbDataSource: IRoutingResource[] = [];

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  public itemIdSplitor = "∥";

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        onInitialized: grid => {
          grid?.contextMenu?.addMenuItem({
            header: "Modify",
            cmd: "modify",
            active: () => true,
            clicked: (arg: any) => {
              const { grid, cv, col, hitTest } = arg;
              const data = grid.rows[hitTest.row].dataItem;

              let params = {
                v: this.planVersion,
                t: "",
                k: "",
                d: "",
              };
              switch (this.tabIndex) {
                case 0:
                  params.t = "ITEM_PROPERTY_VALUE";
                  params.k = "ITEM_ID,PROPERTY_ID";
                  params.d = `${this.itemId}${this.itemIdSplitor}${data.PROPERTY_ID}`;
                  break;
                case 1:
                  params.t = "SITE_PROPERTY_VALUE";
                  params.k = "SITE_ID,PROPERTY_ID";
                  params.d = `${this.siteId}${this.itemIdSplitor}${data.PROPERTY_ID}`;
                  break;
                case 2:
                  params.t = "BUFFER_PROPERTY_VALUE";
                  params.k = "BUFFER_ID,PROPERTY_ID";
                  params.d = `${this.bufferId}${this.itemIdSplitor}${data.PROPERTY_ID}`;
                  break;
                case 3:
                  params.t = "ITEM_SITE_BUFFER_PROPERTY_VALUE";
                  params.k = "ITEM_ID,SITE_ID,BUFFER_ID,PROPERTY_ID";
                  params.d = `${this.itemId}${this.itemIdSplitor}${this.siteId}${this.itemIdSplitor}${this.bufferId}${this.itemIdSplitor}${data.PROPERTY_ID}`;
                  break;
              }

              this.onHiding();
              EventBus.fire("push-route-by-key", {
                params: {
                  key: "revision-edit-table",
                  params,
                },
              });
            },
          });
        },
        useAutoColumnFit: false,
        useSelector: false,
        useFilter: false,
        useFooter: false,
      },
    });
  }

  public mounted() {
    this.setMain();
    this.setPeggingInfo();
    this.setRelease();
    this.setProductionPlan();
    this.setRoutingResource();
  }

  public getParentsHeight(height: number) {
    return getParentsHeight(height);
  }
  public getContentsWidth(width: number) {
    return getContentsWidth(width);
  }
  public getContentsHeight(height: number) {
    return getContentsHeight(height);
  }
  public getToolbarSize() {
    return getToolbarSize();
  }
  public onHiding() {
    this.$emit("close", { visible: false });
  }

  public async setMain() {
    const result = await GetTableOption("ODV_ITEM_MASTER", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["ITEM_ID", "=", this.itemId]],
      select: ["ITEM_TYPE"],
    });
    if (result && result.data) {
      const datas = JSON.parse(result.data);
      if (datas.length > 0) {
        const data = datas[0];
        this.itemType = data.ITEM_TYPE;
      }
    }
  }

  public async setPeggingInfo() {
    const wipQty = await getSummaryQty(
      "ODV_WIP",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
      ],
      "LOT_QTY",
    );
    this.wipQty = this.numberIntl.format(wipQty);
    const soPegQty = await getSummaryQty(
      "OUT_PEG_INFO",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["SO_ID", "=", this.soId],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
      ],
      "PEG_QTY",
    );
    this.soPegQty = this.numberIntl.format(soPegQty);
    const unpegQty = await getSummaryQty(
      "OUT_UNPEG_INFO",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
      ],
      "UNPEG_QTY",
    );
    this.unpegQty = this.numberIntl.format(unpegQty);
  }

  public async setRelease() {
    const inTargetQty = await getSummaryQty(
      "OUT_INTARGET_PLAN",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["SO_ID", "=", this.soId],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
      ],
      "TARGET_QTY",
    );
    const releaseQty = await getSummaryQty(
      "OUT_LOT_HISTORY",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["SO_ID", "=", this.soId],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
        "and",
        ["EVENT", "=", "Release"],
        "and",
        ["CREATION_TYPE", "=", "Normal"],
      ],
      "LOT_QTY",
    );
    this.inTargetQty = this.numberIntl.format(inTargetQty);
    this.releaseQty = this.numberIntl.format(releaseQty);
    this.difference = this.numberIntl.format(releaseQty - inTargetQty);
    this.diffErr = releaseQty < inTargetQty;
  }

  public async setProductionPlan() {
    const productPlan = await getGroupQuery(
      "OUT_PRODUCTION_PLAN",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["SO_ID", "=", this.soId],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
        "and",
        ["OPERATION_ID", "=", ""],
      ],
      [
        {
          selector: "TARGET_DATETIME",
          summaryType: "min",
        },
        {
          selector: "EXTENDED_TARGET_DATE",
          summaryType: "min",
        },
        {
          selector: "END_TIME",
          summaryType: "min",
        },
        {
          selector: "END_TIME",
          summaryType: "max",
        },
        {
          selector: "OUT_PLAN_QTY",
          summaryType: "sum",
        },
        {
          selector: "OUT_PLAN_UNIT_QTY",
          summaryType: "sum",
        },
        {
          selector: "END_TIME",
          summaryType: "count",
        },
      ],
    );
    const targetPlan = await getGroupQuery(
      "OUT_TARGET_PLAN",
      [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["SO_ID", "=", this.soId],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
        "and",
        ["IN_OUT", "=", "Out"],
      ],
      [
        {
          selector: "TARGET_QTY",
          summaryType: "sum",
        },
        {
          selector: "TARGET_UNIT_QTY",
          summaryType: "sum",
        },
      ],
    );

    if (productPlan) {
      const targetDate = dayjs(productPlan.min_TARGET_DATETIME);
      const extendedTargetDate = dayjs(productPlan.min_EXTENDED_TARGET_DATE);
      const endDateMin = dayjs(productPlan.min_END_TIME);
      const endDateMax = dayjs(productPlan.max_END_TIME);
      this.targetDate = targetDate.isValid() ? targetDate.format(this.dateFormat) : "-";
      this.extendedTargetDate = extendedTargetDate.isValid() ? extendedTargetDate.format(this.dateFormat) : "-";
      this.planCount = productPlan.count_END_TIME;
      this.planDateFrom = endDateMin.isValid() ? endDateMin.format(this.dateFormat) : "-";
      this.planDateFromSpanErr = targetDate.isValid() && endDateMin.isValid() ? targetDate.isBefore(endDateMin) : false;
      const fromDiff = targetDate.diff(endDateMin, "d", true);
      this.planDateFromSpan =
        targetDate.isValid() && endDateMin.isValid()
          ? this.fountainIntl.format(this.planDateFromSpanErr ? -fromDiff : fromDiff)
          : "-";
      this.planDateTo = endDateMax.isValid() ? endDateMax.format(this.dateFormat) : "-";
      this.planDateToSpanErr = targetDate.isValid() && endDateMin.isValid() ? targetDate.isBefore(endDateMin) : false;
      const toDiff = targetDate.diff(endDateMax, "d", true);
      this.planDateToSpan =
        targetDate.isValid() && endDateMax.isValid()
          ? this.fountainIntl.format(this.planDateToSpanErr ? -toDiff : toDiff)
          : "-";
      this.planQty = Number.isFinite(productPlan.sum_OUT_PLAN_QTY)
        ? this.numberIntl.format(productPlan.sum_OUT_PLAN_QTY)
        : "-";
      this.planUnitQty = Number.isFinite(productPlan.sum_OUT_PLAN_UNIT_QTY)
        ? this.numberIntl.format(productPlan.sum_OUT_PLAN_UNIT_QTY)
        : "-";
    }
    if (targetPlan) {
      this.targetQty = Number.isFinite(targetPlan.sum_TARGET_QTY)
        ? this.numberIntl.format(targetPlan.sum_TARGET_QTY)
        : "-";
      this.targetUnitQty = Number.isFinite(targetPlan.sum_TARGET_UNIT_QTY)
        ? this.numberIntl.format(targetPlan.sum_TARGET_UNIT_QTY)
        : "-";
    }
    if (productPlan && targetPlan) {
      if (Number.isFinite(productPlan.sum_OUT_PLAN_QTY) && Number.isFinite(targetPlan.sum_TARGET_QTY)) {
        const planQty = productPlan.sum_OUT_PLAN_QTY || 0;
        const targetQty = targetPlan.sum_TARGET_QTY || 0;

        this.ptDiff = this.numberIntl.format(planQty - targetQty);
        this.ptDiffErr = planQty < targetQty;
      } else {
        this.ptDiff = "-";
        this.ptDiffErr = false;
      }
      if (Number.isFinite(productPlan.sum_OUT_PLAN_UNIT_QTY) && Number.isFinite(targetPlan.sum_TARGET_UNIT_QTY)) {
        const planQty = productPlan.sum_OUT_PLAN_UNIT_QTY || 0;
        const targetQty = targetPlan.sum_TARGET_UNIT_QTY || 0;

        this.ptUnitDiff = this.numberIntl.format(planQty - targetQty);
        this.ptUnitDiffErr = planQty < targetQty;
      } else {
        this.ptUnitDiff = "-";
        this.ptUnitDiffErr = false;
      }
    }
  }

  public async setRoutingResource() {
    const atPropertyResult = await GetTableOption("AT_PROPERTY_MASTER", {
      filter: ["CATEGORY", "IN", "Item,Site,Buffer,ItemSiteBuffer"],
      select: ["PROPERTY_ID", "DEFAULT_VALUE as VALUE", "CATEGORY"],
    });
    const odvPropertyResult = await GetTableOption("ODV_PROPERTY_MASTER", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["CATEGORY", "IN", "Item,Site,Buffer,ItemSiteBuffer"]],
      select: ["PROPERTY_ID", "DEFAULT_VALUE as VALUE", "CATEGORY"],
    });
    const itemPropertyResult = await GetTableOption("ODV_ITEM_PROPERTY_VALUE", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["ITEM_ID", "=", this.itemId]],
      select: ["PROPERTY_ID", "VALUE", "CALENDAR_ID"],
    });
    const sitePropertyResult = await GetTableOption("ODV_SITE_PROPERTY_VALUE", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["SITE_ID", "=", this.siteId]],
      select: ["PROPERTY_ID", "VALUE", "CALENDAR_ID"],
    });
    const bufferPropertyResult = await GetTableOption("ODV_BUFFER_PROPERTY_VALUE", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["BUFFER_ID", "=", this.bufferId]],
      select: ["PROPERTY_ID", "VALUE", "CALENDAR_ID"],
    });
    const isbPropertyResult = await GetTableOption("ODV_ITEM_SITE_BUFFER_PROPERTY_VALUE", {
      filter: [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["ITEM_ID", "=", this.itemId],
        "and",
        ["SITE_ID", "=", this.siteId],
        "and",
        ["BUFFER_ID", "=", this.bufferId],
      ],
      select: ["PROPERTY_ID", "VALUE", "CALENDAR_ID"],
    });

    if (!atPropertyResult || !atPropertyResult.data) return;
    if (!odvPropertyResult || !odvPropertyResult.data) return;
    if (!itemPropertyResult || !itemPropertyResult.data) return;
    if (!sitePropertyResult || !sitePropertyResult.data) return;
    if (!bufferPropertyResult || !bufferPropertyResult.data) return;
    if (!isbPropertyResult || !isbPropertyResult.data) return;

    const atPropertyDatas = JSON.parse(atPropertyResult.data);
    const odvPropertyDatas = JSON.parse(odvPropertyResult.data);
    const itemPropertyDatas = JSON.parse(itemPropertyResult.data);
    const sitePropertyDatas = JSON.parse(sitePropertyResult.data);
    const bufferPropertyDatas = JSON.parse(bufferPropertyResult.data);
    const isbPropertyDatas = JSON.parse(isbPropertyResult.data);

    this.setRoutingResourceDetail(atPropertyDatas, odvPropertyDatas, itemPropertyDatas, this.itemDataSource, "Item");
    this.setRoutingResourceDetail(atPropertyDatas, odvPropertyDatas, sitePropertyDatas, this.siteDataSource, "Site");
    this.setRoutingResourceDetail(
      atPropertyDatas,
      odvPropertyDatas,
      bufferPropertyDatas,
      this.bufferDataSource,
      "Buffer",
    );
    this.setRoutingResourceDetail(
      atPropertyDatas,
      odvPropertyDatas,
      isbPropertyDatas,
      this.isbDataSource,
      "ItemSiteBuffer",
    );
    this.tabItems = [
      `Item (${this.itemDataSource.length})`,
      `Site (${this.siteDataSource.length})`,
      `Buffer (${this.bufferDataSource.length})`,
      `ItemSiteBuffer (${this.isbDataSource.length})`,
    ];
    this.dataSource = this.itemDataSource;
  }

  public setRoutingResourceDetail(
    atPropertyDatas: any[],
    odvPropertyDatas: any[],
    valueDatas: any[],
    dataSource: IRoutingResource[],
    category: string,
  ) {
    atPropertyDatas
      .filter((d: any) => d.CATEGORY === category)
      .forEach((d: any) => {
        this.setRoutingResourceAddData(dataSource, {
          PROPERTY_ID: d.PROPERTY_ID,
          VALUE: d.VALUE || "-",
          CALENDAR_ID: "-",
        });
      });
    odvPropertyDatas
      .filter((d: any) => d.CATEGORY === category)
      .forEach((d: any) => {
        this.setRoutingResourceAddData(dataSource, {
          PROPERTY_ID: d.PROPERTY_ID,
          VALUE: d.VALUE || "-",
          CALENDAR_ID: "-",
        });
      });
    valueDatas.forEach((d: any) => {
      this.setRoutingResourceAddData(dataSource, {
        PROPERTY_ID: d.PROPERTY_ID,
        VALUE: d.VALUE || "-",
        CALENDAR_ID: d.CALENDAR_ID || "-",
      });
    });
  }

  public setRoutingResourceAddData(dataSource: IRoutingResource[], item: IRoutingResource) {
    const fitem = dataSource.find(d => d.PROPERTY_ID === item.PROPERTY_ID);
    if (fitem) {
      if (item.VALUE && item.VALUE !== "-") {
        fitem.VALUE = item.VALUE;
      }
      fitem.CALENDAR_ID = item.CALENDAR_ID;
    } else {
      dataSource.push(item);
    }
  }

  public onTabSelectionChanged(evt: any) {
    if (evt.addedItems.length <= 0) return;
    const key = evt.addedItems[0];
    this.tabIndex = this.tabItems.indexOf(key);
    switch (this.tabIndex) {
      case 0:
        this.dataSource = this.itemDataSource;
        break;
      case 1:
        this.dataSource = this.siteDataSource;
        break;
      case 2:
        this.dataSource = this.bufferDataSource;
        break;
      case 3:
        this.dataSource = this.isbDataSource;
        break;
    }
  }

  // public onContextMenuPreparing(evt: any) {
  //   if (evt.target === "content") {
  //     if (!evt.items) evt.items = [];

  //     let params = {
  //       v: this.planVersion,
  //       t: "",
  //       k: "",
  //       d: "",
  //     };
  //     switch (this.tabIndex) {
  //       case 0:
  //         params.t = "ITEM_PROPERTY_VALUE";
  //         params.k = "ITEM_ID,PROPERTY_ID";
  //         params.d = `${this.itemId}@${evt.row.data.PROPERTY_ID}`;
  //         break;
  //       case 1:
  //         params.t = "SITE_PROPERTY_VALUE";
  //         params.k = "SITE_ID,PROPERTY_ID";
  //         params.d = `${this.siteId}@${evt.row.data.PROPERTY_ID}`;
  //         break;
  //       case 2:
  //         params.t = "BUFFER_PROPERTY_VALUE";
  //         params.k = "BUFFER_ID,PROPERTY_ID";
  //         params.d = `${this.bufferId}@${evt.row.data.PROPERTY_ID}`;
  //         break;
  //       case 3:
  //         params.t = "ITEM_SITE_BUFFER_PROPERTY_VALUE";
  //         params.k = "ITEM_ID,SITE_ID,BUFFER_ID,PROPERTY_ID";
  //         params.d = `${this.itemId}@${this.siteId}@${this.bufferId}@${evt.row.data.PROPERTY_ID}`;
  //         break;
  //     }

  //     evt.items.push({
  //       text: "Modify",
  //       onItemClick: () => {
  //         this.onHiding();
  //         EventBus.fire("push-route-by-key", {
  //           params: {
  //             key: "revision-edit-table",
  //             params,
  //           },
  //         });
  //       },
  //     });
  //   }
  // }
}
</script>
