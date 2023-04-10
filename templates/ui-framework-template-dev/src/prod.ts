import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import vueCustomElement from "vue-custom-element";
import "document-register-element/build/document-register-element";
import { defineWebComponents } from "./web-components";

import {
  Controller,
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
} from "mozart-component-wijmo";

import Home from "@/wc/Home.vue";
import ChartView from "@/wc/Chart.vue";
import Chart2View from "@/wc/Chart2.vue";
import GaugeView from "@/wc/Gauge.vue";
import GanttView from "@/wc/Gantt.vue";
import Todo from "@/wc/Todo.vue";
import Grid from "@/wc/Grid.vue";
import ResourceLoadReport from "@/wc/ResourceLoadReport.vue";
import ResourceGantt from "@/wc/ResourceGantt.vue";
import RTFReport from "@/wc/RTFReport.vue";
import ProductionGantt from "@/wc/Gantt/ProductionGantt.vue";

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

Vue.use(vueCustomElement);

defineWebComponents({ id: "home", name: "메인", category: "Output", description: "메인 페이지" }, (id: string) => {
  Vue.customElement(id, Home);
});

defineWebComponents(
  { id: "todo", name: "업무목록", category: "Input", description: "업무목록 페이지" },
  (id: string) => {
    Vue.customElement(id, Todo);
  },
);

defineWebComponents({ id: "chart", name: "차트", category: "Input", description: "차트 페이지" }, (id: string) => {
  Vue.customElement(id, ChartView);
});

defineWebComponents({ id: "chart2", name: "차트2", category: "Input", description: "차트2 페이지" }, (id: string) => {
  Vue.customElement(id, Chart2View);
});

defineWebComponents({ id: "gauge", name: "게이지", category: "Input", description: "게이지 페이지" }, (id: string) => {
  Vue.customElement(id, GaugeView);
});

defineWebComponents({ id: "gantt", name: "간트", category: "Input", description: "간트 페이지" }, (id: string) => {
  Vue.customElement(id, GanttView);
});

defineWebComponents({ id: "grid", name: "그리드", category: "Input", description: "그리드 페이지" }, (id: string) => {
  Vue.customElement(id, Grid);
});

defineWebComponents(
  {
    id: "resource-load-report",
    name: "설비가동보고서",
    category: "Input",
    description: "Resource Load Report",
  },
  (id: string) => {
    Vue.customElement(id, ResourceLoadReport);
  },
);

defineWebComponents(
  {
    id: "resource-gantt",
    name: "리소스 간트",
    category: "Input",
    description: "리소스 간트 페이지",
  },
  (id: string) => {
    Vue.customElement(id, ResourceGantt);
  },
);

defineWebComponents(
  {
    id: "rtf-report",
    name: "RTF보고서",
    category: "Input",
    description: "RTF Report",
  },
  (id: string) => {
    Vue.customElement(id, RTFReport);
  },
);

defineWebComponents(
  {
    id: "production-gantt",
    name: "Production Gantt",
    category: "Input",
    description: "Production Gantt",
  },
  (id: string) => {
    Vue.customElement(id, ProductionGantt);
  },
);
