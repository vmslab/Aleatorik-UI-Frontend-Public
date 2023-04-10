import * as d3 from "d3";
import { IChartAggregation, IChartValue, Aggregation } from "../types";

export default class ChartData {
  valueField: string = "";
  zScoreFlag: boolean = false;
  iqrFlag: boolean = false;
  sValues: IChartValue[] = [];
  sArr: number[] = [];
  zValues: IChartValue[] = [];
  zArr: number[] = [];
  accumulate: ChartData[];
  total: ChartData[];

  constructor(params: {
    valueField: string;
    values: IChartValue[];
    zScoreFlag: boolean;
    iqrFlag: boolean;
    accumulate: ChartData[];
    total: ChartData[];
  }) {
    const { valueField, values, zScoreFlag, iqrFlag, accumulate, total } = params;
    this.valueField = valueField;
    this.zScoreFlag = zScoreFlag;
    this.iqrFlag = iqrFlag;
    this.sValues = values
      .sort((from, to) => d3.ascending(from.valueData, to.valueData))
      .sort((from, to) => d3.ascending(from.highlight, to.highlight));
    this.sArr = this.sValues.map(value => value.valueData);
    const mean = d3.mean(this.sArr) || 0;
    const stddev = d3.deviation(this.sArr) || 1;
    this.zValues = this.sValues.map(value => {
      const newValue = { ...value };
      newValue.valueData = (value.valueData - mean) / stddev;
      return newValue;
    });
    this.zArr = this.zValues.map(value => value.valueData);
    this.accumulate = accumulate;
    this.total = total;

    const compare = (value: IChartValue) =>
      value.valueData < this.min.valueData || value.valueData > this.max.valueData;
    const outliers = this.zScoreFlag ? this.zValues.filter(compare) : this.sValues.filter(compare);
    outliers.forEach(r => (r.outlier = true));
  }

  public get sum(): IChartAggregation {
    return {
      valueData: d3.sum(this.zScoreFlag ? this.zArr : this.sArr),
      valueField: this.valueField,
    };
  }

  public get avg(): IChartAggregation {
    return {
      valueData: d3.mean(this.zScoreFlag ? this.zArr : this.sArr) || 0,
      valueField: this.valueField,
    };
  }

  public get quantileOne(): IChartAggregation {
    return {
      valueData: d3.quantile(this.zScoreFlag ? this.zArr : this.sArr, 0.25) || 0,
      valueField: this.valueField,
    };
  }

  public get median(): IChartAggregation {
    return {
      valueData: d3.median(this.zScoreFlag ? this.zArr : this.sArr) || 0,
      valueField: this.valueField,
    };
  }

  public get quantileThree(): IChartAggregation {
    return {
      valueData: d3.quantile(this.zScoreFlag ? this.zArr : this.sArr, 0.75) || 0,
      valueField: this.valueField,
    };
  }

  public get deviation(): IChartAggregation {
    return {
      valueData: d3.deviation(this.zScoreFlag ? this.zArr : this.sArr) || 0,
      valueField: this.valueField,
    };
  }

  public get variance(): IChartAggregation {
    return {
      valueData: d3.variance(this.zScoreFlag ? this.zArr : this.sArr) || 0,
      valueField: this.valueField,
    };
  }

  public get count(): IChartAggregation {
    return {
      valueData: this.zScoreFlag ? this.zArr.length : this.sArr.length,
      valueField: this.valueField,
    };
  }

  public get min(): IChartAggregation {
    let min = d3.min(this.zScoreFlag ? this.zArr : this.sArr) || 0;
    if (this.iqrFlag) {
      min = Math.max(min, this.quantileOne.valueData - this.interQuartileRange * 1.5);
    }
    return {
      valueData: min,
      valueField: this.valueField,
    };
  }

  public get max(): IChartAggregation {
    let max = d3.max(this.zScoreFlag ? this.zArr : this.sArr) || 0;
    if (this.iqrFlag) {
      max = Math.min(max, this.quantileThree.valueData + this.interQuartileRange * 1.5);
    }
    return {
      valueData: max,
      valueField: this.valueField,
    };
  }

  private get interQuartileRange(): number {
    return this.quantileThree.valueData - this.quantileOne.valueData;
  }

  public get values(): IChartValue[] {
    return this.zScoreFlag ? this.zValues : this.sValues;
  }

  public getPreviousValue(aggregation: Aggregation) {
    return this.accumulate.length > 0 ? this.accumulate[this.accumulate.length - 1][aggregation].valueData : 0;
  }

  public getAccumulateValue(aggregation: Aggregation, isInitThis: boolean = true) {
    return this.accumulate.reduce(
      (result, data) => {
        return result + data[aggregation].valueData;
      },
      isInitThis ? this[aggregation].valueData : 0,
    );
  }

  public getTotalValue(aggregation: Aggregation) {
    return this.total.reduce((result, data) => {
      return result + data[aggregation].valueData;
    }, 0);
  }
}
