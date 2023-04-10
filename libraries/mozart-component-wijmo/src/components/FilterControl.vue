<template>
  <div class="dx-card moz-filter">
    <div class="dx-card-title">
      <div class="dx-card-title-text">검색 필터</div>
      <div class="spacer"></div>
      <div class="dx-card-title-action">
        <DxButton
          v-tooltip="{ text: $t('Apply') }"
          icon="apply"
          stylingMode="text"
          @click="onApplyClick"
        ></DxButton>
        <DxButton
          v-tooltip="{ text: $t('Close') }"
          icon="close"
          stylingMode="text"
          @click="onCancelClick"
        ></DxButton>
      </div>
    </div>
    <div class="dx-card-text">
      <DxForm class="moz-form" :form-data="searchValue" @field-data-changed="onFieldDataChanged" :show-colon-after-label="false">
        <slot></slot>
      </DxForm>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxForm } from "devextreme-vue/form";
import { debounce } from "lodash";
import { findElement } from "mozart-common";

@Component({
  components: { DxButton, DxForm },
})
export default class FilterControl extends Vue {
  @Prop({ type: Boolean, required: true, default: false }) public value?: boolean;
  @Prop() public searchValue!: any;
  @Prop({ type: Boolean, default: false }) public closeOnOutsideClick!: boolean;

  private resetValue: any = undefined;
  private changeValue: any = undefined;

  private toggle = debounce(() => {
    const el = findElement(".moz-filter");
    if (!el) return;
    el.classList.toggle("is-open");
    if (el.classList.contains("is-open")) {
      document.addEventListener("mouseup", this.onOutsideClick);
    } else {
      document.removeEventListener("mouseup", this.onOutsideClick);
    }
  }, 10);

  constructor() {
    super();
  }

  @Watch("value")
  public onChangedValue() {
    if (this.$el.classList.contains("is-open")) {
      this.resetSearchValue();
    }
    this.toggle();
  }

  @Watch("searchValue", { immediate: true, deep: true })
  public onChangeValue(newVal: any) {
    if (!this.resetValue || !this.changeValue) {
      this.resetValue = Object.assign({}, newVal);
    }
  }

  public resetSearchValue() {
    for (const key of Object.keys(this.resetValue)) {
      this.searchValue[key] = this.resetValue[key];
    }
  }

  public onOutsideClick(event: any) {
    if (event.target.closest(".moz-filter")) return;
    if (!this.$el.classList.contains("is-open")) return;
    if (!this.closeOnOutsideClick) return;
    this.resetSearchValue();
    this.toggle();
  }

  public onApplyClick() {
    this.resetValue = Object.assign({}, this.changeValue);
    this.toggle();
    this.$emit("apply");
  }

  public onCancelClick() {
    this.resetSearchValue();
    this.toggle();
  }

  public onFieldDataChanged(event: any) {
    this.changeValue = Object.assign({}, this.searchValue);
  }
}
</script>
