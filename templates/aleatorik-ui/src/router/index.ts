import Vue from "vue";
import VueRouter, { Route } from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/data-grid-view",
    name: "Data Grid View",
    component: () => import("../views/DataGridView.vue"),
  },
  {
    path: "/simple-edit-table-extend",
    name: "Simple Edit Table Extend",
    component: () => import("../views/SimpleEditTableExtend.vue"),
  },
  {
    path: "/simple-edit-table-with-version",
    name: "Simple Edit Table With Version",
    component: () => import("../views/SimpleEditTableWithVersion.vue"),
  },
  {
    path: "/resource-load-report",
    name: "Resource Load Report",
    component: () => import("../views/ResourceLoadReport.vue"),
  },
  {
    path: "/property-config-edit",
    name: "Property Config Edit",
    component: () => import("../views/PropertyConfigEdit.vue"),
  },
  {
    path: "/resource-gantt",
    name: "Resource Gantt",
    component: () => import("../views/ResourceGantt.vue"),
  },
  {
    path: "/at-plan-view",
    name: "AT Plan View",
    component: () => import("../views/Plan/ATPlanView.vue"),
  },
  {
    path: "/rtf-report",
    name: "RTF Report",
    component: () => import("../views/AOR1000200S.vue"),
  },
  {
    path: "/resource-edit-view",
    name: "Resource Edit View",
    component: () => import("../views/MasterPropertyEditView/ResourceEditView.vue"),
  },
  {
    path: "/sales-order-edit-view",
    name: "Sales Order Edit View",
    component: () => import("../views/MasterPropertyEditView/SalesOrderEditView.vue"),
  },
  {
    path: "/item-edit-view",
    name: "Item Edit View",
    component: () => import("../views/MasterPropertyEditView/ItemEditView.vue"),
  },
  {
    path: "/item-site-buffer-edit-view",
    name: "Item Site Buffer Edit View",
    component: () => import("../views/MasterPropertyEditView/ItemSiteBufferEditView.vue"),
  },
  {
    path: "/buffer-edit-view",
    name: "Buffer Edit View",
    component: () => import("../views/MasterPropertyEditView/BufferEditView.vue"),
  },
  {
    path: "/wip-edit-view",
    name: "Wip Edit View",
    component: () => import("../views/MasterPropertyEditView/WipEditView.vue"),
  },
  {
    path: "/customer-edit-view",
    name: "Customer Edit View",
    component: () => import("../views/MasterPropertyEditView/CustomerEditView.vue"),
  },
  {
    path: "/site-edit-view",
    name: "Site Edit View",
    component: () => import("../views/MasterPropertyEditView/SiteEditView.vue"),
  },
  {
    path: "/scenario-config-view",
    name: "Scenario Configurator View",
    component: () => import("../views/ConfiguratorView/ScenarioConfiguratorView.vue"),
  },
  {
    path: "/ruleset-config-view",
    name: "RuleSet Configurator View",
    component: () => import("../views/ConfiguratorView/RuleSetConfiguratorView.vue"),
  },
  // {
  //   path: "/production-gantt",
  //   name: "Production Gantt View",
  //   component: () => import("../views/Gantt/ProductionGantt.vue"),
  // },
  {
    path: "/bom-map-view",
    name: "BOM Map View",
    component: () => import("../views/Map/BOMMapView.vue"),
  },
  // {
  //   path: "/production-plan-map-view",
  //   name: "Production Plan Map View",
  //   component: () => import("../views/Map/ProductionPlanMapView.vue"),
  // },
  {
    path: "/plan-dashboard",
    name: "Plan Dashboard",
    component: () => import("../views/Dashboard/PlanDashboard.vue"),
  },
  {
    path: "/revision-edit-table",
    name: "Revision Edit Table",
    component: () => import("../views/SimpleEditTableWithRevision.vue"),
  },
  {
    path: "/revision-report-view",
    name: "Revision Report View",
    component: () => import("../views/RevisionReportView.vue"),
  },
  {
    path: "/optimization-manager",
    name: "Optimization Manager",
    component: () => import("../views/Optimization/OptimizationManager.vue"),
  },
  {
    path: "/at-plan-compare-view",
    name: "AT Plan Compare View",
    component: () => import("../views/Plan/ATPlanCompareView.vue"),
  },
  {
    path: "/revision-sales-order-edit-view",
    name: "Revision Sales Order Edit View",
    component: () => import("../views/MasterPropertyRevisionView/SalesOrderEditView.vue"),
  },
  {
    path: "/rtf-compare-by-so",
    name: "RTF Compare By Sales Order",
    component: () => import("../views/RTFCompareBySO.vue"),
  },
  {
    path: "/virtual-table-view",
    name: "Vitual Scroll Table Sample",
    component: () => import("../views/VirtualTable.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
