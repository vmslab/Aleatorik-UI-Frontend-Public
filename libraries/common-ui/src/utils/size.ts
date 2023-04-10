export const DRAWER_MIN = 70;
export const DRAWER_MAX = 256;
export const CONTENTS_PADDING = 20;
export const TOP_HEIGHT = 66;
export const COMPACT_TOP_HEIGHT = 52;
export const CONTROL_HEIGHT = 66;
export const COMPACT_CONTROL_HEIGHT = 44;

// dev
export const SIDE_TAB_BAR_WIDTH = 48;
export const MENU_HEIGHT = 26;
export const STATUS_HEIGHT = 22;

export const setCssSizeVariable = (params: {
  width: number;
  height: number;
  contentsPadding: number;
  drawerWidth: number;
  topHeight: number;
  controlHeight: number;
  sideTabBarWidth: number;
  menuHeight: number;
  statusHeight: number;
}) => {
  const {
    width,
    height,
    contentsPadding,
    drawerWidth,
    topHeight,
    controlHeight,
    sideTabBarWidth,
    menuHeight,
    statusHeight,
  } = params;
  const contentPaddingNoScroll = contentsPadding - 8; // 8px is scroll size
  const withoutTopHeight = height - topHeight;
  const paddingDouble = contentsPadding * 2;
  const contentHeight = height - topHeight;
  const contentWidth = width - drawerWidth;
  const contentsInnerHeight = contentHeight - controlHeight - contentsPadding;
  const contentsInnerWidth = contentWidth - paddingDouble;
  const contentsInnerHeightNoPadding = contentHeight - controlHeight;

  // dev
  const shellHeight = height - menuHeight - statusHeight;

  document.documentElement.style.setProperty("--size-width", `${width}px`);
  document.documentElement.style.setProperty("--size-height", `${height}px`);
  document.documentElement.style.setProperty("--size-top-height", `${topHeight}px`);
  document.documentElement.style.setProperty("--size-control-height", `${controlHeight}px`);
  document.documentElement.style.setProperty("--size-drawer-width", `${drawerWidth}px`);
  document.documentElement.style.setProperty("--size-height-without-top", `${withoutTopHeight}px`);
  document.documentElement.style.setProperty("--size-content-padding", `${contentsPadding}px`);
  document.documentElement.style.setProperty("--size-content-padding-reverse", `-${contentsPadding}px`);
  document.documentElement.style.setProperty("--size-content-padding-no-scroll", `${contentPaddingNoScroll}px`);
  document.documentElement.style.setProperty("--size-content-height", `${contentHeight}px`);
  document.documentElement.style.setProperty("--size-content-width", `${contentWidth}px`);
  document.documentElement.style.setProperty("--size-content-inner-height", `${contentsInnerHeight}px`);
  document.documentElement.style.setProperty("--size-content-inner-width", `${contentsInnerWidth}px`);
  document.documentElement.style.setProperty(
    "--size-content-inner-height-no-padding",
    `${contentsInnerHeightNoPadding}px`,
  );

  // dev
  document.documentElement.style.setProperty("--size-side-tab-bar-width", `${sideTabBarWidth}px`);
  document.documentElement.style.setProperty("--size-menu-height", `${menuHeight}px`);
  document.documentElement.style.setProperty("--size-status-height", `${statusHeight}px`);
  document.documentElement.style.setProperty("--size-shell-height", `${shellHeight}px`);
};
