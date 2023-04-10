<template>
  <div>
    <moz-filter-control v-model="filter" :closeOnOutsideClick="true"> </moz-filter-control>
    <div :class="frameClass">
      <moz-controller>
        <DxButton
          v-tooltip="{ text: $t('Filter') }"
          icon="filter"
          @click="filter = !filter"
        ></DxButton>
      </moz-controller>
      <div class="moz-heading-03">Home</div>
      <span class="moz-body-03">Hello World!</span>
      <span v-if="isWritor" class="moz-body-03"> Writor!</span>
      <div>
        <span class="moz-custom">Style</span>
      </div>
      <DxButton class="moz-button" @click="onOpenChartPopup" text="Refresh"></DxButton>
      <DxButton class="moz-button" @click="onTestClick" text="Test"></DxButton>
      <DxButton
        type="default"
        :focusStateEnabled="false"
        @click="onLoadClick"
        text="Load"
      ></DxButton>
      <DxButton
        type="default"
        :focusStateEnabled="false"
        @click="onSaveClick"
        text="Save"
      ></DxButton>
      <DxButton
        type="default"
        :focusStateEnabled="false"
        @click="onRemoveClick"
        text="Remove"
      ></DxButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { EventBus } from "mozart-common";
import { MainModule } from "@/store/modules/mainStore";
import { DxButton } from "devextreme-vue/button";
import { Get } from "@/api/mainService";

@Component({
  components: { DxButton },
})
export default class Home extends Vue {
  public options: Record<string, any> = {};
  public frameClass: string = "moz-frame";
  public filter: boolean = false;

  constructor() {
    super();
  }

  public get isWritor(): boolean {
    return MainModule.write;
  }

  public created() {
    EventBus.register("i18n-ready", this.onI18nReady);
  }

  public mounted() {
    const params = { params: { options: this.options } };
    EventBus.fire("get-options", params);
    console.log(params.params);
    if (this.options.params.menutype === "Popup") this.frameClass = "moz-frame-popup";
  }

  public destroyed() {
    EventBus.remove("i18n-ready", this.onI18nReady);
  }

  public onOpenChartPopup() {
    EventBus.fire("open-popup", {
      params: { key: "test", target: "_blank", features: "width=600,height=500" },
    });
  }

  public onI18nReady(evt: any) {
    const { messages, locale } = evt.detail.params;
    console.log(messages);
    console.log(locale);
    const keys = Object.keys(messages);
    for (const key of keys) {
      this.$i18n.setLocaleMessage(key, (messages as any)[key]);
    }
  }

  public async onTestClick() {
    try {
      const result = await Get("Data/test");
      console.log(result);
    } catch (e: any) {
      console.log(e);
    }
  }

  public async onLoadClick() {
    const result = await new Promise((resolve: any) => {
      const params = {
        resolve,
      };
      EventBus.fire("load-system-setting", { params });
    });
    if (!result) return;
    console.log(result);
  }

  public async onSaveClick() {
    await new Promise((resolve: any) => {
      const params = {
        params: {
          setting: [{ test: "AAA" }, { test: "BBB" }],
        },
        resolve,
      };
      EventBus.fire("save-system-setting", { params });
    });
  }

  public async onRemoveClick() {
    await new Promise((resolve: any) => {
      const params = {
        resolve,
      };
      EventBus.fire("remove-system-setting", { params });
    });
  }
}
</script>
