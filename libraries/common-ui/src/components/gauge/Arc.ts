import * as d3 from "d3";
import { generateGUID } from "../../utils/commonUtil";
import { randomLorem } from "../../utils/randomUtil";
import { getKeyColor, getTextColor } from "../../utils/colorUtil";
import { numberFormat } from "../../utils/chartUtil";
import { LabelType } from "../../types";

export interface IArcProps {
  value: number;
  name?: string;
  caption?: string;
  color?: string;
  endColor?: string;
  gradient?: boolean;
  labelType?: LabelType;
  textSize?: number;
  textBold?: boolean;
  textVerticalPosition?: number;
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
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  gradientId?: string;
  colorHash: Record<string, any>;
  scale: d3.ScaleLinear<number, number, never>;
  colorScale?: d3.ScaleLinear<number, number, never>;
  arc: d3.Arc<any, d3.DefaultArcObject>;
}

export default class Arc {
  value: number;
  name: string;
  caption?: string;
  color?: string;
  endColor?: string;
  gradient: boolean;
  labelType: LabelType;
  textSize?: number;
  textBold: boolean;
  textVerticalPosition: number;
  percentText: string;
  animationDuration: number;
  animationDelay: number;

  constructor(params: IArcProps) {
    this.value = params.value;
    this.name = params.name || randomLorem();
    this.caption = params.caption;
    this.color = params.color;
    this.endColor = params.endColor;
    this.gradient = params.gradient || false;
    this.labelType = params.labelType || "middle";
    this.textSize = params.textSize;
    this.textBold = params.textBold || false;
    this.textVerticalPosition = params.textVerticalPosition || 0;
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

  renderGradient(params: IRenderParam) {
    if (!this.color) return;
    if (!this.endColor) return;
    if (this.color === this.endColor) return;
    const { defs, gradientId } = params;
    if (!gradientId) return;

    const rg = defs.append("radialGradient").attr("id", gradientId);
    rg.append("stop").attr("offset", "0%").attr("stop-color", this.color).attr("stop-opacity", 1);
    rg.append("stop").attr("offset", "100%").attr("stop-color", this.endColor).attr("stop-opacity", 1);
  }

  renderArc(params: IRenderParam) {
    const { gauge, startAngle, scale, arc, colorScale, gradientId } = params;
    if (!colorScale) return;

    const value = this.value;
    const gradient = this.gradient;

    // foreground
    const fore = gauge
      .append("path")
      .datum({
        endAngle: startAngle,
      })
      .attr("d", arc as any)
      .style("fill", colorScale(scale(value) as any) as any);

    fore
      .transition()
      .duration(this.animationDuration)
      .delay(this.animationDelay)
      .tween("path", function (d) {
        const that = d3.select(this);
        const i = d3.interpolate(d.endAngle, scale(value) as any);
        return (t: any) => {
          if (gradient) {
            that.style("fill", `url(#${gradientId})`);
          } else {
            that.style("fill", colorScale(i(t)) as any);
          }
          that.datum({ endAngle: i(t) });
          that.attr("d", arc as any);
        };
      });
  }

  renderLabel(params: IRenderParam) {
    const {
      gauge,
      width,
      height,
      minValue,
      maxValue,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      scale,
      colorScale,
    } = params;
    if (!colorScale) return;

    const moveText = this.labelType === "inner" || this.labelType === "outer";

    const value = this.value;
    const percentText = this.percentText;

    if (!moveText) {
      const textPixels = this.textSize || Math.min(width, height) / 4;

      // text
      gauge
        .append("text")
        .attr("y", this.textVerticalPosition)
        .style("dominant-baseline", "central")
        .style("text-anchor", "middle")
        .style("fill", colorScale(startAngle) as any)
        .style("font-size", `${textPixels}px`)
        .style("font-weight", this.textBold ? "bold" : "normal")
        .text(numberFormat(minValue) + percentText)
        .transition()
        .duration(this.animationDuration)
        .delay(this.animationDelay)
        .tween("text", function (d) {
          const that = d3.select(this);
          const i = d3.interpolateNumber(+that.text().replace(percentText, ""), value);
          return function (t) {
            that.text(numberFormat(i(t)) + percentText);
            that.style("fill", colorScale(scale(i(t)) as any) as any);
          };
        });
    } else {
      let textPos: number;
      switch (this.labelType) {
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
          anchor = "middle";
          break;
      }

      const radius = innerRadius + (outerRadius - innerRadius) / 2;
      const textArc = d3.arc().innerRadius(radius).outerRadius(radius).startAngle(startAngle);
      const arcId = generateGUID();
      const textPixels = outerRadius - innerRadius - 6;

      const path = gauge
        .append("path")
        .datum({
          endAngle,
        })
        .attr("id", arcId)
        .attr("d", textArc as any);

      const pathLen = (path.node() as any).getTotalLength() / 2;
      const pathScale = d3.scaleLinear().domain([minValue, maxValue]).range([0, pathLen]);
      const labelType = this.labelType;

      gauge
        .append("text")
        .append("textPath")
        .attr("xlink:href", `#${arcId}`)
        .style("text-anchor", anchor)
        .style("dominant-baseline", "middle")
        .style("font-size", `${textPixels}px`)
        .style("font-weight", this.textBold ? "bold" : "normal")
        .text(numberFormat(minValue) + percentText)
        .transition()
        .duration(this.animationDuration)
        .delay(this.animationDelay)
        .tween("text", function (d) {
          const that = d3.select(this);
          const i = d3.interpolateNumber(+that.text().replace(percentText, ""), value);
          return function (t) {
            that.text(numberFormat(i(t)) + percentText);
            that.style("fill", labelType === "inner" ? getTextColor(colorScale(i(t))) : colorScale(i(t)));
            if (moveText) {
              that.attr("startOffset", textPos + pathScale(i(t)));
            }
          };
        });
    }
  }

  render(params: IRenderParam) {
    const { startAngle, endAngle, colorHash } = params;

    this.color = this.color || getKeyColor(this.name, { colorHash });
    this.endColor = this.endColor || this.color;

    params.colorScale = d3
      .scaleLinear()
      .domain([startAngle, endAngle])
      .range([this.color, this.endColor] as any);

    if (this.gradient) {
      params.gradientId = generateGUID();
      this.renderGradient(params);
    }

    this.renderArc(params);
    this.renderLabel(params);
  }
}
