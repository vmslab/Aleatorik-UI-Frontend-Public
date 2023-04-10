import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "vue-query";
import router from "./router";
import { queryClient } from "@mozart-ui/vue-main";
import i18n from "./plugin/i18n";
import App from "./App.vue";

import "./styles/index.scss";

i18n(createApp(App)).use(VueQueryPlugin, { queryClient }).use(createPinia()).use(router).mount("#app");
