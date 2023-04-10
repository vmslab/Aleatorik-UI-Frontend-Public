import { BoxPanel, SplitPanel, BoxLayout, DockPanel, Widget } from "@lumino/widgets";
import BaseWidget from "./Base/BaseWidget";
import SideBar from "./Base/SideBar";
import RestorableSplitPanel from "./Base/RestorableSplitPanel";
import { IWidgetTemplate } from "../../types";

export default class IDEMain {
  container: HTMLElement | null;
  hboxPanel: BoxPanel | null;
  hsplitPanel: RestorableSplitPanel | null;
  vsplitPanel: RestorableSplitPanel | null;
  dockPanel: DockPanel | null;
  leftHandler: SideBar | null;
  dockTemplates: Record<string, IWidgetTemplate> = {};
  accordianTemplates: Record<string, IWidgetTemplate> = {};

  constructor(container: HTMLElement | null) {
    this.container = container;
    this.hboxPanel = new BoxPanel();
    this.hsplitPanel = new RestorableSplitPanel();
    this.vsplitPanel = new RestorableSplitPanel();
    this.dockPanel = new DockPanel();
    this.leftHandler = new SideBar();

    this.hboxPanel.id = "main-content-panel";

    this.dockPanel.id = "main-dock-panel";
    this.hsplitPanel.id = "main-split-panel";
    this.vsplitPanel.id = "main-vsplit-panel";

    this.hboxPanel.addClass("main-content-panel");
    this.dockPanel.addClass("main-dock-panel");
    this.leftHandler.sideBar.addClass("left-tab-bar");

    this.hboxPanel.spacing = 0;
    this.dockPanel.spacing = 0;
    this.hsplitPanel.spacing = 0;
    this.vsplitPanel.spacing = 0;

    this.hboxPanel.direction = "left-to-right";
    this.hsplitPanel.orientation = "horizontal";
    this.vsplitPanel.orientation = "vertical";
  }

  registerDock(type: string, copy: (content: HTMLElement, id: number, data: Record<string, any>) => void) {
    this.dockTemplates[type] = { type, copy };
  }

  registerAccordian(type: string, copy: (content: HTMLElement, id: number, data: Record<string, any>) => void) {
    this.accordianTemplates[type] = { type, copy };
  }

  addDock(options: {
    key: string;
    type: string;
    title: string;
    icon?: string;
    caption?: string;
    data?: Record<string, any>;
  }) {
    if (!this.hboxPanel) return;
    if (!this.dockPanel) return;

    const content = document.createElement("div");
    content.classList.add("dock-content-widget");
    const template = this.dockTemplates[options.type];
    template.copy(content, 0, options.data || {});

    const widgets = this.dockPanel.widgets();

    let w: BaseWidget | undefined | null = null;
    do {
      w = widgets.next() as BaseWidget;
      if (!w) break;
      if (w.key === options.key) {
        this.dockPanel.selectWidget(w);
        return;
      }
    } while (w);

    const widget = new BaseWidget({
      key: options.key,
      title: options.title,
      icon: options.icon,
      caption: options.caption,
      closable: true,
      element: content,
    });

    this.dockPanel.addWidget(widget);

    this.dockPanel.selectWidget(widget);

    this.hboxPanel.update();
  }

  addAccordian(options: { key: string; type: string; active?: boolean; icon?: string; data?: Record<string, any> }) {
    if (!this.hboxPanel) return;
    if (!this.leftHandler) return;

    const content = document.createElement("div");
    content.classList.add("left_content_widget");
    const template = this.accordianTemplates[options.type];
    template.copy(content, 0, options.data || {});

    const widget = new BaseWidget({
      key: options.key,
      title: options.type,
      icon: options.icon,
      closable: false,
      element: content,
    });

    this.leftHandler.addWidget(widget, 900);

    if (options.active) {
      this.leftHandler.activate(widget.id);
    }

    this.hboxPanel.update();
  }

  draw() {
    if (!this.container) return;
    if (!this.hboxPanel) return;
    if (!this.hsplitPanel) return;
    if (!this.vsplitPanel) return;
    if (!this.dockPanel) return;
    if (!this.leftHandler) return;

    while (this.container.firstChild) {
      if (!this.container.lastChild) break;
      this.container.removeChild(this.container.lastChild);
    }

    SplitPanel.setStretch(this.leftHandler.stackedPanel, 0);
    SplitPanel.setStretch(this.dockPanel, 1);

    BoxPanel.setStretch(this.leftHandler.sideBar, 0);
    BoxPanel.setStretch(this.hsplitPanel, 1);

    SplitPanel.setStretch(this.vsplitPanel, 1);

    this.hsplitPanel.addWidget(this.leftHandler.stackedPanel);
    this.hsplitPanel.addWidget(this.dockPanel);

    this.vsplitPanel.addWidget(this.hsplitPanel);

    this.hboxPanel.addWidget(this.leftHandler.sideBar);
    this.hboxPanel.addWidget(this.vsplitPanel);

    this.vsplitPanel.setRelativeSizes([3, 1]);
    this.hsplitPanel.setRelativeSizes([1, 5]);

    BoxLayout.setStretch(this.hboxPanel, 1);

    window.onresize = () => {
      if (!this.hboxPanel) return;
      this.hboxPanel.update();
    };

    Widget.attach(this.hboxPanel, this.container);
  }
}
