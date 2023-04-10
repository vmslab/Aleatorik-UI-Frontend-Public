<template>
  <div>
    <div class="moz-frame">
      <DxDataGrid
        class="moz-datagrid moz-controller-contains-grid"
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
          <div class="moz-controller-title">{{ $t(`grid`) }}</div>
        </template>
        <template #timeTemplate>
          <span class="moz-body-01">{{ time }}</span>
        </template>
        <DxScrolling mode="virtual" />
        <DxExport :enabled="true" />
        <DxGroupPanel :visible="true" />
        <DxGrouping :auto-expand-all="true" />
        <DxColumn data-field="ID" :caption="$t('ID')" />
        <DxColumn data-field="EQP_ID" caption="EQP ID" />
        <DxColumn data-field="STEP_ID" caption="STEP ID" />
        <DxColumn caption="시간" alignment="center">
          <DxColumn data-field="START_TIME" caption="시작시간" alignment="center" />
          <DxColumn data-field="END_TIME" caption="종료시간" alignment="center" />
        </DxColumn>
        <DxColumn data-field="UNIT_QTY" caption="수량" />
      </DxDataGrid>
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
  DxGrouping,
  DxGroupPanel,
  DxScrolling,
  DxPager,
  DxPaging,
  DxSearchPanel,
} from "devextreme-vue/data-grid";
import { Get } from "@/api/mainService";
import DxButton from "devextreme-vue/button";
import CustomStore from "devextreme/data/custom_store";

import { getWebSocketURL } from "@/utils/request";
import notify from "devextreme/ui/notify";

@Component({
  components: {
    DxDataGrid,
    DxColumn,
    DxExport,
    DxGrouping,
    DxGroupPanel,
    DxScrolling,
    DxPager,
    DxPaging,
    DxSearchPanel,
    DxButton,
  },
})
export default class Grid extends Vue {
  public data: any[] = [];
  public socket: WebSocket | null = null;
  private intervalId: NodeJS.Timer | null = null;
  public time: string = "";

  constructor() {
    super();
  }

  public async created() {
    this.intervalId = setInterval(async () => {
      await this.connectWebSocket();
    }, 2000);
  }

  public destroyed() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public async connectWebSocket() {
    if (this.socket) {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      return;
    }
    this.socket = new WebSocket(await getWebSocketURL());
    if (this.socket) {
      this.socket.onopen = () => {
        console.log("socket opened");
      };
      this.socket.onmessage = async (evt: MessageEvent) => {
        const result = JSON.parse(evt.data);

        if (result.msg === "SERVER_TIME") {
          this.time = result.obj.msg;
        } else if (result.msg) {
          notify(`meesage from server '${result.msg}'`, "info");
        }
      };
    }
    this.socket.onerror = (evt: any) => {
      console.log(evt);
    };
    this.socket.onclose = () => {};
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

  public async onCallBroadcast() {
    await Get("Broadcast/Refresh");
  }

  public onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift(
      {
        location: "before",
        template: "titleTemplate",
      },
      {
        location: "after",
        template: "timeTemplate",
      },
      {
        location: "after",
        widget: "dxButton",
        options: {
          icon: "refresh",
          elementAttr: {
            class: "dx-datagrid-refresh-button",
          },
          onClick: this.onCallBroadcast,
        },
      },
    );
  }
}
</script>
