import * as d3 from "d3";
import { IChartData } from "../types";

export const parseChartCsv = (source: string, parser: (d: Record<string, any>) => IChartData): IChartData[] => {
  return d3.csvParse(source, parser);
};

const calcPos = (
  width: number,
  height: number,
  tooltip: HTMLElement,
  target: "mouse" | "elcenter" | "elside" | "elupdown" = "mouse",
  tb: boolean = false,
  event: MouseEvent,
) => {
  let rect: DOMRect | null = null;
  if (event.target instanceof Element) {
    rect = event.target.getBoundingClientRect();
  }
  const h: { [index: string]: any } = {};
  const v: { [index: string]: any } = {};
  let xPos: number = 0;
  let yPos: number = 0;
  if (rect && target === "elcenter") {
    xPos = rect.left + rect.width / 2;
    yPos = rect.top + rect.height / 2;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      h.key = "left";
    } else {
      h.key = "right";
      xPos = window.innerWidth - rect.right + rect.width / 2;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      v.key = "top";
    } else {
      v.key = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height / 2;
    }
  } else if (rect && target === "elside") {
    xPos = rect.left + rect.width;
    yPos = rect.top + rect.height / 2;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      h.key = "left";
    } else {
      h.key = "right";
      xPos = window.innerWidth - rect.right + rect.width;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      v.key = "top";
    } else {
      v.key = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height / 2;
    }
  } else if (rect && target === "elupdown") {
    xPos = rect.left + rect.width / 2;
    yPos = rect.top + rect.height;
    if (xPos + tooltip.offsetWidth < window.innerWidth) {
      h.key = "left";
    } else {
      h.key = "right";
      xPos = window.innerWidth - rect.right + rect.width / 2;
    }
    if (yPos + tooltip.offsetHeight < window.innerHeight) {
      v.key = "top";
    } else {
      v.key = "bottom";
      yPos = window.innerHeight - rect.bottom + rect.height;
    }
  } else {
    if (width - event.offsetX < tooltip.offsetWidth) {
      h.key = "right";
      xPos = window.innerWidth - event.pageX;
    } else {
      h.key = "left";
      xPos = +event.pageX;
    }
    if (height - event.offsetY < tooltip.offsetHeight) {
      v.key = "bottom";
      yPos = window.innerHeight - event.pageY;
    } else {
      v.key = "top";
      yPos = event.pageY;
    }
  }
  h.value = `${xPos + (tb ? 0 : 15)}px`;
  v.value = `${yPos + (tb ? 15 : 0)}px`;

  return { h, v };
};

export const tooltipMouseOver = (
  width: number,
  height: number,
  d: any,
  target: "mouse" | "elcenter" | "elside" | "elupdown" = "mouse",
  tb: boolean = false,
  event: MouseEvent,
  info: (dd: any) => string,
) => {
  const el = d3.select("body");

  const div = el.append("div").attr("class", "tooltip");

  div.attr("id", "tooltip").html(info(d));

  const tooltip = document.getElementById("tooltip")!;

  const { h, v } = calcPos(width, height, tooltip, target, tb, event);

  div
    .attr("class", `tooltip tooltip-${v.key}-${h.key}${tb ? "-tb" : ""}`)
    .style(h.key, h.value)
    .style(v.key, v.value);
};

export const tooltipMouseOut = () => {
  const el = d3.selectAll(".tooltip");

  el.each(() => {
    el.remove();
  });
};

export const getToolTipOut = (params: { opacity: number }) => {
  const { opacity: pOpacity } = params;
  return function (this: any) {
    const opacity = this.style.getPropertyValue("opacity");
    const fillOpacity = this.style.getPropertyValue("fill-opacity");
    const strokeOpacity = this.style.getPropertyValue("stroke-opacity");

    const el = d3.select(this).transition().duration(500);

    if (opacity) {
      el.style("opacity", pOpacity);
    }

    if (fillOpacity) {
      el.style("fill-opacity", pOpacity);
    }

    if (strokeOpacity) {
      el.style("stroke-opacity", pOpacity);
    }

    tooltipMouseOut();
  };
};

const numberIntl = new Intl.NumberFormat("ko-KR", { useGrouping: true, maximumFractionDigits: 2 });
const percentIntl = new Intl.NumberFormat("ko-KR", {
  style: "percent",
  useGrouping: true,
  maximumFractionDigits: 2,
});

export const numberFormat = (value: number, isPercent: boolean = false): string => {
  if (isPercent) {
    return percentIntl.format(value / 100);
  } else {
    return numberIntl.format(value);
  }
};
