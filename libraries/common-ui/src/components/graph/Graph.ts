import cytoscape, { Core, ElementDefinition, ElementsDefinition, Stylesheet, LayoutOptions } from "cytoscape";
import klay from "cytoscape-klay";
import dagre from "cytoscape-dagre";
import cise from "cytoscape-cise";
import cola from "cytoscape-cola";
import contextMenus from "cytoscape-context-menus";
import navigator from "cytoscape-navigator";
import undoRedo from "cytoscape-undo-redo";
import viewUtilities from "cytoscape-view-utilities";
import {
  defaultOption,
  gridOption,
  circleOption,
  concentricOption,
  breadthfirstOption,
  klayOption,
  dagreOption,
  ciseOption,
  colaOption,
  navigatorOption,
  undoRedoOptions,
  viewUtilitiesOptions,
  contextMenuOptions,
} from "../../utils/graphOptions";
import screenfull from "../../utils/screenfull";

cytoscape.use(klay);
cytoscape.use(dagre);
cytoscape.use(cise);
cytoscape.use(cola);
cytoscape.use(contextMenus);

navigator(cytoscape);
undoRedo(cytoscape);
viewUtilities(cytoscape);

export interface IGraphProps {
  elements?: ElementsDefinition | ElementDefinition[] | Promise<ElementsDefinition> | Promise<ElementDefinition[]>;
  styleObj?: Array<Record<string, any>> | Promise<Array<Record<string, any>>>;
  layout?: Record<string, any>;
  option?: Record<string, any>;
  navigator?: Record<string, any>;
  undoRedo?: Record<string, any>;
  utilities?: Record<string, any>;
  contextMenu?: Record<string, any>;
}

interface IGraphPropsDetail extends IGraphProps {
  parents: HTMLElement;
}

export default class Graph {
  parents: HTMLElement;
  elements?: ElementsDefinition | ElementDefinition[] | Promise<ElementsDefinition> | Promise<ElementDefinition[]>;
  styleObj?: Array<Record<string, any>> | Promise<Array<Record<string, any>>>;
  layout?: Record<string, any>;
  option?: Record<string, any>;
  navigator?: Record<string, any>;
  undoRedo?: Record<string, any>;
  utilities?: Record<string, any>;
  contextMenu?: Record<string, any>;

  resizeObserver: ResizeObserver;
  cy: Core | null = null;
  nav: any | null = null;
  ur: any | null = null;
  util: any | null = null;
  menu: any | null = null;
  options: Record<string, any> | null = null;

  constructor(params: IGraphPropsDetail) {
    this.parents = params.parents;
    this.elements = params.elements;
    this.styleObj = params.styleObj;
    this.layout = params.layout;
    this.option = params.option;
    this.navigator = params.navigator;
    this.undoRedo = params.undoRedo;
    this.utilities = params.utilities;
    this.contextMenu = params.contextMenu;

    this.resizeObserver = new ResizeObserver(els => {
      this.clear();
      this.render();
    });
    this.resizeObserver.observe(this.parents);
    document.addEventListener("keydown", this.onKeydown.bind(this));
  }

  dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.clear();
    document.removeEventListener("keydown", this.onKeydown);
  }

  clear() {
    if (this.cy) {
      this.cy.destroy();
    }
    if (this.nav) {
      this.nav.destroy();
    }
    // if (this.menu) {
    //   this.menu.destroy();
    // }
  }

  onKeydown(evt: KeyboardEvent) {
    if (!this.ur) return;
    if (evt.ctrlKey && (evt.target as HTMLElement).nodeName === "BODY") {
      if (evt.code === "KeyZ") {
        this.ur.undo();
      } else if (evt.code === "KeyY") {
        this.ur.redo();
      }
    }
  }

  onZoomin() {
    if (!this.cy) return;
    if (!this.options) return;
    const zoom = this.cy.zoom();
    const maxZoom = this.cy.maxZoom();
    if (zoom + this.options.zoomSensitivity < maxZoom) {
      this.cy.zoom(zoom + this.options.zoomSensitivity);
    }
  }

  onZoomout() {
    if (!this.cy) return;
    if (!this.options) return;
    const zoom = this.cy.zoom();
    const minZoom = this.cy.minZoom();
    if (zoom - this.options.zoomSensitivity > minZoom) {
      this.cy.zoom(zoom - this.options.zoomSensitivity);
    }
  }

  onUndo() {
    if (!this.ur) return;
    this.ur.undo();
  }

  onRedo() {
    if (!this.ur) return;
    this.ur.redo();
  }

  onHighlightSelected(evt: MouseEvent) {
    if (!this.cy) return;
    if (!this.ur) return;
    // console.log(this.cy.$(":selected"));
    if (this.cy.$(":selected").length === 0) return;
    this.ur.do("highlight", { eles: this.cy.$(":selected"), idx: 0 });
  }

  onLasso() {
    if (!this.util) return;
    this.util.disableMarqueeZoom();
    const lasso = document.querySelector(".toolbar-btn-lasso");
    if (lasso) {
      lasso.classList.add("toolbar-btn-active");
    }
    const callbackFunc = () => {
      if (!lasso) return;
      lasso.classList.remove("toolbar-btn-active");
    };
    this.util.enableLassoMode(callbackFunc);
  }

  async onScreenFull() {
    if (!screenfull.isEnabled) return;
    await screenfull.toggle(this.parents);
  }

  renderToolbarButton(name: string, parents: HTMLElement, handler: Function) {
    const el = document.createElement("div");
    el.classList.add("toolbar-btn");
    el.classList.add(`toolbar-btn-${name}`);
    el.addEventListener("click", handler as any);
    parents.appendChild(el);
  }

  renderToolbar() {
    if (!this.parents) return;
    const toolbarEl = document.createElement("div");
    toolbarEl.classList.add("moz-graph-toolbar");
    this.parents.appendChild(toolbarEl);
    this.renderToolbarButton("zoomin", toolbarEl, this.onZoomin.bind(this));
    this.renderToolbarButton("zoomout", toolbarEl, this.onZoomout.bind(this));
    this.renderToolbarButton("undo", toolbarEl, this.onUndo.bind(this));
    this.renderToolbarButton("redo", toolbarEl, this.onRedo.bind(this));
    this.renderToolbarButton("highlight", toolbarEl, this.onHighlightSelected.bind(this));
    this.renderToolbarButton("lasso", toolbarEl, this.onLasso.bind(this));
    this.renderToolbarButton("full-screen-nav", toolbarEl, this.onScreenFull.bind(this));
  }

  render() {
    if (!this.parents) return;
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }
    const navEl = document.createElement("div");
    navEl.classList.add("moz-graph-navigator");
    this.parents.appendChild(navEl);
    this.renderToolbar();

    let layout = this.layout;
    if (this.layout) {
      if (this.layout.name === "klay") {
        layout = { ...klayOption, ...this.layout };
      } else if (this.layout.name === "dagre") {
        layout = { ...dagreOption, ...this.layout };
      } else if (this.layout.name === "cise") {
        layout = { ...ciseOption, ...this.layout };
      } else if (this.layout.name === "cola") {
        layout = { ...colaOption, ...this.layout };
      } else if (this.layout.name === "grid") {
        layout = { ...gridOption, ...this.layout };
      } else if (this.layout.name === "circle") {
        layout = { ...circleOption, ...this.layout };
      } else if (this.layout.name === "concentric") {
        layout = { ...concentricOption, ...this.layout };
      } else if (this.layout.name === "breadthfirst") {
        layout = { ...breadthfirstOption, ...this.layout };
      }
    }
    const option: any = {
      container: this.parents,
      elements: this.elements,
      style: this.styleObj,
      layout,
      ...defaultOption,
      ...(this.option || {}),
    };
    this.options = option;
    this.cy = cytoscape(option);
    this.nav = (this.cy as any).navigator({ ...navigatorOption, ...(this.navigator || {}) });
    this.ur = (this.cy as any).undoRedo({ ...undoRedoOptions, ...(this.undoRedo || {}) });
    this.util = (this.cy as any).viewUtilities({
      ...viewUtilitiesOptions,
      ...(this.utilities || {}),
    });
    this.menu = (this.cy as any).contextMenus({
      ...contextMenuOptions,
      ...(this.contextMenu || {}),
    });

    // this.cy.on("afterUndo", (e, name) => {
    //   console.log("Undo", name);
    // });

    // this.cy.on("afterRedo", (e, name) => {
    //   console.log("Redo", name);
    // });

    // this.cy.on("afterDo", (e, name) => {
    //   console.log("Do", name);
    // });
  }
}
