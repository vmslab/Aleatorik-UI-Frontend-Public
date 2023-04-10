<template>
  <div class="moz-chart-root" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useSlots, watch, defineExpose } from "vue";
import {
  Chart as ChartComponent,
  Axis as AxisComponent,
  Series as SeriesComponent,
  Text as TextComponent,
  ChartValue,
  Aggregation,
  IChartData,
  IMargin,
  IChartProps,
  IAxisProps,
  ISeriesProps,
  ITextProps,
  createCamelProps,
  IChartTooltipParams,
  TooltipType,
  IMapData,
  CollisionTextType,
} from "@aleatorik-ui/common-ui";

const props = defineProps<{
  data: IChartData[];
  margin?: IMargin;
  isZScore?: Boolean;
  isIqr?: Boolean;
  isZoom?: Boolean;
  isTooltip?: Boolean;
  isTooltipLine?: Boolean;
  isCollisionTextRerender?: Boolean;
  isCollisionTextLogic?: Boolean;
  isOverTextLogic?: Boolean;
  collisionTextPadding?: Number;
  collisionTextType?: CollisionTextType;
  circlePadding?: Number;
  showZero?: Boolean;
  showScatter?: Boolean;
  showOutlier?: Boolean;
  loading?: Boolean;
  loaderRadius?: Number;
  noDataMessage?: String;
  colorDic?: Record<string, any>;
  pieAggregation?: Aggregation;
  pieInnerRadius?: Number;
  pieOuterRadius?: Number;
  pieOpacity?: Number;
  pieTooltipType?: TooltipType;
  isTooltipReverse?: boolean;
  delayedTooltip?: number;
  className?: String;
  setToolTipText?: (params: IChartTooltipParams) => string;
  onClickItem?: (data: IMapData, event: MouseEvent) => void;
  onDblClickItem?: (data: IMapData, event: MouseEvent) => void;
  onContextMenuItem?: (data: IMapData, event: MouseEvent) => void;
}>();

const chartRef = ref(null);
const chart = ref(null as ChartComponent | null);

const slots = useSlots();

const renderChart = () => {
  const axises: AxisComponent[] = [];
  const serieses: SeriesComponent[] = [];
  const pies: SeriesComponent[] = [];
  const texts: TextComponent[] = [];
  if (!slots.default) return;
  const defaultSlots = (slots.default as any)();
  defaultSlots
    .filter((slot: any) => slot.type && slot.type.__file)
    .forEach((slot: any) => {
      if (slot.type.__file.endsWith("Axis.vue")) {
        axises.push(new AxisComponent(createCamelProps<IAxisProps>(slot.props)));
      } else if (slot.type.__file.endsWith("Series.vue")) {
        if (slot.props.type === "pie") {
          pies.push(new SeriesComponent(createCamelProps<ISeriesProps>(slot.props)));
        } else {
          serieses.push(new SeriesComponent(createCamelProps<ISeriesProps>(slot.props)));
        }
      } else if (slot.type.__file.endsWith("Text.vue")) {
        texts.push(new TextComponent(createCamelProps<ITextProps>(slot.props)));
      }
    });
  chart.value = new ChartComponent({
    parents: chartRef.value as unknown as HTMLElement,
    ...createCamelProps<IChartProps>(props),
    axises,
    serieses,
    pies,
    texts,
  });
  chart.value.render();
};

onMounted(renderChart);

onUnmounted(() => {
  if (!chart || !chart.value) return;
  chart.value.dispose();
});

watch(slots.default as any, renderChart);

defineExpose({
  chartRef,
  chart,
});
</script>
