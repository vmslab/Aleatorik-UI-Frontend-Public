<template>
  <div class="moz-frame">
    <Controller :show-filter="showFilter">
      <DxButton class="moz-default-button" icon="save" type="default" text="Save" @click="onSaveClick"></DxButton>
    </Controller>
    <Splitter :changed="loading">
      <Splitter pane-size="50%" direction="horizontal">
        <div class="dx-card" style="width: 100%">
          <div class="dx-card-text">
            <FileManager
              :height="600"
              :upload="true"
              :directory="false"
              :isServerRemove="false"
              :inputs="serverFiles"
              @files-changed="onFilesChanged"
            ></FileManager>
          </div>
        </div>
      </Splitter>
      <Splitter pane-size="50%" direction="horizontal">
        <div class="dx-card" style="width: 100%">
          <div class="dx-card-title">
            <div class="dx-card-title-text">Title</div>
          </div>
          <div class="dx-card-text"></div>
        </div>
      </Splitter>
    </Splitter>
  </div>
</template>

<script lang="ts" setup>
import { Get, Upload } from "../stores/templateStore";
import { onMounted, ref, computed } from "vue";
import { DxButton } from "devextreme-vue/button";
import { Splitter, FileManager } from "@aleatorik-ui/vue-component-wijmo";
import { Controller } from "../components";
import { FileParameter } from "@aleatorik-ui/common";
import { generateGUID } from "@aleatorik-ui/common-ui";

const loading = ref(true);
const showFilter = ref(true);

let serverFiles = ref([] as any[]);
let newFiles = ref([] as any[]);

onMounted(async () => {
  const result = await Get("File");
  if (result && result.data) {
    // serverFiles.value = result.data;
  }
  loading.value = false;
});

const onFilesChanged = (files: any[]) => {
  newFiles.value = files.filter(f => f.isClient);
};

const onSaveClick = (e: any) => {
  newFiles.value.forEach(async (file: any, i: number) => {
    if (file.file) {
      const param = new FileParameter("Upload", generateGUID());
      param.file = file.file;
      param.completed = param => {
        console.log(`${param?.fileName} Upload Completed`);
      };
      await Upload("File", param);
    }
  });
};
</script>
