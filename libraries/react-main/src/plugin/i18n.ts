import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { lang } from "@aleatorik-ui/common-api";

i18next.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "en",
  resources: lang,
});

export default i18next;
