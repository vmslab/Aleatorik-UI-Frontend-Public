import { IThemeItem } from "../types";

interface IThemeObject {
  common: Record<string, IThemeItem[]>;
  light: Record<string, IThemeItem[]>;
  dark: Record<string, IThemeItem[]>;
  compact: Record<string, IThemeItem[]>;
  normal: Record<string, IThemeItem[]>;
}

export const themeObject: IThemeObject = {
  common: {
    borderThemeItems: [
      {
        name: "borderRadius",
        type: "number",
        defaultValue: 5,
      },
      {
        name: "borderRadiusOuter",
        type: "number",
        defaultValue: 9,
      },
      {
        name: "borderCheckbox",
        type: "number",
        defaultValue: 2,
      },
      {
        name: "scrollbarSize",
        type: "number",
        defaultValue: 8,
      },
      {
        name: "scrollbarRadius",
        type: "number",
        defaultValue: 4,
      },
      {
        name: "scrollbarColor",
        type: "color",
        // defaultValue: "#96969680",
        defaultValue: "#9999994d",
      },
      {
        name: "borderOuter",
        type: "boolean",
        defaultValue: false,
        trueValue: "1px solid var(--color-border3)",
        falseValue: "none",
      },
      {
        name: "borderInner",
        type: "boolean",
        defaultValue: false,
        trueValue: "1px solid var(--color-border2)",
        falseValue: "none",
      },
      {
        name: "shadowTopBar",
        type: "boolean",
        defaultValue: true,
        trueValue: "0 0 6px 0 rgba(0, 0, 0, 0.08)",
        falseValue: "none",
      },
      {
        name: "shadowSideBar",
        type: "boolean",
        defaultValue: true,
        trueValue: "2px 0px 5px rgb(0 0 0 / 20%)",
        falseValue: "none",
      },
    ],
  },
  light: {
    mainColorThemeItems: [
      {
        name: "accentColor",
        type: "color",
        defaultValue: "#00bfc0",
      },
      {
        name: "primaryColor",
        type: "color",
        defaultValue: "#233253",
      },
      {
        name: "secondaryColor",
        type: "color",
        defaultValue: "#0e1e40",
      },
    ],
    baseColorThemeItems: [
      {
        name: "accent1Color",
        type: "color",
        defaultValue: "#e4f7f7",
      },
      {
        name: "accent2Color",
        type: "color",
        defaultValue: "#f4ffff",
      },
      {
        name: "backColor",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "backDark1Color",
        type: "color",
        defaultValue: "#f4f5f7",
      },
      {
        name: "backDark2Color",
        type: "color",
        defaultValue: "#eceef2",
      },
      {
        name: "backDark3Color",
        type: "color",
        defaultValue: "#e1e4ea",
      },
      {
        name: "gridHeaderColor",
        type: "color",
        defaultValue: "#e1e4ea",
      },
      {
        name: "commonHeaderColor",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "emphasizeHeaderColor",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "emphasizeBackColor",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "leftDrawerColor",
        type: "color",
        defaultValue: "#f4f5f7",
      },
      {
        name: "contentBackColor",
        type: "color",
        defaultValue: "#eceef2",
      },
      {
        name: "controlBackColor",
        type: "color",
        defaultValue: "#eceef2",
      },
      {
        name: "leftTopColor",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "leftLogoColor",
        type: "color",
        defaultValue: "#233253",
      },
      {
        name: "font1",
        type: "color",
        defaultValue: "#233253",
      },
      {
        name: "font2",
        type: "color",
        defaultValue: "#424c5f",
      },
      {
        name: "font3",
        type: "color",
        defaultValue: "#565f6e",
      },
      {
        name: "font4",
        type: "color",
        defaultValue: "#7c828e",
      },
      {
        name: "font5",
        type: "color",
        defaultValue: "#999faa",
      },
      {
        name: "font6",
        type: "color",
        defaultValue: "#b4b9c1",
      },
      {
        name: "font7",
        type: "color",
        defaultValue: "#bfc7db",
      },
      {
        name: "fontLightBack",
        type: "color",
        defaultValue: "#222222",
      },
      {
        name: "fontDarkBack",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "border1",
        type: "color",
        defaultValue: "#eceef2",
      },
      {
        name: "border2",
        type: "color",
        defaultValue: "#e1e4ea",
      },
      {
        name: "border3",
        type: "color",
        defaultValue: "#c6ced8",
      },
    ],
    kebabColorThemeItems: [
      {
        name: "font1Reverse",
        type: "color",
        defaultValue: "#dee4ef",
      },
      {
        name: "backReverse",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "iconText",
        type: "color",
        defaultValue: "#828b9a",
      },
      {
        name: "iconBack",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "iconDisableText",
        type: "color",
        defaultValue: "#d0d2db",
      },
      {
        name: "iconDisableBack",
        type: "color",
        defaultValue: "#f5f6f8",
      },
    ],
    stateColorThemeItems: [
      {
        name: "error",
        type: "color",
        defaultValue: "#e05a69",
      },
      {
        name: "info",
        type: "color",
        defaultValue: "#2488eb",
      },
      {
        name: "success",
        type: "color",
        defaultValue: "#00bfc0",
      },
      {
        name: "warning",
        type: "color",
        defaultValue: "#f2af44",
      },
    ],
  },
  dark: {
    mainColorThemeItems: [
      {
        name: "accentColor",
        type: "color",
        defaultValue: "#00bfc0",
      },
      {
        name: "primaryColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "secondaryColor",
        type: "color",
        defaultValue: "#1e2639",
      },
    ],
    baseColorThemeItems: [
      {
        // selected
        name: "accent1Color",
        type: "color",
        defaultValue: "#1d2943",
      },
      {
        // hover
        name: "accent2Color",
        type: "color",
        defaultValue: "#232d43",
      },
      {
        name: "backColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "backDark1Color",
        type: "color",
        defaultValue: "#283043",
      },
      {
        name: "backDark2Color",
        type: "color",
        defaultValue: "#1e2639",
      },
      {
        name: "backDark3Color",
        type: "color",
        defaultValue: "#3a4357",
      },
      {
        name: "gridHeaderColor",
        type: "color",
        defaultValue: "#3a4357",
      },
      {
        name: "commonHeaderColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "emphasizeHeaderColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "emphasizeBackColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "leftDrawerColor",
        type: "color",
        defaultValue: "#283043",
      },
      {
        name: "leftTopColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "logoColor",
        type: "color",
        defaultValue: "#2a3346",
      },
      {
        name: "contentBackColor",
        type: "color",
        defaultValue: "#1e2639",
      },
      {
        name: "controlBackColor",
        type: "color",
        defaultValue: "#1e2639",
      },
      {
        name: "font1",
        type: "color",
        defaultValue: "#dee4ef",
      },
      {
        name: "font2",
        type: "color",
        defaultValue: "#c6cfdb",
      },
      {
        name: "font3",
        type: "color",
        defaultValue: "#a1acbf",
      },
      {
        name: "font4",
        type: "color",
        defaultValue: "#8B96A8",
      },
      {
        name: "font5",
        type: "color",
        defaultValue: "#737c8e",
      },
      {
        name: "font6",
        type: "color",
        defaultValue: "#4c5569",
      },
      {
        name: "font7",
        type: "color",
        defaultValue: "#9ca9c7",
      },
      {
        name: "fontLightBack",
        type: "color",
        defaultValue: "#FFFFFF",
      },
      {
        name: "fontDarkBack",
        type: "color",
        defaultValue: "#A1ACBF",
      },
      {
        name: "border1",
        type: "color",
        defaultValue: "#3a4357",
      },
      {
        name: "border2",
        type: "color",
        defaultValue: "#4c5569",
      },
      {
        name: "border3",
        type: "color",
        defaultValue: "#5f687c",
      },
    ],
    kebabColorThemeItems: [
      {
        name: "font1Reverse",
        type: "color",
        defaultValue: "#233253",
      },
      {
        name: "backReverse",
        type: "color",
        defaultValue: "#ffffff",
      },
      {
        name: "iconText",
        type: "color",
        defaultValue: "#828b9a",
      },
      {
        name: "iconBack",
        type: "color",
        defaultValue: "#3a4357",
      },
      {
        name: "iconDisableText",
        type: "color",
        defaultValue: "#3c4558",
      },
      {
        name: "iconDisableBack",
        type: "color",
        defaultValue: "#2a3346",
      },
    ],
    stateColorThemeItems: [
      {
        name: "error",
        type: "color",
        defaultValue: "#e05a69",
      },
      {
        name: "info",
        type: "color",
        defaultValue: "#2488eb",
      },
      {
        name: "success",
        type: "color",
        defaultValue: "#00bfc0",
      },
      {
        name: "warning",
        type: "color",
        defaultValue: "#f2af44",
      },
    ],
  },
  normal: {
    mainSizeThemeItems: [
      {
        name: "contentsPadding",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "topHeight",
        type: "number",
        defaultValue: 60,
      },
      {
        name: "controlHeight",
        type: "number",
        defaultValue: 60,
      },
      {
        name: "drawerItemHeight",
        type: "number",
        defaultValue: 32,
      },
      {
        name: "drawerWidth",
        type: "number",
        defaultValue: 200,
      },
    ],
    fontSizeThemeItems: [
      {
        name: "fontHeading01",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "fontHeading02",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "fontHeading03",
        type: "number",
        defaultValue: 17,
      },
      {
        name: "fontHeading04",
        type: "number",
        defaultValue: 16,
      },
      {
        name: "fontBody01",
        type: "number",
        defaultValue: 15,
      },
      {
        name: "fontBody02",
        type: "number",
        defaultValue: 14,
      },
      {
        name: "fontBody03",
        type: "number",
        defaultValue: 13,
      },
      {
        name: "fontBody04",
        type: "number",
        defaultValue: 12,
      },
      {
        name: "fontButton01",
        type: "number",
        defaultValue: 12,
      },
    ],
    gridSizeThemeItem: [
      {
        name: "gridRowHeight",
        type: "number",
        defaultValue: 40,
      },
      {
        name: "gridHeaderHeight",
        type: "number",
        defaultValue: 50,
      },
      {
        name: "gridFilterHeight",
        type: "number",
        defaultValue: 40,
      },
      {
        name: "gridToolbarHeight",
        type: "number",
        defaultValue: 60,
      },
      {
        name: "cellPadding",
        type: "number",
        defaultValue: 8,
      },
      {
        name: "gridDashboardHeight",
        type: "number",
        defaultValue: 40,
      },
    ],
    cardSizeThemeItem: [
      {
        name: "cardTitleHeight",
        type: "number",
        defaultValue: 55,
      },
      {
        name: "cardTitleWidgetHeight",
        type: "number",
        defaultValue: 34,
      },
      {
        name: "cardTitleLeftPadding",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "cardTopPadding",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "cardRblPadding",
        type: "number",
        defaultValue: 32,
      },
    ],
    iconSizeThemeItem: [
      {
        name: "iconButton",
        type: "number",
        defaultValue: 30,
      },
      {
        name: "iconFontSize",
        type: "number",
        defaultValue: 19,
      },
      {
        name: "iconControllerFontSize",
        type: "number",
        defaultValue: 22,
      },
      {
        name: "iconTopApp",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "iconTitle",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "iconItem",
        type: "number",
        defaultValue: 20,
      },
    ],
    buttonSizeThemeItem: [
      {
        name: "buttonTopApp",
        type: "number",
        defaultValue: 40,
      },
      {
        name: "buttonControlSize",
        type: "number",
        defaultValue: 32,
      },
      {
        name: "buttonHeight",
        type: "number",
        defaultValue: 30,
      },
      {
        name: "buttonWidth",
        type: "number",
        defaultValue: 86,
      },
      {
        name: "inputHeight",
        type: "number",
        defaultValue: 34,
      },
      {
        name: "inputMargin",
        type: "number",
        defaultValue: 12,
      },
      {
        name: "checkbox",
        type: "number",
        defaultValue: 16,
      },
      {
        name: "checkboxColWidth",
        type: "number",
        defaultValue: 42,
      },
    ],
  },
  compact: {
    mainSizeThemeItems: [
      {
        name: "contentsPadding",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "topHeight",
        type: "number",
        defaultValue: 52,
      },
      {
        name: "controlHeight",
        type: "number",
        defaultValue: 52,
      },
      {
        name: "drawerItemHeight",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "drawerWidth",
        type: "number",
        defaultValue: 200,
      },
    ],
    fontSizeThemeItems: [
      {
        name: "fontHeading01",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "fontHeading02",
        type: "number",
        defaultValue: 17,
      },
      {
        name: "fontHeading03",
        type: "number",
        defaultValue: 16,
      },
      {
        name: "fontHeading04",
        type: "number",
        defaultValue: 13,
      },
      {
        name: "fontBody01",
        type: "number",
        defaultValue: 13,
      },
      {
        name: "fontBody02",
        type: "number",
        defaultValue: 12,
      },
      {
        name: "fontBody03",
        type: "number",
        defaultValue: 11,
      },
      {
        name: "fontBody04",
        type: "number",
        defaultValue: 11,
      },
      {
        name: "fontButton01",
        type: "number",
        defaultValue: 11,
      },
    ],
    gridSizeThemeItem: [
      {
        name: "gridRowHeight",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "gridHeaderHeight",
        type: "number",
        defaultValue: 40,
      },
      {
        name: "gridFilterHeight",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "gridToolbarHeight",
        type: "number",
        defaultValue: 52,
      },
      {
        name: "cellPadding",
        type: "number",
        defaultValue: 4,
      },
      {
        name: "gridDashboardHeight",
        type: "number",
        defaultValue: 40,
      },
    ],
    cardSizeThemeItem: [
      {
        name: "cardTitleHeight",
        type: "number",
        defaultValue: 36,
      },
      {
        name: "cardTitleWidgetHeight",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "cardTitleLeftPadding",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "cardTopPadding",
        type: "number",
        defaultValue: 16,
      },
      {
        name: "cardRblPadding",
        type: "number",
        defaultValue: 24,
      },
    ],
    iconSizeThemeItem: [
      {
        name: "iconButton",
        type: "number",
        defaultValue: 20,
      },
      {
        name: "iconFontSize",
        type: "number",
        defaultValue: 15,
      },
      {
        name: "iconControllerFontSize",
        type: "number",
        defaultValue: 16,
      },
      {
        name: "iconTopApp",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "iconTitle",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "iconItem",
        type: "number",
        defaultValue: 20,
      },
    ],
    buttonSizeThemeItem: [
      {
        name: "buttonTopApp",
        type: "number",
        defaultValue: 30,
      },
      {
        name: "buttonControlSize",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "buttonHeight",
        type: "number",
        defaultValue: 24,
      },
      {
        name: "buttonWidth",
        type: "number",
        defaultValue: 76,
      },
      {
        name: "inputHeight",
        type: "number",
        defaultValue: 28,
      },
      {
        name: "inputMargin",
        type: "number",
        defaultValue: 8,
      },
      {
        name: "checkbox",
        type: "number",
        defaultValue: 14,
      },
      {
        name: "checkboxColWidth",
        type: "number",
        defaultValue: 42,
      },
    ],
  },
};
