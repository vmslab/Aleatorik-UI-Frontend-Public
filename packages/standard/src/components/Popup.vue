<template>
  <DxPopup
    class="moz-popup"
    :visible="visible"
    :show-title="showTitle"
    :title="title"
    :width="width"
    :height="height"
    @hiding="onHiding"
  >
    <slot></slot>
  </DxPopup>
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import { DxPopup } from "devextreme-vue/popup";

defineProps({
  visible: {
    type: Boolean as PropType<boolean>,
    default: () => false,
    required: true,
  },
  showTitle: {
    type: Boolean as PropType<boolean>,
    default: () => true,
    required: false,
  },
  title: {
    type: String as PropType<string>,
    default: () => "",
    required: false,
  },
  width: {
    type: [Number, String] as PropType<number | string>,
    default: () => 600,
    required: false,
  },
  height: {
    type: [Number, String] as PropType<number | string>,
    default: () => "auto",
    required: false,
  },
});
const emit = defineEmits(["hiding"]);

const onHiding = (e: any) => {
  emit("hiding", e);
};
</script>
