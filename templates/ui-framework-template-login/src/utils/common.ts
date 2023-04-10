import { get } from "lodash";
import VueI18n from "vue-i18n";
import { MainModule } from "../store/modules/mainStore";

export const setTheme = (isDark: boolean, isCompact: boolean) => {
  MainModule.setTheme(isDark ? "dark" : "light");
  MainModule.setCompact(isCompact ? "compact" : "normal");

  // document.documentElement.setAttribute("theme", MainModule.theme);
  // document.documentElement.setAttribute("font", MainModule.compact);
};

export const initComponent = ($i18n: VueI18n, props: any) => {
  if (props.navis) {
    MainModule.setNavis(JSON.parse(props.navis));
  }

  if (props.write) {
    MainModule.setWrite(JSON.parse(props.write));
  }

  if (props.params) {
    MainModule.setParams(JSON.parse(props.params));
  }

  if (props.lang) {
    $i18n.locale = props.lang;
  }

  if (props.i18n) {
    const messages = JSON.parse(props.i18n);
    const keys = Object.keys(messages);
    for (const key of keys) {
      $i18n.setLocaleMessage(key, get(messages, key));
    }
  }

  if (props.themes) {
    const t = JSON.parse(props.themes);
    setTheme(t.isDark, t.isCompact);
  }

  if (props.topHeight && props.topHeight !== MainModule.topHeight) {
    MainModule.setTopHeight(props.topHeight);
  }

  if (props.drawerWidth && props.drawerWidth !== MainModule.drawerWidth) {
    MainModule.setDrawerWidth(props.drawerWidth);
  }
};
