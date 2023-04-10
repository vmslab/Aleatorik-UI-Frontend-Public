import Flow from "./Flow";
import FlowClone from "./FlowClone";
import { IFlowModule } from "../../types";

export default class FlowMinimap {
  public container: HTMLElement;
  public editor: Flow;
  public zoom: number;
  public nodeId: number | null;
  public minimap: FlowClone;
  public mask: HTMLElement;
  public offset: number;

  constructor(container: HTMLElement, editor: Flow, zoom: number) {
    this.container = container;
    this.editor = editor;
    this.zoom = zoom;

    this.nodeId = null;

    this.minimap = new FlowClone(this.container);
    this.minimap.zoomMin = this.zoom;
    this.minimap.zoomMax = this.zoom;
    this.minimap.zoom = this.zoom;
    this.minimap.zoomValue = this.zoom;
    this.minimap.zoomLastValue = this.zoom;
    this.minimap.editorMode = "fixed";
    // this.minimap.reroute = true;
    // this.minimap.rerouteFixCurvature = true;

    this.minimap.start();

    this.positionStart();

    this.mask = document.createElement("div");
    this.mask.classList.add("mask");
    this.updateMask();
    this.container.appendChild(this.mask);

    this.offset = this.editor.zoom - this.minimap.zoom;

    this.editor.on("import", () => {
      const data = this.editor.export();
      this.minimap.import(data);
      this.positionStart();
      this.updateMask();
    });

    this.editor.on("moduleCreated", (module: IFlowModule) => {
      this.minimap.addModule(module);
    });

    this.editor.on("moduleChanged", (name: string) => {
      this.minimap.changeModule(name);
      this.minimap.zoom = this.zoom;
      this.minimap.zoomValue = this.zoom;
      this.minimap.zoomLastValue = this.zoom;
      this.minimap.zoomRefresh();
    });

    this.minimap.on("moduleChanged", () => {
      this.updateMask();
    });

    this.editor.on("moduleRemoved", (name: string) => {
      this.minimap.removeModule(name);
    });

    this.editor.on(
      "nodeRegistered",
      (params: { name: string; copy: (content: HTMLElement, id: number, data: Record<string, any>) => void }) => {
        this.minimap.registerNode(params.name, params.copy);
      },
    );

    this.editor.on("nodeCreated", (id: number) => {
      const data = {};
      const node = this.editor.getNodeFromId(id);

      this.minimap.addNode(
        node.name,
        Object.keys(node.inputs).length,
        Object.keys(node.outputs).length,
        node.posX,
        node.posY,
        node.class,
        data,
        node.html,
      );
    });

    this.editor.on("nodeMoved", (id: number) => {
      const node = this.editor.getNodeFromId(id);
      const ele = this.container.querySelector(`#${this.minimap.nodeIdPrefix}-${id}`) as HTMLElement;
      ele.style.top = `${node.posY}px`;
      ele.style.left = `${node.posX}px`;

      this.minimap.updateNodeDataFromId(id, node);
      this.minimap.updateConnectionNodes(`${this.minimap.nodeIdPrefix}-${id}`);
    });

    this.editor.on("mouseMove", () => {
      if (this.nodeId != null && this.editor.drag) {
        const ele = this.container.querySelector(`#${this.minimap.nodeIdPrefix}-${this.nodeId}`) as HTMLElement;
        const node = this.editor.getNodeFromId(this.nodeId);
        ele.style.left = `${node.posX}px`;
        ele.style.top = `${node.posY}px`;
        this.minimap.updateConnectionNodes(`${this.minimap.nodeIdPrefix}-${this.nodeId}`);
      }
    });

    this.editor.on("nodeRemoved", (id: number) => {
      this.minimap.removeNodeId(`${this.minimap.nodeIdPrefix}-${id}`);
    });

    this.editor.on("nodeSelected", (id: number) => {
      this.nodeId = id;

      this.container.querySelector(`#${this.minimap.nodeIdPrefix}-${id}`)!.classList.add("selected");
    });

    this.editor.on("nodeUnselected", () => {
      if (this.container.querySelector(`#${this.minimap.nodeIdPrefix}-${this.nodeId}`) != null) {
        this.container.querySelector(`#${this.minimap.nodeIdPrefix}-${this.nodeId}`)!.classList.remove("selected");
      }
      this.nodeId = null;
    });

    this.editor.on(
      "connectionCreated",
      (conn: { outputId: number; inputId: number; outputClass: string; inputClass: string }) => {
        this.minimap.addConnection(conn.outputId, conn.inputId, conn.outputClass, conn.inputClass);
      },
    );

    this.editor.on(
      "connectionRemoved",
      (conn: { outputId: number; inputId: number; outputClass: string; inputClass: string }) => {
        this.minimap.removeSingleConnection(conn.outputId, conn.inputId, conn.outputClass, conn.inputClass);
      },
    );

    this.editor.on("translate", (pos: { x: number; y: number }) => {
      const editorWidth = this.editor.container.getBoundingClientRect().width;
      const editorHeight = this.editor.container.getBoundingClientRect().height;

      const minimapWidth = this.minimap.container.getBoundingClientRect().width;
      const minimapHeight = this.minimap.container.getBoundingClientRect().height;

      this.minimap.canvasX = (pos.x / this.editor.zoom) * this.zoom - ((editorWidth - minimapWidth) * this.zoom) / 2;
      this.minimap.canvasY = (pos.y / this.editor.zoom) * this.zoom - ((editorHeight - minimapHeight) * this.zoom) / 2;
      // eslint-disable-next-line max-len
      this.minimap.precanvas!.style.transform = `translate(${this.minimap.canvasX}px, ${this.minimap.canvasY}px) scale(${this.minimap.zoom})`;

      this.minimap.zoomRefresh();
      this.updateMask();
    });

    this.minimap.on("translate", (pos: { x: number; y: number }) => {
      const editorWidth = this.editor.container.getBoundingClientRect().width;
      const editorHeight = this.editor.container.getBoundingClientRect().height;

      const minimapWidth = this.minimap.container.getBoundingClientRect().width;
      const minimapHeight = this.minimap.container.getBoundingClientRect().height;

      this.editor.canvasX =
        (pos.x / this.zoom) * this.editor.zoom + ((editorWidth - minimapWidth) * this.editor.zoom) / 2;
      this.editor.canvasY =
        (pos.y / this.zoom) * this.editor.zoom + ((editorHeight - minimapHeight) * this.editor.zoom) / 2;

      // eslint-disable-next-line max-len
      this.editor.precanvas!.style.transform = `translate(${this.editor.canvasX}px, ${this.editor.canvasY}px) scale(${this.editor.zoom})`;

      this.editor.zoomRefresh();
      this.updateMask();
    });

    this.editor.on("zoom", () => {
      this.updateMask();
    });

    this.minimap.zoomIn = () => {
      this.minimap.dispatch("zoom_in");
    };
    this.minimap.zoomOut = () => {
      this.minimap.dispatch("zoom_out");
    };

    this.minimap.on("zoom_in", () => {
      this.editor.zoomIn();
    });

    this.minimap.on("zoom_out", () => {
      this.editor.zoomOut();
    });
  }

  positionStart() {
    const editorWidth = this.editor.container.getBoundingClientRect().width;
    const editorHeight = this.editor.container.getBoundingClientRect().height;

    const minimapWidth = this.minimap.container.getBoundingClientRect().width;
    const minimapHeight = this.minimap.container.getBoundingClientRect().height;

    this.minimap.canvasX = -((editorWidth - minimapWidth) * this.zoom) / 2;
    this.minimap.canvasY = -((editorHeight - minimapHeight) * this.zoom) / 2;
    // eslint-disable-next-line max-len
    this.minimap.precanvas!.style.transform = `translate(${this.minimap.canvasX}px, ${this.minimap.canvasY}px) scale(${this.minimap.zoom})`;
    this.minimap.zoomRefresh();
  }

  updateMask() {
    const editorWidth = this.editor.container.getBoundingClientRect().width;
    const editorHeight = this.editor.container.getBoundingClientRect().height;
    const minimapWidth = this.minimap.container.getBoundingClientRect().width;
    const minimapHeight = this.minimap.container.getBoundingClientRect().height;

    this.mask.style.width = `${((editorWidth - minimapWidth) / this.editor.zoom) * this.zoom}px`;
    this.mask.style.height = `${((editorHeight - minimapHeight) / this.editor.zoom) * this.zoom}px`;
    this.mask.style.transform = `scale(${editorWidth / (editorWidth - minimapWidth)})`;

    this.mask.style.left = `${(minimapWidth - ((editorWidth - minimapWidth) / this.editor.zoom) * this.zoom) / 2}px`;
    this.mask.style.top = `${(minimapHeight - ((editorHeight - minimapHeight) / this.editor.zoom) * this.zoom) / 2}px`;
  }
}
