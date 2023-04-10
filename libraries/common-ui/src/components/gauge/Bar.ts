import * as d3 from "d3";
import { generateGUID } from "../../utils/commonUtil";
import { randomLorem } from "../../utils/randomUtil";
import { getKeyColor, getTextColor } from "../../utils/colorUtil";
import { numberFormat } from "../../utils/chartUtil";
import { LabelType } from "../../types";

export interface IBarProps {
  value: number;
  name?: string;
  caption?: string;
  color?: string;
  endColor?: string;
  gradient?: boolean;
  labelType?: LabelType;
  textSize?: number;
  textBold?: boolean;
  percentText?: string;
  animationDuration?: number;
  animationDelay?: number;
}

interface IRenderParam {
  gauge: d3.Selection<SVGGElement, unknown, null, undefined>;
  defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
  width: number;
  height: number;
  minValue: number;
  maxValue: number;
  cornerRadius: number;
  clipId?: string;
  gradientId?: string;
  colorHash: Record<string, any>;
  scale: d3.ScaleLinear<number, number, never>;
  colorScale?: d3.ScaleLinear<number, number, never>;
}

export default class Bar {
  value: number;
  name: string;
  caption?: string;
  color?: string;
  endColor?: string;
  gradient: boolean;
  labelType: LabelType;
  textSize?: number;
  textBold: boolean;
  percentText: string;
  animationDuration: number;
  animationDelay: number;

  constructor(params: IBarProps) {
    this.value = params.value;
    this.name = params.name || randomLorem();
    this.caption = params.caption;
    this.color = params.color;
    this.endColor = params.endColor;
    this.gradient = params.gradient || false;
    this.labelType = params.labelType || "start";
    this.textSize = params.textSize;
    this.textBold = params.textBold || false;
    this.percentText = params.percentText || "";
    this.animationDuration = params.animationDuration ?? 1000;
    this.animationDelay = params.animationDelay ?? 500;
  }

  get displayText() {
    return this.caption || this.name;
  }

  get displayValue(): string {
    const percentText = this.percentText;
    return `${numberFormat(this.value)}${percentText}`;
  }

  renderClip(params: IRenderParam) {
    const { defs, height, minValue, cornerRadius, scale, clipId } = params;
    if (!clipId) return;

    const value = this.value;

    const clipRect = defs
      .append("svg:clipPath")
      .attr("id", clipId)
      .append("svg:rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", `${scale(minValue)}px`)
      .attr("height", `${height}px`)
      .style("rx", `${cornerRadius}px`)
      .style("ry", `${cornerRadius}px`);

    clipRect
      .transition()
      .duration(this.animationDuration)
      .delay(this.animationDelay)
      .tween("rect", function () {
        const that = d3.select(this);
        const i = d3.interpolate(minValue, scale(value) as any);
        return (t: any) => {
          that.attr("width", i(t));
        };
      });
  }

  renderGradient(params: IRenderParam) {
    if (!this.color) return;
    if (!this.endColor) return;
    if (this.color === this.endColor) return;
    const { defs, gradientId } = params;
    if (!gradientId) return;

    const lg = defs.append("linearGradient").attr("id", gradientId);
    lg.append("stop").attr("offset", "0%").attr("stop-color", this.color).attr("stop-opacity", 1);
    lg.append("stop").attr("offset", "100%").attr("stop-color", this.endColor).attr("stop-opacity", 1);
  }

  renderBar(params: IRenderParam) {
    const { gauge, height, minValue, cornerRadius, scale, colorScale, gradientId } = params;
    if (!colorScale) return;

    const value = this.value;
    const gradient = this.gradient;

    // foreground
    const fore = gauge
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", `${minValue}px`)
      .attr("height", `${height}px`)
      .style("rx", `${cornerRadius}px`)
      .style("ry", `${cornerRadius}px`);

    fore
      .transition()
      .duration(this.animationDuration)
      .delay(this.animationDelay)
      .tween("rect", function () {
        const that = d3.select(this);
        const i = d3.interpolate(minValue, scale(value) as any);
        return (t: any) => {
          if (gradient) {
            that.style("fill", `url(#${gradientId})`);
          } else {
            that.style("fill", colorScale(i(t)) as any);
          }
          that.attr("width", i(t));
        };
      });
  }

  renderLabel(params: IRenderParam) {
    const { gauge, height, width, minValue, clipId, scale, colorScale } = params;
    if (!clipId) return;
    if (!colorScale) return;
    const value = this.value;
    const percentText = this.percentText;
    const initText = `${numberFormat(minValue)}${percentText}`;
    const textPixels = this.textSize || Math.min(width, height) / 2;
    const moveText = this.labelType === "inner" || this.labelType === "outer";

    let textPos: number;
    switch (this.labelType) {
      case "start":
        textPos = 8;
        break;
      case "middle":
        textPos = width / 2;
        break;
      case "end":
        textPos = width - 8;
        break;
      case "inner":
        textPos = -8;
        break;
      case "outer":
        textPos = 8;
        break;
      default:
        textPos = 0;
        break;
    }
    let anchor: string;
    switch (this.labelType) {
      case "inner":
        anchor = "end";
        break;
      case "outer":
        anchor = "start";
        break;
      default:
        anchor = this.labelType;
        break;
    }

    // text
    if (this.labelType !== "inner") {
      const backText = gauge
        .append("text")
        .attr("x", textPos)
        .attr("y", height / 2)
        .style("text-anchor", anchor)
        .style("dominant-baseline", "central")
        .style("font-size", `${textPixels}px`)
        .style("font-weight", this.textBold ? "bold" : "normal")
        .text(initText);

      backText
        .transition()
        .duration(this.animationDuration)
        .delay(this.animationDelay)
        .tween("text", function (d) {
          const that = d3.select(this);
          const i = d3.interpolateNumber(+that.text().replace(percentText, ""), value);
          return function (t) {
            that.text(numberFormat(i(t)) + percentText);
            that.style("fill", colorScale(scale(i(t)) as any) as any);
            if (moveText) {
              that.attr("x", textPos + scale(i(t)));
            }
          };
        });
    }

    if (this.labelType !== "outer") {
      const foreText = gauge
        .append("text")
        .attr("clip-path", `url(#${clipId})`)
        .attr("x", textPos)
        .attr("y", height / 2)
        .style("text-anchor", anchor)
        .style("dominant-baseline", "central")
        .style("font-size", `${textPixels}px`)
        .style("font-weight", this.textBold ? "bold" : "normal")
        .text(initText);

      foreText
        .transition()
        .duration(this.animationDuration)
        .delay(this.animationDelay)
        .tween("text", function (d) {
          const that = d3.select(this);
          const i = d3.interpolateNumber(+that.text().replace(percentText, ""), value);
          return function (t) {
            that.text(numberFormat(i(t)) + percentText);
            that.style("fill", getTextColor(colorScale(scale(i(t)) as any)) as any);
            if (moveText) {
              that.attr("x", textPos + scale(i(t)));
            }
          };
        });
    }
  }

  render(params: IRenderParam) {
    const { width, colorHash } = params;
    params.clipId = generateGUID();
    this.color = this.color || getKeyColor(this.name, { colorHash });
    this.endColor = this.endColor || this.color;

    params.colorScale = d3
      .scaleLinear()
      .domain([0, width])
      .range([this.color, this.endColor] as any);

    this.renderClip(params);
    if (this.gradient) {
      params.gradientId = generateGUID();
      this.renderGradient(params);
    }
    this.renderBar(params);
    this.renderLabel(params);
  }
}
