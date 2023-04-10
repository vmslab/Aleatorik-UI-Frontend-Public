<template>
  <div>
    <div class="moz-frame">
      <WjFlexGrid
        :itemsSource="itemsSource"
        :initialized="onInitialized"
        :autoGenerateColumns="false"
        :imeEnabled="true"
        :alternatingRowStep="0"
      >
        <WjFlexGridColumn binding="ID" header="ID" width="*" aggregate="Cnt" :isReadOnly="true" />
        <WjFlexGridColumn binding="EQP_ID" header="EQP_ID" width="*" />
        <WjFlexGridColumn
          binding="STEP_ID"
          header="STEP_ID"
          width="*"
          :dataMap="['-', 'S53005', 'S59005']"
        />
        <WjFlexGridColumn
          binding="UNIT_QTY"
          header="UNIT_QTY"
          width="*"
          dataType="Number"
          format="n2"
          aggregate="Sum"
          :allow-editing="true"
        />
        <WjFlexGridColumn
          binding="START_TIME"
          header="START_TIME"
          width="2*"
          dataType="Date"
          format="yyyy-MM-dd HH:mm:ss"
          :isReadOnly="true"
        />
        <WjFlexGridColumn
          binding="END_TIME"
          header="END_TIME"
          width="2*"
          dataType="Date"
          format="yyyy-MM-dd HH:mm:ss"
          :isReadOnly="true"
        />
      </WjFlexGrid>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ExtendGrid } from "mozart-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";

import { Get } from "@/api/mainService";

@Component({
  components: {
    WjFlexGrid,
    WjFlexGridColumn,
  },
})
export default class SampleGrid extends Vue {
  public dataGrid: any;
  public extendGrid: ExtendGrid | null = null;
  public itemsSource: any = [];

  public onInitialized(grid: any) {
    this.dataGrid = grid;
    this.extendGrid = new ExtendGrid({
      flexGrid: this.dataGrid,
      gridOptions: {
        useAutoColumnFit: false,
      },
    });
  }

  public async mounted() {
    this.itemsSource = await this.loadFunc();
  }

  public async loadFunc() {
    const result = await Get("Plan", { option: { skip: 0, take: 1000 } }, "post");
    return JSON.parse(result.data)?.data || [];
  }
}
</script>
