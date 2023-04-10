import {
  IFlowModule,
  IFlowNode,
  IFlowNodeTemplate,
  IFlowWrapper,
  IFlowConnection,
  IFlowConnectionDetail,
  IFlowEventListener,
  FlowEditorMode,
} from "../../types";
import { createCurvature } from "../../utils/svgUtil";

export default class Flow {
  public events: Record<string, IFlowEventListener> = {};
  public container: HTMLElement;
  public precanvas: HTMLElement | null = null;
  public nodeId: number = 1;
  public eleSelected: HTMLElement | null = null;
  public nodeSelected: HTMLElement | null = null;
  public drag: boolean = false;
  public reroute: boolean = false;
  public rerouteFixCurvature: boolean = false;
  public curvature: number = 0.5;
  public rerouteCurvatureStartEnd: number = 0.5;
  public rerouteCurvature: number = 0.5;
  public rerouteWidth: number = 6;
  public dragPoint: boolean = false;
  public editorSelected: boolean = false;
  public connection: boolean = false;
  public connectionEle: HTMLElement | null = null;
  public connectionSelected: HTMLElement | null = null;
  public canvasX: number = 0;
  public canvasY: number = 0;
  public posX: number = 0;
  public posXStart: number = 0;
  public posY: number = 0;
  public posYStart: number = 0;
  public mouseX: number = 0;
  public mouseY: number = 0;
  public linePath: number = 5;
  public firstClick: any = null;
  public forceFirstInput: boolean = false;
  public draggableInputs: boolean = true;
  public useuuid: boolean = false;

  public nodeTemplates: Record<string, IFlowNodeTemplate> = {};
  public flow: IFlowWrapper = { flow: {} };
  // Configurable options
  public module: string = "";
  public editorMode: FlowEditorMode = "edit";
  public zoom: number = 1;
  public zoomMax: number = 1.6;
  public zoomMin: number = 0.5;
  public zoomValue: number = 0.1;
  public zoomLastValue: number = 1;

  // Mobile
  public evCache: PointerEvent[] = [];
  public prevDiff: number = -1;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  // Minimap
  public nodeIdPrefix: string = "node";

  // Resize
  private observer: ResizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      this.updateConnectionNodes(entry.target.id);
    });
  });

  start() {
    // console.info("Start Flow!!");
    this.container.classList.add("parent-flow");
    this.container.tabIndex = 0;
    this.precanvas = document.createElement("div");
    this.precanvas.classList.add("flow");
    this.container.appendChild(this.precanvas);

    /* Mouse and Touch Actions */
    this.container.addEventListener("mouseup", this.dragEnd.bind(this) as any);
    this.container.addEventListener("mousemove", this.position.bind(this));
    this.container.addEventListener("mousedown", this.click.bind(this));

    this.container.addEventListener("touchend", this.dragEnd.bind(this) as any);
    this.container.addEventListener("touchmove", this.position.bind(this));
    this.container.addEventListener("touchstart", this.click.bind(this));

    /* Context Menu */
    this.container.addEventListener("contextmenu", this.contextmenu.bind(this));
    /* Delete */
    this.container.addEventListener("keydown", this.key.bind(this));

    /* Zoom Mouse */
    this.container.addEventListener("wheel", this.zoomEnter.bind(this) as any);
    /* Update data Nodes */
    this.container.addEventListener("input", this.updateNodeValue.bind(this) as any);

    this.container.addEventListener("dblclick", this.dblclick.bind(this));
    /* Mobile zoom */
    this.container.onpointerdown = this.pointerDownHandler.bind(this);
    this.container.onpointermove = this.pointerMoveHandler.bind(this);
    this.container.onpointerup = this.pointerUpHandler.bind(this);
    this.container.onpointercancel = this.pointerUpHandler.bind(this);
    this.container.onpointerout = this.pointerUpHandler.bind(this);
    this.container.onpointerleave = this.pointerUpHandler.bind(this);

    // this.load();
  }

  /* Mobile zoom */
  pointerDownHandler(ev: PointerEvent) {
    this.evCache.push(ev);
  }

  pointerMoveHandler(ev: PointerEvent) {
    for (let i = 0; i < this.evCache.length; i++) {
      if (ev.pointerId === this.evCache[i].pointerId) {
        this.evCache[i] = ev;
        break;
      }
    }

    if (this.evCache.length === 2) {
      // Calculate the distance between the two pointers
      const curDiff = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);

      if (this.prevDiff > 100) {
        if (curDiff > this.prevDiff) {
          // The distance between the two pointers has increased

          this.zoomIn();
        }
        if (curDiff < this.prevDiff) {
          // The distance between the two pointers has decreased
          this.zoomOut();
        }
      }
      this.prevDiff = curDiff;
    }
  }

  pointerUpHandler(ev: PointerEvent) {
    this.removeEvent(ev);
    if (this.evCache.length < 2) {
      this.prevDiff = -1;
    }
  }
  removeEvent(ev: PointerEvent) {
    // Remove this event from the target's cache
    for (let i = 0; i < this.evCache.length; i++) {
      if (this.evCache[i].pointerId === ev.pointerId) {
        this.evCache.splice(i, 1);
        break;
      }
    }
  }
  /* End Mobile Zoom */
  load() {
    if (!this.precanvas) return;
    if (!this.module) return;
    for (const key in this.flow.flow[this.module].data) {
      if (Object.prototype.hasOwnProperty.call(this.flow.flow[this.module].data, key)) {
        this.addNodeImport(this.flow.flow[this.module].data[key], this.precanvas);
      }
    }

    if (this.reroute) {
      for (const key in this.flow.flow[this.module].data) {
        if (Object.prototype.hasOwnProperty.call(this.flow.flow[this.module].data, key)) {
          this.addRerouteImport(this.flow.flow[this.module].data[key]);
        }
      }
    }

    for (const key in this.flow.flow[this.module].data) {
      if (Object.prototype.hasOwnProperty.call(this.flow.flow[this.module].data, key)) {
        this.updateConnectionNodes(`${this.nodeIdPrefix}-${key}`);
      }
    }

    const editor = this.flow.flow;
    let number = 1;
    Object.keys(editor).map(function (moduleName, index) {
      Object.keys(editor[moduleName].data).map(function (id, index2) {
        if (+id >= number) {
          number = +id + 1;
        }
      });
    });
    this.nodeId = number;
  }

  removeRerouteConnectionSelected() {
    this.dispatch("connectionUnselected", true);
    if (this.rerouteFixCurvature && this.connectionSelected && this.connectionSelected.parentElement) {
      this.connectionSelected.parentElement.querySelectorAll(".main-path")!.forEach((item: any, i: number) => {
        item.classList.remove("selected");
      });
    }
  }

  click(e: any) {
    e.stopPropagation();
    this.dispatch("click", e);
    if (this.editorMode === "fixed") {
      if (
        e.target.classList[0] === "parent-flow" ||
        e.target.classList[0] === "flow" ||
        e.target.classList[0] === "minimap"
      ) {
        this.eleSelected = e.target.closest(".parent-flow");
      } else {
        return false;
      }
    } else if (this.editorMode === "view") {
      if (e.target.closest(".flow") != null || e.target.matches(".parent-flow")) {
        this.eleSelected = e.target.closest(".parent-flow");
        e.preventDefault();
      }
    } else {
      this.firstClick = e.target;
      this.eleSelected = e.target;
      if (e.button === 0) {
        this.contextmenuDel();
      }

      if (e.target.closest(".flow_content_node") != null) {
        this.eleSelected = e.target.closest(".flow_content_node").parentElement;
      }
    }
    // console.log(this.eleSelected);
    if (this.eleSelected) {
      switch (this.eleSelected.classList[0]) {
        case "flow-node":
          if (this.nodeSelected !== null) {
            this.nodeSelected.classList.remove("selected");
            if (this.nodeSelected !== this.eleSelected) {
              this.dispatch("nodeUnselected", true);
            }
          }
          if (this.connectionSelected != null) {
            this.connectionSelected.classList.remove("selected");
            this.removeRerouteConnectionSelected();
            this.connectionSelected = null;
          }
          if (this.nodeSelected !== this.eleSelected) {
            this.dispatch("nodeSelected", +this.eleSelected.id.slice(5));
          }
          this.nodeSelected = this.eleSelected;
          this.nodeSelected.classList.add("selected");
          if (!this.draggableInputs) {
            if (
              e.target.tagName !== "INPUT" &&
              e.target.tagName !== "TEXTAREA" &&
              e.target.tagName !== "SELECT" &&
              e.target.hasAttribute("contenteditable") !== true
            ) {
              this.drag = true;
            }
          } else {
            if (e.target.tagName !== "SELECT") {
              this.drag = true;
            }
          }
          break;
        case "output":
          this.connection = true;
          if (this.nodeSelected != null) {
            this.nodeSelected.classList.remove("selected");
            this.nodeSelected = null;
            this.dispatch("nodeUnselected", true);
          }
          if (this.connectionSelected != null) {
            this.connectionSelected.classList.remove("selected");
            this.removeRerouteConnectionSelected();
            this.connectionSelected = null;
          }
          this.drawConnection(e.target);
          break;
        case "parent-flow":
        case "flow":
        case "minimap":
          if (this.nodeSelected != null) {
            this.nodeSelected.classList.remove("selected");
            this.nodeSelected = null;
            this.dispatch("nodeUnselected", true);
          }
          if (this.connectionSelected != null) {
            this.connectionSelected.classList.remove("selected");
            this.removeRerouteConnectionSelected();
            this.connectionSelected = null;
          }
          this.editorSelected = true;
          break;
        case "main-path":
          if (this.nodeSelected != null) {
            this.nodeSelected.classList.remove("selected");
            this.nodeSelected = null;
            this.dispatch("nodeUnselected", true);
          }
          if (this.connectionSelected != null) {
            this.connectionSelected.classList.remove("selected");
            this.removeRerouteConnectionSelected();
            this.connectionSelected = null;
          }
          this.connectionSelected = this.eleSelected;
          this.connectionSelected.classList.add("selected");
          const listclassConnection = this.connectionSelected.parentElement!.classList;
          this.dispatch("connectionSelected", {
            outputId: +listclassConnection[2].slice(14),
            inputId: +listclassConnection[1].slice(13),
            outputClass: listclassConnection[3],
            inputClass: listclassConnection[4],
          });
          if (this.rerouteFixCurvature) {
            this.connectionSelected.parentElement!.querySelectorAll(".main-path").forEach((item: any, i: number) => {
              item.classList.add("selected");
            });
          }
          break;
        case "point":
          this.dragPoint = true;
          this.eleSelected.classList.add("selected");
          break;
        case "flow-delete":
          if (this.nodeSelected) {
            this.removeNodeId(this.nodeSelected.id);
          }

          if (this.connectionSelected) {
            this.removeConnection();
          }

          if (this.nodeSelected != null) {
            this.nodeSelected.classList.remove("selected");
            this.nodeSelected = null;
            this.dispatch("nodeUnselected", true);
          }
          if (this.connectionSelected != null) {
            this.connectionSelected.classList.remove("selected");
            this.removeRerouteConnectionSelected();
            this.connectionSelected = null;
          }

          break;
        default:
      }
    }
    if (e.type === "touchstart") {
      this.posX = e.touches[0].clientX;
      this.posXStart = e.touches[0].clientX;
      this.posY = e.touches[0].clientY;
      this.posYStart = e.touches[0].clientY;
    } else {
      this.posX = e.clientX;
      this.posXStart = e.clientX;
      this.posY = e.clientY;
      this.posYStart = e.clientY;
    }
    this.dispatch("clickEnd", e);
  }

  position(e: TouchEvent | MouseEvent) {
    if (!this.eleSelected) return;
    if (!this.precanvas) return;

    let ePosX: number = 0;
    let ePosY: number = 0;
    if (e.type === "touchmove" && e instanceof TouchEvent) {
      ePosX = e.touches[0].clientX;
      ePosY = e.touches[0].clientY;
    } else if (e instanceof MouseEvent) {
      ePosX = e.clientX;
      ePosY = e.clientY;
    }

    if (this.connection) {
      this.updateConnection(ePosX, ePosY);
    }
    if (this.editorSelected) {
      const x = this.canvasX + -(this.posX - ePosX);
      const y = this.canvasY + -(this.posY - ePosY);
      this.dispatch("translate", { x, y });
      this.precanvas.style.transform = `translate(${x}px, ${y}px) scale(${this.zoom})`;
    }
    if (this.drag) {
      const x = ((this.posX - ePosX) * this.precanvas.clientWidth) / (this.precanvas.clientWidth * this.zoom);
      const y = ((this.posY - ePosY) * this.precanvas.clientHeight) / (this.precanvas.clientHeight * this.zoom);
      this.posX = ePosX;
      this.posY = ePosY;

      this.eleSelected.style.top = `${this.eleSelected.offsetTop - y}px`;
      this.eleSelected.style.left = `${this.eleSelected.offsetLeft - x}px`;

      this.flow.flow[this.module].data[+this.eleSelected.id.slice(5)].posX = this.eleSelected.offsetLeft - x;
      this.flow.flow[this.module].data[+this.eleSelected.id.slice(5)].posY = this.eleSelected.offsetTop - y;

      this.updateConnectionNodes(this.eleSelected.id);
    }

    if (this.dragPoint) {
      const x = ((this.posX - ePosX) * this.precanvas.clientWidth) / (this.precanvas.clientWidth * this.zoom);
      const y = ((this.posY - ePosY) * this.precanvas.clientHeight) / (this.precanvas.clientHeight * this.zoom);
      this.posX = ePosX;
      this.posY = ePosY;

      const posX =
        this.posX * (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) -
        this.precanvas.getBoundingClientRect().x *
          (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom));
      const posY =
        this.posY * (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) -
        this.precanvas.getBoundingClientRect().y *
          (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom));

      this.eleSelected.setAttributeNS(null, "cx", String(posX));
      this.eleSelected.setAttributeNS(null, "cy", String(posY));

      if (this.eleSelected.parentElement) {
        const nodeUpdate = this.eleSelected.parentElement.classList[2].slice(9);
        const nodeUpdateIn = +this.eleSelected.parentElement.classList[1].slice(13);
        const outputClass = this.eleSelected.parentElement.classList[3];
        const inputClass = this.eleSelected.parentElement.classList[4];

        let numberPointPosition = Array.from(this.eleSelected.parentElement.children).indexOf(this.eleSelected) - 1;

        if (this.rerouteFixCurvature) {
          const numberMainPath = this.eleSelected.parentElement.querySelectorAll(".main-path").length - 1;
          numberPointPosition -= numberMainPath;
          if (numberPointPosition < 0) {
            numberPointPosition = 0;
          }
        }

        const nodeId = nodeUpdate.slice(5);
        const searchConnection = this.flow.flow[this.module].data[+nodeId].outputs[outputClass].connections.findIndex(
          function (item, i) {
            return item.node === nodeUpdateIn && item.output === inputClass;
          },
        );

        this.flow.flow[this.module].data[+nodeId].outputs[outputClass].connections[searchConnection].points[
          numberPointPosition
        ] = {
          posX,
          posY,
        };

        const parentSelected = this.eleSelected.parentElement.classList[2].slice(9);

        this.updateConnectionNodes(parentSelected);
      }
    }

    if (e.type === "touchmove") {
      this.mouseX = ePosX;
      this.mouseY = ePosY;
    }
    this.dispatch("mouseMove", { x: ePosX, y: ePosY });
  }

  dragEnd(e: DragEvent) {
    if (!this.eleSelected) return;
    let ePosX: number;
    let ePosY: number;
    let eleLast: HTMLElement | null;
    if (e.type === "touchend") {
      ePosX = this.mouseX;
      ePosY = this.mouseY;
      eleLast = document.elementFromPoint(ePosX, ePosY) as HTMLElement;
    } else {
      ePosX = e.clientX;
      ePosY = e.clientY;
      eleLast = e.target as HTMLElement;
    }

    if (this.drag) {
      if (this.posXStart !== ePosX || this.posYStart !== ePosY) {
        this.dispatch("nodeMoved", +this.eleSelected.id.slice(5));
      }
    }

    if (this.dragPoint) {
      this.eleSelected.classList.remove("selected");
      if (this.posXStart !== ePosX || this.posYStart !== ePosY) {
        this.dispatch("rerouteMoved", +this.eleSelected.parentElement!.classList[2].slice(14));
      }
    }

    if (this.editorSelected) {
      this.canvasX = this.canvasX + -(this.posX - ePosX);
      this.canvasY = this.canvasY + -(this.posY - ePosY);
      this.editorSelected = false;
    }
    if (this.connection === true) {
      if (
        eleLast.classList[0] === "input" ||
        (this.forceFirstInput &&
          (eleLast.closest(".flow_content_node") !== null || eleLast.classList[0] === "flow-node"))
      ) {
        let inputId: string = "";
        let inputClass: string = "";
        if (
          this.forceFirstInput &&
          (eleLast.closest(".flow_content_node") !== null || eleLast.classList[0] === "flow-node")
        ) {
          if (eleLast.closest(".flow_content_node") !== null) {
            inputId = eleLast.closest(".flow_content_node")!.parentElement!.id;
          } else {
            inputId = eleLast.id;
          }
          if (Object.keys(this.getNodeFromId(+inputId.slice(5)).inputs).length !== 0) {
            inputClass = "input_1";
          }
        } else {
          // Fix connection;
          inputId = eleLast.parentElement!.parentElement!.id;
          inputClass = eleLast.classList[1];
        }
        const outputId: string = this.eleSelected.parentElement!.parentElement!.id;
        const outputClass: string = this.eleSelected.classList[1];

        if (outputId !== inputId && inputClass) {
          if (
            this.container.querySelectorAll(
              `.connection.node_in_${inputId}.node_out_${outputId}.${outputClass}.${inputClass}`,
            ).length === 0
          ) {
            // Conection no exist save connection
            this.connectionEle!.classList.add(`node_in_${inputId}`);
            this.connectionEle!.classList.add(`node_out_${outputId}`);
            this.connectionEle!.classList.add(outputClass);
            this.connectionEle!.classList.add(inputClass);
            const idInput = +inputId.slice(5);
            const idOutput = +outputId.slice(5);

            this.flow.flow[this.module].data[+idOutput].outputs[outputClass].connections.push({
              node: idInput,
              output: inputClass,
              points: [],
            });
            this.flow.flow[this.module].data[+idInput].inputs[inputClass].connections.push({
              node: idOutput,
              input: outputClass,
              points: [],
            });
            this.updateConnectionNodes(`${this.nodeIdPrefix}-${idOutput}`);
            this.updateConnectionNodes(`${this.nodeIdPrefix}-${idInput}`);
            this.dispatch("connectionCreated", {
              outputId: idOutput,
              inputId: idInput,
              outputClass,
              inputClass,
            });
          } else {
            this.dispatch("connectionCancel", true);
            this.connectionEle!.remove();
          }

          this.connectionEle = null;
        } else {
          // Connection exists Remove Connection;
          this.dispatch("connectionCancel", true);
          this.connectionEle!.remove();
          this.connectionEle = null;
        }
      } else {
        // Remove Connection;
        this.dispatch("connectionCancel", true);
        this.connectionEle!.remove();
        this.connectionEle = null;
      }
    }

    this.drag = false;
    this.dragPoint = false;
    this.connection = false;
    this.eleSelected = null;
    this.editorSelected = false;

    this.dispatch("mouseUp", e);
  }

  contextmenu(e: MouseEvent) {
    this.dispatch("contextmenu", e);
    e.preventDefault();
    if (this.editorMode === "fixed" || this.editorMode === "view") return;
    if (!this.precanvas) return;
    if (this.precanvas.getElementsByClassName("flow-delete").length) {
      this.precanvas.getElementsByClassName("flow-delete")[0].remove();
    }
    if (this.nodeSelected || this.connectionSelected) {
      const deletebox = document.createElement("div");
      deletebox.classList.add("flow-delete");
      deletebox.innerHTML = "x";
      if (this.nodeSelected) {
        this.nodeSelected.appendChild(deletebox);
      }
      if (this.connectionSelected) {
        deletebox.style.top = `${
          e.clientY * (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) -
          this.precanvas.getBoundingClientRect().y *
            (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom))
        }px`;
        deletebox.style.left = `${
          e.clientX * (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) -
          this.precanvas.getBoundingClientRect().x *
            (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom))
        }px`;

        this.precanvas.appendChild(deletebox);
      }
    }
  }

  contextmenuDel() {
    if (!this.precanvas) return;
    if (this.precanvas.getElementsByClassName("flow-delete").length) {
      this.precanvas.getElementsByClassName("flow-delete")[0].remove();
    }
  }

  key(e: KeyboardEvent) {
    this.dispatch("keydown", e);
    if (this.editorMode === "fixed" || this.editorMode === "view") {
      return false;
    }
    if (e.key === "Delete" || (e.key === "Backspace" && e.metaKey)) {
      if (this.nodeSelected != null) {
        if (
          this.firstClick.tagName !== "INPUT" &&
          this.firstClick.tagName !== "TEXTAREA" &&
          this.firstClick.hasAttribute("contenteditable") !== true
        ) {
          this.removeNodeId(this.nodeSelected.id);
        }
      }
      if (this.connectionSelected != null) {
        this.removeConnection();
      }
    }
  }

  zoomEnter(event: WheelEvent, delta: number) {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY > 0) {
        // Zoom Out
        this.zoomOut();
      } else {
        // Zoom In
        this.zoomIn();
      }
    }
  }
  zoomRefresh() {
    if (!this.precanvas) return;
    this.dispatch("zoom", this.zoom);
    this.canvasX = (this.canvasX / this.zoomLastValue) * this.zoom;
    this.canvasY = (this.canvasY / this.zoomLastValue) * this.zoom;
    this.zoomLastValue = this.zoom;
    this.precanvas.style.transform = `translate(${this.canvasX}px, ${this.canvasY}px) scale(${this.zoom})`;
  }
  zoomIn() {
    if (this.zoom < this.zoomMax) {
      this.zoom += this.zoomValue;
      this.zoomRefresh();
    }
  }
  zoomOut() {
    if (this.zoom > this.zoomMin) {
      this.zoom -= this.zoomValue;
      this.zoomRefresh();
    }
  }
  zoomReset() {
    if (this.zoom !== 1) {
      this.zoom = 1;
      this.zoomRefresh();
    }
  }

  drawConnection(ele: HTMLElement) {
    if (!this.precanvas) return;
    const connection = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.connectionEle = connection as unknown as HTMLElement;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("main-path");
    path.setAttributeNS(null, "d", "");
    // path.innerHTML = 'a';
    connection.classList.add("connection");
    connection.appendChild(path);
    this.precanvas.appendChild(connection);
    const outputId = +ele.parentElement!.parentElement!.id.slice(5);
    const outputClass = ele.classList[1];
    this.dispatch("connectionStart", {
      outputId,
      outputClass,
    });
  }

  updateConnection(eX: number, eY: number) {
    if (!this.eleSelected) return;
    if (!this.connectionEle) return;
    if (!this.precanvas) return;
    const precanvas = this.precanvas;
    const zoom = this.zoom;
    let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
    precanvasWitdhZoom = precanvasWitdhZoom || 0;
    let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
    precanvasHeightZoom = precanvasHeightZoom || 0;
    const path = this.connectionEle.children[0];

    const lineX =
      this.eleSelected.offsetWidth / 2 +
      (this.eleSelected.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
    const lineY =
      this.eleSelected.offsetHeight / 2 +
      (this.eleSelected.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

    const x =
      eX * (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) -
      this.precanvas.getBoundingClientRect().x *
        (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom));
    const y =
      eY * (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) -
      this.precanvas.getBoundingClientRect().y *
        (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom));

    const curvature = this.curvature;
    const lineCurve = createCurvature(lineX, lineY, x, y, curvature, "openclose");
    path.setAttributeNS(null, "d", lineCurve);
  }

  addConnection(idOutput: number, idInput: number, outputClass: string, inputClass: string) {
    if (!this.precanvas) return;
    const nodeOneModule = this.getModuleFromNodeId(idOutput);
    const nodeTwoModule = this.getModuleFromNodeId(idInput);
    if (nodeOneModule === nodeTwoModule) {
      const dataNode = this.getNodeFromId(idOutput);
      const exist = dataNode.outputs[outputClass].connections.some(connectionSearch => {
        return connectionSearch.node === idInput && connectionSearch.output === inputClass;
      });
      // Check connection exist
      if (exist === false) {
        // Create Connection
        this.flow.flow[nodeOneModule].data[idOutput].outputs[outputClass].connections.push({
          node: idInput,
          output: inputClass,
          points: [],
        });
        this.flow.flow[nodeOneModule].data[idInput].inputs[inputClass].connections.push({
          node: idOutput,
          input: outputClass,
          points: [],
        });

        if (this.module === nodeOneModule) {
          // Draw connection
          const connection = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.classList.add("main-path");
          path.setAttributeNS(null, "d", "");
          // path.innerHTML = 'a';
          connection.classList.add("connection");
          connection.classList.add(`node_in_node-${idInput}`);
          connection.classList.add(`node_out_node-${idOutput}`);
          connection.classList.add(outputClass);
          connection.classList.add(inputClass);
          connection.appendChild(path);
          this.precanvas.appendChild(connection);
          this.updateConnectionNodes(`${this.nodeIdPrefix}-${idOutput}`);
          this.updateConnectionNodes(`${this.nodeIdPrefix}-${idInput}`);
        }

        this.dispatch("connectionCreated", {
          outputId: idOutput,
          inputId: idInput,
          outputClass,
          inputClass,
        });
      }
    }
  }

  updateConnectionNodes(id: string) {
    if (!this.precanvas) return;
    // Aquí nos quedamos;
    const idSearchIn = "node_in_" + id;
    const idSearchOut = "node_out_" + id;
    const container = this.container;
    const precanvas = this.precanvas;
    const curvature = this.curvature;
    const rerouteCurvature = this.rerouteCurvature;
    const rerouteCurvatureStartEnd = this.rerouteCurvatureStartEnd;
    const rerouteFixCurvature = this.rerouteFixCurvature;
    const rerouteWidth = this.rerouteWidth;
    const zoom = this.zoom;
    let precanvasWitdhZoom = precanvas.clientWidth / (precanvas.clientWidth * zoom);
    precanvasWitdhZoom = precanvasWitdhZoom || 0;
    let precanvasHeightZoom = precanvas.clientHeight / (precanvas.clientHeight * zoom);
    precanvasHeightZoom = precanvasHeightZoom || 0;

    const elemsOut = container.querySelectorAll(`.${idSearchOut}`) as NodeListOf<HTMLElement>;

    let elemtsearchIdOut: HTMLElement;
    let elemtsearchIdIn: HTMLElement;
    let idSearch: string;
    let elemtsearchId: HTMLElement;
    let elemtsearch: HTMLElement;
    let elemtsearchOut: HTMLElement;
    let elemtsearchIn: HTMLElement;
    let eX: number;
    let eY: number;
    let lineX: number;
    let lineY: number;
    let x: number;
    let y: number;
    let lineCurve: string;
    let lineCurveSearch: string;

    Object.keys(elemsOut).map(function (item, index) {
      if (elemsOut[+item].querySelector(".point") === null) {
        elemtsearchIdOut = container.querySelector(`#${id}`)! as HTMLElement;

        idSearch = elemsOut[+item].classList[1].replace("node_in_", "");
        elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;

        elemtsearch = elemtsearchId.querySelectorAll("." + elemsOut[+item].classList[4])[0] as HTMLElement;

        eX =
          elemtsearch.offsetWidth / 2 +
          (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
        eY =
          elemtsearch.offsetHeight / 2 +
          (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

        elemtsearchOut = elemtsearchIdOut.querySelectorAll("." + elemsOut[+item].classList[3])[0] as HTMLElement;

        lineX =
          elemtsearchOut.offsetWidth / 2 +
          (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
        lineY =
          elemtsearchOut.offsetHeight / 2 +
          (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

        x = eX;
        y = eY;

        lineCurve = createCurvature(lineX, lineY, x, y, curvature, "openclose");
        elemsOut[+item].children[0].setAttributeNS(null, "d", lineCurve);
      } else {
        const points = elemsOut[+item].querySelectorAll(".point") as NodeListOf<HTMLElement>;
        let linecurve = "";
        const reouteFix: string[] = [];
        points.forEach((elItem, i) => {
          if (!elItem.parentElement) return;
          if (i === 0 && points.length - 1 === 0) {
            elemtsearchIdOut = container.querySelector(`#${id}`)! as HTMLElement;
            elemtsearch = elItem;

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;

            elemtsearchOut = elemtsearchIdOut.querySelectorAll(
              "." + elItem.parentElement.classList[3],
            )[0] as HTMLElement;
            lineX =
              elemtsearchOut.offsetWidth / 2 +
              (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            lineY =
              elemtsearchOut.offsetHeight / 2 +
              (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "open");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);

            elemtsearchIdOut = elItem;
            idSearch = elItem.parentElement.classList[1].replace("node_in_", "");
            elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;
            elemtsearch = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;

            elemtsearchIn = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;
            eX =
              elemtsearchIn.offsetWidth / 2 +
              (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            eY =
              elemtsearchIn.offsetHeight / 2 +
              (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "close");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else if (i === 0) {
            elemtsearchIdOut = container.querySelector(`#${id}`) as HTMLElement;
            elemtsearch = elItem;

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;

            elemtsearchOut = elemtsearchIdOut.querySelectorAll(
              "." + elItem.parentElement.classList[3],
            )[0] as HTMLElement;
            lineX =
              elemtsearchOut.offsetWidth / 2 +
              (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            lineY =
              elemtsearchOut.offsetHeight / 2 +
              (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "open");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);

            // SECOND
            elemtsearchIdOut = elItem;
            elemtsearch = points[i + 1];

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvature, "other");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else if (i === points.length - 1) {
            elemtsearchIdOut = elItem;

            idSearch = elItem.parentElement.classList[1].replace("node_in_", "");
            elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;
            elemtsearch = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;

            elemtsearchIn = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;
            eX =
              elemtsearchIn.offsetWidth / 2 +
              (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            eY =
              elemtsearchIn.offsetHeight / 2 +
              (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;
            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) *
                (precanvas.clientWidth / (precanvas.clientWidth * zoom)) +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) *
                (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "close");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else {
            elemtsearchIdOut = elItem;
            elemtsearch = points[i + 1];

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) *
                (precanvas.clientWidth / (precanvas.clientWidth * zoom)) +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) *
                (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +
              rerouteWidth;
            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) *
                (precanvas.clientWidth / (precanvas.clientWidth * zoom)) +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) *
                (precanvas.clientHeight / (precanvas.clientHeight * zoom)) +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvature, "other");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          }
        });
        if (rerouteFixCurvature) {
          reouteFix.forEach((itempath, i) => {
            elemsOut[+item].children[i].setAttributeNS(null, "d", itempath);
          });
        } else {
          elemsOut[+item].children[0].setAttributeNS(null, "d", linecurve);
        }
      }
    });

    const elems = container.querySelectorAll(`.${idSearchIn}`);
    Object.keys(elems).map(function (item, index) {
      if (elems[+item].querySelector(".point") === null) {
        elemtsearchIdIn = container.querySelector(`#${id}`) as HTMLElement;

        idSearch = elems[+item].classList[2].replace("node_out_", "");
        elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;
        elemtsearch = elemtsearchId.querySelectorAll("." + elems[+item].classList[3])[0] as HTMLElement;

        lineX =
          elemtsearch.offsetWidth / 2 +
          (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
        lineY =
          elemtsearch.offsetHeight / 2 +
          (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

        elemtsearchIdIn = elemtsearchIdIn.querySelectorAll("." + elems[+item].classList[4])[0] as HTMLElement;
        x =
          elemtsearchIdIn.offsetWidth / 2 +
          (elemtsearchIdIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
        y =
          elemtsearchIdIn.offsetHeight / 2 +
          (elemtsearchIdIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

        lineCurve = createCurvature(lineX, lineY, x, y, curvature, "openclose");
        elems[+item].children[0].setAttributeNS(null, "d", lineCurve);
      } else {
        const points: NodeListOf<HTMLElement> = elems[+item].querySelectorAll(".point") as NodeListOf<HTMLElement>;
        let linecurve = "";
        const reouteFix: string[] = [];
        points.forEach((elItem, i) => {
          if (!elItem.parentElement) return;
          if (i === 0 && points.length - 1 === 0) {
            elemtsearchIdOut = container.querySelector(`#${id}`) as HTMLElement;
            elemtsearch = elItem as HTMLElement;

            lineX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;

            elemtsearchIn = elemtsearchIdOut.querySelectorAll(
              "." + elItem.parentElement.classList[4],
            )[0] as HTMLElement;
            eX =
              elemtsearchIn.offsetWidth / 2 +
              (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            eY =
              elemtsearchIn.offsetHeight / 2 +
              (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "close");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);

            elemtsearchIdOut = elItem;
            idSearch = elItem.parentElement.classList[2].replace("node_out_", "");
            elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;
            elemtsearch = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[3])[0] as HTMLElement;

            elemtsearchOut = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[3])[0] as HTMLElement;
            lineX =
              elemtsearchOut.offsetWidth / 2 +
              (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            lineY =
              elemtsearchOut.offsetHeight / 2 +
              (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            eX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "open");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else if (i === 0) {
            // FIRST
            elemtsearchIdOut = elItem;
            idSearch = elItem.parentElement.classList[2].replace("node_out_", "");
            elemtsearchId = container.querySelector(`#${idSearch}`)! as HTMLElement;
            elemtsearch = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[3])[0] as HTMLElement;
            elemtsearchOut = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[3])[0] as HTMLElement;
            lineX =
              elemtsearchOut.offsetWidth / 2 +
              (elemtsearchOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            lineY =
              elemtsearchOut.offsetHeight / 2 +
              (elemtsearchOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            eX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "open");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);

            // SECOND
            elemtsearchIdOut = elItem;
            elemtsearch = points[i + 1];

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvature, "other");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else if (i === points.length - 1) {
            elemtsearchIdOut = elItem;

            idSearch = elItem.parentElement.classList[1].replace("node_in_", "");
            elemtsearchId = container.querySelector(`#${idSearch}`) as HTMLElement;
            elemtsearch = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;

            elemtsearchIn = elemtsearchId.querySelectorAll("." + elItem.parentElement.classList[4])[0] as HTMLElement;
            eX =
              elemtsearchIn.offsetWidth / 2 +
              (elemtsearchIn.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom;
            eY =
              elemtsearchIn.offsetHeight / 2 +
              (elemtsearchIn.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom;

            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvatureStartEnd, "close");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          } else {
            elemtsearchIdOut = elItem;
            elemtsearch = points[i + 1];

            eX =
              (elemtsearch.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            eY =
              (elemtsearch.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            lineX =
              (elemtsearchIdOut.getBoundingClientRect().x - precanvas.getBoundingClientRect().x) * precanvasWitdhZoom +
              rerouteWidth;
            lineY =
              (elemtsearchIdOut.getBoundingClientRect().y - precanvas.getBoundingClientRect().y) * precanvasHeightZoom +
              rerouteWidth;
            x = eX;
            y = eY;

            lineCurveSearch = createCurvature(lineX, lineY, x, y, rerouteCurvature, "other");
            linecurve += lineCurveSearch;
            reouteFix.push(lineCurveSearch);
          }
        });
        if (rerouteFixCurvature) {
          reouteFix.forEach((itempath, i) => {
            elems[+item].children[i].setAttributeNS(null, "d", itempath);
          });
        } else {
          elems[+item].children[0].setAttributeNS(null, "d", linecurve);
        }
      }
    });
  }

  dblclick(e: MouseEvent) {
    if (this.connectionSelected != null && this.reroute) {
      this.createReroutePoint(this.connectionSelected);
    }

    if (e.target && (e.target as HTMLElement).classList[0] === "point") {
      this.removeReroutePoint(e.target as HTMLElement);
    }
  }

  createReroutePoint(ele: HTMLElement) {
    if (!ele.parentElement) return;
    if (!this.precanvas) return;
    if (!this.connectionSelected) return;
    if (!this.connectionSelected.parentElement) return;
    this.connectionSelected.classList.remove("selected");
    const nodeUpdate = this.connectionSelected.parentElement.classList[2].slice(9);
    const nodeUpdateIn = +this.connectionSelected.parentElement.classList[1].slice(13);
    const outputClass = this.connectionSelected.parentElement.classList[3];
    const inputClass = this.connectionSelected.parentElement.classList[4];
    this.connectionSelected = null;
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.classList.add("point");
    const posX =
      this.posX * (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom)) -
      this.precanvas.getBoundingClientRect().x *
        (this.precanvas.clientWidth / (this.precanvas.clientWidth * this.zoom));
    const posY =
      this.posY * (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom)) -
      this.precanvas.getBoundingClientRect().y *
        (this.precanvas.clientHeight / (this.precanvas.clientHeight * this.zoom));

    point.setAttributeNS(null, "cx", String(posX));
    point.setAttributeNS(null, "cy", String(posY));
    point.setAttributeNS(null, "r", String(this.rerouteWidth));

    let positionAddArrayPoint = 0;
    if (this.rerouteFixCurvature) {
      const numberPoints = ele.parentElement.querySelectorAll(".main-path").length;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.classList.add("main-path");
      path.setAttributeNS(null, "d", "");

      ele.parentElement.insertBefore(path, ele.parentElement.children[numberPoints]);
      if (numberPoints === 1) {
        ele.parentElement.appendChild(point);
      } else {
        const searchPoint = Array.from(ele.parentElement.children).indexOf(ele);
        positionAddArrayPoint = searchPoint;
        ele.parentElement.insertBefore(point, ele.parentElement.children[searchPoint + numberPoints + 1]);
      }
    } else {
      ele.parentElement.appendChild(point);
    }

    const nodeId = +nodeUpdate.slice(5);
    const searchConnection = this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections.findIndex(
      function (item, i) {
        return item.node === nodeUpdateIn && item.output === inputClass;
      },
    );

    if (
      this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points === undefined
    ) {
      this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points = [];
    }

    if (this.rerouteFixCurvature) {
      // console.log(positionAddArrayPoint)
      if (positionAddArrayPoint > 0) {
        this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points.splice(
          positionAddArrayPoint,
          0,
          { posX, posY },
        );
      } else {
        this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points.push({
          posX,
          posY,
        });
      }

      ele.parentElement.querySelectorAll(".main-path").forEach((item, i) => {
        item.classList.remove("selected");
      });
    } else {
      this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points.push({
        posX,
        posY,
      });
    }

    this.dispatch("addReroute", nodeId);
    this.updateConnectionNodes(nodeUpdate);
  }

  removeReroutePoint(ele: HTMLElement) {
    if (!ele.parentElement) return;
    const nodeUpdate = ele.parentElement.classList[2].slice(9);
    const nodeUpdateIn = +ele.parentElement.classList[1].slice(13);
    const outputClass = ele.parentElement.classList[3];
    const inputClass = ele.parentElement.classList[4];

    let numberPointPosition = Array.from(ele.parentElement.children).indexOf(ele) - 1;

    const nodeId = +nodeUpdate.slice(5);
    const searchConnection = this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections.findIndex(
      function (item, i) {
        return item.node === nodeUpdateIn && item.output === inputClass;
      },
    );

    if (this.rerouteFixCurvature) {
      const numberMainPath = ele.parentElement.querySelectorAll(".main-path").length;
      ele.parentElement.children[numberMainPath - 1].remove();
      numberPointPosition -= numberMainPath;
      if (numberPointPosition < 0) {
        numberPointPosition = 0;
      }
    }
    this.flow.flow[this.module].data[nodeId].outputs[outputClass].connections[searchConnection].points.splice(
      numberPointPosition,
      1,
    );

    ele.remove();
    this.dispatch("removeReroute", nodeId);
    this.updateConnectionNodes(nodeUpdate);
  }

  registerNode(
    name: string,
    copy: (content: HTMLElement, id: number, data: Record<string, any>, module: string) => void,
  ) {
    this.nodeTemplates[name] = { name, copy };
    this.dispatch("nodeRegistered", { name, copy });
  }

  getNodeFromId(id: number) {
    const moduleName = this.getModuleFromNodeId(id);
    return JSON.parse(JSON.stringify(this.flow.flow[moduleName].data[id])) as IFlowNode;
  }
  getNodesFromName(name: string) {
    const nodes: number[] = [];
    const editor = this.flow.flow;
    Object.keys(editor).map(function (moduleName, index) {
      for (const node in editor[moduleName].data) {
        if (editor[moduleName].data[node].name === name) {
          nodes.push(editor[moduleName].data[node].id);
        }
      }
    });
    return nodes;
  }

  addNode(
    name: string,
    numIn: number,
    numOut: number,
    elePosX: number,
    elePosY: number,
    classoverride: string,
    data: Record<string, any>,
    html: string,
    typenode: boolean = false,
  ) {
    if (!this.precanvas) return;
    const newNodeId = this.nodeId;
    const parent = document.createElement("div");
    parent.classList.add("parent-node");

    const node = document.createElement("div");
    node.innerHTML = "";
    node.setAttribute("id", `${this.nodeIdPrefix}-${newNodeId}`);
    node.classList.add("flow-node");
    if (classoverride) {
      node.classList.add(classoverride);
    }

    const inputs = document.createElement("div");
    inputs.classList.add("inputs");

    const outputs = document.createElement("div");
    outputs.classList.add("outputs");

    const jsonInputs: Record<string, IFlowConnection> = {};
    for (let x = 0; x < numIn; x++) {
      const input = document.createElement("div");
      input.classList.add("input");
      input.classList.add(`input_${x + 1}`);
      jsonInputs[`input_${x + 1}`] = { connections: [] };
      inputs.appendChild(input);
    }

    const jsonOutputs: Record<string, IFlowConnection> = {};
    for (let x = 0; x < numOut; x++) {
      const output = document.createElement("div");
      output.classList.add("output");
      output.classList.add(`output_${x + 1}`);
      jsonOutputs[`output_${x + 1}`] = { connections: [] };
      outputs.appendChild(output);
    }

    const content = document.createElement("div");
    content.classList.add("flow_content_node");
    if (typenode) {
      const template = this.nodeTemplates[html];
      template.copy(content, this.nodeId, data, this.module);
    } else {
      content.innerHTML = html;
    }
    this.bindData(data, content);

    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    node.style.top = `${elePosY}px`;
    node.style.left = `${elePosX}px`;
    this.observer.observe(node);
    parent.appendChild(node);
    this.precanvas.appendChild(parent);
    const json: IFlowNode = {
      id: newNodeId,
      name,
      data,
      class: classoverride,
      html,
      typenode,
      inputs: jsonInputs,
      outputs: jsonOutputs,
      posX: elePosX,
      posY: elePosY,
    };
    this.flow.flow[this.module].data[newNodeId] = json;
    this.dispatch("nodeCreated", newNodeId);
    if (!this.useuuid) {
      this.nodeId++;
    }
    return newNodeId;
  }

  addNodeImport(dataNode: IFlowNode, precanvas: HTMLElement) {
    const parent = document.createElement("div");
    parent.classList.add("parent-node");

    const node = document.createElement("div");
    node.innerHTML = "";
    node.setAttribute("id", `${this.nodeIdPrefix}-${dataNode.id}`);
    node.classList.add("flow-node");
    if (dataNode.class !== "") {
      node.classList.add(dataNode.class);
    }

    const inputs = document.createElement("div");
    inputs.classList.add("inputs");

    const outputs = document.createElement("div");
    outputs.classList.add("outputs");

    Object.keys(dataNode.inputs).map(function (inputItem) {
      const input = document.createElement("div");
      input.classList.add("input");
      input.classList.add(inputItem);
      inputs.appendChild(input);
      Object.keys(dataNode.inputs[inputItem].connections).map(function (outputItem) {
        const connection = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add("main-path");
        path.setAttributeNS(null, "d", "");
        // path.innerHTML = 'a';
        connection.classList.add("connection");
        connection.classList.add(`node_in_node-${dataNode.id}`);
        connection.classList.add(`node_out_node-${dataNode.inputs[inputItem].connections[+outputItem].node}`);
        connection.classList.add(dataNode.inputs[inputItem].connections[+outputItem].input!);
        connection.classList.add(inputItem);

        connection.appendChild(path);
        precanvas.appendChild(connection);
      });
    });

    for (let x = 0; x < Object.keys(dataNode.outputs).length; x++) {
      const output = document.createElement("div");
      output.classList.add("output");
      output.classList.add(`output_${x + 1}`);
      outputs.appendChild(output);
    }

    const content = document.createElement("div");
    content.classList.add("flow_content_node");

    if (dataNode.typenode) {
      const template = this.nodeTemplates[dataNode.html];
      template.copy(content, dataNode.id, dataNode.data, this.module);
    } else {
      content.innerHTML = dataNode.html;
    }
    this.bindData(dataNode.data, content);

    node.appendChild(inputs);
    node.appendChild(content);
    node.appendChild(outputs);
    node.style.top = `${dataNode.posY}px`;
    node.style.left = `${dataNode.posX}px`;
    this.observer.observe(node);
    parent.appendChild(node);
    precanvas.appendChild(parent);
  }

  addRerouteImport(dataNode: IFlowNode) {
    const rerouteWidth = this.rerouteWidth;
    const rerouteFixCurvature = this.rerouteFixCurvature;
    const container = this.container;
    Object.keys(dataNode.outputs).map(function (outputItem) {
      Object.keys(dataNode.outputs[outputItem].connections).map(function (inputItem) {
        const points = dataNode.outputs[outputItem].connections[+inputItem].points;
        if (points !== undefined) {
          points.forEach((item, i) => {
            const inputId = dataNode.outputs[outputItem].connections[+inputItem].node;
            const inputClass = dataNode.outputs[outputItem].connections[+inputItem].output;
            const ele = container.querySelector(
              `.connection.node_in_node-${inputId}.node_out_node-${dataNode.id}.${outputItem}.${inputClass}`,
            ) as SVGElement;

            if (rerouteFixCurvature) {
              if (i === 0) {
                points.forEach(() => {
                  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  path.classList.add("main-path");
                  path.setAttributeNS(null, "d", "");
                  ele.appendChild(path);
                });
              }
            }

            const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            point.classList.add("point");
            const posX = item.posX;
            const posY = item.posY;

            point.setAttributeNS(null, "cx", String(posX));
            point.setAttributeNS(null, "cy", String(posY));
            point.setAttributeNS(null, "r", String(rerouteWidth));

            ele.appendChild(point);
          });
        }
      });
    });
  }

  updateNodeValue(event: InputEvent) {
    const ele = event.target as HTMLElement;
    for (let i = 0; i < ele.attributes.length; i++) {
      const attr = ele.attributes.item(i);
      if (!attr) continue;
      if (attr.nodeName.startsWith("df-")) {
        const keys = attr.nodeName.slice(3).split("-");
        const closest = ele.closest(".flow_content_node") as HTMLElement;
        const closestParent = closest.parentElement as HTMLElement;
        let target = this.flow.flow[this.module].data[+closestParent.id.slice(5)].data;
        for (let index = 0; index < keys.length - 1; index += 1) {
          if (target[keys[index]] === null) {
            target[keys[index]] = {};
          }
          target = target[keys[index]];
        }
        target[keys[keys.length - 1]] = (ele as any).value;
        if (ele.isContentEditable) {
          target[keys[keys.length - 1]] = ele.innerText;
        }
        this.dispatch("nodeDataChanged", +closestParent.id.slice(5));
      }
    }
  }

  updateNodeDataFromId(id: number, data: Record<string, any>) {
    const moduleName = this.getModuleFromNodeId(id);
    this.flow.flow[moduleName].data[id].data = data;
    if (this.module === moduleName) {
      const content = this.container.querySelector(`#${this.nodeIdPrefix}-${id}`) as HTMLElement;
      this.bindData(data, content);
    }
  }

  addNodeInput(id: number) {
    const moduleName = this.getModuleFromNodeId(id);
    const infoNode = this.getNodeFromId(id);
    const numInputs = Object.keys(infoNode.inputs).length;
    if (this.module === moduleName) {
      // Draw input
      const input = document.createElement("div");
      input.classList.add("input");
      input.classList.add(`input_${numInputs + 1}`);
      const parent = this.container.querySelector(`#${this.nodeIdPrefix}-${id} .inputs`) as HTMLElement;
      parent.appendChild(input);
      this.updateConnectionNodes(`${this.nodeIdPrefix}-${id}`);
    }
    this.flow.flow[moduleName].data[id].inputs[`input_${numInputs + 1}`] = {
      connections: [],
    };
  }

  addNodeOutput(id: number) {
    const moduleName = this.getModuleFromNodeId(id);
    const infoNode = this.getNodeFromId(id);
    const numOutputs = Object.keys(infoNode.outputs).length;
    if (this.module === moduleName) {
      // Draw output
      const output = document.createElement("div");
      output.classList.add("output");
      output.classList.add(`output_${numOutputs + 1}`);
      const parent = this.container.querySelector(`#${this.nodeIdPrefix}-${id} .outputs`) as HTMLElement;
      parent.appendChild(output);
      this.updateConnectionNodes(`${this.nodeIdPrefix}-${id}`);
    }
    this.flow.flow[moduleName].data[id].outputs[`output_${numOutputs + 1}`] = {
      connections: [],
    };
  }

  removeNodeInput(id: number, inputClass: string) {
    const moduleName = this.getModuleFromNodeId(id);
    const infoNode = this.getNodeFromId(id);
    if (this.module === moduleName) {
      this.container.querySelector(`#${this.nodeIdPrefix}-${id} .inputs .input.${inputClass}`)!.remove();
    }
    const removeInputs: Array<{
      idOutput: number;
      id: number;
      outputClass: string;
      inputClass: string;
    }> = [];
    Object.keys(infoNode.inputs[inputClass].connections).map(function (key, index) {
      const idOutput = infoNode.inputs[inputClass].connections[index].node;
      const outputClass = infoNode.inputs[inputClass].connections[index].input!;
      removeInputs.push({ idOutput, id, outputClass, inputClass });
    });
    // Remove connections
    removeInputs.forEach((item, i) => {
      this.removeSingleConnection(item.idOutput, item.id, item.outputClass, item.inputClass);
    });

    delete this.flow.flow[moduleName].data[id].inputs[inputClass];

    // Update connection
    const connections: IFlowConnection[] = [];
    const connectionsInputs = this.flow.flow[moduleName].data[id].inputs;
    Object.keys(connectionsInputs).map(function (key, index) {
      connections.push(connectionsInputs[key]);
    });
    this.flow.flow[moduleName].data[id].inputs = {};
    const inputClassId = +inputClass.slice(6);
    let nodeUpdates: IFlowConnectionDetail[] = [];
    connections.forEach((item, i) => {
      item.connections.forEach((itemx, f) => {
        nodeUpdates.push(itemx);
      });
      this.flow.flow[moduleName].data[id].inputs[`input_${i + 1}`] = item;
    });
    const nodeUpdatesSet = new Set(nodeUpdates.map(e => JSON.stringify(e)));
    nodeUpdates = Array.from(nodeUpdatesSet).map(e => JSON.parse(e));

    if (this.module === moduleName) {
      const eles = this.container.querySelectorAll(`#${this.nodeIdPrefix}-${id} .inputs .input`);
      eles.forEach((item, i) => {
        const idClass = +item.classList[1].slice(6);
        if (inputClassId < idClass) {
          item.classList.remove(`input_${idClass}`);
          item.classList.add(`input_${idClass - 1}`);
        }
      });
    }

    nodeUpdates.forEach((itemx, i) => {
      this.flow.flow[moduleName].data[itemx.node].outputs[itemx.input!].connections.forEach((itemz, g) => {
        if (itemz.node === id) {
          const outputId = +itemz.output!.slice(6);
          if (inputClassId < outputId) {
            if (this.module === moduleName) {
              const ele = this.container.querySelector(
                `.connection.node_in_node-${id}.node_out_node-${itemx.node}.${itemx.input}.input_${outputId}`,
              ) as HTMLElement;
              ele.classList.remove(`input_${outputId}`);
              ele.classList.add(`input_${outputId - 1}`);
            }
            if (itemz.points) {
              this.flow.flow[moduleName].data[itemx.node].outputs[itemx.input!].connections[g] = {
                node: itemz.node,
                output: `input_${outputId - 1}`,
                points: itemz.points,
              };
            } else {
              this.flow.flow[moduleName].data[itemx.node].outputs[itemx.input!].connections[g] = {
                node: itemz.node,
                output: `input_${outputId - 1}`,
                points: [],
              };
            }
          }
        }
      });
    });
    this.updateConnectionNodes(`${this.nodeIdPrefix}-${id}`);
  }

  removeNodeOutput(id: number, outputClass: string) {
    const moduleName = this.getModuleFromNodeId(id);
    const infoNode = this.getNodeFromId(id);
    if (this.module === moduleName) {
      this.container.querySelector(`#${this.nodeIdPrefix}-${id} .outputs .output.${outputClass}`)!.remove();
    }
    const removeOutputs: Array<{
      id: number;
      idInput: number;
      outputClass: string;
      inputClass: string;
    }> = [];
    Object.keys(infoNode.outputs[outputClass].connections).map(function (key, index) {
      const idInput = infoNode.outputs[outputClass].connections[index].node;
      const inputClass = infoNode.outputs[outputClass].connections[index].output!;
      removeOutputs.push({ id, idInput, outputClass, inputClass });
    });
    // Remove connections
    removeOutputs.forEach((item, i) => {
      this.removeSingleConnection(item.id, item.idInput, item.outputClass, item.inputClass);
    });

    delete this.flow.flow[moduleName].data[id].outputs[outputClass];

    // Update connection
    const connections: IFlowConnection[] = [];
    const connectionsOuputs = this.flow.flow[moduleName].data[id].outputs;
    Object.keys(connectionsOuputs).map(function (key, index) {
      connections.push(connectionsOuputs[key]);
    });
    this.flow.flow[moduleName].data[id].outputs = {};
    const outputClassId = +outputClass.slice(7);
    let nodeUpdates: IFlowConnectionDetail[] = [];
    connections.forEach((item, i) => {
      item.connections.forEach((itemx, f) => {
        nodeUpdates.push({ node: itemx.node, output: itemx.output, points: [] });
      });
      this.flow.flow[moduleName].data[id].outputs[`output_${i + 1}`] = item;
    });
    const nodeUpdatesSet = new Set(nodeUpdates.map(e => JSON.stringify(e)));
    nodeUpdates = Array.from(nodeUpdatesSet).map(e => JSON.parse(e));

    if (this.module === moduleName) {
      const eles = this.container.querySelectorAll(`#${this.nodeIdPrefix}-${id} .outputs .output`);
      eles.forEach((item, i) => {
        const idClass = +item.classList[1].slice(7);
        if (outputClassId < idClass) {
          item.classList.remove(`output_${idClass}`);
          item.classList.add(`output_${idClass - 1}`);
        }
      });
    }

    nodeUpdates.forEach((itemx, i) => {
      this.flow.flow[moduleName].data[itemx.node].inputs[itemx.output!].connections.forEach((itemz, g) => {
        if (itemz.node === id) {
          const inputId = +itemz.input!.slice(7);
          if (outputClassId < inputId) {
            if (this.module === moduleName) {
              const ele = this.container.querySelector(
                `.connection.node_in_node-${itemx.node}.node_out_node-${id}.output_${inputId}.${itemx.output}`,
              ) as HTMLElement;
              ele.classList.remove(`output_${inputId}`);
              ele.classList.remove(itemx.output!);
              ele.classList.add(`output_${inputId - 1}`);
              ele.classList.add(itemx.output!);
            }
            if (itemz.points) {
              this.flow.flow[moduleName].data[itemx.node].inputs[itemx.output!].connections[g] = {
                node: itemz.node,
                input: `output_${inputId - 1}`,
                points: itemz.points,
              };
            } else {
              this.flow.flow[moduleName].data[itemx.node].inputs[itemx.output!].connections[g] = {
                node: itemz.node,
                input: `output_${inputId - 1}`,
                points: [],
              };
            }
          }
        }
      });
    });

    this.updateConnectionNodes(`${this.nodeIdPrefix}-${id}`);
  }

  removeNodeId(id: string) {
    this.removeConnectionNodeId(id);
    const moduleName = this.getModuleFromNodeId(+id.slice(5));
    if (this.module === moduleName) {
      const el = this.container.querySelector(`#${id}`);
      if (el) {
        el.remove();
      }
    }
    delete this.flow.flow[moduleName].data[+id.slice(5)];
    this.dispatch("nodeRemoved", +id.slice(5));
  }

  removeConnection() {
    if (this.connectionSelected != null) {
      const listclass = this.connectionSelected.parentElement!.classList;
      this.connectionSelected.parentElement!.remove();
      // console.log(listclass);
      const indexOut = this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[
        listclass[3]
      ].connections.findIndex(function (item: IFlowConnectionDetail, i: number) {
        return item.node === +listclass[1].slice(13) && item.output === listclass[4];
      });
      this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[listclass[3]].connections.splice(indexOut, 1);

      const indexIn = this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[
        listclass[4]
      ].connections.findIndex(function (item: IFlowConnectionDetail, i: number) {
        return item.node === +listclass[2].slice(14) && item.input === listclass[3];
      });
      this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[listclass[4]].connections.splice(indexIn, 1);
      this.dispatch("connectionRemoved", {
        outputId: +listclass[2].slice(14),
        inputId: +listclass[1].slice(13),
        outputClass: listclass[3],
        inputClass: listclass[4],
      });
      this.connectionSelected = null;
    }
  }

  removeSingleConnection(idOutput: number, idInput: number, outputClass: string, inputClass: string) {
    const nodeOneModule = this.getModuleFromNodeId(idOutput);
    const nodeTwoModule = this.getModuleFromNodeId(idInput);
    if (nodeOneModule === nodeTwoModule) {
      // Check nodes in same module.

      // Check connection exist
      const exists = this.flow.flow[nodeOneModule].data[idOutput].outputs[outputClass].connections.findIndex(function (
        item,
        i,
      ) {
        return item.node === idInput && item.output === inputClass;
      });
      if (exists > -1) {
        if (this.module === nodeOneModule) {
          // In same module with view.
          this.container
            .querySelector(
              `.connection.node_in_node-${idInput}.node_out_node-${idOutput}.${outputClass}.${inputClass}`,
            )!
            .remove();
        }

        const indexOut = this.flow.flow[nodeOneModule].data[idOutput].outputs[outputClass].connections.findIndex(
          function (item, i) {
            return item.node === idInput && item.output === inputClass;
          },
        );
        this.flow.flow[nodeOneModule].data[idOutput].outputs[outputClass].connections.splice(indexOut, 1);

        const indexIn = this.flow.flow[nodeOneModule].data[idInput].inputs[inputClass].connections.findIndex(function (
          item,
          i,
        ) {
          return item.node === idOutput && item.input === outputClass;
        });
        this.flow.flow[nodeOneModule].data[idInput].inputs[inputClass].connections.splice(indexIn, 1);

        this.dispatch("connectionRemoved", {
          outputId: idOutput,
          inputId: idInput,
          outputClass,
          inputClass,
        });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  removeConnectionNodeId(id: string) {
    const idSearchIn = "node_in_" + id;
    const idSearchOut = "node_out_" + id;

    const elemsOut = this.container.querySelectorAll(`.${idSearchOut}`);
    for (let i = elemsOut.length - 1; i >= 0; i--) {
      const listclass = elemsOut[i].classList;

      const indexIn = this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[
        listclass[4]
      ].connections.findIndex(function (item: IFlowConnectionDetail) {
        return item.node === +listclass[2].slice(14) && item.input === listclass[3];
      });
      this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[listclass[4]].connections.splice(indexIn, 1);

      const indexOut = this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[
        listclass[3]
      ].connections.findIndex(function (item: IFlowConnectionDetail) {
        return item.node === +listclass[1].slice(13) && item.output === listclass[4];
      });
      this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[listclass[3]].connections.splice(indexOut, 1);

      elemsOut[i].remove();

      this.dispatch("connectionRemoved", {
        outputId: +listclass[2].slice(14),
        inputId: +listclass[1].slice(13),
        outputClass: listclass[3],
        inputClass: listclass[4],
      });
    }

    const elemsIn = this.container.querySelectorAll(`.${idSearchIn}`);
    for (let i = elemsIn.length - 1; i >= 0; i--) {
      const listclass = elemsIn[i].classList;

      const indexOut = this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[
        listclass[3]
      ].connections.findIndex(function (item: IFlowConnectionDetail) {
        return item.node === +listclass[1].slice(13) && item.output === listclass[4];
      });
      this.flow.flow[this.module].data[+listclass[2].slice(14)].outputs[listclass[3]].connections.splice(indexOut, 1);

      const indexIn = this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[
        listclass[4]
      ].connections.findIndex(function (item: IFlowConnectionDetail) {
        return item.node === +listclass[2].slice(14) && item.input === listclass[3];
      });
      this.flow.flow[this.module].data[+listclass[1].slice(13)].inputs[listclass[4]].connections.splice(indexIn, 1);

      elemsIn[i].remove();

      this.dispatch("connectionRemoved", {
        outputId: +listclass[2].slice(14),
        inputId: +listclass[1].slice(13),
        outputClass: listclass[3],
        inputClass: listclass[4],
      });
    }
  }

  bindData(data: Record<string, any>, content: HTMLElement) {
    function insertObjectkeys(object: Record<string, any> | null, name: string, completname: string) {
      if (object === null) {
        object = data[name];
      } else {
        object = object[name];
      }
      if (object !== null) {
        Object.entries(object).forEach(function (key, value) {
          if (typeof key[1] === "object") {
            insertObjectkeys(object, key[0], completname + "-" + key[0]);
          } else {
            const elems = content.querySelectorAll(
              "[df-" + completname + "-" + key[0] + "]",
            ) as NodeListOf<HTMLElement>;
            elems.forEach(elem => {
              (elem as any).value = key[1];
              if (elem.isContentEditable) {
                elem.innerText = key[1];
              }
            });
          }
        });
      }
    }

    Object.entries(data).forEach(function (key, value) {
      if (typeof key[1] === "object") {
        insertObjectkeys(null, key[0], key[0]);
      } else {
        const elems = content.querySelectorAll("[df-" + key[0] + "]") as NodeListOf<HTMLElement>;
        elems.forEach(elem => {
          (elem as any).value = key[1];
          if (elem.isContentEditable) {
            elem.innerText = key[1];
          }
        });
      }
    });
  }

  getModuleFromNodeId(id: number) {
    let nameModule: string = "";
    const editor = this.flow.flow;
    Object.keys(editor).map(function (moduleName, index) {
      Object.keys(editor[moduleName].data).map(function (node, index2) {
        if (+node === id) {
          nameModule = moduleName;
        }
      });
    });
    return nameModule;
  }

  getModule(name: string) {
    return this.flow.flow[name];
  }

  addModule(module: IFlowModule) {
    this.flow.flow[module.name] = module;
    if (!this.module) {
      this.module = module.name;
      this.load();
    }
    this.dispatch("moduleCreated", module);
  }

  renameModule(oldName: string, newName: string) {
    if (oldName === newName) return;
    this.flow.flow[newName] = this.flow.flow[oldName];
    this.flow.flow[newName].name = newName;
    delete this.flow.flow[oldName];
    this.dispatch("moduleRenamed", { oldName, newName });
  }

  changeModule(name: string) {
    if (!this.precanvas) return;
    this.dispatch("moduleChanged", name);
    this.module = name;
    this.precanvas.innerHTML = "";
    this.canvasX = 0;
    this.canvasY = 0;
    this.posX = 0;
    this.posY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.zoom = 1;
    this.zoomLastValue = 1;
    this.precanvas.style.transform = "";
    this.import(this.flow, false);
  }

  removeModule(name: string) {
    if (this.module === name) {
      const keys = Object.keys(this.flow.flow);
      if (keys.length > 1) {
        let idx = keys.indexOf(name);
        if (idx === 0) {
          idx = 1;
        } else {
          idx -= 1;
        }
        this.flow.flow[keys[idx]].selected = true;
        this.changeModule(keys[idx]);
      }
    }
    delete this.flow.flow[name];
    this.dispatch("moduleRemoved", name);
  }

  clearModuleSelected() {
    if (!this.precanvas) return;
    this.precanvas.innerHTML = "";
    this.flow.flow[this.module] = { name: this.module, data: {}, info: {}, selected: true };
  }

  clear() {
    if (!this.precanvas) return;
    this.precanvas.innerHTML = "";
    this.flow = { flow: {} };
  }
  export() {
    const dataExport: IFlowWrapper = JSON.parse(JSON.stringify(this.flow));
    this.dispatch("export", dataExport);
    return dataExport;
  }

  import(data: IFlowWrapper, notifi: boolean = true) {
    this.clear();
    this.flow = JSON.parse(JSON.stringify(data));
    const keys = Object.keys(this.flow.flow);
    if (keys.length > 0) {
      for (const key of keys) {
        if (this.flow.flow[key].selected) {
          this.module = this.flow.flow[key].name;
        }
      }
      this.load();
    }
    if (notifi) {
      this.dispatch("import", "import");
    }
  }

  /* Events */
  on(event: string, callback: Function) {
    if (typeof callback !== "function") {
      console.log(`The listener callback must be a function, the given type is ${typeof callback}`);
      return;
    }
    if (typeof event !== "string") {
      console.log(`The event name must be a string, the given type is ${typeof event}`);
      return;
    }
    if (this.events[event] === undefined) {
      this.events[event] = {
        listeners: [],
      };
    }
    this.events[event].listeners.push(callback);
  }

  removeListener(event: string, callback: Function) {
    if (this.events[event] === undefined) return;
    this.events[event].listeners = this.events[event].listeners.filter((listener: Function) => {
      return listener.toString() !== callback.toString();
    });
  }

  dispatch(event: string, details?: any) {
    if (this.events[event] === undefined) return;
    this.events[event].listeners.forEach((listener: Function) => {
      listener(details);
    });
  }
}
