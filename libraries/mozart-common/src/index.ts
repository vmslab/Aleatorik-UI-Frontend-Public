import FilterState from "./data/FilterState";
import CalendarEvent from "./data/CalendarEvent";
import LayoutBox from "./data/LayoutBox";
import MenuItem from "./data/MenuItem";
import FileSystem from "./data/FileSystem";
import EventBus from "./event/EventBus";

export { ChartData, Chart, Axis, Series, Text } from "@aleatorik-ui/common-ui";
export type {
  IAxisProps,
  ITooltipParams,
  IMapData,
  IChartProps,
  ISeriesProps,
  IBoxPlotTooltipLabels,
  ITextProps,
} from "@aleatorik-ui/common-ui";

export { Gauge, Bar, Arc, Mark } from "@aleatorik-ui/common-ui";
export type { IGaugeProps, IBarProps, IArcProps, IMarkProps } from "@aleatorik-ui/common-ui";

export {
  Cell,
  Column,
  GridHeader,
  GridBody,
  GanttHeader,
  GanttBody,
  Gantt,
} from "@aleatorik-ui/common-ui";

export type { IGanttProps } from "@aleatorik-ui/common-ui";

export { Pane, Splitter } from "@aleatorik-ui/common-ui";

export { ScrollBar } from "@aleatorik-ui/common-ui";

export { Flow, FlowClone, FlowMinimap } from "@aleatorik-ui/common-ui";

import Editor from "./components/Editor/Editor";

import Graph from "./components/Graph/Graph";

import Snippets from "./components/SQL/Snippets";

import dedent from "./utils/dedent";

export type { IFileInfo } from "./data/FileSystem";

export { AggType, OrderType, SizeType, ValueType, WhereType, RepeatType } from "./enums";

export type { IGraphProps, IToolbarBtn } from "./components/Graph/Graph";

export type {
  Size,
  ISize,
  Direction,
  IChartData,
  ChartValue,
  SeriesType,
  IMargin,
  AxisType,
  AxisDataType,
  TextType,
  ShapeType,
  Location,
  Anchor,
  BaseLine,
  Position,
  Aggregation,
  ColorStandard,
  IChartTooltipParams,
  IChartTextParams,
  TooltipType,
  CollisionTextType,
  GaugeType,
  MarkType,
  LabelType,
  IGaugeTooltipParams,
  IGanttTask,
  IGanttMilestone,
  IGanttHeader,
  IGanttRow,
  GanttHeaderType,
  GanttTaskLineType,
} from "@aleatorik-ui/common-ui";

export type {
  IKeyValue,
  IPoint,
  IProperty,
  IAggInput,
  IFindOptionInput,
  ILayoutBox,
  IOrderInput,
  IValueInput,
  IWhereInput,
  ICalendarEvent,
  IFilterState,
  INode,
  ICluster,
  IEdge,
  IMenuItem,
  IExcelExport,
  IThemeItem,
  IThemeData,
  IFlowNodeTemplate,
  IFlowNode,
  IFlowModule,
  IFlowWrapper,
  IFlowConnection,
  IFlowConnectionDetail,
  IFlowPoint,
  IFlowEventListener,
  FlowEditorMode,
  IConnectionInfo,
  IEntityDef,
  IEntityPropDef,
  ISqlDef,
  ISqlParam,
  IField,
  ITable,
  ISchema,
  ITableDef,
  IColumnDef,
  ITableNameAndAlias,
  FileState,
} from "./types";

export type { ITypeValue } from "./utils/commonUtil";

export {
  generateGUID,
  getStringToTypeValue,
  getStringToValue,
  isNull,
  setFocus,
  kebabCaseWithoutNumber,
  decodeEscapeAtob,
  encodeUnescapeBtoa,
  clamp,
  createCamelProps,
} from "./utils/commonUtil";

export {
  DateTimeMax,
  DateTimeMin,
  IsDateTimeMax,
  IsDateTimeMin,
  ConvertToMoment,
  ConvertToDateTime,
  ConvertToDateTimeString,
  GetWeeks,
  GetMonths,
  GetDates,
  durationToTicks,
  ticksToString,
  ticksToDuration,
} from "./utils/dateUtil";

export type { IDateItem } from "./utils/dateUtil";

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
} from "@aleatorik-ui/common-ui";
export { addTooltipEventNode } from "./utils/graphUtil";

export { enumToArray } from "./utils/enumUtil";
export { convertFilterToWhere } from "./utils/filterUtil";
export type { IDummyOptions } from "@aleatorik-ui/common-ui";
export {
  calcTextSize,
  getArrSizes,
  getMaxColSize,
  dateRangeToWidth,
  widthToEndDate,
  changeSizeTheme,
} from "@aleatorik-ui/common-ui";
export { copy, instancing } from "./utils/objectUtil";
export { parseCsv } from "./utils/csvUtil";
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
} from "@aleatorik-ui/common-ui";
export { hexToRgba, rgbaToRgb, calcBrightness, getTextColor2 } from "@aleatorik-ui/common-ui";
export { parseLink } from "./utils/regexUtil";
export { formatSizeUnits } from "./utils/fileUtil";
export { dayjsRange, DayjsRange } from "@aleatorik-ui/common-ui";

export { MIN_WIDTH, MIN_HEIGHT, setThemeData, getAllThemeItems } from "@aleatorik-ui/common-ui";
export {
  setCustomColor,
  materialColorIndex,
  setHorizontalSize,
  setVerticalSize,
  resizeVerticalSize,
} from "@aleatorik-ui/common-ui";
export { replaceGenericLight, replaceGenericDark } from "@aleatorik-ui/common-ui";

export type { ElementDefinition, ElementsDefinition, Stylesheet, LayoutOptions } from "cytoscape";

export {
  FilterState,
  CalendarEvent,
  LayoutBox,
  MenuItem,
  FileSystem,
  EventBus,
  dedent,
  Editor,
  Graph,
  Snippets,
};
