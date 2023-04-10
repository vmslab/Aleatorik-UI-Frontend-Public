<template>
  <div>
    <DxBox :height="30" direction="row" width="100%">
      <DxItem :ratio="0" :base-size="140">
        <template #default>
          <div class="rect center">{{ $t(`제품코드`) }}</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">반제품<br />수량</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">완제품<br />수량</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">{{ `시작` }}</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">{{ `종료` }}</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">발포시간</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">방수</div>
        </template>
      </DxItem>
      <DxItem :ratio="0" :base-size="50">
        <template #default>
          <div class="rect center">레진</div>
        </template>
      </DxItem>
    </DxBox>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DxList, { DxItemDragging } from "devextreme-vue/list";
import { DxBox, DxItem } from "devextreme-vue/box";
import { DxSortable } from "devextreme-vue/sortable";

@Component({
  components: { DxList, DxItemDragging, DxBox, DxItem, DxSortable },
})
export default class HeaderScheCell extends Vue {
  @Prop({ type: Object, required: true })
  private cellData?: any;
}
</script>

<style scoped>
.rect {
  font-size: 11px;
  font-weight: bolder;
  line-height: 24px;
  overflow: hidden;
  height: 100%;
  border: 1px solid lightgray;
  margin: 3px 1px;
}
.rect-header {
  background: rgba(243, 158, 108, 0.5);
}
.rect-read {
  background: var(--color-contents);
}
.right {
  text-align: right;
  padding-right: 5px;
}
.center {
  text-align: center;
}
</style>
