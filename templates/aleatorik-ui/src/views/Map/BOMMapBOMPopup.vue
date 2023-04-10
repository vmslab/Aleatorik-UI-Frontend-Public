<template>
  <DxPopup
    class="moz-popup"
    :visible="visible"
    :show-title="true"
    title="BOM Detail Information"
    :width="width"
    :height="height"
    @hiding="onHiding"
  >
    <div
      class="dx-card moz-isb-detail"
      :style="`width: ${width}px; height: ${getParentsHeight(height) - getToolbarSize()}px;`"
    >
      <div class="dx-card-text" style="height: 100%; max-height: 100%">
        <div class="moz-bom-popup-title">
          <div class="moz-bom-popup-title-bar"></div>
          <div class="moz-bom-popup-title-text">BOM info</div>
        </div>
        <table class="moz-table-bommap-detail">
          <tr>
            <td>BOM ID</td>
            <td>
              <span>{{ bomId }}</span
              ><span>({{ priority }})</span>
            </td>
          </tr>
          <tr>
            <td>BOM Type</td>
            <td>{{ bomType }}</td>
          </tr>
        </table>
        <div style="height: var(--size-card-top-padding)"></div>

        <div class="moz-bom-popup-title">
          <div class="moz-bom-popup-title-bar"></div>
          <div class="moz-bom-popup-title-text">Routing info</div>
        </div>
        <table class="moz-table-bommap-detail">
          <tr>
            <td>Routing ID</td>
            <td>{{ routingId }}</td>
          </tr>
          <tr>
            <td>Total TAT</td>
            <td>{{ totalTat }}</td>
          </tr>
        </table>
        <div style="width: var(--size-card-top-padding)"></div>
        <div class="flex-center-horizontal">
          <div class="moz-bom-popup-title" style="width: 220px">
            <div class="moz-bom-popup-title-bar"></div>
            <div class="moz-bom-popup-title-text">Routing Operation</div>
          </div>
          <div style="width: var(--size-padding3)"></div>
          <div class="moz-bom-popup-title" style="width: 377px">
            <div class="moz-bom-popup-title-bar"></div>
            <div class="moz-bom-popup-title-text">Routing Resource</div>
          </div>
        </div>
        <div class="flex-center-horizontal">
          <div class="dx-card" style="width: 220px; height: 220px">
            <DxList
              class="moz-list bom-map-view-popup"
              :data-source="dataSource"
              :allow-item-deleting="false"
              :focus-state-enabled="false"
              :active-state-enabled="false"
              :show-selection-controls="true"
              :repaint-changes-only="true"
              page-load-mode="scrollBottom"
              key-expr="key"
              selection-mode="none"
              :selected-item-keys="selectedKeys"
              @item-click="onOperationClick"
            >
              <template #item="{ data: item }">
                <div>
                  <div class="text-area">
                    <div class="moz-body-02">{{ item.name }}</div>
                    <div class="moz-body-02 moz-color-font5">{{ item.data }}</div>
                  </div>
                </div>
              </template>
            </DxList>
          </div>
          <div style="width: var(--size-padding3)"></div>
          <div class="dx-card moz-tabs-card" style="height: 220px; width: 377px">
            <DxTabs
              class="moz-card-tabs-colored"
              :data-source="tabItems"
              :selected-index="tabIndex"
              @selectionChanged="onTabSelectionChanged"
            />
            <WjFlexGrid
              style="width: 100%; height: calc(220px - var(--size-card-title-height))"
              :itemsSource="tabDataResource"
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
              <WjFlexGridColumn binding="RESOURCE_ID" header="RESOURCE ID" />
              <WjFlexGridColumn v-if="tabIndex !== 2" binding="FLOW_TIME" header="FLOW TIME" dataType="Number" />
              <WjFlexGridColumn v-if="tabIndex !== 2" binding="USAGE_PER" header="USAGE PER" dataType="Number" />
              <WjFlexGridColumn v-if="tabIndex !== 2" binding="TIME_UOM" header="UOM" />
              <WjFlexGridColumn v-if="tabIndex !== 2" binding="PRIORITY" header="PRIORITY" dataType="Number" />
              <WjFlexGridColumn v-if="tabIndex !== 2" binding="ADD_RESOURCE_ID" header="ADD RESOURCE ID" />
              <WjFlexGridColumn
                v-if="tabIndex === 2"
                binding="RESOURCE_GROUP_ID"
                header="RESOURCE GROUP ID"
                dataType="Number"
              />
              <WjFlexGridColumn v-if="tabIndex === 2" binding="CATEGORY" header="CATEGORY" />
              <WjFlexGridColumn v-if="tabIndex === 2" binding="RESOURCE_TYPE" header="RESOURCE TYPE" />
              <WjFlexGridColumn v-if="tabIndex === 2" binding="CAPACITY_TYPE" header="CAPACITY TYPE" />
            </WjFlexGrid>
          </div>
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
import { SplitBox } from "mozart-component-wijmo";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxTabs } from "devextreme-vue/tabs";

import { getParentsHeight, getContentsWidth, getContentsHeight, getToolbarSize } from "@/utils/commonUtils";

import { DxList } from "devextreme-vue/list";
import { GetTableOption } from "@/api/mainService";
import { getSummaryQty } from "@/utils/query";

import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

@Component({
  components: {
    DxPopup,
    DxToolbarItem,
    DxList,
    DxTabs,
    SplitBox,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class BOMMapBOMPopup extends Vue {
  @Prop({ type: Boolean }) public visible?: boolean;
  @Prop({ type: [Number, String] }) public width?: number | string;
  @Prop({ type: [Number, String] }) public height?: number | string;
  @Prop({ type: String, required: true }) public planVersion!: string;
  @Prop({ type: String, required: true }) public soId!: string;
  @Prop({ type: String, required: true }) public bomId!: string;

  public tabItems: string[] = ["Op Resource", "Op Add Resource", "Resource"];
  public tabIndex: number = 0;

  public priority: string = "";
  public bomType: string = "";

  public routingId: string = "";
  public totalTat: string = "";
  public dataSource: any = [];

  public selectedKeys: any[] = [];
  public tabDataResource: any[] = [];
  public opDataSource: any[] = [];
  public opAddDataSource: any[] = [];
  public resource: any[] = [];

  public numberIntl = new Intl.NumberFormat("ko-KR", { useGrouping: true });
  public fountainIntl = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });

  public dataGrid: any = null;
  public extendGrid: ExtendGrid | null = null;

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useAutoColumnFit: true,
        useSelector: false,
        useFilter: false,
        useFooter: false,
      },
    });
  }

  public async mounted() {
    await this.setBomMaster();
    await this.setRountingID();
    await this.setRountingOperation();
    await this.setTotalTat();
  }

  public async setBomMaster() {
    const masterResult = await GetTableOption("ODV_BOM_MASTER", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["BOM_ID", "=", this.bomId]],
      select: ["BOM_TYPE", "PRIORITY"],
    });
    if (masterResult && masterResult.data) {
      const datas = JSON.parse(masterResult.data);
      if (datas.length > 0) {
        const data = datas[0];
        this.priority = `Priorty : ${data.PRIORITY}`;
        this.bomType = data.BOM_TYPE;
      }
    }
  }

  public async setRountingID() {
    const rountingResult = await GetTableOption("ODV_BOM_ROUTING", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["BOM_ID", "=", this.bomId]],
      select: ["ROUTING_ID"],
    });

    if (rountingResult && rountingResult.data) {
      const datas = JSON.parse(rountingResult.data);
      if (datas.length > 0) {
        const data = datas[0];
        this.routingId = data.ROUTING_ID;
      }
    }
  }

  public async setTotalTat() {
    const waitTatSum = await getSummaryQty(
      "ODV_ROUTING_OPERATION",
      [["PLAN_VERSION", "=", this.planVersion], "and", ["ROUTING_ID", "=", this.routingId]],
      "WAIT_TAT",
    );

    const runTatSum = await getSummaryQty(
      "ODV_ROUTING_OPERATION",
      [["PLAN_VERSION", "=", this.planVersion], "and", ["ROUTING_ID", "=", this.routingId]],
      "RUN_TAT",
    );

    const sum = waitTatSum + runTatSum;
    this.totalTat = `${Math.floor(sum / 86400)} days (${Math.floor(sum / 3600)} hours)`;
  }

  public async setRountingOperation() {
    const result = await GetTableOption("ODV_ROUTING_OPERATION", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["ROUTING_ID", "=", this.routingId]],
      select: ["OPERATION_ID", "OPERATION_TYPE", "SEQUENCE", "WAIT_TAT", "RUN_TAT", "YIELD"],
    });

    if (result && result.data) {
      const datas = JSON.parse(result.data);
      this.dataSource = datas.map((data: any) => {
        return {
          key: data.OPERATION_ID,
          name: `${data.OPERATION_ID}(${data.OPERATION_TYPE})`,
          data: `SEQ(${data.SEQUENCE}), TAT(${this.numberIntl.format(data.WAIT_TAT)}s, ${this.numberIntl.format(
            data.RUN_TAT,
          )}s), YIELD(${this.fountainIntl.format(data.YIELD)})`,
        };
      });
    }

    this.dataSource.sort((data1: any, data2: any) =>
      data1.SEQUENCE < data2.SEQUENCE ? 1 : data1.SEQUENCE > data2.SEQUENCE ? -1 : 0,
    );

    this.$nextTick(async () => {
      if (this.dataSource.length > 0) {
        this.selectedKeys = [this.dataSource[0].key];

        await this.setSeletedTabDataSource();
      }
    });
  }

  public async setSeletedTabDataSource() {
    if (!this.selectedKeys[0]) return;

    const OPERATION_ID = this.selectedKeys[0];

    const opResourceResult = await GetTableOption("ODV_OPERATION_RESOURCE", {
      filter: [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["ROUTING_ID", "=", this.routingId],
        "and",
        ["OPERATION_ID", "=", OPERATION_ID],
      ],
      select: ["RESOURCE_ID", "FLOW_TIME", "USAGE_PER", "TIME_UOM", "PRIORITY"],
    });

    const opAddResourceResult = await GetTableOption("ODV_OPERATION_ADDITIONAL_RESOURCE", {
      filter: [
        ["PLAN_VERSION", "=", this.planVersion],
        "and",
        ["ROUTING_ID", "=", this.routingId],
        "and",
        ["OPERATION_ID", "=", OPERATION_ID],
      ],
      select: ["RESOURCE_ID", "ADD_RESOURCE_ID", "USAGE_PER"],
    });

    if (!opResourceResult || !opResourceResult.data) return;

    this.opDataSource = [...JSON.parse(opResourceResult.data)];
    const res = this.opDataSource.map(o => o.RESOURCE_ID).join(",");

    const resourceResult = await GetTableOption("ODV_RESOURCE_MASTER", {
      filter: [["PLAN_VERSION", "=", this.planVersion], "and", ["RESOURCE_ID", "in", res]],
      select: ["RESOURCE_ID", "RESOURCE_GROUP_ID", "CATEGORY", "RESOURCE_TYPE", "CAPACITY_TYPE"],
    });

    if (!opAddResourceResult || !opAddResourceResult.data) return;
    if (!resourceResult || !resourceResult.data) return;

    this.opAddDataSource = [...JSON.parse(opAddResourceResult.data)];
    this.resource = [...JSON.parse(resourceResult.data)];

    this.setTabDataResource();
  }

  public async onOperationClick(e: any) {
    const item = e.itemData;
    if (!item) return;

    this.selectedKeys = [item.key];

    await this.setSeletedTabDataSource();
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

  public onTabSelectionChanged(evt: any) {
    if (evt.addedItems.length <= 0) return;
    const key = evt.addedItems[0];
    this.tabIndex = this.tabItems.indexOf(key);
    this.setTabDataResource();
  }

  public setTabDataResource() {
    switch (this.tabIndex) {
      case 0:
        this.tabDataResource = [...this.opDataSource];
        break;
      case 1:
        this.tabDataResource = [...this.opAddDataSource];
        break;
      case 2:
        this.tabDataResource = [...this.resource];
        break;
    }
  }
}
</script>
