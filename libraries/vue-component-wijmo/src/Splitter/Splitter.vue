<template>
  <div class="moz-splitter-root" ref="splitterRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useSlots, Comment, render, watch, defineExpose } from "vue";
import {
  Splitter as SplitterComponent,
  Pane as PaneComponent,
  ISplitterProps,
  Direction,
  createCamelProps,
} from "@aleatorik-ui/common-ui";

const props = defineProps<{
  direction?: Direction;
  resizerSize?: Number;
  onResizeStart?: () => void;
  onResizeEnd?: (sizes: string[]) => void;
  onChange?: (sizes: string[]) => void;
  allowResize?: Boolean;
  classList?: string[];
  style?: object;
  changed?: Boolean;
  renderPane?: (child: any, parent: HTMLElement) => void;
}>();

const splitterRef = ref(null);
const splitter = ref(null as SplitterComponent | null);

const slots = useSlots();
const defaultSlots = (slots.default as any)();

const renderChildren = () => {
  const contents: PaneComponent[] = [];
  defaultSlots
    .filter((slot: any) => slot.type !== Comment)
    .forEach((slot: any) => {
      contents.push(
        new PaneComponent({
          contents: (parents: HTMLElement) => {
            if (props.renderPane) {
              props.renderPane(slot, parents);
            } else {
              render(slot, parents);
            }
          },
          direction: props.direction,
          resizersSize: props.resizerSize as number | undefined,
          size: slot.props ? slot.props["pane-size"] : undefined,
          minSize: slot.props ? slot.props["pane-min-size"] : undefined,
          maxSize: slot.props ? slot.props["pane-max-size"] : undefined,
        }),
      );
    });
  splitter.value = new SplitterComponent({
    parents: splitterRef.value as unknown as HTMLElement,
    ...createCamelProps<ISplitterProps>(props),
    contents,
  });
  splitter.value.render();
};

onMounted(renderChildren);

watch(props, () => {
  renderChildren();
});

onUnmounted(() => {
  if (!splitter || !splitter.value) return;
  splitter.value.dispose();
});

defineExpose({
  splitterRef,
  splitter,
});
</script>
