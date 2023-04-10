import Flow from "./Flow";

export default class FlowClone extends Flow {
  public nodeIdPrefix: string = "nodm";

  position(e: PointerEvent) {
    let ePosX: number = 0;
    let ePosY: number = 0;
    if (e.type === "touchmove" && e instanceof TouchEvent) {
      ePosX = e.touches[0].clientX;
      ePosY = e.touches[0].clientY;
    } else if (e instanceof MouseEvent) {
      ePosX = e.clientX;
      ePosY = e.clientY;
    }

    if (this.editorSelected && this.precanvas) {
      const x = this.canvasX + (this.posX - ePosX);
      const y = this.canvasY + (this.posY - ePosY);

      this.precanvas.style.transform = `translate(${x}px, ${y}px) scale(${this.zoom})`;
      this.dispatch("translate", { x, y });
    }
    if (e.type === "touchmove") {
      this.mouseX = ePosX;
      this.mouseY = ePosY;
    }
    this.dispatch("mouseMove", { x: ePosX, y: ePosY });
  }

  dragEnd(e: DragEvent) {
    let ePosX: number;
    let ePosY: number;
    if (e.type === "touchend") {
      ePosX = this.mouseX;
      ePosY = this.mouseY;
    } else {
      ePosX = e.clientX;
      ePosY = e.clientY;
    }
    this.canvasX = this.canvasX + (this.posX - ePosX);
    this.canvasY = this.canvasY + (this.posY - ePosY);
    this.editorSelected = false;

    this.drag = false;
    this.dragPoint = false;
    this.connection = false;
    this.eleSelected = null;
    this.editorSelected = false;
  }
}
