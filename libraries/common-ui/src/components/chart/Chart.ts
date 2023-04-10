import * as d3 from "d3";
import { InternMap } from "d3";
import {
  IChartValue,
  IChartData,
  IMargin,
  INonNullMargin,
  Aggregation,
  ChartValue,
  IChartTooltipParams,
  TooltipType,
  CollisionTextType,
} from "../../types";
import ChartData from "../../data/ChartData";
import { isNull, generateGUID } from "../../utils/commonUtil";
import { getKeyColor, getTextColor } from "../../utils/colorUtil";
import { tooltipMouseOver, tooltipMouseOut, numberFormat } from "../../utils/chartUtil";
import { isCollision, isOver } from "../../utils/element";
import dedent from "../../utils/dedent";
import Series from "./Series";
import Axis, { IMapData } from "./Axis";
import Text from "./Text";

export interface IChartProps {
  data: IChartData[];
  margin?: IMargin;
  isZScore?: boolean;
  isIqr?: boolean;
  isZoom?: boolean;
  isTooltip?: boolean;
  isTooltipLine?: boolean;
  isCollisionTextRerender?: boolean;
  isCollisionTextLogic?: boolean;
  isOverTextLogic?: boolean;
  collisionTextPadding?: number;
  collisionTextType?: CollisionTextType;
  circlePadding?: number;
  showZero?: boolean;
  showScatter?: boolean;
  showOutlier?: boolean;
  loading?: boolean;
  loaderRadius?: number;
  noDataMessage?: string;
  colorDic?: Record<string, any>;
  pieAggregation?: Aggregation;
  pieInnerRadius?: number;
  pieOuterRadius?: number;
  pieOpacity?: number;
  pieTooltipType?: TooltipType;
  isTooltipReverse?: boolean;
  delayedTooltip?: number;
  className?: string;
  axises?: Axis[];
  serieses?: Series[];
  pies?: Series[];
  texts?: Text[];
  setToolTipText?: (params: IChartTooltipParams) => string;
  beforeAnalysisData?: (data: IChartData[]) => void;
  afterAnalysisData?: (bins: InternMap<ChartValue, Record<string, ChartData>>) => void;
  onClickItem?: (data: IMapData, event: MouseEvent) => void;
  onDblClickItem?: (data: IMapData, event: MouseEvent) => void;
  onContextMenuItem?: (data: IMapData, event: MouseEvent) => void;
}

interface IChartPropsDetail extends IChartProps {
  parents: HTMLElement;
}

export default class Chart {
  parents: HTMLElement;
  data: IChartData[];
  margin: INonNullMargin;
  isZScore: boolean;
  isIqr: boolean;
  isZoom: boolean;
  isTooltip: boolean;
  isTooltipLine: boolean;
  isCollisionTextRerender: boolean;
  isCollisionTextLogic: boolean;
  isOverTextLogic: boolean;
  collisionTextPadding: number;
  collisionTextType: CollisionTextType;
  circlePadding: number;
  showZero: boolean;
  showScatter: boolean;
  showOutlier: boolean;
  loading: boolean;
  loaderRadius: number;

  noDataMessage: string;
  colorDic: Record<string, any>;
  pieAggregation: Aggregation;
  pieInnerRadius?: number;
  pieOuterRadius?: number;
  pieOpacity: number;
  pieTooltipType: TooltipType;
  isTooltipReverse: boolean;
  delayedTooltip?: number;
  className: string;
  axises: Axis[];
  serieses: Series[];
  pies: Series[];
  texts: Text[];

  setToolTipText: (params: IChartTooltipParams) => string;
  beforeAnalysisData?: (data: IChartData[]) => void;
  afterAnalysisData?: (bins: InternMap<ChartValue, Record<string, ChartData>>) => void;
  onClickItem?: (data: IMapData, event: MouseEvent) => void;
  onDblClickItem?: (data: IMapData, event: MouseEvent) => void;
  onContextMenuItem?: (data: IMapData, event: MouseEvent) => void;

  resizeObserver: ResizeObserver;
  bins: InternMap<ChartValue, Record<string, ChartData>>;
  clipId: string;

  constructor(params: IChartPropsDetail) {
    this.parents = params.parents;
    this.data = params.data;
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
    this.isZScore = params.isZScore || false;
    this.isIqr = params.isIqr || false;
    this.isZoom = params.isZoom || false;
    this.isTooltip = params.isTooltip ?? true;
    this.isTooltipLine = params.isTooltipLine ?? true;
    this.isCollisionTextRerender = params.isCollisionTextRerender ?? true;
    this.isCollisionTextLogic = params.isCollisionTextLogic ?? true;
    this.isOverTextLogic = params.isOverTextLogic ?? true;
    this.collisionTextPadding = params.collisionTextPadding || -10;
    this.collisionTextType = params.collisionTextType || "series";
    this.circlePadding = params.circlePadding || 10;
    this.showZero = params.showZero ?? true;
    this.showScatter = params.showScatter ?? true;
    this.showOutlier = params.showOutlier ?? true;
    this.loading = params.loading || false;
    this.loaderRadius = params.loaderRadius || 10;
    this.noDataMessage = params.noDataMessage || "No data to display";
    this.colorDic = params.colorDic || {};
    this.pieAggregation = params.pieAggregation || "min";
    this.pieInnerRadius = params.pieInnerRadius;
    this.pieOuterRadius = params.pieOuterRadius;
    this.pieOpacity = params.pieOpacity || 1;
    this.pieTooltipType = params.pieTooltipType || "elcenter";
    this.isTooltipReverse = params.isTooltipReverse || false;
    this.delayedTooltip = params.delayedTooltip;
    this.className = `moz-chart-svg${params.className ? ` ${params.className}` : ""}`;
    this.axises = params.axises || [];
    this.serieses = params.serieses || [];
    this.pies = params.pies || [];
    this.texts = params.texts || [];
    this.setToolTipText = p => {
      const { text } = p;
      if (params.setToolTipText) {
        p.numberFormat = numberFormat;
        return params.setToolTipText(p);
      } else {
        let result: string = String(text);
        if (typeof text === "number") {
          result = numberFormat(text);
        }
        return result;
      }
    };
    this.beforeAnalysisData = params.beforeAnalysisData;
    this.afterAnalysisData = params.afterAnalysisData;
    this.onClickItem = params.onClickItem;
    this.onDblClickItem = params.onDblClickItem;
    this.onContextMenuItem = params.onContextMenuItem;

    this.resizeObserver = new ResizeObserver(els => {
      this.render();
    });
    this.resizeObserver.observe(this.parents);

    // series의 키를 field aggregation 조합으로 만들기 위해서 아래 코드 추가
    const arr = [...this.serieses, ...this.pies];
    arr.forEach(series => {
      const f = arr.filter(s => !s.id && s.field === series.field && s.aggregation === series.aggregation);
      if (f && f.length > 0) {
        f.forEach(s => {
          s.id = series.aggregation ? `${series.field}-${series.aggregation}` : series.field;
        });
      }
    });

    this.bins = new Map();
    this.analysisData();

    this.clipId = generateGUID();
  }

  get keyField(): string {
    if (this.axises.length === 0) return "key";
    const keyAxis = this.axises.find(axis => axis.type === "key");
    if (!keyAxis) return "key";
    return keyAxis.field;
  }

  dispose() {
    if (!this.resizeObserver) return;
    this.resizeObserver.disconnect();
  }

  analysisData() {
    if (!this.data) return;

    if (this.beforeAnalysisData) {
      this.beforeAnalysisData(this.data);
    }

    const serieses = this.serieses.length > 0 ? this.serieses : this.pies;
    // onlySeries 버그로 인하여 제외 (series는 그려야 하는데 데이터가 없어 그리지 못함)
    // serieses = serieses.filter(s => !s.onlySeries);

    this.bins = d3.rollup(
      this.data,
      (d: IChartData[]): Record<string, ChartData> => {
        const grp: Record<string, ChartData> = {};
        serieses.reduce((accumulate: ChartData[], series: Series) => {
          grp[series.field] = new ChartData({
            valueField: series.field,
            zScoreFlag: this.isZScore,
            iqrFlag: this.isIqr,
            accumulate: [...accumulate],
            total: accumulate,
            values: d.reduce((result: IChartValue[], g: IChartData, i: number) => {
              if (isNull("number", +g[series.field])) return result;
              result.push({
                idx: i,
                keyData: g[this.keyField],
                valueData: +g[series.field],
                valueField: series.field,
                // highlight: this.highlightIndeces ? this.highlightIndeces.includes(i) : false,
              });
              return result;
            }, []),
          });
          accumulate.push(grp[series.field]);
          return accumulate;
        }, []);
        return grp;
      },
      (d: IChartData) => d[this.keyField],
    );

    // console.log(this.bins);

    if (this.afterAnalysisData) {
      this.afterAnalysisData(this.bins);
    }
  }

  renderClipPath(params: {
    g: d3.Selection<any, unknown, null, undefined>;
    width: number;
    height: number;
    graphWidth: number;
    graphHeight: number;
  }) {
    const { g, width, height, graphHeight, graphWidth } = params;
    const defs = g.append("defs");
    defs
      .append("svg:clipPath")
      .attr("id", this.clipId)
      .append("svg:rect")
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("height", graphHeight)
      .attr("width", graphWidth);

    this.axises.forEach(axis => {
      if (axis.dataType === "string") {
        axis.renderClipPath({
          defs,
          width,
          height,
          margin: this.margin,
          graphWidth,
          graphHeight,
        });
      }
    });
  }

  renderPies(params: {
    parents: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    width: number;
    height: number;
    margin: INonNullMargin;
  }) {
    const { parents, width, height, margin } = params;
    const datas = this.pies.reduce((results: any[], pie) => {
      results.push(
        Array.from(this.bins)
          .filter(d => this.showZero || d[1][pie.field][this.pieAggregation].valueData !== 0)
          .reduce(
            (result, bin) => {
              result.value += bin[1][pie.field][this.pieAggregation].valueData;
              return result;
            },
            { key: pie.field, colorKey: pie.key, caption: pie.displayText, value: 0 },
          ),
      );
      return results;
    }, []);
    const g = parents.append("g").append("g").attr("class", "moz-series");
    const radius = (Math.min(height - margin.top - margin.bottom, width - margin.left - margin.right) / 2) * 0.8;

    const pie = d3
      .pie()
      .sort(null)
      .value((d: any) => d.value);

    const arc = d3
      .arc()
      .innerRadius(this.pieInnerRadius || 0)
      .outerRadius(this.pieOuterRadius || radius);

    const func = this.setToolTipText;
    const tooltip = (d: any) => {
      const backColor = getKeyColor(d.data.key, { colorHash: this.colorDic });
      return dedent`
          <div style='display: flex; align-items: center;'>
            <span class='dot'></span>
            <span class="label">
              ${func({ type: "key", key: "", text: d.data.caption })}
            </span>: ${func({ type: "value", key: d.data.key, text: d.data.value })}
          </div>
          <div style='display: flex; align-items: center;'>
            <span class='dot' style="background-color:${backColor}"></span>
            <span class="label">
              Rate
            </span>: ${numberFormat((100 * (d.endAngle - d.startAngle)) / Math.PI / 2)}%
          </div>
        `;
    };

    g.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)
      .selectAll("path")
      .data(pie(datas))
      .join("path")
      .attr("d", arc as any)
      .attr("class", "moz-series-pie-path")
      .style("fill", (d: any) => getKeyColor(d.data.colorKey, { colorHash: this.colorDic }))
      .style("fill-opacity", this.pieOpacity)
      .on("mouseover", (event, d) => tooltipMouseOver(width, height, d, this.pieTooltipType, false, event, tooltip))
      .on("mouseout", () => tooltipMouseOut());

    const text = this.texts.find(t => t.type === "label");
    if (text) {
      const lebelInnerRadius = this.pieInnerRadius || 0;
      const lebelOuterRadius = this.pieOuterRadius || radius;
      const labelRadius = lebelOuterRadius + lebelInnerRadius;

      const arcLabel = d3
        .arc()
        .innerRadius(labelRadius * 0.5)
        .outerRadius(labelRadius * 0.5);

      g.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("text")
        .data(pie(datas))
        .join("text")
        .attr("class", "moz-series-text")
        .style("fill", (d: any) => getTextColor(getKeyColor(d.data.key, { colorHash: this.colorDic })))
        .attr("transform", (d: any) => `translate(${arcLabel.centroid(d)})`)
        .call((t: any) =>
          t.append("tspan").text((d: any) => {
            const val = text.setText({ value: d.data.value });
            const rate = numberFormat((100 * (d.endAngle - d.startAngle)) / Math.PI / 2);
            return `${val} (${rate}%)`;
          }),
        );
    }

    this.pies.forEach(series => {
      series.renderShape = series.renderPieShape;
    });
  }

  renderLoading(params: {
    parents: d3.Selection<any, unknown, null, undefined>;
    graphWidth: number;
    graphHeight: number;
  }) {
    const { parents, graphWidth, graphHeight } = params;

    const g = parents
      .append("g")
      .attr("class", "moz-loading")
      .attr("transform", `translate(${graphWidth / 2 + this.margin.left},${graphHeight / 2 + this.margin.top})`);

    const locXArr: number[] = [];
    for (let i = -2; i <= 2; i++) {
      locXArr.push(i * this.loaderRadius * 3);
    }

    g.selectAll("circle")
      .data(locXArr)
      .join("circle")
      .attr("class", "moz-loading-circle")
      .attr("cx", (d: any) => d)
      .attr("r", this.loaderRadius);

    const turnToLoading = () => {
      const loaderTransitionValue = 17;
      // this 사용을 위해 Arrow Function아닌 function 사용
      d3.selectAll(".moz-loading-circle").each(function (d: any, i: number, x: any) {
        const event = d3
          .select(this)
          .transition()
          .delay(i * 100)
          .duration(200)
          .attr("class", "moz-loading-circle loading")
          .attr("cy", () => {
            return -loaderTransitionValue;
          })
          .transition()
          .attr("cy", () => {
            return loaderTransitionValue;
          })
          .transition()
          .attr("cy", () => {
            return 0;
          })
          .transition()
          .attr("class", "moz-loading-circle");

        if (i === x.length - 1) {
          event.on("end", () => {
            turnToLoading();
          });
        }
      });
    };

    turnToLoading();
  }

  renderNoData(params: {
    parents: d3.Selection<any, unknown, null, undefined>;
    graphWidth: number;
    graphHeight: number;
  }) {
    const { parents, graphWidth, graphHeight } = params;

    const g = parents
      .append("g")
      .attr("transform", `translate(${graphWidth / 2 + this.margin.left},${graphHeight / 2 + this.margin.top})`)
      .append("text")
      .attr("class", "moz-text-no-data")
      .text(this.noDataMessage);
  }

  renderCollisionText(params: { svg: any; graphWidth: number; graphHeight: number }) {
    const { svg, graphWidth, graphHeight } = params;

    const textG = svg.append("g").attr("class", "moz-series");
    const svgR = svg.node().getBoundingClientRect();

    const texts = svg.selectAll(".moz-series-text");
    const rects = svg.selectAll(".moz-series-rect");
    const nodes = texts.nodes();
    const rectNodes = rects.nodes();
    const collisionDic: Record<string, Set<HTMLElement>> = {};
    const registDic = (key: string, value: HTMLElement) => {
      const set = collisionDic[key] ?? new Set<HTMLElement>();
      set.add(value);
      collisionDic[key] = set;
    };
    nodes.forEach((s1: any) => {
      if (this.isCollisionTextLogic) {
        nodes.forEach((s2: any) => {
          if (s1 === s2) return;
          if (!isCollision(s1, s2)) return;
          const s1Key = s1.__data__[0] || s1.getAttribute("data-key");
          const s2Key = s2.__data__[0] || s2.getAttribute("data-key");
          registDic(String(s1Key), s1);
          registDic(String(s2Key), s2);
        });
      }
      if (this.isOverTextLogic) {
        rectNodes.forEach((r1: any) => {
          if (s1.__data__[0] !== r1.__data__[0]) return;
          if (s1.parentNode !== r1.parentNode) return;
          if (!isOver(r1, s1)) return;
          registDic(String(s1.__data__[0]), s1);
        });
      }
    });
    Object.keys(collisionDic).forEach(key => {
      const set = collisionDic[key];
      const sortedArr = Array.from(set).sort((a, b) => {
        const r1 = (a as any).transform.baseVal[0].matrix;
        const r2 = (b as any).transform.baseVal[0].matrix;
        if (r1.f < r2.f) return -1;
        else if (r1.f > r2.f) return 1;
        else {
          if (r1.e < r2.e) return -1;
          else if (r1.e > r2.e) return 1;
          else return 0;
        }
      });
      let top = sortedArr.reduce((min, item) => {
        const r = (item as any).transform.baseVal[0].matrix;
        if (r.f < min) {
          min = r.f;
        }
        return min;
      }, Number.MAX_VALUE);
      let left = sortedArr.reduce((min, item) => {
        const r = (item as any).transform.baseVal[0].matrix;
        if (r.e < min) {
          min = r.e;
        }
        return min;
      }, Number.MAX_VALUE);
      const height = sortedArr.reduce((sum, item) => {
        const r = item.getBoundingClientRect();
        return sum + r.height;
      }, 0);
      const width = sortedArr.reduce((sum, item) => {
        const r = item.getBoundingClientRect();
        return sum + r.width;
      }, 0);
      if (this.margin.top + graphHeight < top + height) {
        top = this.margin.top + graphHeight - height;
      }
      if (this.margin.left + graphWidth < left + width) {
        left = this.margin.left + graphWidth - width;
      }
      sortedArr.forEach((item, i) => {
        const seriesField = item.getAttribute("data-series");
        const seriesValue = +(item.getAttribute("data-value") || 0);
        const keyValue = (item as any).__data__[0] || item.getAttribute("data-key");
        if (!seriesField) return;
        const series = this.serieses.find(s => s.field === seriesField);
        if (!series) return;
        const axisKey = this.axises.find(axis => axis.name === series.keyAxis);
        const axisSeries = this.axises.find(axis => axis.name === series.seriesAxis);
        if (!axisKey || !axisKey.scale) return;
        if (!axisSeries || !axisSeries.scale) return;
        const keyColor = getKeyColor(series.getColorKey(series.colorStandard, series.key, keyValue), {
          colorHash: this.colorDic,
        });
        if (this.collisionTextType === "back") {
          item.style.fill = keyColor;
        } else {
          item.style.fill = getTextColor(keyColor);
        }
        const vertical = axisKey.direction === "vertical";
        const textKeyLoc: number = vertical
          ? (item as any).transform.baseVal[0].matrix.f
          : (item as any).transform.baseVal[0].matrix.e;
        let keyLoc =
          (axisKey.scale(keyValue) as number) + (vertical || axisKey.dataType !== "string" ? 0 : axisKey.binSize / 2);
        if (textKeyLoc !== keyLoc) {
          keyLoc = textKeyLoc;
        }
        const seriesLoc = axisSeries.scale(seriesValue as any) as number;
        const oldX = vertical ? seriesLoc : keyLoc;
        const oldY = vertical ? keyLoc : seriesLoc;
        if (vertical) {
          (item as any).transform.baseVal[0].matrix.e =
            left +
            sortedArr.reduce((sum, si, j) => {
              if (j >= i) return sum;
              const sir = si.getBoundingClientRect();
              return sum + sir.width + 4;
            }, 0);
          (item as any).transform.baseVal[0].matrix.f -= axisKey.binSize / 2 + this.collisionTextPadding;
        } else {
          (item as any).transform.baseVal[0].matrix.e += axisKey.binSize / 2 + this.collisionTextPadding;
          (item as any).transform.baseVal[0].matrix.f =
            top +
            sortedArr.reduce((sum, si, j) => {
              if (j >= i) return sum;
              const sir = si.getBoundingClientRect();
              return sum + sir.height;
            }, 0);
        }
        const newR = item.getBoundingClientRect();
        const newX = (item as any).transform.baseVal[0].matrix.e - 2;
        const newY = (item as any).transform.baseVal[0].matrix.f;
        if (!item.classList.contains("moz-series-text-collision")) {
          item.classList.add("moz-series-text-collision");
        }
        const back = textG
          .append("rect")
          .attr("class", "moz-series-text-collision-back")
          .attr("x", newR.x - svgR.x + newR.width / 2 - 2)
          .attr("y", newR.y - svgR.y)
          .attr("width", newR.width + 4)
          .attr("height", newR.height);

        if (this.collisionTextType === "back") {
          back.style("fill", "var(--color-back)").style("stroke", "var(--color-border2)");
        } else {
          back.style("fill", keyColor);
        }

        textG.node().appendChild(item);
        textG
          .append("path")
          .attr("class", "moz-series-text-collision-path")
          .attr("d", `M${oldX},${oldY}L${newX},${newY}Z`)
          .attr("stroke", "var(--color-font5)");
      });
    });
  }

  render(transform?: any) {
    const rect = this.parents.getBoundingClientRect();
    const graphWidth = rect.width - this.margin.left - this.margin.right;
    const graphHeight = rect.height - this.margin.top - this.margin.bottom;
    let svg: any;
    if (transform) {
      svg = d3.select(this.parents).select("svg");
      svg.selectAll("g").remove();
    } else {
      while (this.parents.firstChild) {
        if (!this.parents.lastChild) break;
        this.parents.removeChild(this.parents.lastChild);
      }
      if (rect.width === 0 || rect.height === 0) return;
      svg = d3
        .select(this.parents)
        .append("svg")
        .attr("class", this.className)
        .style("width", `${rect.width}px`)
        .style("height", `${rect.height}px`);

      this.renderClipPath({
        g: svg,
        width: rect.width,
        height: rect.height,
        graphWidth,
        graphHeight,
      });
    }

    this.axises.forEach((axis, idx) => {
      axis.render({
        parents: svg,
        idx,
        width: rect.width,
        height: rect.height,
        graphWidth,
        graphHeight,
        margin: this.margin,
        chartClipId: this.clipId,
        bins: this.bins,
        transform,
      });
    });

    const legendSerieses =
      this.serieses.length === 0 && this.pies.length > 0
        ? this.pies.filter(s => !s.onlySeries)
        : this.serieses.filter(s => !s.onlySeries);

    if (this.loading) {
      this.renderLoading({
        parents: svg,
        graphWidth,
        graphHeight,
      });
    } else {
      if (!this.bins || this.bins.size === 0) {
        this.renderNoData({
          parents: svg,
          graphWidth,
          graphHeight,
        });
      } else {
        this.serieses.forEach((series, idx) => {
          const axisKey = this.axises.find(axis => axis.name === series.keyAxis);
          const axisSeries = this.axises.find(axis => axis.name === series.seriesAxis);
          if (!axisKey || !axisSeries) return;
          if (!axisKey.scale || !axisSeries.scale) return;

          series.render({
            parents: svg,
            scaleKey: axisKey.scale,
            scaleSeries: axisSeries.scale,
            binSize: axisKey.binSize,
            width: rect.width,
            height: rect.height,
            graphWidth,
            graphHeight,
            margin: this.margin,
            direction: axisSeries.direction,
            location: axisKey.location,
            dataType: axisKey.dataType,
            aggregation: axisSeries.aggregation,
            bins: this.bins,
            circlePadding: this.circlePadding,
            showZero: this.showZero,
            showScatter: this.showScatter,
            showOutlier: this.showOutlier,
            isAccumulate: axisSeries.type === "series-aggregation-accumulate",
            colorDic: this.colorDic,
            barLen: this.serieses.filter(s => s.visible && s.type === "bar").length,
            boxLen: this.serieses.filter(s => s.visible && s.type === "box-plot").length,
            clipId: this.clipId,
            serieses: legendSerieses,
            idx,
            setToolTipText: this.setToolTipText,
          });
        });

        if (this.serieses.length === 0 && this.pies.length > 0) {
          this.renderPies({
            parents: svg,
            width: rect.width,
            height: rect.height,
            margin: this.margin,
          });
        }
      }
    }

    this.texts.forEach(text => {
      let series = this.serieses.filter(s => !s.onlySeries).find(s => s.field === text.text);
      if (this.serieses.length === 0 && this.pies.length > 0) {
        series = this.pies.filter(s => !s.onlySeries).find(s => s.field === text.text);
      }
      text.render({
        parents: svg,
        width: rect.width,
        height: rect.height,
        margin: this.margin,
        colorDic: this.colorDic,
        serieses:
          text.type === "legend" || ((text.type === "label" || text.type === "total") && !text.text)
            ? legendSerieses
            : undefined,
        series: (text.type === "label" || text.type === "total") && text.text ? series : undefined,
      });
    });

    if (this.isCollisionTextRerender) {
      this.renderCollisionText({ svg, graphWidth, graphHeight });
    }

    if (this.isTooltip) {
      const keyAxis = this.axises.find(axis => axis.type === "key");
      if (keyAxis) {
        const func = () => {
          keyAxis.renderTooltip({
            parents: svg,
            width: rect.width,
            height: rect.height,
            graphWidth,
            graphHeight,
            margin: this.margin,
            bins: this.bins,
            colorDic: this.colorDic,
            serieses: legendSerieses,
            isTooltipLine: this.isTooltipLine,
            isTooltipReverse: this.isTooltipReverse,
            setToolTipText: this.setToolTipText,
            onClickItem: this.onClickItem,
            onDblClickItem: this.onDblClickItem,
            onContextMenuItem: this.onContextMenuItem,
          });
        };
        if (Number.isFinite(this.delayedTooltip)) {
          setTimeout(func, this.delayedTooltip);
        } else {
          func();
        }
      }
    }

    if (this.isZoom) {
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 32])
        .on("zoom", event => {
          this.render(event.transform);
        });
      svg.call(zoom as any);
    }
  }
}
