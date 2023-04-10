class EventBucket {
  private _events: any[];

  constructor() {
    this._events = [];
  }

  add(target: Window | HTMLElement | Element, type: string, handler: (event?: any) => void) {
    target.addEventListener(type, handler, false);
    this._events.push({
      target,
      type,
      handler,
    });
  }

  remove(target: Window | HTMLElement, type?: string, handler?: (event?: any) => void) {
    this._events = this._events.filter(e => {
      let isMatch = true;
      if (target && target !== e.target) {
        isMatch = false;
      }
      if (type && type !== e.type) {
        isMatch = false;
      }
      if (handler && handler !== e.handler) {
        isMatch = false;
      }

      if (isMatch) {
        EventBucket._doRemove(e.target, e.type, e.handler);
      }
      return !isMatch;
    });
  }
  static _doRemove(target: HTMLElement, type: string, handler: (event?: any) => void) {
    target.removeEventListener(type, handler, false);
  }

  destroy() {
    this._events.forEach(e => EventBucket._doRemove(e.target, e.type, e.handler));
    this._events = [];
  }
}

function parseHTML(htmlString: string) {
  const div = document.createElement("div");
  div.innerHTML = htmlString;
  return div.firstElementChild;
}

function dragTrack(
  eventBucket: EventBucket,
  area?: HTMLElement | Element | null,
  callback?: (w: number, h: number) => void,
) {
  let dragging = false;

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
  }

  function onMove(e: any, info: any, starting?: boolean) {
    if (starting) {
      dragging = true;
    }
    if (!dragging) return;

    e.preventDefault();

    if (!area) return;

    const bounds = area.getBoundingClientRect();
    const w = bounds.width;
    const h = bounds.height;
    const x = info.clientX;
    const y = info.clientY;

    const relX = clamp(x - bounds.left, 0, w);
    const relY = clamp(y - bounds.top, 0, h);

    if (callback) {
      callback(relX / w, relY / h);
    }
  }

  function onMouse(e: any, starting?: boolean) {
    const button = e.buttons === undefined ? e.which : e.buttons;
    if (button === 1) {
      onMove(e, e, starting);
    }
    // `mouseup` outside of window:
    else {
      dragging = false;
    }
  }

  function onTouch(e: any, starting?: boolean) {
    if (e.touches.length === 1) {
      onMove(e, e.touches[0], starting);
    }
    // Don't interfere with pinch-to-zoom etc:
    else {
      dragging = false;
    }
  }

  // Notice how we must listen on the whole window to really keep track of mouse movements,
  // while touch movements "stick" to the original target from `touchstart` (which works well for our purposes here):
  //
  //  https://stackoverflow.com/a/51750458/1869660
  //  "Mouse moves = *hover* like behavior. Touch moves = *drags* like behavior"
  //
  if (area) {
    eventBucket.add(area, "mousedown", function (e: MouseEvent) {
      onMouse(e, true);
    });
    eventBucket.add(area, "touchstart", function (e: TouchEvent) {
      onTouch(e, true);
    });
    eventBucket.add(window, "mousemove", onMouse);
    eventBucket.add(area, "touchmove", onTouch);
    eventBucket.add(window, "mouseup", function (e: MouseEvent) {
      dragging = false;
    });
    eventBucket.add(area, "touchend", function (e: MouseEvent) {
      dragging = false;
    });
    eventBucket.add(area, "touchcancel", function (e: MouseEvent) {
      dragging = false;
    });
  }
}

export { EventBucket, parseHTML, dragTrack };
