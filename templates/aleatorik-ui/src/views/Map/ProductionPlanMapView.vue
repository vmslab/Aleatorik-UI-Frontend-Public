<!--<template>
  <div>
    <div class="moz-frame">
      <moz-controller :showFilter="filter">
        <DxButton
          v-tooltip="{ text: $t('Search') }"
          class="moz-default-button"
          icon="search"
          type="default"
          :focusStateEnabled="false"
          :text="$t('Search')"
          @click="onRefreshData"
        />
        <i
          v-if="filter"
          slot="title"
          v-tooltip="{ text: $t('HideFilter') }"
          @click="filter = !filter"
          class="mozart-icons moz-filter-icon-tap controller-title-button"
        />
        <i
          v-else
          slot="title"
          v-tooltip="{ text: $t('ShowFilter') }"
          @click="filter = !filter"
          class="mozart-icons moz-filter-icon controller-title-button"
        />
        <div slot="filter">
          <label>PLAN_VERSION</label>
          <DropDownBox
            :width="677"
            :height="281"
            :pageSize="7"
            dataKey="PLAN_ID"
            :items="planVersionItems"
            :dataFields="versionFields"
            :selectedValue="selectedPlanID"
            @value-changed="onVersionChanged"
          />
        </div>
        <div slot="filter">
          <label>SALES ORDER</label>
          <DropDownBox
            :key="selectedPlanID"
            :width="350"
            :height="300"
            dataKey="SO_ID"
            :dataSource="soDataSource"
            :dataFields="soFields"
            :selectedValue="selectedSoIDs"
            @value-changed="onSoValueChanged"
          />
        </div>
        <div slot="filter">
          <label>LAYOUT</label>
          <DxSelectBox
            :width="comboBoxWidth"
            :items="[
              'klay',
              'dagre',
              'cise',
              'cola',
              'grid',
              'circle',
              'concentric',
              'breadthfirst',
            ]"
            value="dagre"
            @value-changed="onLayoutChanged"
          />
        </div>
        <div slot="filter">
          <label>TOOLTIP</label>
          <DxSelectBox
            :width="comboBoxWidth"
            :items="['none', 'id', 'name', 'externalKey', 'literalString']"
            value="none"
            @value-changed="onTooltipChanged"
          />
        </div>
      </moz-controller>
      <moz-graph
        :elements="elements"
        :styleObj="styleObj"
        :layout="layout"
        :tooltip="tooltip"
      ></moz-graph>
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
import { ElementsDefinition } from "mozart-common";
import { ActionLoadOptions } from "mozart-component-wijmo";
import { Get, GetTableRemote } from "@/api/mainService";
import { setVersionNo, getVersionNo, getVersionDatas } from "@/utils/commonUtils";
import DropDownBox from "@/components/DropDownBox.vue";
import { DxButton } from "devextreme-vue/button";
import { DxSelectBox } from "devextreme-vue/select-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";

@Component({
  components: { DxButton, DxSelectBox, DxLoadPanel, DropDownBox },
})
export default class ProductionPlanMapView extends Vue {
  public filter: boolean = true;
  public comboBoxWidth: number = 150;
  public loadingVisible: boolean = false;

  public planVersionItems: any[] = [];
  public versionFields: any[] = [
    { name: "PLAN_ID", caption: "PLAN_VERSION", width: 160 },
    { name: "SCENARIO_ID", width: 120 },
    { name: "EXECUTION_TYPE", width: 70 },
    { name: "SOURCE_ID", width: 160 },
    { name: "DESCRIPTION", width: 100 },
    { name: "ENGINE_END", dataType: "Date", width: 130 },
  ];
  public selectedPlanID: string = "";

  public soDataSource: any = null;
  public soFields: any[] = [
    { name: "SO_ID" },
    { name: "ITEM_ID" },
    { name: "DUE_DATE", type: "datetime" },
    { name: "QTY", type: "number" },
  ];
  public selectedSoIDs: string = "";

  public selectedLayout: string = "dagre";

  public elements: ElementsDefinition | null = null;
  public layout: any = {
    name: "dagre",
    rankDir: "LR",
    align: "DL",
  };
  public tooltip: Function | string | null = null;

  public async created() {
    this.planVersionItems = await getVersionDatas(["DONE"]);
    const planVersion = getVersionNo();

    const urlParams = new URLSearchParams(window.location.search);
    const soID = urlParams.get("s");
    if (soID) this.selectedSoIDs = soID;

    this.selectedPlanID =
      planVersion && this.planVersionItems.some((item: any) => item.PLAN_ID === planVersion)
        ? planVersion
        : this.planVersionItems[0].PLAN_ID;
    this.setVersionControls(this.selectedPlanID);

    // this.onRefreshData();
  }

  public async SOLoadFunc(obj: ActionLoadOptions) {
    if (!this.selectedPlanID) return [];
    const where = {
      PLAN_VERSION: this.selectedPlanID,
    };
    const result = await GetTableRemote("ODV_SALES_ORDER", obj, where);
    const data = JSON.parse(result.data);
    return data;
  }

  public async onRefreshData() {
    try {
      this.loadingVisible = true;

      const result = await Get(
        "ProductionPlanMapItems",
        {
          planOptions: {
            filter: [
              ["PLAN_VERSION", "=", this.selectedPlanID],
              "and",
              ["SO_ID", "=", this.selectedSoIDs],
            ],
          },
          bomOptions: {
            filter: ["PLAN_VERSION", "=", this.selectedPlanID],
          },
        },
        "post",
      );
      const datas = JSON.parse(result.data);

      this.elements = datas;
    } finally {
      this.loadingVisible = false;
    }
  }

  public onTooltipChanged(e: any) {
    if (!e.value) return;

    switch (e.value) {
      case "none":
        this.tooltip = null;
        break;
      case "id":
        this.tooltip = (data: any) => data.id;
        break;
      case "name":
        this.tooltip = (data: any) => {
          return data.name;
        };
        break;
      case "externalKey":
        this.tooltip = (data: any) => {
          return data.externalKey;
        };
        break;
      case "literalString":
        this.tooltip = "tooltip test string";
        break;
    }

    this.$nextTick(() => {
      (this.$refs.graph as any)?.updateTooltip();
    });
  }

  public async onVersionChanged(e: any) {
    if (!e.value) return;
    this.setVersionControls(e.value);
  }

  public onSoValueChanged(e: any) {
    this.selectedSoIDs = e.SO_ID;
    // this.onRefreshData();
  }

  public onLayoutChanged(e: any) {
    if (!e.value) return;

    switch (e.value) {
      case "klay":
        this.layout = {
          name: "klay",
        };
        break;
      case "dagre":
        this.layout = {
          name: "dagre",
          rankDir: "LR",
          align: "DL",
        };
        break;
      case "cise":
        this.layout = {
          name: "cise",
        };
        break;
      case "cola":
        this.layout = {
          name: "cola",
        };
        break;
      case "grid":
        this.layout = {
          name: "grid",
        };
        break;
      case "circle":
        this.layout = {
          name: "circle",
        };
        break;
      case "concentric":
        this.layout = {
          name: "concentric",
        };
        break;
      case "breadthfirst":
        this.layout = {
          name: "breadthfirst",
        };
        break;
    }
  }

  public async setVersionControls(version: string) {
    this.selectedPlanID = version;
    setVersionNo(this.selectedPlanID);

    this.soDataSource = this.SOLoadFunc;
  }

  public onNodeMouseOver(e: any) {
    const node = e.cyTarget;
    node.qtip(
      {
        content: "hello",
        show: {
          event: e.type,
          ready: true,
        },
        hide: {
          event: "mouseout unfocus",
        },
      },
      e,
    );
  }

  public styleObj: any[] = [
    {
      selector: "edge",
      style: {
        textBackgroundOpacity: 1,
        textBackgroundColor: "white",
        textBackgroundShape: "rectangle",
        content(ele: any) {
          return ele.data("name");
        },
        curveStyle: "straight",
        targetArrowShape: "triangle",
        edgeTextRotation: "autorotate",
        lineColor: "#000",
        lineStyle: "solid",
        targetArrowColor: "data(color)",
        width: 1,
        fontSize: 10,
        controlPointStepSize: 70,
      },
    },
    {
      selector: "node",
      style: {
        content(ele: any) {
          return ele.data("externalKey");
        },
        backgroundColor: "data(color)",
        borderWidth: 0.5,
        borderStyle: "solid",
        borderColor: "#000000",
        width: 120,
        height: 40,
        textValign: "center",
        textHalign: "center",
        // textWrap: "ellipsis",
        textMaxWidth: 40,
        fontSize: 12,
        color: "#ffffff",
        shape: "data(type)",
      },
    },
    {
      selector: "node.highlight",
      style: {
        borderWidth: 1,
        borderColor: "#000000",
      },
    },
    {
      selector: "edge.hover",
      style: {
        width: 1,
        fontSize: 8,
        color: "#000000",
      },
    },
    {
      selector: ":parent",
      style: {
        textValign: "top",
        textHalign: "center",
        color: "#000000",
        fontSize: 15,
        fontWeight: 700,
      },
    },
  ];

  constructor() {
    super();
  }
}
</script>
-->
