import Series from "./Series";
import {
  INonNullMargin,
  TextType,
  ShapeType,
  Location,
  Position,
  IMargin,
  Direction,
  ChartValue,
  IChartTextParams,
} from "../../types";
import { getKeyColor } from "../../utils/colorUtil";
import { numberFormat } from "../../utils/chartUtil";
import { calcTextSize } from "../../utils/sizeUtil";

export interface ITextProps {
  text?: string;
  type?: TextType;
  color?: string;
  size?: number | string;
  rotate?: boolean;
  angle?: number;
  location?: Location;
  position?: Position;
  margin?: IMargin;
  legendCol?: number;
  legendRow?: number;
  legendShape?: ShapeType;
  legendMaxTextWidth?: number;
  className?: string;
  setText?: (params: { value: ChartValue }) => string;
}

interface IRenderParam {
  parents: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  width: number;
  height: number;
  margin: INonNullMargin;
  colorDic: Record<string, any>;
  serieses?: Series[];
  series?: Series;
}

export default class Text {
  text: string;
  type: TextType;
  color?: string;
  size?: string;
  angle?: number;
  location: Location;
  position: Position;
  margin: INonNullMargin;
  legendCol?: number;
  legendRow?: number;
  legendShape: ShapeType;
  legendMaxTextWidth?: number;
  className?: string;
  setText: (params: IChartTextParams) => string;

  constructor(params: ITextProps) {
    this.text = params.text || "";
    this.type = params.type || "text";
    this.color = params.color;
    if (params.size) {
      if (typeof params.size === "number") {
        this.size = `${params.size}px`;
      } else {
        this.size = params.size;
      }
    }
    this.angle = params.angle;
    this.location = params.location || "top";
    this.position = params.position || "middle";
    this.margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    if (params.margin) {
      this.margin.top = params.margin.top || 0;
      this.margin.right = params.margin.right || 0;
      this.margin.bottom = params.margin.bottom || 0;
      this.margin.left = params.margin.left || 0;
    }
    this.legendCol = params.legendCol;
    this.legendRow = params.legendRow;
    this.legendShape = params.legendShape || "circle";
    this.legendMaxTextWidth = params.legendMaxTextWidth;
    this.className = params.className;

    this.setText = (p: IChartTextParams) => {
      const { value } = p;
      if (params.setText) {
        p.numberFormat = numberFormat;
        return params.setText(p);
      } else {
        let result: string = String(value);
        if (typeof value === "number") {
          result = numberFormat(value);
        }
        return result;
      }
    };
  }

  getLocation(params: { width: number; height: number }) {
    const { width, height } = params;
    let locX = 0;
    let locY = 0;

    const textVerticalPos = (() => {
      switch (this.position) {
        case "start":
          return 0;
        case "end":
          return height;
        default:
          return height / 2;
      }
    })();
    const textHorizontalPos = (() => {
      switch (this.position) {
        case "start":
          return 0;
        case "end":
          return width;
        default:
          return width / 2;
      }
    })();

    switch (this.location) {
      case "left":
        locX = this.margin.left;
        locY = textVerticalPos + this.margin.top - this.margin.bottom;
        break;
      case "right":
        locX = width - this.margin.right;
        locY = textVerticalPos + this.margin.top - this.margin.bottom;
        break;
      case "top":
        locX = textHorizontalPos + this.margin.left - this.margin.right;
        locY = this.margin.top;
        break;
      case "center":
        locX = width / 2 + this.margin.left - this.margin.right;
        locY = height / 2 + this.margin.top - this.margin.bottom;
        break;
      default:
        locX = textHorizontalPos + this.margin.left - this.margin.right;
        locY = height - this.margin.bottom;
        break;
    }

    return { locX, locY };
  }

  getBarLocation(params: { x: number; y: number; width: number; height: number; direction: Direction; rect: DOMRect }) {
    const { x, y, width, height, direction, rect } = params;
    let locX = 0;
    let locY = 0;

    const textVerticalPos = (() => {
      switch (this.position) {
        case "start":
          return rect.height / 2;
        case "end":
          return height - rect.height / 2;
        default:
          return height / 2;
      }
    })();
    const textHorizontalPos = (() => {
      switch (this.position) {
        case "start":
          return rect.width / 2;
        case "end":
          return width - rect.width / 2;
        default:
          return width / 2;
      }
    })();

    if (direction === "vertical") {
      locX = width / 2 + this.margin.left - this.margin.right;
      locY = textVerticalPos + this.margin.top - this.margin.bottom;
    } else {
      locX = textHorizontalPos + this.margin.left - this.margin.right;
      locY = height / 2 + this.margin.top - this.margin.bottom;
    }

    locX += x;
    locY += y;

    return { locX, locY };
  }

  getBarTotalLocation(params: {
    x: number;
    y: number;
    width: number;
    height: number;
    location: Location;
    rect: DOMRect;
  }) {
    const { x, y, width, height, location, rect } = params;
    let locX = x;
    let locY = y;

    switch (location) {
      case "top":
        locX += width / 2;
        locY += rect.height / 2;
        break;
      case "right":
        locX -= rect.width / 2;
        locY += height / 2;
        break;
      case "bottom":
        locX += width / 2;
        locY -= rect.height / 2;
        break;
      default:
        locX += width + rect.width / 2;
        locY += height / 2;
        break;
    }

    locX = locX + this.margin.left - this.margin.right;
    locY = locY + this.margin.top - this.margin.bottom;

    return { locX, locY };
  }

  getLineLocation(params: { x: number; y: number; direction: Direction; rect: DOMRect }) {
    const { x, y, direction, rect } = params;
    let locX = 0;
    let locY = 0;

    const textVerticalPos = (() => {
      switch (this.position) {
        case "start":
          return y - rect.height / 2;
        case "end":
          return y + rect.height / 2;
        default:
          return y;
      }
    })();
    const textHorizontalPos = (() => {
      switch (this.position) {
        case "start":
          return x - rect.width / 2;
        case "end":
          return x + rect.width / 2;
        default:
          return x;
      }
    })();

    if (direction === "vertical") {
      locX = x + this.margin.left - this.margin.right;
      locY = textVerticalPos + this.margin.top - this.margin.bottom;
    } else {
      locX = textHorizontalPos + this.margin.left - this.margin.right;
      locY = y + this.margin.top - this.margin.bottom;
    }

    return { locX, locY };
  }

  renderText(params: IRenderParam) {
    const { parents, width, height } = params;

    const className = `moz-text${this.className ? ` ${this.className}` : ""}`;

    const g = parents.append("g").append("text").text(this.text).attr("class", className);

    if (this.size) {
      g.style("font-size", this.size);
    }

    if (this.color) {
      g.style("fill", this.color);
    }

    const element = g.node() as SVGElement;
    const rect = element.getBoundingClientRect();
    let { locX, locY } = this.getLocation({
      width,
      height,
    });

    switch (this.location) {
      case "left":
        break;
      case "right":
        if (this.angle === 90) {
          locY -= rect.height;
        } else {
          locX -= rect.width;
        }
        break;
      case "top":
        break;
      case "center":
        locY -= rect.height / 2;
        break;
      default:
        locY -= rect.height;
        break;
    }

    let transform = "";

    if (this.angle) {
      transform = `translate(${locX},${locY}),rotate(${this.angle})`;
    } else {
      transform = `translate(${locX},${locY})`;
    }

    g.attr("transform", transform);
  }

  renderHTML(params: IRenderParam) {
    const { parents, width, height } = params;

    const root = parents.append("g");
    const g = root.append("foreignObject").style("overflow", "visible");
    const div = g.append("xhtml:div").attr("class", this.className || "");
    const divEl = div.node() as HTMLElement;
    divEl.innerHTML = this.text;
    const size = calcTextSize(this.text, undefined, this.className);

    let { locX, locY } = this.getLocation({
      width,
      height,
    });

    switch (this.location) {
      case "left":
        break;
      case "right":
        if (this.angle === 90) {
          locY -= size.height;
        } else {
          locX -= size.width;
        }
        break;
      case "top":
      case "center":
        locX -= size.width / 2;
        locY -= size.height / 2;
        break;
      default:
        locY -= size.height;
        break;
    }

    g.attr("width", size.width).attr("height", size.height);

    let transform = "";

    if (this.angle) {
      transform = `translate(${locX},${locY}),rotate(${this.angle})`;
    } else {
      transform = `translate(${locX},${locY})`;
    }

    g.attr("transform", transform);
  }

  renderLegend(params: IRenderParam) {
    const { parents, width, height, colorDic, serieses } = params;

    if (!serieses || serieses.length === 0) return;

    const className = `moz-text-legend-table${this.className ? ` ${this.className}` : ""}`;

    const col = this.legendCol || (serieses.length < 3 ? serieses.length : Math.ceil(serieses.length / 2));
    const row = this.legendRow || (serieses.length < 3 ? 1 : 2);

    const root = parents.append("g");
    const g = root.append("foreignObject");
    const table = g.append("xhtml:table").attr("class", className);

    let idx = 0;
    Array(...Array(row))
      .map(() => {})
      .forEach(() => {
        const tr = table.append("tr");
        Array(...Array(col))
          .map(() => {})
          .forEach(() => {
            const series = serieses[idx];
            const td = tr.append("td");
            if (series) {
              const div = td.append("div").attr("class", "moz-text-legend-td");
              const shape = div
                .append("span")
                .attr(
                  "class",
                  this.legendShape === "circle"
                    ? "moz-text-legend-circle"
                    : this.legendShape === "square"
                    ? "moz-text-legend-square"
                    : "moz-text-legend-rect",
                );
              if (this.size) {
                shape.style("height", this.size);
                if (this.legendShape === "circle" || this.legendShape === "square") {
                  shape.style("width", this.size);
                }
              }
              if (this.legendShape === "series") {
                series.shape = shape;
              } else {
                shape.style("background-color", getKeyColor(series.key, { colorHash: colorDic }));
              }
              const text = div.append("span").attr("class", "moz-text-legend-text").text(series.displayText);
              if (this.size) {
                text.style("font-size", this.size);
              }
              if (this.color) {
                text.style("color", this.color);
              }
              if (this.legendMaxTextWidth) {
                div.style("width", `${this.legendMaxTextWidth}px`);
              }
            }
            idx++;
          });
      });

    const tableEl = table.node() as HTMLElement;
    const rect = tableEl.getBoundingClientRect();
    let { locX, locY } = this.getLocation({
      width,
      height,
    });

    switch (this.location) {
      case "left":
        locY -= rect.height / 2;
        break;
      case "right":
        locX -= rect.width;
        locY -= rect.height / 2;
        break;
      case "top":
        locX -= rect.width / 2;
        break;
      case "center":
        locY -= rect.height / 2;
        locX -= rect.width / 2;
        break;
      default:
        locX -= rect.width / 2;
        locY -= rect.height;
        break;
    }

    if (this.legendShape === "series") {
      const parentsEl = parents.node() as SVGElement;
      const parentsRect = parentsEl.getBoundingClientRect();
      serieses
        .filter(series => series.shape && series.renderShape)
        .forEach(series => {
          if (series.renderShape) {
            series.renderShape({
              g: root,
              parentsRect,
              locX,
              locY,
              colorDic,
            });
          }
        });
    }

    g.attr("width", rect.width).attr("height", rect.height).attr("transform", `translate(${locX},${locY})`);
  }

  renderLabel(params: IRenderParam) {
    const { series, serieses } = params;
    if (this.text) {
      if (!series) return;
      if (series.renderText) series.renderText(this);
    } else {
      if (!serieses || serieses.length === 0) return;
      serieses.forEach(s => {
        if (s.renderText) s.renderText(this);
      });
    }
  }

  renderTotal(params: IRenderParam) {
    const { series, serieses } = params;
    if (this.text) {
      if (!series) return;
      if (series.renderTotalText) series.renderTotalText(this);
    } else {
      if (!serieses || serieses.length === 0) return;
      serieses.forEach(s => {
        if (s.renderTotalText) s.renderTotalText(this);
      });
    }
  }

  render(params: IRenderParam) {
    if (this.type === "text") {
      this.renderText(params);
    } else if (this.type === "legend") {
      this.renderLegend(params);
    } else if (this.type === "label") {
      this.renderLabel(params);
    } else if (this.type === "total") {
      this.renderTotal(params);
    } else if (this.type === "html") {
      this.renderHTML(params);
    }
  }
}
