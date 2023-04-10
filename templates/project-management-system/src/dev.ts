import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import vueCustomElement from "vue-custom-element";
import "document-register-element/build/document-register-element";

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
  SplitBox,
  Gantt,
  Tooltip,
  GridTooltip,
  GridMerge,
} from "mozart-component-dev";
import i18n from "./plugins/i18n";
import router from "./router";
import store from "./store";

import App from "./App.vue";

import "@/styles/dev.scss";

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

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount("#app");
