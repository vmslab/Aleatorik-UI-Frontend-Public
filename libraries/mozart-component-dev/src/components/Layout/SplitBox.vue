<script lang="ts">
import { CreateElement, VNode } from "vue";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ILayoutBox, LayoutBox, SizeType, IPoint, EventBus } from "mozart-common";
import { getWidth, getHeight } from "../../utils/elementUtil";

import Box from "./Box.vue";
import Spliter from "./Spliter.vue";

@Component({
  name: "SplitBox",
  components: {
    Box,
    Spliter,
  },
})
export default class SplitBox extends Vue {
  /**
   * SplitBox의 넓이 입니다.<br>
   * 값을 주지 않을 경우 부모 Element의 넓이를 가져옵니다.
   */
  @Prop({ type: [Number, String] }) public width?: number | string;
  /**
   * SplitBox의 높이 입니다.<br>
   * 값을 주지 않을 경우 부모 Element의 높이를 가져옵니다.
   */
  @Prop({ type: [Number, String] }) public height?: number | string;
  /**
   * SplitBox의 최소 넓이 입니다.<br>
   */
  @Prop({ type: Number, default: 0 }) public minWidth!: number;
  /**
   * SplitBox의 최소 높이 입니다.<br>
   */
  @Prop({ type: Number, default: 0 }) public minHeight!: number;
  /**
   * SplitBox의 Box수 및 비율 입니다.<br>
   * `ILayoutBox`배열로 값을 주면, 배열의 수 많큼 Box를 만들고,<br>
   * type에 따른 크기가 계산되어 Box가 생성됩니다.<br>
   * type은 **fix**, **rate**가 있습니다.<br>
   * - fix : size가 고정 값으로 사용됩니다.<br>
   * - rate : size가 비율로 사용됩니다.
   */
  @Prop({ type: Array, default: () => [{ type: "rate", size: 1 }] }) public boxes!: ILayoutBox[];
  /**
   * SplitBox의 Box 생성 방향입니다.<br>
   * **true**일 경우 가로 방향으로 Box가 생성됩니다.
   */
  @Prop({ type: Boolean, default: false }) public horizontal!: boolean;
  /**
   * Box간의 공백 값입니다.
   */
  @Prop({ type: Number, default: 10 }) public innerMargin!: number;
  /**
   * 외부 Margin 값입니다.
   */
  @Prop({ type: Number, default: 0 }) public outerMargin!: number;
  /**
   * Box의 배경색 입니다.
   */
  @Prop({ type: String, default: "transparent" }) public backgroundColor?: string;
  /**
   * 외부 배경색 입니다.
   */
  @Prop({ type: String, default: "transparent" }) public outerBackgroundColor?: string;
  /**
   * Size조절 가능 여부입니다.
   */
  @Prop({ type: Boolean, default: false }) public resizable!: boolean;

  private calcHeight: number = 0;
  private calcWidth: number = 0;

  private layoutBoxes: LayoutBox[] = [];
  private container?: HTMLElement;
  private touch: {
    mouseDown: boolean;
    dragging: boolean;
    activeSplitter: number | null;
    position: IPoint | null;
  } = {
    mouseDown: false,
    dragging: false,
    activeSplitter: null,
    position: null,
  };
  public titleHeight: number = 55;
  public textPaddingWidth: number = 64;
  public textPaddingHeight: number = 52;

  public observer: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
    this.$nextTick(() => {
      EventBus.fire("theme-changed");
    });
  });

  constructor() {
    super();
  }

  public created() {
    EventBus.register("theme-changed", this.onRerender);
    // TODO: 다른 방법은 없을까?...
    EventBus.register("horizontal-filter-toggle", this.onRerender);
    EventBus.register("close-left-drawer", this.onRerender);
    EventBus.register("open-left-drawer", this.onRerender);
  }

  public mounted() {
    this.container = this.$refs.container as HTMLElement;
    this.setLayoutBoxes();
    this.calcSize();
    if (this.$parent && this.$parent.$el) {
      this.observer.observe(this.$parent.$el);
    }
  }

  public beforeDestroy() {
    EventBus.remove("theme-changed", this.onRerender);
    // TODO: 다른 방법은 없을까?...
    EventBus.remove("horizontal-filter-toggle", this.onRerender);
    EventBus.remove("close-left-drawer", this.onRerender);
    EventBus.remove("open-left-drawer", this.onRerender);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  public setLayoutBoxes() {
    if (this.boxes) {
      this.layoutBoxes = this.boxes.map(box => new LayoutBox(box));
    }
  }

  public get ratedSizeSum(): number {
    return this.layoutBoxes.reduce((sum: number, box: ILayoutBox) => {
      return sum + (box.type === "rate" ? box.size : 0);
    }, 0);
  }

  public get length(): number {
    return this.layoutBoxes.filter((size: ILayoutBox) => size.type === "rate").length;
  }

  public getStringToHeight(val: string, def: number = 0) {
    if (val.endsWith("px")) {
      return +val.replace("px", "");
    } else {
      return def;
    }
  }

  public getSizeToNumber(size?: number | string, def: number = 0) {
    if (!size) return def;

    if (typeof size === "number") {
      return size;
    } else if (typeof size === "string") {
      if (size.startsWith("var")) {
        const varName = size.replace("var(", "").replace(")", "");
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
        return this.getStringToHeight(value, def);
      } else {
        return this.getStringToHeight(size, def);
      }
    }
  }

  // @Watch("boxes")
  // public onChangeBoxes(newVal: ILayoutBox[], oldVal: ILayoutBox[]) {
  //   if (newVal !== oldVal) {
  //     this.setLayoutBoxes();
  //   }
  // }

  @Watch("width")
  public onChangeWidth(newVal: number, oldVal: number) {
    if (newVal !== oldVal) {
      this.calcSize();
    }
  }

  @Watch("height")
  public onChangeHeight(newVal: number | string, oldVal: number | string) {
    if (newVal !== oldVal) {
      this.calcSize();
    }
  }

  public onRerender(evt: any) {
    this.calcSize();
  }

  private bindEvents() {
    document.addEventListener("mousemove", this.onMouseMove, { passive: false });
    document.addEventListener("mouseup", this.onMouseUp);

    if ("ontouchstart" in window) {
      document.addEventListener("touchmove", this.onMouseMove, { passive: false });
      document.addEventListener("touchend", this.onMouseUp);
    }
  }

  private unbindEvents() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);

    if ("ontouchstart" in window) {
      document.removeEventListener("touchmove", this.onMouseMove);
      document.removeEventListener("touchend", this.onMouseUp);
    }
  }

  private calcRateWidth(calcWidth: number, ratedSizeSum: number): number {
    if (ratedSizeSum === 0) return calcWidth;
    calcWidth -= this.layoutBoxes
      .filter((box: LayoutBox) => box.type === SizeType.Rate && !box.isFix)
      .reduce((sum: number, box: LayoutBox) => {
        const size = (box.size * calcWidth) / ratedSizeSum;
        if (box.minWidth && size < box.minWidth) {
          box.isFix = true;
          box.width = box.minWidth;
          sum += box.minWidth;
        } else {
          box.isFix = false;
        }
        return sum;
      }, 0);
    const sizeSum = this.layoutBoxes
      .filter((box: LayoutBox) => !box.isFix)
      .reduce((sum: number, box: LayoutBox) => sum + box.size, 0);
    if (sizeSum === 0) return calcWidth;
    if (sizeSum === ratedSizeSum) {
      this.layoutBoxes
        .filter((box: LayoutBox) => !box.isFix)
        .forEach((box: LayoutBox) => (box.width = (box.size * calcWidth) / sizeSum));
    } else {
      calcWidth = this.calcRateWidth(calcWidth, sizeSum);
    }
    return calcWidth;
  }

  private setWidth(): number {
    let calcWidth = 0;
    let width =
      getWidth(this.$parent as Vue, this.getSizeToNumber(this.width, this.$el.clientWidth)) - this.outerMargin * 2;
    if (width < this.minWidth) {
      width = this.minWidth;
    }
    if (width) {
      if (this.horizontal) {
        calcWidth = width - this.innerMargin * (this.layoutBoxes.length - 1);
        calcWidth -= this.layoutBoxes
          .filter((box: LayoutBox) => box.type === SizeType.Fix)
          .reduce((sum: number, box: LayoutBox) => {
            box.isFix = true;
            box.width = box.size;
            return sum + box.size;
          }, 0);
        this.layoutBoxes
          .filter((box: LayoutBox) => box.type !== SizeType.Fix)
          .forEach((box: LayoutBox) => {
            box.isFix = false;
          });
        calcWidth = this.calcRateWidth(calcWidth, this.ratedSizeSum);
      } else {
        calcWidth = width;
        this.layoutBoxes.forEach((box: LayoutBox) => (box.width = width));
      }
    }
    return calcWidth;
  }

  private calcRateHeight(calcHeight: number, ratedSizeSum: number): number {
    if (ratedSizeSum === 0) return calcHeight;
    calcHeight -= this.layoutBoxes
      .filter((box: LayoutBox) => box.type === SizeType.Rate && !box.isFix)
      .reduce((sum: number, box: LayoutBox) => {
        const size = (box.size * calcHeight) / ratedSizeSum;
        if (box.minHeight && size < box.minHeight) {
          box.isFix = true;
          box.height = box.minHeight;
          sum += box.minHeight;
        } else {
          box.isFix = false;
        }
        return sum;
      }, 0);
    const sizeSum = this.layoutBoxes
      .filter((box: LayoutBox) => !box.isFix)
      .reduce((sum: number, box: LayoutBox) => sum + box.size, 0);
    if (sizeSum === 0) return calcHeight;
    if (sizeSum === ratedSizeSum) {
      this.layoutBoxes
        .filter((box: LayoutBox) => !box.isFix)
        .forEach((box: LayoutBox) => (box.height = (box.size * calcHeight) / sizeSum));
    } else {
      calcHeight = this.calcRateHeight(calcHeight, sizeSum);
    }
    return calcHeight;
  }

  private setHeight(): number {
    let calcHeight = 0;
    let height =
      getHeight(this.$parent as Vue, this.getSizeToNumber(this.height, this.$el.clientHeight)) - this.outerMargin * 2;
    if (height < this.minHeight) {
      height = this.minHeight;
    }
    if (height) {
      if (this.horizontal) {
        calcHeight = height;
        this.layoutBoxes.forEach((box: LayoutBox) => (box.height = height));
      } else {
        calcHeight = height - this.innerMargin * (this.layoutBoxes.length - 1);
        calcHeight -= this.layoutBoxes
          .filter((box: LayoutBox) => box.type === SizeType.Fix)
          .reduce((sum: number, box: LayoutBox) => {
            box.isFix = true;
            box.height = box.size;
            return sum + box.size;
          }, 0);
        this.layoutBoxes
          .filter((box: LayoutBox) => box.type !== SizeType.Fix)
          .forEach((box: LayoutBox) => {
            box.isFix = false;
          });
        calcHeight = this.calcRateHeight(calcHeight, this.ratedSizeSum);
      }
    }
    return calcHeight;
  }

  private unFocus(document: any, window: any) {
    if (document.selection) {
      document.selection.empty();
    } else {
      try {
        window.getSelection().removeAllRanges();
      } catch (e) {
        //
      }
    }
  }

  private getCurrentMouseDrag(event: any): IPoint {
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      const { clientX, clientY } = "ontouchstart" in window && event.touches ? event.touches[0] : event;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }
    return {
      x: 0,
      y: 0,
    };
  }

  private calculatePanesSize(drag: IPoint) {
    if (this.touch.position) {
      const splitterIndex = this.touch.activeSplitter || 0;
      const prevBox = this.layoutBoxes[splitterIndex - 1];
      const nextBox = this.layoutBoxes[splitterIndex];
      const oldPos = this.touch.position[this.horizontal ? "x" : "y"];
      const newPos = drag[this.horizontal ? "x" : "y"];
      const calcMove = Math.abs(newPos - oldPos);
      const prevBoxPx = prevBox[this.horizontal ? "width" : "height"] || 0;
      const nextBoxPx = nextBox[this.horizontal ? "width" : "height"] || 0;
      const prevBoxMinPx = prevBox[this.horizontal ? "minWidth" : "minHeight"];
      const nextBoxMinPx = nextBox[this.horizontal ? "minWidth" : "minHeight"];
      const calcPrevSize = prevBoxPx > 0 ? (calcMove * prevBox.size) / prevBoxPx : 0;
      const calcNextSize = nextBoxPx > 0 ? (calcMove * nextBox.size) / nextBoxPx : 0;
      let prevBoxSize: number;
      let nextBoxSize: number;
      let calcPrevBoxPx: number;
      let calcNextBoxPx: number;
      if (newPos > oldPos) {
        prevBoxSize = prevBox.size + calcPrevSize;
        nextBoxSize = nextBox.size - calcNextSize;
        calcPrevBoxPx = prevBoxPx + calcMove;
        calcNextBoxPx = nextBoxPx - calcMove;
      } else {
        prevBoxSize = prevBox.size - calcPrevSize;
        nextBoxSize = nextBox.size + calcNextSize;
        calcPrevBoxPx = prevBoxPx - calcMove;
        calcNextBoxPx = nextBoxPx + calcMove;
      }
      if (calcPrevBoxPx >= prevBoxMinPx && calcNextBoxPx >= nextBoxMinPx) {
        prevBox.size = prevBoxSize;
        nextBox.size = nextBoxSize;
        this.touch.position = drag;
      }
      this.calcSize();
    }
  }

  private onMouseDown(event: MouseEvent, idx: number, resizable: boolean) {
    if (resizable) {
      this.unFocus(document, window);
      this.bindEvents();
      this.touch.mouseDown = true;
      this.touch.activeSplitter = idx;
      this.touch.position = this.getCurrentMouseDrag(event);
    }
  }

  private onMouseMove(event: MouseEvent | TouchEvent) {
    if (this.touch.mouseDown) {
      event.preventDefault();
      this.touch.dragging = true;
      this.calculatePanesSize(this.getCurrentMouseDrag(event));
    }
  }

  private onMouseUp() {
    if (this.touch.mouseDown) {
      this.touch.mouseDown = false;
      setTimeout(() => {
        this.touch.dragging = false;
        this.unbindEvents();
      }, 100);
    }
  }

  public calcCardSize() {
    const cardTitleHeight = getComputedStyle(document.documentElement).getPropertyValue("--size-card-title-height");
    const cartTopPadding = getComputedStyle(document.documentElement).getPropertyValue("--size-card-top-padding");
    const cartRblPadding = getComputedStyle(document.documentElement).getPropertyValue("--size-card-rbl-padding");
    const borderOuter = getComputedStyle(document.documentElement).getPropertyValue("--border-outer");
    const borderSize = borderOuter === "none" ? 0 : 1;
    const topPadding = this.getStringToHeight(cartTopPadding, 20);
    const rblPadding = this.getStringToHeight(cartRblPadding, 32) + borderSize;
    this.titleHeight = this.getStringToHeight(cardTitleHeight, 55) + borderSize;
    this.textPaddingWidth = rblPadding * 2;
    this.textPaddingHeight = topPadding + rblPadding;
  }

  public calcSize() {
    this.calcWidth = this.setWidth();
    this.calcHeight = this.setHeight();
    this.calcCardSize();
  }

  public render(h: CreateElement): VNode {
    // const renderToggle = this.renderToggle;
    const props: any[] = [];
    Object.keys(this.$props).forEach(key => {
      props.push(this.$props[key]);
    });
    // const calcWidth = this.setWidth();
    // const calcHeight = this.setHeight();
    const children: any[] = this.layoutBoxes.reduce((result: any[], box: LayoutBox, i: number) => {
      if (i > 0) {
        const prevBox = this.layoutBoxes[i - 1];
        const resizable = this.resizable && prevBox.isResizable && box.isResizable;
        result.push(
          h(Spliter, {
            props: {
              width: this.horizontal ? this.innerMargin : this.calcWidth,
              height: this.horizontal ? this.calcHeight : this.innerMargin,
              horizontal: this.horizontal,
              resizable,
              onMouseDown: (event: MouseEvent) => this.onMouseDown(event, i, resizable),
            },
            ref: `spliter${i}`,
          }),
        );
      }
      result.push(
        h(Box, {
          props: {
            width: box.width,
            height: box.height,
            scroll: box.scroll,
            auto: box.auto,
            backgroundColor: this.backgroundColor,
          },
          ref: `box${i}`,
          scopedSlots: {
            default: (props: any) => {
              const slot = this.$scopedSlots[`box${i + 1}`];
              if (slot) {
                return slot({
                  parentsWidth: props.parentsWidth,
                  parentsHeight: props.parentsHeight,
                  contentsHeight: props.parentsHeight - this.titleHeight,
                  contentsInnerHeight: props.parentsHeight - this.titleHeight - this.textPaddingHeight,
                  contentsInnerWidth: props.parentsWidth - this.textPaddingWidth,
                });
              }
              return null;
            },
          },
        }),
      );
      return result;
    }, []);
    return h(
      "div",
      {
        class: "moz-split-box",
        style: {
          display: this.horizontal ? "flex" : "block",
          margin: `${this.outerMargin}px`,
          backgroundColor: this.outerBackgroundColor,
          minWidth: `${this.minWidth}px`,
          minHeight: `${this.minHeight}px`,
          overflow: "visible",
        },
        ref: "container",
      },
      children,
    );
  }
}
</script>
