import { Widget } from "@lumino/widgets";

export interface IBaseWidget {
  key: string;
  title: string;
  icon?: string;
  class?: string;
  caption?: string;
  closable?: boolean;
  element: HTMLElement;
}

export default class BaseWidget extends Widget {
  key: string;

  constructor(params: IBaseWidget) {
    super({ node: params.element });
    this.key = params.key;
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");
    if (params.class) {
      this.addClass(params.class.toLowerCase());
    }
    this.title.label = params.title;
    this.title.icon = params.icon;
    this.title.closable = params.closable || false;
    if (params.caption) {
      this.title.caption = params.caption;
    }
  }
}
