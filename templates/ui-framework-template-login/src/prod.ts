import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from "vue";
import vueCustomElement from "vue-custom-element";
import "document-register-element/build/document-register-element";
import { defineWebComponents } from "./web-components";

import { SplitBox, Tooltip, GridTooltip } from "mozart-component-dev";

import Login from "@/wc/Login.vue";
import Home from "@/wc/Home.vue";

import "@/styles/prod.scss";

Vue.config.productionTip = false;

// Layout
Vue.component("moz-split-box", SplitBox);

Vue.directive("tooltip", Tooltip);
Vue.directive("grid-tooltip", GridTooltip);

Vue.use(vueCustomElement);

defineWebComponents(
  { id: "template", name: "로그인", category: "Output", description: "로그인 페이지" },
  (id: string) => {
    Vue.customElement(id, Login);
  },
);

defineWebComponents(
  { id: "home", name: "홈", category: "Output", description: "홈 페이지" },
  (id: string) => {
    Vue.customElement(id, Home);
  },
);
