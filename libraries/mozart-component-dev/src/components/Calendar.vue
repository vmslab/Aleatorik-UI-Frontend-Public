<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { without, debounce } from "lodash";
import dayjs, { Dayjs } from "dayjs";
import {
  CalendarEvent,
  getTextColor,
  getKeyColor,
  getLightKeyColor,
  getOpacityColor,
  EventBus,
} from "mozart-common";
import { getHeight } from "../utils/elementUtil";
import { ICalendarEvent, getTooltipPosition } from "mozart-common";

@Component({
  name: "Calendar",
  components: {},
})
export default class Calendar extends Vue {
  /**
   * 높이 입니다.
   */
  @Prop({ type: Number, default: 300 }) public height!: number;
  /**
   * 상단 각각의 높이 입니다.<br>
   * 월 정보, 주 정보
   */
  @Prop({ type: Number, default: 40 }) public topHeight!: number;
  /**
   * 달력의 일자 Font 크기 입니다.
   */
  @Prop({ type: Number, default: 14 }) public fontSize!: number;
  /**
   * 몇 주를 표시할지 정합니다.
   */
  @Prop({ type: Number, default: 5 }) public weekLength!: number;
  /**
   * 보이지 않을 주를 선택합니다.<br>
   * - 0: 일요일<br>
   * - 1: 월요일<br>
   * - 2: 화요일<br>
   * - 3: 수요일<br>
   * - 4: 목요일<br>
   * - 5: 금요일<br>
   * - 6: 토요일<br>
   */
  @Prop({ type: Array }) public exceptWeeks?: number[];
  /**
   * i18n 입니다.<br>
   * en, ko, fr, de, etc...
   */
  @Prop({ type: String, default: "en" }) public locale!: string;
  /**
   * 오늘을 표시하는 색상 입니다.
   */
  @Prop({ type: String, default: "#e05a69" }) public todayColor!: string;
  /**
   * 날짜를 표시하는 포맷 입니다.
   */
  @Prop({ type: String, default: "DD" }) public dayFormat!: string;
  /**
   * 달력의 최소 폭 입니다.
   */
  @Prop({ type: Number, default: 450 }) public minWidth!: number;
  /**
   * 이벤트 입니다.<br>
   * `ICalendarEvent`객체 List 입니다.<br>
   * - start: 시작 시간 입니다. ex) 2021-01-02<br>
   * - end: 종료 시간 입니다. ex) 2021-01-03<br>
   * - repeat: 반복 여부 입니다. ( never, yearly, monthly )<br>
   * - tooltip: Tooltip 표기 Html 입니다.<br>
   * - backgroundColor: 배경색 입니다.<br>
   */
  @Prop({ type: Array }) public events?: ICalendarEvent[];

  private today: Dayjs;
  public io!: IntersectionObserver;
  private refresh: boolean = false;
  private scrollTopWeeks: number = 0;
  private classEvents: CalendarEvent[] = [];
  private colorDic: Record<string, any> = {};
  private lightColorDic: Record<string, any> = {};

  constructor() {
    super();
    this.today = dayjs(new Date());
  }

  protected created() {
    EventBus.register("theme-changed", this.onThemeChanged);
  }

  protected destroyed() {
    EventBus.remove("theme-changed", this.onThemeChanged);
  }

  public mounted() {
    dayjs.locale(this.locale);
    this.classEvents =
      this.events?.map((evt: ICalendarEvent) => {
        return new CalendarEvent(evt);
      }) || [];
    this.$nextTick(() => {
      this.init();
    });
  }

  public beforeDestroy() {
    if (this.io) {
      this.io.disconnect();
    }
  }

  private get weeks() {
    return without([0, 1, 2, 3, 4, 5, 6], ...(this.exceptWeeks || []));
  }

  private get calendarInfo(): { start: number; end: number } {
    let today = this.today.clone();
    let start: number = 0;
    let end: number = 0;
    const fmt = "YYYYMM";
    const monthArr = [
      today.subtract(1, "M").format(fmt),
      today.add(0, "M").format(fmt),
      today.add(1, "M").format(fmt),
    ];
    today = this.today.clone();
    while (true) {
      if (!monthArr.includes(today.format(fmt))) {
        let flag = true;
        for (let week of this.weeks) {
          if (monthArr.includes(today.day(week).format(fmt))) {
            flag = false;
            break;
          }
        }
        if (!flag) {
          start--;
        }
        break;
      }
      today = today.subtract(1, "w");
      start--;
    }
    today = this.today.clone();
    while (true) {
      if (!monthArr.includes(today.format(fmt))) {
        let flag = true;
        for (let week of this.weeks) {
          if (monthArr.includes(today.day(week).format(fmt))) {
            flag = false;
            break;
          }
        }
        if (flag) {
          end--;
        }
        break;
      }
      today = today.add(1, "w");
      end++;
    }
    return { start, end };
  }

  private get formatMonth(): string {
    return this.today.format("YYYY, MMMM");
  }

  private get calcHeight(): number {
    return getHeight(this, this.height);
  }

  private get weekHeight(): number {
    return (this.calcHeight - this.topHeight * 2) / this.weekLength;
  }

  private get dayHeight(): number {
    return (this.weekHeight / 3) * 2;
  }

  private get todayString(): string {
    switch (this.locale) {
      case "ko":
        return "오늘";
      case "fr":
        return "Aujourd'hui";
      case "de":
        return "Heute";
      case "es":
        return "Hoy dia";
      case "ch":
        return "今天";
      case "jp":
        return "今日";
      default:
        return "Today";
    }
  }

  @Watch("today")
  public onChangeToday(newVal: Dayjs, oldVal: Dayjs) {
    if (newVal !== oldVal) {
      this.$nextTick(() => {
        this.init();
      });
    }
  }

  @Watch("events")
  public onChangeEvents(newVal: ICalendarEvent[], oldVal: ICalendarEvent[]) {
    if (newVal !== oldVal) {
      this.classEvents =
        this.events?.map((evt: ICalendarEvent) => {
          return new CalendarEvent(evt);
        }) || [];
    }
  }

  public init() {
    const body = this.$refs.body as HTMLDivElement;
    if (!body) {
      return;
    }
    if (body.scrollHeight) {
      body.scrollTop = this.scrollTopWeeks * this.weekHeight;
      if (body.scrollTop > 0) {
        if (!this.io) {
          this.io = new IntersectionObserver(
            debounce((entries: IntersectionObserverEntry[]) => {
              entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                  if (entry.target.className === "week-top") {
                    this.io.unobserve(this.$refs.top as any);
                    this.onPrev();
                  } else if (entry.target.className === "week-bottom") {
                    this.io.unobserve(this.$refs.bottom as any);
                    this.onNext();
                  }
                }
              });
            }, 250),
            { threshold: 0.9 },
          );
        }
        this.io.observe(this.$refs.top as any);
        this.io.observe(this.$refs.bottom as any);
      }
    }
  }

  private getForeColor(mmt: Dayjs, color: any) {
    if (color === "unset") {
      if (this.today.format("YYYYMM") === mmt.format("YYYYMM")) {
        return "var(--color-font3)";
      } else {
        return "var(--color-font6)";
      }
    } else {
      return getTextColor(color);
    }
  }

  private getBackColor(mmt: Dayjs, events: CalendarEvent[], defaultColor: string): string {
    const { color } = events.reduce(
      (result: { color: string | null; order: number }, evt: CalendarEvent) => {
        const color = evt.backgroundColor
          ? evt.backgroundColor
          : getKeyColor(evt.title!, { colorHash: this.colorDic });
        const order = evt.getOrder(mmt);
        if (result.order <= order) {
          return {
            color,
            order,
          };
        }
        return result;
      },
      { color: null, order: 0 },
    );
    return color || defaultColor;
  }

  private getBeforeColor(mmt: Dayjs, events: CalendarEvent[], defaultColor: string): string {
    const { color } = events.reduce(
      (result: { color: string | null; order: number }, evt: CalendarEvent) => {
        const color = evt.backgroundColor
          ? getOpacityColor(evt.backgroundColor, 0.5)
          : getLightKeyColor(evt.title!, { colorHash: this.lightColorDic });
        const order = evt.getOrder(mmt);
        if (result.order <= order) {
          return {
            color,
            order,
          };
        }
        return result;
      },
      { color: null, order: 0 },
    );
    return color || defaultColor;
  }

  private getAfterColor(mmt: Dayjs, events: CalendarEvent[], defaultColor: string): string {
    const { color } = events.reduce(
      (result: { color: string | null; order: number }, evt: CalendarEvent) => {
        const color = evt.backgroundColor
          ? getOpacityColor(evt.backgroundColor, 0.5)
          : getLightKeyColor(evt.title!, { colorHash: this.lightColorDic });
        const order = evt.getOrder(mmt);
        if (result.order <= order) {
          return {
            color,
            order,
          };
        }
        return result;
      },
      { color: null, order: 0 },
    );
    return color || defaultColor;
  }

  private getStyleInfo(
    mmt: Dayjs,
    events: CalendarEvent[],
  ): {
    borderColor: string;
    backColor: string;
    beforeLightColor: string;
    afterLightColor: string;
    foreColor: string;
    before: boolean;
    after: boolean;
    length: number;
    tooltip: string;
  } {
    const borderColor: string = this.getBorderColor(mmt);
    const backColor = this.getBackColor(mmt, events, borderColor);
    return {
      borderColor,
      backColor,
      beforeLightColor: this.getBeforeColor(mmt, events, borderColor),
      afterLightColor: this.getAfterColor(mmt, events, borderColor),
      foreColor: this.getForeColor(mmt, backColor),
      before: events?.some(e => e.isBefore(mmt)) || false,
      after: events?.some(e => e.isAfter(mmt)) || false,
      length: events?.length || 0,
      tooltip:
        events?.reduce((result: string, calEvt: CalendarEvent, i: number) => {
          if (calEvt.tooltip) {
            result = result.concat(calEvt.tooltip, i < events.length - 1 ? "<br>" : "");
          }
          return result;
        }, "") || "",
    };
  }

  private getBorderColor(mmt: Dayjs) {
    if (dayjs().isSame(mmt, "day")) {
      return this.todayColor;
    }
    return "unset";
  }

  private getWeekStart(mmt: Dayjs) {
    return mmt.day() === this.weeks[0];
  }

  private getWeekEnd(mmt: Dayjs) {
    return mmt.day() === this.weeks[this.weeks.length - 1];
  }

  private getRef(i: number, info: any) {
    if (i === info.start) {
      return "top";
    } else if (i === info.end - 1) {
      return "bottom";
    }
    return null;
  }

  private onPrev() {
    this.today = this.today.subtract(1, "M");
  }

  private onNext() {
    this.today = this.today.add(1, "M");
  }

  private onGoToToday() {
    this.today = dayjs();
  }

  private onClick(date: string, events: CalendarEvent[]) {
    /**
     * 날짜 클릭 이벤트 입니다.<br>
     * - date: 현재 날짜 입니다. format => YYYY-MM-DD<br>
     * - events : 이벤트의 정보를 담고 있는 `CalendarEvent` List 입니다.
     */
    this.$emit("dateClick", date, events);
  }

  public onThemeChanged(evt: any) {
    this.colorDic = {};
    this.lightColorDic = {};
    this.refresh = !this.refresh;
  }

  public render(h: CreateElement): VNode {
    const refresh = this.refresh;
    this.scrollTopWeeks = 0;
    const children: VNode[] = [];
    children.push(
      h("div", [
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              height: `${this.topHeight}px`,
              padding: `0px ${this.topHeight}px`,
            },
          },
          [
            h(
              "div",
              {
                class: "btn-month",
                ref: "month",
              },
              this.formatMonth,
            ),
            h("div", { class: "spacer" }),
            h("div", { class: "btn-prev", on: { click: this.onPrev } }),
            h("div", { class: "btn-today", on: { click: this.onGoToToday } }, this.todayString),
            h("div", { class: "btn-next", on: { click: this.onNext } }),
          ],
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-around",
              paddingRight: "8px",
              height: `${this.topHeight}px`,
            },
          },
          this.weeks.map((week: number, i: number) => {
            return h("div", { class: "week", key: `weeks-${i}` }, dayjs().day(week).format("ddd"));
          }),
        ),
      ]),
    );
    const body: VNode[] = [];
    const calendarInfo = this.calendarInfo;
    const weekHeight = this.weekHeight;
    const dayHeight = this.dayHeight;
    let mmt = this.today.clone().add(calendarInfo.start, "w");
    let scrollTopFlag = true;
    let scrollTopWeek = 0;
    for (let i = calendarInfo.start; i < calendarInfo.end; i++) {
      mmt = mmt.add(1, "w");
      const weekRef = this.getRef(i, calendarInfo);
      body.push(
        h(
          "div",
          {
            class: weekRef ? `week-${weekRef}` : null,
            style: {
              display: "flex",
              justifyContent: "space-around",
              height: `${weekHeight}px`,
            },
            ref: weekRef ? weekRef : undefined,
            key: `week-${i}`,
          },
          this.weeks.map((week: number) => {
            const mmtday = mmt.day(week);
            const fmtday = mmtday.format("YYYY-MM-DD");
            const events = this.classEvents.filter((evt: CalendarEvent) => evt.containsDay(mmtday));
            const {
              borderColor,
              backColor,
              beforeLightColor,
              afterLightColor,
              foreColor,
              before,
              after,
              length,
              tooltip,
            } = this.getStyleInfo(mmtday, events);
            if (scrollTopFlag) {
              if (mmtday.format("YYYYMM") === this.today.format("YYYYMM")) {
                scrollTopFlag = false;
              }
            }
            const cellChildren: VNode[] = [];
            const isWeekStart = this.getWeekStart(mmtday);
            cellChildren.push(
              h("div", {
                class: "inner-before-cell",
                style: {
                  backgroundColor: before ? beforeLightColor : null,
                  height: `${dayHeight}px`,
                  top: `${dayHeight / 4}px`,
                  borderBottomLeftRadius: isWeekStart ? `${dayHeight / 2}px` : 0,
                  borderTopLeftRadius: isWeekStart ? `${dayHeight / 2}px` : 0,
                },
              } as any),
            );
            const isWeekEnd = this.getWeekEnd(mmtday);
            cellChildren.push(
              h("div", {
                class: "inner-after-cell",
                style: {
                  backgroundColor: after ? afterLightColor : null,
                  height: `${dayHeight}px`,
                  top: `-${(dayHeight / 4) * 3}px`,
                  borderBottomRightRadius: isWeekEnd ? `${dayHeight / 2}px` : 0,
                  borderTopRightRadius: isWeekEnd ? `${dayHeight / 2}px` : 0,
                },
              } as any),
            );
            cellChildren.push(
              h(
                "div",
                {
                  class: "inner-cell",
                  style: {
                    color: foreColor,
                    boxShadow:
                      borderColor === "unset"
                        ? borderColor
                        : `0 0 0 3px var(--color-back), 0 0 0 6px ${borderColor}`,
                    backgroundColor: backColor,
                    // fontSize: `${this.fontSize}px`,
                    width: `${dayHeight}px`,
                    height: `${dayHeight}px`,
                    top: `-${dayHeight * 2 - dayHeight / 4}px`,
                    // cursor: length > 0 ? "pointer" : "default",
                    cursor: "pointer",
                  },
                  on: {
                    click: () => this.onClick(fmtday, events),
                    mouseover: (evt: MouseEvent) => {
                      if (tooltip) {
                        const el = document.createElement("div");
                        el.className = "tooltip tooltip-top-left-tb";
                        el.innerHTML = tooltip;
                        document.body.appendChild(el);
                        const { xKey, xPos, yKey, yPos } = getTooltipPosition(
                          el,
                          evt,
                          "elupdown",
                          true,
                        );
                        el.style[xKey as any] = `${xPos}px`;
                        el.style[yKey as any] = `${yPos}px`;
                      }
                    },
                    mouseout: (evt: MouseEvent) => {
                      const els = document.getElementsByClassName("tooltip");
                      if (els && els.length > 0) {
                        document.body.removeChild(els[0]);
                      }
                    },
                  },
                },
                mmtday.format(this.dayFormat),
              ),
            );
            if (length > 1) {
              cellChildren.push(
                h(
                  "div",
                  {
                    class: "inner-count-cell",
                    style: {
                      width: `${dayHeight / 2}px`,
                      height: `${dayHeight / 2}px`,
                      // fontSize: `${this.fontSize * 0.72}px`,
                      top: `-${dayHeight * 3 - dayHeight / 8}px`,
                    },
                  },
                  String(length),
                ),
              );
            }
            return h(
              "div",
              {
                class: "outer-cell",
                key: mmtday.format("YYYYMMDD"),
              },
              cellChildren,
            );
          }),
        ),
      );
      if (scrollTopFlag) {
        scrollTopWeek++;
      }
    }
    children.push(
      h(
        "div",
        {
          style: {
            height: `${this.calcHeight - this.topHeight * 2}px`,
            overflow: "hidden auto",
          },
          ref: "body",
        },
        body,
      ),
    );
    this.scrollTopWeeks = scrollTopWeek;
    return h(
      "div",
      {
        class: "moz-calendar",
        style: {
          width: `100%`,
          overflow: "hidden",
          minWidth: `${this.minWidth}px`,
        },
      },
      children,
    );
  }
}
</script>
