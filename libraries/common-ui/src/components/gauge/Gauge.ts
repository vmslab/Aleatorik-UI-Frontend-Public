import * as d3 from "d3";
import { GaugeType, IGaugeTooltipParams } from "../../types";
import { degreeToRadian } from "../../utils/gaugeUtil";
import { addTooltipEvent } from "../../utils/element";
import Arc from "./Arc";
import Bar from "./Bar";
import Mark from "./Mark";

export interface IGaugeProps {
  width: number;
  height: number;
  type?: GaugeType;
  minValue?: number;
  maxValue?: number;
  backColor?: string;
  verticalPosition?: number;
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  reverse?: boolean;
  colorHash?: Record<string, any>;
  noDataText?: string;
  showTooltip?: boolean;
  setToolTip?: (params: IGaugeTooltipParams) => string;
  bars?: Bar[];
  arcs?: Arc[];
  marks?: Mark[];
}

interface IGaugePropsDetail extends IGaugeProps {
  parents: HTMLElement;
}

interface IRenderParam {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
}

export default class Gauge {
  parents: HTMLElement;
  width: number;
  height: number;
  type: GaugeType;
  minValue: number;
  maxValue: number;
  backColor: string;
  verticalPosition: number;
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  startAngle: number;
  endAngle: number;
  reverse: boolean;
  colorHash: Record<string, any>;
  noDataText?: string;
  showTooltip: boolean;
  setToolTip?: (params: IGaugeTooltipParams) => string;
  bars: Bar[];
  arcs: Arc[];
  marks: Mark[];

  constructor(params: IGaugePropsDetail) {
    this.parents = params.parents;
    this.width = params.width;
    this.height = params.height;
    this.type = params.type || "bar";
    this.minValue = params.minValue || 0;
    this.maxValue = params.maxValue || 100;
    this.backColor = params.backColor || "var(--color-backdark1)";
    this.verticalPosition = params.verticalPosition || 0;
    this.innerRadius = params.innerRadius || 50;
    this.outerRadius = params.outerRadius || 70;
    this.cornerRadius = params.cornerRadius || 0;
    this.startAngle = params.startAngle || 0;
    this.endAngle = params.endAngle || 360;
    this.reverse = params.reverse || false;
    this.colorHash = params.colorHash || {};
    this.noDataText = params.noDataText;
    this.showTooltip = params.showTooltip ?? true;
    this.setToolTip = params.setToolTip;
    this.bars = params.bars || [];
    this.arcs = params.arcs || [];
    this.marks = params.marks || [];
  }

  dispose() {}

  renderNoData(params: IRenderParam) {
    if (!this.noDataText) return;
    const { svg } = params;

    const g = svg.append("g");
    const rect = g
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", `${this.width}px`)
      .attr("height", `${this.height}px`)
      .style("fill", this.backColor);
    if (this.type === "bar") {
      rect.style("rx", `${this.cornerRadius}px`).style("ry", `${this.cornerRadius}px`);
    }
    g.append("text")
      .attr("x", 8)
      .attr("y", this.height / 2)
      .style("fill", "var(--color-font4)")
      .style("text-anchor", "start")
      .style("dominant-baseline", "central")
      .text(this.noDataText);
  }

  renderBar(params: IRenderParam) {
    const { svg, defs } = params;
    const gauge = svg.append("g");
    const scale = d3.scaleLinear().domain([this.minValue, this.maxValue]).range([0, this.width]);

    // background
    const back = gauge
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", `${this.width}px`)
      .attr("height", `${this.height}px`)
      .style("rx", `${this.cornerRadius}px`)
      .style("ry", `${this.cornerRadius}px`)
      .style("fill", this.backColor);

    this.bars.forEach(bar => {
      bar.render({
        gauge,
        defs,
        width: this.width,
        height: this.height,
        minValue: this.minValue,
        maxValue: this.maxValue,
        cornerRadius: this.cornerRadius,
        colorHash: this.colorHash,
        scale,
      });
    });

    this.marks.forEach(mark => {
      mark.render({
        gauge,
        innerRadius: this.innerRadius,
        outerRadius: this.outerRadius,
        height: this.height,
        type: this.type,
        scale,
      });
    });
  }

  renderArc(params: IRenderParam) {
    const { svg, defs } = params;
    const gauge = svg
      .append("g")
      .attr("transform", `translate(${this.width / 2},${this.height / 2 + this.verticalPosition})`);

    const startAngle = degreeToRadian(this.startAngle);
    const endAngle = degreeToRadian(this.endAngle, this.reverse);

    const scale = d3.scaleLinear().domain([this.minValue, this.maxValue]).range([startAngle, endAngle]);

    const arc = d3
      .arc()
      .cornerRadius(this.cornerRadius)
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
      .startAngle(startAngle);

    // background
    const back = gauge
      .append("path")
      .datum({ endAngle })
      .attr("d", arc as any)
      .style("fill", this.backColor);

    this.arcs.forEach(ar => {
      ar.render({
        gauge,
        defs,
        width: this.width,
        height: this.height,
        minValue: this.minValue,
        maxValue: this.maxValue,
        innerRadius: this.innerRadius,
        outerRadius: this.outerRadius,
        startAngle,
        endAngle,
        colorHash: this.colorHash,
        scale,
        arc,
      });
    });

    this.marks.forEach(mark => {
      mark.render({
        gauge,
        innerRadius: this.innerRadius,
        outerRadius: this.outerRadius,
        height: this.height,
        type: this.type,
        scale,
      });
    });
  }

  renderTooltip(params: IRenderParam) {
    const { svg } = params;
    const svgEl = svg.node() as unknown as HTMLElement;

    let html = "";
    if (this.setToolTip) {
      const items = [...this.bars, ...this.arcs].map((bar, i) => {
        return {
          type: "bar",
          key: bar.displayText,
          value: bar.displayText,
          color: bar.color!,
        };
      });
      items.push(
        ...this.marks
          .filter(mark => mark.type !== "tick")
          .map(mark => {
            return {
              type: "mark",
              key: mark.name,
              value: String(mark.value),
              color: mark.color,
            };
          }),
      );
      html = this.setToolTip({ items });
    } else {
      [...this.bars, ...this.arcs].forEach((bar, i) => {
        html += "<div style='display: flex; align-items: center;'>";
        html += `<span class="dot" style="background-color:${bar.color}"></span>`;
        html += `<span class="label">${bar.displayText}</span>: ${bar.displayValue}`;
        html += "</div>";
      });
      const marks = this.marks.filter(mark => mark.type !== "tick");
      if (marks && marks.length > 0) {
        html += "<br><div>Mark</div>";
        marks.forEach((mark, i) => {
          html += "<div style='display: flex; align-items: center;'>";
          html += `<span class="dot" style="background-color:${mark.color}"></span>`;
          html += `<span class="label">${mark.name}</span>: ${mark.value}`;
          html += "</div>";
        });
      }
    }

    addTooltipEvent(svgEl, html, true, this.type === "bar" ? "elupdown" : "elcenter");
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }

    const svg = d3.select(this.parents).append("svg").attr("width", this.width).attr("height", this.height);
    const defs = svg.append("defs");

    if (this.noDataText) {
      this.renderNoData({ svg, defs });
    } else {
      if (this.type === "bar") {
        this.renderBar({ svg, defs });
      } else if (this.type === "arc") {
        this.renderArc({ svg, defs });
      }
      if (this.showTooltip) {
        this.renderTooltip({ svg, defs });
      }
    }
  }
}
