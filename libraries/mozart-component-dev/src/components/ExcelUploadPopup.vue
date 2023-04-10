<template>
  <div>
    <DxPopup
      :visible="visible"
      :title="$t(`ExcelImport`)"
      class="moz-popup"
      ref="popup"
      :width="400"
      height="auto"
      @showing="onShowing"
      @hidden="onHidden"
    >
      <DxFileUploader
        :labelText="$t(`OR_DROP_HERE`)"
        ref="uploader"
        :selectButtonText="$t(`SELECT_FILE`)"
        :multiple="false"
        :allowedFileExtensions="['.xlsx']"
        class="moz-file-uploader"
        upload-mode="useButtons"
        @value-changed="onFileChanged"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="center"
        :options="{
          text: $t(`Add`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button` },
          onClick: onUploadExcel,
        }"
      />
    </DxPopup>
    <DxLoadPanel
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :close-on-outside-click="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";
import { DxForm } from "devextreme-vue/form";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxFileUploader } from "devextreme-vue/file-uploader";
import { BaseStore } from "../store/modules/baseStore";
import { DxLoadPanel } from "devextreme-vue/load-panel";

@Component({
  components: { DxButton, DxForm, DxPopup, DxToolbarItem, DxFileUploader, DxLoadPanel },
})
export default class ExcelUploadPopup extends Vue {
  @Prop({ type: Boolean, default: false }) public visible!: boolean;
  @Prop({ type: Object }) public module?: BaseStore<any>;
  @Prop() public grid!: any;
  private file!: File;
  private loading: boolean = false;

  constructor() {
    super();
  }

  public get popup() {
    return (this.$refs.popup as any).instance;
  }

  public get uploader() {
    return (this.$refs.uploader as any).instance;
  }

  public onFileChanged(e: any) {
    this.file = e.value[0];
  }

  public async onUploadExcel() {
    this.loading = true;

    if (this.module) {
      const result = await this.module.addDataByExcel(this.file);
      this.$emit("added", result);
    } else {
      this.$emit("added", this.file);
    }

    this.loading = false;
  }

  public onShowing() {
    this.popup._$wrapper[0].style.zIndex = 1601;
  }

  public onHidden() {
    this.$emit("closed");
    this.uploader.reset();
  }
}
</script>
