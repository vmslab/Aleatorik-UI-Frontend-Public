import IDEMain from "./components/ide/IDEMain";
import IDEMenu from "./components/ide/IDEMenu";
import IDEStatus from "./components/ide/IDEStatus";

import Flow from "./components/flow/Flow";
import FlowClone from "./components/flow/FlowClone";
import FlowMinimap from "./components/flow/FlowMinimap";

import Cell from "./components/gantt/Cell";
import Column from "./components/gantt/GanttColumn";
import GridHeader from "./components/gantt/GridHeader";
import GridBody from "./components/gantt/GridBody";
import GanttHeader from "./components/gantt/GanttHeader";
import GanttBody from "./components/gantt/GanttBody";
import Gantt from "./components/gantt/Gantt";

import Pane from "./components/splitter/Pane";
import Splitter from "./components/splitter/Splitter";

import ScrollBar from "./components/scroll/ScrollBar";

import Chart from "./components/chart/Chart";
import Axis from "./components/chart/Axis";
import Series from "./components/chart/Series";
import Text from "./components/chart/Text";

import Gauge from "./components/gauge/Gauge";
import Bar from "./components/gauge/Bar";
import Arc from "./components/gauge/Arc";
import Mark from "./components/gauge/Mark";

import Graph from "./components/graph/Graph";

import Tree from "./components/tree/Tree";

import ColorPicker from "./components/color/ColorPicker";

import screenfull from "./utils/screenfull";

import ChartData from "./data/ChartData";
import Color from "./data/Color";

import { CommandRegistry } from "@lumino/commands";

import EventBus from "./event/EventBus";

export type ICommandOptions = CommandRegistry.ICommandOptions;
export type { IMenuItem } from "./components/ide/IDEMenu";

export type { IGanttProps } from "./components/gantt/Gantt";

export type { ISplitterProps } from "./components/splitter/Splitter";

export type { IAxisProps, ITooltipParams, IMapData } from "./components/chart/Axis";
export type { IChartProps } from "./components/chart/Chart";
export type { ISeriesProps, IBoxPlotTooltipLabels } from "./components/chart/Series";
export type { ITextProps } from "./components/chart/Text";

export type { IGaugeProps } from "./components/gauge/Gauge";
export type { IBarProps } from "./components/gauge/Bar";
export type { IArcProps } from "./components/gauge/Arc";
export type { IMarkProps } from "./components/gauge/Mark";

export type { IGraphProps } from "./components/graph/Graph";

export type { ITreeProps } from "./components/tree/Tree";

export type { IColorPickerOptions } from "./components/color/ColorPicker";

export { CommandRegistry } from "@lumino/commands";

export { createCamelProps, generateGUID } from "./utils/commonUtil";

export { randomLorem, randomSentence } from "./utils/randomUtil";

export {
  DRAWER_MAX,
  DRAWER_MIN,
  CONTENTS_PADDING,
  TOP_HEIGHT,
  COMPACT_TOP_HEIGHT,
  CONTROL_HEIGHT,
  COMPACT_CONTROL_HEIGHT,
  SIDE_TAB_BAR_WIDTH,
  MENU_HEIGHT,
  STATUS_HEIGHT,
  setCssSizeVariable,
} from "./utils/size";
export {
  calcTextSize,
  getArrSizes,
  getMaxColSize,
  dateRangeToWidth,
  widthToEndDate,
  changeSizeTheme,
} from "./utils/sizeUtil";

export type { IDummyOptions } from "./utils/sizeUtil";

export {
  addTooltipEvent,
  canUseDOM,
  findElement,
  getElementHeight,
  getElementWidth,
  getStyle,
  getTooltipPosition,
  removeAllClass,
  getElementWindow,
  getElementDocument,
  isCollision,
  isOver,
} from "./utils/element";

export { decodeEscapeAtob, encodeUnescapeBtoa } from "./utils/securityUtil";

export {
  colors,
  lightColors,
  getTextColor,
  getContrastKeyColor,
  getKeyColor,
  getLightKeyColor,
  hexToRgb,
  getGanttKeyColor,
  stringToColor,
  stringToColorD3,
  lightenDarkenColor,
  getOpacityColor,
  getThemeColors,
  getMaterialColors,
  getColorByType,
  colorPalletesSet,
  changeColorTheme,
} from "./utils/colorUtil";

export { hexToRgba, rgbaToRgb, calcBrightness, getTextColor2 } from "./utils/hexToRgba";

export { parseChartCsv } from "./utils/chartUtil";

export { parseCsv } from "./utils/csvUtil";

export { MIN_HEIGHT, MIN_WIDTH, setThemeData, getAllThemeItems } from "./utils/themeUtil";
export {
  setCustomColor,
  materialColorIndex,
  setHorizontalSize,
  setVerticalSize,
  resizeVerticalSize,
} from "./utils/themeSet";
export { replaceGenericLight, replaceGenericDark } from "./utils/themeMeta";

export { dayjsRange, DayjsRange } from "@mozart-ui/common";

export type { ElementDefinition, ElementsDefinition, Stylesheet, LayoutOptions } from "cytoscape";

export type {
  Size,
  ISize,
  GanttHeaderType,
  GanttTaskLineType,
  IGanttHeader,
  IGanttRow,
  IGanttTask,
  IGanttMilestone,
  IChartData,
  ChartValue,
  SeriesType,
  IMargin,
  AxisType,
  AxisDataType,
  TextType,
  ShapeType,
  Location,
  Direction,
  Anchor,
  BaseLine,
  Position,
  Aggregation,
  ColorStandard,
  IChartTooltipParams,
  IChartTextParams,
  GaugeType,
  MarkType,
  LabelType,
  IGaugeTooltipParams,
  IThemeItem,
  IThemeData,
  TooltipType,
  CollisionTextType,
  IIDEParams,
  ISchema,
  IField,
} from "./types";

export {
  IDEMain,
  IDEMenu,
  IDEStatus,
  Flow,
  FlowClone,
  FlowMinimap,
  Cell,
  Column,
  GridHeader,
  GridBody,
  GanttHeader,
  GanttBody,
  Gantt,
  Pane,
  Splitter,
  ScrollBar,
  Chart,
  Axis,
  Series,
  Text,
  Gauge,
  Bar,
  Arc,
  Mark,
  Graph,
  Tree,
  ColorPicker,
  screenfull,
  ChartData,
  Color,
};

export { EventBus };
