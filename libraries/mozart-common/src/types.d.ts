import { AggType, OrderType, ValueType, WhereType, SizeType, RepeatType } from "./enums";

export type Size = string | number;

export type Direction = "vertical" | "horizontal";

export type TooltipType = "mouse" | "elcenter" | "elside" | "elupdown";

export interface ISize {
  [key: string]: any;
  width: number;
  height: number;
}

export interface IPoint {
  [key: string]: any;
  x: number;
  y: number;
}

export interface IKeyValue {
  [key: string]: any;
  Key?: string;
  Value?: string;
  IsUndelete?: boolean;
}

export interface IProperty {
  readonly [index: string]: any;
  name: string;
  optional: boolean;
  type: string;
  key: boolean;
  input: string;
  hide: boolean;
  edit: boolean;
  guid: boolean;
  sort: string;
  cbotype?: string;
  cboitems?: string[];
  cboentity?: string;
  cbopropkey?: string;
  cbopropname?: string;
  cbowhereprop?: string;
  cbowherevalue?: any;
}

export interface IValueInput {
  [key: string]: any;
  value: string;
  type: ValueType;
}

export interface IWhereInput {
  [key: string]: any;
  key: string; // column name
  type: WhereType;
  not: boolean; // true => not (type)
  value?: IValueInput;
}

export interface IOrderInput {
  [key: string]: any;
  key: string;
  type: OrderType;
}

export interface IAggInput {
  [key: string]: any;
  key: string; // column name
  type: AggType;
}

export interface IFindOptionInput {
  [key: string]: any;
  selects?: string[];
  distinct?: boolean;
  wheres?: IWhereInput[];
  orders?: IOrderInput[];
  groups?: string[];
  aggs?: IAggInput[];
  skip?: number;
  take?: number;
}

// Chart

export type ChartValue = string | number | Date;

export type SeriesType = "bar" | "line" | "box-plot" | "pie" | "stack" | "area" | "agg-line";

export type ColorStandard = "series" | "axis" | "one";

export type AxisType =
  | "key"
  | "series"
  | "series-aggregation"
  | "series-aggregation-accumulate"
  | "series-aggregation-minmax";

export type AxisDataType = "string" | "number" | "Date";

export type TextType = "text" | "legend" | "label" | "total" | "html";

export type ShapeType = "circle" | "ractangle" | "series" | "square";

export type Aggregation =
  | "count"
  | "sum"
  | "min"
  | "max"
  | "avg"
  | "median"
  | "deviation"
  | "variance"
  | "quantileThree"
  | "quantileOne";

export type Location = "top" | "right" | "bottom" | "left" | "center";

export type Position = "start" | "middle" | "end";

// hanging = top, ideographic = bottom, middle = central
export type BaseLine = "hanging" | "ideographic" | "central";

export type Anchor = "start" | "middle" | "end";

export type CollisionTextType = "back" | "series";

export interface IChartData {
  [key: string]: any;
  key: ChartValue;
}

export interface INonNullMargin {
  [key: string]: any;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface IMargin {
  [key: string]: any;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface IChartValue {
  idx: number;
  keyData: ChartValue;
  valueData: number;
  valueField: string;
  outlier?: boolean;
  highlight?: boolean;
}

export interface IChartAggregation {
  valueData: number;
  valueField: string;
}

export interface IChartTooltipParams {
  type: "key" | "value";
  key: ChartValue;
  text: ChartValue;
  numberFormat?: (value: number, percent?: boolean) => string;
}

export interface IChartTextParams {
  value: ChartValue;
  numberFormat?: (value: number, percent?: boolean) => string;
}

// Gauge

export type GaugeType = "bar" | "arc";

export type MarkType = "mark" | "tick";

export type LabelType = "start" | "middle" | "end" | "inner" | "outer";

export interface IGaugeTooltipParams {
  items: Array<{
    type: string;
    key: string;
    value: string;
    color: string;
  }>;
}

// Flow Chart

export interface ICluster {
  [key: string]: any;
  key: string;
  text: string;
  clusterLabelPos: string;
  tooltip?: string;
  fillColor?: string;
  item?: Record<string, any>;
}

export interface INode {
  [key: string]: any;
  key: string;
  text: string;
  tooltip?: string;
  fillColor?: string;
  item?: Record<string, any>;
  cluster: ICluster;
}

export interface IEdge {
  [key: string]: any;
  source: string;
  target: string;
}

export interface ILayoutBox {
  [key: string]: any;
  type: SizeType;
  size: number;
  minWidth?: number;
  minHeight?: number;
  scroll?: boolean;
  auto?: boolean;
}

export interface IMenuItem {
  [key: string]: any;
  name: string;
  caption?: string;
  hide?: boolean;
  disabled?: boolean;
  action?: (menu: IMenuItem) => void;
  checked?: boolean;
  icon?: string;
  subMenu?: IMenuItem[];
  tooltip?: string;
}

export interface ICalendarEvent {
  title?: string;
  start: string;
  end: string;
  repeat: RepeatType;
  tooltip?: string;
  backgroundColor?: string;
}

export interface IFilterState {
  type: string;
  name: string;
  data?: any;
  value?: any;
}

// Gantt

export type GanttHeaderType =
  | "Year"
  | "Quarter"
  | "Month"
  | "Week"
  | "Day"
  | "Shift"
  | "Hour"
  | "Minute";

export type GanttTaskLineType = "last" | "first" | number;

export interface IGanttHeader {
  [key: string]: any;
  type: GanttHeaderType;
  format?: string;
}

export interface IGanttTask {
  [key: string]: any;
  id: string;
  key: string;
  text: string;
  item: Record<string, any>;
  startTime: Date;
  endTime: Date;
  level: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  tooltip?: HTMLElement | string;
}

export interface IGanttMilestone {
  [key: string]: any;
  id: string;
  key: string;
  item: Record<string, any>;
  time: Date;
  level: number;
  backgroundColor?: string;
  borderColor?: string;
  tooltip?: HTMLElement | string;
}

export interface IGanttLinkData {
  [key: string]: any;
  fromIdx: number;
  toIdx: number;
  fromTop: number;
  toTop: number;
  fromTime?: Date;
  toTime?: Date;
  fromIsMilestone?: boolean;
  toIsMilestone?: boolean;
  color?: string;
  size?: string;
  dash?: string;
}

export interface IGanttLink {
  from: string;
  to: string;
  color?: string;
  size?: string;
  dash?: string;
}

export interface IGanttRow {
  [key: string]: any;
  maxLevel?: number;
  tasks?: IGanttTask[];
  milestones?: IGanttMilestone[];
  links?: IGanttLink[];
}

// Excel

export interface IExcelExport {
  [key: string]: any;
  fileName?: string;
  sheetName?: string;
  data: any[];
}

// Theme

export interface IThemeItem {
  name: string;
  type: string;
  defaultValue: any;
  trueValue?: any;
  falseValue?: any;
}

export interface IThemeData {
  common: Record<string, any>;
  light: Record<string, any>;
  dark: Record<string, any>;
  compact: Record<string, any>;
  normal: Record<string, any>;
}

// Flow

export interface IFlowNodeTemplate {
  name: string;
  copy: (content: HTMLElement, id: number, data: Record<string, any>, module: string) => void;
}

export interface IFlowNode {
  class: string;
  data: Record<string, any>;
  html: string;
  id: number;
  inputs: Record<string, IFlowConnection>;
  name: string;
  outputs: Record<string, IFlowConnection>;
  posX: number;
  posY: number;
  typenode: boolean;
}

export interface IFlowModule {
  name: string;
  data: Record<number, IFlowNode>;
  info: Record<string, any>;
  selected: boolean;
}

export interface IFlowWrapper {
  flow: Record<string, IFlowModule>;
}

export interface IFlowConnection {
  connections: IFlowConnectionDetail[];
}

export interface IFlowConnectionDetail {
  input?: string;
  output?: string;
  node: number;
  points: IFlowPoint[];
}

export interface IFlowPoint {
  posX: number;
  posY: number;
}

export interface IFlowEventListener {
  listeners: Function[];
}

export type FlowEditorMode = "edit" | "fixed" | "view";

// Modeller

export interface IConnectionInfo {
  ID: string;
  Name: string;
  DBType: string;
  DataSource: string;
  UserID?: string;
  Password?: string;
  Database?: string;
  Diagram?: string;
  Tables?: ITableDef[];
}

export interface IEntityDef {
  ID: string;
  Name: string;
  TableName?: string;
}

export interface IEntityPropDef {
  ID: string;
  Name: string;
  ColumnName?: string;
  EntityName: string;
  Type: string;
  Size?: number;
  PrimaryKey?: boolean;
  Nullable?: boolean;
}

export interface ISqlDef {
  ID: string;
  Name: string;
  Contents: string;
  Params: ISqlParam[];
}

export interface ISqlParam {
  Name: string;
  Type: string;
}

export interface IField {
  columnName: string;
  columnType: string;
  dbName: string;
  tblName: string;
  commentName: string;
}

export interface ITable {
  tblName: string;
  tblComment?: string;
  tableColumns: IField[];
}

export interface ISchema {
  dbName: string;
  tables: ITable[];
}

export interface ITableDef {
  Schema: string;
  Name: string;
  Columns: IColumnDef[];
}

export interface IColumnDef {
  Name: string;
  Type: string;
}

export interface ITableNameAndAlias {
  tableName: string;
  tableAlias: string;
}

// File
export type FileState = "Add" | "Edit" | "Remove" | "UNRECOGNIZED";

// screenfull

export interface IRawEventNames {
  [key: string]: any;
  readonly requestFullscreen: string;
  readonly exitFullscreen: string;
  readonly fullscreenElement: string;
  readonly fullscreenEnabled: string;
  readonly fullscreenchange: string;
  readonly fullscreenerror: string;
}

export type EventName = "change" | "error";

export interface IFullScreenOptions {
  callback?: Function;
  fullscreenClass?: string;
  pageOnly?: boolean;
  teleport?: boolean;
  fullscreenOptions?: FullscreenOptions;
}

export interface IFullScreenStyle {
  position: string;
  left: string;
  top: string;
  width: string;
  height: string;
}
