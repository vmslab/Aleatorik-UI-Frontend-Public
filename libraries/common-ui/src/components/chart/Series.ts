import * as d3 from "d3";
import { ScaleBand, ScaleLinear, InternMap } from "d3";
import {
  SeriesType,
  INonNullMargin,
  Aggregation,
  ColorStandard,
  Direction,
  Location,
  AxisDataType,
  ChartValue,
  IChartValue,
  IChartTooltipParams,
} from "../../types";
import ChartData from "../../data/ChartData";
import { getTextColor, getKeyColor, getLightKeyColor, getContrastKeyColor } from "../../utils/colorUtil";
import dedent from "../../utils/dedent";
import { tooltipMouseOver, tooltipMouseOut } from "../../utils/chartUtil";
import Text from "./Text";

export interface IBoxPlotTooltipLabels {
  [key: string]: any;
  min?: string;
  q1?: string;
  median?: string;
  q3?: string;
  max?: string;
  count?: string;
}

export interface ISeriesProps {
  field: string;
  keyAxis?: string;
  seriesAxis?: string;
  type?: SeriesType;
  caption?: string;
  opacity?: number;
  colorStandard?: ColorStandard;
  barMaxSize?: number;
  barInnerPadding?: number;
  lineCircle?: boolean;
  lineInnerCircle?: boolean;
  lineDashArray?: string;
  curved?: boolean;
  onlySeries?: boolean;
  boxPlotTooltipLabel?: IBoxPlotTooltipLabels;
  areaAffectedPrev?: boolean;
  areaPadding?: number;
  areaSize?: number;
  aggregation?: Aggregation;
  totalAggregation?: Aggregation;
  visible?: boolean;
  className?: string;
}

interface IPathData {
  key: ChartValue;
  value: number;
  end?: number;
}

interface IRenderParam {
  parents: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  scaleKey: ScaleBand<string> | ScaleLinear<number | Date, number | Date>;
  scaleSeries: ScaleBand<string> | ScaleLinear<number | Date, number | Date>;
  binSize: number;
  width: number;
  height: number;
  graphWidth: number;
  graphHeight: number;
  margin: INonNullMargin;
  direction: Direction;
  location: Location;
  dataType: AxisDataType;
  aggregation: Aggregation;
  bins: InternMap<ChartValue, Record<string, ChartData>>;
  circlePadding: number;
  showZero: boolean;
  showScatter: boolean;
  showOutlier: boolean;
  isAccumulate: boolean;
  colorDic: Record<string, any>;
  barLen: number;
  boxLen: number;
  clipId: string;
  serieses: Series[];
  isTotal?: boolean;
  idx: number;
  setToolTipText: (params: IChartTooltipParams) => string;
}

interface IRenderTextParam extends IRenderParam {
  g: d3.Selection<SVGGElement, [ChartValue, Record<string, ChartData>] | IPathData, null, undefined>;
  data?: any;
  xFunc: (d: any) => number;
  yFunc: (d: any) => number;
  wFunc?: (d: any) => number;
  hFunc?: (d: any) => number;
}

interface IRenderShapeParam {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  parentsRect: DOMRect;
  locX: number;
  locY: number;
  colorDic: Record<string, any>;
}

export default class Series {
  field: string;
  keyAxis: string;
  seriesAxis: string;
  type: SeriesType;
  caption?: string;
  opacity: number;
  colorStandard: ColorStandard;
  barMaxSize: number;
  barInnerPadding: number;
  lineCircle: boolean;
  lineInnerCircle: boolean;
  lineDashArray?: string;
  curved: boolean;
  onlySeries: boolean;
  boxPlotTooltipLabel: IBoxPlotTooltipLabels;
  areaAffectedPrev: boolean;
  areaPadding: number;
  areaSize?: number;
  aggregation?: Aggregation;
  totalAggregation: Aggregation;

  visible: boolean;
  className: string;

  id: string = "";
  shape?: d3.Selection<HTMLSpanElement, unknown, null, undefined>;
  renderShape?: (params: IRenderShapeParam) => void;
  renderText?: (params: Text) => void;
  renderTotalText?: (params: Text) => void;
  totalValue?: ChartValue;

  constructor(params: ISeriesProps) {
    this.field = params.field;
    this.keyAxis = params.keyAxis || "";
    this.seriesAxis = params.seriesAxis || "";
    this.type = params.type || "bar";
    this.caption = params.caption;
    this.opacity = params.opacity || 1;
    this.colorStandard = params.colorStandard || "series";
    this.barMaxSize = params.barMaxSize || 60;
    this.barInnerPadding = params.barInnerPadding || 0;
    this.lineCircle = params.lineCircle ?? true;
    this.lineInnerCircle = params.lineInnerCircle ?? true;
    this.lineDashArray = params.lineDashArray;
    this.curved = params.curved || false;
    this.onlySeries = params.onlySeries || false;
    this.boxPlotTooltipLabel = {
      min: "Minimum IQR",
      q1: "Q1 (25%)",
      median: "Q2 (Median)",
      q3: "Q3 (75%)",
      max: "Maximum IQR",
      count: "Number of Items.",
    };
    this.areaAffectedPrev = params.areaAffectedPrev || false;
    this.areaPadding = params.areaPadding ?? 30;
    this.areaSize = params.areaSize;
    this.aggregation = params.aggregation;
    this.totalAggregation = params.totalAggregation || "avg";
    Object.keys(this.boxPlotTooltipLabel).forEach(key => {
      if (!params.boxPlotTooltipLabel) return;
      this.boxPlotTooltipLabel[key] = params.boxPlotTooltipLabel[key] || this.boxPlotTooltipLabel[key];
    });
    this.visible = params.visible ?? true;
    this.className = `moz-series${params.className ? ` ${params.className}` : ""}`;
  }

  get key() {
    return this.id;
  }

  get displayText() {
    return this.caption || this.field;
  }

  bandWidth(scaleKey: any, def: number = 1) {
    return scaleKey.bandwidth ? scaleKey.bandwidth() : def;
  }

  getColorKey(colorStandard: "series" | "axis" | "one", seriesKey: string, axisKey: string, oneKey: string = "a") {
    switch (colorStandard) {
      case "series":
        return seriesKey;
      case "axis":
        return axisKey;
      default:
        return oneKey;
    }
  }

  renderBarShape(params: IRenderShapeParam) {
    const { g, parentsRect, locX, locY, colorDic } = params;

    if (!this.shape) return;

    const element = this.shape.node() as HTMLElement;
    const rect = element.getBoundingClientRect();

    g.append("line")
      .attr("x1", rect.x - parentsRect.x)
      .attr("y1", rect.y - parentsRect.y + rect.height / 2)
      .attr("x2", rect.x - parentsRect.x + rect.width)
      .attr("y2", rect.y - parentsRect.y + rect.height / 2)
      .attr("transform", `translate(${locX},${locY})`)
      .style("stroke-width", rect.height)
      .style("stroke", getKeyColor(this.key, { colorHash: colorDic }))
      .style("stroke-opacity", this.opacity);
  }

  renderLineShape(params: IRenderShapeParam) {
    const { g, parentsRect, locX, locY, colorDic } = params;

    if (!this.shape) return;

    const element = this.shape.node() as HTMLElement;
    const rect = element.getBoundingClientRect();

    const line = g
      .append("line")
      .attr("class", "moz-text-legend-line")
      .attr("x1", rect.x - parentsRect.x)
      .attr("y1", rect.y - parentsRect.y + rect.height / 2)
      .attr("x2", rect.x - parentsRect.x + rect.width)
      .attr("y2", rect.y - parentsRect.y + rect.height / 2)
      .attr("transform", `translate(${locX},${locY})`)
      .style("stroke", getKeyColor(this.key, { colorHash: colorDic }))
      .style("stroke-opacity", this.opacity);

    if (this.lineDashArray) {
      line.style("stroke-dasharray", this.lineDashArray);
    }

    if (this.lineCircle) {
      g.append("circle")
        .attr("cx", rect.x - parentsRect.x + rect.width / 2)
        .attr("cy", rect.y - parentsRect.y + rect.height / 2)
        .attr("r", rect.height / 2)
        .attr("transform", `translate(${locX},${locY})`)
        .style("fill", getKeyColor(this.key, { colorHash: colorDic }))
        .style("fill-opacity", this.opacity);

      if (this.lineInnerCircle) {
        g.append("circle")
          .attr("class", "moz-text-legend-inner-circle")
          .attr("cx", rect.x - parentsRect.x + rect.width / 2)
          .attr("cy", rect.y - parentsRect.y + rect.height / 2)
          .attr("r", rect.height / 4)
          .attr("transform", `translate(${locX},${locY})`)
          .style("fill-opacity", this.opacity);
      }
    }
  }

  renderAreaShape(params: IRenderShapeParam) {
    const { g, parentsRect, locX, locY, colorDic } = params;

    if (!this.shape) return;

    const element = this.shape.node() as HTMLElement;
    const rect = element.getBoundingClientRect();

    const posX1 = rect.x - parentsRect.x;
    const posX2 = posX1 + rect.width / 2;
    const posX3 = posX1 + rect.width;
    const posY1 = rect.y - parentsRect.y;
    const posY2 = posY1 + rect.height / 2;
    const posY3 = posY1 + rect.height / 3;
    const posY4 = posY1 + rect.height;
    g.append("path")
      .attr("d", `M${posX1},${posY4}V${posY3}L${posX2},${posY2}L${posX3},${posY1}V${posY4}Z`)
      .attr("transform", `translate(${locX},${locY})`)
      .style("fill", getKeyColor(this.key, { colorHash: colorDic }))
      .style("opacity", this.opacity);
  }

  renderBoxPlotShape(params: IRenderShapeParam) {
    const { g, parentsRect, locX, locY, colorDic } = params;

    if (!this.shape) return;

    const element = this.shape.node() as HTMLElement;
    const rect = element.getBoundingClientRect();

    const posX1 = rect.x - parentsRect.x;
    const posX2 = posX1 + rect.width;
    const posY1 = rect.y - parentsRect.y;
    const posY2 = posY1 + rect.height / 2;
    const posY3 = posY1 + rect.height;
    g.append("path")
      .attr("d", `M${posX1},${posY1}V${posY3}M${posX1},${posY2}H${posX2}M${posX2},${posY1}V${posY3}`)
      .attr("transform", `translate(${locX},${locY})`)
      .style("stroke", getKeyColor(this.key, { colorHash: colorDic }))
      .style("stroke-opacity", this.opacity);
    g.append("line")
      .attr("x1", posX1 + rect.width / 4)
      .attr("y1", posY2)
      .attr("x2", posX1 + (rect.width / 4) * 3)
      .attr("y2", posY2)
      .attr("transform", `translate(${locX},${locY})`)
      .style("stroke-width", rect.height)
      .style("stroke", getKeyColor(this.key, { colorHash: colorDic }))
      .style("stroke-opacity", this.opacity);
  }

  renderPieShape(params: IRenderShapeParam) {
    const { g, parentsRect, locX, locY, colorDic } = params;

    if (!this.shape) return;

    const element = this.shape.node() as HTMLElement;
    const rect = element.getBoundingClientRect();

    const posX = rect.x - parentsRect.x;
    const posY1 = rect.y - parentsRect.y;
    const posY2 = posY1 + rect.height;
    g.append("path")
      .attr("d", `M${posX},${posY1}Q${posX + rect.width},${posY1},${posX + rect.width},${posY2}L${posX},${posY2}Z`)
      .attr("transform", `translate(${locX},${locY})`)
      .style("fill", getKeyColor(this.key, { colorHash: colorDic }))
      .style("fill-opacity", this.opacity);
  }

  renderBarText(params: IRenderTextParam) {
    const {
      g,
      showZero,
      aggregation,
      direction,
      colorDic,
      isAccumulate,
      xFunc,
      yFunc,
      wFunc = () => 0,
      hFunc = () => 0,
    } = params;
    this.renderText = (textParams: Text) => {
      // 함수는 this binding 이 풀리는 문제가 있어 직접 호출로 사용
      // ex) textParams.setText()
      const { size, color, angle } = textParams;
      const text = g
        .filter((d: any) => showZero || d[1][this.field][aggregation].valueData !== 0)
        .append("text")
        .attr("class", "moz-series-text")
        .text((d: any) => textParams.setText({ value: d[1][this.field][aggregation].valueData }))
        .attr("data-key", (d: any) => d[0])
        .attr("data-series", this.field)
        .attr("data-value", (d: any) => {
          if (isAccumulate) {
            return d[1][this.field].getAccumulateValue(aggregation);
          } else {
            return d[1][this.field][aggregation].valueData;
          }
        })
        .style("fill", (d: any) =>
          getTextColor(
            getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
              colorHash: colorDic,
            }),
          ),
        );
      if (size) {
        text.style("font-size", size);
      }
      if (color) {
        text.style("fill", color);
      }
      const textEl = text.node() as SVGElement;
      // showZero에서 filter하면 text가 그려지지 않기 때문에 text element가 null일 수 있음.
      if (!textEl) return;
      const textRect = textEl.getBoundingClientRect();
      text.attr("transform", d => {
        const x = xFunc(d);
        const y = yFunc(d);
        const w = wFunc(d);
        const h = hFunc(d);
        const { locX, locY } = textParams.getBarLocation({
          x,
          y,
          width: w,
          height: h,
          direction,
          rect: textRect,
        });
        let transform = "";
        if (angle) {
          transform = `translate(${locX},${locY}),rotate(${angle})`;
        } else {
          transform = `translate(${locX},${locY})`;
        }
        return transform;
      });
    };
  }

  renderBarTotalText(params: IRenderTextParam) {
    const { g, aggregation, location, colorDic, xFunc, yFunc, wFunc = () => 0, hFunc = () => 0 } = params;
    this.renderTotalText = (textParams: Text) => {
      // 함수는 this binding 이 풀리는 문제가 있어 직접 호출로 사용
      // ex) textParams.setText()
      const { size, color, angle } = textParams;
      const text = g
        .append("text")
        .attr("class", "moz-accumulated-text")
        .text((d: any) => textParams.setText({ value: d[1][this.field].getTotalValue(aggregation) }))
        .attr("data-key", (d: any) => d[0])
        .attr("data-series", this.field)
        .attr("data-value", (d: any) => d[1][this.field].getTotalValue(aggregation))
        .style("fill", (d: any) =>
          getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
            colorHash: colorDic,
          }),
        );
      if (size) {
        text.style("font-size", size);
      }
      if (color) {
        text.style("fill", color);
      }
      const textEl = text.node() as SVGElement;
      // showZero에서 filter하면 text가 그려지지 않기 때문에 text element가 null일 수 있음.
      if (!textEl) return;
      const textRect = textEl.getBoundingClientRect();
      text.attr("transform", d => {
        const x = xFunc(d);
        const y = yFunc(d);
        const w = wFunc(d);
        const h = hFunc(d);
        const { locX, locY } = textParams.getBarTotalLocation({
          x,
          y,
          width: w,
          height: h,
          location,
          rect: textRect,
        });
        let transform = "";
        if (angle) {
          transform = `translate(${locX},${locY}),rotate(${angle})`;
        } else {
          transform = `translate(${locX},${locY})`;
        }
        return transform;
      });
    };
  }

  renderLineText(params: IRenderTextParam) {
    const { g, data, direction, colorDic, xFunc, yFunc } = params;

    this.renderText = (textParams: Text) => {
      // 함수는 this binding 이 풀리는 문제가 있어 직접 호출로 사용
      // ex) textParams.setText()
      const { size, color, angle } = textParams;

      const tg = g.selectAll("moz-series-text").append("g").data(data).join("text").attr("class", "moz-series-text");

      const text = tg
        .text(((d: IPathData) => textParams.setText({ value: d.value })) as any)
        .attr("data-key", ((d: IPathData) => d.key) as any)
        .attr("data-series", this.field)
        .attr("data-value", ((d: IPathData) => d.value) as any)
        .style("fill", getKeyColor(this.key, { colorHash: colorDic }));
      if (size) {
        text.style("font-size", size);
      }
      if (color) {
        text.style("fill", color);
      }
      const textEl = text.node() as SVGElement;
      // showZero에서 filter하면 text가 그려지지 않기 때문에 text element가 null일 수 있음.
      if (!textEl) return;
      const textRect = textEl.getBoundingClientRect();
      text.attr("transform", d => {
        const x = xFunc(d);
        const y = yFunc(d);
        const { locX, locY } = textParams.getLineLocation({ x, y, direction, rect: textRect });
        let transform = "";
        if (angle) {
          transform = `translate(${locX},${locY}),rotate(${angle})`;
        } else {
          transform = `translate(${locX},${locY})`;
        }
        return transform;
      });
    };
  }

  renderBar(params: IRenderParam) {
    const {
      parents,
      scaleKey,
      scaleSeries,
      binSize,
      height,
      graphHeight,
      graphWidth,
      margin,
      direction,
      dataType,
      aggregation,
      bins,
      showZero,
      colorDic,
      barLen,
      clipId,
      idx,
    } = params;
    const bw = Math.min(this.bandWidth(scaleKey, binSize), this.barMaxSize);
    const sbw = bw / barLen;
    const center = this.bandWidth(scaleKey) / 2 - bw / 2 + sbw * idx + sbw / 2;
    const g = parents
      .append("g")
      .attr("clip-path", `url(#${clipId})`)
      .selectAll("g")
      .data(bins)
      .join("g")
      .attr("class", this.className);
    const bar = g
      .filter(d => showZero || d[1][this.field][aggregation].valueData !== 0)
      .append("rect")
      .attr("class", "moz-series-rect")
      .style("fill", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      )
      .style("opacity", this.opacity);

    let xFunc;
    let yFunc;
    let wFunc;
    let hFunc;
    if (direction === "vertical") {
      xFunc = (d: any) => {
        return (scaleKey(d[0] as any) as number) + center - (sbw - this.barInnerPadding) / 2;
      };
      yFunc = (d: any) => scaleSeries(d[1][this.field][aggregation].valueData as any) as number;
      wFunc = () => sbw - this.barInnerPadding;
      hFunc = (d: any) =>
        height - margin.bottom - (scaleSeries(d[1][this.field][aggregation].valueData as any) as number);
    } else {
      xFunc = () => margin.left;
      yFunc = (d: any) => (scaleKey(d[0] as any) as number) + center - (sbw - this.barInnerPadding) / 2;
      wFunc = (d: any) => (scaleSeries(d[1][this.field][aggregation].valueData as any) as number) - margin.left;
      hFunc = () => sbw - this.barInnerPadding;
    }
    bar.attr("x", xFunc).attr("y", yFunc).attr("width", wFunc).attr("height", hFunc);

    this.renderBarText({ ...params, g: g as any, xFunc, yFunc, wFunc, hFunc });

    this.renderBarTotalText({ ...params, g: g as any, xFunc, yFunc, wFunc, hFunc });

    this.renderShape = this.renderBarShape;
  }

  renderStackBar(params: IRenderParam) {
    const {
      parents,
      scaleKey,
      scaleSeries,
      binSize,
      graphHeight,
      graphWidth,
      direction,
      dataType,
      aggregation,
      bins,
      showZero,
      isAccumulate,
      colorDic,
      clipId,
    } = params;
    const bw = Math.min(this.bandWidth(scaleKey, binSize), this.barMaxSize);
    const center = this.bandWidth(scaleKey) / 2;
    const g = parents
      .append("g")
      .attr("clip-path", `url(#${clipId})`)
      .selectAll("g")
      .data(bins)
      .join("g")
      .attr("class", this.className);
    const bar = g
      .filter(d => showZero || d[1][this.field][aggregation].valueData !== 0)
      .append("rect")
      .attr("class", "moz-series-rect")
      .style("fill", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      )
      .attr("opacity", this.opacity);

    let xFunc;
    let yFunc;
    let wFunc;
    let hFunc;
    if (direction === "vertical") {
      xFunc = (d: any) => (scaleKey(d[0] as any) as number) + center - bw / 2;
      yFunc = (d: any) => {
        if (isAccumulate) {
          return scaleSeries(d[1][this.field].getAccumulateValue(aggregation) as any) as number;
        } else {
          return scaleSeries(d[1][this.field][aggregation].valueData as any) as number;
        }
      };
      wFunc = () => bw;
      hFunc = (d: any) => {
        if (isAccumulate) {
          const pos = scaleSeries(d[1][this.field].getAccumulateValue(aggregation) as any) as number;
          const prev = scaleSeries(d[1][this.field].getAccumulateValue(aggregation, false) as any) as number;
          return prev - pos;
        } else {
          const pos = scaleSeries(d[1][this.field][aggregation].valueData as any) as number;
          const prev = scaleSeries(d[1][this.field].getPreviousValue(aggregation) as any) as number;
          return prev - pos;
        }
      };
    } else {
      xFunc = (d: any) => {
        if (isAccumulate) {
          return scaleSeries(d[1][this.field].getAccumulateValue(aggregation, false) as any) as number;
        } else {
          return scaleSeries(d[1][this.field].getPreviousValue(aggregation) as any) as number;
        }
      };
      yFunc = (d: any) => (scaleKey(d[0] as any) as number) + center - bw / 2;
      wFunc = (d: any) => {
        if (isAccumulate) {
          const pos = scaleSeries(d[1][this.field].getAccumulateValue(aggregation) as any) as number;
          const prev = scaleSeries(d[1][this.field].getAccumulateValue(aggregation, false) as any) as number;
          return pos - prev;
        } else {
          const pos = scaleSeries(d[1][this.field][aggregation].valueData as any) as number;
          const prev = scaleSeries(d[1][this.field].getPreviousValue(aggregation) as any) as number;
          return pos - prev;
        }
      };
      hFunc = () => bw;
    }
    bar.attr("x", xFunc).attr("y", yFunc).attr("width", wFunc).attr("height", hFunc);

    this.renderBarText({ ...params, g: g as any, xFunc, yFunc, wFunc, hFunc });

    this.renderBarTotalText({ ...params, g: g as any, xFunc, yFunc, wFunc, hFunc });

    this.renderShape = this.renderBarShape;
  }

  renderLine(params: IRenderParam) {
    const { parents, scaleKey, scaleSeries, direction, aggregation, bins, showZero, colorDic, clipId, isTotal } =
      params;

    let data: IPathData[];
    if (isTotal) {
      const total = new ChartData({
        valueField: this.field,
        zScoreFlag: false,
        iqrFlag: false,
        accumulate: [],
        total: [],
        values: Array.from(bins).reduce((result: IChartValue[], g, i: number) => {
          result.push({
            idx: i,
            keyData: g[0],
            valueData: +g[1][this.field][aggregation].valueData,
            valueField: this.field,
          });
          return result;
        }, []),
      });

      this.totalValue = total[this.totalAggregation].valueData;

      data = Array.from(bins).reduce((result: IPathData[], bin) => {
        result.push({
          key: bin[0],
          value: +(this.totalValue || 0),
        });
        return result;
      }, []);
    } else {
      data = Array.from(bins)
        .filter(d => showZero || d[1][this.field][aggregation].valueData !== 0)
        .reduce((result: IPathData[], bin) => {
          result.push({
            key: bin[0],
            value: bin[1][this.field][aggregation].valueData,
          });
          return result;
        }, []);
    }

    const keyFunc = (d: IPathData) => (scaleKey(d.key as any) as number) + this.bandWidth(scaleKey) / 2;
    const seriesFunc = (d: IPathData) => scaleSeries(d.value as any) as number;

    const xFunc = direction === "vertical" ? keyFunc : seriesFunc;
    const yFunc = direction === "vertical" ? seriesFunc : keyFunc;

    let line = d3
      .line()
      .x(xFunc as any)
      .y(yFunc as any);

    if (this.curved) {
      line = line.curve(d3.curveMonotoneX);
    }

    const g = parents.append("g").attr("clip-path", `url(#${clipId})`).append("g").attr("class", this.className);
    const path = g
      .append("path")
      .attr("d", line(data as any))
      .attr("class", "moz-series-line")
      .style("stroke", getKeyColor(this.key, { colorHash: colorDic }))
      .style("stroke-opacity", this.opacity);

    if (this.lineDashArray) {
      path.style("stroke-dasharray", this.lineDashArray);
    }

    if (this.lineCircle) {
      g.append("g")
        .selectAll(".moz-series-line-outer-circle")
        .data(data)
        .join("circle")
        .attr("class", "moz-series-line-outer-circle")
        .attr("cx", xFunc)
        .attr("cy", yFunc)
        .style("fill", getKeyColor(this.key, { colorHash: colorDic }))
        .style("fill-opacity", this.opacity);

      if (this.lineInnerCircle) {
        g.append("g")
          .selectAll(".moz-series-line-inner-circle")
          .data(data)
          .join("circle")
          .attr("class", "moz-series-line-inner-circle")
          .attr("cx", xFunc)
          .attr("cy", yFunc)
          .style("fill-opacity", this.opacity);
      }
    }

    this.renderLineText({ ...params, g: g as any, xFunc, yFunc, data });

    this.renderShape = this.renderLineShape;
  }

  renderArea(params: IRenderParam) {
    const {
      parents,
      scaleKey,
      scaleSeries,
      height,
      margin,
      direction,
      aggregation,
      bins,
      showZero,
      colorDic,
      clipId,
      serieses,
    } = params;

    const data = Array.from(bins)
      .filter(d => showZero || d[1][this.field][aggregation].valueData !== 0)
      .reduce((result: IPathData[], bin) => {
        result.push({
          key: bin[0],
          value: bin[1][this.field][aggregation].valueData,
        });
        return result;
      }, []);

    const keyFunc = (d: IPathData) => (scaleKey(d.key as any) as number) + this.bandWidth(scaleKey) / 2;
    const seriesFunc = (d: IPathData) => scaleSeries(d.value as any) as number;

    const xFunc = direction === "vertical" ? keyFunc : seriesFunc;
    const yFunc = direction === "vertical" ? seriesFunc : keyFunc;
    let y0 = direction === "vertical" ? height - margin.bottom : margin.left;
    const backColor = getKeyColor(this.key, { colorHash: colorDic });

    if (this.areaAffectedPrev) {
      const orders = Array.from(bins)
        .reduce((rootResult, bin) => {
          return serieses.reduce((result, series) => {
            let f = result.find(r => r.key === series.key);
            if (!f) {
              f = { key: series.key, value: y0 };
              result.push(f);
            }
            const loc = seriesFunc({
              key: bin[0],
              value: bin[1][series.field][series.aggregation || aggregation].valueData,
            });
            f.value = direction === "vertical" ? Math.min(f.value, loc) : Math.max(f.value, loc);
            return result;
          }, rootResult);
        }, [] as IPathData[])
        .sort((from, to) => {
          if (direction === "vertical" ? from.value > to.value : from.value < to.value) {
            return -1;
          } else if (direction === "vertical" ? from.value < to.value : from.value > to.value) {
            return 1;
          } else {
            return 0;
          }
        });
      orders.reduce((next: number, order) => {
        order.end = next;
        return order.value - this.areaPadding;
      }, y0);

      y0 = orders.find(o => o.key === this.key)?.end || y0;

      const defs = parents.select("defs");
      const moveGradient = defs
        .append("linearGradient")
        .attr("id", `moveGradient-${this.key}`)
        .attr("x1", "0")
        .attr("y1", "0")
        .attr("x2", "0")
        .attr("y2", "1");

      [
        { opacity: 0.5, offset: 0 },
        { opacity: 0.2, offset: 80 },
        { opacity: 0, offset: 100 },
      ].forEach(item => {
        moveGradient
          .append("stop")
          .attr("stop-color", backColor)
          .attr("stop-opacity", item.opacity)
          .attr("offset", `${item.offset}%`);
      });
    }

    let area = d3
      .area()
      .x(xFunc as any)
      .y0(
        (this.areaSize
          ? (d: any) => {
              const result = yFunc(d) + this.areaSize!;
              if (result > y0) return y0;
              return result;
            }
          : y0) as any,
      )
      .y1(yFunc as any);

    if (this.curved) {
      area = area.curve(d3.curveMonotoneX);
    }

    const g = parents.append("g").attr("clip-path", `url(#${clipId})`).append("g").attr("class", this.className);
    g.append("path")
      .attr("d", (d: any) => area(data as any))
      .attr("class", "moz-series-line")
      .style("fill", this.areaAffectedPrev ? `url(#moveGradient-${this.key})` : backColor)
      .style("opacity", this.opacity);

    this.renderLineText({ ...params, g: g as any, xFunc, yFunc, data });

    this.renderShape = this.renderAreaShape;
  }

  renderBoxPlot(params: IRenderParam) {
    const {
      parents,
      width,
      height,
      graphHeight,
      graphWidth,
      scaleKey,
      scaleSeries,
      binSize,
      direction,
      bins,
      circlePadding,
      showScatter,
      showOutlier,
      colorDic,
      boxLen,
      clipId,
      idx,
      setToolTipText: func,
    } = params;
    const sbw = this.bandWidth(scaleKey, binSize) / boxLen;
    const bw = Math.min(sbw, this.barMaxSize);
    const center = (sbw / 2) * idx + (sbw / 2) * (idx + 1);
    const g = parents
      .append("g")
      .attr("clip-path", `url(#${clipId})`)
      .selectAll("g")
      .data(bins)
      .join("g")
      .attr("class", this.className);
    const vertical = g
      .append("path")
      .attr("class", "moz-series-box-plot-path")
      .attr(
        "d",
        d =>
          `M${(scaleKey(d[0] as any) as number) + center},${scaleSeries(
            d[1][this.field].max.valueData as any,
          )}V${scaleSeries(d[1][this.field].min.valueData as any)}`,
      )
      .attr("stroke", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      );

    const tooltipAll = (d: any) => {
      const value: ChartData = d[1][this.field];
      const backColor = getKeyColor(this.getColorKey(this.colorStandard, this.key, d[0]), {
        colorHash: colorDic,
      });
      return dedent`
          <div style='display: flex; align-items: center;'>
            <span class='dot'></span>
            <span class="label">
              ${func({ type: "key", key: "", text: this.displayText })}
            </span>: ${func({ type: "value", key: this.field, text: d[0] })}
          </div><br>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.min! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.min!,
              text: value.min.valueData,
            })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.q1! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.q1!,
              text: value.quantileOne.valueData,
            })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.median! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.median!,
              text: value.median.valueData,
            })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.q3! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.q3!,
              text: value.quantileThree.valueData,
            })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.max! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.max!,
              text: value.max.valueData,
            })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              ${func({ type: "key", key: this.field, text: this.boxPlotTooltipLabel.count! })}
            </span>: ${func({
              type: "value",
              key: this.boxPlotTooltipLabel.count!,
              text: value.count.valueData,
            })}
          </div>
        `;
    };

    const box = g
      .append("rect")
      .attr("class", "moz-series-rect")
      .attr("x", d => (scaleKey(d[0] as any) as number) + center - bw / 2)
      .attr("y", d => scaleSeries(d[1][this.field].quantileThree.valueData as any) as number)
      .attr("width", bw)
      .attr(
        "height",
        d =>
          (scaleSeries(d[1][this.field].quantileOne.valueData as any) as number) -
          (scaleSeries(d[1][this.field].quantileThree.valueData as any) as number),
      )
      .style("fill", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      )
      .style("opacity", this.opacity)
      .on("mouseover", (event, d) => tooltipMouseOver(width, height, d, "elcenter", false, event, tooltipAll))
      .on("mouseout", () => tooltipMouseOut());

    const median = g
      .append("path")
      .attr("class", "moz-series-box-plot-median")
      .attr(
        "d",
        d =>
          `M${(scaleKey(d[0] as any) as number) + center - bw / 2},${scaleSeries(
            d[1][this.field].median.valueData as any,
          )}h${bw}`,
      );

    const iqrMin = g
      .append("path")
      .attr("class", "moz-series-box-plot-path")
      .attr(
        "d",
        (d: any) =>
          `M${(scaleKey(d[0] as any) as number) + center - bw / 2},${scaleSeries(
            d[1][this.field].min.valueData,
          )}h${bw}`,
      )
      .style("stroke", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      )
      .style("stroke-opacity", this.opacity);

    const iqrMax = g
      .append("path")
      .attr("class", "moz-series-box-plot-path")
      .attr(
        "d",
        (d: any) =>
          `M${(scaleKey(d[0] as any) as number) + center - bw / 2},${scaleSeries(
            d[1][this.field].max.valueData,
          )}h${bw}`,
      )
      .style("stroke", d =>
        getKeyColor(this.getColorKey(this.colorStandard, this.key, String(d[0])), {
          colorHash: colorDic,
        }),
      )
      .style("stroke-opacity", this.opacity);

    if (!showScatter) return;

    const tooltipValue = (d: any) => {
      const backColor = getKeyColor(this.getColorKey(this.colorStandard, this.key, d[0]), {
        colorHash: colorDic,
      });
      return dedent`
          <div style='display: flex; align-items: center;'>
          
            <span class="label">
              ${func({ type: "key", key: "", text: this.displayText })}
            </span>: ${func({ type: "value", key: this.field, text: d.keyData })}
          </div><br>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">${func({ type: "key", key: this.field, text: "Value" })}</span>:
            ${func({ type: "value", key: "Value", text: d.valueData })}
          </div>
        `;
    };

    g.append("g")
      .selectAll("circle")
      .data(d => {
        if (showOutlier) {
          return d[1][this.field].values;
        } else {
          return d[1][this.field].values.filter(v => !v.outlier);
        }
      })
      .join("circle")
      .attr("class", "moz-series-box-plot-circle")
      .attr("cx", d => (scaleKey(d.keyData as any) as number) + center + (Math.random() - 0.5) * circlePadding)
      .attr("cy", d => scaleSeries(d.valueData as any) as number)
      .style("fill", d => {
        if (d.outlier) {
          return "#666";
        } else {
          if (d.highlight) {
            return getContrastKeyColor(this.getColorKey(this.colorStandard, this.key, String(d.keyData)), {
              colorHash: colorDic,
            });
          } else {
            return getLightKeyColor(this.getColorKey(this.colorStandard, this.key, String(d.keyData)));
          }
        }
      })
      .on("mouseover", (event, d) => tooltipMouseOver(width, height, d, "elcenter", false, event, tooltipValue))
      .on("mouseout", () => tooltipMouseOut());

    this.renderShape = this.renderBoxPlotShape;
  }

  render(params: IRenderParam) {
    if (!this.visible) return;

    if (!this.aggregation) {
      this.aggregation = params.aggregation;
    }
    params.aggregation = this.aggregation;

    if (this.type === "bar") {
      this.renderBar(params);
    } else if (this.type === "line") {
      this.renderLine(params);
    } else if (this.type === "box-plot") {
      this.renderBoxPlot(params);
    } else if (this.type === "stack") {
      this.renderStackBar(params);
    } else if (this.type === "area") {
      this.renderArea(params);
    } else if (this.type === "agg-line") {
      params.isTotal = true;
      this.renderLine(params);
    }
  }
}
