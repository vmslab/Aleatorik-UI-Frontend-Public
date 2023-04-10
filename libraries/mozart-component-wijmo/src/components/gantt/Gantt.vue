<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  Gantt as GanttComponent,
  Column,
  IGanttRow,
  IGanttHeader,
  IGanttTask,
  IGanttMilestone,
  IGanttProps,
  DayjsRange,
  GanttHeaderType,
  GanttTaskLineType,
  createCamelProps,
} from "mozart-common";

@Component({
  name: "Gantt",
  components: {},
})
export default class Gantt extends Vue {
  /**
   * Gantt의 Column 목록 입니다.<br>
   * Column 정의<br>
   * field: string; // Data와 매칭되는 Field 명<br>
   * caption?: string; // Cation<br>
   * width: number; // 컬럼 가로 사이즈<br>
   * visible: boolean; // Column이 화면에 보일지 여부<br>
   * order?: "asc" | "desc"; // Data 정렬 Type<br>
   * textAlign?: "left" | "center" | "right"; // Column Text 가로 정렬 Type<br>
   * verticalAlign?: "top" | "middle" | "bottom"; // Column Text 세로 정렬 Type<br>
   * merge: boolean; // Column Merge 여부<br>
   * mergeAffectedByPrevColumn: boolean; // Column Merge 시 이전 컬럼에 영향을 받을지 여부<br>
   * children?: GanttColumn[]; // Multiline Column 생성시 자식 Column List
   */
  @Prop({ type: Array, required: true }) public columns!: Column[];
  /**
   * Gantt의 Data를 세팅하는 함수 입니다.<br>
   * Parameter 정의<br>
   * currentBuffer: number; // Gantt에 로딩된 Data 수 입니다.<br>
   * buffer: number;  // 설정 값에 따라 세팅된 Gantt의 buffer입니다. (Buffer 많큼 데이터를 넣어줄 것을 권장)<br>
   * resolve: Function; // 종료 함수 입니다. IGanttRow[]를 넣어주면 Gantt에 데이터가 추가됩니다.
   */
  @Prop({ type: Function, required: true }) public getRows!: (
    currentBuffer: number,
    buffer: number,
    resolve: (value: IGanttRow[]) => void,
  ) => void;
  /**
   * Gantt의 최소 시각입니다.
   */
  @Prop({ type: Date, required: true }) public minDate!: Date;
  /**
   * Gantt의 최대 시각입니다.
   */
  @Prop({ type: Date, required: true }) public maxDate!: Date;
  /**
   * Gantt의 Row 높이 입니다.<br>
   * 기본값 : 22px
   */
  @Prop({ type: Number }) public rowHeight?: number;
  /**
   * Gantt의 Row 높이 입니다.<br>
   * 기본값 : 22px
   */
  @Prop({ type: Number }) public headerRowHeight?: number;
  /**
   * Gantt의 Task 높이 입니다.<br>
   * 기본값 : 20px
   */
  @Prop({ type: Number }) public taskHeight?: number;
  /**
   * Gantt의 Header Type 입니다.<br>
   * 종류 : "Year" | "Quarter" | "Month" | "Week" | "Day" | "Hour" | "Minute"<br>
   * type과 format을 조합한 배열로 설정되며, 배열의 수많큼 GanttHeader Row가 생성됩니다.<br>
   * ex) [{ type: "Month", format: "MMM" }, { type: "Day" }]
   */
  @Prop({ type: Array, required: true }) public ganttHeaders!: IGanttHeader[];
  /**
   * Gantt의 Task 세로 Line Type입니다.<br>
   * ganttHeaders중의 하나를 선택 할 수 있습니다.<br>
   * first, last, number of index 중 선택
   */
  @Prop({ type: [String, Number] }) public ganttTaskLine?: GanttTaskLineType;
  /**
   * Gantt의 의 폭에대한 비율입니다.<br>
   * 비율에 따라 Gantt의 최종 넓이가 결정됩니다.<br>
   * 계산 방법<br>
   * 기본 1초 === 1px<br>
   * ex) 500초 => 500px * 비율
   */
  @Prop({ type: Number }) public ganttWidthRate?: number;
  /**
   * Gantt Grid의 Column을 Resize할지 여부입니다.
   */
  @Prop({ type: Boolean, default: true }) public resizeColumn?: boolean;
  /**
   * Gantt의 Data를 가져올 때 Throttle을 사용하여 이벤트 민갑도를 조절합니다.<br>
   * 해당 Throttle의 시간을 설정 합니다.<br>
   * 값이 낮을 수록 자주 getRows 함수가 호출됩니다.<br>
   * 기본값 : 2000 (2초)
   */
  @Prop({ type: Number }) public dataRefreshTrottleTime?: number;
  /**
   * Gantt의 Data를 가져올 때 Scroll Size에 맞춰 GetRows 함수가 발동됩니다.<br>
   * Scroll Size의 기준을 설정합니다.<br>
   * 값이 높을 수록 자주 getRows 함수가 호출됩니다.<br>
   * 기본값 : 2000
   */
  @Prop({ type: Number }) public dataRefreshResponsiveness?: number;
  /**
   * Gantt의 Data를 가져오는 buffer는 화면에 보이는 Viewport 크기 단위로 설정됨니다.<br>
   * buffer = Viewport 높이 * bufferPageSize<br>
   * 값이 클수록 한 번에 많은 데이터를 가져옵니다.<br>
   * 기본값 : 2
   */
  @Prop({ type: Number }) public bufferPageSize?: number;
  /**
   * Gantt Header에 Shift를 사용하였을 경우, Shift를 나누는 시간 배열입니다.<br>
   * 기본값 : [6, 14, 22]
   */
  @Prop({ type: Array }) public shiftHours?: number[];
  /**
   * Gantt의 일 시작시간 입니다.<br>
   * 일이 시작되는 시간을 변경합니다.
   */
  @Prop({ type: Number }) public dayStartTime?: number;
  /**
   * Gantt의 시간 중 표시하고 싶지 않은 시간대 목록 입니다.<br>
   * 해당 목록을 설정하면 설정 된 시간대는 화면에 표시되지 않습니다.<br>
   * 에시 : emptyRanges="[dayjsRange('2022-05-18','2022-05-19')]"
   */
  @Prop({ type: Array }) public emptyRanges?: DayjsRange[];
  /**
   * Gantt의 Scroll을 자동으로 숨길지 여부 입니다.
   */
  @Prop({ type: Boolean }) public scrollAutoHide?: boolean;
  /**
   * Gantt의 Scroll Track 클릭시 이동할지 여부 입니다.
   */
  @Prop({ type: Boolean }) public scrollClickOnTrack?: boolean;
  /**
   * Gantt의 Scroll Track 클릭시 이동하는 속도 입니다.
   */
  @Prop({ type: Number }) public scrollClickOnTrackSpeed?: number;
  /**
   * Gantt에 추가 class를 설정할 수 있는 class list 입니다.
   */
  @Prop({ type: Array }) public classList?: string[];
  /**
   * Gantt에 추가 style을 설정할 수 있는 style object 입니다.
   */
  @Prop({ type: Object }) public styleObject?: object;
  /**
   * Gantt의 Cell Background Color 지정 방식입니다.
   */
  @Prop({ type: Boolean, default: false }) public isStringColor?: boolean;
  /**
   * Gantt의 Scroll 시작 위치 입니다.
   */
  @Prop({ type: Boolean, default: false }) public isEndPosition?: boolean;
  /**
   * Gantt Row의 Selected Color 입니다.
   */
  @Prop({ type: String, required: false }) public selectedColor?: string;
  /**
   * Gantt Header의 Text를 설정할 수 있는 함수입니다.<br>
   * 함수에서 return한 값으로 Header가 설정됩니다.
   */
  @Prop({ type: Function }) public setGanttHeaderText?: (
    text: string,
    type: GanttHeaderType,
    from: Date,
    to: Date,
  ) => string;
  /**
   * Gantt Header의 ClassList를 설정할 수 있는 함수입니다.<br>
   * 함수에서 return한 값으로 Header Cell의 class가 설정됩니다.
   */
  @Prop({ type: Function }) public setGanttHeaderClassList?: (
    text: string,
    type: GanttHeaderType,
    from: Date,
    to: Date,
  ) => string[];
  /**
   * Gantt Task의 tooltip을 설정 할 수 있는 함수입니다.<br>
   * 함수에서 return한 값으로 tooltip이 설정됩니다.
   */
  @Prop({ type: Function }) public setTaskTooltip?: (
    task: IGanttTask,
    row?: IGanttRow,
  ) => string | HTMLElement;
  /**
   * Gantt Milestone의 tooltip을 설정 할 수 있는 함수입니다.<br>
   * 함수에서 return한 값으로 tooltip이 설정됩니다.
   */
  @Prop({ type: Function }) public setMilestoneTooltip?: (
    milestone: IGanttMilestone,
    row?: IGanttRow,
  ) => string | HTMLElement;
  /**
   * Gantt의 각 Task가 Click됬을 때의 이벤트 입니다.
   */
  @Prop({ type: Function }) public onTaskClick?: (event: Event, task: IGanttTask) => void;
  /**
   * Gantt의 각 Milestone가 Click됬을 때의 이벤트 입니다.
   */
  @Prop({ type: Function }) public onMilestoneClick?: (
    event: Event,
    milestone: IGanttMilestone,
  ) => void;
  /**
   * Gantt의 각 Row가 Click됬을 때의 이벤트 입니다.
   */
  @Prop({ type: Function }) public onRowClick?: (event: Event, row: IGanttRow) => void;
  /**
   * Gantt의 각 Task의 Highlight 여부를 설정하는 함수 입니다.
   */
  @Prop({ type: Function }) public setHighlightTask?: (task: IGanttTask) => boolean;
  /**
   * Grid의 Cell의 Renderer 함수 입니다.
   */
  @Prop({ type: Function }) public setRenderCell?: (
    row: IGanttRow,
    column: Column,
    value: any,
  ) => string | HTMLElement;
  /**
   * Grid의 Cell class 설정 함수 입니다.
   */
  @Prop({ type: Function }) public setGridCellClass?: (
    row: IGanttRow,
    column: Column,
    value: any,
  ) => string;
  /**
   * Grid의 Row class 설정 함수 입니다.
   */
  @Prop({ type: Function }) public setGridRowClass?: (row: IGanttRow) => string;
  /**
   * Gantt의 Row class 설정 함수 입니다.
   */
  @Prop({ type: Function }) public setGanttRowClass?: (row: IGanttRow) => string;
  /**
   * Gantt의 Task class 설정 함수 입니다.
   */
  @Prop({ type: Function }) public setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
  /**
   * Gantt의 Milestone class 설정 함수 입니다.
   */
  @Prop({ type: Function }) public setGanttMilestoneClass?: (
    row: IGanttRow,
    milestone: IGanttMilestone,
  ) => string;
  /**
   * Gantt의 Loading 상태를 확인하는 함수 입니다.
   */
  @Prop({ type: Function }) public loadingChanged?: (loading: boolean) => void;

  public gantt: GanttComponent | null = null;

  constructor() {
    super();
  }

  public renderGantt() {
    this.gantt = new GanttComponent({
      parents: this.$refs.gantt as unknown as HTMLElement,
      ...createCamelProps<IGanttProps>(this.$props),
    });
    this.gantt.render();
  }

  public mounted() {
    this.renderGantt();
  }

  @Watch("minDate")
  public onChangeMinDate() {
    this.renderGantt();
  }

  @Watch("maxDate")
  public onChangeMaxDate() {
    if (!this.gantt) return;
    if (!this.gantt.ganttHeader) return;
    if (!this.gantt.ganttBody) return;
    this.gantt.maxDate = this.maxDate;
    this.gantt.ganttHeader.maxDate = this.maxDate;
    this.gantt.ganttBody.maxDate = this.maxDate;
  }

  @Watch("ganttWidthRate")
  public onChangeGanttWidthRate(newVal: number) {
    if (!this.gantt) return;
    if (!this.gantt.ganttBody) return;
    if (!this.gantt.ganttHeader) return;
    if (!this.gantt.ganttBodyScroll) return;
    if (!this.gantt.ganttBodyScroll.contentWrapperEl) return;
    this.gantt.ganttWidthRate = newVal;
    this.gantt.ganttHeader.ganttWidthRate = newVal;
    this.gantt.ganttBody.ganttWidthRate = newVal;
    this.gantt.ganttHeader.render();
    this.gantt.ganttBody.rowWidth = this.gantt.ganttHeader.calcRowWidth();
    this.gantt.ganttBody.render();
    this.gantt.renderRows();
    const ganttEl = this.gantt.ganttBodyScroll.contentWrapperEl;
    this.gantt.ganttBody.updateTasks(ganttEl.scrollLeft, ganttEl.scrollLeft + ganttEl.offsetWidth);
  }

  @Watch("highlightExpr")
  public async onChangeHighlightExpr(newObj: any) {
    if (!this.gantt) return;

    this.gantt.renderRows();
  }

  @Watch("ganttHeaders", { deep: true })
  public onChangeGanttHeaders(newVal: IGanttHeader[]) {
    if (!this.gantt) return;
    if (!this.gantt.gridHeader) return;
    if (!this.gantt.ganttHeader) return;
    if (!this.gantt.gridHeaderPane) return;
    if (!this.gantt.ganttHeaderPane) return;
    this.gantt.ganttHeaders = newVal;
    this.gantt.ganttHeader.headers = newVal;
    this.gantt.headerRowHeight = this.headerRowHeight || 22;
    this.gantt.ganttTaskLine = this.ganttTaskLine;
    const { gridHeaderRowHeight, gridHeaderRowCount, ganttHeaderRowHeight, maxRowHeight } =
      this.gantt.calcRowHeight();
    this.gantt.gridHeader.rowHeight = gridHeaderRowHeight;
    this.gantt.gridHeader.rowCount = gridHeaderRowCount;
    this.gantt.ganttHeader.rowHeight = ganttHeaderRowHeight;
    this.gantt.gridHeaderPane.size = `${maxRowHeight}px`;
    this.gantt.ganttHeaderPane.size = `${maxRowHeight}px`;
    this.gantt.gridHeaderPane.update();
    this.gantt.ganttHeaderPane.update();
    this.gantt.gridHeader.render();
    this.gantt.ganttHeader.render();
  }

  @Watch("styleObject", { deep: true })
  public onChangeStyleObject(newVal: object) {
    if (!this.gantt) return;
    if (!this.gantt.element) return;
    Object.assign(this.gantt.element.style, newVal);
  }

  @Watch("rowHeight")
  public async onChangeRowHeight(newVal: number) {
    if (!this.gantt) return;
    if (!this.gantt.ganttBody) return;
    if (!this.gantt.gridBody) return;
    this.gantt.rowHeight = newVal;
    this.gantt.ganttBody.rowHeight = newVal;
    this.gantt.gridBody.rowHeight = newVal;
    await this.gantt.renderData();
  }

  @Watch("taskHeight")
  public async onChangeTaskHeight(newVal: number) {
    if (!this.gantt) return;
    if (!this.gantt.ganttBody) return;
    this.gantt.taskHeight = newVal;
    this.gantt.ganttBody.taskHeight = newVal;
    await this.gantt.renderData();
  }

  public getSelectedTask() {
    if (!this.gantt) return;
    if (!this.gantt.ganttBody) return;

    return this.gantt.ganttBody.selectedTask;
  }

  public getGanttScroll() {
    if (!this.gantt) return;

    return this.gantt.ganttBodyScroll;
  }

  public getGridScroll() {
    if (!this.gantt) return;

    return this.gantt.gridBodyScroll;
  }

  public async createPdfElement(options: { height: number }) {
    if (!this.gantt) return;
    if (!this.gantt.ganttHeader) return;
    if (!this.gantt.gridHeader) return;
    const { height } = options;
    const gridWidth = this.gantt.gridHeader.getDataColumns().reduce((sum, col) => {
      return sum + col.width;
    }, 0);
    const ganttWidth = this.gantt.ganttHeader.calcRowWidth();
    const element = document.createElement("div");
    const width = gridWidth + ganttWidth;
    element.style.position = "absolute";
    element.style.top = "0px";
    element.style.left = "0px";
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    document.body.appendChild(element);
    this.gantt = new GanttComponent({
      parents: element,
      ...createCamelProps<IGanttProps>(this.$props),
    });
    this.gantt.render();
    return element;
  }

  public render(h: CreateElement): VNode {
    const props: any[] = [];
    Object.keys(this.$props).forEach(key => {
      props.push(this.$props[key]);
    });
    return h("div", {
      ref: "gantt",
    });
  }
}
</script>
