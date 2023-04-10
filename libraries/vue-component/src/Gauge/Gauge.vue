<template>
  <div class="moz-gauge-root" ref="gaugeRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useSlots, watch, getCurrentInstance, defineExpose } from "vue";
import {
  Gauge as GaugeComponent,
  Bar as BarComponent,
  Arc as ArcComponent,
  Mark as MarkComponent,
  IGaugeProps,
  IBarProps,
  IArcProps,
  IMarkProps,
  GaugeType,
  createCamelProps,
  IGaugeTooltipParams,
} from "@mozart-ui/common-ui";

const props = defineProps<{
  width: Number;
  height: Number;
  type?: GaugeType;
  minValue?: Number;
  maxValue?: Number;
  backColor?: String;
  verticalPosition?: Number;
  innerRadius?: Number;
  outerRadius?: Number;
  cornerRadius?: Number;
  startAngle?: Number;
  endAngle?: Number;
  reverse?: Boolean;
  colorHash?: Record<string, any>;
  noDataText?: String;
  showTooltip?: Boolean;
  setToolTip?: (params: IGaugeTooltipParams) => string;
}>();

const gaugeRef = ref(null);
const gauge = ref(null as GaugeComponent | null);

const slots = useSlots();

const renderGauge = () => {
  const bars: BarComponent[] = [];
  const arcs: ArcComponent[] = [];
  const marks: MarkComponent[] = [];
  const defaultSlots = (slots.default as any)();
  defaultSlots
    .filter((slot: any) => slot.type && slot.type.__file)
    .forEach((slot: any) => {
      if (slot.type.__file.endsWith("Bar.vue")) {
        bars.push(new BarComponent(createCamelProps<IBarProps>(slot.props)));
      } else if (slot.type.__file.endsWith("Arc.vue")) {
        arcs.push(new ArcComponent(createCamelProps<IArcProps>(slot.props)));
      } else if (slot.type.__file.endsWith("Mark.vue")) {
        marks.push(new MarkComponent(createCamelProps<IMarkProps>(slot.props)));
      }
    });
  gauge.value = new GaugeComponent({
    parents: gaugeRef.value as unknown as HTMLElement,
    ...createCamelProps<IGaugeProps>(props),
    bars,
    arcs,
    marks,
  });
  gauge.value.render();
};

onMounted(renderGauge);

onUnmounted(() => {
  if (!gauge || !gauge.value) return;
  gauge.value.dispose();
});

watch(slots.default as any, renderGauge);

defineExpose({
  gaugeRef,
  gauge,
});
</script>
