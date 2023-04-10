export const getElementHeight = (element: Element | null): number => {
  if (!element) {
    return 0;
  }
  if (element.clientHeight) {
    return element.clientHeight;
  }
  return getElementHeight(element.parentElement);
};

export const getElementWidth = (element: Element | null): number => {
  if (!element) {
    return 0;
  }
  if (element.clientWidth) {
    return element.clientWidth;
  }
  return getElementHeight(element.parentElement);
};

export const getStyle = (element: HTMLElement, property: string): string => {
  return window.getComputedStyle(element, null).getPropertyValue(property);
};

export const getTooltipPosition = (
  tooltip: HTMLElement,
  event: MouseEvent,
  target: "mouse" | "elcenter" | "elside" | "elupdown" | "elright" = "mouse",
  tb: boolean = false,
): {
  xKey: string;
  xPos: number;
  yKey: string;
  yPos: number;
} => {
  let xKey = "left";
  let yKey = "top";
  let xPos = 0;
  let yPos = 0;

  let rect: DOMRect | null = null;
  if (event.target instanceof Element) {
    rect = event.target.getBoundingClientRect();
  }

  if (rect && target === "elcenter") {
    xPos = rect.left + rect.width / 2;
    yPos = rect.top + rect.height / 2;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos = window.innerWidth - rect.right + rect.width / 2;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height / 2;
    }
  } else if (rect && target === "elside") {
    xPos = rect.left + rect.width;
    yPos = rect.top + rect.height / 2;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos = window.innerWidth - rect.right + rect.width;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height / 2;
    }
  } else if (rect && target === "elupdown") {
    xPos = rect.left + rect.width / 2;
    yPos = rect.top + rect.height;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos = window.innerWidth - rect.right + rect.width / 2;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height;
    }
  } else if (target === "elright") {
    xKey = "left";
    yKey = "top";
    if (rect) {
      xPos = rect.x + rect.width;
      yPos = rect.top + rect.height / 2;
    } else {
      xPos = event.pageX;
      yPos = event.pageY;
    }
  } else {
    xPos = event.pageX;
    yPos = event.pageY;
    if (tooltip.clientWidth + xPos > window.innerWidth) {
      xKey = "right";
      xPos = window.innerWidth - event.pageX;
    }
    if (tooltip.clientHeight + yPos > window.innerHeight) {
      yKey = "bottom";
      yPos = window.innerHeight - event.pageY;
    }
  }

  return {
    xKey,
    xPos: xPos + (tb ? 0 : 15),
    yKey,
    yPos: yPos + (tb ? 15 : 0),
  };
};

export const removeAllClass = (name?: string) => {
  const className = name || "tooltip";
  const els = document.getElementsByClassName(className);
  if (els && els.length > 0) {
    for (let i = els.length - 1; i >= 0; i--) {
      document.body.removeChild(els[i]);
    }
  }
};

export const addTooltipEvent = (
  element: HTMLElement | string,
  tooltip: string,
  tb: boolean = false,
  target: "mouse" | "elcenter" | "elside" | "elupdown" | "elright" = "elupdown",
) => {
  let el: HTMLElement | null = null;
  if (typeof element === "string") {
    el = document.getElementById(element as string);
  } else {
    el = element as HTMLElement;
  }
  if (!el) {
    return;
  }

  el.onmouseenter = (evt: MouseEvent) => {
    removeAllClass("tooltip");
    const divEl = document.createElement("div");
    divEl.classList.add("tooltip");
    divEl.innerHTML = tooltip;
    document.body.appendChild(divEl);
    const { xKey, xPos, yKey, yPos } = getTooltipPosition(divEl, evt, target, tb);

    let arrow = `tooltip-${yKey}-${xKey}`;
    if (tb) {
      arrow += "-tb";
    }
    divEl.className = `tooltip ${arrow}`;
    divEl.style[xKey as any] = `${xPos}px`;
    divEl.style[yKey as any] = `${yPos}px`;
  };
  el.onmouseleave = (evt: MouseEvent) => {
    removeAllClass("tooltip");
  };
  el.onclick = () => {
    removeAllClass("tooltip");
  };
};

export const findElement = (
  name: string,
  options: {
    parents?: HTMLElement | undefined | null;
    last?: boolean;
  } = {},
): HTMLElement | undefined => {
  if (!name || name.length < 1) return undefined;
  const { parents, last } = options;
  let el: Document | HTMLElement = document;
  const typeKey = name[0];
  const realName = name.substring(1);
  switch (typeKey) {
    case ".": // class
      if (parents) {
        el = parents;
      }
      const findEls = el.getElementsByClassName(realName);
      if (findEls.length > 0) {
        return (last ? findEls[findEls.length - 1] : findEls[0]) as HTMLElement;
      }
      return undefined;
    case "#": // id
      const findEl = el.getElementById(realName);
      return findEl ?? undefined;
    default:
      return undefined;
  }
};

export const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

export const getElementWindow = (element: HTMLElement) => {
  if (!element || !element.ownerDocument || !element.ownerDocument.defaultView) {
    return window;
  }
  return element.ownerDocument.defaultView;
};

export const getElementDocument = (element: HTMLElement) => {
  if (!element || !element.ownerDocument) {
    return document;
  }
  return element.ownerDocument;
};

export const isCollision = (s1: HTMLElement, s2: HTMLElement) => {
  const r1 = s1.getBoundingClientRect();
  const r2 = s2.getBoundingClientRect();
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
};

export const isOver = (s1: HTMLElement, s2: HTMLElement) => {
  const r1 = s1.getBoundingClientRect();
  const r2 = s2.getBoundingClientRect();
  return r1.top > r2.top || r1.right < r2.right || r1.bottom < r2.bottom || r1.left > r2.left;
};
