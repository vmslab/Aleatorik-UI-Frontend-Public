import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue, { VNode } from "vue";

import Controller from "./components/Controller.vue";
import Calendar from "./components/Calendar.vue";
import ExcelUploadPopup from "./components/ExcelUploadPopup.vue";
import ExcelAdvancedUploadPopup from "./components/ExcelAdvancedUploadPopup.vue";
import FilterControl from "./components/FilterControl.vue";
import Chart from "./components/chart/Chart.vue";
import Axis from "./components/chart/Axis.vue";
import Series from "./components/chart/Series.vue";
import Text from "./components/chart/Text.vue";
import Gauge from "./components/gauge/Gauge.vue";
import Arc from "./components/gauge/Arc.vue";
import Bar from "./components/gauge/Bar.vue";
import Mark from "./components/gauge/Mark.vue";
import Graph from "./components/graph/Graph.vue";
import SplitBox from "./components/Layout/SplitBox.vue";
import Lottie from "./components/Lottie.vue";
import FileManager from "./components/file/FileManager.vue";
import ColorPicker from "./components/color/ColorPicker.vue";
import CustomForm from "./components/form/CustomForm.vue";
import CustomFormItem from "./components/form/CustomFormItem.vue";
import Gantt from "./components/gantt/Gantt.vue";
import Modeller from "./components/modeller/Modeller.vue";
import Focus from "./directives/Focus";
import Tooltip from "./directives/Tooltip";
import GridTooltip from "./directives/GridTooltip";
import GridMerge from "./directives/GridMerge";
import GridCellTooltip from "./directives/GridCellTooltip";
import ExtendGrid from "./components/grid/ExtendGrid";
import ExtendGridContextMenu from "./components/grid/ExtendGridContextMenu";
import CustomMergeManager from "./components/grid/CustomMergeManager";
import RestVirtualCollectionView from "./components/grid/RestVirtualCollectionView";

// import "@/styles/index.scss";

const MozartElements = {
  install(vue: typeof Vue): void {
    vue.component("moz-controller", Controller);
    vue.component("moz-calendar", Calendar);
    vue.component("moz-excel-uploader", ExcelUploadPopup);
    vue.component("moz-filter-control", FilterControl);
    // Chart
    vue.component("moz-chart", Chart);
    vue.component("moz-axis", Axis);
    vue.component("moz-series", Series);
    vue.component("moz-text", Text);

    // Gauge
    vue.component("moz-gauge", Gauge);
    vue.component("moz-arc", Arc);
    vue.component("moz-bar", Bar);
    vue.component("moz-mark", Mark);

    // Graph
    vue.component("moz-graph", Graph);

    // Layout
    vue.component("moz-split-box", SplitBox);

    // Lottie
    vue.component("moz-lottie", Lottie);

    // FileManager
    vue.component("moz-file-manager", FileManager);

    // Color
    vue.component("moz-color-picker", ColorPicker);

    // Form
    vue.component("moz-custom-form", CustomForm);
    vue.component("moz-custom-form-item", CustomFormItem);
    // Gantt
    vue.component("moz-gantt", Gantt);

    // Modeller
    vue.component("moz-modeller", Modeller);

    vue.directive("focus", Focus);
    vue.directive("tooltip", Tooltip);
    vue.directive("grid-tooltip", GridTooltip);
    vue.directive("grid-merge", GridMerge);
    vue.directive("cell-tooltip", GridCellTooltip);
  },
};

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.use(MozartElements, {});
}

export { getCboItems } from "./utils/commonUtil";

export { makeParams, setParams } from "./utils/settingUtil";
export { addData } from "./utils/gridUtil";
export { EncryptAES, GetRSAKey, DecryptAES } from "./utils/cryptoUtil";

export {
  Controller,
  Calendar,
  ExcelUploadPopup,
  ExcelAdvancedUploadPopup,
  FilterControl,
  Chart,
  Axis,
  Series,
  Text,
  Gauge,
  Arc,
  Bar,
  Mark,
  Graph,
  SplitBox,
  Lottie,
  FileManager,
  ColorPicker,
  CustomForm,
  CustomFormItem,
  Gantt,
  Modeller,
  Focus,
  Tooltip,
  GridTooltip,
  GridMerge,
  GridCellTooltip,
  ExtendGrid,
  ExtendGridContextMenu,
  CustomMergeManager,
  RestVirtualCollectionView,
};

export { Stores } from "./store/stores";

export type {
  IBaseState,
  IComboItem,
  IComboParams,
  IEditParams,
  IInputOption,
} from "./store/modules/baseStore";

export { BaseStore } from "./store/modules/baseStore";

export type { ActionLoadOptions } from "./utils/dataSource";
export { createStoreConfig } from "./utils/dataSource";

export { showAlert, showConfirm, getDialogText } from "./utils/dialogUtil";
export type {
  DataMode,
  ValidateMode,
  TooltipMode,
  ILayoutStorage,
  ILoadingMode,
  ISnackBarParams,
} from "./components/grid/ExtendGrid";
export { DataOptions, GridOptions } from "./components/grid/ExtendGrid";
export type { IMenuItem, IMenuItemEventArgs } from "./components/grid/ExtendGridContextMenu";
export { ContextMenuProps } from "./components/grid/ExtendGridContextMenu";

export default MozartElements;
