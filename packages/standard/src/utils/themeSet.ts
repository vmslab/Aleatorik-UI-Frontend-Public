import { kebabCase } from "lodash";
import { IThemeData } from "../types";
import { themeObject } from "./themeObject";
import { setThemeData } from "./themeUtil";
import { getMaterialColors, getColorByType, hexToRgb } from "./colorUtil";
import { getTextColor2, calcBrightness, rgbaToRgb } from "./hexToRgba";
import { getTaskBorderPixelImage } from "./ganttUtil";
import { clock, hour, minute } from "../svg/clock";

export const materialColorIndex: Record<number, string> = {
  0: "50",
  1: "100",
  2: "200",
  3: "300",
  4: "400",
  5: "500",
  6: "600",
  7: "700",
  8: "800",
  9: "900",
};

const setBorder = (themeData: IThemeData) => {
  themeObject.common.borderThemeItems.forEach(item => {
    const value = item.type === "number" ? `${themeData.common[item.name]}px` : themeData.common[item.name];
    document.documentElement.style.setProperty(`--${kebabCase(item.name)}`, value);
  });
};

const setMainColor = (theme: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;
  const colorObject = theme === "light" ? themeObject.light : themeObject.dark;

  colorObject.mainColorThemeItems.forEach(item => {
    const name = item.name.replace("Color", "").toLocaleLowerCase();
    const hex = colorData[item.name];
    document.documentElement.style.setProperty(`--color-${name}`, `${hex}`);
    const rgb = hexToRgb(hex);
    if (rgb && rgb.length === 3) {
      document.documentElement.style.setProperty(`--color-${name}-r`, `${rgb[0]}`);
      document.documentElement.style.setProperty(`--color-${name}-g`, `${rgb[1]}`);
      document.documentElement.style.setProperty(`--color-${name}-b`, `${rgb[2]}`);
    }
  });

  if (colorData.primaryColor) {
    const color = getMaterialColors(colorData.primaryColor);
    Object.keys(materialColorIndex).forEach((key, idx) => {
      document.documentElement.style.setProperty(`--color-primary${materialColorIndex[+key]}`, `${color[idx].primary}`);
    });
    document.documentElement.style.setProperty("--color-top-border", getColorByType(colorData.primaryColor, "border"));
    document.documentElement.style.setProperty("--color-top-square", getColorByType(colorData.primaryColor, "square"));
    document.documentElement.style.setProperty("--color-top-icon", getColorByType(colorData.primaryColor, "icon"));
    document.documentElement.style.setProperty("--color-top-arrow", getColorByType(colorData.primaryColor, "arrow"));
    document.documentElement.style.setProperty("--color-top-font", getColorByType(colorData.primaryColor, "font"));
  }

  if (colorData.accentColor) {
    document.documentElement.style.setProperty("--color-selected", `${colorData.accentColor}33`);
    document.documentElement.style.setProperty("--color-hover", `${colorData.accentColor}1A`);
    document.documentElement.style.setProperty("--image-gantt-task-border", `url(${getTaskBorderPixelImage()})`);
    document.documentElement.style.setProperty(
      "--task-border",
      `0px 1px repeat-x var(--image-gantt-task-border),
      0px 2px repeat-x var(--image-gantt-task-border),
    1px 0px repeat-y var(--image-gantt-task-border),
    2px 0px repeat-y var(--image-gantt-task-border),
    calc(100% - 1px) 0px repeat-y var(--image-gantt-task-border),
    calc(100% - 2px) 0px repeat-y var(--image-gantt-task-border),
    0px calc(100% - 1px) repeat-x var(--image-gantt-task-border),
    0px calc(100% - 2px) repeat-x var(--image-gantt-task-border)`,
    );
  }
};

const setBaseColor = (theme: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;
  const colorObject = theme === "light" ? themeObject.light : themeObject.dark;

  colorObject.baseColorThemeItems.forEach(item => {
    const name = item.name.replace("Color", "").toLocaleLowerCase();
    const hex = colorData[item.name];
    document.documentElement.style.setProperty(`--color-${name}`, `${hex}`);
    const rgb = hexToRgb(hex);
    if (rgb && rgb.length === 3) {
      document.documentElement.style.setProperty(`--color-${name}-r`, `${rgb[0]}`);
      document.documentElement.style.setProperty(`--color-${name}-g`, `${rgb[1]}`);
      document.documentElement.style.setProperty(`--color-${name}-b`, `${rgb[2]}`);
    }
  });
};

const setKebabColor = (theme: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;
  const colorObject = theme === "light" ? themeObject.light : themeObject.dark;

  colorObject.kebabColorThemeItems.forEach(item => {
    document.documentElement.style.setProperty(`--color-${kebabCase(item.name)}`, `${colorData[item.name]}`);
  });
};

const setStateColor = (theme: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;
  const colorObject = theme === "light" ? themeObject.light : themeObject.dark;

  colorObject.stateColorThemeItems.forEach(item => {
    const name = item.name.replace("Color", "").toLocaleLowerCase();
    document.documentElement.style.setProperty(`--color-${name}`, `${colorData[item.name]}`);
  });
};

const setFontColor = (theme: string, menuLocation: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;

  if (menuLocation === "left") {
    document.documentElement.style.setProperty(
      "--color-drawer-font",
      `${getTextColor2(
        calcBrightness(rgbaToRgb(colorData.backDark1Color, colorData.primaryColor)),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );
    document.documentElement.style.setProperty(
      "--color-drawer-selected-menu-font",
      `${getTextColor2(
        calcBrightness(rgbaToRgb(colorData.backDark1Color, colorData.secondaryColor)),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );
    document.documentElement.style.setProperty(
      "--color-drawer-selected-category-font",
      `${getTextColor2(
        calcBrightness(colorData.accentColor),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );
  } else if (menuLocation === "topandleft") {
    document.documentElement.style.setProperty(
      "--color-drawer-font",
      `${getTextColor2(
        calcBrightness(colorData.backDark1Color),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );
    document.documentElement.style.setProperty(
      "--color-drawer-selected-menu-font",
      `${getTextColor2(
        calcBrightness(colorData.backDark1Color),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );

    document.documentElement.style.setProperty(
      "--color-primary-font",
      `${getTextColor2(
        calcBrightness(colorData.primaryColor),
        "var(--color-fontlightback)",
        "var(--color-fontdarkback)",
        120,
      )}`,
    );
  }

  document.documentElement.style.setProperty(
    "--color-grid-header-font",
    `${getTextColor2(
      calcBrightness(colorData.gridHeaderColor),
      "var(--color-fontlightback)",
      "var(--color-fontdarkback)",
      120,
    )}`,
  );
  document.documentElement.style.setProperty(
    "--color-common-header-font",
    `${getTextColor2(
      calcBrightness(colorData.commonHeaderColor),
      "var(--color-fontlightback)",
      "var(--color-fontdarkback)",
      120,
    )}`,
  );
  document.documentElement.style.setProperty(
    "--color-emphasize-header-font",
    `${getTextColor2(
      calcBrightness(colorData.primaryColor),
      "var(--color-fontlightback)",
      "var(--color-fontdarkback)",
      120,
    )}`,
  );
};

const setClock = (theme: string, themeData: IThemeData) => {
  const colorData: Record<string, any> = theme === "light" ? themeData.light : themeData.dark;
  const backdark1 = colorData.backDark1Color;
  const backdark2 = colorData.backDark2Color;
  const font2 = colorData.font2;
  const font4 = colorData.font4;
  const accent = colorData.accentColor;
  if (theme === "light") {
    document.documentElement.style.setProperty("--svg-clock", clock(backdark1, backdark2, font2, font4));
  } else {
    document.documentElement.style.setProperty("--svg-clock", clock(backdark1, backdark2, font4, font2));
  }
  document.documentElement.style.setProperty("--svg-hour", hour(accent));
  document.documentElement.style.setProperty("--svg-minute", minute(backdark2, accent));
};

export const setVerticalSizeDetail = (params: {
  height: number;
  contentsPadding: number;
  controlHeight: number;
  topHeight: number;
  filterHeight?: number;
  tabHeight: number;
}) => {
  const { height, contentsPadding, controlHeight, topHeight, filterHeight = 0, tabHeight } = params;

  const contentPaddingNoScroll = contentsPadding - 8; // 8px is scroll size
  const withoutTopHeight = height - topHeight;
  const contentHeight = height - topHeight;
  const fullScreenHeight = height - contentsPadding * 2;
  const heightOuterController = height - controlHeight - filterHeight;
  const contentHeightOuterController = height - topHeight - controlHeight - filterHeight;
  const contentHeightOuterControllerTab = contentHeightOuterController - tabHeight;
  const contentInnerHeightOuterController = contentHeightOuterController - contentsPadding * 2;
  const contentInnerHeightOuterControllerTab = contentInnerHeightOuterController - tabHeight;
  const contentsInnerHeight = contentHeight - controlHeight - filterHeight - contentsPadding;
  const contentsInnerHeightDoublePadding = contentHeight - controlHeight - filterHeight - contentsPadding * 2;
  const contentsInnerHeightNoController = contentHeight - contentsPadding;
  const contentsInnerHeightNoControllerWithPadding = contentHeight - contentsPadding * 2;
  const contentsInnerHeightNoPadding = contentHeight - controlHeight - filterHeight;

  document.documentElement.style.setProperty("--size-height", `${height}px`);
  document.documentElement.style.setProperty("--size-top-height", `${topHeight}px`);
  document.documentElement.style.setProperty("--size-control-height", `${controlHeight}px`);
  document.documentElement.style.setProperty("--size-full-screen-height", `${fullScreenHeight}px`);
  document.documentElement.style.setProperty("--size-height-without-top", `${withoutTopHeight}px`);
  document.documentElement.style.setProperty("--size-content-padding", `${contentsPadding}px`);
  document.documentElement.style.setProperty("--size-layout-tab-height", `${tabHeight}px`);
  document.documentElement.style.setProperty("--size-content-padding-reverse", `-${contentsPadding}px`);
  document.documentElement.style.setProperty("--size-content-padding-no-scroll", `${contentPaddingNoScroll}px`);
  document.documentElement.style.setProperty("--size-height-outer-controller", `${heightOuterController}px`);
  document.documentElement.style.setProperty(
    "--size-content-height-outer-controller",
    `${contentHeightOuterController}px`,
  );
  document.documentElement.style.setProperty("--size-content-height", `${contentHeight}px`);
  document.documentElement.style.setProperty("--size-content-inner-height", `${contentsInnerHeight}px`);
  document.documentElement.style.setProperty(
    "--size-content-inner-height-outer-controller",
    `${contentsInnerHeightDoublePadding}px`,
  );
  document.documentElement.style.setProperty(
    "--size-content-height-outer-controller-tab",
    `${contentHeightOuterControllerTab}px`,
  );
  document.documentElement.style.setProperty(
    "--size-content-inner-height-outer-controller-tab",
    `${contentInnerHeightOuterControllerTab}px`,
  );
  document.documentElement.style.setProperty(
    "--size-content-inner-height-no-controller",
    `${contentsInnerHeightNoController}px`,
  );
  document.documentElement.style.setProperty(
    "--size-content-inner-height-no-controller-with-padding",
    `${contentsInnerHeightNoControllerWithPadding}px`,
  );
  document.documentElement.style.setProperty(
    "--size-content-inner-height-no-padding",
    `${contentsInnerHeightNoPadding}px`,
  );
};

export const resizeVerticalSize = (filterHeight: number) => {
  const style = getComputedStyle(document.documentElement);
  const height = +style.getPropertyValue("--size-height").replace("px", "");
  const contentsPadding = +style.getPropertyValue("--size-content-padding").replace("px", "");
  const controlHeight = +style.getPropertyValue("--size-control-height").replace("px", "");
  const topHeight = +style.getPropertyValue("--size-top-height").replace("px", "");
  const tabHeight = +style.getPropertyValue("--size-card-title-height").replace("px", "");
  document.documentElement.style.setProperty("--size-control-filter-height", `${filterHeight}px`);
  setVerticalSizeDetail({
    height,
    contentsPadding,
    controlHeight,
    topHeight,
    filterHeight,
    tabHeight,
  });
};

export const setVerticalSize = (compact: string, height: number, themeData: IThemeData) => {
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;
  const contentsPadding = sizeData.contentsPadding || 0;
  const controlHeight = sizeData.controlHeight || 0;
  const topHeight = sizeData.topHeight;
  const filterHeight = +getComputedStyle(document.documentElement)
    .getPropertyValue("--size-control-filter-height")
    .replace("px", "");
  const tabHeight = sizeData.cardTitleHeight || 0;

  setVerticalSizeDetail({
    height,
    contentsPadding,
    controlHeight,
    topHeight,
    filterHeight,
    tabHeight,
  });

  // TODO: 아래 2개는 따로 빼야 하지 않을까 싶음...
  const drawerItemHeight = sizeData.drawerItemHeight || 0;
  const drawerWidth = sizeData.drawerWidth || 0;

  document.documentElement.style.setProperty("--size-drawer-item-height", `${drawerItemHeight}px`);
  document.documentElement.style.setProperty("--size-logo-width", `${drawerWidth}px`);
};

export const setHorizontalSize = (
  compact: string,
  width: number,
  drawerWidth: number,
  themeData: IThemeData,
  menuLocation: string,
) => {
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;
  const contentsPadding = sizeData.contentsPadding || 0;
  const paddingDouble = contentsPadding * 2;
  const contentWidth = width - drawerWidth;
  const contentsInnerWidth = contentWidth - paddingDouble;
  const fullScreenWidth = width - paddingDouble;
  document.documentElement.style.setProperty("--size-width", `${width}px`);
  document.documentElement.style.setProperty("--size-drawer-width", `${drawerWidth}px`);
  document.documentElement.style.setProperty("--size-content-width", `${contentWidth}px`);
  document.documentElement.style.setProperty("--size-full-screen-width", `${fullScreenWidth}px`);
  document.documentElement.style.setProperty("--size-content-inner-width", `${contentsInnerWidth}px`);
};

const setFontSize = (compact: string, themeData: IThemeData) => {
  const sizeObject = compact === "normal" ? themeObject.normal : themeObject.compact;
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;

  sizeObject.fontSizeThemeItems.forEach(item => {
    const name = item.name.replace("font", "").toLocaleLowerCase();
    document.documentElement.style.setProperty(`--font-size-${name}`, `${sizeData[item.name]}px`);
  });
};

const setGridSize = (compact: string, themeData: IThemeData) => {
  const sizeObject = compact === "normal" ? themeObject.normal : themeObject.compact;
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;

  sizeObject.gridSizeThemeItem.forEach(item => {
    document.documentElement.style.setProperty(`--size-${kebabCase(item.name)}`, `${sizeData[item.name]}px`);
  });
};

const setCardSize = (compact: string, themeData: IThemeData) => {
  const sizeObject = compact === "normal" ? themeObject.normal : themeObject.compact;
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;

  sizeObject.cardSizeThemeItem.forEach(item => {
    document.documentElement.style.setProperty(`--size-${kebabCase(item.name)}`, `${sizeData[item.name]}px`);
  });
};

const setIconSize = (compact: string, themeData: IThemeData) => {
  const sizeObject = compact === "normal" ? themeObject.normal : themeObject.compact;
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;

  sizeObject.iconSizeThemeItem.forEach(item => {
    document.documentElement.style.setProperty(`--size-${kebabCase(item.name)}`, `${sizeData[item.name]}px`);
  });
};

const setButtonSize = (compact: string, themeData: IThemeData) => {
  const sizeObject = compact === "normal" ? themeObject.normal : themeObject.compact;
  const sizeData = compact === "normal" ? themeData.normal : themeData.compact;

  sizeObject.buttonSizeThemeItem.forEach(item => {
    document.documentElement.style.setProperty(`--size-${kebabCase(item.name)}`, `${sizeData[item.name]}px`);
  });
};

export const setCustomColor = (params: {
  theme: "light" | "dark";
  compact: "normal" | "compact";
  menuLocation: "left" | "top" | "topandleft" | "topandtree";
  width: number;
  height: number;
  drawerWidth: number;
  themeData: IThemeData;
}) => {
  const { theme, compact, menuLocation, width, height, drawerWidth, themeData } = params;
  if (!themeData) return;
  setThemeData(themeData);
  setBorder(themeData);
  setMainColor(theme, themeData);
  setBaseColor(theme, themeData);
  setKebabColor(theme, themeData);
  setStateColor(theme, themeData);
  setFontColor(theme, menuLocation, themeData);
  setClock(theme, themeData);
  setVerticalSize(compact, height, themeData);
  setHorizontalSize(compact, width, drawerWidth, themeData, menuLocation);
  setFontSize(compact, themeData);
  setGridSize(compact, themeData);
  setCardSize(compact, themeData);
  setIconSize(compact, themeData);
  setButtonSize(compact, themeData);
};
