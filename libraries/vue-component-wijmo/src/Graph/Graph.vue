<template>
  <div ref="graphRef" className="moz-graph-root"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineExpose } from "vue";
import { Graph as GraphComponent, ElementDefinition, ElementsDefinition } from "@mozart-ui/common-ui";
import { IGraphProps, createCamelProps } from "@mozart-ui/common-ui";

const props = defineProps<{
  elements?: ElementsDefinition | ElementDefinition[] | Promise<ElementsDefinition> | Promise<ElementDefinition[]>;
  styleObj?: Array<Record<string, any>> | Promise<Array<Record<string, any>>>;
  layout?: Record<string, any>;
  option?: Record<string, any>;
  navigator?: Record<string, any>;
  undoRedo?: Record<string, any>;
  utilities?: Record<string, any>;
  contextMenu?: Record<string, any>;
}>();

const graphRef = ref(null);
const graph = ref(null as GraphComponent | null);

onMounted(() => {
  graph.value = new GraphComponent({
    parents: graphRef.value as unknown as HTMLElement,
    ...createCamelProps<IGraphProps>(props),
  });
  graph.value.render();
});

onUnmounted(() => {
  if (!graph || !graph.value) return;
  graph.value.dispose();
});

defineExpose({
  graphRef,
  graph,
});
</script>
