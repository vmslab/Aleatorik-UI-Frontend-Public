<template>
  <div>
    <DxPopup
      :visible="visible"
      v-if="!showResult"
      :title="$t(`ExcelImport`)"
      class="moz-popup"
      ref="popupRef"
      :width="popupWidth"
      height="auto"
      :wrapper-attr="popupAttr"
      @showing="onShowing"
      @hidden="onHidden"
    >
      <template v-if="!text">
        <DxFileUploader
          v-show="!isUploaded"
          :labelText="$t(`OR_DROP_HERE`)"
          ref="uploaderRef"
          :selectButtonText="$t(`SELECT_FILE`)"
          :multiple="false"
          :visible="false"
          drop-zone=".moz-drop-zone"
          dialog-trigger=".moz-drop-zone"
          :allowedFileExtensions="['.xlsx']"
          class="moz-file-uploader"
          upload-mode="useButtons"
          @value-changed="onFileChanged"
          @drop-zone-enter="onDropZoneEnter"
          @drop-zone-leave="onDropZoneLeave"
          @uploaded="onUploaded"
        >
          <!-- @progress="onProgress"
          @upload-started="onUploadStarted" -->
        </DxFileUploader>
        <div
          class="moz-drop-zone"
          :class="[isDropZoneActive ? 'dx-theme-accent-as-border-color dropzone-active' : 'dx-theme-border-color']"
          v-show="!isUploaded"
        >
          <span>{{ $t(`OR_DROP_HERE`) }}</span>
        </div>
      </template>
      <DxTextArea
        v-else
        v-show="!isUploaded"
        :height="400"
        :width="popupWidth"
        valueChangeEvent="change keyup"
        @value-changed="onTextChanged"
      />
      <div class="moz-simple-padding" v-show="isUploaded">
        <DxDataGrid
          ref="gridRef"
          class="moz-edit-datagrid footer-has-grid moz-excel-data"
          :data-source="data"
          :height="500"
          @content-ready="onCheckGrid"
        >
          <DxScrolling mode="infinite" />
          <DxEditing mode="batch"></DxEditing>
          <DxColumn v-for="col in columns" :data-field="col" v-bind:key="col"></DxColumn>
          <DxSummary :calculateCustomSummary="() => {}">
            <DxTotalItem column="ID" summaryType="custom" :customizeText="onGetFooterText" /> </DxSummary
        ></DxDataGrid>
      </div>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t(`Download`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button`, visible: download ? true : false },
          onClick: onDownloadExcel,
        }"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t(`Add`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button`, visible: isUploaded },
          onClick: onAddExcel,
        }"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t(`Overwrite`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button`, visible: isUploaded },
          onClick: onOverwriteExcel,
        }"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t(`Cancel`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button`, visible: isUploaded },
          onClick: () => {
            isUploaded = false;
            isDropZoneActive = false;
            popupWidth = 400;
          },
        }"
      />
    </DxPopup>

    <DxPopup
      :visible="showResult && visible"
      :width="popupWidth"
      :height="resultPopupHeight"
      :title="$t(`Result`)"
      class="moz-popup"
      @hiding="onResultHiding"
    >
      <div class="moz-simple-padding" v-show="inProgress">
        <span>
          Remain Time :
          {{ reaminProgress === -1 ? "(Calculating ...)" : `${reaminProgress} (Sec)` }}
        </span>
        <DxProgressBar
          :min="0"
          :max="totalProgress"
          :status-format="(value: number) => `In Progress : ${currentProgress} / ${totalProgress} (${(value * 100).toFixed(2)}%)`"
          :value="currentProgress"
          @complete="onProgressComplete"
        />
      </div>
      <DxScrollView v-show="!inProgress" width="100%">
        <div class="moz-simple-padding">
          <center>
            Total Row: {{ total }}
            <div>
              Successed Row: <span class="moz-color-success">{{ success }}</span>
            </div>
            <div v-show="fail">
              Failed Row: <span class="moz-color-error">{{ fail }}</span>
            </div>
            <div v-show="remain">
              Remained Row: <span class="moz-color-error">{{ remain }}</span>
            </div>
          </center>
        </div>
        <div class="moz-simple-padding" v-show="errorMsg">
          <label class="moz-form-label" @click="error = !error">
            {{ $t("Error") }}
            <i :class="`mozart-icons ${error ? `opened` : `closed`}`" />
          </label>
          <DxTextArea v-show="error" :height="200" :read-only="true" :value="errorMsg" />
        </div>
      </DxScrollView>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: inProgress ? $t(`Stop`) : $t(`Confirm`),
          stylingMode: 'outlined',
          elementAttr: { class: `moz-button` },
          onClick: onResultHiding,
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

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, defineEmits } from "vue";
import { useTranslation } from "i18next-vue";
import { showConfirm } from "../utils/dialogUtil";
import { DxButton } from "devextreme-vue/button";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxFileUploader } from "devextreme-vue/file-uploader";
import { DxDataGrid, DxScrolling, DxColumn, DxEditing, DxSummary, DxTotalItem } from "devextreme-vue/data-grid";
import { DxScrollView } from "devextreme-vue/scroll-view";
import { DxTextArea } from "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxProgressBar } from "devextreme-vue/progress-bar";

interface Props {
  visible: boolean;
  text: boolean;
  upload: Function;
  append: Function;
  override: Function;
  download?: Function;
  keyColumns?: string[];
  exceptColumns?: string[];
}

const { t } = useTranslation();
const {
  visible = false,
  text = false,
  upload,
  append,
  override,
  download,
  keyColumns,
  exceptColumns,
} = defineProps<Props>();
const emit = defineEmits(["notify", "reload", "closed"]);

let data: any[] = [];
let validData: any[] = [];
let columns: string[] = [];
let isUploaded: boolean = false;
let file!: File;
let popupWidth: number = 400;
let resultPopupHeight: number = 200;
let total: number = 0;
let success: number = 0;
let fail: number = 0;
let remain: number = 0;
let showResult: boolean = false;
let error: boolean = true;
let errorMsg: string = "";
let loading: boolean = false;
let isDropZoneActive: boolean = false;
// let textVisible: boolean = false;
// let progressVisible: boolean = false;
// let progressValue: number = 0;

let excelChunkCount = 100;
let inProgress: boolean = false;
let totalProgress: number = 0;
let currentProgress: number = 0;
let reaminProgress: number = -1;
let calcTickTime: number[] = [];

let reportSummary: any = {};

const gridRef = ref(null);
const popupRef = ref(null);
const uploaderRef = ref(null);

const grid = computed(() => {
  return (gridRef.value as any)?.instance;
}) as any;
const popup = computed(() => {
  return (popupRef.value as any)?.instance;
}) as any;
const uploader = computed(() => {
  return (uploaderRef.value as any)?.instance;
}) as any;

const popupAttr = {
  class: "z-index-low",
};

onMounted(() => {
  popupWidth = text ? 900 : 400;
});

const isKeyColumn = (name: string): boolean => {
  if (!keyColumns || keyColumns?.length === 0) return false;
  return keyColumns?.includes(name);
};

const onTextChanged = async (e: any) => {
  if (!e.value) return;
  if (!e.value.includes("\n")) return;
  try {
    const result = await upload(e.value.split("\n"));

    if (result.status === 200) {
      emit("notify", {
        message: "Upload Successed",
        type: "success",
      });

      const resultObj = JSON.parse(result.data);

      total = resultObj.TotalCount;
      success = resultObj.SuccessCount;
      fail = resultObj.ErrorCount;
      columns = Object.keys(resultObj.Table[0]).filter((key: any) => !exceptColumns?.includes(key));

      resultObj.Table.forEach((t: any) => {
        data.push(t);
      });

      isUploaded = true;
      popupWidth = 900;
    } else {
      emit("notify", {
        message: "Upload failed",
        type: "error",
      });
    }
  } catch (err: any) {
    emit("notify", {
      message: "Upload failed",
      type: "error",
    });
  } finally {
    loading = false;
  }
};

const onFileChanged = async (e: any) => {
  file = e.value[0];
  data = [];
  loading = true;

  try {
    const result = await upload(file);

    if (result.status === 200) {
      emit("notify", {
        message: "Upload Successed",
        type: "success",
      });

      const resultObj = JSON.parse(result.data);

      total = resultObj.TotalCount;
      success = resultObj.SuccessCount;
      fail = resultObj.ErrorCount;
      columns = Object.keys(resultObj.Table[0]).filter((key: any) => !exceptColumns?.includes(key));

      resultObj.Table.forEach((t: any) => {
        data.push(t);
      });

      isUploaded = true;
      popupWidth = 900;
    } else {
      emit("notify", {
        message: "Upload failed",
        type: "error",
      });
    }
  } catch (err: any) {
    emit("notify", {
      message: "Upload failed",
      type: "error",
    });
  } finally {
    loading = false;
  }
};

const onCheckGrid = async () => {
  validData = [...data];
  const invalidIdx: number[] = [];

  data.forEach((item: any, idx: number) => {
    keyColumns?.forEach((key: string) => {
      if (exceptColumns?.includes(key)) return;
      if (!item[key]) {
        invalidIdx.push(idx);
        validData = validData.filter(t => t !== item);
      }
    });
  });

  if (invalidIdx.length > 0) {
    await grid.selectRowsByIndexes(invalidIdx);
  }
};

const onDownloadExcel = async () => {
  if (!download) return;
  loading = true;
  try {
    await download();
  } finally {
    loading = false;
  }
};

const getByteLength = (s: any, b?: any, i?: any, c?: any) => {
  for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
  return b;
};

const onAddExcel = async () => {
  // this.loading = true;

  inProgress = true;
  showResult = true;
  resultPopupHeight = 200;
  totalProgress = validData.length;
  currentProgress = 0;
  reportSummary = await doAppend(validData);
  currentProgress++;
  // const result = await this.append(this.validData);
  // const resultObj = JSON.parse(result.data);

  // if (result.status === 200) {
  // this.errorMsg = resultObj.ErrorMsg;
  // this.total = resultObj.TotalCount;
  // this.success = resultObj.SuccessCount;
  // this.fail = resultObj.ErrorCount;

  // if (resultObj.ErrorMsg) {
  //   this.resultPopupHeight = 500;
  // }
  // if (reportSummary.TotalCount > 0) {
  // }
  // this.showResult = true;
  // emit("reload");
  // }
  // this.loading = false;
};

const onOverwriteExcel = async () => {
  if (!(await showConfirm({ message: t("CONFIRM_OVERWRITE") as string }))) return;

  // this.loading = true;

  inProgress = true;
  showResult = true;
  resultPopupHeight = 200;
  totalProgress = validData.length;
  currentProgress = 0;
  reportSummary = await doOverwrite(validData);
  currentProgress++;
  // const result = await this.override(this.validData);
  // const resultObj = JSON.parse(result.data);

  // if (result.status === 200) {
  // this.errorMsg = resultObj.ErrorMsg;
  // this.total = resultObj.TotalCount;
  // this.success = resultObj.SuccessCount;
  // this.fail = resultObj.ErrorCount;

  // if (resultObj.ErrorMsg) {
  //   this.resultPopupHeight = 500;
  // }
  // this.showResult = true;
  // emit("reload");
  // }
  // this.loading = false;
};

const setRemainProgress = (startTime: number, endTime: number) => {
  const remainPart = (totalProgress - currentProgress) / excelChunkCount;
  const tickTime = (endTime - startTime) / 1000;
  calcTickTime.push(tickTime);
  const avgTickTime = calcTickTime.reduce((a, b) => a + b) / calcTickTime.length;
  reaminProgress = Math.round(avgTickTime * remainPart);
};

const doAppend = (
  data: any,
  report: any = {
    ErrorMsg: "",
    TotalCount: 0,
    SuccessCount: 0,
    ErrorCount: 0,
    RemainCount: 0,
  },
) => {
  return new Promise(async resolve => {
    if (!inProgress) {
      report.TotalCount += data.length;
      report.RemainCount += data.length;
      resolve(report);
      return;
    }
    const chunk = data.splice(0, excelChunkCount);
    const startTime = performance.now();
    const result = await append(chunk);
    const endTime = performance.now();

    currentProgress += excelChunkCount;

    setRemainProgress(startTime, endTime);

    if (result.status === 200) {
      let resultObj = JSON.parse(result.data);
      report.ErrorMsg += `${report.ErrorMsg?.length > 0 ? "\n" : ""}${resultObj.ErrorMsg}`;
      report.TotalCount += resultObj.TotalCount;
      report.SuccessCount += resultObj.SuccessCount;
      report.ErrorCount += resultObj.ErrorCount;
    }

    resolve(data.length > 0 ? doAppend(data, report) : report);
  });
};

const doOverwrite = (
  data: any,
  report: any = {
    ErrorMsg: "",
    TotalCount: 0,
    SuccessCount: 0,
    ErrorCount: 0,
    RemainCount: 0,
  },
) => {
  return new Promise(async resolve => {
    if (!inProgress) {
      report.TotalCount += data.length;
      report.RemainCount += data.length;
      resolve(report);
      return;
    }
    const chunk = data.splice(0, excelChunkCount);
    const startTime = performance.now();
    const result = await override(chunk);
    const endTime = performance.now();
    currentProgress += excelChunkCount;

    setRemainProgress(startTime, endTime);

    if (result.status === 200) {
      let resultObj = JSON.parse(result.data);
      report.ErrorMsg += `${report.ErrorMsg?.length > 0 ? "\n" : ""}${resultObj.ErrorMsg}`;
      report.TotalCount += resultObj.TotalCount;
      report.SuccessCount += resultObj.SuccessCount;
      report.ErrorCount += resultObj.ErrorCount;
    }

    resolve(data.length > 0 ? doAppend(data, report) : report);
  });
};

const onProgressComplete = () => {
  errorMsg = reportSummary.ErrorMsg;
  total = reportSummary.TotalCount;
  success = reportSummary.SuccessCount;
  fail = reportSummary.ErrorCount;
  remain = reportSummary.RemainCount;

  reaminProgress = 0;
  calcTickTime = [];

  if (reportSummary.ErrorMsg) {
    resultPopupHeight = 500;
  }

  inProgress = false;

  emit("reload");
};

const onResultHiding = async (e: any) => {
  if (!inProgress) return onHidden();
  if (await showConfirm({ message: t("ConfirmStop") as string })) {
    currentProgress = totalProgress;
    inProgress = false;
    return;
  }

  e.cancel = true;
};

const onGetFooterText = () => {
  return `TotalCount: ${total}, Success: ${success}, Fail: ${fail}, Remain: ${remain}`;
};

const onDropZoneEnter = (e: any) => {
  isDropZoneActive = true;
};
const onDropZoneLeave = (e: any) => {
  isDropZoneActive = false;
};
const onUploaded = (e: any) => {
  const { file } = e;
  const fileReader = new FileReader();
  fileReader.onload = () => {
    isDropZoneActive = false;
  };
  fileReader.readAsDataURL(file);
  // textVisible = false;
  // progressVisible = false;
  // progressValue = 0;
};
// const onProgress = (e: any) => {
//   progressValue = (e.bytesLoaded / e.bytesTotal) * 100;
// }
// const onUploadStarted= () => {
//   progressVisible = true;
// }

const onShowing = () => {
  popup._$wrapper[0].style.zIndex = 1601;
};

const onHidden = () => {
  if (uploader) uploader.reset();
  showResult = false;
  isUploaded = false;
  data = [];
  validData = [];
  popupWidth = 400;
  emit("closed");
};
</script>
