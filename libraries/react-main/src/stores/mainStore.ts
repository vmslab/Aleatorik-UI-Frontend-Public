import { atom, selector } from "recoil";
import dayjs from "dayjs";
import notify from "devextreme/ui/notify";
import {
  setCssSizeVariable,
  DRAWER_MAX,
  DRAWER_MIN,
  CONTENTS_PADDING,
  TOP_HEIGHT,
  COMPACT_CONTROL_HEIGHT,
  COMPACT_TOP_HEIGHT,
  CONTROL_HEIGHT,
  SIDE_TAB_BAR_WIDTH,
  MENU_HEIGHT,
  STATUS_HEIGHT,
  IThemeData,
} from "@mozart-ui/common-ui";
import { setAppTheme } from "../utils/theme";

export const layoutState = atom({
  key: "layout",
  default: {
    width: 0,
    height: 0,
    contentsPadding: CONTENTS_PADDING,
    drawerWidth: DRAWER_MAX,
    topHeight: COMPACT_TOP_HEIGHT,
    controlHeight: COMPACT_CONTROL_HEIGHT,
    sideTabBarWidth: SIDE_TAB_BAR_WIDTH,
    menuHeight: MENU_HEIGHT,
    statusHeight: STATUS_HEIGHT,
    drawer: true,
    login: false,
    compact: true,
  },
  effects: [
    ({ onSet, setSelf }) => {
      onSet(from => {
        const to = {
          ...from,
          drawerWidth: from.login ? (from.drawer ? DRAWER_MAX : DRAWER_MIN) : 0,
          topHeight: from.login ? (from.compact ? COMPACT_TOP_HEIGHT : TOP_HEIGHT) : 0,
          controlHeight: from.login ? (from.compact ? COMPACT_CONTROL_HEIGHT : CONTROL_HEIGHT) : 0,
        };
        setSelf(to);
        setCssSizeVariable({
          width: to.width,
          height: to.height,
          contentsPadding: to.contentsPadding,
          drawerWidth: to.drawerWidth,
          topHeight: to.topHeight,
          controlHeight: to.controlHeight,
          sideTabBarWidth: to.sideTabBarWidth,
          menuHeight: to.menuHeight,
          statusHeight: to.statusHeight,
        });
      });
    },
  ],
});

export const loadState = atom({
  key: "load",
  default: {
    loading: false,
  },
});

export const alarmState = atom({
  key: "alarm",
  default: {
    message: "",
    type: "success",
  },
  effects: [
    ({ onSet, setSelf }) => {
      onSet(from => {
        const to = { ...from };
        setSelf(to);
        notify(
          {
            message: to.message,
            type: to.type,
            displayTime: 2000,
            width: "auto",
            minWidth: 150,
            animation: {
              show: {
                type: "fade",
                duration: 400,
                from: 0,
                to: 1,
              },
              hide: { type: "fade", duration: 40, to: 0 },
            },
          },
          { position: "bottom center", direction: "up-push" },
        );
      });
    },
  ],
});

export const userState = atom({
  key: "user",
  default: {
    role: "",
    name: "",
    email: "",
  },
});

export const pathState = atom({
  key: "path",
  default: "/",
});

export const serverState = atom({
  key: "server",
  default: {
    time: dayjs(),
  },
});

export const themeState = atom<{
  theme: "light" | "dark";
  compact: "normal" | "compact";
  themeData: IThemeData;
}>({
  key: "theme",
  default: {
    theme: "light",
    compact: "compact",
    themeData: {
      common: {},
      light: {},
      dark: {},
      compact: {},
      normal: {},
    },
  },
});

export const appRenderType = selector({
  key: "appRenderType",
  get: ({ get }) => {
    const layout = get(layoutState);
    const user = get(userState);
    if (layout.width > 0 && layout.height > 0) {
      if (layout.login) {
        if (user.role === "User") {
          return 2;
        } else if (user.role === "Dev") {
          return 3;
        }
      } else {
        return 1;
      }
    }
    return 0;
  },
});
