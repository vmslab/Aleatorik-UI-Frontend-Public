import { Size, Direction } from "../../types";
import { convertSizeToCssValue, getUnit } from "../../utils/splitterUtil";

export default class Pane {
  contents: HTMLElement | HTMLElement[] | ((parents: HTMLElement) => void);
  size: Size;
  initialSize: Size;
  minSize: Size;
  maxSize: Size;
  direction: Direction;
  index: number;
  key: string;
  resizersSize: number;
  classList: string[] = ["moz-splitter-pane"];
  style: object | null = null;

  paneElement?: HTMLElement;

  constructor(params: {
    contents: HTMLElement | HTMLElement[] | ((parents: HTMLElement) => void);
    size?: Size;
    initialSize?: Size;
    minSize?: Size;
    maxSize?: Size;
    direction?: Direction;
    index?: number;
    key?: string;
    resizersSize?: number;
    classList?: string[];
    style?: object;
  }) {
    this.contents = params.contents;
    this.size = params.size || "1";
    this.initialSize = params.initialSize || "1";
    this.minSize = params.minSize || "0";
    this.maxSize = params.maxSize || "100%";
    this.direction = params.direction || "vertical";
    this.index = params.index || 0;
    this.key = params.key || "";
    this.resizersSize = params.resizersSize || 1;
    this.classList.push(...(params.classList || []));
    this.style = params.style || null;
  }

  update() {
    if (!this.paneElement) return;

    const value = this.size || this.initialSize;
    const vertical = this.direction === "vertical";

    switch (getUnit(value)) {
      case "ratio":
        this.paneElement.style.flex = String(value);
        break;
      case "%":
      case "px":
        this.paneElement.style.flexGrow = "0";
        if (vertical) {
          this.paneElement.style.width = convertSizeToCssValue(value, this.resizersSize);
        } else {
          this.paneElement.style.height = convertSizeToCssValue(value, this.resizersSize);
        }
        break;
    }
  }

  render(parents: HTMLElement) {
    const element = document.createElement("div");

    element.classList.add(...this.classList);

    const value = this.size || this.initialSize;
    const vertical = this.direction === "vertical";

    element.style.display = "flex";
    element.style.outline = "none";

    if (vertical) {
      element.style.minWidth = convertSizeToCssValue(this.minSize, this.resizersSize);
      element.style.maxWidth = convertSizeToCssValue(this.maxSize, this.resizersSize);
    } else {
      element.style.minHeight = convertSizeToCssValue(this.minSize, this.resizersSize);
      element.style.maxHeight = convertSizeToCssValue(this.maxSize, this.resizersSize);
    }

    switch (getUnit(value)) {
      case "ratio":
        element.style.flex = String(value);
        break;
      case "%":
      case "px":
        element.style.flexGrow = "0";
        if (vertical) {
          element.style.width = convertSizeToCssValue(value, this.resizersSize);
        } else {
          element.style.height = convertSizeToCssValue(value, this.resizersSize);
        }
        break;
    }

    if (this.style) {
      Object.assign(element.style, this.style);
    }

    let renderFunc: ((parents: HTMLElement) => void) | null = null;
    if (this.contents) {
      if (Array.isArray(this.contents)) {
        this.contents.forEach(content => {
          element.appendChild(content);
        });
      } else if (this.contents instanceof Function) {
        renderFunc = this.contents;
      } else {
        element.appendChild(this.contents);
      }
    }

    parents.appendChild(element);
    this.paneElement = element;

    if (renderFunc) {
      renderFunc(element);
    }

    return element;
  }
}
