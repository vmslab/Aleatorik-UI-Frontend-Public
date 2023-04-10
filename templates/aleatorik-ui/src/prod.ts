import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import vueCustomElement from "vue-custom-element";
import "document-register-element/build/document-register-element";
import { defineWebComponents } from "./web-components";

import {
  Calendar,
  ExcelUploadPopup,
  ExcelAdvancedUploadPopup,
  FilterControl,
  Chart,
  Axis,
  Series,
  Text,
  Gauge,
  Arc,
  Bar,
  Mark,
  Graph,
  FileManager,
  Gantt,
  SplitBox,
  Tooltip,
  GridTooltip,
  GridMerge,
  GridCellTooltip,
} from "mozart-component-wijmo";
import Controller from "@/components/Controller.vue";

import SimpleEditTableExtend from "@/wc/SimpleEditTableExtend.vue";
import SimpleEditTableWithVersion from "@/wc/SimpleEditTableWithVersion.vue";
import ResourceLoadReport from "@/wc/ResourceLoadReport.vue";
import PropertyConfigEdit from "@/wc/PropertyConfigEdit.vue";
import ResourceGantt from "@/wc/ResourceGantt.vue";
import ATPlanView from "@/wc/Plan/ATPlanView.vue";
import ATPlanCompareView from "@/wc/Plan/ATPlanCompareView.vue";
import RTFReport from "@/wc/AOR1000200S.vue";
import ResourceEditView from "@/wc/MasterPropertyEditView/ResourceEditView.vue";
import SalesOrderEditView from "@/wc/MasterPropertyEditView/SalesOrderEditView.vue";
import ItemEditView from "@/wc/MasterPropertyEditView/ItemEditView.vue";
import ItemSiteBufferEditView from "@/wc/MasterPropertyEditView/ItemSiteBufferEditView.vue";
import BufferEditView from "@/wc/MasterPropertyEditView/BufferEditView.vue";
import WipEditView from "@/wc/MasterPropertyEditView/WipEditView.vue";
import CustomerEditView from "@/wc/MasterPropertyEditView/CustomerEditView.vue";
import SiteEditView from "@/wc/MasterPropertyEditView/SiteEditView.vue";
import ScenarioConfiguratorView from "@/wc/ConfiguratorView/ScenarioConfiguratorView.vue";
import RuleSetConfiguratorView from "@/wc/ConfiguratorView/RuleSetConfiguratorView.vue";
// import ProductionGantt from "@/wc/Gantt/ProductionGantt.vue";
import BOMMapView from "@/wc/Map/BOMMapView.vue";
// import ProductionPlanMapView from "@/wc/Map/ProductionPlanMapView.vue";
import DataGridView from "@/wc/DataGridView.vue";
import PlanDashboard from "@/wc/Dashboard/PlanDashboard.vue";
import SimpleEditTableWithRevision from "@/wc/SimpleEditTableWithRevision.vue";
import RevisionReportView from "@/wc/RevisionReportView.vue";
import OptimizationManager from "@/wc/Optimization/OptimizationManager.vue";
import RevisionSalesOrderEditView from "@/wc/MasterPropertyRevisionView/SalesOrderEditView.vue";
import RTFCompareBySO from "@/wc/RTFCompareBySO.vue";

import { setLicenseKey } from "@grapecity/wijmo";
if (process.env?.VUE_APP_WIJMO_KEY) {
  setLicenseKey(process.env.VUE_APP_WIJMO_KEY);
}

import "@/styles/prod.scss";

Vue.config.productionTip = false;

Vue.component("moz-controller", Controller);
Vue.component("moz-calendar", Calendar);
Vue.component("moz-filter-control", FilterControl);
Vue.component("moz-excel-uploader", ExcelUploadPopup);
Vue.component("moz-excel-advanced-upload-popup", ExcelAdvancedUploadPopup);
// Chart
Vue.component("moz-chart", Chart);
Vue.component("moz-axis", Axis);
Vue.component("moz-series", Series);
Vue.component("moz-text", Text);

// Gauge
Vue.component("moz-gauge", Gauge);
Vue.component("moz-arc", Arc);
Vue.component("moz-bar", Bar);
Vue.component("moz-mark", Mark);

// Graph
Vue.component("moz-graph", Graph);

// Layout
Vue.component("moz-split-box", SplitBox);

// FileManager
Vue.component("moz-file-manager", FileManager);

// Gantt
Vue.component("moz-gantt", Gantt);

Vue.directive("tooltip", Tooltip);
Vue.directive("grid-tooltip", GridTooltip);
Vue.directive("grid-merge", GridMerge);
Vue.directive("cell-tooltip", GridCellTooltip);

Vue.use(vueCustomElement);

defineWebComponents(
  {
    id: "simple-edit-table-extend",
    name: "테이블 (New)",
    category: "Input",
    description: "테이블 그리드 개선",
    params: [
      {
        key: "tableName",
        type: "text",
      },
      {
        key: "dataKey",
        type: "textarea",
      },
      {
        key: "showRowFilter",
        type: "boolean",
      },
      {
        key: "showGroupPanel",
        type: "boolean",
      },
      {
        key: "columnSetting",
        type: "textarea",
      },
      {
        key: "mergeCol",
        type: "string",
      },
      {
        key: "editCol",
        type: "string",
      },
      {
        key: "viewType",
        type: "string",
      },
      {
        key: "useMngProperty",
        type: "boolean",
      },
    ],
  },
  (id: string) => {
    Vue.customElement(id, SimpleEditTableExtend);
  },
);

defineWebComponents(
  {
    id: "simple-edit-table-with-version",
    name: "테이블 (Version)",
    category: "Input",
    description: "테이블 그리드 (버전)",
    params: [
      {
        key: "tableName",
        type: "text",
      },
      {
        key: "dataKey",
        type: "textarea",
      },
      {
        key: "showRowFilter",
        type: "boolean",
      },
      {
        key: "showGroupPanel",
        type: "boolean",
      },
      {
        key: "columnSetting",
        type: "textarea",
      },
      {
        key: "hideVersion",
        type: "boolean",
      },
      {
        key: "isReadOnly",
        type: "boolean",
      },
    ],
  },
  (id: string) => {
    Vue.customElement(id, SimpleEditTableWithVersion);
  },
);

// defineWebComponents(
//   { id: "table-select", name: "테이블 선택", category: "Editor", description: "테이블 선택" },
//   (id: string) => {
//     Vue.customElement(id, TableList);
//   },
// );

// defineWebComponents(
//   {
//     id: "schema-type-edit",
//     name: "스키마 타입 선택",
//     category: "Editor",
//     description: "스키마 타입 선택",
//   },
//   (id: string) => {
//     Vue.customElement(id, SchemaTypeList);
//   },
// );

// defineWebComponents(
//   { id: "schema-select", name: "스키마 선택", category: "Editor", description: "스키마 선택" },
//   (id: string) => {
//     Vue.customElement(id, SchemaList);
//   },
// );

defineWebComponents(
  {
    id: "resource-load-report",
    name: "설비가동보고서",
    category: "Output",
    description: "Resource Load Report",
  },
  (id: string) => {
    Vue.customElement(id, ResourceLoadReport);
  },
);

defineWebComponents(
  {
    id: "property-config-edit",
    name: "속성관리",
    category: "Input",
    description: "CfgPropertyConfig table direct",
  },
  (id: string) => {
    Vue.customElement(id, PropertyConfigEdit);
  },
);

defineWebComponents(
  {
    id: "resource-gantt",
    name: "리소스 간트",
    category: "Output",
    description: "리소스 간트 페이지",
  },
  (id: string) => {
    Vue.customElement(id, ResourceGantt);
  },
);

defineWebComponents(
  {
    id: "at-plan-view",
    name: "Aleatorik Plan",
    category: "Plan",
    description: "Aleatorik Plan 모니터링 페이지",
  },
  (id: string) => {
    Vue.customElement(id, ATPlanView);
  },
);

defineWebComponents(
  {
    id: "at-plan-compare-view",
    name: "Aleatorik Plan Compare",
    category: "Plan",
    description: "Aleatorik Plan 계획 결과 비교",
  },
  (id: string) => {
    Vue.customElement(id, ATPlanCompareView);
  },
);

defineWebComponents(
  {
    id: "rtf-report",
    name: "RTF보고서",
    category: "Output",
    description: "RTF Report",
  },
  (id: string) => {
    Vue.customElement(id, RTFReport);
  },
);

defineWebComponents(
  {
    id: "resource-edit-view",
    name: "Resource Edit View",
    category: "Input",
    description: "Resource Edit View",
  },
  (id: string) => {
    Vue.customElement(id, ResourceEditView);
  },
);

defineWebComponents(
  {
    id: "sales-order-edit-view",
    name: "Sales Order Edit View",
    category: "Input",
    description: "Sales Order Edit View",
  },
  (id: string) => {
    Vue.customElement(id, SalesOrderEditView);
  },
);

defineWebComponents(
  {
    id: "item-edit-view",
    name: "Item Edit View",
    category: "Input",
    description: "Item Edit View",
  },
  (id: string) => {
    Vue.customElement(id, ItemEditView);
  },
);

defineWebComponents(
  {
    id: "item-site-buffer-edit-view",
    name: "Item Site Buffer Edit View",
    category: "Input",
    description: "Item Site Buffer Edit View",
  },
  (id: string) => {
    Vue.customElement(id, ItemSiteBufferEditView);
  },
);

defineWebComponents(
  {
    id: "buffer-edit-view",
    name: "Buffer Edit View",
    category: "Input",
    description: "Buffer Edit View",
  },
  (id: string) => {
    Vue.customElement(id, BufferEditView);
  },
);

defineWebComponents(
  {
    id: "wip-edit-view",
    name: "Wip Edit View",
    category: "Input",
    description: "Wip Edit View",
  },
  (id: string) => {
    Vue.customElement(id, WipEditView);
  },
);

defineWebComponents(
  {
    id: "customer-edit-view",
    name: "Customer Edit View",
    category: "Input",
    description: "Customer Edit View",
  },
  (id: string) => {
    Vue.customElement(id, CustomerEditView);
  },
);

defineWebComponents(
  {
    id: "site-edit-view",
    name: "Site Edit View",
    category: "Input",
    description: "Site Edit View",
  },
  (id: string) => {
    Vue.customElement(id, SiteEditView);
  },
);

defineWebComponents(
  {
    id: "scenario-configurator-view",
    name: "Scenario Configurator View",
    category: "Input",
    description: "Scenario Configurator View",
  },
  (id: string) => {
    Vue.customElement(id, ScenarioConfiguratorView);
  },
);

defineWebComponents(
  {
    id: "rule-set-configurator-view",
    name: "Rule Set Configurator View",
    category: "Input",
    description: "Rule Set Configurator View",
  },
  (id: string) => {
    Vue.customElement(id, RuleSetConfiguratorView);
  },
);

// defineWebComponents(
//   {
//     id: "production-gantt",
//     name: "Production Gantt",
//     category: "Output",
//     description: "Production Gantt",
//   },
//   (id: string) => {
//     Vue.customElement(id, ProductionGantt);
//   },
// );

defineWebComponents(
  {
    id: "bom-map-view",
    name: "BOM Map View",
    category: "Output",
    description: "BOM Map View",
  },
  (id: string) => {
    Vue.customElement(id, BOMMapView);
  },
);

// defineWebComponents(
//   {
//     id: "production-plan-map-view",
//     name: "Production Plan Map View",
//     category: "Output",
//     description: "Production Plan Map View",
//   },
//   (id: string) => {
//     Vue.customElement(id, ProductionPlanMapView);
//   },
// );

defineWebComponents(
  {
    id: "data-grid-view",
    name: "Data Grid View",
    category: "Input",
    description: "Data Grid View",
  },
  (id: string) => {
    Vue.customElement(id, DataGridView);
  },
);

defineWebComponents(
  {
    id: "plan-dashboard",
    name: "Plan Dashboard",
    category: "Output",
    description: "Plan Dashboard",
  },
  (id: string) => {
    Vue.customElement(id, PlanDashboard);
  },
);

defineWebComponents(
  {
    id: "revision-edit-table",
    name: "Revision Edit Table",
    category: "Input",
    description: "Revision Edit Table",
  },
  (id: string) => {
    Vue.customElement(id, SimpleEditTableWithRevision);
  },
);

defineWebComponents(
  {
    id: "revision-report-view",
    name: "Revision Report View",
    category: "Output",
    description: "Revision Report View",
  },
  (id: string) => {
    Vue.customElement(id, RevisionReportView);
  },
);

defineWebComponents(
  {
    id: "optimization-manager",
    name: "Optimization Manager",
    category: "Plan",
    description: "Optimization Manager",
  },
  (id: string) => {
    Vue.customElement(id, OptimizationManager);
  },
);

defineWebComponents(
  {
    id: "rev-sales-order-edit-view",
    name: "Sales Order Edit View (Revision)",
    category: "Input",
    description: "Sales Order Edit View (Revision)",
  },
  (id: string) => {
    Vue.customElement(id, RevisionSalesOrderEditView);
  },
);

defineWebComponents(
  {
    id: "rtf-compare-by-so",
    name: "RTF Compare By Sales Order",
    category: "Output",
    description: "RTF Compare By Sales Order",
  },
  (id: string) => {
    Vue.customElement(id, RTFCompareBySO);
  },
);
