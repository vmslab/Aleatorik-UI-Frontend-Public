import { Direction } from "../../types";

export default class Resizer {
  parents?: HTMLElement;
  direction: Direction;
  index: number;
  onClick?: (evt: MouseEvent, index: number) => void;
  onDoubleClick?: (evt: MouseEvent, index: number) => void;
  onMouseDown?: (evt: MouseEvent, index: number) => void;
  onTouchStart?: (evt: TouchEvent, index: number) => void;
  onTouchEnd?: (evt: TouchEvent, index: number) => void;
  classList: string[] = ["moz-splitter-resizer"];
  style: object | null;

  constructor(params: {
    parents?: HTMLElement;
    direction?: Direction;
    index?: number;
    onClick?: (evt: MouseEvent, index: number) => void;
    onDoubleClick?: (evt: MouseEvent, index: number) => void;
    onMouseDown?: (evt: MouseEvent, index: number) => void;
    onTouchStart?: (evt: TouchEvent, index: number) => void;
    onTouchEnd?: (evt: TouchEvent, index: number) => void;
    classList?: string[];
    style?: object;
  }) {
    this.parents = params.parents;
    this.direction = params.direction || "vertical";
    this.index = params.index || 0;
    this.onClick = params.onClick;
    this.onDoubleClick = params.onDoubleClick;
    this.onMouseDown = params.onMouseDown;
    this.onTouchStart = params.onTouchStart;
    this.onTouchEnd = params.onTouchEnd;
    this.classList.push(...(params.classList || []));
    this.style = params.style || null;
  }

  render() {
    if (!this.parents) return;
    const element = document.createElement("div");

    element.setAttribute("data-attribute", this.direction);
    element.setAttribute("data-type", "Resizer");

    element.classList.add(`moz-splitter-resizer-${this.direction}`);
    element.classList.add(...this.classList);

    if (this.style) {
      Object.assign(element.style, this.style);
    }

    if (this.onMouseDown) {
      element.addEventListener("mousedown", evt => {
        if (!this.onMouseDown) return;
        this.onMouseDown(evt, this.index);
      });
    }
    if (this.onTouchStart) {
      element.addEventListener("touchstart", evt => {
        if (!this.onTouchStart) return;
        evt.preventDefault();
        this.onTouchStart(evt, this.index);
      });
    }
    if (this.onTouchEnd) {
      element.addEventListener("touchend", evt => {
        if (!this.onTouchEnd) return;
        evt.preventDefault();
        this.onTouchEnd(evt, this.index);
      });
    }
    if (this.onClick) {
      element.addEventListener("click", evt => {
        if (!this.onClick) return;
        evt.preventDefault();
        this.onClick(evt, this.index);
      });
    }
    if (this.onDoubleClick) {
      element.addEventListener("dblclick", evt => {
        if (!this.onDoubleClick) return;
        evt.preventDefault();
        this.onDoubleClick(evt, this.index);
      });
    }

    this.parents.appendChild(element);
  }
}
