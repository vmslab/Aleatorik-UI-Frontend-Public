export default abstract class ComponentBase {
  protected _width: number = 0;
  protected _height: number = 0;

  public parents: Element | null = null;
  public children: Element[] | null = null;

  public observer: ResizeObserver = new ResizeObserver(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      this.draw(this.parents, this.children);
    },
  );

  public get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
    this.calcSize();
  }

  public get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
    this.calcSize();
  }

  public abstract calcSize(): void;

  public draw(parents: Element | null, children: Element[] | null): void {
    if (!parents) {
      return;
    }
    this.parents = parents;
    this.children = children;
    for (let i = parents.childNodes.length - 1; i >= 0; i--) {
      parents.removeChild(parents.childNodes[i]);
    }
  }
}
