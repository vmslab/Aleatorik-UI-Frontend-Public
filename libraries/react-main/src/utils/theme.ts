import devTheme from "devextreme/ui/themes";
import { setCustomColor } from "@aleatorik-ui/common-ui";

export const setAppTheme = (theme: any, layout: any) => {
  if (theme.compact === "compact") {
    devTheme.current(`generic.compact.${theme.theme}`);
  } else {
    devTheme.current(`generic.${theme.theme}`);
  }

  document.documentElement.setAttribute("theme", theme.theme);
  document.documentElement.setAttribute("font", theme.compact);

  setCustomColor({
    theme: theme.theme,
    compact: theme.compact,
    menuLocation: "left",
    width: layout.width,
    height: layout.height,
    drawerWidth: layout.drawerWidth,
    themeData: {
      common: { ...theme.themeData.common },
      light: { ...theme.themeData.light },
      dark: { ...theme.themeData.dark },
      normal: { ...theme.themeData.normal },
      compact: { ...theme.themeData.compact },
    },
  });
};
