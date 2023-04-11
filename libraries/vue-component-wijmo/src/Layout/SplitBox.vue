<template>
  <div
    class="moz-split-box"
    :style="{
      display: horizontal ? 'flex' : 'block',
      margin: `${outerMargin}px`,
      backgroundColor: outerBackgroundColor,
      minWidth: `${minWidth}px`,
      minHeight: `${minHeight}px`,
      overflow: 'visible',
    }"
    ref="container"
  >
    <template v-for="(box, i) in options.layoutBoxes">
      <template v-if="i !== 0">
        <Spliter
          :width="horizontal ? innerMargin : options.calcWidth"
          :height="horizontal ? options.calcHeight : innerMargin"
          :horizontal="horizontal"
          :backgroundColor="backgroundColor"
          :resizable="resizable && options.layoutBoxes[i - 1]?.isResizable && box.isResizable"
          :onMouseDown="(event: MouseEvent) => onMouseDown(event, i, box.isResizable)"
          :ref="`spliter${i + 1}`"
        ></Spliter>
      </template>
      <Box
        :width="box.width"
        :height="box.height"
        :scroll="box.scroll"
        :auto="box.auto"
        :backgroundColor="backgroundColor"
        :ref="`box${i + 1}`"
      >
        <slot
          :name="`box${i + 1}`"
          :props="{
            parentsWidth: box.width || 0,
            parentsHeight: box.height || 0,
            contentsHeight: box.height ? box.height - options.titleHeight : 0,
            contentsInnerHeight: box.height ? box.height - options.titleHeight - options.textPaddingHeight : 0,
            contentsInnerWidth: box.width ? box.width - options.textPaddingWidth : 0,
          }"
        ></slot>
      </Box>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  toRefs,
  reactive,
  onBeforeMount,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  computed,
  watch,
  defineProps,
} from "vue";
import { LayoutBox, SizeType, EventBus, ILayoutBox } from "mozart-common";

import Box from "./Box.vue";
import Spliter from "./Spliter.vue";

// interface Props {
//   /**
//    * SplitBox의 넓이 입니다.<br>
//    * 값을 주지 않을 경우 부모 Element의 넓이를 가져옵니다.
//    */
//   width?: number | string;
//   /**
//    * SplitBox의 높이 입니다.<br>
//    * 값을 주지 않을 경우 부모 Element의 높이를 가져옵니다.
//    */
//   height?: number | string;
//   /**
//    * SplitBox의 최소 넓이 입니다.<br>
//    */
//   minWidth?: number;
//   /**
//    * SplitBox의 최소 높이 입니다.<br>
//    */
//   minHeight?: number;
//   /**
//    * SplitBox의 Box수 및 비율 입니다.<br>
//    * `ILayoutBox`배열로 값을 주면, 배열의 수 많큼 Box를 만들고,<br>
//    * type에 따른 크기가 계산되어 Box가 생성됩니다.<br>
//    * type은 **fix**, **rate**가 있습니다.<br>
//    * - fix : size가 고정 값으로 사용됩니다.<br>
//    * - rate : size가 비율로 사용됩니다.
//    */
//   boxes?: any[];
//   /**
//    * SplitBox의 Box 생성 방향입니다.<br>
//    * **true**일 경우 가로 방향으로 Box가 생성됩니다.
//    */
//   horizontal?: boolean;
//   /**
//    * Box간의 공백 값입니다.
//    */
//   innerMargin?: number;
//   /**
//    * 외부 Margin 값입니다.
//    */
//   outerMargin?: number;
//   /**
//    * Box의 배경색 입니다.
//    */
//   backgroundColor?: string;
//   /**
//    * 외부 배경색 입니다.
//    */
//   outerBackgroundColor?: string;
//   /**
//    * Size조절 가능 여부입니다.
//    */
//   resizable?: boolean;
// }

// const {
//   width,
//   height,
//   minWidth = 0,
//   minHeight = 0,
//   boxes = [{ type: "rate", size: 1 }],
//   horizontal = false,
//   innerMargin = 10,
//   outerMargin = 0,
//   backgroundColor = "transparent",
//   outerBackgroundColor = "transparent",
//   resizable = false,
// } = defineProps<Props>();

const props = defineProps({
  /**
   * SplitBox의 넓이 입니다.<br>
   * 값을 주지 않을 경우 부모 Element의 넓이를 가져옵니다.
   */
  width: { type: [Number, String] },
  /**
   * SplitBox의 높이 입니다.<br>
   * 값을 주지 않을 경우 부모 Element의 높이를 가져옵니다.
   */
  height: { type: [Number, String] },
  /**
   * SplitBox의 최소 넓이 입니다.<br>
   */
  minWidth: { type: Number, default: 0 },
  /**
   * SplitBox의 최소 높이 입니다.<br>
   */
  minHeight: { type: Number, default: 0 },
  /**
   * SplitBox의 Box수 및 비율 입니다.<br>
   * `ILayoutBox`배열로 값을 주면, 배열의 수 많큼 Box를 만들고,<br>
   * type에 따른 크기가 계산되어 Box가 생성됩니다.<br>
   * type은 **fix**, **rate**가 있습니다.<br>
   * - fix : size가 고정 값으로 사용됩니다.<br>
   * - rate : size가 비율로 사용됩니다.
   */
  boxes: { type: Array, default: () => [{ type: "rate", size: 1 }] },
  /**
   * SplitBox의 Box 생성 방향입니다.<br>
   * **true**일 경우 가로 방향으로 Box가 생성됩니다.
   */
  horizontal: { type: Boolean, default: false },
  /**
   * Box간의 공백 값입니다.
   */
  innerMargin: { type: Number, default: 10 },
  /**
   * 외부 Margin 값입니다.
   */
  outerMargin: { type: Number, default: 0 },
  /**
   * Box의 배경색 입니다.
   */
  backgroundColor: { type: String, default: "transparent" },
  /**
   * 외부 배경색 입니다.
   */
  outerBackgroundColor: { type: String, default: "transparent" },
  /**
   * Size조절 가능 여부입니다.
   */
  resizable: { type: Boolean, default: false },
});
const {
  width,
  height,
  minWidth,
  minHeight,
  boxes,
  horizontal,
  innerMargin,
  outerMargin,
  backgroundColor,
  outerBackgroundColor,
  resizable,
} = toRefs(props);

// @Prop({ type: [Number, String] }) public width?: number | string;
// @Prop({ type: [Number, String] }) public height?: number | string;
// @Prop({ type: Number, default: 0 }) public minWidth!: number;
// @Prop({ type: Number, default: 0 }) public minHeight!: number;
// @Prop({ type: Array, default: () => [{ type: "rate", size: 1 }] }) public boxes!: ILayoutBox[];
// @Prop({ type: Boolean, default: false }) public horizontal!: boolean;
// @Prop({ type: Number, default: 10 }) public innerMargin!: number;
// @Prop({ type: Number, default: 0 }) public outerMargin!: number;
// @Prop({ type: String, default: "transparent" }) public backgroundColor?: string;
// @Prop({ type: String, default: "transparent" }) public outerBackgroundColor?: string;
// @Prop({ type: Boolean, default: false }) public resizable!: boolean;

const options = reactive({
  calcHeight: 0,
  calcWidth: 0,
  layoutBoxes: [] as LayoutBox[],
  titleHeight: 55,
  textPaddingWidth: 64,
  textPaddingHeight: 52,
});

const container = ref(null as any | null);

const touch = reactive({
  mouseDown: false,
  dragging: false,
  activeSplitter: null as number | null,
  position: null as any | null,
});

const self = ref(null as any | null);
// private calcHeight: number = 0;
// private calcWidth: number = 0;

// private layoutBoxes: LayoutBox[] = [];
// private container?: HTMLElement;
// private touch: {
//   mouseDown: boolean;
//   dragging: boolean;
//   activeSplitter: number | null;
//   position: IPoint | null;
// } = {
//   mouseDown: false,
//   dragging: false,
//   activeSplitter: null,
//   position: null,
// };
// public titleHeight: number = 55;
// public textPaddingWidth: number = 64;
// public textPaddingHeight: number = 52;

const observer: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
  setTimeout(() => {
    EventBus.fire("theme-changed");
  });
});

onBeforeMount(() => {
  EventBus.register("theme-changed", onRerender);
  // TODO: 다른 방법은 없을까?...
  EventBus.register("horizontal-filter-toggle", onRerender);
  EventBus.register("close-left-drawer", onRerender);
  EventBus.register("open-left-drawer", onRerender);

  const instance = getCurrentInstance();
  self.value = instance;
});

onMounted(function () {
  // container = $refs.container as HTMLElement;
  setLayoutBoxes();
  calcSize();

  if (container.value) {
    observer.observe(container.value);
  }
});

onUnmounted(() => {
  EventBus.remove("theme-changed", onRerender);
  // TODO: 다른 방법은 없을까?...
  EventBus.remove("horizontal-filter-toggle", onRerender);
  EventBus.remove("close-left-drawer", onRerender);
  EventBus.remove("open-left-drawer", onRerender);
  if (observer) {
    observer.disconnect();
  }
});

const setLayoutBoxes = () => {
  if (boxes) {
    options.layoutBoxes = boxes.value?.map(box => new LayoutBox(box as ILayoutBox));
  }
};

const ratedSizeSum = computed(() => {
  return options.layoutBoxes.reduce((sum: number, box: any) => {
    return sum + (box.type === SizeType.Rate ? box.size : 0);
  }, 0);
});

const length = computed(() => {
  return options.layoutBoxes.filter((size: any) => size.type === SizeType.Rate).length;
});

const getStringToHeight = (val: string, def: number = 0) => {
  if (val.endsWith("px")) {
    return +val.replace("px", "");
  } else {
    return def;
  }
};

const getSizeToNumber = (size?: number | string, def: number = 0): number => {
  if (!size) return def;

  if (typeof size === "number") {
    return size;
  } else if (typeof size === "string") {
    if (size.startsWith("var")) {
      const varName = size.replace("var(", "").replace(")", "");
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
      return getStringToHeight(value, def);
    } else {
      return getStringToHeight(size, def);
    }
  }

  return def;
};

// @Watch("boxes")
// public onChangeBoxes(newVal: ILayoutBox[], oldVal: ILayoutBox[]) {
//   if (newVal !== oldVal) {
//     this.setLayoutBoxes();
//   }
// }

watch([width], () => {
  calcSize();
});

// @Watch("width")
// public onChangeWidth(newVal: number, oldVal: number) {
//   if (newVal !== oldVal) {
//     this.calcSize();
//   }
// }

watch([height], () => {
  calcSize();
});

// @Watch("height")
// public onChangeHeight(newVal: number | string, oldVal: number | string) {
//   if (newVal !== oldVal) {
//     this.calcSize();
//   }
// }

const onRerender = (evt: any) => {
  calcSize();
};

const bindEvents = () => {
  document.addEventListener("mousemove", onMouseMove, { passive: false });
  document.addEventListener("mouseup", onMouseUp);

  if ("ontouchstart" in window) {
    document.addEventListener("touchmove", onMouseMove, { passive: false });
    document.addEventListener("touchend", onMouseUp);
  }
};

const unbindEvents = () => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  if ("ontouchstart" in window) {
    document.removeEventListener("touchmove", onMouseMove);
    document.removeEventListener("touchend", onMouseUp);
  }
};

const calcRateWidth = (calcWidth: number, ratedSizeSum: number): number => {
  if (ratedSizeSum === 0) return calcWidth;
  calcWidth -= options.layoutBoxes
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
  const sizeSum = options.layoutBoxes
    .filter((box: LayoutBox) => !box.isFix)
    .reduce((sum: number, box: LayoutBox) => sum + box.size, 0);
  if (sizeSum === 0) return calcWidth;
  if (sizeSum === ratedSizeSum) {
    options.layoutBoxes
      .filter((box: LayoutBox) => !box.isFix)
      .forEach((box: LayoutBox) => (box.width = (box.size * calcWidth) / sizeSum));
  } else {
    calcWidth = calcRateWidth(calcWidth, sizeSum);
  }
  return calcWidth;
};

const setWidth = (): number => {
  let calcWidth = 0;
  let newWidth = getSizeToNumber(width?.value, (self.value?.vnode.el as Element).clientWidth) - outerMargin.value * 2;
  if (newWidth < minWidth.value) {
    newWidth = minWidth.value;
  }
  if (newWidth) {
    if (horizontal) {
      calcWidth = newWidth - innerMargin.value * (options.layoutBoxes.length - 1);
      calcWidth -= options.layoutBoxes
        .filter((box: LayoutBox) => box.type === SizeType.Fix)
        .reduce((sum: number, box: LayoutBox) => {
          box.isFix = true;
          box.width = box.size;
          return sum + box.size;
        }, 0);
      options.layoutBoxes
        .filter((box: LayoutBox) => box.type !== SizeType.Fix)
        .forEach((box: LayoutBox) => {
          box.isFix = false;
        });
      calcWidth = calcRateWidth(calcWidth, ratedSizeSum.value);
    } else {
      calcWidth = newWidth;
      options.layoutBoxes.forEach((box: LayoutBox) => (box.width = newWidth));
    }
  }
  return calcWidth;
};

const calcRateHeight = (calcHeight: number, ratedSizeSum: number): number => {
  if (ratedSizeSum === 0) return calcHeight;
  calcHeight -= options.layoutBoxes
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
  const sizeSum = options.layoutBoxes
    .filter((box: LayoutBox) => !box.isFix)
    .reduce((sum: number, box: LayoutBox) => sum + box.size, 0);
  if (sizeSum === 0) return calcHeight;
  if (sizeSum === ratedSizeSum) {
    options.layoutBoxes
      .filter((box: LayoutBox) => !box.isFix)
      .forEach((box: LayoutBox) => (box.height = (box.size * calcHeight) / sizeSum));
  } else {
    calcHeight = calcRateHeight(calcHeight, sizeSum);
  }
  return calcHeight;
};

const setHeight = (): number => {
  let calcHeight = 0;
  let newHeight =
    getSizeToNumber(height?.value, (self.value?.vnode.el as Element).clientWidth) - outerMargin?.value * 2;
  if (newHeight < minHeight?.value) {
    newHeight = minHeight?.value;
  }
  if (newHeight) {
    if (horizontal) {
      calcHeight = newHeight;
      options.layoutBoxes.forEach((box: LayoutBox) => (box.height = newHeight));
    } else {
      calcHeight = newHeight - innerMargin.value * (options.layoutBoxes.length - 1);
      calcHeight -= options.layoutBoxes
        .filter((box: LayoutBox) => box.type === SizeType.Fix)
        .reduce((sum: number, box: LayoutBox) => {
          box.isFix = true;
          box.height = box.size;
          return sum + box.size;
        }, 0);
      options.layoutBoxes
        .filter((box: LayoutBox) => box.type !== SizeType.Fix)
        .forEach((box: LayoutBox) => {
          box.isFix = false;
        });
      calcHeight = calcRateHeight(calcHeight, ratedSizeSum.value);
    }
  }
  return calcHeight;
};

const unFocus = (document: any, window: any) => {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
    } catch (e) {
      //
    }
  }
};

const getCurrentMouseDrag = (event: any): any => {
  if (container.value) {
    const rect = (container.value as Element)?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = "ontouchstart" in window && event.touches ? event.touches[0] : event;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }
  }
  return {
    x: 0,
    y: 0,
  };
};

const calculatePanesSize = (drag: any) => {
  if (touch.position) {
    const splitterIndex = touch.activeSplitter || 0;
    const prevBox = options.layoutBoxes[splitterIndex - 1];
    const nextBox = options.layoutBoxes[splitterIndex];
    const oldPos = touch.position[horizontal ? "x" : "y"];
    const newPos = drag[horizontal ? "x" : "y"];
    const calcMove = Math.abs(newPos - oldPos);
    const prevBoxPx = prevBox[horizontal ? "width" : "height"] || 0;
    const nextBoxPx = nextBox[horizontal ? "width" : "height"] || 0;
    const prevBoxMinPx = prevBox[horizontal ? "minWidth" : "minHeight"];
    const nextBoxMinPx = nextBox[horizontal ? "minWidth" : "minHeight"];
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
      touch.position = drag;
    }
    calcSize();
  }
};

const onMouseDown = (event: MouseEvent, idx: number, resizable: boolean) => {
  if (resizable) {
    unFocus(document, window);
    bindEvents();
    touch.mouseDown = true;
    touch.activeSplitter = idx;
    touch.position = getCurrentMouseDrag(event);
  }
};

const onMouseMove = (event: MouseEvent | TouchEvent) => {
  if (touch.mouseDown) {
    event.preventDefault();
    touch.dragging = true;
    calculatePanesSize(getCurrentMouseDrag(event));
  }
};

const onMouseUp = () => {
  if (touch.mouseDown) {
    touch.mouseDown = false;
    setTimeout(() => {
      touch.dragging = false;
      unbindEvents();
    }, 100);
  }
};

const calcCardSize = () => {
  const cardTitleHeight = getComputedStyle(document.documentElement).getPropertyValue("--size-card-title-height");
  const cartTopPadding = getComputedStyle(document.documentElement).getPropertyValue("--size-card-top-padding");
  const cartRblPadding = getComputedStyle(document.documentElement).getPropertyValue("--size-card-rbl-padding");
  const borderOuter = getComputedStyle(document.documentElement).getPropertyValue("--border-outer");
  const borderSize = borderOuter === "none" ? 0 : 1;
  const topPadding = getStringToHeight(cartTopPadding, 20);
  const rblPadding = getStringToHeight(cartRblPadding, 32) + borderSize;
  options.titleHeight = getStringToHeight(cardTitleHeight, 55) + borderSize;
  options.textPaddingWidth = rblPadding * 2;
  options.textPaddingHeight = topPadding + rblPadding;
};

const calcSize = () => {
  options.calcWidth = setWidth();
  options.calcHeight = setHeight();
  calcCardSize();
};
</script>
