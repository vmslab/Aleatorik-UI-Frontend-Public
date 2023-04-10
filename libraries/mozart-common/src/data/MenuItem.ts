import { IMenuItem } from "../types";

export default class MenuItem implements IMenuItem {
  public name: string;
  private _caption: string;
  private _hide: boolean;
  private _disabled: boolean;
  private _action: (menu: IMenuItem) => void;
  private _checked: boolean;
  private _icon: string;
  private _subMenu: IMenuItem[];
  private _tooltip: string;
  public render?: () => void;

  constructor(menu: IMenuItem) {
    this.name = menu.name;
    this._caption = menu.caption || "";
    this._hide = menu.hide || false;
    this._disabled = menu.disabled || false;
    this._action = menu.action || this.dummy;
    this._checked = menu.checked || false;
    this._icon = menu.icon || "";
    this._subMenu = menu.subMenu || [];
    this._tooltip = menu.tooltip || "";
  }

  public get caption(): string {
    return this._caption;
  }

  public set caption(value: string) {
    this._caption = value;
    this.callRender();
  }

  public get hide(): boolean {
    return this._hide;
  }

  public set hide(value: boolean) {
    this._hide = value;
    this.callRender();
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public set disabled(value: boolean) {
    this._disabled = value;
    this.callRender();
  }

  public get action(): (menu: IMenuItem) => void {
    return this._action;
  }

  public set action(value: (menu: IMenuItem) => void) {
    this._action = value;
    this.callRender();
  }

  public get checked(): boolean {
    return this._checked;
  }

  public set checked(value: boolean) {
    this._checked = value;
    this.callRender();
  }

  public get icon(): string {
    return this._icon;
  }

  public set icon(value: string) {
    this._icon = value;
    this.callRender();
  }

  public get subMenu(): IMenuItem[] {
    return this._subMenu;
  }

  public set subMenu(value: IMenuItem[]) {
    this._subMenu = value;
    this.callRender();
  }

  public get tooltip(): string {
    return this._tooltip;
  }

  public set tooltip(value: string) {
    this._tooltip = value;
    this.callRender();
  }

  public callRender() {
    if (this.render) {
      this.render();
    }
  }

  private dummy() {
    //
  }
}
