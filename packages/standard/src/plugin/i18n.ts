import { App } from "vue";
import i18next from "i18next";
import I18NextVue from "i18next-vue";
import LanguageDetector from "i18next-browser-languagedetector";
import lang from "../data/lang.json";

i18next.use(LanguageDetector).init({
  fallbackLng: "en",
  resources: lang,
});

export default (app: App<Element>) => {
  app.use(I18NextVue, { i18next });
  return app;
};
