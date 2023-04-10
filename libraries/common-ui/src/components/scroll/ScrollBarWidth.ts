import { canUseDOM, getElementDocument } from "../../utils/element";

let cachedScrollbarWidth: number | null = null;
let cachedDevicePixelRatio: number | null = null;

if (canUseDOM) {
  window.addEventListener("resize", () => {
    if (cachedDevicePixelRatio !== window.devicePixelRatio) {
      cachedDevicePixelRatio = window.devicePixelRatio;
      cachedScrollbarWidth = null;
    }
  });
}

export default function scrollbarWidth(el: HTMLElement) {
  if (cachedScrollbarWidth === null) {
    const document = getElementDocument(el);
    if (typeof document === "undefined") {
      cachedScrollbarWidth = 0;
      return cachedScrollbarWidth;
    }
    const body = document.body;
    const box = document.createElement("div");
    box.classList.add("moz-scrollbar-hide-scrollbar");
    body.appendChild(box);
    const width = box.getBoundingClientRect().right;
    body.removeChild(box);
    cachedScrollbarWidth = width;
  }
  return cachedScrollbarWidth;
}
