<template>
  <div>
    <moz-controller :showFilter="filter">
      <!-- <DxButton
        v-tooltip="{ text: $t('Filter') }"
        class="moz-default-button"
        icon="filter"
        type="default"
        :text="$t('Filter')"
        @click="filter = !filter"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('제품오류') }"
        class="moz-default-button"
        icon="warning"
        type="default"
        :text="$t('제품오류')"
        :visible="isWrite"
        @click="errorPop"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('W/O Mapping') }"
        class="moz-default-button"
        icon="warning"
        type="default"
        :text="$t('W/O맵핑')"
        :visible="isWrite"
        @click="woMappingPop"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('W/O전송') }"
        class="moz-default-button"
        icon="download"
        type="default"
        :text="$t('W/O전송')"
        @click="woSendPop"
        :visible="isWrite"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('정리') }"
        class="moz-default-button"
        icon="orderedlist"
        type="default"
        :text="$t('정리')"
        @click="onEngineExec"
        :visible="isWrite"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('확정') }"
        class="moz-default-button"
        icon="pin"
        type="default"
        :text="$t('확정')"
        :visible="isWrite"
        @click="organizePop"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('추가') }"
        class="moz-default-button"
        icon="add"
        type="default"
        :text="$t('추가')"
        :visible="isWrite"
        @click="addClickEvent"
      ></DxButton> -->
      <!-- <DxButton
        v-tooltip="{ text: $t('엑셀 다운로드') }"
        class="moz-default-button"
        icon="download"
        type="default"
        :text="$t('엑셀 다운로드')"
        @click="onXlsDown"
        :visible="isWrite"
      /> -->
      <DxButton
        v-tooltip="{ text: $t('Search') }"
        class="moz-default-button"
        icon="search"
        type="default"
        :text="$t('Search')"
        @click="onSearch"
      ></DxButton>
      <div slot="filter">
        <label>시작일</label>
        <DxDateBox
          v-model:value="fromDate"
          :use-mask-behavior="true"
          type="date"
          displayFormat="yyyy-MM-dd"
          :width="150"
        />
      </div>
      <div slot="filter">
        <label>종료일</label>
        <DxDateBox
          v-model:value="toDate"
          :use-mask-behavior="true"
          type="date"
          displayFormat="yyyy-MM-dd"
          :width="150"
        />
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('1Week Prev') }"
          class="moz-default-button"
          icon="chevrondoubleleft"
          type="danger"
          styling-mode="outlined"
          :visible="isWrite"
          @click="weekPrev"
        ></DxButton>
      </div>
      <div slot="filter">
        <DxButton
          v-tooltip="{ text: $t('1Week Next') }"
          class="moz-default-button"
          icon="chevrondoubleright"
          type="danger"
          styling-mode="outlined"
          :visible="isWrite"
          @click="weekNext"
        ></DxButton>
      </div>
      <!-- <div slot="filter">
        <DxCheckBox v-model:value="selectedWeek" :icon-size="20" text="1 Week" />
      </div>
      <div slot="filter">
        <DxCheckBox v-model:value="selectedMonth" :icon-size="20" text="1 Month" />
      </div> -->
      <div slot="filter" style="margin-left: auto; line-height: 100%; height: 100%">
        <div v-show="taskStatus">
          <span style="vertical-align: middle; color: brown; font-weight: bold; padding-right: 5px"
            >엔진수행중</span
          >
          <DxLoadIndicator
            :height="25"
            :width="25"
            :visible="true"
            style="vertical-align: middle"
            shading-color="rgba(0, 0, 0, 0.2)"
          />
        </div>
      </div>
    </moz-controller>
    <div class="moz-frame-for-outer-control">
      <DxDataGrid
        width="100%"
        height="50%"
        ref="dataGrid"
        id="grid"
        class="moz-edit-datagrid sche-grid"
        :data-source="dataSource"
        :columns="columns"
        :allow-column-reordering="false"
        :allow-column-resizing="true"
        :column-auto-width="true"
        :auto-navigate-to-focused-row="false"
        :show-borders="true"
        :show-column-lines="true"
        :show-row-lines="true"
        :hover-state-enabled="false"
@focused-cell-changing="
  e => {
    e.cancel = true;
  }
"
        no-data-text=""
      >
        <template #header-cell-template="{ data }">
          <HeaderScheCell :cell-data="data"></HeaderScheCell>
        </template>
        <template #cell-template="{ data }">
          <ScheCell
            :cell-data="data"
            :from-date="fromDate"
            :fix-date="fixDate"
            @change-qty="onChangeQty"
            @move-item="onMoveItem"
            @get-scroll="onGetScroll"
            @item-ctx-menu="onItemCtxMenu"
          ></ScheCell>
        </template>
        <DxLoadPanel :enabled="true"></DxLoadPanel>
        <DxScrolling
          mode="standard"
          show-scrollbar="always"
          :scroll-by-content="true"
          :scroll-by-thumb="true"
        ></DxScrolling>

        <DxSorting mode="none"></DxSorting>
        <!-- <DxExport :enabled="true"></DxExport> -->
        <DxHeaderFilter :visible="true"></DxHeaderFilter>
        <DxFilterRow :visible="false"></DxFilterRow>
        <!-- <DxColumnFixing :enabled="true"></DxColumnFixing> -->
      </DxDataGrid>
      <!-- <div
        v-show="exceldownloadaui"
        style="height: 0px"
        class="moz-frame-for-outer-control aui-grid"
      >
        <AUIGrid ref="dataGridExcel"> </AUIGrid>
      </div>
      <div
        v-show="woexceldownloadaui"
        style="height: 0px"
        class="moz-frame-for-outer-control aui-grid"
      >
        <AUIGrid ref="dataGridWo"> </AUIGrid>
      </div> -->
      <!-- <DxContextMenu
        :data-source="ctxMenuList"
        :width="200"
        target=".task-ctx-clazz"
        @item-click="onTaskClick"
      ></DxContextMenu> -->
    </div>
    <DxLoadPanel
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :close-on-outside-click="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
    <!-- <DxPopup
      :visible="popupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="popupWidth"
      :height="popupHeight"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @hiding="
        () => {
          popupVisible = false;
          isPopupReady = false;
        }
      "
      :title="popupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="popupButtonOptionsSave"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="popupButtonOptionsClose"
      />
      <div v-show="isPopupReady">
        <div class="dx-fieldset">
          <div class="dx-field">
            <div class="dx-field-label" style="width: 80px; float: left">자재코드</div>
            <div class="dx-field-value" style="width: 200px; float: left; padding-right: 20px">
              <DxSelectBox
                :search-enabled="true"
                :data-source="productSource"
                :search-mode="searchModeOption"
                :search-expr="searchExprOption"
                :search-timeout="searchTimeoutOption"
                :min-search-length="minSearchLengthOption"
                :show-data-before-search="showDataBeforeSearchOption"
                v-model:value="selectedProduct"
                :disabled="isModifyPopupReady"
                @value-changed="productListOnChange"
                display-expr="PROD_CODE"
                value-expr="PROD_CODE"
              />
            </div>
            <div class="dx-field-label" style="width: 100px; float: left">자재표시</div>
            <div class="dx-field-value" style="width: 200px; float: left">
              <DxTextBox :show-clear-button="true" v-model:value="selectedProductView" />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label" style="width: 80px; float: left">생산일자</div>
            <div class="dx-field-value" style="width: 200px; float: left; padding-right: 20px">
              <DxDateBox
                v-model:value="addPlanDate"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
            <div class="dx-field-label" style="width: 100px; float: left">Target일자</div>
            <div class="dx-field-value" style="width: 200px; float: left">
              <DxDateBox
                v-model:value="addTargetDate"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label" style="width: 80px; float: left">계획수량</div>
            <div class="dx-field-value" style="width: 200px; float: left; padding-right: 20px">
              <DxNumberBox :show-clear-button="true" v-model:value="selectedPlanQty" />
            </div>
            <div class="dx-field-label" style="width: 100px; float: left">설비</div>
            <div class="dx-field-value" style="width: 200px; float: left">
              <DxSelectBox
                :items="selectLineList"
                v-model:value="selectedLine"
                value-expr="LINE_NO"
                display-expr="LINE_NAME"
              />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label" style="width: 80px; float: left">계획고정</div>
            <div class="dx-field-value" style="width: 200px; float: left; padding-right: 20px">
              <DxSelectBox
                :items="addYNList"
                v-model:value="selectedAddPlanFix"
                value-expr="CMCODE_ID"
                display-expr="CMCODE_DESCR"
              />
            </div>
          </div>
        </div>
      </div>
    </DxPopup>
    <DxPopup
      :visible="organizePopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="250"
      :height="250"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @hiding="
        () => {
          organizePopupVisible = false;
          isOrganizePopupReady = false;
        }
      "
      :title="organizePopupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="organizePopupButtonOptionsSave"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="organizePopupButtonOptionsClose"
      />
      <div v-show="isOrganizePopupReady">
        <div class="dx-fieldset">
          <div class="dx-field">
            <div class="dx-field-label">1호기</div>
            <div class="dx-field-value">
              <DxDateBox
                v-model:value="modifyline1Date"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label">2호기</div>
            <div class="dx-field-value">
              <DxDateBox
                v-model:value="modifyline2Date"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label">3호기</div>
            <div class="dx-field-value">
              <DxDateBox
                v-model:value="modifyline3Date"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div class="dx-field">
            <div class="dx-field-label">4호기</div>
            <div class="dx-field-value">
              <DxDateBox
                v-model:value="modifyline4Date"
                :use-mask-behavior="true"
                type="date"
                displayFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>
      </div>
    </DxPopup>
    <DxPopup
      :visible="errorPopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="560"
      :height="440"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @content-ready="onPopupErrorReady"
      @hiding="
        () => {
          errorPopupVisible = false;
          isErrorPopupReady = false;
        }
      "
      :title="errorPopupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="errorPopupButtonOptionsClose"
      />
      <div v-show="isErrorPopupReady" class="grid-wrap-pop-prod-error">
        <AUIGrid ref="dataGridError"></AUIGrid>
      </div>
    </DxPopup>
    <DxPopup
      :visible="alertPopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="400"
      :height="150"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @hiding="
        () => {
          alertPopupVisible = false;
          isAlertPopupReady = false;
        }
      "
      :title="alertPopupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="alertPopupButtonOptionsClose"
      />
      <div
        v-show="isAlertPopupReady"
        style="padding: var(--size-card-top-padding) var(--size-card-rbl-padding)"
      >
        <div>
          {{ alertContent }}
        </div>
      </div>
    </DxPopup>
    <DxPopup
      :visible="woMappingPopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="760"
      :height="445"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @content-ready="onPopupWoMappingReady"
      @hiding="
        () => {
          woMappingPopupVisible = false;
        }
      "
      :title="woMappingPopupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woMappingPopupButtonOptionsClose"
      />

      <div v-show="woMappingPopupVisible" class="grid-wrap-pop-wo-mapping">
        <AUIGrid ref="dataGridWoMapping" @cellDoubleClick="onMappingCellDoubleClick"></AUIGrid>
      </div>
    </DxPopup>

    <DxPopup
      :visible="woSendPopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="910"
      :height="445"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @content-ready="onPopupWoSendReady"
      @hiding="
        () => {
          woSendPopupVisible = false;
          isWoSendPopupReady = false;
        }
      "
      :title="woSendPopupTitle"
    >
      <DxPosition at="center" my="center" />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woSendPopupButtonOptionsSave"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woSendPopupButtonOptionsCheck"
      />

      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woSendPopupButtonOptionsClose"
      />

      <div v-show="isWoSendPopupReady" class="grid-wrap-pop-wo-send">
        <AUIGrid ref="dataGridWoSend"></AUIGrid>
      </div>
    </DxPopup>
    <DxPopup
      :visible="woEditPopupVisible"
      :show-close-button="true"
      :show-title="true"
      :shading="false"
      :dragOutsideBoundary="false"
      :width="672"
      :height="350"
      :restorePosition="false"
      :drag-enabled="true"
      :resizeEnabled="false"
      container="dx-viewport"
      @hiding="
        () => {
          woEditPopupVisible = false;
          isWoEditPopupReady = false;
        }
      "
      :title="woEditPopupTitle"
    >
      <DxPosition at="center" my="center" />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woEditPopupButtonOptionsDelete"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woEditPopupButtonOptionsSave"
      />
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="woEditPopupButtonOptionsClose"
      />
      <div v-show="isWoEditPopupReady">
        <div style="width: 250px; height: 250px; float: left">
          <div class="dx-card">
            <div class="dx-card-title" style="background-color: rgba(255, 182, 141, 0.5)">
              <div class="dx-card-title-text">PRIME</div>
              <div class="spacer"></div>
            </div>
          </div>
          <div class="dx-fieldset">
            <div class="dx-field">
              <div class="dx-field-label">제품코드</div>
              <div class="dx-field-value">
                <DxTextBox v-model:value="selectedWoItemId" :readOnly="true" />
              </div>
            </div>
          </div>
          <div class="dx-fieldset">
            <div class="dx-field">
              <div class="dx-field-label">계획날짜</div>
              <div class="dx-field-value">
                <DxTextBox v-model:value="selectedWoPlanDate" :readOnly="true" />
              </div>
            </div>
          </div>
          <div class="dx-fieldset">
            <div class="dx-field">
              <div class="dx-field-label">호기</div>
              <div class="dx-field-value">
                <DxTextBox v-model:value="selectedWoLineNo" :readOnly="true" />
              </div>
            </div>
          </div>
          <div class="dx-fieldset">
            <div class="dx-field">
              <div class="dx-field-label">수량</div>
              <div class="dx-field-value">
                <DxNumberBox v-model:value="selectedWoPlanQty" :readOnly="true" />
              </div>
            </div>
          </div>
          <p></p>
          <div class="dx-fieldset">
            <div class="dx-field">
              <div class="dx-field-label">WO_ID</div>
              <div class="dx-field-value">
                <DxTextBox v-model:value="selectedWoView" :readOnly="true" />
              </div>
            </div>
          </div>
        </div>
        <div style="width: 421px; height: 250px; float: right">
          <div class="dx-card">
            <div class="dx-card-title" style="background-color: rgba(255, 182, 141, 0.5)">
              <div class="dx-card-title-text">MES</div>
              <div class="spacer"></div>
            </div>
          </div>
          <AUIGrid
            style="width: 4212px; height: 214px"
            ref="dataGridWoEditView"
            @cellDoubleClick="onWoCellDoubleClick"
          ></AUIGrid>
        </div>
      </div>
    </DxPopup> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DxButton from "devextreme-vue/button";
import DxSelectBox from "devextreme-vue/select-box";
import DxTextBox from "devextreme-vue/text-box";
import { DxNumberBox } from "devextreme-vue/number-box";
import { DxDateBox } from "devextreme-vue/date-box";
import { DxCheckBox } from "devextreme-vue/check-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxPopup, DxPosition, DxToolbarItem } from "devextreme-vue/popup";
import {
  DxDataGrid,
  DxScrolling,
  DxSorting,
  DxExport,
  DxColumn,
  DxFilterRow,
  DxHeaderFilter,
  DxColumnFixing,
} from "devextreme-vue/data-grid";
import DxContextMenu from "devextreme-vue/context-menu";
import groupBy from "lodash/groupBy";

// import AUIGrid from "../../static/AUIGrid-Vue.js/AUIGrid.vue";
// import AuiCol, { IAuiCol, setAuiContextMenu, AddAuiColFilter } from "../../data/AuiCol";

import { Get, Modify, Remove } from "@/api/mainService";
import { confirm, alert, custom } from "devextreme/ui/dialog";
import { MainModule } from "@/store/modules/mainStore";
import { makeParams, SplitBox } from "mozart-component-wijmo";
import { EventBus } from "mozart-common";
import dayjs, { Dayjs } from "dayjs";
import { LINE_NO_DEFINES } from "./Constant";
// import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

import { getWebSocketURL } from "@/utils/request";
import { DxLoadIndicator } from "devextreme-vue/load-indicator";
// import BaseView from "../../data/BaseComponent";
import HeaderScheCell from "./HeaderScheCell.vue";
import ScheCell from "./ScheCell.vue";
import { json } from "stream/consumers";

@Component({
  components: {
    DxButton,
    DxSelectBox,
    DxTextBox,
    DxNumberBox,
    DxDateBox,
    DxCheckBox,
    DxLoadPanel,
    DxDataGrid,
    DxScrolling,
    DxSorting,
    DxExport,
    DxColumn,
    DxFilterRow,
    DxHeaderFilter,
    DxColumnFixing,
    DxPopup,
    DxPosition,
    DxToolbarItem,
    DxContextMenu,
    DxLoadIndicator,
    HeaderScheCell,
    ScheCell,
  },
})
export default class LXD_ProdSchedule extends Vue {
  private filter: boolean = true;
  private isLoading: boolean = false;
  private isWrite: boolean = true;

  // 검색조건
  private fromDate: Date = new Date();
  private toDate: Date = new Date();
  private selectedWeek: boolean = false;
  private selectedMonth: boolean = false;
  private exceldownloadaui: boolean = false;
  private woexceldownloadaui: boolean = false;

  private columns: any[] = [];
  private dataSource: any[] = [];
  private ctxMenuList: any[] = [];
  private weekList: any[] = [];

  private productSource: any[] = [];
  private searchModeOption: string = "contains";
  private searchExprOption: string = "PROD_CODE";
  private searchTimeoutOption: number = 200;
  private minSearchLengthOption: number = 0;
  private showDataBeforeSearchOption: boolean = false;
  private fixDate: Date = new Date();
  private datafieldList: any[] = [];
  private taskOwner: boolean = false;

  //팝업 설정
  public selectedProduct: string = "";
  public selectedProductView: string = "";
  public selectedPlanQty: number = 0;
  public productCode: any = "";
  public popupWidth: number = 650;
  public popupHeight: number = 300;
  private popupVisible: boolean = false;
  private isPopupReady: boolean = false;
  private isModifyPopupReady: boolean = false;
  private popupTitle: string = "";
  private selectedAddPlanFix: string = "";
  private addPlanDate: Date = new Date();
  private addTargetDate: Date = new Date();
  private addYNList: any[] = [];
  private selectLineList: any[] = [];
  private selectedLine: string = "";
  private modifyTargetData: any = "";
  private oldPlanDate: string = "";
  private oldLineNo: string = "";
  private oldPlanSeq: string = "";
  private oldTargetDate: string = "";
  private selectedIdx: number = 0;
  private organizePopupVisible: boolean = false;
  private isOrganizePopupReady: boolean = false;
  private organizePopupTitle: string = "";
  private modifyline1Date: Date = new Date();
  private modifyline2Date: Date = new Date();
  private modifyline3Date: Date = new Date();
  private modifyline4Date: Date = new Date();
  private errorPopupVisible: boolean = false;
  private isErrorPopupReady: boolean = false;
  private errorPopupTitle: string = "";
  private alertPopupVisible: boolean = false;
  private isAlertPopupReady: boolean = false;
  private alertPopupTitle: string = "";
  private alertContent: string = "";
  private woMappingPopupVisible: boolean = false;
  private isWoMappingPopupReady: boolean = false;
  private woMappingPopupTitle: string = "";
  private woSendPopupVisible: boolean = false;
  private isWoSendPopupReady: boolean = false;
  private woSendPopupTitle: string = "";
  private woEditPopupVisible: boolean = false;
  private isWoEditPopupReady: boolean = false;
  private woEditPopupTitle: string = "";
  private selectedWoView: string = "";
  private selectedWoItemId: string = "";
  private selectedWoPlanDate: string = "";
  private selectedWoLineNo: string = "";
  private selectedWoPlanQty: number = 0;
  private vscrollTop: number = 0;

  // private isModifyTargetDateReady: boolean = false;

  // 작업중 상태체크
  private socket: WebSocket | null = null;
  private taskId: any | null = null;
  private taskStatus: boolean = false;
  private taskStartTime!: Date;
  private clearFlag: number = 0;

  constructor() {
    super();
  }

  public async created() {
    this.taskId = setInterval(async () => {
      await this.connectWebSocket();
    }, 2000);
  }

  public destroyed() {
    if (this.socket) {
      this.socket.close();
    }
  }

  private async connectWebSocket() {
    if (this.socket) {
      if (this.taskId) {
        clearInterval(this.taskId);
      }
      return;
    }
    this.socket = new WebSocket(await getWebSocketURL());
    if (this.socket) {
      this.socket.onmessage = (evt: MessageEvent) => {
        const result = JSON.parse(evt.data);
        // 엔진수행중 체크
        console.log("result.obj ::: ", result.obj);
        if (result.msg === "ENGINE_EXEC") {
          const to = dayjs(new Date());
          const diff = dayjs(dayjs(new Date())).diff(this.taskStartTime, "second");

          if (this.taskStartTime === undefined || diff > 6) {
            this.taskStatus = result.obj.count > 0 ? true : false;
          }
        }
      };
    }
  }

  public async onEngineExec() {
    const okMsg = "정리 엔진을 실행 하시겠습니까?";
    if (!(await confirm(okMsg, "Confirm"))) {
      return;
    }

    const validResult = await Get("EnginStartTime");
    const subresult = JSON.parse(validResult.data);

    const validResult2 = await Get(
      "ClearEngineExec",
      {
        obj: {
          FROM_DATE: dayjs(subresult[0].START_TIME).format("YYYY-MM-DD"),
        },
      },
      "post",
    );
    const result = JSON.parse(validResult2.data);
    if (result.msg != "엔진이 실행되었습니다!") {
      await alert(result.msg, "Alert");
    } else {
      console.log("엔진 실행");

      this.taskStatus = true;
      this.taskStartTime = new Date();
      this.clearFlag = 1;
    }
    return;
  }

  public async mounted() {
    // this.initView(); // title
    // this.isWrite = this.authWrite(); // authority
    // this.addYNList = USE_YN_DEFINES;
    await this.initialize();
    await this.onSearch();
    // const dataResult = await Get("ErrorProdList", { obj: {} }, "post");
    // if (JSON.parse(dataResult.data).length > 0) {
    //   this.errorPop();
    // }
  }

  public get dataGridRef(): any {
    return this.$refs.dataGrid;
  }

  public get dataGridExcelRef(): any {
    return this.$refs.dataGridExcel;
  }

  public get dataGridWo(): any {
    return this.$refs.dataGridWo;
  }

  public get dataGridErrorRef(): any {
    return this.$refs.dataGridError;
  }

  public get dataGridWoMappingRef(): any {
    return this.$refs.dataGridWoMapping;
  }

  public get dataGridWoSendRef(): any {
    return this.$refs.dataGridWoSend;
  }
  public get dataGridWoEditViewRef(): any {
    return this.$refs.dataGridWoEditView;
  }

  public get loading() {
    return this.isLoading;
  }

  // @Watch("taskStatus")
  // public async changeTaskStatus() {
  //   console.log("WATCH 진입");
  //   if (this.taskStatus) {
  //     // await alert(`엔진이 수행 중입니다.`, "Alert");
  //     // this.alertPop("Alert", "엔진이 수행 중입니다.");
  //     this.isLoading = true;
  //   } else {
  //     // await alert(`엔진이 종료되었습니다.`, "Alert");

  //     await this.onSearch();
  //     this.isLoading = true;
  //     const dataResult = await Get("LineM");
  //     this.isLoading = false;
  //     this.alertPop("Alert", "엔진이 종료되었습니다.");
  //   }
  // }
  // private onMappingCellDoubleClick(e: any) {
  //   // console.log(e);
  //   if (e.item.TARGET_NAME === "PRIME") {
  //     this.woEditPop(e.item);
  //   }
  // }

  // private onWoCellDoubleClick(e: any) {
  //   // console.log(e);
  //   this.selectedWoView = e.item.WO_ID;
  // }

  private async initialize() {
    const now = new Date();
    this.fromDate = dayjs(now).toDate(); // 현재일
    this.toDate = dayjs(now).add(21, "day").toDate();
    // const fixDateResult = await Get("TargetFixDate", { obj: {} }, "post");
    // this.fixDate = dayjs(JSON.parse(fixDateResult.data)[0].FIX_DATE).toDate();
    // console.log("fixDate", this.fixDate);
  }

  public weekPrev() {
    const getleft = this.dataGridRef.instance.getScrollable().scrollLeft();
    const leftwidth = getleft - 3400 < 0 ? 0 : getleft;
    this.dataGridRef.instance.getScrollable().scrollTo(leftwidth - 3500);
  }

  public weekNext() {
    const getleft = this.dataGridRef.instance.getScrollable().scrollLeft();
    const leftwidth = getleft == 0 ? 100 : getleft + 100;
    this.dataGridRef.instance.getScrollable().scrollTo(leftwidth + 3400);
  }

  private onGetScroll() {
    let scroll = this.dataGridRef.instance.getScrollable();
    this.vscrollTop = scroll.scrollTop();
    console.log("getScroll ::: ", scroll.scrollOffset());
  }

  private setScroll() {
    setTimeout(() => {
      if (this.vscrollTop > 0) {
        let scroll = this.dataGridRef.instance.getScrollable();
        scroll.scrollTo({ top: this.vscrollTop + 100 });
        console.log("setScroll ::: ", scroll.scrollOffset());
      }
    }, 300);
  }

  /********************************************************
   *
   * 팝업 버튼 & 준비
   *
   ********************************************************/
  // public onPopupErrorReady(e: any) {
  //   this.dataGridErrorRef.create(this.columnLayoutError, this.auigridPropsError);
  // }

  // public onPopupWoMappingReady(e: any) {
  //   // if (this.dataGridWoMappingRef.isCreated()) this.dataGridWoMappingRef.destroy();
  //   this.dataGridWoMappingRef.create(this.columnLayoutWoMapping, this.auigridPropsWoMapping);
  // }

  // public onPopupWoSendReady(e: any) {
  //   if (this.dataGridWoSendRef.isCreated()) this.dataGridWoSendRef.destroy();
  //   this.dataGridWoSendRef.create(this.columnLayoutWoSend, this.auigridPropsWoSend);
  // }

  // public onPopupWoEditViewReady(e: any) {
  //   if (this.dataGridWoEditViewRef.isCreated()) this.dataGridWoEditViewRef.destroy();
  //   this.dataGridWoEditViewRef.create(this.columnLayoutWoEditView, this.auigridPropsWoEditView);
  // }

  // public popupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onClosePopup();
  //   },
  // };
  // public popupButtonOptionsSave: object = {
  //   text: "저장",
  //   onClick: () => {
  //     this.onSave();
  //     // this.onClosePopup();
  //   },
  // };

  // public organizePopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseOrganizePopup();
  //   },
  // };

  // public organizePopupButtonOptionsSave: object = {
  //   text: "저장",
  //   onClick: () => {
  //     this.onOrganizeDateModify();
  //     // this.onCloseOrganizePopup();
  //   },
  // };

  // public errorPopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseErrorPopup();
  //   },
  // };

  // public alertPopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseAlertPopup();
  //   },
  // };

  // public woMappingPopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseWoMappingPopup();
  //   },
  // };

  // public woSendPopupButtonOptionsSave: object = {
  //   text: "저장",
  //   onClick: () => {
  //     this.onWoSendSave();
  //     // this.onCloseWoSendPopup();
  //   },
  // };

  // public woSendPopupButtonOptionsCheck: object = {
  //   text: "MES 체크",
  //   onClick: () => {
  //     this.onWoSendCheck();
  //     // this.onCloseWoSendPopup();
  //   },
  // };

  // public woSendPopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseWoSendPopup();
  //   },
  // };

  // public woEditPopupButtonOptionsSave: object = {
  //   text: "저장",
  //   onClick: () => {
  //     this.onWoEdit();
  //   },
  // };
  // public woEditPopupButtonOptionsDelete: object = {
  //   text: "W/O삭제",
  //   onClick: () => {
  //     this.onWoDelete();
  //   },
  // };

  // public woEditPopupButtonOptionsClose: object = {
  //   text: "닫기",
  //   onClick: () => {
  //     this.onCloseWoEditPopup();
  //   },
  // };

  // public onCloseWoEditPopup() {
  //   this.woEditPopupVisible = false;
  //   this.isWoEditPopupReady = false;
  // }

  // public onClosePopup() {
  //   this.popupVisible = false;
  //   this.isModifyPopupReady = false;
  //   // this.isModifyTargetDateReady = false;
  // }

  // public onCloseOrganizePopup() {
  //   this.organizePopupVisible = false;
  // }

  // public onCloseErrorPopup() {
  //   this.errorPopupVisible = false;
  //   this.isErrorPopupReady = false;
  // }

  // public onCloseAlertPopup() {
  //   this.alertPopupVisible = false;
  //   this.isAlertPopupReady = false;
  // }

  // public onCloseWoMappingPopup() {
  //   this.woMappingPopupVisible = false;
  //   // this.isWoMappingPopupReady = false;
  // }

  // public onCloseWoSendPopup() {
  //   this.woSendPopupVisible = false;
  //   this.isWoSendPopupReady = false;
  // }

  // public async productListOnChange(e: any) {
  //   this.selectedProductView = this.selectedProduct;
  //   const prodLineResult = await Get(
  //     "ProdLineList",
  //     {
  //       obj: { ITEM_ID: this.selectedProduct },
  //     },
  //     "post",
  //   );
  //   this.selectLineList = JSON.parse(prodLineResult.data);
  //   // console.log(this.selectLineList);
  // }

  /********************************************************
   *
   * 팝업 저장 Action
   *
   ********************************************************/
  // public onSave() {
  //   // console.log("저장버튼 클릭", this.isModifyPopupReady);
  //   if (this.isModifyPopupReady) {
  //     this.onModifySave();
  //   } else {
  //     this.onAddSave();
  //   }
  // }

  // public async onAddSave() {
  //   const okMsg = "신규 생산 계획을 저장 하시겠습니까?";
  //   if (!(await confirm(okMsg, "Confirm"))) {
  //     return;
  //   }
  //   if (this.taskStatus) {
  //     await alert(`엔진 수행중에는 추가 할 수 없습니다.`, "Alert");
  //     return;
  //   }
  //   let planFixString: string = "";
  //   let res: any = { count: 0 };
  //   let tmNow = dayjs(new Date()).format("YYYY-MM-DD");
  //   let tmPlanDate = dayjs(this.addPlanDate).format("YYYY-MM-DD");

  //   if (this.selectedProduct == "") {
  //     await alert("자재코드를 선택하세요", "Alert");
  //     return;
  //   }

  //   if (this.selectedProductView == "") {
  //     await alert("자재표시를 입력 해주세요", "Alert");
  //     return;
  //   }

  //   if (this.selectedPlanQty <= 0) {
  //     await alert("수량을 입력 해주세요.", "Alert");
  //     return;
  //   }

  //   if (this.selectedLine == "") {
  //     await alert("설비를 선택 해주세요.", "Alert");
  //     return;
  //   }

  //   if (dayjs(tmPlanDate).isBefore(dayjs(tmNow))) {
  //     await alert("생산일자를 이전 날짜로 선택 불가능합니다..", "Alert");
  //     return;
  //   }

  //   if (!dayjs(this.addTargetDate).isAfter(this.fixDate)) {
  //     await alert(
  //       "Target일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다.",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   if (this.selectedAddPlanFix == "") {
  //     await alert("계획고정을 선택 해주세요.", "Alert");
  //     return;
  //   } else {
  //     if (this.selectedAddPlanFix == "Y") {
  //       planFixString = "FIX";
  //     } else {
  //       planFixString = "PLAN";
  //     }
  //   }
  //   if (
  //     dayjs(this.addPlanDate).isBefore(dayjs(this.fixDate).add(1, "day")) &&
  //     planFixString == "PLAN"
  //   ) {
  //     await alert(
  //       "확정구간 내에서는 계획을 고정해야합니다.<br>계획고정을 '사용'으로 변경해주세요",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   const planInsertResult = await Get(
  //     "ProdPlanInsert",
  //     {
  //       obj: {
  //         ITEM_ID: this.selectedProduct,
  //         PLAN_DATE: dayjs(this.addPlanDate).format("YYYYMMDD"),
  //         LINE_NO: this.selectedLine,
  //         PLAN_QTY: this.selectedPlanQty,
  //         DISPLAY_NAME: this.selectedProductView,
  //         PLAN_FIX: planFixString,
  //         TARGET_DATE: dayjs(this.addTargetDate).format("YYYYMMDD"),
  //       },
  //     },
  //     "post",
  //   );
  //   res = JSON.parse(planInsertResult.data);
  //   // console.log(res);
  //   if (res && res.count) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //     this.onSearch();
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }

  // public async onModifySave() {
  //   // console.log("수정 진입");
  //   const okMsg = "계획을 수정 하시겠습니까?";
  //   if (!(await confirm(okMsg, "Confirm"))) {
  //     return;
  //   }
  //   if (this.taskStatus) {
  //     await alert(`엔진 수행중에는 수정 할 수 없습니다.`, "Alert");
  //     return;
  //   }
  //   let planFixString: string = "";
  //   let res: any = { count: 0 };
  //   let tmNow = dayjs(new Date()).format("YYYY-MM-DD");
  //   let tmPlanDate = dayjs(this.addPlanDate).format("YYYY-MM-DD");
  //   let tmTargetDate = dayjs(this.addTargetDate).format("YYYY-MM-DD");

  //   if (this.selectedProductView == "") {
  //     await alert("자재표시를 입력 해주세요", "Alert");
  //     return;
  //   }

  //   if (this.selectedPlanQty <= 0) {
  //     await alert("수량을 입력 해주세요.", "Alert");
  //     return;
  //   }

  //   if (this.selectedLine == "") {
  //     await alert("설비를 선택 해주세요.", "Alert");
  //     return;
  //   }

  //   if (dayjs(tmPlanDate).isBefore(dayjs(tmNow))) {
  //     await alert("생산일자를 이전 날짜로 선택 불가능합니다..", "Alert");
  //     return;
  //   }

  //   if (
  //     this.oldTargetDate != dayjs(this.addTargetDate).format("YYYYMMDD") &&
  //     !dayjs(this.addTargetDate).isAfter(this.fixDate)
  //   ) {
  //     await alert(
  //       "Target일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다..",
  //       "Alert",
  //     );
  //     this.addTargetDate = dayjs(this.oldTargetDate).toDate();
  //     return;
  //   }
  //   if (this.selectedAddPlanFix == "") {
  //     await alert("계획고정을 선택 해주세요.", "Alert");
  //     return;
  //   } else {
  //     if (this.selectedAddPlanFix == "Y") {
  //       planFixString = "FIX";
  //     } else {
  //       planFixString = "PLAN";
  //     }
  //   }
  //   if (
  //     dayjs(this.addPlanDate).isBefore(dayjs(this.fixDate).add(1, "day")) &&
  //     planFixString == "PLAN"
  //   ) {
  //     await alert(
  //       "확정구간 내에서는 계획을 고정해야합니다.<br>계획고정을 '사용'으로 변경해주세요",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   if (
  //     this.selectedLine === this.oldLineNo &&
  //     this.oldPlanDate === dayjs(this.addPlanDate).format("YYYYMMDD")
  //   ) {
  //     // console.log("line이랑 plandate 같음");
  //     const planUpdateResult = await Get(
  //       "ProdPlanModifyUpdate",
  //       {
  //         obj: {
  //           ITEM_ID: this.selectedProduct,
  //           PLAN_DATE: dayjs(this.addPlanDate).format("YYYYMMDD"),
  //           TARGET_DATE: dayjs(this.addTargetDate).format("YYYYMMDD"),
  //           LINE_NO: this.selectedLine,
  //           PLAN_QTY: this.selectedPlanQty,
  //           DISPLAY_NAME: this.selectedProductView,
  //           PLAN_FIX: planFixString,
  //           PLAN_SEQ: this.oldPlanSeq,
  //           IDX: this.selectedIdx,
  //         },
  //       },
  //       "post",
  //     );
  //     res = JSON.parse(planUpdateResult.data);
  //     // console.log(res);
  //     if (res && res.count) {
  //       await alert(`정상적으로 처리되었습니다.`, "Success");
  //       this.onSearch();
  //       this.onClosePopup();
  //     } else {
  //       await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //       return;
  //     }
  //   } else {
  //     // console.log("line이랑 plandate 달라!!!");
  //     const planUpdateResult = await Get(
  //       "ProdPlanModifyMoveUpdate",
  //       {
  //         obj: {
  //           ITEM_ID: this.selectedProduct,
  //           PLAN_DATE: this.oldPlanDate,
  //           LINE_NO: this.oldLineNo,
  //           NEW_PLAN_DATE: dayjs(this.addPlanDate).format("YYYYMMDD"),
  //           NEW_LINE_NO: this.selectedLine,
  //           PLAN_QTY: this.selectedPlanQty,
  //           DISPLAY_NAME: this.selectedProductView,
  //           TARGET_DATE: dayjs(this.addTargetDate).format("YYYYMMDD"),
  //           PLAN_FIX: planFixString,
  //           PLAN_SEQ: this.oldPlanSeq,
  //         },
  //       },
  //       "post",
  //     );
  //     res = JSON.parse(planUpdateResult.data);
  //     // console.log(res);
  //     if (res && res.count) {
  //       await alert(`정상적으로 처리되었습니다.`, "Success");
  //       this.onSearch();
  //       this.clearFlag = 0;
  //       this.onClosePopup();
  //     } else {
  //       await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //       return;
  //     }
  //   }
  // }

  // public async onOrganizeDateModify() {
  //   let tmNow = dayjs(new Date()).format("YYYY-MM-DD");
  //   let res: any = { count: 0 };
  //   console.log(this.clearFlag);
  //   if (this.clearFlag === 0) {
  //     await alert("정리를 한 뒤 확정이 가능합니다.", "Alert");
  //     return;
  //   }
  //   if (dayjs(this.modifyline1Date).isBefore(this.fixDate)) {
  //     await alert(
  //       "호기별 확정일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다.(1호기 Error)",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   if (dayjs(this.modifyline2Date).isBefore(this.fixDate)) {
  //     await alert(
  //       "호기별 확정일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다.(2호기 Error)",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   if (dayjs(this.modifyline3Date).isBefore(this.fixDate)) {
  //     await alert(
  //       "호기별 확정일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다.(3호기 Error)",
  //       "Alert",
  //     );
  //     return;
  //   }
  //   if (dayjs(this.modifyline4Date).isBefore(this.fixDate)) {
  //     await alert(
  //       "호기별 확정일자는 " +
  //         dayjs(this.fixDate).add(1, "day").format("YYYY-MM-DD") +
  //         " 부터 선택가능합니다.(4호기 Error)",
  //       "Alert",
  //     );
  //     return;
  //   }

  //   // 저장부분

  //   const okMsg = "호기별 확정을 진행 하시겠습니까?";
  //   if (!(await confirm(okMsg, "Confirm"))) {
  //     return;
  //   }
  //   const from = dayjs(this.fromDate);
  //   const to = dayjs(this.toDate);
  //   const organizeResult = await Get(
  //     "OutFixDateSave",
  //     {
  //       fromDate: from.format("YYYYMMDD"),
  //       toDate: to.format("YYYYMMDD"),
  //       line1FixDate: dayjs(this.modifyline1Date).format("YYYYMMDD"),
  //       line2FixDate: dayjs(this.modifyline2Date).format("YYYYMMDD"),
  //       line3FixDate: dayjs(this.modifyline3Date).format("YYYYMMDD"),
  //       line4FixDate: dayjs(this.modifyline4Date).format("YYYYMMDD"),
  //     },
  //     "post",
  //   );
  //   res = JSON.parse(organizeResult.data);
  //   console.log(res);
  //   console.log(res.msg);
  //   if (res.msg === null) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //     this.onSearch();
  //     this.onCloseOrganizePopup();
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }
  // public async onWoSendCheck() {
  //   const checkList: any = this.dataGridWoSendRef.getRowsByValue("IS_SEND", "Y");
  //   if (checkList.length <= 0) {
  //     await alert(`선택된 항목이 없습니다.`, "Alert");
  //     return;
  //   }
  //   let strtemp: string = "";
  //   checkList.forEach((m: any) => {
  //     strtemp += ",'" + m.IDX.toString() + "'";
  //   });
  //   strtemp = strtemp.substring(1);
  //   // strtemp = strtemp + ",'1000001094'";
  //   // console.log(strtemp);
  //   const dataResult = await Get("WorkOrderVaildList", { inputString: strtemp }, "post");
  //   const dataSource = JSON.parse(dataResult.data);
  //   // console.log("dataSource", dataSource);
  //   this.dataGridWoSendRef.setGridData(dataSource);
  // }

  // public async onWoSendSave() {
  //   const sendRows: any[] = this.dataGridWoSendRef.getRowsByValue("IS_SEND", "Y");
  //   console.log(sendRows);
  //   if (sendRows.length <= 0) {
  //     await alert(`선택된 항목이 없습니다.`, "Alert");
  //     return;
  //   }
  //   let validChkBol: boolean = true;
  //   sendRows.forEach((k: any) => {
  //     if (k.VAILD_CHK != "Y") {
  //       validChkBol = false;
  //     }
  //   });
  //   if (!validChkBol) {
  //     await alert(`MES 체크 안된 데이터는 저장 할 수 없습니다.`, "Alert");
  //     return;
  //   }
  //   // this.alertPop("Alert", "개발 중");
  //   // return;
  //   if (!(await confirm(`<b>선택항목을 전송하시겠습니까?</b>`, "Confirm"))) return;
  //   const result: any = await this.woSendData();
  //   if (result && result.count) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //     return;
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }

  // public async woSendData(): Promise<any> {
  //   let res: any = { count: 0 };
  //   const sendRows: any[] = this.dataGridWoSendRef.getRowsByValue("IS_SEND", "Y");
  //   let strtemp: string = "";
  //   sendRows.forEach((m: any) => {
  //     strtemp += ",'" + m.IDX.toString() + "'";
  //   });
  //   strtemp = strtemp.substring(1);
  //   console.log(strtemp);
  //   // await alert("개발중", "Alert");
  //   // return res;
  //   try {
  //     this.isLoading = true;
  //     const result = await Modify("WoSendSave", { obj: sendRows });
  //     res = JSON.parse(result.data);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     this.isLoading = false;
  //   }
  //   return res;
  // }

  // public async onWoEdit() {
  //   if (this.selectedWoView.length != 10) {
  //     await alert(`WO_ID를 입력해주세요(10자리)`, "Alert");
  //     return;
  //   }
  //   // return;
  //   let res: any = { count: 0 };
  //   const planInsertResult = await Get(
  //     "WOUpdate",
  //     {
  //       obj: {
  //         IDX: this.selectedIdx,
  //         WO_ID: this.selectedWoView,
  //       },
  //     },
  //     "post",
  //   );
  //   res = JSON.parse(planInsertResult.data);
  //   // console.log(res);
  //   if (res && res.count) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //     this.onCloseWoEditPopup();
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }

  // public async onWoDelete() {
  //   if (!(await confirm(`<b>Mapping된 WO_ID를 지우시겠습니까?</b>`, "Confirm"))) return;
  //   let res: any = { count: 0 };
  //   const planInsertResult = await Get(
  //     "WODelete",
  //     {
  //       obj: {
  //         IDX: this.selectedIdx,
  //       },
  //     },
  //     "post",
  //   );
  //   res = JSON.parse(planInsertResult.data);
  //   // console.log(res);
  //   if (res && res.count) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }

  // /********************************************************
  //  *
  //  * 팝업 열기
  //  *
  //  ********************************************************/
  // public async addClickEvent() {
  //   this.selectedProduct = "";
  //   this.selectedProductView = "";
  //   this.selectedPlanQty = 0;
  //   this.selectedLine = "";
  //   this.selectedAddPlanFix = "";
  //   this.selectLineList = [];
  //   this.addPlanDate = new Date();
  //   this.addTargetDate = dayjs(this.fixDate).add(1, "day").toDate();
  //   this.popupTitle = "신규계획 신규등록";

  //   const prodResult = await Get("ProdScheduleProductList", { obj: {} }, "post");
  //   this.productSource = JSON.parse(prodResult.data);
  //   // console.log(this.productSource);
  //   this.isPopupReady = true;
  //   this.popupVisible = true;
  //   this.isModifyPopupReady = false;

  //   // console.log("추가");
  // }

  // public async modifyPopup(e: any) {
  //   this.isModifyPopupReady = true;
  //   this.isPopupReady = true;
  //   this.popupVisible = true;
  //   this.selectedProduct = e.ITEM_ID;
  //   this.selectedProductView = e.DISPLAY_NAME;
  //   this.selectedPlanQty = e.PLAN_QTY;
  //   this.oldPlanDate = e.PLAN_DATE;
  //   this.oldLineNo = e.LINE_NO;
  //   this.oldPlanSeq = e.PLAN_SEQ;
  //   this.oldTargetDate = e.TARGET_DATE;
  //   this.selectedIdx = e.IDX;

  //   this.popupTitle = "계획 수정";
  //   const prodLineResult = await Get(
  //     "ProdLineList",
  //     {
  //       obj: { ITEM_ID: this.selectedProduct },
  //     },
  //     "post",
  //   );
  //   this.selectLineList = JSON.parse(prodLineResult.data);
  //   this.selectedLine = e.LINE_NO;
  //   this.addPlanDate = e.PLAN_DATE;
  //   this.addTargetDate = e.TARGET_DATE;
  //   let tmSource = { PROD_CODE: e.ITEM_ID };
  //   this.productSource = [];
  //   this.productSource.push(tmSource);
  //   // console.log("modifyprodSource", this.productSource);
  //   this.isPopupReady = true;
  //   this.popupVisible = true;
  //   switch (e.PLAN_STATUS) {
  //     case "PLAN":
  //       this.selectedAddPlanFix = "N";
  //       break;
  //     case "FIX":
  //       this.selectedAddPlanFix = "Y";
  //       break;
  //   }
  //   // console.log("수정");
  // }

  // public async organizePop(e: any) {
  //   this.organizePopupTitle = "호기 별 확정일자 고정";
  //   this.organizePopupVisible = true;
  //   this.isOrganizePopupReady = true;
  //   const from = dayjs(this.fromDate);
  //   const to = dayjs(this.toDate);

  //   const dataResult = await Get(
  //     "OutFixDate",
  //     { fromDate: from.format("YYYY-MM-DD"), toDate: to.format("YYYY-MM-DD") },
  //     "post",
  //   );
  //   const dataSource = JSON.parse(dataResult.data);
  //   // console.log(dataSource);

  //   // console.log(dataSource[0].FIX_DATE);
  //   // console.log(dataSource[1].FIX_DATE);
  //   this.modifyline1Date = dataSource[0].FIX_DATE;
  //   this.modifyline2Date = dataSource[1].FIX_DATE;
  //   this.modifyline3Date = dataSource[2].FIX_DATE;
  //   this.modifyline4Date = dataSource[3].FIX_DATE;

  //   console.log("organizePop 진입", this.modifyTargetData);
  // }

  // public async errorPop() {
  //   this.errorPopupTitle = "기준정보 문제 있는 제품";
  //   this.errorPopupVisible = true;
  //   this.isErrorPopupReady = true;

  //   const dataResult = await Get("ErrorProdList", { obj: {} }, "post");
  //   const dataSource = JSON.parse(dataResult.data);
  //   this.dataGridErrorRef.setGridData(dataSource);
  // }

  // public alertPop(msgTitle: string, msgStr: string) {
  //   this.alertContent = msgStr;
  //   this.alertPopupTitle = msgTitle;
  //   this.isAlertPopupReady = true;
  //   this.alertPopupVisible = true;
  // }

  // public woMappingPop() {
  //   this.woMappingPopupTitle = "W/O Mapping 문제 되는 목록";
  //   this.woMappingPopupVisible = true;
  //   setTimeout(this.woMappingPopLoad, 300);
  // }

  // public async woMappingPopLoad() {
  //   this.dataGridWoMappingRef.resize();
  //   const dataResult = await Get(
  //     "WorkOrderMappingList",
  //     { obj: { PLAN_DATE: dayjs(new Date()).format("YYYYMMDD") } },
  //     "post",
  //   );
  //   const dataSource = JSON.parse(dataResult.data);
  //   this.dataGridWoMappingRef.setGridData(dataSource);
  // }

  // public woSendPop() {
  //   this.woSendPopupTitle = "W/O 데이터 체크 및 전송(개발중)";
  //   this.woSendPopupVisible = true;
  //   this.isWoSendPopupReady = true;
  //   setTimeout(this.woSendPopLoad, 300);
  // }
  // public async woSendPopLoad() {
  //   this.dataGridWoSendRef.resize();
  //   const dataResult = await Get("WorkOrderVaildWaitList", { obj: {} }, "post");
  //   const dataSource = JSON.parse(dataResult.data);

  //   this.dataGridWoSendRef.setGridData(dataSource);
  // }

  // public async woEditPop(e: any) {
  //   this.woEditPopupTitle = "WorkOrder View & Edit";
  //   this.woEditPopupVisible = true;
  //   this.isWoEditPopupReady = true;
  //   let nidx = 0;
  //   if (e.IDX === undefined) {
  //     nidx = e.WO_ID;
  //   } else {
  //     nidx = e.IDX;
  //   }
  //   this.selectedIdx = nidx;
  //   setTimeout(this.woEditPopLoad, 100);
  // }

  // public async woEditPopLoad() {
  //   const dataResultItem = await Get("WoSelectItem", { obj: { IDX: this.selectedIdx } }, "post");
  //   const dataSourceItem = JSON.parse(dataResultItem.data);
  //   console.log(dataSourceItem);
  //   this.selectedWoItemId = dataSourceItem[0].ITEM_ID;
  //   this.selectedWoPlanDate = dataSourceItem[0].PLAN_DATE;
  //   this.selectedWoLineNo = dataSourceItem[0].LINE_NO;
  //   this.selectedWoPlanQty = dataSourceItem[0].PLAN_QTY;
  //   this.selectedWoView = dataSourceItem[0].WO_ID;

  //   // let auigridPropsWoEditView = {
  //   //   selectionMode: "multipleCells",
  //   //   enableCellMerge: true,
  //   //   showRowNumColumn: false,
  //   //   showStateColumn: false,
  //   //   rowStyleFunction: (rowIndex: number, item: any) => {
  //   //     switch (item.WO_ID) {
  //   //       case this.selectedWoView:
  //   //         return "is-late";
  //   //       default:
  //   //         break;
  //   //     }
  //   //   },
  //   // };
  //   // if (this.dataGridWoEditViewRef.isCreated()) this.dataGridWoEditViewRef.destroy();
  //   // this.dataGridWoEditViewRef.create(this.columnLayoutWoEditView, auigridPropsWoEditView);

  //   const dataResult = await Get(
  //     "ItemWoList",
  //     {
  //       obj: {
  //         ITEM_ID: dataSourceItem[0].ITEM_ID,
  //         LINE_NO: dataSourceItem[0].LINE_NO,
  //         WO_ID: dataSourceItem[0].WO_ID,
  //       },
  //     },
  //     "post",
  //   );

  //   const dataSource = JSON.parse(dataResult.data);
  //   console.log(dataSource);
  //   this.dataGridWoEditViewRef.setGridData(dataSource);
  // }

  /********************************************************
   * 조회
   *******************************************************/
  public async onSearch() {
    const from = dayjs(this.fromDate);
    const to = dayjs(this.toDate);
    if (from.isAfter(to)) return;

    try {
      this.isLoading = true;
      await this.makeColumns();
      await this.loadData();
    } finally {
      this.isLoading = false;
    }
  }

  public async loadData() {
    const from = dayjs(this.fromDate);
    const to = dayjs(this.toDate);
    const dataResult = await Get(
      "ProdSchedule",
      { fromDate: from.format("YYYY-MM-DD"), toDate: to.format("YYYY-MM-DD") },
      "post",
    );
    await this.makeGridData(JSON.parse(dataResult.data).data);
  }

  public async onCellPrepared(e: any) {
    if (e.rowType === "header") e.cellElement.style.textAlign = "center";
  }

  @Watch("selectedWeek")
  public changeWeek() {
    if (this.selectedWeek) {
      if (this.selectedMonth) this.selectedMonth = false;
      const now = dayjs(new Date());
      this.fromDate = dayjs(now).toDate();
      this.toDate = dayjs(this.fromDate).add(7, "day").toDate();
    }
  }

  @Watch("selectedMonth")
  public changeMonth() {
    if (this.selectedMonth) {
      if (this.selectedWeek) this.selectedWeek = false;
      const now = dayjs(new Date());
      this.fromDate = dayjs(now).toDate();
      this.toDate = dayjs(this.fromDate).add(1, "month").toDate();
    }
  }

  /********************************************************
   *
   * 계획수량 변경
   *
   ********************************************************/
  public async onChangeQty(changeDatas: any[]) {
    if (this.taskStatus) {
      await alert(`엔진 수행중에는 변경 할 수 없습니다.`, "Alert");
      this.onSearch();
      return;
    }
    if (!changeDatas.length) return;
    const result: any = await this.saveData(changeDatas);
    if (result && result.count) {
      await alert(`정상적으로 처리되었습니다.`, "Success");
      this.onSearch();
      this.clearFlag = 0;
    } else {
      await alert(`처리중에 에러가 발생했습니다`, "Alert");
      return;
    }
  }

  public async saveData(changeDatas: any[]): Promise<any> {
    let res: any = { count: 0 };
    try {
      this.isLoading = true;
      const result = await Modify("ProdScheduleQty", { modifyItems: changeDatas });
      res = JSON.parse(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }

    return res;
  }

  /********************************************************
   *
   * 계획일정 변경
   *
   ********************************************************/
  public async onMoveItem(moveData: any, moveLine: string, moveDate: string, toIndex: number) {
    if (this.taskStatus) {
      await alert(`엔진 수행중에는 이동 할 수 없습니다.`, "Alert");
      this.onSearch();
      return;
    }
    // this.setScroll();
    this.clearFlag = 0;
    // const validResult = await Get(
    //   "ProdeMoveAvailable",
    //   {
    //     obj: {
    //       ITEM_ID: moveData.ITEM_ID,
    //       LINE_NO: LINE_NO_DEFINES.filter((f: any) => f.CMCODE_DESCR === moveLine)[0].CMCODE_ID,
    //     },
    //   },
    //   "post",
    // );
    // const vresult = JSON.parse(validResult.data);
    // if (vresult[0].USE_FLAG === "N") {
    // const okMsg =
    //   "<b>" +
    //   moveData.ITEM_ID +
    //   "는 " +
    //   moveLine +
    //   "의 Arrage 정보가 없습니다.<br>" +
    //   dayjs(moveDate).format("YYYY-MM-DD") +
    //   "날짜의 " +
    //   moveLine +
    //   "로<br>강제 이동하시겠습니까?</b>";
    // if (!(await confirm(okMsg, "Confirm"))) {
    //   this.onSearch();
    //   return;
    // }
    //   const okMsg =
    //     "<b>" +
    //     moveData.ITEM_ID +
    //     "는 " +
    //     moveLine +
    //     "의 Arrage 정보가 없어서 이동 할 수 없습니다.<br>";
    //   await alert(okMsg, "Success");
    //   this.onSearch();
    //   return;
    // } else {
    // if (
    //   moveData.PLAN_DATE == dayjs(moveDate).format("YYYYMMDD") &&
    //   moveData.LINE_NO ==
    //     LINE_NO_DEFINES.filter((f: any) => f.CMCODE_DESCR === moveLine)[0].CMCODE_ID
    // ) {
    //   const moveOkMsg = "<b>" + moveData.ITEM_ID + "의 순번을 변경하시겠습니까?";
    //   if (!(await confirm(moveOkMsg, "Confirm"))) {
    //     this.onSearch();
    //     return;
    //   }
    // } else {
    //   const moveOkMsg =
    //     "<b>" +
    //     moveData.ITEM_ID +
    //     "를 " +
    //     dayjs(moveDate).format("YYYY-MM-DD") +
    //     "날짜의 " +
    //     moveLine +
    //     "로.<br><br>이동하시겠습니까?</b>";
    //   if (!(await confirm(moveOkMsg, "Confirm"))) {
    //     this.onSearch();
    //     return;
    //   }
    // }
    // this.onSearch();
    // }
    const scrollTop = this.dataGridRef.instance?.getScrollable().scrollTop();
    this.$nextTick(() => {
      this.dataGridRef.instance?.getScrollable().scrollTo({ top: scrollTop });
    });
    const result: any = await this.moveData(moveData, moveLine, moveDate, toIndex);
    // console.log(result);
    if (result && result.count) {
      // this.dataGridRef.instance?.getScrollable().scrollTo({ top: scrollTop });
      // console.log(this.dataGridRef.instance?.getScrollable().scrollTop());
      // await alert(`정상적으로 처리되었습니다.`, "Success");
      // console.log("onsearch");
      // this.onSearch();
    } else {
      await alert(`처리중에 에러가 발생했습니다`, "Alert");
      this.onSearch();
      // return;
    }
  }

  public async moveData(
    moveData: any,
    moveLine: string,
    moveDate: string,
    toIndex: number,
  ): Promise<any> {
    let res: any = { count: 0 };
    try {
      this.isLoading = true;
      const result = await Modify("ProdScheduleMove", {
        moveItem: moveData.IDX,
        moveLine: LINE_NO_DEFINES.filter((f: any) => f.CMCODE_DESCR === moveLine)[0].CMCODE_ID,
        moveDate: moveDate,
        toIndex: toIndex,
      });
      res = JSON.parse(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }

    return res;
  }

  /********************************************************
   *
   * 컨텍스트 메뉴 관련
   *
   ********************************************************/
  public onItemCtxMenu(item: any) {
    this.ctxMenuList = [
      {
        text: "WO 수정",
        icon: "mozart-icons m-025_DxButton-edit",
        task: item,
      },
      {
        text: "계획 수정",
        icon: "mozart-icons m-025_DxButton-edit",
        task: item,
      },
      {
        text: "계획 삭제",
        icon: "mozart-icons m-023_DxButton-delete",
        task: item,
      },
    ];
  }

  // 컨텍스트 메뉴 클릭시
  // public onTaskClick(e: any) {
  //   const task = e.itemData.task;
  //   if (
  //     e.itemData.text != "WO 수정" &&
  //     (task.PLAN_STATUS === "WIP" || task.PLAN_STATUS === "ACT")
  //   ) {
  //     alert("재공과 실적은 변경 할 수 없습니다.", "Alert");
  //     return;
  //   }
  //   switch (
  //     e.itemData.text // 숫자형 조건문
  //   ) {
  //     case "계획 수정":
  //       this.modifyPopup(task);
  //       break;
  //     case "계획 삭제":
  //       this.deletePlan(task);
  //       break;
  //     case "WO 수정":
  //       this.woEditPop(task);
  //       break;
  //   }
  // }

  // public async modifyPlanFix(e: any) {
  //   this.modifyTargetData = e;
  //   console.log("modifyPlanFix 진입", e);
  //   const okMsg =
  //     "<b>자재번호 : " +
  //     this.modifyTargetData.ITEM_ID +
  //     "<br>생산일자 : " +
  //     dayjs(this.modifyTargetData.PLAN_DATE).format("YYYY-MM-DD") +
  //     "<br>LINE_NO : " +
  //     this.modifyTargetData.LINE_NAME +
  //     "<br>수량 : " +
  //     this.modifyTargetData.PLAN_QTY +
  //     "<br><br>생산 계획을 고정하시겠습니까?";
  //   if (!(await confirm(okMsg, "Confirm"))) {
  //     return;
  //   }
  //   let res: IResult = { count: 0 };
  //   const planFixResult = await Get(
  //     "ProdPlanStatusFix",
  //     {
  //       obj: {
  //         ITEM_ID: this.modifyTargetData.ITEM_ID,
  //         PLAN_DATE: this.modifyTargetData.PLAN_DATE,
  //         LINE_NO: this.modifyTargetData.LINE_NO,
  //         PLAN_SEQ: this.modifyTargetData.PLAN_SEQ,
  //       },
  //     },
  //     "post",
  //   );
  //   res = JSON.parse(planFixResult.data);
  //   console.log(res);
  //   if (res && res.count) {
  //     await alert(`정상적으로 처리되었습니다.`, "Success");
  //     this.onSearch();
  //   } else {
  //     await alert(`처리중에 에러가 발생했습니다`, "Alert");
  //     return;
  //   }
  // }
  public async deletePlan(e: any) {
    this.modifyTargetData = e;
    // console.log("deletePlan 진입", e);
    let res: any = { count: 0 };
    const okMsg =
      "<b>자재번호 : " +
      this.modifyTargetData.ITEM_ID +
      "<br>생산일자 : " +
      dayjs(this.modifyTargetData.PLAN_DATE).format("YYYY-MM-DD") +
      "<br>LINE_NO : " +
      this.modifyTargetData.LINE_NAME +
      "<br>수량 : " +
      this.modifyTargetData.PLAN_QTY +
      "<br><br>삭제하시겠습니까?";
    if (!(await confirm(okMsg, "Confirm"))) {
      return;
    }
    if (this.taskStatus) {
      await alert(`엔진 수행중에는 삭제 할 수 없습니다.`, "Alert");
      return;
    }
    const planFixResult = await Get(
      "ProdPlanDelete",
      {
        obj: {
          IDX: this.modifyTargetData.IDX,
        },
      },
      "post",
    );
    res = JSON.parse(planFixResult.data);
    // console.log(res);
    if (res && res.count) {
      await alert(`정상적으로 처리되었습니다.`, "Success");
      this.clearFlag = 0;
      this.onSearch();
    } else {
      await alert(`처리중에 에러가 발생했습니다`, "Alert");
      return;
    }
  }

  /********************************************************
   *
   * 데이터그리드 컬럼 생성
   *
   ********************************************************/
  private async makeColumns() {
    const from = dayjs(this.fromDate);
    const to = dayjs(this.toDate);

    // const weekResult = await Get(
    //   "WeeklyDate",
    //   {
    //     obj: {
    //       FROM_DATE: dayjs(from).format("YYYY-MM-DD"),
    //       TO_DATE: dayjs(to).format("YYYY-MM-DD"),
    //     },
    //   },
    //   "post",
    // );
    // this.weekList = JSON.parse(weekResult.data);

    const dayCount = to.diff(from, "day");
    this.columns = [
      {
        caption: "호기",
        dataField: "LINE_NAME",
        alignment: "center",
        width: 90,
        fixed: true,
      },
    ];

    // for (let i = 0; i < this.weekList.length; i++) {
    for (let i = from; i < to; i = i.add(1, "day")) {
      const childColumns = [
        {
          caption: i.format("MM월 DD일"),
          dataField: "D" + i.format("YYYYMMDD"),
          allowFiltering: false,
          headerCellTemplate: "header-cell-template",
          cellTemplate: "cell-template",
          cssClass: "cell-template-style",
          width: 500,
        },
      ];
      let holidaycss: string = "";
      if (i.day() + 1 === 7) {
        holidaycss = "cell-saturday-style";
      } else if (i.day() + 1 === 1) {
        holidaycss = "cell-sunday-style";
      }
      let dayName = "";
      if (i.day() + 1 === 1) {
        dayName = "(일)";
      } else if (i.day() + 1 === 2) {
        dayName = "(월)";
      } else if (i.day() + 1 === 3) {
        dayName = "(화)";
      } else if (i.day() + 1 === 4) {
        dayName = "(수)";
      } else if (i.day() + 1 === 5) {
        dayName = "(목)";
      } else if (i.day() + 1 === 6) {
        dayName = "(금)";
      } else if (i.day() + 1 === 7) {
        dayName = "(토)";
      }
      this.columns.push({
        caption: i.format("MM월DD일") + dayName,
        columns: childColumns,
        alignment: "center",
        cssClass: holidaycss,
        width: 500,
      });
    }
    // for (let i = 0; i < dayCount; i++) {
    //   const dt = dayjs(this.fromDate).add(i, "day");
    //   const childColumns = [
    //     {
    //       caption: dt.format("MM월 DD일"),
    //       dataField: "D" + dt.format("YYYYMMDD"),
    //       allowFiltering: false,
    //       headerCellTemplate: "header-cell-template",
    //       cellTemplate: "cell-template",
    //       cssClass: "cell-template-style",
    //       width: 500,
    //     },
    //   ];
    //   this.columns.push({
    //     caption: dt.format("MM월DD일"),
    //     columns: childColumns,
    //     alignment: "center",
    //     width: 500,
    //   });
    // }
    // DUMMY COLUMN
    // this.columns.push({});
  }

  private makeGridData(dataList: any[]) {
    const from = dayjs(this.fromDate);
    const to = dayjs(this.toDate);
    const dayCount = to.diff(from, "day");
    const eqpList = [...new Set(dataList.map((r: any) => r.LINE_NAME))];
    this.dataSource = [];
    eqpList.forEach((e: string) => {
      let data: any = {};
      data["LINE_NAME"] = e;
      for (let i = 0; i < dayCount; i++) {
        const dt = dayjs(this.fromDate).add(i, "day");
        const items = dataList.filter(
          (f: any) => f.LINE_NAME === e && f.PLAN_DATE == dt.format("YYYYMMDD"),
        );
        data["D" + dt.format("YYYYMMDD")] = items;
      }
      this.dataSource.push(data);
    });
  }

  // public async onXlsDown() {
  //   this.exceldownloadaui = true;
  //   let exportProps: any = {
  //     fileName: "생산계획",
  //     progressBar: true,
  //     exportWithStyle: true,
  //   };
  //   try {
  //     this.isLoading = true;
  //     await this.ExcelLoadData();
  //     await this.dataGridExcelRef.exportToXlsx(exportProps);
  //   } finally {
  //     this.isLoading = false;
  //   }
  //   this.exceldownloadaui = false;
  // }
  // public async ExcelLoadData() {
  //   const from = dayjs(this.fromDate);
  //   const to = dayjs(this.toDate);

  //   const excelSummaryLayout = this.excelColumnLayout.concat(this.excelMakeColumn());
  //   if (this.dataGridExcelRef.isCreated()) this.dataGridExcelRef.destroy();
  //   console.log(this.makeGroupingSummary());
  //   this.excelAuigridProps["groupingSummary"] = this.makeGroupingSummary();
  //   this.dataGridExcelRef.create(excelSummaryLayout, this.excelAuigridProps);
  //   this.dataGridExcelRef.setFixedColumnCount(1);

  //   const dataResult = await Get(
  //     "ProdSchedule",
  //     { fromDate: from.format("YYYY-MM-DD"), toDate: to.format("YYYY-MM-DD") },
  //     "post",
  //   );
  //   const tempSource = JSON.parse(dataResult.data);
  //   let dataSource: any[] = [];

  //   const LinebucketList = groupBy(tempSource, r => {
  //     return r.LINE_NO;
  //   });
  //   Object.entries(LinebucketList).forEach(k => {
  //     let LineDatebucketList = groupBy(k[1], r => {
  //       return r.ROWNUMBERS;
  //     });
  //     Object.entries(LineDatebucketList).forEach(m => {
  //       let rowData: any = {};
  //       rowData["LINE_NO"] = k[0];
  //       m[1].forEach(l => {
  //         rowData["D" + l.PLAN_DATE + "_" + "ITEM_ID"] = l.ITEM_ID;
  //         rowData["D" + l.PLAN_DATE + "_" + "PLAN_QTY"] = l.PLAN_QTY;
  //         rowData["D" + l.PLAN_DATE + "_" + "ORIGIN_QTY"] = l.ORIGIN_QTY;
  //         rowData["D" + l.PLAN_DATE + "_" + "FOAMING_TIME"] = l.FOAMING_TIME;
  //         rowData["D" + l.PLAN_DATE + "_" + "START_TIME"] = l.START_TIME;
  //         rowData["D" + l.PLAN_DATE + "_" + "END_TIME"] = l.END_TIME;
  //         rowData["D" + l.PLAN_DATE + "_" + "ROOM_QTY"] = l.ROOM_QTY;
  //         rowData["D" + l.PLAN_DATE + "_" + "RESIN"] = l.RESIN;
  //         rowData["D" + l.PLAN_DATE + "_" + "PLAN_STATUS"] = l.PLAN_STATUS;
  //       });
  //       dataSource.push(rowData);
  //     });
  //   });
  //   await this.dataGridExcelRef.setGridData(dataSource);
  // }

  // public async onWoXlsDown() {
  //   if (this.dataGridWo.isCreated()) this.dataGridWo.destroy();
  //   this.dataGridWo.create(this.columnLayoutWo(), this.auigridProps);

  //   const dataResult = await Get(
  //     "WorkOrderList",
  //     {
  //       obj: {},
  //     },
  //     "post",
  //   );
  //   const dataSource = JSON.parse(dataResult.data);
  //   console.log(dataSource);
  //   this.dataGridWo.setGridData(dataSource);
  //   let tempdate = dayjs(new Date()).format("YYYYMMDD");
  //   let exportProps: any = {
  //     fileName: tempdate + "_WorkPlan_Excel",
  //   };
  //   this.dataGridWo.exportToXlsx(exportProps);
  // }

  // private formatNumber(value: number, toFix: number) {
  //   return value
  //     .toFixed(toFix)
  //     .toString()
  //     .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  // }
  // private auigridProps = {
  //   editable: true,
  //   selectionMode: "multipleCells",
  //   enableCellMerge: true,
  //   showRowNumColumn: false,
  //   showStateColumn: true,
  //   showEditedCellMarker: false,
  //   enableSorting: false,
  //   enableFilter: true,
  // };

  // private excelAuigridProps = {
  //   editable: true,
  //   selectionMode: "multipleCells",
  //   enableCellMerge: true,
  //   showRowNumColumn: false,
  //   enableSorting: false,
  //   showStateColumn: true,
  //   enableFilter: true,
  //   showEditedCellMarker: false,
  //   groupingSummary: {},
  //   groupingFields: ["LINE_NO"],
  //   showBranchOnGrouping: false,
  //   rowStyleFunction: (rowIndex: number, item: any) => {
  //     if (item._$isGroupSumField) {
  //       switch (item._$depth) {
  //         case 2:
  //           return "prodschedule-aui-depth1";
  //         default:
  //           break;
  //       }
  //     }
  //   },
  // };

  // private makeGroupingSummary(): any {
  //   let groupingSummary = {
  //     dataFields: [""],
  //     rows: [
  //       {
  //         expFunction: (items: any[], dataField: string) => {
  //           let totQty: any = 0;
  //           items.forEach((e: any) => {
  //             if (e[dataField] != undefined) {
  //               // totQty += Number(e[dataField]);
  //               totQty += Number(e[dataField]);
  //             }
  //           });
  //           if (
  //             dataField.substring(10) === "ROOM_QTY" ||
  //             dataField.substring(10) === "FOAMING_TIME"
  //           ) {
  //             return this.formatNumber(totQty, 1);
  //           } else {
  //             return this.formatNumber(totQty, 0);
  //           }
  //         },
  //       },
  //     ],
  //   };
  //   // console.log("this.dataGridExcelRef.getColumnInfoList()", this.dataGridExcelRef.getColumnInfoList());
  //   this.datafieldList.forEach(function (k: any, i: number, a: any) {
  //     groupingSummary.dataFields.push(k);
  //   });
  //   return groupingSummary;
  // }
  // private excelMakeColumn(): IAuiCol[] {
  //   let cols: IAuiCol[] = [];

  //   const from = dayjs(this.fromDate);
  //   const to = dayjs(this.toDate);
  //   const dayCount = to.diff(from, "day");

  //   for (let i = 0; i <= dayCount; i++) {
  //     const dt = dayjs(this.fromDate).add(i, "day");
  //     const subcols: IAuiCol[] = [];
  //     const dta = "D" + dt.format("YYYYMMDD") + "_";

  //     this.datafieldList.push(dta + "PLAN_QTY");
  //     this.datafieldList.push(dta + "ORIGIN_QTY");
  //     this.datafieldList.push(dta + "ROOM_QTY");
  //     this.datafieldList.push(dta + "RESIN");
  //     this.datafieldList.push(dta + "FOAMING_TIME");

  //     subcols.push(
  //       new AuiCol(dta + "ITEM_ID", "제품코드", 140, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-center")
  //         .prop(
  //           "styleFunction",
  //           (
  //             rowIndex: number,
  //             columnIndex: number,
  //             value: string,
  //             headerText: string,
  //             item: any,
  //           ) => {
  //             console.log(item);
  //             console.log(dta + "PLAN_STATUS");
  //             console.log(item[dta + "PLAN_STATUS"]);
  //             console.log(item["LINE_NO"]);
  //             if (item[dta + "PLAN_STATUS"] === "FIX") {
  //               return "prodschedule-rect-header";
  //             } else if (item[dta + "PLAN_STATUS"] === "WIP") {
  //               return "prodschedule-rect-yellow-header";
  //             } else if (item[dta + "PLAN_STATUS"] === "ACT") {
  //               return "prodschedule-rect-gray-header";
  //             } else if (item[dta + "PLAN_STATUS"] === "PLAN") {
  //               return "prodschedule-rect-blue-header";
  //             } else if (item[dta + "PLAN_STATUS"] === "OUTFIX") {
  //               return "prodschedule-rect-header";
  //             }
  //           },
  //         )
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "PLAN_STATUS", "상태", 50, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-right")
  //         .prop("visible", false)
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "PLAN_QTY", "반제품", 50, "numeric", false)
  //         .headerStyle("aui-header")
  //         .style("aui-right")
  //         .prop("formatString", "#,##0")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "ORIGIN_QTY", "완제품", 50, "numeric", false)
  //         .headerStyle("aui-header")
  //         .style("aui-right")
  //         .prop("formatString", "#,##0")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "START_TIME", "시작", 50, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-center")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "END_TIME", "종료", 50, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-center")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "FOAMING_TIME", "발포시간", 70, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-center")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "ROOM_QTY", "방수", 50, "numeric", false)
  //         .headerStyle("aui-header")
  //         .style("aui-center")
  //         .build(),
  //     );
  //     subcols.push(
  //       new AuiCol(dta + "RESIN", "레진", 60, "numeric", false)
  //         .headerStyle("aui-header")
  //         .style("aui-right")
  //         .prop("formatString", "#,##0")
  //         .build(),
  //     );

  //     cols.push(
  //       new AuiCol("D" + dt.format("YYYYMMDD"), dt.format("MM월 DD일"), 140, "string", false)
  //         .headerStyle("aui-header")
  //         .style("aui-read-center")
  //         .prop("children", subcols)
  //         .build(),
  //     );
  //   }
  //   return cols;
  // }

  // private get excelColumnLayout() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("LINE_NO", "LINE_NO", 140, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .prop("cellMerge", true)
  //       .prop("mergeRef", "LINE_NO")
  //       .prop("mergePolicy", "restrict")
  //       .build(),
  //   );
  //   return cols;
  // }
  // private columnLayoutWo() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("PLAN_DATE", "PLANDATE", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("AREA_ID", "AREAID", 60, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("ITEM_ID", "PRODID", 130, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLAN_QTY", "ASSY_QTY", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );

  //   return cols;
  // }
  // private auigridPropsError = {
  //   selectionMode: "multipleCells",
  //   enableCellMerge: true,
  //   showRowNumColumn: false,
  //   showStateColumn: false,
  // };

  // private get columnLayoutError() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("ITEM_ID", "제품코드", 130, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLAN_DATE", "계획일자", 100, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("LINE_NAME", "호기명", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("ERROR_MESSAGE", "상세내역", 208, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   AddAuiColFilter(cols);

  //   return cols;
  // }
  // private auigridPropsWoMapping = {
  //   selectionMode: "multipleCells",
  //   enableCellMerge: true,
  //   showRowNumColumn: false,
  //   showStateColumn: false,
  //   enableFilter: true,
  // };
  // private get columnLayoutWoMapping() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("TARGET_NAME", "Target", 60, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .prop("cellMerge", true)
  //       .prop("mergeRef", "TARGET_NAME")
  //       .prop("mergePolicy", "restrict")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("WO_ID", "Key", 100, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("ITEM_ID", "제품", 142, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("CHILD_ITEM_ID", "반제품", 142, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLAN_DATE", "날짜", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("LINE_NAME", "호기명", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLAN_QTY", "수량", 80, "numeric", false)
  //       .headerStyle("aui-header")
  //       .style("aui-right")
  //       .build(),
  //   );
  //   AddAuiColFilter(cols);

  //   return cols;
  // }
  // private auigridPropsWoSend = {
  //   selectionMode: "multipleCells",
  //   enableCellMerge: true,
  //   showRowNumColumn: false,
  //   showStateColumn: false,
  //   enableFilter: true,
  // };
  // private get columnLayoutWoSend() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("IS_SEND", "", 40, "string", true)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .prop("sortable", false)
  //       .prop("headerRenderer", {
  //         type: "CheckBoxHeaderRenderer",
  //         dependentMode: true,
  //       })
  //       .prop("renderer", {
  //         type: "CheckBoxEditRenderer",
  //         editable: true,
  //         checkValue: "Y",
  //         unCheckValue: "N",
  //         checkableFunction: function (
  //           rowIndex: number,
  //           columnIndex: number,
  //           value: string,
  //           isChecked: boolean,
  //           item: any,
  //           dataField: any,
  //         ) {
  //           // console.log(item);
  //           if (item.VAILD_CHK != "Y" && item.VAILD_CHK != null) {
  //             return false;
  //           } else {
  //             return true;
  //           }
  //         },
  //       })
  //       .build(),
  //   );
  //   // cols.push(
  //   //   new AuiCol("IDX", "Key", 100, "string", false)
  //   //     .headerStyle("aui-header")
  //   //     .style("aui-center")
  //   //     .build(),
  //   // );
  //   cols.push(
  //     new AuiCol("PLAN_DATE", "날짜", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("LINE_NAME", "호기명", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("ITEM_ID", "제품", 140, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("CHILD_ITEM_ID", "반제품", 142, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLAN_QTY", "수량", 80, "numeric", false)
  //       .headerStyle("aui-header")
  //       .style("aui-right")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("VAILD_CHK", "CHECK 결과", 280, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-center")
  //       .build(),
  //   );
  //   AddAuiColFilter(cols);

  //   return cols;
  // }

  // private get columnLayoutWoEditView() {
  //   const cols: IAuiCol[] = [];
  //   cols.push(
  //     new AuiCol("WO_ID", "WO_ID", 100, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   // cols.push(
  //   //   new AuiCol("ITEM_ID", "ITEM_ID", 150, "string", false)
  //   //     .headerStyle("aui-header")
  //   //     .style("aui-read-center")
  //   //     .build(),
  //   // );
  //   cols.push(
  //     new AuiCol("PLANDATE", "계획날짜", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("LINE_NO", "호기", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("PLANQTY", "수량", 80, "numeric", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   cols.push(
  //     new AuiCol("ORDER_WOSTAT", "상태", 80, "string", false)
  //       .headerStyle("aui-header")
  //       .style("aui-read-center")
  //       .build(),
  //   );
  //   return cols;
  // }
}
</script>
<style>
.grid-wrap-pop-prod-error {
  padding: 20px;
  width: 560px;
  height: 400px;
}
.grid-wrap-pop-wo-mapping {
  padding: 20px;
  width: 740px;
  height: 445px;
}
.grid-wrap-pop-wo-send {
  padding: 20px;
  width: 910px;
  height: 445px;
}
.prodschedule-rect-bold {
  font-size: 11px;
  line-height: 20px;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgb(120, 110, 110);
  margin: 3px 1px;
}
.prodschedule-rect-header {
  background: rgba(255, 182, 141, 0.5);
}
.prodschedule-rect-out-header {
  background: rgba(243, 208, 188, 0.5);
}
.prodschedule-rect-blue-header {
  background: rgba(211, 210, 255, 0.5);
}
.prodschedule-rect-yellow-header {
  background: rgba(236, 234, 71, 0.5);
}
.prodschedule-rect-ibory-header {
  background: #ffffcc;
}
.prodschedule-rect-green-header {
  background: rgba(157, 210, 164, 0.489);
}
.prodschedule-rect-gray-header {
  background: rgba(197, 198, 199, 0.5);
}
.prodschedule-aui-depth1 {
  font-weight: bolder;
  background: rgba(176, 163, 184, 0.5);
}
</style>
