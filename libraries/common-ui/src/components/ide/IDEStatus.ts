import StatusBar from "./Base/StatusBar";

export default class IDEStatus {
  public container: HTMLElement | null;
  public bar: StatusBar | null;

  constructor(container: HTMLElement | null) {
    this.container = container;
    this.bar = new StatusBar();
  }

  public draw() {
    if (!this.container) return;
    if (!this.bar) return;

    while (this.container.firstChild) {
      if (!this.container.lastChild) break;
      this.container.removeChild(this.container.lastChild);
    }

    this.bar.id = "status-bar";
    this.bar.addClass("status-bar-panel");

    StatusBar.attach(this.bar, this.container);
  }
}
