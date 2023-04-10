import devTheme from "devextreme/ui/themes";
import { setCustomColor } from "./themeSet";
import { useThemeStore, useLayoutStore } from "../stores/mainStore";

export const setAppTheme = () => {
  const theme = useThemeStore();
  const layout = useLayoutStore();

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
    themeData: theme.themeData,
  });
};
