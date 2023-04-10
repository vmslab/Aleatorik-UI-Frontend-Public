/* eslint-disable no-unused-expressions */
/* eslint-disable max-len */
import Color from "../../data/Color";
import * as utils from "../../utils/colorPickerUtil";
import dedent from "../../utils/dedent";

// https://stackoverflow.com/a/51117224/1869660
const BG_TRANSP = `linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0 / 1.4em 1.4em,
                   linear-gradient(45deg, lightgrey 25%,       white 25%,       white 75%, lightgrey 75%) 0.7em 0.7em / 1.4em 1.4em`;
const HUES = 360;
// We need to use keydown instead of keypress to handle Esc from the editor textbox:
const EVENT_KEY = "keydown"; // 'keypress'
const EVENT_CLICK_OUTSIDE = "mousedown";
const EVENT_TAB_MOVE = "focusin";

function $(selector: string, context?: HTMLElement | Element | null) {
  return (context || document).querySelector(selector);
}

function stopEvent(e: any) {
  // Stop an event from bubbling up to the parent:
  e.preventDefault();
  e.stopPropagation();
}
function onKey(
  bucket: utils.EventBucket,
  target: HTMLElement,
  keys: string[],
  handler: Function,
  stop?: boolean,
) {
  bucket.add(target, EVENT_KEY, function (e: any) {
    if (keys.indexOf(e.key) >= 0) {
      if (stop) {
        stopEvent(e);
      }
      handler(e);
    }
  });
}

export interface IColorPickerOptions {
  parent?: HTMLElement;
  popup?: string | boolean;
  layout?: string;
  alpha?: boolean;
  editor?: boolean;
  editorFormat?: string;
  cancelButton?: boolean;
  defaultColor?: string;
  color?: string;
  colour?: string;
  template?: string;
  onChange?: (color?: Color) => void;
  onDone?: (color?: Color) => void;
  onOpen?: (color?: Color) => void;
  onClose?: (color?: Color) => void;
}

type ColorPickerOptions = HTMLElement | IColorPickerOptions;

class ColorPicker {
  settings: {
    parent: HTMLElement;
    popup: string | boolean;
    layout: string;
    alpha: boolean;
    editor: boolean;
    editorFormat: string;
    cancelButton: boolean;
    defaultColor: string;
    template?: string;
  };
  color?: Color;
  colour?: Color;
  domElement?: HTMLElement | Element | null;

  private _events: utils.EventBucket;
  private _popupInited: boolean = false;
  private _domH?: HTMLElement | Element | null;
  private _domSL?: HTMLElement | Element | null;
  private _domA?: HTMLElement | Element | null;
  private _domEdit?: HTMLElement | Element | null;
  private _domSample?: HTMLElement | Element | null;
  private _domOkay?: HTMLElement | Element | null;
  private _domCancel?: HTMLElement | Element | null;
  private __containedEvent: number = 0;

  static StyleElement: HTMLStyleElement;

  /**
   * Callback whenever the color changes.
   * @member {ColorPicker~colorCallback}
   */
  onChange?: (color?: Color) => void;
  /**
   * Callback when the user clicks "Ok".
   * @member {ColorPicker~colorCallback}
   */
  onDone?: (color?: Color) => void;
  /**
   * Callback when the popup opens.
   * @member {ColorPicker~colorCallback}
   */
  onOpen?: (color?: Color) => void;
  /**
   * Callback when the popup closes.
   * @member {ColorPicker~colorCallback}
   */
  onClose?: (color?: Color) => void;

  // https://stackoverflow.com/questions/24214962/whats-the-proper-way-to-document-callbacks-with-jsdoc
  /**
   * A callback that gets the picker's current color value.
   *
   * @callback ColorPicker~colorCallback
   * @param {Object} color
   * @param {number[]} color.rgba       - RGBA color components.
   * @param {number[]} color.hsla       - HSLA color components (all values between 0 and 1, inclusive).
   * @param {string}   color.rgbString  - RGB CSS value (e.g. `rgb(255,215,0)`).
   * @param {string}   color.rgbaString - RGBA CSS value (e.g. `rgba(255,215,0, .5)`).
   * @param {string}   color.hslString  - HSL CSS value (e.g. `hsl(50.6,100%,50%)`).
   * @param {string}   color.hslaString - HSLA CSS value (e.g. `hsla(50.6,100%,50%, .5)`).
   * @param {string}   color.hex        - 8 digit #RRGGBBAA (not supported in all browsers).
   */

  /**
   * Create a color picker.
   *
   * @example
   * var picker = new ColorPicker(myParentElement);
   * picker.onDone = function(color) {
   *     myParentElement.style.backgroundColor = color.rgbaString;
   * };
   *
   * @example
   * var picker = new ColorPicker({
   *     parent: myParentElement,
   *     color: 'gold',
   *     onChange: function(color) {
   *                   myParentElement.style.backgroundColor = color.rgbaString;
   *               },
   * });
   *
   * @param {Object} options - @see {@linkcode ColorPicker#setOptions|setOptions()}
   */
  constructor(options?: ColorPickerOptions) {
    console.log(options);
    // Default settings
    this.settings = {
      // Allow creating a popup without putting it on screen yet.
      parent: document.body,
      popup: "right",
      layout: "default",
      alpha: true,
      editor: true,
      editorFormat: "hex",
      cancelButton: false,
      defaultColor: "#0cf",
    };

    this._events = new utils.EventBucket();

    this.setOptions(options);
  }

  /**
   * Set the picker options.
   *
   * @param {Object}       options
   * @param {HTMLElement}  options.parent           - Which element the picker should be attached to.
   * @param {('top'|'bottom'|'left'|'right'|false)}
   *                       [options.popup=right]    - If the picker is used as a popup, where to place it relative to the parent. `false` to add the picker as a normal child element of the parent.
   * @param {string}       [options.template]       - Custom HTML string from which to build the picker. See /src/picker.pug for required elements and class names.
   * @param {string}       [options.layout=default] - Suffix of a custom "layout_..." CSS class to handle the overall arrangement of the picker elements.
   * @param {boolean}      [options.alpha=true]     - Whether to enable adjusting the alpha channel.
   * @param {boolean}      [options.editor=true]    - Whether to show a text field for color value editing.
   * @param {('hex'|'hsl'|'rgb')}
   *                       [options.editorFormat=hex] - How to display the selected color in the text field (the text field still supports *input* in any format).
   * @param {boolean}      [options.cancelButton=false] - Whether to have a "Cancel" button which closes the popup.
   * @param {string}       [options.color]          - Initial color for the picker.
   * @param {function}     [options.onChange]       - @see {@linkcode ColorPicker#onChange|onChange}
   * @param {function}     [options.onDone]         - @see {@linkcode ColorPicker#onDone|onDone}
   * @param {function}     [options.onOpen]         - @see {@linkcode ColorPicker#onOpen|onOpen}
   * @param {function}     [options.onClose]        - @see {@linkcode ColorPicker#onClose|onClose}
   */
  setOptions(options?: ColorPickerOptions) {
    if (!options) return;

    const settings = this.settings;

    function transfer(
      source: Record<string, any>,
      target: Record<string, any>,
      skipKeys?: string[],
    ) {
      for (const key in source) {
        if (skipKeys && skipKeys.indexOf(key) >= 0) {
          continue;
        }

        target[key] = source[key];
      }
    }

    if (options instanceof HTMLElement) {
      settings.parent = options;
    } else {
      // const skipKeys = [];
      //
      // if(options.popup instanceof Object) {
      //    transfer(options.popup, settings.popup);
      //    skipKeys.push('popup');
      // }

      /* //TODO: options.layout -> Object
            {
                mode: 'hsla',       //'hsla', 'hasl', 'hsl'. Deprecate options.alpha
                verticalHue: false,
                verticalAlpha: true,
                alphaOnSL: false,
                editor: true,       //Deprecate options.editor
                css: undefined,     //Same as old options.layout. Default from mode
                //.template as well?
            }
            //*/

      // New parent?
      if (settings.parent && options.parent && settings.parent !== options.parent) {
        this._events.remove(settings.parent); // .removeEventListener('click', this._openProxy, false);
        this._popupInited = false;
      }

      transfer(options, settings /* , skipKeys*/);

      // Event callbacks. Hook these up before setColor() below,
      // because we'll need to fire onChange() if there is a color in the options
      if (options.onChange) {
        this.onChange = options.onChange;
      }
      if (options.onDone) {
        this.onDone = options.onDone;
      }
      if (options.onOpen) {
        this.onOpen = options.onOpen;
      }
      if (options.onClose) {
        this.onClose = options.onClose;
      }

      // Note: Look for color in 'options', as a color value in 'settings' may be an old one we don't want to revert to.
      const col = options.color || options.colour;
      if (col) {
        this._setColor(col);
      }
    }

    // Init popup behavior once we have all the parts we need:
    const parent = settings.parent;
    if (parent && settings.popup && !this._popupInited) {
      // Keep openHandler() pluggable, but call it in the right context:
      const openProxy = (e: any) => this.openHandler(e);

      this._events.add(parent, "click", openProxy);

      // Keyboard navigation: Open on [Space] or [Enter] (but stop the event to avoid typing a " " in the editor textbox).
      // No, don't stop the event, as that would disable normal input behavior (typing a " " or clicking the Ok button with [Enter]).
      // Fix: setTimeout() in openHandler()..
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values#Whitespace_keys
      onKey(this._events, parent, [" ", "Spacebar", "Enter"], openProxy /* , true*/);

      // This must wait until we have created our DOM..
      //  addEvent(window, 'mousedown', (e) => this.closeHandler(e));
      //  addEvent(this._domOkay, 'click', (e) => this.closeHandler(e));

      this._popupInited = true;
    } else if ((options as IColorPickerOptions).parent && !settings.popup) {
      this.show();
    }
  }

  /**
   * Default behavior for opening the popup
   */
  openHandler(e?: any) {
    if (this.show()) {
      // If the parent is an <a href="#"> element, avoid scrolling to the top:
      e && e.preventDefault();

      // A trick to avoid re-opening the dialog if you click the parent element while the dialog is open:
      this.settings.parent.style.pointerEvents = "none";

      // Recommended popup behavior with keyboard navigation from http://whatsock.com/tsg/Coding%20Arena/Popups/Popup%20(Internal%20Content)/demo.htm
      // Wait a little before focusing the textbox, in case the dialog was just opened with [Space] (would overwrite the color value with a " "):
      const toFocus = e && e.type === EVENT_KEY ? this._domEdit : this.domElement;
      if (toFocus) {
        setTimeout(() => (toFocus as HTMLElement).focus(), 100);
      }

      if (this.onOpen) {
        this.onOpen(this.colour);
      }
    }
  }

  /**
   * Default behavior for closing the popup
   */
  closeHandler(e?: any) {
    const event = e && e.type;
    let doHide = false;

    // Close programmatically:
    if (!e) {
      doHide = true;
    }
    // Close by clicking/tabbing outside the popup:
    else if (event === EVENT_CLICK_OUTSIDE || event === EVENT_TAB_MOVE) {
      // See comments in `_bindEvents()`.
      // Undesirable behavior in Firefox though: When clicking (mousedown) the [Ok] button or the textbox,
      // a `focusout` is raised on `picker_wrapper`, followed by a `focusin` on the parent (if it is focusable).
      // To keep that new event from closing the popup, we add 100ms to our time control:
      const knownTime = (this.__containedEvent || 0) + 100;
      if (e.timeStamp > knownTime) {
        doHide = true;
      }
    }
    // Close by mouse/touch or key events:
    else {
      // Don't bubble [Ok] clicks or [Enter] keys up to the parent, because that's the trigger to re-open the popup.
      stopEvent(e);

      doHide = true;
    }

    if (doHide && this.hide()) {
      this.settings.parent.style.pointerEvents = "";

      // Recommended popup behavior from http://whatsock.com/tsg/Coding%20Arena/Popups/Popup%20(Internal%20Content)/demo.htm
      // However, we don't re-focus the parent if the user closes the popup by clicking somewhere else on the screen,
      // because they may have scrolled to a different part of the page by then, and focusing would then inadvertently scroll the parent back into view:
      if (event !== EVENT_CLICK_OUTSIDE) {
        this.settings.parent.focus();
      }

      if (this.onClose) {
        this.onClose(this.colour);
      }
    }
  }

  /**
   * Move the popup to a different parent, optionally opening it at the same time.
   *
   * @param {Object}  options - @see {@linkcode ColorPicker#setOptions|setOptions()} (Usually a new `.parent` and `.color`).
   * @param {boolean} open    - Whether to open the popup immediately.
   */
  movePopup(options: any, open: any) {
    // Cleanup if the popup is currently open (at least revert the current parent's .pointerEvents);
    this.closeHandler();

    this.setOptions(options);
    if (open) {
      this.openHandler();
    }
  }

  /**
   * Set/initialize the picker's color.
   *
   * @param {string}  color  - Color name, RGBA/HSLA/HEX string, or RGBA array.
   * @param {boolean} silent - If true, won't trigger onChange.
   */
  setColor(color: any, silent: any) {
    this._setColor(color, { silent });
  }
  _setColor(color?: string, flags?: Record<string, any>) {
    if (typeof color === "string") {
      color = color.trim();
    }
    if (!color) {
      return;
    }

    flags = flags || {};
    let c;
    try {
      // Will throw on unknown colors:
      c = new Color(color);
    } catch (ex) {
      if (flags.failSilently) {
        return;
      }
      throw ex;
    }

    if (!this.settings.alpha) {
      const hsla = c.hsla;
      hsla[3] = 1;
      c.hsla = hsla;
    }
    this.colour = this.color = c;
    this._setHSLA(null, null, null, null, flags);
  }
  /**
   * @see {@linkcode ColorPicker#setColor|setColor()}
   */
  setColour(colour: any, silent: any) {
    this.setColor(colour, silent);
  }

  /**
   * Show/open the picker.
   */
  show() {
    const parent = this.settings.parent;
    if (!parent) return false;

    // Unhide html if it exists
    if (this.domElement) {
      const toggled = this._toggleDOM(true);

      // Things could have changed through setOptions():
      this._setPosition();

      return toggled;
    }

    const htmlStr: string = dedent`<div class="picker_wrapper" tabindex="-1">
    <div class="picker_arrow"></div>
    <div class="picker_sl">
        <div class="picker_selector"></div>
    </div>
    <div class="picker_hue picker_slider">
        <div class="picker_selector"></div>
    </div>
    <div class="picker_alpha picker_slider">
        <div class="picker_selector"></div>
    </div>
    <div class="picker_sample"></div>
    <div class="picker_editor"><input aria-label="Type a color name or hex value" /></div>
    <div class="picker_done"><button>Ok</button></div>
    <div class="picker_cancel"><button>Cancel</button></div>
</div>`;
    const html = this.settings.template || htmlStr;
    const wrapper = utils.parseHTML(html);

    if (!wrapper) return false;

    this.domElement = wrapper;
    this._domH = $(".picker_hue", wrapper);
    this._domSL = $(".picker_sl", wrapper);
    this._domA = $(".picker_alpha", wrapper);
    this._domEdit = $(".picker_editor input", wrapper);
    this._domSample = $(".picker_sample", wrapper);
    this._domOkay = $(".picker_done button", wrapper);
    this._domCancel = $(".picker_cancel button", wrapper);

    wrapper.classList.add("layout_" + this.settings.layout);
    if (!this.settings.alpha) {
      wrapper.classList.add("no_alpha");
    }
    if (!this.settings.editor) {
      wrapper.classList.add("no_editor");
    }
    if (!this.settings.cancelButton) {
      wrapper.classList.add("no_cancel");
    }
    this._ifPopup(() => wrapper.classList.add("popup"));

    this._setPosition();

    if (this.colour) {
      this._updateUI();
    } else {
      this._setColor(this.settings.defaultColor);
    }
    this._bindEvents();

    return true;
  }

  /**
   * Hide the picker.
   */
  hide() {
    return this._toggleDOM(false);
  }

  /**
   * Release all resources used by this picker instance.
   */
  destroy() {
    this._events.destroy();
    if (this.domElement) {
      this.settings.parent.removeChild(this.domElement);
    }
  }

  /*
   * Handle user input.
   *
   * @private
   */
  _bindEvents() {
    const that = this;
    const dom = this.domElement;
    const events = this._events;

    function addEvent(target: Window | HTMLElement, type: string, handler: (evt: any) => void) {
      events.add(target, type, handler);
    }

    // Prevent clicks while dragging from bubbling up to the parent:
    addEvent(dom as HTMLElement, "click", e => e.preventDefault());

    /* Draggable color selection */

    // Select hue
    utils.dragTrack(events, this._domH, (x, y) => that._setHSLA(x));

    // Select saturation/lightness
    utils.dragTrack(events, this._domSL, (x, y) => that._setHSLA(null, x, 1 - y));

    // Select alpha
    if (this.settings.alpha) {
      utils.dragTrack(events, this._domA, (x, y) => that._setHSLA(null, null, null, x));
    }

    /* Direct color value editing */

    // Always init the editor, for accessibility and screen readers (we'll hide it with CSS if `!settings.editor`)
    const editInput = this._domEdit;
    /* if(this.settings.editor)*/ {
      addEvent(editInput as HTMLElement, "input", function (e) {
        that._setColor((editInput as HTMLInputElement).value, {
          fromEditor: true,
          failSilently: true,
        });
      });
      // Select all text on focus:
      addEvent(editInput as HTMLElement, "focus", function (e) {
        const input = editInput as HTMLInputElement;
        // If no current selection:
        if (input.selectionStart === input.selectionEnd) {
          input.select();
        }
      });
    }

    /* Close the dialog */

    // onClose:
    this._ifPopup(() => {
      // Keep closeHandler() pluggable, but call it in the right context:
      const popupCloseProxy = (e: any) => this.closeHandler(e);

      addEvent(window, EVENT_CLICK_OUTSIDE, popupCloseProxy);
      addEvent(window, EVENT_TAB_MOVE, popupCloseProxy);
      onKey(events, dom as HTMLElement, ["Esc", "Escape"], popupCloseProxy);

      // Above, we added events on `window` to close the popup if the user clicks outside or tabs away from the picker.
      // Now, we must make sure that clicks and tabs within the picker don't cause the popup to close.
      // Things we have tried:
      //  * Check `e.target` in `closeHandler()` and see if it's a child element of the picker.
      //      - That won't work if used in a shadow DOM, where the original `target` isn't available once the event reaches `window` (issue #15).
      //  * Stop the events from propagating past the popup element (using `e.stopPropagation()`).
      //      - ..but stopping mouse events interferes with text selection in the editor.
      //
      // So, next attempt                                                                                             : Note the `timeStamp` of the contained event, and check it in `closeHandler()`.
      // That should be a unique identifier of the event, and the time seems to be preserved when retargeting shadow DOM events:
      const timeKeeper = (e: any) => {
        this.__containedEvent = e.timeStamp;
      };
      addEvent(dom as HTMLElement, EVENT_CLICK_OUTSIDE, timeKeeper);
      // Note: Now that we have added the 'focusin' event, this trick requires the picker wrapper to be focusable (via `tabindex` - see /src/picker.pug),
      // or else the popup loses focus if you click anywhere on the picker's background.
      addEvent(dom as HTMLElement, EVENT_TAB_MOVE, timeKeeper);

      // Cancel button:
      addEvent(this._domCancel as HTMLElement, "click", popupCloseProxy);
    });

    // onDone:
    const onDoneProxy = (e: any) => {
      this._ifPopup(() => this.closeHandler(e));
      if (this.onDone) {
        this.onDone(this.colour);
      }
    };
    addEvent(this._domOkay as HTMLElement, "click", onDoneProxy);
    onKey(events, dom as HTMLElement, ["Enter"], onDoneProxy);
  }

  /*
   * Position the picker on screen.
   *
   * @private
   */
  _setPosition() {
    const parent = this.settings.parent;
    const elm = this.domElement as HTMLElement;

    if (parent !== elm.parentNode) {
      parent.appendChild(elm);
    }

    this._ifPopup((popup: any) => {
      // Allow for absolute positioning of the picker popup:
      if (getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      const cssClass = popup === true ? "popup_right" : `popup_${popup}`;

      ["popup_top", "popup_bottom", "popup_left", "popup_right"].forEach(c => {
        // Because IE doesn't support .classList.toggle()'s second argument...
        if (c === cssClass) {
          elm.classList.add(c);
        } else {
          elm.classList.remove(c);
        }
      });

      // Allow for custom placement via CSS:
      elm.classList.add(cssClass);
    });
  }

  /*
   * "Hub" for all color changes
   *
   * @private
   */
  _setHSLA(
    h?: number | null,
    s?: number | null,
    l?: number | null,
    a?: number | null,
    flags?: Record<string, any>,
  ) {
    flags = flags || {};

    const col = this.colour;

    if (!col) return;

    const hsla = col.hsla;

    [h, s, l, a].forEach((x, i) => {
      // if (x || x === 0) {
      //   hsla[i] = x;
      // }
      if (x) {
        hsla[i] = x;
      }
    });
    col.hsla = hsla;

    this._updateUI(flags);

    if (this.onChange && !flags.silent) {
      this.onChange(col);
    }
  }

  _updateUI(flags?: Record<string, any>) {
    if (!this.domElement) {
      return;
    }
    flags = flags || {};

    const col = this.colour;

    if (!col) return;

    const hsl = col.hsla;
    const cssHue = `hsl(${hsl[0] * HUES}, 100%, 50%)`;
    const cssHSL = col.hslString;
    const cssHSLA = col.hslaString;

    const uiH = this._domH;
    const uiSL = this._domSL;
    const uiA = this._domA;
    const thumbH = $(".picker_selector", uiH);
    const thumbSL = $(".picker_selector", uiSL);
    const thumbA = $(".picker_selector", uiA);

    function posX(parent: any, child: any, relX: number) {
      // console.log("parent", parent);
      child.style.left = `${relX * 100}%`; // (parent.clientWidth * relX) + 'px';
    }
    function posY(parent: any, child: any, relY: number) {
      child.style.top = `${relY * 100}%`; // (parent.clientHeight * relY) + 'px';
    }

    /* Hue */

    posX(uiH, thumbH, hsl[0]);

    // Use the fully saturated hue on the SL panel and Hue thumb:
    if (this._domSL && this._domH) {
      (this._domSL as HTMLElement).style.backgroundColor = (this._domH as HTMLElement).style.color =
        cssHue;
    }

    /* S/L */

    posX(uiSL, thumbSL, hsl[1]);
    posY(uiSL, thumbSL, 1 - hsl[2]);

    // Use the opaque HSL on the SL thumb:
    if (uiSL) {
      (uiSL as HTMLElement).style.color = cssHSL;
    }

    /* Alpha */

    posX(uiA, thumbA, hsl[3] || 0);
    // posX(uiA, thumbA, hsl[0]);
    const opaque = cssHSL;
    const transp = opaque.replace("hsl", "hsla").replace(")", ", 0)");
    const bg = `linear-gradient(to left,${[opaque, transp]})`;

    // Let the Alpha slider fade from opaque to transparent:
    if (this._domA) {
      (this._domA as HTMLElement).style.background = bg + ", " + BG_TRANSP;
    }

    /* Editable value */

    // Don't update the editor if the user is typing.
    // That creates too much noise because of our auto-expansion of 3/4/6 -> 8 digit hex codes.
    if (!flags.fromEditor) {
      const format = this.settings.editorFormat;
      const alpha = this.settings.alpha;

      let value;
      switch (format) {
        case "rgb":
          value = col.printRGB(alpha);
          break;
        case "hsl":
          value = col.printHSL(alpha);
          break;
        default:
          value = col.printHex(alpha);
      }
      if (this._domEdit) {
        (this._domEdit as any).value = value;
      }
    }

    /* Sample swatch */

    if (this._domSample) {
      (this._domSample as HTMLElement).style.color = cssHSLA;
    }
  }

  _ifPopup(actionIf?: Function, actionElse?: Function) {
    if (this.settings.parent && this.settings.popup) {
      actionIf && actionIf(this.settings.popup);
    } else {
      actionElse && actionElse();
    }
  }

  _toggleDOM(toVisible: boolean) {
    const dom = this.domElement as HTMLElement;
    if (!dom) return false;

    const displayStyle = toVisible ? "" : "none";
    const toggle = dom.style.display !== displayStyle;

    if (toggle) {
      dom.style.display = displayStyle;
    }
    return toggle;
  }

  /*
    //Feature: settings to flip hue & alpha 90deg (i.e. vertical or horizontal mode)
    
    
        function createDragConfig(container, callbackRelative) {
const flipped = true;
            function capRel(val) {
                return (val < 0) ? 0
                                 : (val > 1) ? 1 : val;
            }
            //Convert the px coordinates to relative coordinates (0-1) before invoking the callback:
            function relayDrag(_, pos) {
                const w = container.clientWidth,
                      h = container.clientHeight;
                      
                const relX = pos[0]/(flipped ? h : w),
                      relY = pos[1]/(flipped ? w : h);
                      
                callbackRelative(capRel(relX), capRel(relY));
            }
            const config = {
                container:     container,
                //dragOutside:   false,
                callback:      relayDrag,
                //Respond at once (mousedown), don't wait for click or drag:
                callbackDragStart: relayDrag,
            };
            return config;
        }
*/
}

/* Inject the default CSS (if we're not building for strict CSP settings)  */
if ("## PLACEHOLDER-CSS-SECTION ##") {
  const style = document.createElement("style");
  style.textContent = "## PLACEHOLDER-CSS ##";
  if (document.documentElement.firstElementChild) {
    document.documentElement.firstElementChild // <head>, or <body> if there is no <head>
      ?.appendChild(style);
  }

  /**
   * The `<style>` element for picker CSS which is added to the document.
   */
  ColorPicker.StyleElement = style;
}

export default ColorPicker;
