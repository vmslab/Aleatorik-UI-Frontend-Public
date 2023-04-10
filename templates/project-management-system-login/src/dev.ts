import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import vueCustomElement from "vue-custom-element";
import "document-register-element/build/document-register-element";

import { SplitBox, Tooltip, GridTooltip } from "mozart-component-dev";
import i18n from "./plugins/i18n";
import router from "./router";
import store from "./store";

import App from "./App.vue";

import "@/styles/dev.scss";

Vue.config.productionTip = false;

// Layout
Vue.component("moz-split-box", SplitBox);

Vue.directive("tooltip", Tooltip);
Vue.directive("grid-tooltip", GridTooltip);

Vue.use(vueCustomElement);

new Vue({
  i18n,
  router,
  store,
  render: h => h(App),
}).$mount("#app");
