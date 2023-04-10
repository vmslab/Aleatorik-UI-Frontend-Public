import { addTooltipEvent } from "../../utils/element";

export default class Cell {
  parents: HTMLElement | null;
  contents: HTMLElement | string | number | boolean | null = null;
  tooltip: HTMLElement | string | null = null;
  classList: string[] = ["moz-gantt-cell"];
  style: object | null = null;

  element?: HTMLElement;

  constructor(params: {
    parents?: HTMLElement;
    contents?: HTMLElement | string | number | boolean;
    tooltip?: HTMLElement | string;
    classList?: string[];
    style?: object;
  }) {
    this.parents = params.parents || null;
    this.contents = params.contents || null;
    this.tooltip = params.tooltip || null;
    this.classList.push(...(params.classList || []));
    this.style = params.style || null;
  }

  render() {
    if (!this.parents) return;
    this.element = document.createElement("div");
    this.element.setAttribute("role", "cell");
    this.element.classList.add(...this.classList);
    if (this.style) {
      Object.assign(this.element.style, this.style);
    }
    if (this.tooltip) {
      if (typeof this.tooltip === "string") {
        addTooltipEvent(this.element, this.tooltip, true, "elupdown");
      } else {
        addTooltipEvent(this.element, this.tooltip.innerHTML, true, "elupdown");
      }
    }
    if (this.contents) {
      if (
        typeof this.contents === "string" ||
        typeof this.contents === "number" ||
        typeof this.contents === "boolean"
      ) {
        this.element.innerHTML = String(this.contents);
      } else {
        this.element.innerHTML = this.contents.innerHTML;
      }
    }
    this.parents.appendChild(this.element);
  }
}
