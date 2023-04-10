<template></template>

<script setup lang="ts">
import { MarkType } from "@aleatorik-ui/common-ui";

const props = defineProps<{
  value?: number;
  name?: string;
  type?: MarkType;
  color?: string;
  width?: number;
  dashArray?: string;
  ticks?: number;
}>();
</script>
