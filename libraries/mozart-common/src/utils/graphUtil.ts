import cytoscape, { Core } from "cytoscape";

let createTooltip: (evt: cytoscape.EventObjectNode) => void;
const removeTooltip = (evt: cytoscape.EventObjectNode) => {
  removeAllClass("tooltip");
};

export const addTooltipEventNode = (
  cy?: cytoscape.Core,
  tooltip?: Function | string,
  tb: boolean = false,
  target: "mouse" | "elcenter" | "elside" | "elupdown" | "elright" = "elupdown",
) => {
  if (!cy) return;

  cy.removeListener("mouseover", createTooltip);
  cy.removeListener("mouseout", removeTooltip);
  cy.removeListener("mousedown", removeTooltip);

  if (!tooltip) return;

  createTooltip = (evt: cytoscape.EventObjectNode) => {
    removeAllClass("tooltip");

    const textContent = typeof tooltip === "string" ? tooltip : tooltip(evt.target.data());
    if (!textContent) return;

    const divEl = document.createElement("div");
    divEl.classList.add("tooltip");
    divEl.innerHTML = textContent;
    document.body.appendChild(divEl);
    const { xKey, xPos, yKey, yPos } = getTooltipPosition(cy, divEl, evt, target, tb);

    let arrow = `tooltip-${yKey}-${xKey}`;
    if (tb) {
      arrow += "-tb";
    }
    divEl.className = `tooltip ${arrow}`;
    divEl.style[xKey as any] = `${xPos}px`;
    divEl.style[yKey as any] = `${yPos}px`;
  };

  cy.on("mouseover", "node", createTooltip);
  cy.on("mouseout", "node", removeTooltip);
  cy.on("mousedown", "node", removeTooltip);
};

export const getTooltipPosition = (
  cy: cytoscape.Core,
  tooltip: HTMLElement,
  event: cytoscape.EventObjectNode,
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

  const node = event.target;

  const contanierRect = cy.container()?.getBoundingClientRect()!;

  if (node && target === "elcenter") {
    xPos = node.renderedPosition().x + contanierRect.x;
    yPos = node.renderedPosition().y + contanierRect.y;
    if (node.renderedPosition().x + tooltip.offsetWidth < contanierRect.width) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos = window.innerWidth - node.renderedPosition().x - contanierRect.x;
    }
    if (node.renderedPosition().y + tooltip.offsetHeight < contanierRect.height) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos = window.innerHeight - node.renderedPosition().y - contanierRect.y;
    }
  } else if (node && target === "elside") {
    xPos = node.renderedPosition().x + node.renderedWidth() / 2 + contanierRect.x;
    yPos = node.renderedPosition().y + contanierRect.y;
    if (node.renderedPosition().x + tooltip.offsetWidth < contanierRect.width) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos =
        window.innerWidth - node.renderedPosition().x + node.renderedWidth() / 2 - contanierRect.x;
    }
    if (node.renderedPosition().y + tooltip.offsetHeight < contanierRect.height) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos = window.innerHeight - node.renderedPosition().y - contanierRect.y;
    }
  } else if (node && target === "elupdown") {
    xPos = node.renderedPosition().x + contanierRect.x;
    yPos = node.renderedPosition().y + node.renderedHeight() / 2 + contanierRect.y;
    if (node.renderedPosition().x + tooltip.offsetWidth < contanierRect.width) {
      xKey = "left";
    } else {
      xKey = "right";
      xPos = window.innerWidth - node.renderedPosition().x - contanierRect.x;
    }
    if (node.renderedPosition().y + tooltip.offsetHeight < contanierRect.height) {
      yKey = "top";
    } else {
      yKey = "bottom";
      yPos =
        window.innerHeight -
        node.renderedPosition().y +
        node.renderedHeight() / 2 -
        contanierRect.y;
    }
  } else if (node && target === "elright") {
    xKey = "left";
    yKey = "top";
    if (
      node.renderedPosition().x + tooltip.offsetWidth < contanierRect.width &&
      node.renderedPosition().y + tooltip.offsetHeight < contanierRect.height
    ) {
      xPos = node.renderedPosition().x + node.renderedWidth() / 2 + contanierRect.x;
      yPos = node.renderedPosition().y + contanierRect.y;
    } else {
      xPos = event.renderedPosition.x + contanierRect.x;
      yPos = event.renderedPosition.y + contanierRect.y;
    }
  } else {
    xPos = event.renderedPosition.x + contanierRect.x;
    yPos = event.renderedPosition.y + contanierRect.y;
    if (xPos > window.innerWidth) {
      xKey = "right";
      xPos = window.innerWidth - event.renderedPosition.x + contanierRect.x;
    }
    if (yPos > window.innerHeight) {
      yKey = "bottom";
      yPos = window.innerHeight - event.renderedPosition.y + contanierRect.y;
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
