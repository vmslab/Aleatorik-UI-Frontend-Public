<template>
  <div class="moz-frame">
    <moz-controller>
      <DxButton v-tooltip="{ text: $t('Save') }" icon="save" @click="onSaveClick"></DxButton>
    </moz-controller>
    <moz-split-box
      width="var(--size-content-inner-width)"
      height="var(--size-content-inner-height)"
      :boxes="[
        { type: 'rate', size: 1, minWidth: 200 },
        { type: 'rate', size: 1, minWidth: 200 },
      ]"
      horizontal
      resizable
    >
      <template slot="box1" slot-scope="{ parentsWidth, parentsHeight }">
        <div class="dx-card" :style="`height:${parentsHeight}px;`">
          <div class="dx-card-text">
            <moz-file-manager
              :height="600"
              :upload="true"
              :directory="false"
              :isServerRemove="false"
              :inputs="serverFiles"
              @files-changed="onFilesChanged"
            ></moz-file-manager>
          </div>
        </div>
      </template>
      <template slot="box2" slot-scope="{ parentsHeight }">
        <div class="dx-card" :style="`height:${parentsHeight}px;`">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Title</div>
          </div>
          <div class="dx-card-text"></div>
        </div>
      </template>
    </moz-split-box>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxButton } from "devextreme-vue/button";

import { FileSystem, IFileInfo } from "mozart-common";
import { MainModule } from "@/store/modules/mainStore";
import { Get, Upload } from "@/api/mainService";

@Component({
  components: {
    DxButton,
  },
})
export default class FileManager extends Vue {
  public serverFiles: IFileInfo[] = [];
  public newFiles: FileSystem[] = [];

  constructor() {
    super();
  }

  public async mounted() {
    const result = await Get("File");
    if (result && result.data) {
      this.serverFiles = JSON.parse(result.data);
    }
  }

  public onFilesChanged(files: FileSystem[]) {
    this.newFiles = files.filter(f => f.isClient);
  }

  public async onSaveClick(e: any) {
    const formData = new FormData();

    this.newFiles.forEach((file: FileSystem, i: number) => {
      if (file.file) {
        formData.append(`file${i}`, file.file);
      }
    });

    const result = await Upload("File", formData);
    const res: any = JSON.parse(result.data);
    if (res && res.count > 0) {
      this.serverFiles = res.obj;
      console.log("upload successed");
    } else {
      console.log("upload failed");
    }
  }
}
</script>
