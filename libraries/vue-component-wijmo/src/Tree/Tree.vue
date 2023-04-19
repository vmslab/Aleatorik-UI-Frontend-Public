<template>
  <div class="moz-tree" ref="treeRef"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { Tree as TreeComponent } from "@aleatorik-ui/common-ui";
import { ITreeProps, createCamelProps } from "@aleatorik-ui/common-ui";

const props = defineProps<{
  items: Array<Record<string, any>>;
  mode?: "tree" | "plat";
  rootValue?: String;
  contextItems?: Array<Record<string, any>>;
  onItemClick?: (evt: any) => void;
  onItemContextMenu?: (evt: any) => Array<Record<string, any>>;
}>();

const treeRef = ref(null);
const tree = ref(null as TreeComponent | null);

const renderTree = () => {
  tree.value = new TreeComponent({
    parents: treeRef.value as unknown as HTMLElement,
    ...createCamelProps<ITreeProps>(props),
  });
  tree.value.render();
};

onMounted(renderTree);

onUnmounted(() => {
  if (!tree || !tree.value) return;
  tree.value.dispose();
});

watch(props as any, renderTree);

defineExpose({
  treeRef,
  tree,
});
</script>
