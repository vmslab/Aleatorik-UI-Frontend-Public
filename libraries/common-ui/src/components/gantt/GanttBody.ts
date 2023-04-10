import { dayjsRange, DayjsRange } from "@aleatorik-ui/common";
import { dateRangeToWidth, widthToEndDate } from "../../utils/sizeUtil";
import { addTooltipEvent } from "../../utils/element";
import { stringToColor, lightenDarkenColor, ganttColors, getGanttKeyColor, getTextColor } from "../../utils/colorUtil";
import { IGanttRow, IGanttTask, IGanttMilestone, IGanttLink, IGanttLinkData } from "../../types";
import { IGanttHeaderRow } from "./GanttHeader";

export default class GanttBody {
  parents: HTMLElement;
  minDate: Date;
  maxDate: Date;
  rowHeight: number;
  rowWidth: number;
  taskHeight: number;
  ganttWidthRate: number;
  emptyRanges?: DayjsRange[];
  isStringColor?: boolean;
  setHighlightTask?: (task: IGanttTask) => boolean;
  onTaskClick?: (event: Event, task: IGanttTask, row: IGanttRow) => void;
  onMilestoneClick?: (event: Event, milestone: IGanttMilestone, row: IGanttRow) => void;
  onRowClick?: (event: Event, row: IGanttRow) => void;
  setTaskTooltip?: (task: IGanttTask, row?: IGanttRow) => string | HTMLElement;
  setMilestoneTooltip?: (milestone: IGanttMilestone, row?: IGanttRow) => string | HTMLElement;
  onRerenderTask?: () => void;
  setGanttRowClass?: (row: IGanttRow) => string;
  setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
  setGanttMilestoneClass?: (row: IGanttRow, milestone: IGanttMilestone) => string;

  element?: HTMLElement;
  lineElement?: HTMLElement;
  linkElement?: HTMLElement;
  rows?: IGanttRow[];
  ganttBackColors: string[];
  selectedTask?: {
    row: IGanttRow;
    task: IGanttTask;
    el: HTMLElement;
  };

  renderRange: DayjsRange;

  constructor(params: {
    parents: HTMLElement;
    minDate: Date;
    maxDate: Date;
    startDate: Date;
    endDate: Date;
    rowHeight: number;
    rowWidth: number;
    taskHeight: number;
    ganttWidthRate?: number;
    emptyRanges?: DayjsRange[];
    isStringColor?: boolean;
    setHighlightTask?: (task: IGanttTask) => boolean;
    onTaskClick?: (event: Event, task: IGanttTask, row: IGanttRow) => void;
    onMilestoneClick?: (event: Event, milestone: IGanttMilestone, row: IGanttRow) => void;
    onRowClick?: (event: Event, row: IGanttRow) => void;
    setTaskTooltip?: (task: IGanttTask, row?: IGanttRow) => string | HTMLElement;
    setMilestoneTooltip?: (task: IGanttMilestone, row?: IGanttRow) => string | HTMLElement;
    onRerenderTask?: () => void;
    setGanttRowClass?: (row: IGanttRow) => string;
    setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
    setGanttMilestoneClass?: (row: IGanttRow, milestone: IGanttMilestone) => string;
  }) {
    this.parents = params.parents;
    this.minDate = params.minDate;
    this.maxDate = params.maxDate;
    this.renderRange = dayjsRange(params.startDate, params.endDate);
    this.rowHeight = params.rowHeight;
    this.rowWidth = params.rowWidth;
    this.taskHeight = params.taskHeight;
    this.ganttWidthRate = params.ganttWidthRate || 1;
    this.emptyRanges = params.emptyRanges;
    this.isStringColor = params.isStringColor;
    this.setHighlightTask = params.setHighlightTask;
    this.onTaskClick = params.onTaskClick;
    this.onMilestoneClick = params.onMilestoneClick;
    this.onRowClick = params.onRowClick;
    this.setTaskTooltip = params.setTaskTooltip;
    this.setMilestoneTooltip = params.setMilestoneTooltip;
    this.onRerenderTask = params.onRerenderTask;
    this.ganttBackColors = [...ganttColors].reverse().reduce((result, colors) => {
      return result.concat(colors);
    }, []);
    this.setGanttRowClass = params.setGanttRowClass;
    this.setGanttTaskClass = params.setGanttTaskClass;
    this.setGanttMilestoneClass = params.setGanttMilestoneClass;
  }

  dispose() {}

  getRowById(id?: string | null) {
    if (!this.rows) return;
    if (!id) return;
    const ids = id.split("-");
    if (!ids || ids.length < 2) return;
    return this.rows[+ids[1]];
  }

  getTaskById(id?: string | null) {
    if (!this.rows) return;
    if (!id) return;
    const ids = id.split("-");
    if (!ids || ids.length < 3) return;
    const row = this.rows[+ids[1]];
    if (!row || !row.tasks) return;
    return row.tasks[+ids[2]];
  }

  getMilestoneById(id?: string | null) {
    if (!this.rows) return;
    if (!id) return;
    const ids = id.split("-");
    if (!ids || ids.length < 3) return;
    const row = this.rows[+ids[1]];
    if (!row || !row.milestones) return;
    return row.milestones[+ids[2]];
  }

  setLinkDataDetail(link: IGanttLink, data: IGanttLinkData, id: string, type: string) {
    if (!this.rows) return;
    const timeType = `${type}Time`;
    const topType = `${type}Top`;
    const idxType = `${type}Idx`;
    const milestoneType = `${type}IsMilestone`;
    let rowTop: number = 0;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (row.tasks) {
        const task = row.tasks.find(t => t.id === id);
        if (task) {
          data[timeType] = type === "from" ? task.endTime : task.startTime;
          data[topType] = rowTop + this.rowHeight * (task.level - 1);
          data[idxType] = i;
          data[milestoneType] = false;
          if (type === "from") {
            if (link.color) {
              data.color = link.color;
            } else {
              const backgroundColor =
                task.backgroundColor ||
                (this.isStringColor
                  ? stringToColor(task.key)
                  : getGanttKeyColor(task.key, {
                      customColors: this.ganttBackColors,
                    }));
              const borderColor = task.borderColor || lightenDarkenColor(backgroundColor, -30);
              data.color = borderColor;
            }
            data.dash = link.dash || "solid";
            data.size = link.size || "1px";
          }
          break;
        }
      }
      if (row.milestones) {
        const milestone = row.milestones.find(m => m.id === id);
        if (milestone) {
          data[timeType] = milestone.time;
          data[topType] = rowTop + this.rowHeight * (milestone.level - 1);
          data[idxType] = i;
          data[milestoneType] = true;
          if (type === "from") {
            if (link.color) {
              data.color = link.color;
            } else {
              const backgroundColor =
                milestone.backgroundColor ||
                (this.isStringColor
                  ? stringToColor(milestone.key)
                  : getGanttKeyColor(milestone.key, {
                      customColors: this.ganttBackColors,
                    }));
              const borderColor = milestone.borderColor || lightenDarkenColor(backgroundColor, -30);
              data.color = borderColor;
            }
            data.dash = link.dash || "solid";
            data.size = link.size || "1px";
          }
          break;
        }
      }
      rowTop += this.rowHeight * (row.maxLevel || 1);
    }
  }

  setLinkData(link: IGanttLink): IGanttLinkData {
    const data: IGanttLinkData = {
      fromIdx: -1,
      toIdx: -1,
      fromTop: -1,
      toTop: -1,
    };
    if (!this.rows) return data;

    this.setLinkDataDetail(link, data, link.from, "from");
    this.setLinkDataDetail(link, data, link.to, "to");

    return data;
  }

  onRowClickHandler(event: Event) {
    if (!this.onRowClick) return;
    const el = event.currentTarget as HTMLElement;
    const row = this.getRowById(el.getAttribute("data-id"));
    if (!row) return;
    this.onRowClick(event, row);
  }

  onMouseOverHandler(evt: MouseEvent) {
    const bc = (evt.currentTarget as any).getAttribute("data-back");
    const cf = document.createElement("div");
    const cb = document.createElement("div");
    const target = evt.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const csize: number = 6;
    const margin = (target.clientHeight - csize) / 2;
    const top = rect.top + margin;
    cf.className = "moz-gantt-circle";
    cf.style.width = `${csize}px`;
    cf.style.height = `${csize}px`;
    cf.style.left = `${rect.left - 5}px`;
    cf.style.top = `${top - 2}px`;
    cf.style.backgroundColor = bc;
    cf.style.boxShadow = "1px 1px 3px #000000AA";
    cf.style.border = "2px solid white";
    cf.style.zIndex = "999";
    cb.className = "moz-gantt-circle";
    cb.style.width = `${csize}px`;
    cb.style.height = `${csize}px`;
    cb.style.left = `${rect.left + target.clientWidth - 5}px`;
    cb.style.top = `${top - 2}px`;
    cb.style.backgroundColor = bc;
    cb.style.boxShadow = "1px 1px 3px #000000AA";
    cb.style.border = "2px solid white";
    document.body.appendChild(cf);
    document.body.appendChild(cb);
  }

  onMouseOutHandler() {
    const cs = document.getElementsByClassName("moz-gantt-circle");
    if (cs && cs.length > 0) {
      Array.from(cs).forEach(c => {
        document.body.removeChild(c);
      });
    }
  }

  onTaskClickHandler(event: Event) {
    const el = event.currentTarget as HTMLElement;
    const id = el.getAttribute("data-id");
    const rowId = `row-${id?.split("-")[1]}`;
    const row = this.getRowById(rowId);
    if (!row) return;
    const task = this.getTaskById(id);
    if (!task) return;
    this.selectedTask = { el, row, task };

    if (this.onTaskClick) {
      this.onTaskClick(event, task, row!);
    }

    if (this.onRerenderTask) {
      this.onRerenderTask();
    }
  }

  onMilestoneClickHandler(event: Event) {
    const el = event.currentTarget as HTMLElement;
    const id = el.getAttribute("data-id");
    const rowId = `row-${id?.split("-")[1]}`;
    const row = this.getRowById(rowId);
    if (!row) return;
    const milestone = this.getMilestoneById(id);
    if (!milestone) return;

    if (this.onMilestoneClick) {
      this.onMilestoneClick(event, milestone, row!);
    }
  }

  setRowEvents() {
    if (!this.element) return;
    const rowEls = this.element.getElementsByClassName("moz-gantt-row");
    if (!rowEls || rowEls.length === 0) return;
    Array.from(rowEls).forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener("click", this.onRowClickHandler.bind(this));
    });
  }

  setTaskEvents() {
    if (!this.element) return;
    const taskEls = this.element.getElementsByClassName("moz-gantt-task");
    if (!taskEls || taskEls.length === 0) return;
    Array.from(taskEls).forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener("mouseover", this.onMouseOverHandler.bind(this));
      el.addEventListener("mouseout", this.onMouseOutHandler.bind(this));
      el.addEventListener("click", this.onTaskClickHandler.bind(this));

      const id = el.getAttribute("data-id");
      const task = this.getTaskById(id);
      const rowId = `row-${id?.split("-")[1]}`;
      const row = this.getRowById(rowId);
      if (!task) return;
      let tooltip: string | HTMLElement | null = null;
      if (this.setTaskTooltip) {
        tooltip = this.setTaskTooltip(task, row);
      } else {
        if (task.tooltip) {
          tooltip = task.tooltip;
        }
      }
      if (!tooltip) return;

      if (typeof tooltip === "string") {
        addTooltipEvent(el, tooltip, true, "mouse");
      } else {
        addTooltipEvent(el, tooltip.innerHTML, true, "mouse");
      }
    });
  }

  setMilestoneEvents() {
    if (!this.element) return;
    const milestoneEls = this.element.getElementsByClassName("moz-gantt-milestone");
    if (!milestoneEls || milestoneEls.length === 0) return;
    Array.from(milestoneEls).forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener("mouseover", this.onMouseOverHandler.bind(this));
      el.addEventListener("mouseout", this.onMouseOutHandler.bind(this));
      el.addEventListener("click", this.onMilestoneClickHandler.bind(this));

      const id = el.getAttribute("data-id");
      const milestone = this.getMilestoneById(id);
      const rowId = `row-${id?.split("-")[1]}`;
      const row = this.getRowById(rowId);
      if (!milestone) return;
      let tooltip: string | HTMLElement | null = null;
      if (this.setMilestoneTooltip) {
        tooltip = this.setMilestoneTooltip(milestone, row);
      } else {
        if (milestone.tooltip) {
          tooltip = milestone.tooltip;
        }
      }
      if (!tooltip) return;

      if (typeof tooltip === "string") {
        addTooltipEvent(el, tooltip, true, "mouse");
      } else {
        addTooltipEvent(el, tooltip.innerHTML, true, "mouse");
      }
    });
  }

  createTasks(row: IGanttRow, ridx: number) {
    return (
      row.tasks
        ?.reduce((result, task, tidx) => {
          if (!this.renderRange.isOverlap(dayjsRange(task.startTime, task.endTime))) return result;
          const width = dateRangeToWidth(
            this.minDate > task.startTime ? this.minDate : task.startTime,
            this.maxDate < task.endTime ? this.maxDate : task.endTime,
            this.ganttWidthRate,
            this.emptyRanges,
          );
          const height = this.taskHeight;
          let topMargin = (this.rowHeight - this.taskHeight) / 2;
          topMargin -= topMargin % 2 === 1 ? 0 : 1;
          const top = this.rowHeight * (task.level - 1) + topMargin;
          const left = dateRangeToWidth(
            this.minDate,
            this.minDate > task.startTime ? this.minDate : task.startTime,
            this.ganttWidthRate,
            this.emptyRanges,
          );

          const backgroundColor =
            task.backgroundColor ||
            (this.isStringColor
              ? stringToColor(task.key)
              : getGanttKeyColor(task.key, {
                  customColors: this.ganttBackColors,
                }));
          const borderColor = task.borderColor || lightenDarkenColor(backgroundColor, -30);
          const textColor = task.textColor || getTextColor(backgroundColor);
          let selectedClassName = "";
          let highlightClassName = "";

          if (this.setHighlightTask && this.setHighlightTask(task)) {
            highlightClassName = "moz-gantt-task-highlight";
          }
          if (this.selectedTask && this.selectedTask.task && this.selectedTask.task === task) {
            selectedClassName = "moz-gantt-task-selected";
          }
          let classAttr = `class="moz-gantt-task ${selectedClassName} ${highlightClassName}"`;
          if (this.setGanttTaskClass) {
            const cls = this.setGanttTaskClass(row, task);
            if (cls) {
              classAttr = `class="moz-gantt-task ${selectedClassName} ${highlightClassName} ${cls}"`;
            }
          }
          result.push(`<div
                data-id="task-${ridx}-${tidx}"
                data-key="${task.id}"
                data-back="${backgroundColor}"
                data-border="${borderColor}"
                ${classAttr}
                style="
                  width: ${width}px;
                  height: ${height}px;
                  top: ${top}px;
                  left: ${left}px;
                  color:${textColor};
                  background-color: ${backgroundColor};
                  box-shadow: inset 0 0 0 1px ${borderColor};">
                  ${task.text}
                </div>`);
          return result;
        }, [] as string[])
        .join("\n") || ""
    );
  }

  createMilestones(row: IGanttRow, ridx: number) {
    return (
      row.milestones
        ?.reduce((result, milestone, midx) => {
          if (!this.renderRange.isOverlap(dayjsRange(milestone.time, milestone.time))) return result;
          const width = this.taskHeight;
          const height = this.taskHeight;
          let topMargin = (this.rowHeight - this.taskHeight) / 2;
          topMargin -= topMargin % 2 === 1 ? 0 : 1;
          const top = this.rowHeight * (milestone.level - 1) + topMargin;
          const left =
            dateRangeToWidth(
              this.minDate,
              this.minDate > milestone.time ? this.minDate : milestone.time,
              this.ganttWidthRate,
              this.emptyRanges,
            ) -
            this.taskHeight / 2;
          const triSize = width / 2;
          const innerTriSize = triSize - 3;

          const backgroundColor =
            milestone.backgroundColor ||
            (this.isStringColor
              ? stringToColor(milestone.key)
              : getGanttKeyColor(milestone.key, {
                  customColors: this.ganttBackColors,
                }));
          const borderColor = milestone.borderColor || lightenDarkenColor(backgroundColor, -30);
          // eslint-disable-next-line @typescript-eslint/quotes
          let classAttr = 'class="moz-gantt-milestone"';
          if (this.setGanttMilestoneClass) {
            const cls = this.setGanttMilestoneClass(row, milestone);
            if (cls) {
              classAttr = `class="moz-gantt-milestone ${cls}"`;
            }
          }
          result.push(`<div
                data-id="milestone-${ridx}-${midx}"
                data-back="${backgroundColor}"
                data-border="${borderColor}"
                class="moz-gantt-milestone"
                style="
                  width: ${width}px;
                  height: ${height}px;
                  top: ${top}px;
                  left: ${left}px;">
                  <div
                    class="triangle-left"
                    style="
                      border-top: ${triSize}px solid transparent;
                      border-right: ${triSize}px solid ${borderColor};
                      border-bottom: ${triSize}px solid transparent;
                    "
                  >
                    <div
                      class="triangle-left-inner"
                      style="
                        top: -${innerTriSize}px;
                        left: 2px;
                        border-top: ${innerTriSize}px solid transparent;
                        border-right: ${innerTriSize + 1}px solid ${backgroundColor};
                        border-bottom: ${innerTriSize}px solid transparent;
                      "
                    >
                    </div>
                  </div>
                  <div
                    class="triangle-right"
                    style="
                      border-top: ${triSize}px solid transparent;
                      border-left: ${triSize}px solid ${borderColor};
                      border-bottom: ${triSize}px solid transparent;
                    "
                  >
                    <div
                      class="triangle-right-inner"
                      style="
                        top: -${innerTriSize}px;
                        left: -${triSize}px;
                        border-top: ${innerTriSize}px solid transparent;
                        border-left: ${innerTriSize + 1}px solid ${backgroundColor};
                        border-bottom: ${innerTriSize}px solid transparent;
                      "
                    >
                    </div>
                  </div>
                </div>`);
          return result;
        }, [] as string[])
        .join("\n") || ""
    );
  }

  createLinks(row: IGanttRow, ridx: number) {
    const linkSize: number = 10;
    const arrowSize: number = 4;
    return (
      row.links
        ?.reduce((result, link, lidx) => {
          const data = this.setLinkData(link);
          if (!data.fromTime) return result;
          if (!data.toTime) return result;
          if (data.fromTop < 0) return result;
          if (data.toTop < 0) return result;
          if (data.fromIdx < 0) return result;
          if (data.toIdx < 0) return result;
          if (!this.renderRange.isOverlap(dayjsRange(data.fromTime, data.toTime))) return result;
          let leftFrom = dateRangeToWidth(this.minDate, data.fromTime, this.ganttWidthRate, this.emptyRanges);
          let leftTo = dateRangeToWidth(this.minDate, data.toTime, this.ganttWidthRate, this.emptyRanges);
          let linkWidth = 0;
          leftFrom = leftFrom + (data.fromIsMilestone ? this.taskHeight / 2 : 0);
          leftTo = leftTo - (data.toIsMilestone ? this.taskHeight / 2 : 0);
          let lineLeft = 0;
          const startTop = data.fromTop + this.rowHeight / 2;
          const endTop = data.toTop + this.rowHeight / 2;
          let startHeight = 0;
          let endHeight = 0;
          let linkTop = startTop;
          let startVTop = 0;
          let endVTop = 0;

          if (leftFrom + linkSize < leftTo - linkSize) {
            linkWidth = leftTo - linkSize - (leftFrom + linkSize);
            lineLeft = leftFrom + linkSize;
          } else {
            linkWidth = leftFrom + linkSize - leftTo + linkSize;
            lineLeft = leftTo - linkSize;
            linkTop = data.toTop + this.rowHeight;
            startVTop = startTop;
            endVTop = endTop;
            startHeight = this.rowHeight / 2;
            endHeight = this.rowHeight / 2;
          }
          if (data.fromTop < data.toTop) {
            linkTop = data.toTop;
            startHeight = linkTop - startTop;
            endHeight = endTop - linkTop;
            startVTop = startTop;
            endVTop = linkTop;
          } else if (data.fromTop > data.toTop) {
            linkTop = data.toTop + this.rowHeight;
            startHeight = startTop - linkTop;
            endHeight = linkTop - endTop;
            startVTop = linkTop;
            endVTop = endTop;
          }
          const borderColor = data.color;
          const borderStyle = data.dash;
          const borderSize = data.size;
          // start
          result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                top: ${startTop}px;
                left: ${leftFrom}px;
                width: ${linkSize}px;
                height: 1px;
                border-top: ${borderSize} ${borderStyle} ${borderColor};
              ">
            </div>`);
          // start vertical
          if (startHeight > 0) {
            result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                top: ${startVTop}px;
                left: ${leftFrom + linkSize}px;
                width: 1px;
                height: ${startHeight}px;
                border-left: ${borderSize} ${borderStyle} ${borderColor};
              ">
            </div>`);
          }
          // line
          result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                top: ${linkTop}px;
                left: ${lineLeft}px;
                width: ${linkWidth}px;
                height: 1px;
                border-top: ${borderSize} ${borderStyle} ${borderColor};
              ">
            </div>`);
          // end vertical
          if (endHeight > 0) {
            result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                top: ${endVTop}px;
                left: ${leftTo - linkSize}px;
                width: 1px;
                height: ${endHeight}px;
                border-left: ${borderSize} ${borderStyle} ${borderColor};
              ">
            </div>`);
          }
          // end
          result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                top: ${endTop}px;
                left: ${leftTo - linkSize}px;
                width: ${linkSize}px;
                height: 1px;
                border-top: ${borderSize} ${borderStyle} ${borderColor};
              ">
            </div>`);
          // end arrow
          result.push(`<div
              data-id="link-${data.fromIdx}-${data.toIdx}-${lidx}"
              class="moz-gantt-link"
              style="
                width: 0px;
                height: 0px;
                top: ${endTop - arrowSize}px;
                left: ${leftTo - arrowSize}px;
                border-bottom: ${arrowSize}px solid transparent;
                border-top: ${arrowSize}px solid transparent;
                border-left: ${arrowSize}px solid ${borderColor};
                border-right: ${arrowSize}px solid transparent;
              ">
            </div>`);
          return result;
        }, [] as string[])
        .join("\n") || ""
    );
  }

  updateTasks(start: number, end: number) {
    if (!this.element) return;
    if (!this.rows) return;
    const startDate = widthToEndDate(start, this.minDate, this.ganttWidthRate, this.emptyRanges);
    const endDate = widthToEndDate(end, this.minDate, this.ganttWidthRate, this.emptyRanges);
    this.renderRange = dayjsRange(startDate, endDate);

    const element = this.element;
    this.rows.forEach((row, ridx) => {
      const el = element.querySelector(`[data-id="row-${ridx}"]`);
      if (!el) return;
      el.innerHTML = `${this.createTasks(row, ridx)}${this.createMilestones(row, ridx)}`;
    });
    const linksHtml = this.rows.reduce((links, row, ridx) => {
      return `${links}${this.createLinks(row, ridx)}`;
    }, "");
    const taskEl = element.querySelector(".moz-gantt-tasks");
    if (taskEl) {
      const els: any = element.querySelectorAll(".moz-gantt-link");
      if (els && els.length > 0) {
        for (const el of els) {
          taskEl.removeChild(el);
        }
      }
      taskEl.innerHTML = `${taskEl.innerHTML}${linksHtml}`;
    }
    this.setTaskEvents();
    this.setMilestoneEvents();
    this.setRowEvents();
  }

  update(rows: IGanttRow[], firstHeight: number, lastHeight: number, scrollTop: number, headerRow?: IGanttHeaderRow) {
    if (!this.element) return;
    this.rows = rows;
    const rowWidth = this.rowWidth;
    const firstRow = `<div style="height:${firstHeight}px;width:${rowWidth}px;"></div>`;
    const lastRow = `<div style="height:${lastHeight}px;width${rowWidth}px;"></div>`;
    let totalHeight = 0;
    const rowsHtml = rows
      .map((row, ridx) => {
        if (!this.element) return;
        const height = this.rowHeight * (row.maxLevel || 1);
        totalHeight += height;
        // eslint-disable-next-line @typescript-eslint/quotes
        let classAttr = 'class="moz-gantt-row" ';
        if (this.setGanttRowClass) {
          const cls = this.setGanttRowClass(row);
          if (cls) {
            classAttr = `class="moz-gantt-row ${cls}" `;
          }
        }
        return `<div data-id="row-${ridx}" ${classAttr}style="height: ${height}px; width: ${rowWidth}px;">
      ${this.createTasks(row, ridx)}${this.createMilestones(row, ridx)}
      </div>`;
      })
      .join("\n");
    const linksHtml = rows.reduce((links, row, ridx) => {
      return `${links}${this.createLinks(row, ridx)}`;
    }, "");
    const linesHtml = headerRow
      ? headerRow.columns
          .map(column => {
            return `<div
        class="moz-gantt-task-line"
        style="
          width: ${column.width}px;
          height: ${totalHeight}px;
          left: ${column.left}px;
        "
        ></div>`;
          })
          .join("\n")
      : "";
    this.element.innerHTML = `${firstRow}
      <div class="moz-gantt-layer" style="width:${rowWidth}px; height:${totalHeight}px">
        <div class="moz-gantt-task-lines" style="width:${rowWidth}px; height:${totalHeight}px">
          ${linesHtml}
        </div>
        <div class="moz-gantt-tasks" style="width:${rowWidth}px; height:${totalHeight}px">
          ${rowsHtml}${linksHtml}
        </div>
      </div>
      ${lastRow}`;
    this.setTaskEvents();
    this.setMilestoneEvents();
    this.setRowEvents();
  }

  updateLayer(scrollTop: number) {
    if (!this.parents.parentElement) return;
    if (this.lineElement) {
      this.lineElement.style.top = `${scrollTop}px`;
    }
    if (this.linkElement) {
      this.linkElement.style.top = `${scrollTop}px`;
    }
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    this.element = document.createElement("div");
    this.parents.appendChild(this.element);
  }
}
