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
  FileManager,
  Gantt,
  SplitBox,
  Tooltip,
  GridTooltip,
  GridMerge,
} from "mozart-component-dev";

import Home from "@/wc/Home.vue";
import ProjectMgmt from "@/wc/ProjectMgmt.vue";
import ServerMgmt from "@/wc/ServerMgmt.vue";
import CustomerMgmt from "@/wc/CustomerMgmt.vue";

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

defineWebComponents(
  { id: "home", name: "메인", category: "Output", description: "메인 페이지" },
  (id: string) => {
    Vue.customElement(id, Home);
  },
);

defineWebComponents(
  { id: "server-mgmt", name: "서버관리", category: "Output", description: "서버관리 페이지" },
  (id: string) => {
    Vue.customElement(id, ServerMgmt);
  },
);

defineWebComponents(
  { id: "customer-mgmt", name: "고객관리", category: "Output", description: "고객관리 페이지" },
  (id: string) => {
    Vue.customElement(id, CustomerMgmt);
  },
);

defineWebComponents(
  {
    id: "project-mgmt",
    name: "프로젝트관리",
    category: "Output",
    description: "프로젝트관리 페이지",
  },
  (id: string) => {
    Vue.customElement(id, ProjectMgmt);
  },
);
