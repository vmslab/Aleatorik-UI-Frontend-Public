<template>
  <div>
    <div class="moz-frame">
      <WjFlexGrid
        style="width: 100%; height: calc(var(--size-content-height) - 3px)"
        :itemsSource="itemsSource"
        :initialized="onInitialized"
        :scrollPositionChanged="
          (s, e) => {
            if (s.viewRange.bottomRow >= s.rows.length - 1) {
              let view = s.collectionView;
              let index = view.currentPosition;
              loadFunc();
              view.refresh();
              view.currentPosition = index;
            }
          }
        "
        selectionMode="MultiRange"
        allowSorting="MultiColumn"
        keyActionTab="Cycle"
        :allowDelete="true"
        :autoGenerateColumns="false"
        :deferResizing="true"
        :quickAutoSize="true"
        :imeEnabled="true"
        :alternatingRowStep="0"
      >
        <WjFlexGridColumn width="*" binding="ID" header="ID" aggregate="Cnt" :isReadOnly="true" />
        <WjFlexGridColumn width="2*" binding="EQP_ID" header="EQP ID" />
        <WjFlexGridColumn
          width="2*"
          binding="STEP_ID"
          header="STEP ID"
          :dataMap="['-', 'S53005', 'S59005']"
        />
        <WjFlexGridColumn
          width="*"
          binding="UNIT_QTY"
          header="수량"
          dataType="Number"
          :editor="numberEditor"
          format="n0"
          aggregate="Sum"
          :allow-editing="true"
        />
        <WjFlexGridColumn
          width="3*"
          binding="START_TIME"
          header="시작 시간"
          dataType="Date"
          :editor="dateEditor"
          format="yyyy-MM-dd HH:mm:ss"
          aggregate="Max"
          :allow-editing="true"
        />
        <WjFlexGridColumn
          width="3*"
          binding="END_TIME"
          header="종료 시간"
          dataType="Date"
          :editor="dateEditor"
          format="yyyy-MM-dd HH:mm:ss"
          aggregate="Max"
          :allow-editing="true"
        />
      </WjFlexGrid>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { InputDateTime, InputNumber } from "@grapecity/wijmo.input";

import { Get, Save } from "@/api/mainService";
import DxButton from "devextreme-vue/button";

@Component({
  components: {
    DxButton,
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class ExtendEditGrid extends Vue {
  public flexGrid?: FlexGrid;
  public extendGrid?: ExtendGrid;

  public dataKey = ["ID", "EQP_ID"];
  public itemsSource: any = [];

  public dateEditor = new InputDateTime(document.createElement("div"), {
    format: "yyyy-MM-dd HH:mm:ss",
  });
  public numberEditor = new InputNumber(document.createElement("div"), {
    format: "n",
  });

  public skip = 0;
  public take = 100;

  constructor() {
    super();
  }

  public onInitialized(grid: any) {
    this.flexGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: grid,
      dataOptions: {
        dataKey: this.dataKey,
        validateKey: "edit",
      },
      gridOptions: {
        useAutoColumnFit: false,
        onInitialized: grid => {
          this.extendGrid?.contextMenu?.addMenuItem({ header: "-" });
          this.extendGrid?.contextMenu?.addMenuItem({
            cmd: "Save Changes",
            header: "Save Changes",
            active: () => !!this.extendGrid?.isEditing,
            clicked: () => {
              this.extendGrid?.saveEditData();
            },
          });
          this.extendGrid?.contextMenu?.addMenuItem({
            cmd: "Clear Changes",
            header: "Clear Changes",
            active: () => !!this.extendGrid?.isEditing,
            clicked: () => {
              this.extendGrid?.clearChanges();
            },
          });
        },
        onInitialzeRowData: async () => {
          const ID = await this.maxSeq();
          return { ID };
        },
        onSaveEditData: async (addItems, updateItems, removeItems) => {
          try {
            let result = await Save("Plan", {
              addItems: addItems.map((item: any) => JSON.stringify(item)),
              updateItems: updateItems.map((item: any) => JSON.stringify(item)),
              removeItems: removeItems.map((item: any) => JSON.stringify(item)),
            });
            console.log(result);
            return true;
          } catch {
            return false;
          }
        },
      },
    });
  }

  public async mounted() {
    await this.loadFunc();
  }

  public async loadFunc() {
    const result = await Get("Plan", { option: { skip: this.skip, take: this.take } }, "post");
    this.skip += this.take;
    const data = JSON.parse(result.data)?.data || [];
    this.itemsSource = [...this.itemsSource, ...data];
  }

  public async maxSeq() {
    const result = await Get(
      "TableOption/Plan",
      {
        option: { isSummaryQuery: true, groupSummary: [{ selector: "ID", summaryType: "MAX" }] },
      },
      "post",
    );
    const maxSeq = JSON.parse(result.data)[0]?.MAX_ID || 0;
    const maxSeq2 = this.itemsSource
      .map((item: any) => item.ID)
      .reduce((previous: any, current: any) => {
        return previous > current ? previous : current;
      });
    return maxSeq > maxSeq2 ? maxSeq + 1 : maxSeq2 + 1;
  }
}
</script>
