<template></template>

<script setup lang="ts">
import { SeriesType, ColorStandard, IBoxPlotTooltipLabels, Aggregation } from "@mozart-ui/common-ui";

const props = defineProps<{
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
}>();
</script>
