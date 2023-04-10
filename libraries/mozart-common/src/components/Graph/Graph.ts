import cytoscape, {
  Core,
  ElementDefinition,
  ElementsDefinition,
  Stylesheet,
  LayoutOptions,
  Collection,
  Singular,
} from "cytoscape";
import klay from "cytoscape-klay";
import dagre from "cytoscape-dagre";
import cise from "cytoscape-cise";
import cola from "cytoscape-cola";
import contextMenus from "cytoscape-context-menus";
import navigator from "cytoscape-navigator";
import undoRedo from "cytoscape-undo-redo";
import viewUtilities from "cytoscape-view-utilities";
import gridGuide from "cytoscape-grid-guide";
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
  gridGuideOptions,
  defaultStyle,
} from "../../utils/graphOptions";
import { addTooltipEventNode } from "../../utils/graphUtil";
import { debounce } from "lodash";
import screenFull from "../../utils/screenfull";

cytoscape.use(klay);
cytoscape.use(dagre);
cytoscape.use(cise);
cytoscape.use(cola);
cytoscape.use(contextMenus);

navigator(cytoscape);
undoRedo(cytoscape);
viewUtilities(cytoscape);
gridGuide(cytoscape);

export interface IGraphProps {
  elements?:
    | ElementsDefinition
    | ElementDefinition[]
    | Promise<ElementsDefinition>
    | Promise<ElementDefinition[]>;
  styleObj?: Array<Record<string, any>>;
  layout?: Record<string, any>;
  option?: Record<string, any>;
  navigator?: Record<string, any>;
  undoRedo?: Record<string, any>;
  utilities?: Record<string, any>;
  contextMenu?: Record<string, any>;
  gridGuide?: Record<string, any>;
  container?: HTMLElement;
  customToolbarBtns?: IToolbarBtn[];
  onClick?: Function;
}

interface IGraphPropsDetail extends IGraphProps {
  parents: HTMLElement;
}

export interface IToolbarBtn {
  name: string;
  click: () => void;
}

export default class Graph {
  parents: HTMLElement;
  elements?:
    | ElementsDefinition
    | ElementDefinition[]
    | Promise<ElementsDefinition>
    | Promise<ElementDefinition[]>;
  styleObj?: Array<Record<string, any>>;
  layout?: Record<string, any>;
  option?: Record<string, any>;
  navigator?: Record<string, any>;
  undoRedo?: Record<string, any>;
  utilities?: Record<string, any>;
  contextMenu?: Record<string, any>;
  gridGuide?: Record<string, any>;
  container?: HTMLElement;
  customToolbarBtns?: IToolbarBtn[];
  onClick?: Function;

  resizeObserver: ResizeObserver;
  updateTooltip?: Function;
  addEventListner?: Function;
  // (tooltip?: Function | string) => void;

  showNav?: boolean;
  drawGrid?: boolean;
  moveNode?: boolean;

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
    this.gridGuide = params.gridGuide;
    this.container = params.container;
    this.customToolbarBtns = params.customToolbarBtns;
    this.onClick = params.onClick;

    this.resizeObserver = new ResizeObserver(els => {
      debounce(() => {
        this.render();
      }, 500);
    });
    this.resizeObserver.observe(this.parents);
  }

  dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  renderToolbarButton(name: string, parents: HTMLElement, handler: Function) {
    const el = document.createElement("div");
    el.classList.add("toolbar-btn");
    el.classList.add(`toolbar-btn-${name}`);
    el.addEventListener("click", handler as any);
    parents.appendChild(el);
  }

  renderToolbar(
    // onZoomin: Function,
    // onZoomout: Function,
    // onUndo: Function,
    // onRedo: Function,
    onHighlightSelected: Function,
    // onLasso: Function,
    onRemoveHighlight: Function,
    // onDrawGrid: Function,
    // onMoveNode: Function,
    onShowNavigator: Function,
    onFullScreenNav: Function,
    onDirectionChanged: Function,
    onAlignChanged: Function,
    onLayoutRefresh: Function,
  ) {
    if (!this.parents) return;
    const toolbarEl = document.createElement("div");
    toolbarEl.classList.add("moz-graph-toolbar");
    this.parents.appendChild(toolbarEl);
    // this.renderToolbarButton("zoomin", toolbarEl, onZoomin);
    // this.renderToolbarButton("zoomout", toolbarEl, onZoomout);
    // this.renderToolbarButton("undo", toolbarEl, onUndo);
    // this.renderToolbarButton("redo", toolbarEl, onRedo);
    // this.renderToolbarButton("highlight", toolbarEl, onHighlightSelected);
    // this.renderToolbarButton("draw-grid", toolbarEl, onDrawGrid);
    // this.renderToolbarButton("move-node", toolbarEl, onMoveNode);
    this.renderToolbarButton("refresh", toolbarEl, onLayoutRefresh);
    this.renderToolbarButton("full-screen-nav", toolbarEl, onFullScreenNav);
    // this.renderToolbarButton("lasso", toolbarEl, onLasso);
    this.renderToolbarButton("remove-highlight", toolbarEl, onRemoveHighlight);
    if (this.layout?.name === "dagre") {
      this.renderToolbarButton(`direction${this.layout?.rankDir}`, toolbarEl, onDirectionChanged);
      this.renderToolbarButton(`align${this.layout?.align}`, toolbarEl, onAlignChanged);
    }
    this.renderToolbarButton("show-nav", toolbarEl, onShowNavigator);

    if (this.customToolbarBtns) {
      this.customToolbarBtns.forEach(btn => {
        this.renderToolbarButton(btn.name, toolbarEl, btn.click);
      });
    }
  }

  render() {
    if (!this.parents) return;
    const slots: HTMLElement[] = [];
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      if ((this.parents.lastChild as HTMLElement).classList.contains("moz-graph-slot")) {
        slots.push(this.parents.lastChild as HTMLElement);
      }
      this.parents.removeChild(this.parents.lastChild);
    }

    // this.parents.style.width = "inherit";
    // this.parents.style.height = "inherit";

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
      style: [...defaultStyle, ...(this.styleObj || [])],
      layout,
      ...defaultOption,
      ...(this.option || {}),
    };
    const cy = cytoscape(option);

    cy.on("select", (e: any) => {
      if (cy.$(":selected").length === 0) return;
      const batch = [];
      batch.push({ name: "removeHighlights", param: {} });
      batch.push({
        name: "highlightNeighbors",
        param: { eles: cy.$(":selected"), idx: 0 },
      });
      ur.do("batch", batch);
    })
      .on("cxttap", (e: any) => {
        const item = e.target;
        if (!item) {
          menu.hideMenuItem("Highlight");
          return;
        }

        if (
          item.group &&
          item.group() == "nodes" &&
          item.data("type") !== "BUFFER"
          // !item.id().startsWith("_")
        ) {
          cy.$(":selected").unselect();
          item.select();
          menu.showMenuItem("Neighbors");
          menu.showMenuItem("Linked Full");
        } else {
          menu.hideMenuItem("Neighbors");
          menu.hideMenuItem("Linked Full");
        }
      })
      .on("click", (e: any) => {
        if (this.onClick) this.onClick(e);
      });

    const navEl = document.createElement("div");
    navEl.classList.add(
      this.navigator?.container?.substring(1) || navigatorOption.container.substring(1),
    );
    this.parents.appendChild(navEl);

    const nav = (cy as any).navigator({ ...navigatorOption, ...(this.navigator || {}) });
    const ur = (cy as any).undoRedo({ ...undoRedoOptions, ...(this.undoRedo || {}) });

    const util = (cy as any).viewUtilities({
      ...viewUtilitiesOptions,
      ...(this.utilities || {}),
    });
    const menuOptions = {
      ...contextMenuOptions,
      ...(this.contextMenu || {}),
    };
    // const gridOptions = {
    //   ...gridGuideOptions,
    //   ...(this.gridGuide || {}),
    // };
    // this.drawGrid = gridOptions.drawGrid;
    // this.moveNode = false;
    const ctxHighlightMenu = menuOptions.menuItems.find((menu: any) => menu.id === "Highlight");
    ctxHighlightMenu.submenu.forEach((menu: any) => {
      switch (menu.id) {
        case "Neighbors":
          menu.onClickFunction = (event: any) => {
            const node = event.target || event.cyTarget;
            if (node) {
              const batch = [];
              batch.push({ name: "removeHighlights", param: {} });
              batch.push({
                name: "highlightNeighbors",
                param: { eles: node, idx: node.selectedIndex },
              });
              ur.do("batch", batch);
            }
          };

          break;
        case "Linked Full":
          menu.onClickFunction = async (event: any) => {
            const node = event.target || event.cyTarget;
            if (node) {
              const batch = [];
              batch.push({ name: "removeHighlights", param: {} });

              const eles = cy.collection();
              eles.merge(node);

              const successors = node.successors();
              eles.merge(successors);

              const predecessors = node.predecessors();
              eles.merge(predecessors);

              batch.push({
                name: "highlight",
                param: { eles, idx: node.selectedIndex },
              });
              ur.do("batch", batch);
            }
          };

          break;
        case "Remove":
          menu.onClickFunction = (event: any) => {
            ur.do("removeHighlights");
          };

          break;
      }
    });

    // const searchChildEles = (eles: Collection, ele: Singular) => {
    //   if (ele.isEdge()) {
    //     console.log(ele.sources());
    //     console.log(ele.targets());
    //   }
    //   if (ele.isNode()) {
    //     console.log(ele.edges());
    //   }
    // };
    // const searchParentEles = (eles: Collection, ele: Singular) => {};

    // const searchLickedFullNode = (node: cytoscape.Singular) => {
    //   node.
    //   console.log(node);
    // };

    const menu = (cy as any).contextMenus(menuOptions);
    // const gridGuide = (cy as any).gridGuide(gridOptions);

    const onKeydown = (evt: KeyboardEvent) => {
      if (!ur) return;
      if (evt.ctrlKey && (evt.target as HTMLElement).nodeName === "BODY") {
        if (evt.code === "KeyZ") {
          ur.undo();
        } else if (evt.code === "KeyY") {
          ur.redo();
        }
      }
    };

    document.addEventListener("keydown", onKeydown);

    // const onZoomin = () => {
    //   if (!cy) return;
    //   if (!option) return;
    //   const zoom = cy.zoom();
    //   const maxZoom = cy.maxZoom();
    //   if (zoom + option.zoomSensitivity < maxZoom) {
    //     cy.zoom(zoom + option.zoomSensitivity);
    //   }
    // };

    // const onZoomout = () => {
    //   if (!cy) return;
    //   if (!option) return;
    //   const zoom = cy.zoom();
    //   const minZoom = cy.minZoom();
    //   if (zoom - option.zoomSensitivity > minZoom) {
    //     cy.zoom(zoom - option.zoomSensitivity);
    //   }
    // };

    // const onUndo = () => {
    //   if (!ur) return;
    //   ur.undo();
    // };

    // const onRedo = () => {
    //   if (!ur) return;
    //   ur.redo();
    // };

    const onHighlightSelected = (evt: MouseEvent) => {
      if (!cy) return;
      if (!ur) return;
      // console.log(cy.$(":selected"));
      if (cy.$(":selected").length === 0) return;
      ur.do("highlight", { eles: cy.$(":selected"), idx: 0 });
    };

    // const onLasso = () => {
    //   if (!util) return;
    //   util.disableMarqueeZoom();
    //   const lasso = document.querySelector(".toolbar-btn-lasso");
    //   if (lasso) {
    //     lasso.classList.add("toolbar-btn-active");
    //   }
    //   const callbackFunc = () => {
    //     if (!lasso) return;
    //     lasso.classList.remove("toolbar-btn-active");
    //   };
    //   util.enableLassoMode(callbackFunc);
    // };

    const onRemoveHighlight = () => {
      if (!cy) return;
      if (!ur) return;
      ur.do("removeHighlights");

      cy.nodes().forEach(node => {
        // if (node.id().startsWith("_")) {
        if (node.data("type") === "BUFFER") {
          node.unselectify();
          node.ungrabify();
          node.locked();
        }
      });
    };

    // const onDrawGrid = () => {
    //   ur.do("drawGrid");
    // };

    // const doDrawGrid = () => {
    //   if (!cy) return;
    //   if (!ur) return;

    //   if (!this.isInit) this.drawGrid = !this.drawGrid;

    //   (cy as any).gridGuide({ drawGrid: this.drawGrid });

    //   const grid = document.querySelector(".toolbar-btn-draw-grid");
    //   if (grid) {
    //     if (this.drawGrid) grid.classList.add("toolbar-btn-active");
    //     else grid.classList.remove("toolbar-btn-active");
    //   }
    // };

    const setMoveNodeOption = (isMoveNode: boolean | undefined) => {
      if (!cy) return;

      cy.edges().forEach(edge => {
        edge.unselectify();
      });
      cy.nodes().forEach(node => {
        // if (node.id().startsWith("_")) {
        if (node.data("type") === "BUFFER") {
          node.unselectify();
          node.ungrabify();

          return;
        }

        if (!isMoveNode) {
          node.ungrabify();
        } else {
          node.grabify();
        }
      });
    };

    // const onMoveNode = () => {
    //   ur.do("moveNode");
    // };

    const doMoveNode = () => {
      if (!cy) return;
      if (!ur) return;

      setMoveNodeOption(false);
      // if (!this.isInit) this.moveNode = !this.moveNode;

      // setMoveNodeOption(this.moveNode);

      // const moveNode = document.querySelector(".toolbar-btn-move-node");
      // if (moveNode) {
      //   if (this.moveNode) moveNode.classList.add("toolbar-btn-active");
      //   else moveNode.classList.remove("toolbar-btn-active");
      // }
    };

    const onShowNavigator = () => {
      navEl.style.visibility = this.showNav ? "visible" : "hidden";
      this.showNav = this.elements && !this.showNav;
      const showNav = document.querySelector(".toolbar-btn-show-nav");
      if (showNav) {
        if (!this.showNav) showNav.classList.add("toolbar-btn-active");
        else showNav.classList.remove("toolbar-btn-active");
      }
    };

    const onFullScreenNav = async () => {
      if (screenFull.isEnabled) {
        const targetEl = this.container || this.parents;
        await screenFull.toggle(targetEl, {
          pageOnly: true,
          teleport: true,
          fullscreenOptions: { navigationUI: "show" },
        });
      }
    };

    const onDirectionChanged = () => {
      ur.reset();

      const directionBtn = document.querySelector(`.toolbar-btn-direction${option.layout.rankDir}`);
      directionBtn?.classList.remove(`toolbar-btn-direction${option.layout.rankDir}`);

      if (option.layout.rankDir == "LR") {
        option.layout.rankDir = "BT";
      } else {
        option.layout.rankDir = "LR";
      }

      const layout = cy.layout(option.layout);
      layout.run();

      directionBtn?.classList.add(`toolbar-btn-direction${option.layout.rankDir}`);
    };

    const onAlignChanged = () => {
      ur.reset();

      const alignBtn = document.querySelector(`.toolbar-btn-align${option.layout.align}`);
      alignBtn?.classList.remove(`toolbar-btn-align${option.layout.align}`);

      switch (option.layout.align) {
        case "UL":
          option.layout.align = "UR";
          break;
        case "UR":
          option.layout.align = "DL";
          break;
        case "DL":
          option.layout.align = "DR";
          break;
        case "DR":
          option.layout.align = "UL";
          break;
      }

      const layout = cy.layout(option.layout);
      layout.run();

      alignBtn?.classList.add(`toolbar-btn-align${option.layout.align}`);
    };

    const onLayoutRefresh = () => {
      const layout = cy.layout(option.layout);
      layout.run();
    };

    // ur.action("drawGrid", doDrawGrid, doDrawGrid);
    // ur.action("moveNode", doMoveNode, doMoveNode);

    if (this.elements) {
      this.renderToolbar(
        // onZoomin,
        // onZoomout,
        // onUndo,
        // onRedo,
        onHighlightSelected,
        // onLasso,
        onRemoveHighlight,
        // onDrawGrid,
        // onMoveNode,
        onShowNavigator,
        onFullScreenNav,
        onDirectionChanged,
        onAlignChanged,
        onLayoutRefresh,
      );

      setMoveNodeOption(false);

      this.updateTooltip = (tooltip?: Function | string) => {
        if (tooltip) addTooltipEventNode(cy, tooltip, true, "elupdown");
      };

      this.addEventListner = (event: string, handler: Function) => {
        if (cy)
          cy.on(event, (e: any) => {
            handler(e);
          });
      };

      if (this.parents) {
        const toolbarEl = this.parents.querySelector(".moz-graph-toolbar");
        const navOverlayEl = this.parents.querySelector(".cytoscape-navigatorOverlay");

        if (toolbarEl) {
          toolbarEl.removeEventListener("mousedown", cancelBubble);
          toolbarEl.addEventListener("mousedown", cancelBubble);
        }
        if (navOverlayEl) {
          navOverlayEl.removeEventListener("mousedown", cancelBubble);
          navOverlayEl.addEventListener("mousedown", cancelBubble);
        }
      }
    }

    onShowNavigator();

    if (slots && slots.length > 0) {
      slots.forEach(slot => {
        this.parents.appendChild(slot);
      });
    }

    // doDrawGrid();
  }
}

const cancelBubble = (e: any) => {
  e.cancelBubble = true;
};
