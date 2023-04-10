<template>
  <div ref="ganttRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose } from "vue";
import { DayjsRange } from "@mozart-ui/common";
import { Gantt as GanttComponent } from "@mozart-ui/common-ui";
import {
  Column,
  IGanttRow,
  IGanttHeader,
  IGanttTask,
  IGanttMilestone,
  IGanttProps,
  GanttHeaderType,
  GanttTaskLineType,
  createCamelProps,
} from "@mozart-ui/common-ui";

const props = defineProps<{
  columns: Column[];
  getRows: (currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) => void;
  minDate: Date;
  maxDate: Date;
  rowHeight?: Number;
  headerRowHeight?: Number;
  taskHeight?: Number;
  ganttHeaders: IGanttHeader[];
  ganttTaskLine: GanttTaskLineType;
  ganttWidthRate?: Number;
  resizeColumn?: Boolean;
  dataRefreshTrottleTime?: Number;
  dataRefreshResponsiveness?: Number;
  bufferPageSize?: Number;
  shiftHours?: Number[];
  dayStartTime?: Number;
  emptyRanges?: DayjsRange[];
  isStringColor?: boolean;
  isEndPosition?: boolean;
  scrollAutoHide?: boolean;
  scrollClickOnTrack?: boolean;
  scrollClickOnTrackSpeed?: number;
  classList?: string[];
  styleObject?: object;
  setHighlightTask?: (task: IGanttTask) => boolean;
  setGanttHeaderText?: (text: string, type: GanttHeaderType, from: Date, to: Date) => string;
  setTaskTooltip?: (task: IGanttTask, row?: IGanttRow) => string | HTMLElement;
  setMilestoneTooltip?: (milestone: IGanttMilestone, row?: IGanttRow) => string | HTMLElement;
  onTaskClick?: (event: Event, task: IGanttTask, row: IGanttRow) => void;
  onMilestoneClick?: (event: Event, milestone: IGanttMilestone, row: IGanttRow) => void;
  onRowClick?: (event: Event, row: IGanttRow) => void;
  setRenderCell?: (row: IGanttRow, column: Column, value: any) => string | HTMLElement;
  setGridCellClass?: (row: IGanttRow, column: Column, value: any) => string;
  setGridRowClass?: (row: IGanttRow) => string;
  setGanttRowClass?: (row: IGanttRow) => string;
  setGanttTaskClass?: (row: IGanttRow, task: IGanttTask) => string;
  setGanttMilestoneClass?: (row: IGanttRow, milestone: IGanttMilestone) => string;
}>();

const ganttRef = ref(null);
const gantt = ref(null as GanttComponent | null);

onMounted(() => {
  gantt.value = new GanttComponent({
    parents: ganttRef.value as unknown as HTMLElement,
    ...createCamelProps<IGanttProps>(props),
  });
  gantt.value.render();
});

onUnmounted(() => {
  if (!gantt || !gantt.value) return;
  gantt.value.dispose();
});

defineExpose({
  ganttRef,
  gantt,
});
</script>
