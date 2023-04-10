<template>
  <div>
    <DxSortable
      :data="cellData.value"
      group="tasksGroup"
      :height="dndHeigit"
      @drag-start="onTaskDragStart($event)"
      @reorder="onTaskDrop($event)"
      @add="onTaskDrop($event)"
      @onDragChange="onDragChange($event)"
    >
      <div v-for="task in cellData.value" :key="task.IDX" class="dnd-schedule">
        <DxBox
          :height="26"
          direction="row"
          width="100%"
          class="task-ctx-clazz"
          @item-context-menu="onItemContextMenu($event, task)"
        >
          <DxItem :ratio="0" :base-size="140">
            <template #default>
              <div v-if="task.PLAN_STATUS === 'PLAN'" :class="planStyle(task)">
                {{ task.DISPLAY_NAME }}
              </div>
              <div v-else-if="task.PLAN_STATUS === 'FIX'" :class="fixStyle(task)">
                {{ task.DISPLAY_NAME }}
              </div>
              <div v-else-if="task.PLAN_STATUS === 'WIP'" :class="wipStyle(task)">
                {{ task.DISPLAY_NAME }}
              </div>
              <div v-else-if="task.PLAN_STATUS === 'ACT'" :class="actStyle(task)">
                {{ task.DISPLAY_NAME }}
              </div>
              <div v-else-if="task.PLAN_STATUS === 'OUTFIX'" :class="outStyle(task)">
                {{ task.DISPLAY_NAME }}
              </div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect right">
                <DxNumberBox
                  class="sche-qty-edit"
                  v-model:value="task.PLAN_QTY"
                  :width="50"
                  :height="18"
                  format="#,##0"
                  @keyDown="onValidQty($event, task)"
                  @value-changed="onValueChanged($event, task)"
                ></DxNumberBox>
              </div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read right">{{ task.ORIGIN_QTY | formatNumber }}</div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read center">{{ task.START_TIME }}</div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read center">{{ task.END_TIME }}</div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read center">{{ task.FOAMING_TIME }}</div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read center">{{ task.ROOM_QTY | formatNumber(1) }}</div>
            </template>
          </DxItem>
          <DxItem :ratio="0" :base-size="50">
            <template #default>
              <div class="rect rect-read right">{{ task.RESIN | formatNumber }}</div>
            </template>
          </DxItem>
        </DxBox>
      </div>
    </DxSortable>
    <div>
      <DxBox :height="26" direction="row" width="100%">
        <DxItem :ratio="0" :base-size="140">
          <template #default>
            <div class="rect rect-footer bold">{{ `합계` }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect right">
              <DxNumberBox
                class="sche-qty-read"
                :value="sumPlanQty"
                :width="50"
                :height="18"
                format="#,##0"
              ></DxNumberBox>
            </div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer right">{{ sumOriginQty | formatNumber }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer center">{{ `` }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer center">{{ `` }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer center">{{ sumFoamingQty | formatNumber(1) }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer center">{{ sumRoomQty | formatNumber(1) }}</div>
          </template>
        </DxItem>
        <DxItem :ratio="0" :base-size="50">
          <template #default>
            <div class="rect rect-footer right">{{ sumResinQty | formatNumber(0) }}</div>
          </template>
        </DxItem>
      </DxBox>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import DxList, { DxItemDragging } from "devextreme-vue/list";
import { DxBox, DxItem } from "devextreme-vue/box";
import { DxSortable } from "devextreme-vue/sortable";
import { DxNumberBox } from "devextreme-vue/number-box";
import dayjs, { Dayjs } from "dayjs";
import { alert, confirm } from "devextreme/ui/dialog";
import { LINE_NO_DEFINES } from "./Constant";

@Component({
  components: { DxList, DxBox, DxItem, DxSortable, DxNumberBox },
  filters: {
    formatNumber(value: number, toFix: number) {
      return value
        .toFixed(toFix)
        .toString()
        .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    },
  },
})
export default class ScheCell extends Vue {
  @Prop({ type: Object, required: true })
  private cellData?: any;

  @Prop({ type: Date, required: true })
  private fromDate?: Date;

  @Prop({ type: Date, required: true })
  private fixDate?: Date;

  // 데이터가 없는경우도 dnd 영역을 확보하기 위해 추가함.
  public get dndHeigit() {
    const maxSize: any[] = [
      ...new Set(
        this.cellData.values.map((r: any) => {
          return Array.isArray(r) ? r.length : 0;
        }),
      ),
    ];
    // console.log(Math.max(...maxSize));
    return Math.max(...maxSize) * 26 + 50;
  }

  public planStyle(task: any) {
    if (task.WO_ID === null) {
      return "rect-bold rect-blue-header";
    } else {
      return "rect rect-blue-header";
    }
  }

  public fixStyle(task: any) {
    if (task.WO_ID === null) {
      return "rect-bold rect-header";
    } else {
      return "rect rect-header";
    }
  }

  public wipStyle(task: any) {
    if (task.WO_ID === null) {
      return "rect-bold rect-yellow-header";
    } else {
      return "rect rect-yellow-header";
    }
  }

  public actStyle(task: any) {
    if (task.WO_ID === null) {
      return "rect-bold rect-gray-header";
    } else {
      return "rect rect-gray-header";
    }
  }

  public outStyle(task: any) {
    if (task.WO_ID === null) {
      return "rect-bold rect-header";
    } else {
      return "rect rect-header";
    }
  }

  /**
   * PLAN_QTY 합계
   */
  public get sumPlanQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.PLAN_QTY;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  /**
   * ORIGIN_QTY 합계
   */
  public get sumOriginQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.ORIGIN_QTY;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  /**
   * ROOM_QTY 합계
   */
  public get sumRoomQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.ROOM_QTY;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  public get sumFoamingQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.FOAMING_TIME;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  public get sumResinQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.RESIN;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  public get sumFoammingQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.FOAMING_WAIT;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  public get sumCuttingQty() {
    if (this.cellData.value === undefined) {
      return 0;
    }
    return this.cellData.value
      .map((m: any) => {
        return m.CUTTING_WAIT;
      })
      .reduce((a: number, b: number) => {
        return a + b;
      }, 0);
  }

  /**
   * @deprecated 열을 이동하지 않으므로 사용안함.
   *
   * @param e
   */
  public onReorder(e: any) {
    e.itemData = e.fromData[e.fromIndex];
  }

  public onDragChange(e: any) {
    console.log(e);
    e.cancel = true;
  }

  public onTaskDragStart(e: any) {
    if (
      e.fromData[e.fromIndex].PLAN_STATUS === "WIP" ||
      e.fromData[e.fromIndex].PLAN_STATUS === "ACT"
    ) {
      e.cancel = true;
    }

    e.itemData = e.fromData[e.fromIndex];
    // this.$emit("get-scroll");
  }

  public async onTaskDrop(e: any) {
    if (e.fromData === e.toData && e.fromIndex === e.toIndex) {
      return;
    }

    console.log("onTaskDrop e ", e);
    const moveLine = this.cellData.values[0];
    const moveDate = dayjs(this.fromDate)
      .add(this.cellData.columnIndex - 1, "day")
      .format("YYYYMMDD");
    const moveLineDec = LINE_NO_DEFINES.filter((f: any) => f.CMCODE_DESCR === moveLine)[0]
      .CMCODE_ID;

    if (e.itemData[moveLineDec] === "N") {
      const okMsg =
        "<b>" +
        e.itemData.ITEM_ID +
        "는 " +
        moveLine +
        "의 Arrage 정보가 없어서 이동 할 수 없습니다.<br>";
      alert(okMsg, "Success");
      return;
    }

    if (moveDate < dayjs(new Date()).format("YYYYMMDD")) {
      console.log("이전 날짜로 이동불가");
      return;
    }

    const okMsg =
      "<b>[" +
      e.itemData.ITEM_ID +
      "]<br/>" +
      e.itemData.LINE_NAME +
      " " +
      dayjs(e.itemData.PLAN_DATE).format("MM/DD") +
      " " +
      (e.fromIndex + 1) +
      "번째" +
      "->" +
      moveLine +
      " " +
      dayjs(moveDate).format("MM/DD") +
      " " +
      (e.toIndex + 1) +
      "번째로<br>이동하시겠습니까?</b>";
    if (!(await confirm(okMsg, "Confirm"))) {
      return;
    }

    const toDataTemp = e.toData;
    if (toDataTemp[e.toIndex] === undefined) {
      console.log("toDataTemp[e.toIndex] === undefined");
    } else {
      // console.log("e.toIndex", e.toIndex);
      // console.log("toDataTemp.length", toDataTemp.length);
      for (let i = e.toIndex; i < toDataTemp.length; i++) {
        // console.log("i", i);
        // console.log("toDataTemp[i]", toDataTemp[i]);
        if (toDataTemp[i].PLAN_STATUS === "WIP" || toDataTemp[i].PLAN_STATUS === "ACT") {
          console.log("이동불가");
          return;
        }
      }
    }

    e.itemData.START_TIME = "";
    e.itemData.END_TIME = "";
    e.itemData.FOAMING_WAIT = 0;
    e.itemData.CUTTING_WAIT = 0;

    console.log("this.fixDate", this.fixDate);
    console.log("this.fixDate", dayjs(this.fixDate).format("YYYYMMDD"));
    console.log("moveDate", moveDate);
    if (dayjs(moveDate).isAfter(dayjs(this.fixDate))) {
      // if (dayjs(moveDate).isAfter(dayjs(e.itemData.OUT_FIX_DATE))) {
      e.itemData.PLAN_STATUS = "PLAN";
      // } else {
      //   e.itemData.PLAN_STATUS = "OUTFIX";
      // }
    } else {
      e.itemData.PLAN_STATUS = "FIX";
    }
    e.fromData.splice(e.fromIndex, 1);
    e.toData.splice(e.toIndex, 0, e.itemData);
    console.log("e", e);
    // const moveIdx = e.toData.length > e.toIndex + 1 ? e.toData[e.toIndex + 1].IDX : 0;

    const moveIdx = e.toData.length == e.toIndex + 1 ? 0 : e.toData[e.toIndex + 1].IDX;

    console.log("moveIdx", moveIdx);
    // const moveSeq = e.toIndex > 0 ? e.toData[e.toIndex - 1].PLAN_SEQ : 0;
    // this.$emit("move-item", e.itemData, moveLine, moveDate, e.toIndex + 1);
    this.$emit("move-item", e.itemData, moveLine, moveDate, moveIdx);
  }

  /**
   * 컨텍스트 메뉴 데이터 전달 처리.
   *
   * @param e
   * @param task
   */
  public onItemContextMenu(e: any, task: any) {
    this.$emit("item-ctx-menu", task);
  }

  /**
   * 입력값이 숫자만 허용하는 체크로직.
   *
   * @param e
   */
  public onValidQty(e: any, itemData: any) {
    const val = e.event.key || String.fromCharCode(e.event.which);
    if (itemData.PLAN_STATUS === "WIP" || itemData.PLAN_STATUS === "ACT") {
      e.event.preventDefault();
    }
  }

  /**
   * 계획수량 변경
   *
   * @param e
   */
  public onValueChanged(e: any, itemData: any) {
    // console.log("onValueChanged");
    // console.log("e", e);
    // console.log("itemData", itemData);
    // if (/[^0-9]/g.test(e.value)) {
    //   e.event.preventDefault();
    // }
    this.$emit("change-qty", [itemData]);
  }
}
</script>

<style scoped>
.rect {
  font-size: 11px;
  line-height: 20px;
  overflow: hidden;
  height: 100%;
  border: 1px solid lightgray;
  margin: 3px 1px;
}
.rect-bold {
  font-size: 11px;
  line-height: 20px;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgb(120, 110, 110);
  margin: 3px 1px;
}
.rect-header {
  background: rgba(255, 182, 141, 0.5);
}
.rect-out-header {
  background: rgba(243, 208, 188, 0.5);
}
.rect-blue-header {
  background: rgba(211, 210, 255, 0.5);
}
.rect-yellow-header {
  background: rgba(236, 234, 71, 0.5);
}
.rect-ibory-header {
  background: #ffffcc;
}
.rect-green-header {
  background: rgba(157, 210, 164, 0.489);
}
.rect-gray-header {
  background: rgba(197, 198, 199, 0.5);
}
.rect-purple-header {
  background: rgba(197, 103, 252, 0.5);
}
.rect-read {
  background: var(--color-contents);
}
.rect-footer {
  background: rgba(176, 163, 184, 0.5);
}
.right {
  text-align: right;
  padding-right: 5px;
}
.center {
  text-align: center;
}
.dnd-schedule {
  cursor: pointer;
}
.bold {
  font-weight: bolder;
}
</style>
