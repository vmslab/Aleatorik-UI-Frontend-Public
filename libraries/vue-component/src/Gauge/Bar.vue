<template></template>

<script setup lang="ts">
import { LabelType } from "@aleatorik-ui/common-ui";
const props = defineProps<{
  value: number;
  name?: string;
  caption?: string;
  color?: string;
  endColor?: string;
  gradient?: boolean;
  labelType?: LabelType;
  textSize?: number;
  textBold?: boolean;
  percentText?: string;
  animationDuration?: number;
  animationDelay?: number;
}>();
</script>
