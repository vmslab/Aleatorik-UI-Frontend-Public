export class EventBus {
  private static _default: EventBus;
  private bus: HTMLElement;
  private events: string[] = [];

  static get default(): EventBus {
    if (!EventBus._default) {
      EventBus._default = (document as any)["mozart-event-bus"];
      if (!EventBus._default) {
        EventBus._default = new EventBus();
        (document as any)["mozart-event-bus"] = EventBus._default;
      }
    }
    return EventBus._default;
  }

  constructor() {
    this.bus = document.createElement("div");
  }

  register(event: string, callback: EventListenerOrEventListenerObject) {
    // EB.on(event, callback);
    this.bus.addEventListener(event, callback);
    if (!this.events.includes(event)) {
      this.events.push(event);
    }
  }

  remove(event: string, callback: EventListenerOrEventListenerObject) {
    // EB.off(event);
    this.bus.removeEventListener(event, callback);
    if (this.events.includes(event)) {
      this.events.splice(this.events.indexOf(event), 1);
    }
  }

  fire(event: string, detail: object = {}) {
    // EB.emit(event, detail);
    this.bus.dispatchEvent(new CustomEvent(event, { bubbles: true, detail }));
  }
}

export default EventBus.default;
