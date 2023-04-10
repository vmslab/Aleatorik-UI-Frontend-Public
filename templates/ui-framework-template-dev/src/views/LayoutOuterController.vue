<template>
  <div>
    <moz-controller :showFilter="filter">
      <DxButton
        v-tooltip="{ text: $t('Filter') }"
        icon="filter"
        @click="filter = !filter"
      ></DxButton>
      <DxButton v-tooltip="{ text: $t('Save') }" icon="save"></DxButton>
      <div slot="filter">
        <label>버전</label>
        <DxSelectBox :items="['V-101010101', 'V-202020202', 'V-303030303']"></DxSelectBox>
      </div>
      <div slot="filter">
        <label>테스트2</label>
        <DxNumberBox :show-spin-buttons="true"></DxNumberBox>
      </div>
      <span slot="filter">
        <label>테스트3</label>
        <DxTextBox></DxTextBox>
      </span>
      <span slot="filter">
        <label>테스트4</label>
        <DxNumberBox></DxNumberBox>
      </span>
      <span slot="filter">
        <label>테스트5</label>
        <DxTextBox></DxTextBox>
      </span>
      <span slot="filter">
        <label>테스트6</label>
        <DxNumberBox></DxNumberBox>
      </span>
      <span slot="filter">
        <label>테스트7</label>
        <DxTextBox></DxTextBox>
      </span>
      <span slot="filter">
        <label>테스트8</label>
        <DxNumberBox></DxNumberBox>
      </span>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <moz-split-box
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :boxes="[
          { type: 'rate', size: 3, minWidth: 200 },
          { type: 'rate', size: 7, minWidth: 200 },
        ]"
        horizontal
        resizable
      >
        <template slot="box1" slot-scope="{ parentsHeight, contentsHeight }">
          <div class="dx-card" :style="`height:${parentsHeight}px;`">
            <div class="dx-card-title">
              <div class="dx-card-title-text">Home</div>
            </div>
            <div class="dx-card-text">
              <div class="moz-heading-03">Home</div>
              <span class="moz-body-03">Hello World!</span>
              <span v-if="isWritor" class="moz-body-03"> Writor!</span>
              <div>
                <span class="moz-custom">Style</span>
              </div>
            </div>
          </div>
        </template>
        <template slot="box2" slot-scope="{ parentsHeight }">
          <div class="dx-card" :style="`height:${parentsHeight}px;`">
            <div class="dx-card-title">
              <div class="dx-card-title-text">Title</div>
            </div>
            <div class="dx-card-text">Contents</div>
          </div>
        </template>
      </moz-split-box>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import { DxSelectBox } from "devextreme-vue/select-box";
import { MainModule } from "@/store/modules/mainStore";

@Component({
  components: {
    DxButton,
    DxTextBox,
    DxNumberBox,
    DxSelectBox,
  },
})
export default class LayoutOuterController extends Vue {
  public filter: boolean = true;

  constructor() {
    super();
  }

  public get isWritor(): boolean {
    return MainModule.write;
  }
}
</script>
