<template>
  <div class="moz-frame">
    <Controller :showFilter="options.filter">
      <DxButton v-tooltip="{ text: $t('Filter') }" icon="filter" @click="options.filter = !options.filter"></DxButton>
      <DxButton v-tooltip="{ text: $t('Save') }" icon="save"></DxButton>
      <template #filter>
        <div>
          <label>버전</label>
          <DxSelectBox :items="['V-101010101', 'V-202020202', 'V-303030303']"></DxSelectBox>
        </div>
        <div>
          <label>테스트2</label>
          <DxNumberBox :show-spin-buttons="true"></DxNumberBox>
        </div>
        <span>
          <label>테스트3</label>
          <DxTextBox></DxTextBox>
        </span>
        <span>
          <label>테스트4</label>
          <DxNumberBox></DxNumberBox>
        </span>
        <span>
          <label>테스트5</label>
          <DxTextBox></DxTextBox>
        </span>
        <span>
          <label>테스트6</label>
          <DxNumberBox></DxNumberBox>
        </span>
        <span>
          <label>테스트7</label>
          <DxTextBox></DxTextBox>
        </span>
        <span>
          <label>테스트8</label>
          <DxNumberBox></DxNumberBox>
        </span>
      </template>
    </Controller>
    <SplitBox
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height)"
      :boxes="[
        { type: 'rate', size: 3, minWidth: 200 },
        { type: 'rate', size: 7, minWidth: 200 },
      ]"
      horizontal
      resizable
    >
      <template #box1="{ props }">
        <div class="dx-card" :style="`height:${props.parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Home</div>
          </div>
          <div class="dx-card-text">
            <div class="moz-heading-03">Home</div>
            <span class="moz-body-03">Hello World!</span>
            <!-- <span v-if="isWriter" class="moz-body-03"> Writer!</span> -->
            <div>
              <span class="moz-custom">Style</span>
            </div>
          </div>
        </div>
      </template>
      <template #box2="{ props }">
        <div class="dx-card" :style="`height:${props.parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Title</div>
          </div>
          <div class="dx-card-text">Contents</div>
        </div>
      </template>
    </SplitBox>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import Controller from "../../components/Controller.vue";
import { SplitBox } from "@aleatorik-ui/vue-component-wijmo";

const options = reactive({ filter: true });
</script>
