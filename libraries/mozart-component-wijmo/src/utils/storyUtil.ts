import VueI18n from "vue-i18n";
import Vuex from "vuex";
import { cloneDeep } from "lodash";

const i18n = new VueI18n({
  locale: "KO",
  fallbackLocale: "KO",
  silentTranslationWarn: true,
  messages: {},
});

export const createStory = (params: {
  props?: any;
  data?: any;
  components?: any;
  created?: any;
  mounted?: any;
  updated?: any;
  destroyed?: any;
  computed?: any;
  template: any;
  methods?: any;
}): object => {
  const {
    props,
    data,
    components,
    created,
    mounted,
    updated,
    destroyed,
    computed,
    template,
    methods,
  } = params;
  return {
    i18n,
    props,
    data,
    components,
    created,
    mounted,
    updated,
    destroyed,
    computed,
    template,
    methods,
  };
};

export const copyModule = (module: any): any => {
  return new Vuex.Store({ modules: { module: cloneDeep(module) } });
};
