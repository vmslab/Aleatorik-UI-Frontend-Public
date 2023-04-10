<template></template>

<script setup lang="ts">
import {
  AxisType,
  AxisDataType,
  Direction,
  Aggregation,
  Location,
  ChartValue,
  IChartTextParams,
  ChartData,
  ITooltipParams,
} from "@aleatorik-ui/common-ui";

const props = defineProps<{
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
  visible?: boolean;
  className?: string;
  setLabel?: (params: IChartTextParams) => string;
  setKeyTickValues?: (params: ChartValue[]) => ChartValue[];
  setSeriesTickValues?: (params: Array<Record<string, ChartData>>) => Set<ChartValue>;
  renderCustomTooltip?: (params: ITooltipParams) => string;
}>();
</script>
