<template>
  <div>
    <DxPopup
      :visible="visible"
      v-if="!showResult"
      :title="$t(`ExcelImport`)"
      class="moz-popup"
      ref="popup"
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
          ref="uploader"
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
          @progress="onProgress"
          @upload-started="onUploadStarted"
        >
        </DxFileUploader>
        <div
          class="moz-drop-zone"
          :class="[
            isDropZoneActive
              ? 'dx-theme-accent-as-border-color dropzone-active'
              : 'dx-theme-border-color',
          ]"
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
        <WjFlexGrid
          :style="`width: ${popupWidth - 24}px; height: 500px;`"
          :itemsSource="data"
          :initialized="onInitialized"
          showSelectedHeaders="All"
          selectionMode="MultiRange"
          allowSorting="MultiColumn"
          keyActionTab="Cycle"
          :autoGenerateColumns="false"
          :deferResizing="true"
          :quickAutoSize="true"
          :imeEnabled="true"
          :alternatingRowStep="0"
          :isReadOnly="true"
          :formatItem="formatItem"
        >
          <WjFlexGridColumn
            v-for="(col, i) in columns"
            :binding="col"
            :key="col"
            :aggregate="i > 0 ? 'None' : 'Cnt'"
          />
        </WjFlexGrid>
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
          :status-format="
            value =>
              `In Progress : ${currentProgress} / ${totalProgress} (${(value * 100).toFixed(2)}%)`
          "
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

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import { showConfirm } from "../utils/dialogUtil";
import { DxButton } from "devextreme-vue/button";
import { DxForm } from "devextreme-vue/form";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxFileUploader } from "devextreme-vue/file-uploader";
import { BaseStore } from "../store/modules/baseStore";
import ExtendGrid from "../components/grid/ExtendGrid";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";

import { DxScrollView } from "devextreme-vue/scroll-view";
import { DxTextArea } from "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxProgressBar } from "devextreme-vue/progress-bar";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
    DxButton,
    DxForm,
    DxPopup,
    DxToolbarItem,
    DxFileUploader,
    DxScrollView,
    DxTextArea,
    DxLoadPanel,
    DxProgressBar,
  },
})
export default class ExcelAdvancedUploadPopup extends Vue {
  @Prop({ type: Boolean, default: false }) public visible!: boolean;
  @Prop({ type: Boolean, default: false }) public text!: boolean;
  @Prop({ type: Object }) public module?: BaseStore<any>;
  @Prop({ type: Function, required: true }) public upload!: Function;
  @Prop({ type: Function, required: true }) public append!: Function;
  @Prop({ type: Function, required: true }) public override!: Function;
  @Prop({ type: Function }) public download?: Function;
  @Prop({ type: Array }) public keyColumns?: string[];
  @Prop({ type: Array }) public exceptColumns?: string[];
  public data: any[] = [];
  public validData: any[] = [];
  public columns: string[] = [];
  public isUploaded: boolean = false;
  public file!: File;
  public popupWidth: number = 400;
  public resultPopupHeight: number = 200;
  public total: number = 0;
  public success: number = 0;
  public fail: number = 0;
  public remain: number = 0;
  public showResult: boolean = false;
  public error: boolean = true;
  public errorMsg: string = "";
  public loading: boolean = false;
  public isDropZoneActive: boolean = false;
  public textVisible: boolean = false;
  public progressVisible: boolean = false;
  public progressValue: number = 0;

  public excelChunkCount = 100;
  public inProgress: boolean = false;
  public totalProgress: number = 0;
  public currentProgress: number = 0;
  public reaminProgress: number = -1;
  public calcTickTime: number[] = [];

  public reportSummary: any = {};

  public grid: FlexGrid | null = null;

  constructor() {
    super();
  }

  public mounted() {
    this.popupWidth = this.text ? 900 : 400;
  }

  public get popup() {
    return (this.$refs.popup as any).instance;
  }

  public get uploader() {
    return (this.$refs.uploader as any)?.instance;
  }

  public get popupAttr() {
    return {
      class: "z-index-low",
    };
  }

  public isKeyColumn(name: string): boolean {
    if (!this.keyColumns || this.keyColumns?.length === 0) return false;
    return this.keyColumns?.includes(name);
  }

  public async onTextChanged(e: any) {
    if (!e.value) return;
    if (!e.value.includes("\n")) return;
    try {
      const result = await this.upload(e.value.split("\n"));

      if (result.status === 200) {
        this.$emit("notify", {
          message: "Upload Successed",
          type: "success",
        });

        const resultObj = JSON.parse(result.data);

        this.total = resultObj.TotalCount;
        this.success = resultObj.SuccessCount;
        this.fail = resultObj.ErrorCount;
        this.columns = Object.keys(resultObj.Table[0]).filter(
          (key: any) => !this.exceptColumns?.includes(key),
        );

        this.data = resultObj.Table;
        this.grid?.collectionView.refresh();

        this.isUploaded = true;
        this.popupWidth = 900;
      } else {
        this.$emit("notify", {
          message: "Upload failed",
          type: "error",
        });
      }
    } catch (err: any) {
      this.$emit("notify", {
        message: "Upload failed",
        type: "error",
      });
    } finally {
      this.loading = false;
    }
  }

  public async onFileChanged(e: any) {
    this.file = e.value[0];
    this.data = [];
    this.loading = true;

    try {
      const result = await this.upload(this.file);

      if (result.status === 200) {
        this.$emit("notify", {
          message: "Upload Successed",
          type: "success",
        });

        const resultObj = JSON.parse(result.data);

        this.total = resultObj.TotalCount;
        this.success = resultObj.SuccessCount;
        this.fail = resultObj.ErrorCount;
        this.columns = Object.keys(resultObj.Table[0]).filter(
          (key: any) => !this.exceptColumns?.includes(key),
        );

        this.data = resultObj.Table;
        this.grid?.collectionView.refresh();

        this.isUploaded = true;
        this.popupWidth = 900;
      } else {
        this.$emit("notify", {
          message: "Upload failed",
          type: "error",
        });
      }
    } catch (err: any) {
      this.$emit("notify", {
        message: "Upload failed",
        type: "error",
      });
    } finally {
      this.loading = false;
    }
  }

  public onInitialized(grid: any) {
    this.grid = grid;
    new ExtendGrid({
      flexGrid: grid,
      gridOptions: {
        useSelector: false,
        useAutoColumnFit: false,
        useGroupPanel: false,
        useContextMenu: false,
        useFilter: false,
        useParseDate: false,
      },
    });
  }

  public formatItem(s: FlexGrid, e: any) {
    if (s.columns.length === 0) return;

    const binding = s.columns[e.col]?.binding;

    if (
      binding &&
      this.keyColumns?.includes(binding) &&
      !this.exceptColumns?.includes(binding) &&
      !e.cell.textContent
    )
      e.cell.classList.add("invalid-row");
  }

  // public async onCheckGrid() {
  //   this.validData = [...this.data];
  //   const invalidIdx: number[] = [];

  //   this.data.forEach((item: any, idx: number) => {
  //     this.keyColumns?.forEach((key: string) => {
  //       if (this.exceptColumns?.includes(key)) return;
  //       if (!item[key]) {
  //         invalidIdx.push(idx);
  //         this.validData = this.validData.filter(t => t !== item);
  //       }
  //     });
  //   });

  //   if (invalidIdx.length > 0) {
  //     await this.grid.selectRowsByIndexes(invalidIdx);
  //   }
  // }

  public async onDownloadExcel() {
    if (!this.download) return;
    this.loading = true;
    try {
      await this.download();
    } finally {
      this.loading = false;
    }
  }

  public getByteLength = (s: any, b?: any, i?: any, c?: any) => {
    for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
    return b;
  };

  public async onAddExcel() {
    // this.loading = true;

    this.inProgress = true;
    this.showResult = true;
    this.resultPopupHeight = 200;
    this.totalProgress = this.validData.length;
    this.currentProgress = 0;
    this.reportSummary = await this.doAppend(this.validData);
    this.currentProgress++;
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
    // this.$emit("reload");
    // }
    // this.loading = false;
  }

  public async onOverwriteExcel() {
    if (!(await showConfirm({ message: this.$t("CONFIRM_OVERWRITE") as string }))) return;

    // this.loading = true;

    this.inProgress = true;
    this.showResult = true;
    this.resultPopupHeight = 200;
    this.totalProgress = this.validData.length;
    this.currentProgress = 0;
    this.reportSummary = await this.doOverwrite(this.validData);
    this.currentProgress++;
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
    // this.$emit("reload");
    // }
    // this.loading = false;
  }

  public setRemainProgress(startTime: number, endTime: number) {
    const remainPart = (this.totalProgress - this.currentProgress) / this.excelChunkCount;
    const tickTime = (endTime - startTime) / 1000;
    this.calcTickTime.push(tickTime);
    const avgTickTime = this.calcTickTime.reduce((a, b) => a + b) / this.calcTickTime.length;
    this.reaminProgress = Math.round(avgTickTime * remainPart);
  }

  public doAppend(
    data: any,
    report: any = {
      ErrorMsg: "",
      TotalCount: 0,
      SuccessCount: 0,
      ErrorCount: 0,
      RemainCount: 0,
    },
  ) {
    return new Promise(async resolve => {
      if (!this.inProgress) {
        report.TotalCount += data.length;
        report.RemainCount += data.length;
        resolve(report);
        return;
      }
      const chunk = data.splice(0, this.excelChunkCount);
      const startTime = performance.now();
      const result = await this.append(chunk);
      const endTime = performance.now();

      this.currentProgress += this.excelChunkCount;

      this.setRemainProgress(startTime, endTime);

      if (result.status === 200) {
        let resultObj = JSON.parse(result.data);
        report.ErrorMsg += `${report.ErrorMsg?.length > 0 ? "\n" : ""}${resultObj.ErrorMsg}`;
        report.TotalCount += resultObj.TotalCount;
        report.SuccessCount += resultObj.SuccessCount;
        report.ErrorCount += resultObj.ErrorCount;
      }

      resolve(data.length > 0 ? this.doAppend(data, report) : report);
    });
  }

  public doOverwrite(
    data: any,
    report: any = {
      ErrorMsg: "",
      TotalCount: 0,
      SuccessCount: 0,
      ErrorCount: 0,
      RemainCount: 0,
    },
  ) {
    return new Promise(async resolve => {
      if (!this.inProgress) {
        report.TotalCount += data.length;
        report.RemainCount += data.length;
        resolve(report);
        return;
      }
      const chunk = data.splice(0, this.excelChunkCount);
      const startTime = performance.now();
      const result = await this.override(chunk);
      const endTime = performance.now();
      this.currentProgress += this.excelChunkCount;

      this.setRemainProgress(startTime, endTime);

      if (result.status === 200) {
        let resultObj = JSON.parse(result.data);
        report.ErrorMsg += `${report.ErrorMsg?.length > 0 ? "\n" : ""}${resultObj.ErrorMsg}`;
        report.TotalCount += resultObj.TotalCount;
        report.SuccessCount += resultObj.SuccessCount;
        report.ErrorCount += resultObj.ErrorCount;
      }

      resolve(data.length > 0 ? this.doAppend(data, report) : report);
    });
  }

  public onProgressComplete() {
    this.errorMsg = this.reportSummary.ErrorMsg;
    this.total = this.reportSummary.TotalCount;
    this.success = this.reportSummary.SuccessCount;
    this.fail = this.reportSummary.ErrorCount;
    this.remain = this.reportSummary.RemainCount;

    this.reaminProgress = 0;
    this.calcTickTime = [];

    if (this.reportSummary.ErrorMsg) {
      this.resultPopupHeight = 500;
    }

    this.inProgress = false;

    this.$emit("reload");
  }

  public async onResultHiding(e: any) {
    if (!this.inProgress) return this.onHidden();
    if (await showConfirm({ message: this.$t("ConfirmStop") as string })) {
      this.currentProgress = this.totalProgress;
      this.inProgress = false;
      return;
    }

    e.cancel = true;
  }

  public onGetFooterText() {
    return `TotalCount: ${this.total}, Success: ${this.success}, Fail: ${this.fail}, Remain: ${this.remain}`;
  }

  onDropZoneEnter(e: any) {
    this.isDropZoneActive = true;
  }
  onDropZoneLeave(e: any) {
    this.isDropZoneActive = false;
  }
  onUploaded(e: any) {
    const { file } = e;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.isDropZoneActive = false;
    };
    fileReader.readAsDataURL(file);
    this.textVisible = false;
    this.progressVisible = false;
    this.progressValue = 0;
  }
  onProgress(e: any) {
    this.progressValue = (e.bytesLoaded / e.bytesTotal) * 100;
  }
  onUploadStarted() {
    this.progressVisible = true;
  }

  public onShowing() {
    this.popup._$wrapper[0].style.zIndex = 1601;
  }

  public onHidden() {
    if (this.uploader) this.uploader.reset();
    this.showResult = false;
    this.isUploaded = false;
    this.data = [];
    this.validData = [];
    this.popupWidth = 400;
    this.$emit("closed");
  }
}
</script>
<style>
.invalid-row {
  background-color: #f7d0d0 !important;
}
</style>
