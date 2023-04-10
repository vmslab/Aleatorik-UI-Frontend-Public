import { IThemeData } from "../types";
import { hexToRgb } from "./colorUtil";

const accentColorKeys: string[] = [
  "$base-accent",
  "$button-group-default-selected-bg",
  "$button-default-border-color",
  "$datagrid-drag-header-border-color",
  "$datagrid-cell-modified-border-color",
  "$scheduler-time-indicator-color",
  "$scheduler-workspace-focused-cell-color",
  "$scheduler-appointment-start-color",
  "$filterbuilder-group-operation-color",
  "$filterbuilder-item-field-color",
  "$filterbuilder-item-operator-color",
  "$datagrid-link-color",
  "$badge-bg",
];

const selectedColorKeys: string[] = [
  "$pager-page-selected-bg",
  "$datagrid-selection-bg",
  "$datagrid-search-color",
  "$datagrid-row-focused-bg",
  "$base-focus-bg",
  "$datagrid-search-bg",
];

const hoverColorKeys: string[] = ["$datagrid-hover-bg", "$base-hover-bg"];

export const replaceGenericLight = async function (customTheme: IThemeData, genericLight: any) {
  genericLight.items.forEach((t: any) => {
    /* Accent */
    if (accentColorKeys.findIndex(a => a === t.key) > -1) {
      const rgb = hexToRgb(customTheme.light.accentColor);
      if (!rgb) return;
      t.value = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    }
    if (selectedColorKeys.findIndex(a => a === t.key) > -1) {
      const rgb = hexToRgb(customTheme.light.accentColor);
      if (!rgb) return;
      t.value = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)`;
    }
    if (hoverColorKeys.findIndex(a => a === t.key) > -1) {
      const rgb = hexToRgb(customTheme.light.accentColor);
      if (!rgb) return;
      t.value = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`;
    }
    if (t.key === "$base-border-radius") {
      t.value = customTheme.common.borderRadius;
    }
  });

  return genericLight;
};

export const replaceGenericDark = async function (customTheme: IThemeData, genericDark: any) {
  genericDark.items.forEach((t: any) => {
    if (accentColorKeys.findIndex(a => a === t.key) > -1) {
      const rgb = hexToRgb(customTheme.dark.accentColor);
      if (!rgb) return;
      t.value = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
    }
    if (t.key === "$base-border-radius") {
      t.value = customTheme.common.borderRadius;
    }
  });

  return genericDark;
};
