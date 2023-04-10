export type Size = string | number;

export type Direction = "vertical" | "horizontal";

export type TooltipType = "mouse" | "elcenter" | "elside" | "elupdown";

export interface ISize {
  [key: string]: any;
  width: number;
  height: number;
}

// Gantt

export type GanttHeaderType = "Year" | "Quarter" | "Month" | "Week" | "Day" | "Shift" | "Hour" | "Minute";

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

// Data

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

export interface IWidgetTemplate {
  type: string;
  copy: (content: HTMLElement, id: number, data: Record<string, any>) => void;
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

// screenfull

export interface IRawEventNames {
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

// IDE

export interface IIDEParams {
  main: IDEMain;
  menu: IDEMenu;
  status: IDEStatus;
}

// Tree
export interface INodeBase {
  id: string;
  name: string;
  expanded?: boolean;
  icon?: string;
  iconClass?: string;
  activeIcon?: string;
  activeIconClass?: string;
  type?: string;
  info?: any;
}

export interface INode extends INodeBase {
  children?: INode[];
}

export interface IPlatNode extends INodeBase {
  parentId?: string;
}
