import Vue from "vue";
import VueRouter, { Route } from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/todo",
    name: "Todo",
    component: () => import("../views/Todo.vue"),
  },
  {
    path: "/layout1",
    name: "Layout",
    component: () => import("../views/Layout.vue"),
  },
  {
    path: "/layout2",
    name: "LayoutOuterController",
    component: () => import("../views/LayoutOuterController.vue"),
  },
  {
    path: "/chart",
    name: "Chart",
    component: () => import("../views/Chart.vue"),
  },
  {
    path: "/chart2",
    name: "Chart2",
    component: () => import("../views/Chart2.vue"),
  },
  {
    path: "/gantt",
    name: "Gantt",
    component: () => import("../views/Gantt.vue"),
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/Calendar.vue"),
  },
  {
    path: "/gauge",
    name: "Gauge",
    component: () => import("../views/Gauge.vue"),
  },
  {
    path: "/html-editor",
    name: "HTMLEditor",
    component: () => import("../views/HTMLEditor.vue"),
  },
  {
    path: "/extend-grid",
    name: "Extend Grid",
    component: () => import("../views/ExtendEditGrid.vue"),
  },
  {
    path: "/sample-grid",
    name: "Sample Grid",
    component: () => import("../views/SampleGrid.vue"),
  },
  {
    path: "/grid",
    name: "Grid",
    component: () => import("../views/Grid.vue"),
  },
  {
    path: "/edit-grid",
    name: "EditGrid",
    component: () => import("../views/EditGrid.vue"),
  },
  {
    path: "/merged-grid",
    name: "MergedGrid",
    component: () => import("../views/MergedGrid.vue"),
  },
  {
    path: "/material-colors",
    name: "MaterialColors",
    component: () => import("../views/MaterialColors.vue"),
  },
  {
    path: "/file-manage",
    name: "FileManage",
    component: () => import("../views/FileManage.vue"),
  },
  {
    path: "/gantt-test",
    name: "GanttTest",
    component: () => import("../views/GanttTest.vue"),
  },
  {
    path: "/gantt-plan",
    name: "GanttPlan",
    component: () => import("../views/GanttPlan.vue"),
  },
  {
    path: "/gantt-eqp-plan",
    name: "GanttEqpPlan",
    component: () => import("../views/GanttEqpPlan.vue"),
  },
  {
    path: "/graph-test",
    name: "GraphTest",
    component: () => import("../views/GraphTest.vue"),
  },
  {
    path: "/resource-load-report",
    name: "Resource Load Report",
    component: () => import("../views/ResourceLoadReport.vue"),
  },
  {
    path: "/resource-gantt",
    name: "Resource Gantt",
    component: () => import("../views/ResourceGantt.vue"),
  },
  {
    path: "/mps-gantt",
    name: "MPS Gantt",
    component: () => import("../views/MpsGantt.vue"),
  },
  {
    path: "/rtf-report",
    name: "RTF Report",
    component: () => import("../views/RTFReport.vue"),
  },
  {
    path: "/production-gantt",
    name: "Production Gantt View",
    component: () => import("../views/Gantt/ProductionGantt.vue"),
  },
  {
    path: "/dnd-planner",
    name: "Drag & Drop Planner",
    component: () => import("../views/DnD_Planner/LXD_ProdSchedule.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
