import { Size, Direction } from "../../types";
import {
  DEFAULT_PANE_SIZE,
  DEFAULT_PANE_MIN_SIZE,
  DEFAULT_PANE_MAX_SIZE,
  convert,
  convertSizeToCssValue,
  convertToUnit,
  getUnit,
  toPx,
} from "../../utils/splitterUtil";
import Resizer from "./Resizer";
import Pane from "./Pane";

export interface ISplitterProps {
  direction?: Direction;
  resizerSize?: number;
  onResizeStart?: () => void;
  onResizeEnd?: (sizes: string[]) => void;
  onChange?: (sizes: string[]) => void;
  allowResize?: boolean;
  classList?: string[];
  style?: object;
}

interface ISplitterPropsDetail extends ISplitterProps {
  parents: HTMLElement;
  contents: Pane[];
}

export default class Splitter {
  parents: HTMLElement;
  contents: Pane[];
  direction: Direction;
  resizerSize: number;
  allowResize: boolean;
  onResizeStart?: () => void;
  onResizeEnd?: (sizes: string[]) => void;
  onChange?: (sizes: string[]) => void;
  classList: string[] = ["moz-splitter"];
  style: object | null;

  sizes: string[];

  element?: HTMLElement;
  paneElements: HTMLElement[] = [];

  resizerIndex: number = -1;
  dimensionsSnapshot: {
    resizersSize: number;
    paneDimensions: DOMRect[];
    splitPaneSizePx: number;
    minSizesPx: number[];
    maxSizesPx: number[];
    sizesPx: number[];
  } = {
    resizersSize: 1,
    paneDimensions: [],
    splitPaneSizePx: 0,
    minSizesPx: [],
    maxSizesPx: [],
    sizesPx: [],
  };
  startClientX: number = -1;
  startClientY: number = -1;

  constructor(params: ISplitterPropsDetail) {
    this.parents = params.parents;
    this.contents = params.contents;

    this.direction = params.direction || "vertical";
    this.resizerSize = params.resizerSize || 1;
    this.allowResize = params.allowResize === undefined ? true : params.allowResize;

    this.onResizeStart = params.onResizeStart;
    this.onResizeEnd = params.onResizeEnd;
    this.onChange = params.onChange;

    this.classList.push(...(params.classList || []));
    this.style = params.style || null;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.sizes = this.getPanePropSize();
  }

  dispose() {
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);

    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onMouseUp);
    document.removeEventListener("touchcancel", this.onMouseUp);
  }

  getPanePropSize() {
    return this.contents.map(child => {
      const value = child.size || child.initialSize;
      if (value === undefined) {
        return DEFAULT_PANE_SIZE;
      }

      return String(value);
    });
  }

  getPaneDimensions() {
    return this.paneElements.filter(el => el).map(el => el.getBoundingClientRect());
  }

  getPanePropMinMaxSize(props: Splitter, key: string): Size[] {
    return props.contents.map(child => {
      const value = (child as any)[key];
      if (value === undefined) {
        return key === "maxSize" ? DEFAULT_PANE_MAX_SIZE : DEFAULT_PANE_MIN_SIZE;
      }
      return value;
    });
  }

  getResizersSize(children: Pane[]) {
    return (children.length - 1) * this.resizerSize;
  }

  getDimensionsSnapshot(props: Splitter) {
    const direction = props.direction;
    const paneDimensions = props.getPaneDimensions();
    const splitPaneDimensions = props.element!.getBoundingClientRect();
    const minSizes = props.getPanePropMinMaxSize(props, "minSize");
    const maxSizes = props.getPanePropMinMaxSize(props, "maxSize");

    const resizersSize = props.getResizersSize(props.contents);
    const splitPaneSizePx =
      direction === "vertical" ? splitPaneDimensions.width - resizersSize : splitPaneDimensions.height - resizersSize;

    const minSizesPx = minSizes.map(s => convert(s, splitPaneSizePx));
    const maxSizesPx = maxSizes.map(s => convert(s, splitPaneSizePx));
    const sizesPx = paneDimensions.map(d => (direction === "vertical" ? d.width : d.height));

    return {
      resizersSize,
      paneDimensions,
      splitPaneSizePx,
      minSizesPx,
      maxSizesPx,
      sizesPx,
    };
  }

  onMouseDown = (event: MouseEvent, resizerIndex: number) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    this.onDown(resizerIndex, event.clientX, event.clientY);
  };

  onTouchStart = (event: TouchEvent, resizerIndex: number) => {
    event.preventDefault();

    const { clientX, clientY } = event.touches[0];

    this.onDown(resizerIndex, clientX, clientY);
  };

  onDown = (resizerIndex: number, clientX: number, clientY: number) => {
    if (!this.allowResize) {
      return;
    }

    this.resizerIndex = resizerIndex;
    this.dimensionsSnapshot = this.getDimensionsSnapshot(this);
    this.startClientX = clientX;
    this.startClientY = clientY;

    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);

    document.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onMouseUp);
    document.addEventListener("touchcancel", this.onMouseUp);

    if (this.onResizeStart) {
      this.onResizeStart();
    }
  };

  onMouseMove = (event: MouseEvent) => {
    event.preventDefault();

    this.onMove(event.clientX, event.clientY);
  };

  onTouchMove = (event: TouchEvent) => {
    event.preventDefault();

    const { clientX, clientY } = event.touches[0];

    this.onMove(clientX, clientY);
  };

  onMouseUp = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();

    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);

    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onMouseUp);
    document.addEventListener("touchcancel", this.onMouseUp);

    if (this.onResizeEnd) {
      this.onResizeEnd(this.sizes);
    }
  };

  onMove(clientX: number, clientY: number) {
    const resizerIndex = this.resizerIndex;
    const { sizesPx, minSizesPx, maxSizesPx, splitPaneSizePx, paneDimensions } = this.dimensionsSnapshot;

    const sizeDim = this.direction === "vertical" ? "width" : "height";
    const primary = paneDimensions[resizerIndex];
    const secondary = paneDimensions[resizerIndex + 1];
    const maxSize = primary[sizeDim] + secondary[sizeDim];

    const primaryMinSizePx = minSizesPx[resizerIndex];
    const secondaryMinSizePx = minSizesPx[resizerIndex + 1];
    const primaryMaxSizePx = Math.min(maxSizesPx[resizerIndex], maxSize);
    const secondaryMaxSizePx = Math.min(maxSizesPx[resizerIndex + 1], maxSize);

    const moveOffset = this.direction === "vertical" ? this.startClientX - clientX : this.startClientY - clientY;

    let primarySizePx = primary[sizeDim] - moveOffset;
    let secondarySizePx = secondary[sizeDim] + moveOffset;

    let primaryHasReachedLimit = false;
    let secondaryHasReachedLimit = false;

    if (primarySizePx < primaryMinSizePx) {
      primarySizePx = primaryMinSizePx;
      primaryHasReachedLimit = true;
    } else if (primarySizePx > primaryMaxSizePx) {
      primarySizePx = primaryMaxSizePx;
      primaryHasReachedLimit = true;
    }

    if (secondarySizePx < secondaryMinSizePx) {
      secondarySizePx = secondaryMinSizePx;
      secondaryHasReachedLimit = true;
    } else if (secondarySizePx > secondaryMaxSizePx) {
      secondarySizePx = secondaryMaxSizePx;
      secondaryHasReachedLimit = true;
    }

    if (primaryHasReachedLimit) {
      secondarySizePx = primary[sizeDim] + secondary[sizeDim] - primarySizePx;
    } else if (secondaryHasReachedLimit) {
      primarySizePx = primary[sizeDim] + secondary[sizeDim] - secondarySizePx;
    }

    sizesPx[resizerIndex] = primarySizePx;
    sizesPx[resizerIndex + 1] = secondarySizePx;

    let sizes = this.sizes.concat();
    let updateRatio;

    [primarySizePx, secondarySizePx].forEach((paneSize, idx) => {
      const unit = getUnit(sizes[resizerIndex + idx]);
      if (unit !== "ratio") {
        sizes[resizerIndex + idx] = convertToUnit(paneSize, unit, splitPaneSizePx)!;
      } else {
        updateRatio = true;
      }
    });

    if (updateRatio) {
      let ratioCount = 0;
      let lastRatioIdx: number = -1;
      sizes = sizes.map((size, idx) => {
        if (getUnit(size) === "ratio") {
          ratioCount++;
          lastRatioIdx = idx;

          return convertToUnit(sizesPx[idx], "ratio")!;
        }

        return size;
      });

      if (ratioCount === 1) {
        sizes[lastRatioIdx] = "1";
      }
    }

    if (this.onChange) {
      this.onChange(sizes);
    }

    this.sizes = sizes;
    this.update();
  }

  update() {
    this.contents.forEach((child: Pane, idx: number) => {
      child.size = this.sizes[idx];
      child.update();
    });
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const element = document.createElement("div");
    this.element = element;

    element.classList.add(`moz-splitter-${this.direction}`);
    element.classList.add(...this.classList);

    if (this.style) {
      Object.assign(element.style, this.style);
    }

    const resizersSize = this.getResizersSize(this.contents);

    this.contents.forEach((child: Pane, idx: number) => {
      const resizerIndex = idx - 1;
      if (idx > 0) {
        const resizer = new Resizer({
          parents: element,
          index: resizerIndex,
          direction: this.direction,
          onMouseDown: this.onMouseDown,
          onTouchStart: this.onTouchStart,
        });

        resizer.render();
      }
      child.index = idx;
      child.direction = this.direction;
      child.key = `Pane-${idx}`;
      child.resizersSize = resizersSize;
      child.size = this.sizes[idx];

      this.paneElements.push(child.render(element));
    }, []);

    this.parents.appendChild(element);
  }
}
