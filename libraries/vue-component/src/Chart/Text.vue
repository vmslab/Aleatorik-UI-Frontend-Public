<template></template>

<script setup lang="ts">
import { TextType, ShapeType, Position, IMargin, Location, IChartTextParams } from "@mozart-ui/common-ui";

const props = defineProps<{
  text?: string;
  type?: TextType;
  color?: string;
  size?: number | string;
  angle?: number;
  location?: Location;
  position?: Position;
  margin?: IMargin;
  legendCol?: number;
  legendRow?: number;
  legendShape?: ShapeType;
  legendMaxTextWidth?: number;
  className?: string;
  setText?: (params: IChartTextParams) => string;
}>();
</script>
