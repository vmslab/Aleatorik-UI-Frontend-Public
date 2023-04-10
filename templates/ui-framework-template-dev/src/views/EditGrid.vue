<template>
  <div>
    <div class="moz-frame">
      <DxDataGrid
        v-grid-merge="{
          columns: ['EQP_ID', 'PAPER_WIDTH'],
          affectedPrev: true,
        }"
        class="moz-edit-datagrid moz-controller-contains-grid"
        ref="dataGrid"
        height="var(--size-content-height)"
        :data-source="dataSource"
        :row-alternation-enabled="true"
        :remote-operations="true"
        :show-row-lines="false"
        :show-column-lines="false"
        :allow-column-resizing="true"
        :allow-column-reordering="true"
        @toolbar-preparing="onToolbarPreparing"
      >
        <template #titleTemplate>
          <div class="moz-controller-title">{{ $t(`editgrid`) }}</div>
        </template>
        <DxFilterRow :visible="true" />
        <DxScrolling mode="virtual" />
        <DxEditing mode="batch" :allow-adding="true" :allow-updating="true" />
        <DxColumn data-field="ID" :caption="$t('ID')" :visible="false" />
        <DxColumn data-field="EQP_ID" caption="EQP ID" :allow-editing="false" />
        <DxColumn
          data-field="PAPER_WIDTH"
          data-type="number"
          :allow-editing="false"
          caption="전폭"
        />
        <DxColumn data-field="STEP_ID" caption="STEP ID"
          ><DxLookup :data-source="['S53005', 'S59005']"
        /></DxColumn>
        <DxColumn data-field="UNIT_QTY" data-type="number" :allow-editing="true" caption="수량" />
        <DxColumn
          data-field="START_TIME"
          data-type="date"
          :allow-editing="false"
          caption="시작 시간"
        />
        <DxColumn
          data-field="END_TIME"
          data-type="date"
          :allow-editing="false"
          caption="종료 시간"
        />
        <DxColumn
          data-field="PLAN_LENGTH"
          data-type="number"
          :allow-editing="false"
          caption="계획량"
        />
      </DxDataGrid>
      <EditGridChild text="event-test" ref="child" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { createStoreConfig, ActionLoadOptions } from "mozart-component-wijmo";
import {
  DxDataGrid,
  DxColumn,
  DxExport,
  DxEditing,
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxLookup,
  DxPager,
  DxFilterRow,
  DxPaging,
  DxSearchPanel,
} from "devextreme-vue/data-grid";

import { Get } from "@/api/mainService";
import DxButton from "devextreme-vue/button";
import CustomStore from "devextreme/data/custom_store";
import EditGridChild from "@/components/EditGridChild.vue";

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxExport,
    DxEditing,
    DxFilterRow,
    DxGrouping,
    DxGroupPanel,
    DxLookup,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxButton,
    EditGridChild,
  },
})
export default class Grid extends Vue {
  constructor() {
    super();
  }

  public get dataSource() {
    return new CustomStore(
      createStoreConfig({
        key: "ID",
        loadFunc: this.loadFunc,
      }) as any,
    );
  }

  public async loadFunc(obj: ActionLoadOptions) {
    const result = await Get("Plan", { option: obj }, "post");
    return JSON.parse(result.data);
  }

  public onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift({
      location: "before",
      template: "titleTemplate",
    });
  }
}
</script>
