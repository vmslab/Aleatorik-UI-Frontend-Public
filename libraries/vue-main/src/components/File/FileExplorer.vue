<template>
  <DxFileManager
    ref="fileRef"
    :height="props.height"
    :width="props.width"
    :file-system-provider="provider"
    @file-uploaded="onFileUploaded"
  >
    <DxPermissions
      :create="true"
      :copy="true"
      :move="true"
      :delete="true"
      :rename="true"
      :upload="true"
      :download="true"
    />
    <DxItemView :show-parent-folder="false">
      <DxDetails>
        <DxColumn data-field="thumbnail" />
        <DxColumn data-field="name" :caption="$t('Name')" />
        <DxColumn data-field="dateModified" :caption="t('LastModified')" data-type="datetime" width="130" />
        <DxColumn data-field="size" :caption="t('Size')" />
      </DxDetails>
    </DxItemView>
    <DxNotifications :show-panel="false" :show-popup="false" />
  </DxFileManager>
  <FileProgressDialog v-if="fileProgress.open" :complete="onComplete" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useTranslation } from "i18next-vue";
import { FileParameter } from "@mozart-ui/common";
import { generateGUID } from "@mozart-ui/common-ui";
import { CopyTo, CreateDirectory, DeleteItem, GetFileInfos, MoveTo, RenameItem } from "@mozart-ui/common-api";
import {
  DxFileManager,
  DxPermissions,
  DxNotifications,
  DxItemView,
  DxDetails,
  DxColumn,
  DxItem,
} from "devextreme-vue/file-manager";
import { useDeployStore, useFileProgressStore } from "../../stores/devStore";
import { createProviderConfig } from "../../utils/fileProvider";
import FileProgressDialog from "../File/FileProgressDialog.vue";

const { t } = useTranslation();

const props = defineProps<{
  basePath: string;
  height?: number | string | (() => number | string);
  width?: number | string | (() => number | string);
}>();

const fileRef = ref(null);

const deploy = useDeployStore();
const fileProgress = useFileProgressStore();

const { delimiter } = storeToRefs(deploy);

let files: FileParameter[] = [];
let fileCount: number = 0;

const provider = createProviderConfig({
  getItems: pathInfo => {
    return new Promise(async resolve => {
      if (!pathInfo.name) {
        const result = await GetFileInfos({ path: props.basePath });
        if (result && result.data) {
          resolve(result.data.result);
        }
      } else {
        const result = await GetFileInfos({ path: pathInfo.key });
        if (result && result.data) {
          resolve(result.data.result);
        }
      }
      resolve([]);
    });
  },
  createDirectory: (parentDirectory, name) => {
    return new Promise(async resolve => {
      if (!parentDirectory.key) {
        const result = await CreateDirectory({ path: props.basePath, name });
        resolve(result?.data?.success);
      } else {
        const result = await CreateDirectory({ path: parentDirectory.key, name });
        resolve(result?.data?.success);
      }
      resolve(false);
    });
  },
  deleteItem: item => {
    return new Promise(async resolve => {
      const result = await DeleteItem({
        key: item.key,
        name: item.name,
        isDirectory: item.isDirectory,
      });
      resolve(result?.data?.success);
    });
  },
  copyItem: (item, destinationDirectory) => {
    return new Promise(async resolve => {
      const result = await CopyTo({
        source: { key: item.key, name: item.name, isDirectory: item.isDirectory },
        destination: {
          key: destinationDirectory.key,
          name: destinationDirectory.name,
          isDirectory: destinationDirectory.isDirectory,
        },
      });
      resolve(result?.data?.success);
    });
  },
  moveItem: (item, destinationDirectory) => {
    return new Promise(async resolve => {
      const result = await MoveTo({
        source: { key: item.key, name: item.name, isDirectory: item.isDirectory },
        destination: {
          key: destinationDirectory.key,
          name: destinationDirectory.name,
          isDirectory: destinationDirectory.isDirectory,
        },
      });
      resolve(result?.data?.success);
    });
  },
  renameItem: (item, name) => {
    return new Promise(async resolve => {
      const result = await RenameItem({
        info: { key: item.key, name: item.name, isDirectory: item.isDirectory },
        name,
      });
      resolve(result?.data?.success);
    });
  },
  downloadItems: items => {
    fileProgress.setFileProgressState({
      open: true,
      mode: "Download",
      files: items.map(item => {
        const param = new FileParameter("Download", generateGUID());
        param.name = item.key;
        param.path = item.key;
        param.size = item.size;
        return param;
      }),
    });
  },
  uploadFileChunk: (fileData, chunkInfo, destinationDir) => {
    return new Promise(resolve => {
      const path = `${destinationDir.key || props.basePath}${delimiter.value}${fileData.name}`;
      if (files.some(x => x.path === path)) {
        resolve(false);
        return;
      }
      const param = new FileParameter("Upload", generateGUID());
      param.name = path;
      param.path = path;
      param.size = fileData.size;
      param.file = fileData;
      files.push(param);
      resolve(true);
    });
  },
});

const onFileUploaded = (evt: any) => {
  if (files.length > ++fileCount) return;
  fileProgress.setFileProgressState({
    open: true,
    mode: "Upload",
    files: [...files],
  });
  files = [];
  fileCount = 0;
};

const onComplete = (mode: string) => {
  if (mode === "Upload") {
    if (!fileRef || !fileRef.value) return;
    (fileRef.value as any)?.instance?.refresh();
  }
};
</script>
