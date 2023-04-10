import * as d3 from "d3";
import dayjs from "dayjs";
import { ScaleBand, ScaleLinear, InternMap } from "d3";
import {
  Direction,
  AxisType,
  AxisDataType,
  Aggregation,
  Location,
  INonNullMargin,
  ChartValue,
  IChartTooltipParams,
  IChartTextParams,
} from "../../types";
import ChartData from "../../data/ChartData";
import Series from "./Series";
import { generateGUID } from "../../utils/commonUtil";
import { removeAllClass } from "../../utils/element";
import { getKeyColor } from "../../utils/colorUtil";

export interface IAxisProps {
  name: string;
  type: AxisType;
  direction: Direction;
  location: Location;
  dataType?: AxisDataType;
  aggregation?: Aggregation;
  field?: string;
  caption?: string;
  innerPadding?: number;
  outerPadding?: number;
  fixedMinValue?: number | Date;
  fixedMaxValue?: number | Date;
  showGrid?: boolean;
  showBar?: boolean;
  tickSize?: number;
  tickCount?: number;
  rotateAngle?: number;
  markers?: ChartValue[];
  markerClass?: string;
  visible?: boolean;
  className?: string;
  setLabel?: (params: IChartTextParams) => string;
  setKeyTickValues?: (params: ChartValue[]) => ChartValue[];
  setSeriesTickValues?: (params: Array<Record<string, ChartData>>) => Set<ChartValue>;
  renderCustomTooltip?: (params: ITooltipParams) => string;
}

interface IAxisRenderProps {
  parents: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  idx: number;
  width: number;
  height: number;
  graphWidth: number;
  graphHeight: number;
  margin: INonNullMargin;
  bins: InternMap<ChartValue, Record<string, ChartData>>;
  chartClipId: string;
  transform?: any;
}

export interface ITooltipParams {
  key: ChartValue;
  bins: Record<string, ChartData>;
  colorDic: Record<string, any>;
  serieses: Series[];
  isTooltipReverse: boolean;
  displayText: string;
  setToolTipText: (p: IChartTooltipParams) => string;
}

export interface IMapData {
  key: ChartValue;
  bin: Record<string, ChartData>;
  i: number;
  posX: number;
  posY: number;
  posS: number;
  posE: number;
  line: number;
}

export default class Axis {
  name: string;
  type: AxisType;
  direction: Direction;
  location: Location;
  dataType: AxisDataType;
  aggregation: Aggregation;
  field: string;
  caption?: string;
  innerPadding?: number;
  outerPadding?: number;
  fixedMinValue?: number | Date;
  fixedMaxValue?: number | Date;
  showGrid: boolean;
  showBar: boolean;
  tickSize: number;
  tickCount: number;
  rotateAngle: number;
  markers?: ChartValue[];
  markerClass?: string;
  visible: boolean;
  className: string;
  setLabel?: (params: IChartTextParams) => string;
  setKeyTickValues?: (params: ChartValue[]) => ChartValue[];
  setSeriesTickValues?: (params: Array<Record<string, ChartData>>) => Set<ChartValue>;
  renderCustomTooltip?: (params: ITooltipParams) => string;

  scale: ScaleBand<string> | ScaleLinear<number | Date, number | Date> | null = null;
  clipId: string;
  binSize: number = 1;

  constructor(params: IAxisProps) {
    this.name = params.name;
    this.type = params.type;
    this.direction = params.direction;
    this.location = params.location;
    this.dataType = params.dataType || "string";
    this.aggregation = params.aggregation || "min";
    this.field = params.field || "key";
    this.caption = params.caption;
    this.innerPadding = params.innerPadding;
    this.outerPadding = params.outerPadding;
    this.fixedMinValue = params.fixedMinValue;
    this.fixedMaxValue = params.fixedMaxValue;
    this.showGrid = params.showGrid || false;
    this.showBar = params.showBar ?? true;
    this.tickSize = params.tickSize || 6;
    this.tickCount = params.tickCount || 0;
    this.rotateAngle = params.rotateAngle || 0;
    this.markers = params.markers;
    this.markerClass = params.markerClass;
    this.visible = params.visible ?? true;
    this.className = `moz-axis${params.className ? ` ${params.className}` : ""}`;
    this.setLabel = params.setLabel;
    this.setKeyTickValues = params.setKeyTickValues;
    this.setSeriesTickValues = params.setSeriesTickValues;
    this.renderCustomTooltip = params.renderCustomTooltip;

    this.clipId = generateGUID();
  }

  get displayText() {
    return this.caption || this.name;
  }

  createStringDomain = (params: {
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    axisType: AxisType;
    aggregation?: Aggregation;
  }): string[] => {
    const { bins, axisType, aggregation = "min" } = params;
    if (axisType === "key") {
      return Array.from(bins.keys()).map(bin => String(bin));
    } else {
      const values = Array.from(bins.values());
      const valueSet = this.setSeriesTickValues
        ? this.setSeriesTickValues(values)
        : values.reduce((set: Set<string>, value: Record<string, ChartData>) => {
            Object.keys(value).forEach(key => {
              if (axisType === "series-aggregation") {
                set.add(String(value[key][aggregation].valueData));
              } else if (axisType === "series-aggregation-accumulate") {
                set.add(String(value[key].getAccumulateValue(aggregation)));
              } else {
                value[key].values.forEach(v => set.add(String(v.valueData)));
              }
            });
            return set;
          }, new Set());
      return Array.from(valueSet as Set<string>);
    }
  };

  createNumberDomain = (params: {
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    axisType: AxisType;
    paddingOuter?: number;
    fixedMinValue?: number;
    fixedMaxValue?: number;
    aggregation?: Aggregation;
  }) => {
    const { bins, axisType, fixedMinValue, fixedMaxValue, paddingOuter = 0, aggregation = "min" } = params;
    let minmax: [number, number];
    if (axisType === "key") {
      minmax = d3.extent(Array.from(bins.keys()).map(bin => +bin)) as [number, number];
    } else {
      const values = Array.from(bins.values());
      const valueSet = this.setSeriesTickValues
        ? this.setSeriesTickValues(values)
        : values.reduce((set: Set<number>, value: Record<string, ChartData>) => {
            Object.keys(value).forEach(key => {
              if (axisType === "series-aggregation") {
                set.add(value[key][aggregation].valueData);
              } else if (axisType === "series-aggregation-accumulate") {
                set.add(value[key].getAccumulateValue(aggregation));
              } else if (axisType === "series-aggregation-minmax") {
                set.add(value[key].min.valueData);
                set.add(value[key].max.valueData);
              } else {
                value[key].values.forEach(v => set.add(v.valueData));
              }
            });
            return set;
          }, new Set());
      minmax = d3.extent(valueSet as Set<number>) as [number, number];
    }

    const diff = (minmax[1] - minmax[0]) * paddingOuter;
    minmax[0] -= diff;
    minmax[1] += diff;

    if (Number.isFinite(fixedMinValue)) {
      minmax[0] = fixedMinValue!;
    }
    if (Number.isFinite(fixedMaxValue)) {
      minmax[1] = fixedMaxValue!;
    }
    return minmax;
  };

  createDateDomain = (params: {
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    axisType: AxisType;
    paddingOuter?: number;
    fixedMinValue?: Date;
    fixedMaxValue?: Date;
    aggregation?: Aggregation;
  }) => {
    const { bins, axisType, fixedMinValue, fixedMaxValue, paddingOuter = 0, aggregation = "min" } = params;
    let minmax: [Date, Date];
    if (axisType === "key") {
      minmax = d3.extent(Array.from(bins.keys()).map(bin => dayjs(bin).toDate())) as [Date, Date];
    } else {
      const values = Array.from(bins.values());
      const valueSet = this.setSeriesTickValues
        ? this.setSeriesTickValues(values)
        : values.reduce((set: Set<Date>, value: Record<string, ChartData>) => {
            Object.keys(value).forEach(key => {
              if (axisType === "series-aggregation") {
                set.add(dayjs(value[key][aggregation].valueData).toDate());
              } else if (axisType === "series-aggregation-accumulate") {
                set.add(dayjs(value[key].getAccumulateValue(aggregation)).toDate());
              } else if (axisType === "series-aggregation-minmax") {
                set.add(dayjs(value[key].min.valueData).toDate());
                set.add(dayjs(value[key].max.valueData).toDate());
              } else {
                value[key].values.forEach(v => set.add(dayjs(v.valueData).toDate()));
              }
            });
            return set;
          }, new Set());
      minmax = d3.extent(valueSet as Set<Date>) as [Date, Date];
    }

    const min = dayjs(minmax[0]);
    const max = dayjs(minmax[1]);
    const diff = max.diff(min, "ms") * paddingOuter;
    minmax[0] = dayjs(minmax[0]).subtract(diff, "ms").toDate();
    minmax[1] = dayjs(minmax[1]).add(diff, "ms").toDate();

    if (fixedMinValue && dayjs(fixedMinValue).isValid()) {
      minmax[0] = fixedMinValue;
    }
    if (fixedMaxValue && dayjs(fixedMaxValue).isValid()) {
      minmax[1] = fixedMaxValue;
    }
    return minmax;
  };

  createRange = (params: { direction: Direction; width: number; height: number; margin: INonNullMargin }) => {
    const { direction, width, height, margin } = params;
    return direction === "horizontal" ? [margin.left, width - margin.right] : [height - margin.bottom, margin.top];
  };

  createScaleBand = (params: { range: number[]; domain: string[]; paddingInner?: number; paddingOuter?: number }) => {
    const { range, domain, paddingInner = 0, paddingOuter = 0 } = params;
    return d3.scaleBand().domain(domain).rangeRound(range).paddingInner(paddingInner).paddingOuter(paddingOuter);
  };

  createScaleLinear = (params: { range: number[]; domain: Array<number | Date> }) => {
    const { range, domain } = params;
    return d3.scaleLinear().domain(domain).range(range);
  };

  setScale(params: {
    width: number;
    height: number;
    margin: INonNullMargin;
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    transform?: any;
  }) {
    const { width, height, margin, bins, transform } = params;
    let range = this.createRange({ direction: this.direction, width, height, margin });
    if (this.dataType === "string") {
      if (transform) {
        range = range.map((d: any) => (this.direction === "horizontal" ? transform.applyX(d) : transform.applyY(d)));
      }
      const domain = this.createStringDomain({
        bins,
        axisType: this.type,
        aggregation: this.aggregation,
      });
      this.scale = this.createScaleBand({
        range,
        domain,
        paddingInner: this.innerPadding,
        paddingOuter: this.outerPadding,
      });
    } else {
      let domain: Array<number | Date>;
      if (this.dataType === "Date") {
        domain = this.createDateDomain({
          bins,
          axisType: this.type,
          paddingOuter: this.outerPadding,
          fixedMinValue: this.fixedMinValue as Date,
          fixedMaxValue: this.fixedMaxValue as Date,
          aggregation: this.aggregation,
        });
      } else {
        domain = this.createNumberDomain({
          bins,
          axisType: this.type,
          paddingOuter: this.outerPadding,
          fixedMinValue: this.fixedMinValue as number,
          fixedMaxValue: this.fixedMaxValue as number,
          aggregation: this.aggregation,
        });
      }
      this.scale = this.createScaleLinear({
        range,
        domain,
      });
      if (this.direction === "horizontal") {
        this.scale = transform ? transform.rescaleX(this.scale).interpolate(d3.interpolateRound) : this.scale;
      } else {
        this.scale = transform ? transform.rescaleY(this.scale).interpolate(d3.interpolateRound) : this.scale;
      }
    }
  }

  setBinSize(params: {
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    graphWidth: number;
    graphHeight: number;
    margin: INonNullMargin;
  }) {
    const { bins, graphWidth, graphHeight, margin } = params;

    const binsArr = Array.from(bins);
    const scale = this.scale ? this.scale : (temp: any) => 0;
    const vertical = this.direction === "vertical";
    const graphSize = vertical ? graphHeight : graphWidth;
    const graphPadding = (() => {
      if (!this.outerPadding) return 0;
      const graphMargin = vertical ? margin.top : margin.left;
      const bin = vertical ? binsArr[binsArr.length - 1] : binsArr[0];
      if (!bin) return 0;
      const keyValue = bin[0];
      const firstScale = scale(keyValue) as number;
      if (!firstScale) return 0;
      return (firstScale - graphMargin) * 2;
    })();

    if (binsArr.length === 0) return;

    this.binSize = (graphSize - graphPadding) / binsArr.length;
  }

  renderClipPath(params: {
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
    width: number;
    height: number;
    margin: INonNullMargin;
    graphWidth: number;
    graphHeight: number;
  }) {
    const { defs, width, height, margin, graphWidth, graphHeight } = params;
    let x;
    let y;
    let h;
    let w;
    switch (this.location) {
      case "top":
        x = margin.left;
        y = 0;
        h = height - margin.bottom;
        w = graphWidth;
        break;
      case "right":
        x = margin.left;
        y = margin.top;
        h = graphHeight;
        w = width - margin.left;
        break;
      case "bottom":
        x = margin.left;
        y = margin.top;
        h = height - margin.top;
        w = graphWidth;
        break;
      default:
        x = 0;
        y = margin.top;
        h = graphHeight;
        w = width - margin.left;
        break;
    }
    defs
      .append("svg:clipPath")
      .attr("id", this.clipId)
      .append("svg:rect")
      .attr("x", x)
      .attr("y", y)
      .attr("height", h)
      .attr("width", w);
  }

  renderDefaultTooltip(params: ITooltipParams) {
    const { key, bins, colorDic, serieses, displayText, setToolTipText: func, isTooltipReverse } = params;

    let html = "<div class='title'>";
    html += `<span class="label">${func({
      type: "key",
      key: "",
      text: displayText,
    })}</span>: ${func({
      type: "value",
      key: this.name,
      text: key,
    })}`;
    html += "</div><br>";

    const serieseArr = isTooltipReverse ? serieses.slice().reverse() : serieses;
    serieseArr.forEach((series, i) => {
      const bin = bins[series.field];
      if (!bin) return;
      html += "<div style='display: flex; align-items: center;'>";
      html += `<span class="dot" style="background-color:${getKeyColor(series.key, {
        colorHash: colorDic,
      })}"></span>`;
      html += `<span class="label">${func({
        type: "key",
        key,
        text: series.displayText,
      })}</span>: ${func({
        type: "value",
        key: series.field,
        text: series.totalValue || bin[series.aggregation!].valueData,
      })}`;
      html += "</div>";
    });

    return html;
  }

  renderTooltip(params: {
    parents: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    width: number;
    height: number;
    graphWidth: number;
    graphHeight: number;
    margin: INonNullMargin;
    bins: InternMap<ChartValue, Record<string, ChartData>>;
    colorDic: Record<string, any>;
    serieses: Series[];
    isTooltipLine: boolean;
    isTooltipReverse: boolean;
    setToolTipText: (p: IChartTooltipParams) => string;
    onClickItem?: (data: IMapData, event: MouseEvent) => void;
    onDblClickItem?: (data: IMapData, event: MouseEvent) => void;
    onContextMenuItem?: (data: IMapData, event: MouseEvent) => void;
  }) {
    const {
      parents,
      graphHeight,
      graphWidth,
      margin,
      bins,
      colorDic,
      serieses,
      isTooltipLine,
      isTooltipReverse,
      setToolTipText,
      onClickItem,
      onDblClickItem,
      onContextMenuItem,
    } = params;

    const binsArr = Array.from(bins);
    const scale = this.scale ? this.scale : (temp: any) => 0;
    const g = parents.append("g");
    const svgEl = parents.node() as SVGElement;
    const rect = svgEl.getBoundingClientRect();
    const vertical = this.direction === "vertical";
    const arrowSize = 10;
    const isStr = this.dataType === "string";
    const dataMap: IMapData[] = binsArr.map((bin, i) => {
      return {
        key: bin[0],
        bin: bin[1],
        i,
        posX: vertical
          ? rect.left + margin.left + arrowSize + graphWidth / 2
          : rect.left + (scale(bin[0] as any) as number) + arrowSize + (isStr ? this.binSize / 2 : 0),
        posY: vertical
          ? rect.top + (scale(bin[0] as any) as number) + (isStr ? this.binSize / 2 : 0)
          : rect.top + margin.top + graphHeight / 2,
        line: vertical
          ? (scale(bin[0] as any) as number) + (isStr ? this.binSize / 2 : 0)
          : (scale(bin[0] as any) as number) + (isStr ? this.binSize / 2 : 0),
        posS:
          (vertical ? (scale(bin[0] as any) as number) : (scale(bin[0] as any) as number) - this.binSize) -
          (isStr ? 0 : this.binSize / 2),
        posE:
          (vertical
            ? (scale(bin[0] as any) as number) + this.binSize + this.binSize
            : (scale(bin[0] as any) as number) + this.binSize) - (isStr ? 0 : this.binSize / 2),
      };
    });
    const findData = (offsetX: number, offsetY: number) => {
      return dataMap.find(g => {
        if (vertical) {
          return g.posS <= offsetY && g.posE > offsetY;
        } else {
          return g.posS <= offsetX && g.posE > offsetX;
        }
      });
    };
    const createToolTip = (evt: MouseEvent) => {
      const { offsetX, offsetY } = evt;
      const d = findData(offsetX, offsetY);
      if (d) {
        removeAllClass("tooltip");
        removeAllClass("moz-chart-tooltip-line");

        if (isTooltipLine) {
          const line = g.append("line").attr("class", "moz-chart-tooltip-line");
          if (vertical) {
            line
              .attr("x1", margin.left)
              .attr("x2", margin.left + graphWidth)
              .attr("y1", d.line - 0.5)
              .attr("y2", d.line + 0.5);
          } else {
            line
              .attr("y1", margin.top)
              .attr("y2", margin.top + graphHeight)
              .attr("x1", d.line - 0.5)
              .attr("x2", d.line + 0.5);
          }
        }

        const body = d3.select("body");
        const div = body.append("div").attr("class", "tooltip");
        if (this.renderCustomTooltip) {
          div.attr("id", "tooltip").html(
            this.renderCustomTooltip({
              key: d.key,
              bins: d.bin,
              colorDic,
              serieses,
              isTooltipReverse,
              displayText: this.displayText,
              setToolTipText,
            }),
          );
        } else {
          div.attr("id", "tooltip").html(
            this.renderDefaultTooltip({
              key: d.key,
              bins: d.bin,
              colorDic,
              serieses,
              isTooltipReverse,
              displayText: this.displayText,
              setToolTipText,
            }),
          );
        }
        const tooltip = document.getElementById("tooltip");
        let lrText = "left";
        let tbText = "top";
        let moveLRSize = 0;
        let moveTBSize = 0;
        if (tooltip) {
          if (rect.left + graphWidth < d.posX + tooltip.offsetWidth) {
            lrText = "right";
            moveLRSize = arrowSize * 2 + tooltip.offsetWidth;
          }
          if (rect.top + graphHeight < d.posY + tooltip.offsetHeight) {
            tbText = "bottom";
            moveTBSize = tooltip.offsetHeight;
          }
        }
        div
          .attr("class", `tooltip tooltip-${tbText}-${lrText}`)
          .style("top", `${d.posY - moveTBSize}px`)
          .style("left", `${d.posX - moveLRSize}px`);
      }
    };

    const removeToolTip = () => {
      const tooltipEls = d3.selectAll(".tooltip");
      const tooltipLineEls = d3.selectAll(".moz-chart-tooltip-line");

      tooltipEls.each(() => {
        tooltipEls.remove();
      });

      tooltipLineEls.each(() => {
        tooltipLineEls.remove();
      });
    };

    const mouseover = (event: MouseEvent) => {
      createToolTip(event);
    };

    const mousemove = (event: MouseEvent) => {
      removeToolTip();
      createToolTip(event);
    };

    const mouseout = () => {
      removeToolTip();
    };

    const onClick = (evt: MouseEvent) => {
      const { offsetX, offsetY } = evt;
      const d = findData(offsetX, offsetY);
      if (d && onClickItem) {
        onClickItem(d, evt);
      }
    };

    const onDblClick = (evt: MouseEvent) => {
      const { offsetX, offsetY } = evt;
      const d = findData(offsetX, offsetY);
      if (d && onDblClickItem) {
        onDblClickItem(d, evt);
      }
    };

    const onContextMenu = (evt: MouseEvent) => {
      const { offsetX, offsetY } = evt;
      const d = findData(offsetX, offsetY);
      if (d && onContextMenuItem) {
        onContextMenuItem(d, evt);
      }
    };

    g.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", graphWidth)
      .attr("height", graphHeight)
      .style("fill", "#fff")
      .style("opacity", 0)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
      .on("click", onClick)
      .on("dblclick", onDblClick)
      .on("contextmenu", onContextMenu);
  }

  renderMaker(params: IAxisRenderProps) {
    const { parents, graphWidth, graphHeight, margin, chartClipId } = params;
    if (!this.scale) return;
    if (!this.markers) return;

    const scaleFunc = this.scale;
    const className = this.markerClass ? `moz-axis-marker-line ${this.markerClass}` : "moz-axis-marker-line";

    const g = parents.append("g").attr("clip-path", `url(#${chartClipId})`);
    const line = g.selectAll("moz-axis-marker-line").data(this.markers).join("line").attr("class", className);

    if (this.direction === "horizontal") {
      line
        .attr("y1", margin.top)
        .attr("y2", margin.top + graphHeight)
        .attr("x1", d => (scaleFunc(d as any) as any) - 0.5)
        .attr("x2", d => (scaleFunc(d as any) as any) + 0.5);
    } else {
      line
        .attr("x1", margin.left)
        .attr("x2", margin.left + graphWidth)
        .attr("y1", d => (scaleFunc(d as any) as any) - 0.5)
        .attr("y2", d => (scaleFunc(d as any) as any) + 0.5);
    }
  }

  render(params: IAxisRenderProps) {
    const { parents, idx, width, height, graphWidth, graphHeight, margin, bins, transform } = params;
    this.setScale({ width, height, margin, bins, transform });
    if (!this.scale) return;
    this.setBinSize({ bins, graphWidth, graphHeight, margin });
    if (!this.visible) return;

    const g =
      this.dataType === "string"
        ? parents.append("g").attr("clip-path", `url(#${this.clipId})`).append("g")
        : parents.append("g").append("g");
    const graphSize = this.direction === "horizontal" ? graphWidth : graphHeight;
    let call: d3.Axis<any>;
    let translate: string = "";
    let gridEnd: number = 0;

    if (this.location === "top") {
      call = d3.axisTop(this.scale as any);
      translate = `translate(0,${margin.top})`;
      gridEnd = graphHeight;
    } else if (this.location === "right") {
      call = d3.axisRight(this.scale as any);
      translate = `translate(${width - margin.right},0)`;
      gridEnd = -graphWidth;
    } else if (this.location === "bottom") {
      call = d3.axisBottom(this.scale as any);
      translate = `translate(0,${height - margin.bottom})`;
      gridEnd = -graphHeight;
    } else {
      call = d3.axisLeft(this.scale as any);
      translate = `translate(${margin.left},0)`;
      gridEnd = graphWidth;
    }

    if (this.type === "key") {
      const tickValues = Array.from(bins).map(d => d[0]);
      if (this.setKeyTickValues) {
        call.tickValues(this.setKeyTickValues(tickValues));
      } else {
        call = call.tickValues(tickValues);
      }
    } else {
      let ticks = this.tickCount || 0;
      if (ticks <= 0) {
        ticks = Math.floor(graphSize / 50);
      }
      call = call.ticks(ticks);
    }

    call = call.tickSize(this.showGrid ? -graphSize : this.tickSize);

    const axis = g.call(
      s =>
        s
          .attr("transform", translate)
          .attr("class", this.className)
          .call(call)
          .call((tg: any) => {
            tg.selectAll("text").attr("class", `moz-axis-text moz-axis-${this.location}-text`);
            tg.selectAll("line").attr("class", "moz-axis-line");
            tg.selectAll("path").attr("class", "moz-axis-path");
          }),
      this.scale,
    );

    if (this.showGrid) {
      axis
        .selectAll("line")
        .attr("class", "moz-axis-grid")
        .attr(this.direction === "horizontal" ? "y2" : "x2", gridEnd);
      axis.selectAll("path").remove();
      axis
        .append("path")
        .attr(
          "d",
          this.direction === "horizontal"
            ? `M${margin.left - this.tickSize},0H${width - margin.right}`
            : `M0,${margin.top}V${height - margin.bottom + this.tickSize}`,
        )
        .attr("class", "moz-axis-path");
    }

    if (!this.showBar) {
      axis.selectAll("path").remove();
    }

    if (this.rotateAngle > 0) {
      axis
        .selectAll("text")
        .attr("transform", `rotate(${this.rotateAngle})`)
        .attr("class", "moz-axis-text moz-axis-text-rotate")
        .style("text-anchor", this.location === "bottom" || this.location === "right" ? "start" : "end");
    }

    if (this.setLabel) {
      axis.selectAll("text").text(((d: ChartValue) => {
        if (!this.setLabel) return d;
        return this.setLabel({ value: d });
      }) as any);
    }

    if (this.markers) {
      this.renderMaker(params);
    }
  }
}
