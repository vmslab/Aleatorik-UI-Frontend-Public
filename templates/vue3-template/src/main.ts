import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "vue-query";
import router from "./router";
import queryClient from "./utils/query";
import i18n from "./plugin/i18n";
import App from "./App.vue";
import { Tooltip } from "@mozart-ui/vue-component-wijmo";

import "./styles/index.scss";

i18n(createApp(App))
  .use(VueQueryPlugin, { queryClient })
  .use(createPinia())
  .use(router)
  .directive("tooltip", Tooltip)
  .mount("#app");
