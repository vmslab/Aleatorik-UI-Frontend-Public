<template>
  <div>
    <moz-controller>
      <DxButton
        v-tooltip="{ text: $t('Add') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :text="$t('Add')"
        @click="onAddRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Edit') }"
        class="moz-default-button"
        icon="edit"
        type="default"
        :text="$t('Edit')"
        :disabled="!showEditButton"
        @click="onEditRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Delete') }"
        class="moz-default-button"
        icon="trash"
        type="default"
        :text="$t('Delete')"
        :disabled="!showEditButton"
        @click="onRemoveRow"
      />
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :text="$t('Search')"
        @click="onRefreshData"
      ></DxButton>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <DxDataGrid
        :cache-enabled="true"
        class="moz-edit-datagrid moz-edit-datagrid-show-toolbar footer-has-grid"
        ref="dataGrid"
        width="var(--size-content-inner-width)"
        height="var(--size-content-inner-height-outer-controller)"
        :autoNavigateToFocusedRow="true"
        :remote-operations="{ groupPaging: true }"
        :data-source="dataSource"
        :row-alternation-enabled="true"
        :show-row-lines="false"
        :show-column-lines="false"
        :allow-column-resizing="true"
        :allow-column-reordering="true"
        :column-auto-width="false"
        :repaint-changes-only="true"
        :two-way-binding-enabled="false"
        :hoverStateEnabled="true"
        columnResizingMode="widget"
        no-data-text="No data to display"
        @toolbar-preparing="onToolbarPreparing"
        @context-menu-preparing="onContextMenuPreparing"
        @selection-changed="onSelectionChanged"
        @option-changed="onOptionChanged"
        @row-dbl-click="onRowDblClick"
      >
        <DxLoadPanel :enabled="activeLoadPanel" />
        <DxScrolling mode="virtual" :renderAsync="false" :preloadEnabled="true" />
        <DxPaging />
        <DxPager />

        <DxSelection mode="single" />

        <DxFilterRow :visible="checkRowFilter" />
        <DxHeaderFilter :visible="true" />

        <DxGroupPanel :visible="checkGroupPanel" />
        <DxGrouping :contextMenuEnabled="true" :auto-expand-all="false" />

        <DxSummary>
          <DxTotalItem
            column="PROJECT_ID"
            alignment="center"
            summary-type="count"
            display-format="{0} Rows"
          />
        </DxSummary>
        <DxColumnFixing :enabled="true" />

        <DxColumn width="auto" data-field="PROJECT_ID" />
        <DxColumn width="auto" data-field="CUSTOMER_ID" />
        <DxColumn width="auto" data-field="CUSTOMER_NAME" />
        <DxColumn width="auto" data-field="SERVER_ID" />
        <DxColumn width="auto" data-field="ADDRESS" />
        <DxColumn width="auto" data-field="DBSERVER_ID" />
        <DxColumn width="auto" data-field="DBSERVER_ADDRESS" />
        <DxColumn width="auto" data-field="SYS_NAME" />
        <!-- <DxColumn width="auto" data-field="SYS_KEY" /> -->
        <DxColumn width="auto" data-field="STATUS" cell-template="statustemplate" />
        <template #statustemplate="{ data }">
          <div>
            <i class="dx-icon-isnotblank" :class="getLevelClass(data)" />
            {{ data.data.STATUS }}
          </div>
        </template>
        <DxColumn
          data-filed="_blank"
          caption=""
          :allowEditing="false"
          :allowExporting="false"
          :allowFiltering="false"
          :allowGrouping="false"
          :allowHeaderFiltering="false"
          :allowReordering="false"
          :allowResizing="false"
          :allowSorting="false"
        />
      </DxDataGrid>
      <DxPopup
        class="moz-popup"
        :visible="isShowEditPopup"
        :show-title="true"
        title="Project"
        :width="600"
        height="auto"
        @hiding="
          () => {
            isShowEditPopup = false;
          }
        "
        @hidden="
          () => {
            dataForm.resetValues();
            dataForm.repaint();
          }
        "
      >
        <div class="moz-area-padding">
          <DxForm
            ref="dataForm"
            class="moz-form"
            :form-key="formKey"
            :form-data="formData"
            validation-group="projectData"
          >
            <DxItem
              data-field="PROJECT_ID"
              :editor-options="{
                disabled: !isAddRow,
              }"
            >
              <DxRequiredRule :message="`${$t('PROJECT_ID')} is required`" />
              <DxPatternRule
                :pattern="/^[a-z0-9]+$/"
                :message="`${$t('PROJECT_ID')} must be a lowercase letter and a number.`"
              />
              <DxAsyncRule
                :validation-callback="validationProjectID"
                :message="`${$t('PROJECT_ID')} is already registered`"
              />
            </DxItem>
            <DxItem data-field="CUSTOMER_ID" template="customerTemplate">
              <DxRequiredRule :message="`${$t('CUSTOMER_ID')} is required`" />
            </DxItem>
            <DxItem data-field="SERVER_ID" template="serverTemplate">
              <DxRequiredRule :message="`${$t('SERVER_ID')} is required`" />
            </DxItem>
            <DxItem data-field="DBSERVER_ID" template="dbserverTemplate">
              <DxRequiredRule :message="`${$t('DBSERVER_ID')} is required`" />
            </DxItem>
            <DxItem data-field="SYS_NAME">
              <DxRequiredRule :message="`${$t('SYS_NAME')} is required`" />
            </DxItem>
            <DxItem data-field="LOGIN_IMAGE" caption="" template="loginImgTemplate">
              <DxLabel :text="$t('LOGIN_IMAGE') + ' (4MB)'" />
            </DxItem>
            <DxItem data-field="LOGO_IMAGE" template="logoImgTemplate">
              <DxLabel :text="$t('LOGO_IMAGE') + ' (4MB)'" />
            </DxItem>
            <DxItem data-field="LOGO_IMAGE_DARK" template="logoImgDarkTemplate">
              <DxLabel :text="$t('LOGO_IMAGE_DARK') + ' (4MB)'" />
            </DxItem>
            <div slot="customerTemplate" slot-scope="{}">
              <DropDown
                v-if="isAddRow"
                dataKey="CUSTOMER_NAME"
                :width="450"
                :height="300"
                :items="customerItems"
                :dataFields="customerFields"
                :selectedValue="selectedCustomer"
                @value-changed="onCustomerSelectionChanged"
              />
              <DxTextBox v-else :value="formData.CUSTOMER_ID" :disabled="true" />
            </div>
            <div slot="serverTemplate" slot-scope="{}">
              <DropDown
                v-if="isAddRow"
                dataKey="ADDRESS"
                :width="450"
                :height="300"
                :items="serverItems.filter(item => item.TYPE === 'WEB')"
                :dataFields="serverFields"
                :selectedValue="selectedServer"
                @value-changed="onServerSelectionChanged"
              />
              <DxTextBox v-else :value="formData.SERVER_ID" :disabled="true" />
            </div>
            <div slot="dbserverTemplate" slot-scope="{}">
              <DropDown
                v-if="isAddRow"
                dataKey="ADDRESS"
                :width="450"
                :height="300"
                :items="serverItems.filter(item => item.TYPE === 'DB')"
                :dataFields="serverFields"
                :selectedValue="selectedDBServer"
                @value-changed="onDBServerSelectionChanged"
              />
              <DxTextBox v-else :value="formData.DBSERVER_ID" :disabled="true" />
            </div>
            <div slot="loginImgTemplate" slot-scope="{}">
              <DxFileUploader
                ref="loginImgUploader"
                class="moz-file-uploader"
                :value="loginImg"
                upload-mode="useButtons"
                :multiple="false"
                :selectButtonText="$t(`SELECT_FILE`)"
                :labelText="$t(`OR_DROP_HERE`)"
                :allowed-file-extensions="['.jpg', '.png', '.gif']"
                @value-changed="onFileUploadLoginImg"
              />
            </div>
            <div slot="logoImgTemplate" slot-scope="{}">
              <DxFileUploader
                ref="logoImgUploader"
                class="moz-file-uploader"
                :value="logoImg"
                upload-mode="useButtons"
                :multiple="false"
                :selectButtonText="$t(`SELECT_FILE`)"
                :labelText="$t(`OR_DROP_HERE`)"
                :allowed-file-extensions="['.jpg', '.png', '.gif']"
                @value-changed="onFileUploadLogoImg"
              />
            </div>
            <div slot="logoImgDarkTemplate" slot-scope="{}">
              <DxFileUploader
                ref="logoImgDarkUploader"
                class="moz-file-uploader"
                :value="logoImgDark"
                upload-mode="useButtons"
                :multiple="false"
                :selectButtonText="$t(`SELECT_FILE`)"
                :labelText="$t(`OR_DROP_HERE`)"
                :allowed-file-extensions="['.jpg', '.png', '.gif']"
                @value-changed="onFileUploadLogoImgDark"
              />
            </div>
          </DxForm>
        </div>
        <DxToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          :options="{
            text: isAddRow ? $t('Add') : $t('Modify'),
            stylingMode: 'outlined',
            class: 'moz-button',
            onClick: onSaveData,
          }"
        />
      </DxPopup>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { createStoreConfig, ActionLoadOptions, showConfirm } from "mozart-component-dev";
import Entity from "@/generated/entity";
import {
  DxDataGrid,
  DxLoadPanel,
  DxColumn,
  DxExport,
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxPager,
  DxPaging,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
  DxEditing,
  DxTexts,
  DxSummary,
  DxTotalItem,
  DxColumnFixing,
  DxSelection,
} from "devextreme-vue/data-grid";
import { Get, Add, Modify, Remove } from "@/api/mainService";
import { getMonitoringSocketURL, parseData } from "@/utils/request";
import { loadLayout, saveLayout, removeLayout } from "@/utils/gridUtils";
import { setOnEditing } from "@/utils/commonUtils";
import { loadTableDatas } from "@/utils/dataUtils";
import "@/utils/dateUtils";

import DxButton from "devextreme-vue/button";
import CustomStore from "devextreme/data/custom_store";
import ValidationEngine from "devextreme/ui/validation_engine";

import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import {
  DxForm,
  DxItem,
  DxRequiredRule,
  DxPatternRule,
  DxRangeRule,
  DxAsyncRule,
  DxLabel,
} from "devextreme-vue/form";

import DxTextBox from "devextreme-vue/text-box";
import { DxFileUploader } from "devextreme-vue/file-uploader";

import DropDown from "@/views/tool/DropDownBox.vue";

interface IImageSize {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

@Component({
  components: {
    DxDataGrid,
    DxLoadPanel,
    DxColumn,
    DxExport,
    DxGrouping,
    DxGroupPanel,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxButton,
    DxFilterRow,
    DxHeaderFilter,
    DxEditing,
    DxTexts,
    DxSummary,
    DxTotalItem,
    DxColumnFixing,
    DxSelection,
    DxRequiredRule,
    DxPatternRule,
    DxRangeRule,
    DxPopup,
    DxForm,
    DxItem,
    DxTextBox,
    DxToolbarItem,
    DxAsyncRule,
    DxFileUploader,
    DxLabel,
    DropDown,
  },
})
export default class ProjectMgmt extends Vue {
  public filter: boolean = true;

  public tableName: string = "Project";
  public dataKey: string[] = ["PROJECT_ID"];

  public options: Record<string, any> = {};
  public formKey: any = {};
  public formData: any = {};

  public selectedProjectID = "";

  public customerItems: any[] = [];
  public customerFields: any[] = [{ key: "CUSTOMER_ID" }, { key: "CUSTOMER_NAME" }];
  public selectedCustomer = "";

  public serverItems: any[] = [];
  public serverFields: any[] = [{ key: "SERVER_ID" }, { key: "ADDRESS" }];
  public selectedServer = "";

  public selectedDBServer = "";

  public loginImage: any = null;
  public logoImage: any = null;
  public logoImageDark: any = null;

  public autoExpandAll = false;
  public checkRowFilter = true;
  public checkGroupPanel = false;
  public showEditButton = false;

  public isAddRow = false;
  public isChanging = false;

  public isShowEditPopup = false;
  public activeLoadPanel = true;

  public socket: WebSocket | null = null;
  private intervalId: NodeJS.Timer | null = null;

  private loginImgSize: IImageSize = {
    minWidth: 200,
    minHeight: 20,
    maxWidth: 300,
    maxHeight: 40,
  };
  private logoImgSize: IImageSize = {
    minWidth: 0,
    minHeight: 0,
    maxWidth: 180,
    maxHeight: 22,
  };

  constructor() {
    super();
  }

  public get loginImg() {
    let result = [];

    if (this.loginImage) {
      result.push({ name: this.loginImage.name });
    } else if (this.formData.LOGIN_IMAGE) {
      result.push({ name: this.formData.LOGIN_IMAGE });
    }
    return result;
  }

  public get logoImg() {
    let result = [];

    if (this.logoImage) {
      result.push({ name: this.logoImage.name });
    } else if (this.formData.LOGO_IMAGE) {
      result.push({ name: this.formData.LOGO_IMAGE });
    }
    return result;
  }

  public get logoImgDark() {
    let result = [];

    if (this.logoImageDark) {
      result.push({ name: this.logoImageDark.name });
    } else if (this.formData.LOGO_IMAGE_DARK) {
      result.push({ name: this.formData.LOGO_IMAGE_DARK });
    }
    return result;
  }

  public async created() {
    this.customerItems = await loadTableDatas("AT_CUSTOMER_MASTER");
    this.serverItems = await loadTableDatas("AT_SERVER_MASTER");
  }

  public async mounted() {
    await loadLayout(this.dataGrid);
  }

  public destroyed() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public get dataGrid() {
    return (this.$refs.dataGrid as any)?.instance;
  }

  public get dataForm() {
    return (this.$refs.dataForm as any)?.instance;
  }

  public getLevelClass(data: any): string {
    const level = data.data.STATUS;

    switch (level) {
      case "REGISTER":
        return "warning--text";
      case "SETUP":
        return "success--text";
      case "ACTIVATED":
        return "info--text";
      default:
        return "error--text";
    }
  }

  public getDateTimeValue({ value }: any): string {
    return (value as Date)?.toDateTimeString();
  }

  public onCustomerSelectionChanged(e: any) {
    this.selectedCustomer = e.CUSTOMER_NAME;
    this.formData.CUSTOMER_ID = e.CUSTOMER_ID;
  }

  public async onServerSelectionChanged(e: any) {
    this.selectedServer = e.ADDRESS;
    this.formData.SERVER_ID = e.SERVER_ID;

    this.formData.SYS_NAME = "";
  }

  public onDBServerSelectionChanged(e: any) {
    this.selectedDBServer = e.ADDRESS;
    this.formData.DBSERVER_ID = e.SERVER_ID;
  }

  public async onFileUploadLoginImg(e: any) {
    if (!e || !e.value || e.value.length === 0) return;

    const file = e.value[0] as File;
    if (!(file instanceof Blob)) return;

    const isSuccess = await this.validationImage(file, e.component, this.loginImgSize);
    this.loginImage = isSuccess ? file : null;
    this.formData.LOGIN_IMAGE = isSuccess ? file.name : "";
  }

  public async onFileUploadLogoImg(e: any) {
    if (!e || !e.value || e.value.length === 0) return;

    const file = e.value[0] as File;
    if (!(file instanceof Blob)) return;

    const isSuccess = await this.validationImage(file, e.component, this.logoImgSize);
    this.logoImage = isSuccess ? file : null;
    this.formData.LOGO_IMAGE = isSuccess ? file.name : "";
  }

  public async onFileUploadLogoImgDark(e: any) {
    if (!e || !e.value || e.value.length === 0) return;

    const file = e.value[0] as File;
    if (!(file instanceof Blob)) return;

    const isSuccess = await this.validationImage(file, e.component, this.logoImgSize);
    this.logoImageDark = isSuccess ? file : null;
    this.formData.LOGO_IMAGE_DARK = isSuccess ? file.name : "";
  }

  public validationImage(file: any, component: any, size: IImageSize) {
    return new Promise(resolve => {
      if (!file || !component) {
        component.reset();
        return resolve(false);
      }
      try {
        this.activeLoadPanel = true;

        const fileSize = file.size / 1024 / 1024;
        if (fileSize > 4) {
          MainModule.showSnackBar({ message: `${this.$t(`TooLargeFileSize`)}`, type: "error" });
          component.reset();
          return resolve(false);
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = result => {
          let image = new Image();
          image.src = reader.result as string;

          image.onload = () => {
            if (
              image.width > size.maxWidth ||
              image.height > size.maxHeight ||
              image.width < size.minWidth ||
              image.height < size.minHeight
            ) {
              MainModule.showSnackBar({ message: `${this.$t(`InvalidFileSize`)}`, type: "error" });
              component.reset();
              return resolve(false);
            }
            return resolve(true);
          };
          image.onerror = err => {
            MainModule.showSnackBar({
              message: `${this.$t(`ErrorFileReadMessage`)}`,
              type: "error",
            });
            component.reset();
            return resolve(false);
          };
        };
        reader.onerror = err => {
          MainModule.showSnackBar({ message: `${this.$t(`ErrorFileReadMessage`)}`, type: "error" });
          component.reset();
          return resolve(false);
        };
      } finally {
        this.activeLoadPanel = false;
      }
    });
  }

  public showRowFilter(): boolean {
    return this.checkRowFilter;
  }

  public showGroupPanel(): boolean {
    return this.checkGroupPanel;
  }

  public onSelectionChanged({ selectedRowKeys, selectedRowsData }: any) {
    const flag = selectedRowKeys.length > 0;

    if (flag) this.selectedProjectID = selectedRowKeys[0].PROJECT_ID;

    if (this.showEditButton != flag) this.showEditButton = flag;
  }

  public async connectWebSocket() {
    if (this.socket && this.socket.readyState === 1) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      return;
    }

    this.socket = new WebSocket(await getMonitoringSocketURL());
    if (this.socket) {
      this.socket.onopen = () => {
        console.log("socket opened");
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      };
      this.socket.onmessage = async (evt: MessageEvent) => {
        const result = JSON.parse(evt.data);
        console.log(result);

        if (result.obj === "DONE") {
          this.onRefreshData();
        }
      };
    }
    this.socket.onerror = (evt: any) => {
      console.log(evt);
      this.socket?.close();
    };
    this.socket.onclose = () => {
      console.log("socket close");
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(async () => {
        await this.connectWebSocket();
      }, 1000);
    };
  }

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        key: this.dataKey,
        loadFunc: this.loadFunc,
      }) as any,
    );
  }

  @Watch("checkGroupPanel", { immediate: true })
  public onChangeShowGroupPanel() {
    this.$nextTick(() => {
      let panel = document.querySelector(".dx-datagrid-header-panel") as HTMLElement;
      if (panel != null) panel.style.display = this.showGroupPanel() ? "" : "none";
    });
  }

  public async loadFunc(obj: ActionLoadOptions) {
    const result = await Get(this.tableName, { option: obj }, "post");
    const data = JSON.parse(result.data);

    if (this.activeLoadPanel) this.activeLoadPanel = false;
    return data;
  }

  public async insertFunc(values: any) {
    values.UPDATE_TIME = new Date();
    const obj = parseData(values, Entity.entities.Project!.properties);

    const multiPartData = new FormData();
    multiPartData.append("obj", JSON.stringify(obj));
    if (this.loginImage) multiPartData.append("login", this.loginImage);
    if (this.logoImage) multiPartData.append("logo", this.logoImage);
    if (this.logoImageDark) multiPartData.append("logoDark", this.logoImageDark);

    const result = await Add("Upload" + this.tableName, multiPartData);
    return JSON.parse(result.data);
  }

  public async updateFunc(values: any) {
    values.UPDATE_TIME = new Date();
    const obj = parseData(values, Entity.entities.Project!.properties);

    const multiPartData = new FormData();
    multiPartData.append("obj", JSON.stringify(obj));
    if (this.loginImage) multiPartData.append("login", this.loginImage);
    if (this.logoImage) multiPartData.append("logo", this.logoImage);
    if (this.logoImageDark) multiPartData.append("logoDark", this.logoImageDark);

    const result = await Modify("Upload" + this.tableName, multiPartData);
    return JSON.parse(result.data);
  }

  public async deleteFunc(key: any) {
    const obj = parseData(key, Entity.entities.Project!.properties);

    const result = await Remove(this.tableName, { obj });
    return JSON.parse(result.data);
  }

  public async showEditForm({ key, data }: any) {
    (this.$refs.loginfileuploader as any)?.instance.reset();
    (this.$refs.logofileuploader as any)?.instance.reset();
    this.isAddRow = false;
    this.formKey = key;
    this.formData = data;

    this.$nextTick(() => {
      this.isShowEditPopup = true;
    });
  }

  public validationProjectID({ value }: any) {
    return new Promise(async resolve => {
      this.activeLoadPanel = true;
      try {
        if (!this.isAddRow) return resolve(true);
        const projectDatas = await loadTableDatas("AT_PROJECT_MASTER");

        const result = !projectDatas.some(
          (item: any) => item.PROJECT_ID.toLowerCase() == value.toLowerCase(),
        );

        if (this.selectedServer) {
          const systemResult = await Get("ServerSystem", { address: this.selectedServer }, "post");
          const serverSystemItems = JSON.parse(systemResult.data);
          const systemValid = !serverSystemItems.some(
            (item: any) => item.SYSTEM_ID.toLowerCase() == value.toLowerCase(),
          );
          return resolve(result && systemValid);
        }
        resolve(result);
      } finally {
        this.activeLoadPanel = false;
      }
    });
  }

  public async onSaveLayout() {
    try {
      await saveLayout(this.dataGrid);
    } catch (e) {
      console.log("err", e);
    }
  }

  public async onRemoveLayout() {
    try {
      await removeLayout(this.dataGrid);
    } catch (e) {
      console.log("err", e);
    }
  }

  public onContextMenuPreparing(e: any) {
    if (!e.items) e.items = [];

    e.items.push({
      text: "Show Column Chooser",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.showColumnChooser();
      },
    });

    e.items.push({
      text: "Show Filter Row",
      icon: this.showRowFilter() ? "check" : "",
      beginGroup: true,
      onItemClick: () => {
        this.checkRowFilter = !this.checkRowFilter;
      },
    });

    e.items.push({
      text: "Show Group Panel",
      icon: this.showGroupPanel() ? "check" : "",
      onItemClick: (e: any) => {
        this.checkGroupPanel = !this.checkGroupPanel;
      },
    });

    if (e.column && (e.target == "headerPanel" || (e.row && e.row.rowType == "group"))) {
      let expandItems = [
        {
          text: "Expand All",
          onItemClick: (args: any) => {
            this.dataGrid.expandAll();
          },
        },
      ];
      let collapseItems = [
        {
          text: "Collapse All",
          onItemClick: (args: any) => {
            this.dataGrid.collapseAll();
          },
        },
      ];

      if (e.row && e.row.rowType == "group") {
        expandItems.push({
          text: `Expand Group '${e.row.key}'`,
          onItemClick: (args: any) => {
            this.dataGrid.expandRow(e.row.key);
          },
        });
        collapseItems.push({
          text: `Collapse Group '${e.row.key}'`,
          onItemClick: (args: any) => {
            this.dataGrid.collapseRow(e.row.key);
          },
        });
      }

      e.items.push({
        text: "Expand",
        beginGroup: true,
        items: expandItems,
      });
      e.items.push({
        text: "Collpase",
        items: collapseItems,
      });
    }

    e.items.push({
      text: "Layout",
      beginGroup: true,
      items: [
        {
          text: "Save Layout",
          onItemClick: (args: any) => {
            this.onSaveLayout();
          },
        },
        {
          text: "Remove Layout",
          onItemClick: (args: any) => {
            this.onRemoveLayout();
          },
        },
      ],
    });

    e.items.push({
      text: "Export to Excel",
      beginGroup: true,
      onItemClick: () => {
        this.dataGrid.exportToExcel();
      },
    });

    e.items.push({
      text: "Add Row",
      beginGroup: true,
      onItemClick: (e: any) => {
        this.onAddRow();
      },
    });

    if (e.row && e.row.rowType === "data") {
      e.items.push({
        text: "Delete Row",
        onItemClick: () => {
          this.onRemoveRow(e.rowIndex);
        },
      });
    }
  }

  public onToolbarPreparing(e: any) {
    for (let item of e.toolbarOptions.items) {
      if (item.widget === "dxButton") item.visible = false;
    }
  }

  public async onOptionChanged(e: any) {
    switch (e.name) {
      case "editing":
        let changes = e.component.option("editing.changes");
        this.isChanging = changes.length !== 0;

        setOnEditing(this.isChanging);
        break;
      case "columns":
        const fullNames = e.fullName.split(".");
        if (fullNames[1] === "groupIndex") this.checkGroupPanel = true;

        break;
    }
  }

  public onRefreshData() {
    this.dataGrid.deselectAll();
    this.dataGrid.refresh();
  }

  public onAddRow() {
    this.isAddRow = true;

    this.formData = {
      PROJECT_ID: "",
      CUSTOMER_ID: "",
      SERVER_ID: "",
      DBSERVER_ID: "",
      SYS_NAME: "",
      LOGIN_IMAGE: "",
      LOGO_IMAGE: "",
      LOGO_IMAGE_DARK: "",
      STATUS: "REGISTER",
    };

    this.selectedCustomer = "";
    this.selectedServer = "";
    this.selectedDBServer = "";

    this.loginImage = null;
    this.logoImage = null;
    this.logoImageDark = null;

    this.$nextTick(() => {
      this.isShowEditPopup = true;
    });
  }

  public onEditRow(index: number) {
    const selectedRows = this.dataGrid.getSelectedRowKeys();

    let rowIdx = Number.isInteger(index) ? index : -1;

    if (rowIdx < 0 && selectedRows && selectedRows.length > 0) {
      rowIdx = this.dataGrid.getRowIndexByKey(selectedRows[selectedRows.length - 1]);
    }

    if (rowIdx < 0) return;

    const rows = this.dataGrid.getVisibleRows();
    const row = rows[rowIdx];
    this.showEditForm(row);
  }

  public onRowDblClick(e: any) {
    if (e.data) {
      this.showEditForm(e);
    }
  }

  public async onSaveData(e: any) {
    const valid = ValidationEngine.validateGroup("projectData");
    if (!valid.isValid) {
      MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
      return;
    }
    if (valid.status === "pending") {
      const validResult = await valid.complete;

      if (!validResult || !validResult.isValid) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
    }

    let result;
    if (this.isAddRow) {
      result = await this.insertFunc(this.formData);
      if (result.count === 0) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
    } else {
      result = await this.updateFunc(this.formData);
      if (result.count === 0) {
        MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
        return;
      }
    }

    if (result) {
      this.dataGrid.refresh();
      this.dataGrid.deselectAll();
    }
    this.isShowEditPopup = false;
  }

  public onRemoveRow(index: number) {
    let rowIdx = Number.isInteger(index) ? index : -1;

    const selectedRows = this.dataGrid.getSelectedRowsData();
    if (rowIdx < 0 && selectedRows && selectedRows.length > 0) {
      this.removeService(selectedRows[0]);
    } else {
      const rows = this.dataGrid.getVisibleRows();

      this.removeService(rows[rowIdx]?.data);
    }
  }

  public async removeService(target: any) {
    if (!target) return;

    let result = await showConfirm({
      message: `${this.$t(`RemoveMessage`, [target.PROJECT_ID])}`,
      // title: `Delete`,
      // message: `Are you sure you want to <b>Delete</b> '${target.PROJECT_ID}?'`,
    });
    if (result) {
      const delResult = await this.deleteFunc(target);
      this.dataGrid.refresh();
    }
  }
}
</script>
<style lang="scss" scoped>
.info--text {
  color: var(--color-info);
}
.warning--text {
  color: var(--color-warning);
}
.error--text {
  color: var(--color-error);
}
.success--text {
  animation: on-working-effect 1s step-end infinite;
}

@keyframes on-working-effect {
  50% {
    color: var(--color-success);
  }
  100% {
    color: var(--color-default);
  }
}
</style>
