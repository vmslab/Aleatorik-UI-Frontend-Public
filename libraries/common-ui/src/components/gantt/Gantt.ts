import { throttle } from "lodash";
import { DayjsRange } from "@aleatorik-ui/common";
import { GanttHeaderType, GanttTaskLineType, IGanttHeader, IGanttRow, IGanttTask, IGanttMilestone } from "../../types";
import { calcRowCount } from "../../utils/ganttUtil";
import { widthToEndDate } from "../../utils/sizeUtil";
import Column from "./GanttColumn";
import GridHeader from "./GridHeader";
import GridBody from "./GridBody";
import GanttHeader from "./GanttHeader";
import GanttBody from "./GanttBody";
import Pane from "../splitter/Pane";
import Splitter from "../splitter/Splitter";
import ScrollBar from "../scroll/ScrollBar";
import GanttColumn from "./GanttColumn";

export interface IGanttProps {
  columns: Column[];
  getRows: (currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) => void;
  minDate: Date;
  maxDate: Date;
  rowHeight?: number;
  headerRowHeight?: number;
  taskHeight?: number;
  ganttHeaders: IGanttHeader[];
  ganttTaskLine?: GanttTaskLineType;
  ganttWidthRate?: number;
  resizeColumn?: boolean;
  dataRefreshTrottleTime?: number;
  dataRefreshResponsiveness?: number;
  bufferPageSize?: number;
  shiftHours?: number[];
  dayStartTime?: number;
  emptyRanges?: DayjsRange[];
  isStringColor?: boolean;
  isEndPosition?: boolean;
  selectedColor?: string;
  scrollAutoHide?: boolean;
  scrollClickOnTrack?: boolean;
  scrollClickOnTrackSpeed?: number;
  classList?: string[];
  styleObject?: object;
  setHighlightTask?: (task: IGanttTask) => boolean;
  setGanttHeaderText?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string;
  setGanttHeaderClassList?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string[];
  setTaskTooltip?: (task: IGanttTask, row?: IGanttRow) => string | HTMLElement;
  setMilestoneTooltip?: (milestone: IGanttMilestone, row?: IGanttRow) => string | HTMLElement;
  onTaskClick?: (event: Event, task: IGanttTask, row: IGanttRow) => void;
  onMilestoneClick?: (event: Event, milestone: IGanttMilestone, row: IGanttRow) => void;
  onRowClick?: (event: Event, row: IGanttRow) => void;
  setRenderCell?: (row: IGanttRow, column: GanttColumn, value: any) => string | HTMLElement;
  setGridCellClass?: (row: IGanttRow, column: GanttColumn, value: any) => string;
  setGridRowClass?: (row: IGanttRow) => string;
  setGanttRowClass?: (row: IGanttRow) => string;
  setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
  setGanttMilestoneClass?: (row: IGanttRow, milestone: IGanttMilestone) => string;
  loadingChanged?: (loading: boolean) => void;
}

interface IGanttParams extends IGanttProps {
  parents: HTMLElement;
}

export default class Gantt {
  parents: HTMLElement;
  columns: Column[];
  getRows: (currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) => void;
  minDate: Date;
  maxDate: Date;
  rowHeight: number;
  headerRowHeight: number;
  taskHeight: number;
  ganttHeaders: IGanttHeader[];
  ganttTaskLine?: GanttTaskLineType;
  ganttWidthRate: number;
  resizeColumn: boolean;
  dataRefreshTrottleTime: number;
  dataRefreshResponsiveness: number;
  bufferPageSize: number;
  shiftHours?: number[];
  dayStartTime: number;
  emptyRanges?: DayjsRange[];
  isStringColor?: boolean;
  isEndPosition?: boolean;
  selectedColor?: string;
  scrollAutoHide: boolean;
  scrollClickOnTrack: boolean;
  scrollClickOnTrackSpeed: number;
  classList: string[] = ["moz-gantt-root"];
  style: object | null = null;
  setHighlightTask?: (task: IGanttTask) => boolean;
  setGanttHeaderText?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string;
  setGanttHeaderClassList?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string[];
  setTaskTooltip?: (task: IGanttTask, row?: IGanttRow) => string | HTMLElement;
  setMilestoneTooltip?: (milestone: IGanttMilestone, row?: IGanttRow) => string | HTMLElement;
  onTaskClick?: (event: Event, task: IGanttTask, row: IGanttRow) => void;
  onMilestoneClick?: (event: Event, milestone: IGanttMilestone, row: IGanttRow) => void;
  onRowClick?: (event: Event, row: IGanttRow) => void;
  setRenderCell?: (row: IGanttRow, column: GanttColumn, value: any) => string | HTMLElement;
  setGridCellClass?: (row: IGanttRow, column: GanttColumn, value: any) => string;
  setGridRowClass?: (row: IGanttRow) => string;
  setGanttRowClass?: (row: IGanttRow) => string;
  setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
  setGanttMilestoneClass?: (row: IGanttRow, milestone: IGanttMilestone) => string;
  loadingChanged?: (loading: boolean) => void;

  gridHeader?: GridHeader;
  gridBody?: GridBody;
  ganttHeader?: GanttHeader;
  ganttBody?: GanttBody;
  rootSplitter?: Splitter;
  gridSplitter?: Splitter;
  ganttSplitter?: Splitter;
  gridBodyPane?: Pane;
  gridHeaderPane?: Pane;
  ganttBodyPane?: Pane;
  ganttHeaderPane?: Pane;
  gridBodyScroll?: ScrollBar;
  ganttBodyScroll?: ScrollBar;

  startIndex = 0;
  step = 1;
  firstRowHeight = 0;
  lastRowHeight = 0;
  scrollTop = 0;
  prevGanttHeight = 0;
  prevGanttWidth = 0;

  private _loading = false;

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
    if (this.loadingChanged) {
      this.loadingChanged(this._loading);
    }
  }

  rows: IGanttRow[] = [];
  element?: HTMLElement;

  updateRowsThrottle: Function;

  resizeObserver: ResizeObserver;

  constructor(params: IGanttParams) {
    this.parents = params.parents;
    this.columns = params.columns;
    this.getRows = params.getRows;
    this.minDate = params.minDate;
    this.maxDate = params.maxDate;
    this.rowHeight = params.rowHeight || 22;
    this.headerRowHeight = params.headerRowHeight || 22;
    this.taskHeight = params.taskHeight || 20;
    this.ganttHeaders = params.ganttHeaders;
    this.ganttTaskLine = params.ganttTaskLine;
    this.ganttWidthRate = params.ganttWidthRate || 1;
    this.resizeColumn = params.resizeColumn ?? true;
    this.dataRefreshTrottleTime = params.dataRefreshTrottleTime || 1000;
    this.dataRefreshResponsiveness = params.dataRefreshResponsiveness || 2000;
    this.bufferPageSize = params.bufferPageSize || 2;
    this.shiftHours = params.shiftHours;
    this.dayStartTime = params.dayStartTime || 0;
    this.emptyRanges = params.emptyRanges;
    this.isStringColor = params.isStringColor;
    this.isEndPosition = params.isEndPosition;
    this.selectedColor = params.selectedColor || "var(--color-selected)";
    this.scrollAutoHide = params.scrollAutoHide ?? true;
    this.scrollClickOnTrack = params.scrollClickOnTrack ?? true;
    this.scrollClickOnTrackSpeed = params.scrollClickOnTrackSpeed || 120;
    this.classList.push(...(params.classList || []));
    this.style = params.styleObject || null;
    this.setHighlightTask = params.setHighlightTask;
    this.setGanttHeaderText = params.setGanttHeaderText;
    this.setGanttHeaderClassList = params.setGanttHeaderClassList;
    this.setTaskTooltip = params.setTaskTooltip;
    this.setMilestoneTooltip = params.setMilestoneTooltip;
    this.onTaskClick = params.onTaskClick;
    this.onMilestoneClick = params.onMilestoneClick;
    this.onRowClick = params.onRowClick;
    this.setRenderCell = params.setRenderCell;
    this.setGridCellClass = params.setGridCellClass;
    this.setGridRowClass = params.setGridRowClass;
    this.setGanttRowClass = params.setGanttRowClass;
    this.setGanttTaskClass = params.setGanttTaskClass;
    this.setGanttMilestoneClass = params.setGanttMilestoneClass;
    this.loadingChanged = params.loadingChanged;

    // throttle의 기본 option은 { leading: true, trailing: false }라 처음에 한 번은 호출되고, 그 다음부터 시간에 맞춰 호출되는데
    // 기본 옵션을 { leading: false, trailing: true }로 변경하여 항상 시간이 지나서 호출되도록 함.
    this.updateRowsThrottle = throttle(
      async () => {
        await this.updateRows();
      },
      this.dataRefreshTrottleTime,
      { leading: false, trailing: true },
    );

    this.resizeObserver = new ResizeObserver(els => {
      this.setResizeSync();
    });
  }

  dispose() {
    if (this.gridBody) {
      this.gridBody.dispose();
    }
    if (this.ganttBody) {
      this.ganttBody.dispose();
    }
    if (this.gridSplitter) {
      this.gridSplitter.dispose();
    }
    if (this.ganttSplitter) {
      this.ganttSplitter.dispose();
    }
    if (this.rootSplitter) {
      this.rootSplitter.dispose();
    }
    this.resizeObserver.disconnect();
  }

  onRowClickHandler(event: Event, row: IGanttRow) {
    if (!this.element) return;
    if (!this.gridBody || !this.gridBody.tbodyEl) return;
    if (!this.ganttBody || !this.ganttBody.element) return;
    const el = event.currentTarget as HTMLElement;
    const dataId = el.getAttribute("data-id") || "";

    const selectEls: any = this.element.querySelectorAll<HTMLElement>(".moz-gantt-row-select");
    for (const seleceEl of selectEls) {
      seleceEl.classList.remove("moz-gantt-row-select");
      seleceEl.style.boxShadow = "none";
    }

    let gridEl: HTMLElement | undefined;
    let ganttEl: HTMLElement | undefined;
    if (el.classList.contains("moz-grid-row")) {
      gridEl = el;
      const rowEls = this.ganttBody.element.getElementsByClassName("moz-gantt-row");
      if (rowEls && rowEls.length > 0) {
        ganttEl = Array.from(rowEls).find(rowEl => rowEl.getAttribute("data-id") === dataId) as HTMLElement | undefined;
      }
    } else {
      ganttEl = el;
      const rowEls = this.gridBody.tbodyEl.getElementsByClassName("moz-grid-row");
      if (rowEls && rowEls.length > 0) {
        gridEl = Array.from(rowEls).find(rowEl => rowEl.getAttribute("data-id") === dataId) as HTMLElement | undefined;
      }
    }

    if (gridEl) {
      gridEl.classList.add("moz-gantt-row-select");
      const height = gridEl.style.height.replace("px", "");
      gridEl.style.boxShadow = `0px ${height}px 0px inset ${this.selectedColor}`;
    }
    if (ganttEl) {
      ganttEl.classList.add("moz-gantt-row-select");
      const height = ganttEl.style.height.replace("px", "");
      ganttEl.style.boxShadow = `0px ${height}px 0px inset ${this.selectedColor}`;
    }

    if (this.onRowClick) {
      this.onRowClick(event, row);
    }
  }

  async updateRows() {
    if (!this.gridBody) return;
    if (!this.ganttBody) return;
    if (this.loading) return;

    const length = this.rows.length;
    const rows: IGanttRow[] = await new Promise(resolve => {
      this.loading = true;
      this.getRows(length, this.step, resolve);
    });
    this.loading = false;
    if (rows.length === 0) return;
    if (this.rows.length > length) return;
    this.rows.push(...rows);
  }

  renderRows() {
    if (!this.gridBody) return;
    if (!this.ganttBody) return;
    if (!this.ganttHeader) return;
    const rows = this.rows.slice(this.startIndex, this.startIndex + this.step);
    this.gridBody.update(rows, this.firstRowHeight, this.lastRowHeight);
    const headerRow = this.ganttHeader.getGanttHeaderRow(this.ganttTaskLine);
    this.ganttBody.update(rows, this.firstRowHeight, this.lastRowHeight, this.scrollTop, headerRow);
  }

  async setDataUpdate(grid: HTMLElement) {
    if (!this.gridBody || !this.gridBody.tbodyEl) return;

    const top = this.gridBody.tbodyEl.getBoundingClientRect().top;
    const viewportY = grid.clientHeight;

    if (top < 0) {
      this.step = Math.floor(viewportY / this.rowHeight) * this.bufferPageSize;
      this.startIndex = Math.floor(-top / this.rowHeight);
    } else {
      this.startIndex = 0;
      this.step = Math.floor((viewportY - top) / this.rowHeight) * this.bufferPageSize;
    }
    this.firstRowHeight = this.startIndex * this.rowHeight;
    this.lastRowHeight = this.rows.length * this.rowHeight - this.step * this.rowHeight - this.firstRowHeight;
    this.scrollTop = grid.scrollTop;

    if (grid.scrollHeight - grid.scrollTop < this.dataRefreshResponsiveness) {
      await this.updateRowsThrottle();
      this.renderRows();
    }
  }

  setScrollSync(gridHeaderPane: Pane, gridBodyScroll: ScrollBar, ganttHeaderPane: Pane, ganttBodyScroll: ScrollBar) {
    if (!gridHeaderPane.paneElement) return;
    if (!gridBodyScroll.contentWrapperEl) return;
    if (!ganttHeaderPane.paneElement) return;
    if (!ganttBodyScroll.contentWrapperEl) return;
    const grid = gridBodyScroll.contentWrapperEl;
    const gridH = gridHeaderPane.paneElement;
    const gantt = ganttBodyScroll.contentWrapperEl;
    const ganttH = ganttHeaderPane.paneElement;
    grid.addEventListener("wheel", (event: WheelEvent) => {
      if (event.deltaY > 0) {
        grid.scrollTop += 30;
        gantt.scrollTop += 30;
      } else {
        grid.scrollTop -= 30;
        gantt.scrollTop -= 30;
      }
    });

    let gridScrollTop = 0;
    let gridScrollLeft = 0;
    grid.addEventListener("scroll", async (e: Event) => {
      const cs = document.getElementsByClassName("moz-gantt-circle");
      if (cs && cs.length > 0) {
        Array.from(cs).forEach(c => {
          document.body.removeChild(c);
        });
      }
      const ts = document.getElementsByClassName("tooltip");
      if (ts && ts.length > 0) {
        Array.from(ts).forEach(t => {
          document.body.removeChild(t);
        });
      }
      // vertical scroll
      if (gridScrollTop !== grid.scrollTop) {
        gantt.scrollTop = grid.scrollTop;

        await this.setDataUpdate(grid);

        gridScrollTop = grid.scrollTop;
      }

      // horizontal scroll
      if (gridScrollLeft !== grid.scrollLeft) {
        gridH.scrollLeft = grid.scrollLeft;
        gridScrollLeft = grid.scrollLeft;
      }
    });

    let ganttScrollTop = 0;
    let ganttScrollLeft = 0;
    gantt.addEventListener("scroll", async () => {
      const cs = document.getElementsByClassName("moz-gantt-circle");
      if (cs && cs.length > 0) {
        Array.from(cs).forEach(c => {
          document.body.removeChild(c);
        });
      }
      const ts = document.getElementsByClassName("tooltip");
      if (ts && ts.length > 0) {
        Array.from(ts).forEach(t => {
          document.body.removeChild(t);
        });
      }
      // vertical scroll
      if (ganttScrollTop !== gantt.scrollTop) {
        grid.scrollTop = gantt.scrollTop;
        ganttScrollTop = gantt.scrollTop;
      }
      // horizontal scroll
      if (ganttScrollLeft !== gantt.scrollLeft) {
        ganttH.scrollLeft = gantt.scrollLeft;
        ganttScrollLeft = gantt.scrollLeft;
        if (!this.ganttBody || !this.ganttBody.element) return;
        this.ganttBody.updateTasks(gantt.scrollLeft, gantt.scrollLeft + gantt.offsetWidth);
      }
    });
  }

  async setResizeSync() {
    if (!this.ganttBodyScroll || !this.ganttBodyScroll.contentWrapperEl) return;
    if (!this.ganttBodyPane || !this.ganttBodyPane.paneElement) return;
    if (!this.gridBodyScroll || !this.gridBodyScroll.contentWrapperEl) return;
    if (!this.ganttBody || !this.ganttBody.element) return;
    const grid = this.gridBodyScroll.contentWrapperEl;
    const gantt = this.ganttBodyScroll.contentWrapperEl;

    const nextGanttHeight = this.ganttBodyPane.paneElement.offsetHeight;
    const nextGanttWidth = this.ganttBodyPane.paneElement.offsetWidth;

    if (this.prevGanttWidth !== nextGanttWidth) {
      this.ganttBody.updateTasks(gantt.scrollLeft, gantt.scrollLeft + gantt.offsetWidth);
      this.prevGanttWidth = nextGanttWidth;
    }

    if (this.prevGanttHeight !== nextGanttHeight) {
      await this.setDataUpdate(grid);
    }
  }

  calcRowHeight() {
    const gridHeaderRowCount = calcRowCount(this.columns);
    const ganttHeaderRowCount = this.ganttHeaders.length;
    const maxRowHeight = Math.max(
      this.headerRowHeight * gridHeaderRowCount,
      this.headerRowHeight * ganttHeaderRowCount,
    );
    const gridHeaderRowHeight = maxRowHeight / gridHeaderRowCount;
    const ganttHeaderRowHeight = maxRowHeight / ganttHeaderRowCount;
    return {
      gridHeaderRowCount,
      gridHeaderRowHeight,
      ganttHeaderRowCount,
      ganttHeaderRowHeight,
      maxRowHeight,
    };
  }

  renderGrid(gridHeaderRowCount: number, gridHeaderRowHeight: number, maxRowHeight: number) {
    const gridEl = document.createElement("div");
    gridEl.classList.add("moz-grid");
    const gridHeaderEl = document.createElement("div");
    gridHeaderEl.classList.add("moz-grid-header");
    const gridBodyEl = document.createElement("div");
    gridBodyEl.classList.add("moz-grid-body");
    gridEl.appendChild(gridHeaderEl);
    gridEl.appendChild(gridBodyEl);

    this.gridHeader = new GridHeader({
      parents: gridHeaderEl,
      columns: this.columns,
      rowHeight: gridHeaderRowHeight,
      rowCount: gridHeaderRowCount,
      resizeColumn: this.resizeColumn,
    });
    this.gridHeader.render();

    const dataColumns = this.gridHeader.getDataColumns();
    this.gridBody = new GridBody({
      parents: gridBodyEl,
      columns: dataColumns,
      rowHeight: this.rowHeight,
      resizeColumn: this.resizeColumn,
      onRowClick: this.onRowClickHandler.bind(this),
      setRenderCell: this.setRenderCell,
      setGridRowClass: this.setGridRowClass,
      setGridCellClass: this.setGridCellClass,
    });
    this.gridBody.render();

    const gridHeaderPane = new Pane({
      contents: gridHeaderEl,
      size: `${maxRowHeight}px`,
      style: {
        overflow: "hidden",
      },
    });
    const gridBodyPane = new Pane({
      contents: gridBodyEl,
      style: {
        overflowX: "auto",
        overflowY: "hidden",
      },
    });
    this.gridSplitter = new Splitter({
      parents: gridEl,
      contents: [gridHeaderPane, gridBodyPane],
      allowResize: false,
      direction: "horizontal",
    });
    this.gridSplitter.render();

    return {
      gridEl,
      gridHeaderPane,
      gridBodyPane,
      gridWidth: dataColumns.reduce((sum, column) => sum + column.width, 0),
    };
  }

  renderGantt(ganttHeaderRowCount: number, ganttHeaderRowHeight: number, maxRowHeight: number, ganttWidth: number) {
    const ganttEl = document.createElement("div");
    ganttEl.classList.add("moz-gantt");
    const ganttHeaderEl = document.createElement("div");
    ganttHeaderEl.classList.add("moz-gantt-header");
    const ganttBodyEl = document.createElement("div");
    ganttBodyEl.classList.add("moz-gantt-body");
    ganttEl.appendChild(ganttHeaderEl);
    ganttEl.appendChild(ganttBodyEl);

    this.ganttHeader = new GanttHeader({
      parents: ganttHeaderEl,
      minDate: this.minDate,
      maxDate: this.maxDate,
      headers: this.ganttHeaders,
      rowHeight: ganttHeaderRowHeight,
      ganttWidthRate: this.ganttWidthRate,
      shiftHours: this.shiftHours,
      dayStartTime: this.dayStartTime,
      emptyRanges: this.emptyRanges,
      setGanttHeaderText: this.setGanttHeaderText,
      setGanttHeaderClassList: this.setGanttHeaderClassList,
    });
    this.ganttHeader.render();

    this.ganttBody = new GanttBody({
      parents: ganttBodyEl,
      minDate: this.minDate,
      maxDate: this.maxDate,
      startDate: this.minDate,
      endDate: widthToEndDate(ganttWidth, this.minDate, this.ganttWidthRate, this.emptyRanges),
      rowHeight: this.rowHeight,
      rowWidth: this.ganttHeader.calcRowWidth(),
      taskHeight: this.taskHeight,
      ganttWidthRate: this.ganttWidthRate,
      emptyRanges: this.emptyRanges,
      isStringColor: this.isStringColor,
      setHighlightTask: this.setHighlightTask,
      onTaskClick: this.onTaskClick,
      onMilestoneClick: this.onMilestoneClick,
      onRowClick: this.onRowClickHandler.bind(this),
      setTaskTooltip: this.setTaskTooltip,
      setMilestoneTooltip: this.setMilestoneTooltip,
      onRerenderTask: () => {
        this.renderRows();
      },
      setGanttRowClass: this.setGanttRowClass,
      setGanttTaskClass: this.setGanttTaskClass,
      setGanttMilestoneClass: this.setGanttMilestoneClass,
    });
    this.ganttBody.render();

    const ganttHeaderPane = new Pane({
      contents: ganttHeaderEl,
      size: `${maxRowHeight}px`,
      style: {
        overflow: "hidden",
      },
    });
    const ganttBodyPane = new Pane({
      contents: ganttBodyEl,
      style: {
        overflow: "auto",
      },
    });
    this.ganttSplitter = new Splitter({
      parents: ganttEl,
      contents: [ganttHeaderPane, ganttBodyPane],
      allowResize: false,
      direction: "horizontal",
    });
    this.ganttSplitter.render();

    return { ganttEl, ganttHeaderPane, ganttBodyPane };
  }

  renderRootSplitter(element: HTMLElement, gridEl: HTMLElement, ganttEl: HTMLElement, gridWidth: number) {
    const gridPane = new Pane({
      contents: gridEl,
      size: `${gridWidth}px`,
      // maxSize: `${gridWidth}px`,
      style: {
        overflow: "auto",
      },
    });
    const ganttPane = new Pane({
      contents: ganttEl,
      style: {
        overflow: "auto",
      },
    });
    this.rootSplitter = new Splitter({
      parents: element,
      contents: [gridPane, ganttPane],
      allowResize: this.resizeColumn,
    });
    this.rootSplitter.render();
  }

  async renderData() {
    if (!this.gridBody || !this.gridBody.tbodyEl) return;
    if (!this.gridBodyPane || !this.gridBodyPane.paneElement) return;

    const tableTop = this.gridBody.tbodyEl.getBoundingClientRect().top;
    const viewPortY = this.gridBodyPane.paneElement.clientHeight;

    if (tableTop > 0) {
      this.step = Math.floor((viewPortY - tableTop) / this.rowHeight) * this.bufferPageSize;
    } else {
      this.step = Math.floor(viewPortY / this.rowHeight) * this.bufferPageSize;
      this.startIndex = Math.floor(-tableTop / this.rowHeight);
    }

    await this.updateRows();

    this.firstRowHeight = this.startIndex * this.rowHeight;
    this.lastRowHeight = this.rows.length * this.rowHeight - this.step * this.rowHeight;

    this.renderRows();
  }

  async render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const rect = this.parents.getBoundingClientRect();
    this.element = document.createElement("div");
    this.element.classList.add("moz-splitter");
    this.element.classList.add(...this.classList);
    if (this.style) {
      Object.assign(this.element.style, this.style);
    }

    const { gridHeaderRowCount, gridHeaderRowHeight, ganttHeaderRowCount, ganttHeaderRowHeight, maxRowHeight } =
      this.calcRowHeight();

    const { gridEl, gridHeaderPane, gridBodyPane, gridWidth } = this.renderGrid(
      gridHeaderRowCount,
      gridHeaderRowHeight,
      maxRowHeight,
    );
    const { ganttEl, ganttHeaderPane, ganttBodyPane } = this.renderGantt(
      ganttHeaderRowCount,
      ganttHeaderRowHeight,
      maxRowHeight,
      rect.width - gridWidth,
    );

    this.gridBodyPane = gridBodyPane;
    this.gridHeaderPane = gridHeaderPane;
    this.ganttBodyPane = ganttBodyPane;
    this.ganttHeaderPane = ganttHeaderPane;

    this.gridBodyScroll = new ScrollBar(this.gridBodyPane.paneElement!, {
      autoHide: this.scrollAutoHide,
      clickOnTrack: this.scrollClickOnTrack,
      clickOnTrackSpeed: this.scrollClickOnTrackSpeed,
    });
    this.ganttBodyScroll = new ScrollBar(this.ganttBodyPane.paneElement!, {
      autoHide: this.scrollAutoHide,
      clickOnTrack: this.scrollClickOnTrack,
      clickOnTrackSpeed: this.scrollClickOnTrackSpeed,
    });

    this.renderRootSplitter(this.element, gridEl, ganttEl, gridWidth);
    this.setScrollSync(gridHeaderPane, this.gridBodyScroll, ganttHeaderPane, this.ganttBodyScroll);

    this.parents.appendChild(this.element);

    await this.renderData();

    if (this.ganttBodyPane.paneElement) {
      this.prevGanttWidth = this.ganttBodyPane.paneElement.offsetWidth;
      this.prevGanttHeight = this.ganttBodyPane.paneElement.offsetHeight;
      this.resizeObserver.observe(this.ganttBodyPane.paneElement);
    }

    if (this.isEndPosition && this.ganttBodyScroll.contentWrapperEl) {
      this.ganttBodyScroll.contentWrapperEl.scrollLeft =
        this.ganttBodyScroll.contentWrapperEl.scrollWidth - this.ganttBodyScroll.contentWrapperEl.offsetWidth;
    }
  }
}
