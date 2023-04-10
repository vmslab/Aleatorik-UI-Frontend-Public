import { get } from "lodash";
import VueI18n from "vue-i18n";
import { MainModule } from "../store/modules/mainStore";
import { setCustomColor } from "mozart-common";
import devTheme from "devextreme/ui/themes";

import Cookies from "js-cookie";
import { decodeEscapeAtob } from "mozart-common";

export const CurrentUser = () => {
  try {
    const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
    const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
    let userName = login === undefined ? "debug" : login.name;
    return userName;
  } catch {
    return "debug";
  }
};

export const CurrentEmail = () => {
  try {
    const loginString: string = Cookies.get(MainModule.getLoginCookieKey) as string;
    const login = loginString ? JSON.parse(decodeEscapeAtob(loginString)) : null;
    let userID = login === undefined ? "debug@vms-solutions.com" : login.email;
    return userID;
  } catch {
    return "debug@vms-solutions.com";
  }
};

export const setTheme = () => {
  try {
    if (MainModule.compact === "compact") {
      devTheme.current(`generic.compact.${MainModule.theme}`);
    } else {
      devTheme.current(`generic.${MainModule.theme}`);
    }

    document.documentElement.setAttribute("theme", MainModule.theme);
    document.documentElement.setAttribute("font", MainModule.compact);

    setCustomColor({
      theme: MainModule.getTheme,
      compact: MainModule.getCompact,
      menuLocation: "left",
      width: MainModule.window.width,
      height: MainModule.window.height,
      drawerWidth: MainModule.drawerWidth,
      themeData: MainModule.themeData,
    });
  } catch (err: any) {
    console.log(err);
  }
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

  if (props.topHeight && props.topHeight !== MainModule.topHeight) {
    MainModule.setTopHeight(props.topHeight);
  }

  if (props.drawerWidth && props.drawerWidth !== MainModule.drawerWidth) {
    MainModule.setDrawerWidth(props.drawerWidth);
  }

  if (Number.isFinite(props.drawerWidth) && props.drawerWidth !== MainModule.drawerWidth) {
    MainModule.setDrawerWidth(props.drawerWidth);
  }

  if (Number.isFinite(props.topHeight)) {
    MainModule.setTopHeight(props.topHeight);
  }

  if (Number.isFinite(props.controlHeight)) {
    MainModule.setControlHeight(props.controlHeight);
  }
};
