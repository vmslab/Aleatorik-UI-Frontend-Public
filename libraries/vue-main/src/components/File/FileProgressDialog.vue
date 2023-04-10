<template>
  <DxPopup
    v-if="state.open"
    :visible="state.open"
    class="moz-popup moz-file-transfer-popup"
    :drag-enabled="true"
    :hide-on-outside-click="false"
    :show-close-button="true"
    :show-title="true"
    :title="t(`File${state.mode}`)"
    :width="550"
    height="auto"
    @hiding="onHiding"
  >
    <div class="moz-file-transfer">
      <div v-for="(file, i) in state.files" :key="`item${i}`" class="moz-progress-frame">
        <div class="moz-progress-wrapper">
          <div class="moz-progress-title" :title="file.name">
            {{ file.path }}
          </div>
          <div class="moz-progress-outside">
            <div
              class="moz-progress-inside"
              :style="`width: ${file.percent}%; background-color: ${getProgressBackColor(file as any)}`"
            ></div>
          </div>
          <div class="moz-progress-status">{{ file.status }}</div>
        </div>
        <div class="moz-progress-cancel">
          <dx-button
            class="moz-text-button cancel-button"
            icon="close"
            :disabled="!file.isCancelable"
            stylingMode="text"
            @click="onCancel(file as any)"
          ></dx-button>
        </div>
      </div>
    </div>
  </DxPopup>
</template>

<script setup lang="ts">
import { onMounted, defineProps } from "vue";
import { useTranslation } from "i18next-vue";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import path from "path-browserify";
import { DxPopup } from "devextreme-vue/popup";
import { DxButton } from "devextreme-vue/button";
import { FileParameter } from "@mozart-ui/common";
import { Upload, Download } from "@mozart-ui/common-api";
import { useFileProgressStore, useDeployStore } from "../../stores/devStore";

interface IZip {
  key: string;
  zip: JSZip;
}

const props = defineProps<{ complete?: (mode: string) => void; }>();

const { t } = useTranslation();

const state = useFileProgressStore();
const { files } = state;
const { delimiter } = useDeployStore();

const onHiding = (evt?: any) => {
  state.setFileProgressState({
    mode: state.mode,
    open: false,
    files: [],
  });
};

const getProgressBackColor = (param: FileParameter) => {
  if (param.isCanceled) {
    return "var(--color-error)";
  } else if (param.isComplete) {
    return "var(--color-success)";
  } else {
    return "var(--color-accent)";
  }
};

const onCancel = (item: FileParameter) => {
  if (!item.onCancelClick) return;
  item.onCancelClick(item);
};

const downloadFile = (param: FileParameter) => {
  if (!param.blobInfo) return;
  saveAs(param.blobInfo.blob, path.basename(param.blobInfo.fileName));
};

const downloadZip = () => {
  if (!files) return;
  const names = files[0].name.split(delimiter);
  const zipName = names[names.length - 2];
  const zips: IZip[] = [];
  const zip: IZip = {
    key: zipName,
    zip: new JSZip(),
  };
  files
    .filter(p => p.blobInfo)
    .forEach(p => {
      if (p.blobInfo) {
        const filePath = p.blobInfo.fileName;
        const dirs = path.dirname(filePath);
        const fileName = path.basename(filePath);
        let prev = zip;
        dirs.split(delimiter || "/").forEach(dir => {
          const key: string = `${prev.key}${path.delimiter}${dir}`;
          const findZip = zips.find(z => z.key === key);
          if (findZip) {
            prev = findZip;
          } else {
            const folder = prev.zip.folder(dir);
            if (folder) {
              prev = {
                key,
                zip: folder,
              };
              zips.push(prev);
            }
          }
        });
        prev.zip.file(fileName, p.blobInfo.blob, { base64: true });
      }
    });
  zip.zip.generateAsync({ type: "blob" }).then((content: any) => {
    saveAs(content, `${zipName}.zip`);
  });
};

const onCompleted = (param: FileParameter) => {
  if (!files) return;
  if (!files.every(p => p.isComplete)) return;
  if (!files.every(p => p.isCanceled)) {
    if (state.mode === "Download") {
      if (files.length > 1) {
        downloadZip();
      } else {
        downloadFile(param);
      }
    }
  }
  if (props.complete) {
    props.complete(state.mode);
  }
  onHiding();
};

onMounted(() => {
  if (files.length === 0) return;
  files.forEach(param => {
    param.onCompleted = onCompleted;
    if (state.mode && state.mode === "Upload") {
      Upload(param);
    } else {
      Download(param);
    }
  });
});
</script>
