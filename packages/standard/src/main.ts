import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from 'vue-query';
import router from './router';
import queryClient from './utils/query';
import i18n from './plugin/i18n';
import App from './App.vue';
import { Tooltip } from '@aleatorik-ui/vue-component-wijmo';

// Wijmo Korean
// TODO: Globalize 적용시 확인 필요
import '@grapecity/wijmo.cultures/wijmo.culture.ko';

import './styles/index.scss';

i18n(createApp(App)).use(VueQueryPlugin, { queryClient }).use(createPinia()).use(router).directive('tooltip', Tooltip).mount('#app');
