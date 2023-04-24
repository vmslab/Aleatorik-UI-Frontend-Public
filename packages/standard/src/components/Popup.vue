<template>
  <WjPopup :initialized="initialized" :isDraggable="true" :hidden="_callback">
    <div class="moz-dialog">
      <div class="wj-dialog-header moz-dialog-header">
        <slot name="title"></slot>
        <div v-if="!!title" class="title">
          <span>{{ title }}</span>
          <button class="close" @click="options?.popup?.hide()">
            <i class="mozart-icons icon-close"></i>
          </button>
        </div>
      </div>
      <div
        class="wj-dialog-body moz-dialog-body"
        :style="{
          width: `${width}px`,
          height: `${height}px`
        }"
      >
        <slot></slot>
        <slot name="body"></slot>
      </div>
      <div class="wj-dialog-footer moz-dialog-footer">
        <slot name="footer">
          <template v-if="action == 'run'">
            <button class="moz-button moz-default-button wj-hide-yes">{{ $t('Run') }}</button>
          </template>
          <template v-if="action == 'save'">
            <button class="moz-button moz-default-button wj-hide-yes">{{ $t('Yes') }}</button>
            <button class="moz-button moz-default-button wj-hide-no">{{ $t('No') }}</button>
          </template>
        </slot>
      </div>
    </div>
  </WjPopup>
</template>
<script lang="ts" setup>
import { WjPopup } from '@grapecity/wijmo.vue2.input';
import { Popup } from '@grapecity/wijmo.input';
import { reactive, toRefs, watch } from 'vue';
import Button from './Button.vue';

interface Props {
  title?: string;
  callback: Function;
  width?: number;
  height?: number;
  action: 'run' | 'save';
}

/**
 * props
 */
const props = withDefaults(defineProps<Props>(), {
  title: 'Title',
  callback: (result: boolean) => {
    console.log('popup component default callback:', result);
  },
  action: 'save'
});
const { title, callback, width, height, action } = toRefs(props);

/**
 * STATE
 */
const options: {
  popup: any;
} = reactive({
  popup: null
});

const initialized = (popup: any) => {
  options.popup = popup;
};

const _callback = (result: Popup) => {
  callback.value(result.dialogResult == 'wj-hide-yes');
};

const toggle = () => {
  console.log('isVisible', options.popup.isVisible);

  if (!options.popup.isVisible) {
    show();
  } else {
    hide();
  }
};

const show = () => {
  options?.popup?.show(true);
};

const hide = () => {
  options?.popup?.hide(true);
};

defineExpose({
  toggle,
  show,
  hide
});
</script>
