import { IRawEventNames, EventName, IFullScreenOptions, IFullScreenStyle } from "../types";

const methodMap: string[][] = [
  [
    "requestFullscreen",
    "exitFullscreen",
    "fullscreenElement",
    "fullscreenEnabled",
    "fullscreenchange",
    "fullscreenerror",
  ],
  // New WebKit
  [
    "webkitRequestFullscreen",
    "webkitExitFullscreen",
    "webkitFullscreenElement",
    "webkitFullscreenEnabled",
    "webkitfullscreenchange",
    "webkitfullscreenerror",
  ],
  // Old WebKit
  [
    "webkitRequestFullScreen",
    "webkitCancelFullScreen",
    "webkitCurrentFullScreenElement",
    "webkitCancelFullScreen",
    "webkitfullscreenchange",
    "webkitfullscreenerror",
  ],
  [
    "mozRequestFullScreen",
    "mozCancelFullScreen",
    "mozFullScreenElement",
    "mozFullScreenEnabled",
    "mozfullscreenchange",
    "mozfullscreenerror",
  ],
  [
    "msRequestFullscreen",
    "msExitFullscreen",
    "msFullscreenElement",
    "msFullscreenEnabled",
    "MSFullscreenChange",
    "MSFullscreenError",
  ],
];

const nativeAPI = ((): IRawEventNames | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const unprefixedMethods: string[] = methodMap[0];
  const returnValue: IRawEventNames = {
    requestFullscreen: "",
    exitFullscreen: "",
    fullscreenElement: "",
    fullscreenEnabled: "",
    fullscreenchange: "",
    fullscreenerror: "",
  };

  for (const methodList of methodMap) {
    const exitFullscreenMethod = methodList?.[1];
    if (exitFullscreenMethod in document) {
      for (const [index, method] of methodList.entries()) {
        returnValue[unprefixedMethods[index]] = method;
      }

      return returnValue;
    }
  }

  return undefined;
})();

const eventNameMap = {
  change: nativeAPI?.fullscreenchange,
  error: nativeAPI?.fullscreenerror,
};

function setStyle(element: HTMLElement, style: IFullScreenStyle) {
  element.style.position = style.position;
  element.style.left = style.left;
  element.style.top = style.top;
  element.style.width = style.width;
  element.style.height = style.height;
}

const defaultOptions = {
  callback: () => {},
  fullscreenClass: "fullscreen",
  pageOnly: false,
  teleport: false,
};

class ScreenFull {
  raw?: IRawEventNames = nativeAPI;
  options: IFullScreenOptions = defaultOptions;
  private _parentNode: ParentNode | null = null;
  private _token: Comment | null = null;
  private _isFullscreen: boolean = false;
  private _element?: HTMLElement;

  get isFullscreen(): boolean {
    if (this.options.pageOnly) {
      return this._isFullscreen;
    } else {
      if (!nativeAPI) return false;
      return Boolean((document as any)[nativeAPI.fullscreenElement]);
    }
  }

  get element(): HTMLElement | undefined {
    if (this.options.pageOnly) {
      return this._element;
    } else {
      if (!nativeAPI) return undefined;
      return (document as any)[nativeAPI.fullscreenElement] ?? undefined;
    }
  }

  get isEnabled(): boolean {
    if (!nativeAPI) return false;
    return Boolean((document as any)[nativeAPI.fullscreenEnabled]);
  }

  request(
    element: HTMLElement = document.documentElement,
    options?: IFullScreenOptions,
  ): Promise<void> {
    this.options = { ...this.options, ...options };
    return new Promise((resolve, reject) => {
      if (element === document.documentElement) {
        this.options.teleport = false;
      }
      if (!this.isEnabled) {
        this.options.pageOnly = true;
      }
      if (this.options.fullscreenClass) {
        element.classList.add(this.options.fullscreenClass);
      }

      if (this.options.teleport || this.options.pageOnly) {
        const { position, left, top, width, height } = element.style;
        (element as any).__styleCache = { position, left, top, width, height };
        setStyle(element, {
          position: "fixed",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
        });
      }

      if (this.options.teleport) {
        this._parentNode = element.parentNode;
        if (this._parentNode) {
          this._token = document.createComment("fullscreen-token");
          this._parentNode.insertBefore(this._token, element);
          document.body.appendChild(element);
        }
      }

      if (this.options.pageOnly) {
        const keypressCallback = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            document.removeEventListener("keyup", keypressCallback);
            this.exit();
          }
        };
        this._isFullscreen = true;
        this._element = element;
        document.removeEventListener("keyup", keypressCallback);
        document.addEventListener("keyup", keypressCallback);
        if (this.options.callback) {
          this.options.callback(this.isFullscreen);
        }
        resolve();
      } else {
        const fullScreenCallback = () => {
          if (!this.isFullscreen) {
            this.off("change", fullScreenCallback);
            this.resetElement();
          }
          if (!this.options.teleport) {
            this._element = this.element;
          } else {
            this._element = element;
          }
          if (this.options.callback) {
            this.options.callback(this.isFullscreen);
          }
        };
        this.on("change", fullScreenCallback);

        if (!nativeAPI) {
          reject();
          return;
        }
        const onFullScreenEntered = () => {
          this.off("change", onFullScreenEntered);
          resolve();
        };

        this.on("change", onFullScreenEntered);

        const returnPromise = (element as any)[nativeAPI.requestFullscreen](
          this.options?.fullscreenOptions,
        );

        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenEntered).catch(reject);
        }
      }
    });
  }

  resetElement() {
    if (!this.element) return;
    if (this.options.fullscreenClass) {
      this.element.classList.remove(this.options.fullscreenClass);
    }

    if (this.options.teleport || this.options.pageOnly) {
      if (this.options.teleport && this._parentNode) {
        this._parentNode.insertBefore(this.element, this._token);
        this._parentNode.removeChild(this._token as any);
      }
      if ((this.element as any).__styleCache) {
        setStyle(this.element, (this.element as any).__styleCache);
      }
    }
  }

  exit(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.options.pageOnly) {
        this.resetElement();
        this._isFullscreen = false;
        this._element = undefined;
        if (this.options.callback) {
          this.options.callback(this.isFullscreen);
        }
        resolve();
      } else {
        if (!nativeAPI) {
          reject();
          return;
        }
        if (!this.isFullscreen) {
          resolve();
          return;
        }

        const onFullScreenExit = () => {
          this.off("change", onFullScreenExit);
          resolve();
        };

        this.on("change", onFullScreenExit);

        const returnPromise = (document as any)[nativeAPI.exitFullscreen]();

        if (returnPromise instanceof Promise) {
          returnPromise.then(onFullScreenExit).catch(reject);
        }
      }
    });
  }

  toggle(element?: HTMLElement, options?: IFullScreenOptions): Promise<void> {
    return this.isFullscreen ? this.exit() : this.request(element, options);
  }

  on(event: EventName, callback: (event: Event) => void) {
    const eventName = eventNameMap[event];
    if (eventName) {
      document.addEventListener(eventName, callback, false);
    }
  }

  off(event: EventName, callback: (event: Event) => void) {
    const eventName = eventNameMap[event];
    if (eventName) {
      document.removeEventListener(eventName, callback, false);
    }
  }

  onchange(callback: (event: Event) => void) {
    this.on("change", callback);
  }

  onerror(callback: (event: Event) => void) {
    this.on("error", callback);
  }
}

export default new ScreenFull();
