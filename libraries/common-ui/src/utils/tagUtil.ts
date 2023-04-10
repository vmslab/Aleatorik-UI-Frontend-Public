const appendChildren = (parent: HTMLElement, children: Array<HTMLElement | string>) => {
  children.forEach(child => {
    if (!child) return;
    switch (typeof child) {
      case "string":
        const el = document.createTextNode(child);
        parent.appendChild(el);
        break;
      default:
        parent.appendChild(child);
        break;
    }
  });
};

const setStyle = (el: HTMLElement, style: string | Record<string, any>) => {
  if (typeof style == "string") {
    el.setAttribute("style", style);
  } else {
    Object.assign(el.style, style);
  }
};

const setClass = (el: HTMLElement, className: string) => {
  className.split(/\s/).forEach(element => {
    if (element) {
      el.classList.add(element);
    }
  });
};

const setProps = (el: HTMLElement, props: Record<string, any>) => {
  const eventRegex = /^on([a-z]+)$/i;
  for (const propName in props) {
    if (!propName) continue;

    if (propName === "style") {
      setStyle(el, props[propName]);
    } else if (propName === "className") {
      setClass(el, props[propName]);
    } else if (eventRegex.test(propName)) {
      const eventToListen = propName.replace(eventRegex, "$1").toLowerCase();
      el.addEventListener(eventToListen, props[propName]);
    } else {
      el.setAttribute(propName, props[propName]);
    }
  }
};

const createElement = (
  type: "div" | "ul" | "li" | "i" | "span" | "header" | "p" | "section" | "button",
  props: Record<string, any>,
  ...children: Array<HTMLElement | string>
) => {
  const el = document.createElement(type);
  if (props && typeof props === "object") {
    setProps(el, props);
  }
  if (children) {
    appendChildren(el, children);
  }
  return el;
};

export const createDiv = (props: any, ...children: any) => createElement("div", props, ...children);
export const createUl = (props: any, ...children: any) => createElement("ul", props, ...children);
export const createLi = (props: any, ...children: any) => createElement("li", props, ...children);
export const createI = (props: any, ...children: any) => createElement("i", props, ...children);
export const createSpan = (props: any, ...children: any) =>
  createElement("span", props, ...children);
export const createHeader = (props: any, ...children: any) =>
  createElement("header", props, ...children);
export const createP = (props: any, ...children: any) => createElement("p", props, ...children);
export const createSection = (props: any, ...children: any) =>
  createElement("section", props, ...children);
export const createButton = (props: any, ...children: any) =>
  createElement("button", props, ...children);
