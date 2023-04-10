import * as d3 from "d3";
import { GaugeType, MarkType } from "../../types";
import { randomLorem } from "../../utils/randomUtil";

export interface IMarkProps {
  value?: number;
  name?: string;
  type?: MarkType;
  color?: string;
  width?: number;
  dashArray?: string;
  ticks?: number;
}

interface IRenderParam {
  gauge: d3.Selection<SVGGElement, unknown, null, undefined>;
  type: GaugeType;
  height: number;
  innerRadius: number;
  outerRadius: number;
  scale: d3.ScaleLinear<number, number, never>;
}

export default class Mark {
  value: number;
  name: string;
  type: MarkType;
  color: string;
  width: number;
  dashArray: string;
  ticks: number;

  constructor(params: IMarkProps) {
    this.value = params.value || 0;
    this.name = params.name || randomLorem({ min: 4, max: 12 });
    this.type = params.type || "mark";
    this.color = params.color || "var(--color-border2)";
    this.width = params.width || 2;
    this.dashArray = params.dashArray || "none";
    this.ticks = params.ticks || 5;
  }

  renderBarMark(params: IRenderParam) {
    const { gauge, height, scale } = params;

    let mark: any;

    if (this.type === "mark") {
      mark = gauge
        .append("path")
        .attr("class", "moz-gauge-mark")
        .attr("d", (d: any) => `M${scale(this.value)},0V${height}`);
    } else if (this.type === "tick") {
      mark = gauge
        .selectAll(".moz-gauge-tick")
        .data(scale.ticks(this.ticks).map(d => ({ score: d })))
        .enter()
        .append("path")
        .attr("class", "moz-gauge-tick")
        .attr("d", (d: any) => `M${scale(d.score)},0V${height}`);
    }

    if (!mark) return;

    mark
      .style("fill", "none")
      .style("stroke-width", this.width)
      .style("stroke", this.color)
      .style("stroke-dasharray", this.dashArray);
  }

  renderArcMark(params: IRenderParam) {
    const { gauge, innerRadius, outerRadius, scale } = params;

    const line = d3
      .lineRadial()
      .angle((d: any) => scale(d) as any)
      .radius((d: any, i: number) => {
        return innerRadius + (i % 2) * (outerRadius - innerRadius);
      });

    let mark: any;

    if (this.type === "mark") {
      mark = gauge
        .append("path")
        .attr("class", "moz-gauge-mark")
        .attr("d", line([this.value, this.value] as any));
    } else if (this.type === "tick") {
      mark = gauge
        .selectAll(".moz-gauge-tick")
        .data(scale.ticks(this.ticks).map(d => ({ score: d })))
        .enter()
        .append("path")
        .attr("class", "moz-gauge-tick")
        .attr("d", (d: any) => line([d.score, d.score]));
    }

    if (!mark) return;

    mark
      .style("fill", "none")
      .style("stroke-width", this.width)
      .style("stroke", this.color)
      .style("stroke-dasharray", this.dashArray);
  }

  render(params: IRenderParam) {
    const { type } = params;

    if (type === "bar") {
      this.renderBarMark(params);
    } else if (type === "arc") {
      this.renderArcMark(params);
    }
  }
}
