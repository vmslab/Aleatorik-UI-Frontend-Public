<template>
  <div class="moz-input">
    <label v-if="label">{{ label }}</label>

    <WjInputMask
      v-if="type == 'text'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-bind="props"
      v-model:value="_value"
    />
    <WjInputNumber
      v-if="type == 'number'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-bind="props"
      v-model:value="_value"
      :step="step"
    />
    <WjInputDate
      v-if="type == 'date'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-bind="$props"
      v-model:value="_valueDayjs"
    />
    <WjInputDateTime
      v-if="type == 'datetime'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-bind="$props"
      v-model:value="_valueDayjs"
    />
    <WjComboBox
      v-if="type == 'dropdownlist'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-bind="$props"
      :value="_value"
      :itemsSource="list"
    />
    <textarea
      v-if="type == 'textarea'"
      :style="{
        width: typeof width == 'string' ? width : `${width}px`,
        height: typeof height == 'string' ? height : `${height}px`
      }"
      v-model="_value"
    />

    <Button v-if="type == 'button'" v-bind="$props" />
  </div>
</template>
<script lang="ts" setup>
import { computed, reactive, toRefs, watch } from 'vue';
import { WjInputMask, WjInputNumber, WjInputDate, WjInputDateTime, WjComboBox } from '@grapecity/wijmo.vue2.input';

import Button from './Button.vue';
import dayjs from 'dayjs';

/**
 * props
 */
interface Props {
  label?: string | null;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'textarea' | 'button' | 'dropdownlist';
  modelValue?: any;
  list?: any;
  text?: string;
  width?: string | number;
  height?: string | number;
  step?: number;
}
const props = withDefaults(defineProps<Props>(), {
  label: null,
  type: 'text',
  step: undefined
});
const { label, type, list, text, width, height, step } = toRefs(props);

/**
 * STATE
 */

/**
 * Computed
 */
const emit = defineEmits(['update:modelValue']);

const _value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const _valueDayjs = computed({
  get() {
    return props.modelValue.toDate();
  },
  set(value) {
    emit('update:modelValue', dayjs(value));
  }
});
// const options: {
//   popup: any;
// } = reactive({
//   popup: null
// });

// defineExpose({
//   toggle,
//   show,
//   hide
// });
</script>
