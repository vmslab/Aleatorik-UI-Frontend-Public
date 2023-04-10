export default class ElementWatcher {
  public targetNode: Element;
  public callback: Function;
  public observer: MutationObserver;
  public ones: boolean;

  constructor(targetNode: Element, ones: boolean, callback: Function) {
    this.targetNode = targetNode;
    this.callback = callback;
    this.ones = ones;
    this.observer = new MutationObserver(this.mutationCallback);
    this.observe();
  }

  public observe() {
    this.observer.observe(this.targetNode, { attributes: true });
  }

  public disconnect() {
    this.observer.disconnect();
  }

  public mutationCallback = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        this.callback();
        if (this.ones) {
          break;
        }
      }
    }
  };
}
