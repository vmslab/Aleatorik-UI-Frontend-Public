<template>
  <div class="moz-color-picker" ref="pickerRef">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { ColorPicker as ColorPickerComponent } from "@aleatorik-ui/common-ui";
import { IColorPickerOptions, createCamelProps, Color } from "@aleatorik-ui/common-ui";

const props = defineProps<{
  popup?: String | Boolean;
  layout?: String;
  alpha?: Boolean;
  editor?: Boolean;
  editorFormat?: String;
  cancelButton?: Boolean;
  defaultColor?: String;
  color?: String;
  colour?: String;
  template?: String;
  onChange?: (color?: Color) => void;
  onDone?: (color?: Color) => void;
  onOpen?: (color?: Color) => void;
  onClose?: (color?: Color) => void;
}>();

const pickerRef = ref(null);
const picker = ref(null as ColorPickerComponent | null);

const renderPicker = () => {
  picker.value = new ColorPickerComponent({
    parent: pickerRef.value as unknown as HTMLElement,
    ...createCamelProps<IColorPickerOptions>(props),
  });
};

onMounted(renderPicker);

// onUnmounted(() => {
//   if (!picker) return;
//   picker.dispose();
// });

watch(props as any, renderPicker);

defineExpose({
  pickerRef,
  picker,
});
</script>
