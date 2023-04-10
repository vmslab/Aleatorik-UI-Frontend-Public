<template>
  <div>
    <div :class="frameClass">
      <moz-controller></moz-controller>
      <div class="moz-heading-03">Home</div>
      <span class="moz-body-03">Hello World!</span>
      <span v-if="isWritor" class="moz-body-03"> Writor!</span>
      <div>
        <span class="moz-custom">Style</span>
      </div>
      <DxButton class="moz-button" @click="onOpenChartPopup" text="Refresh"></DxButton>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { EventBus } from "mozart-common";
import { MainModule } from "@/store/modules/mainStore";
import { DxButton } from "devextreme-vue/button";

@Component({
  components: { DxButton },
})
export default class Home extends Vue {
  public options: Record<string, any> = {};
  public frameClass: string = "moz-frame";

  constructor() {
    super();
  }

  public get isWritor(): boolean {
    return MainModule.write;
  }

  public mounted() {
    const params = { params: { options: this.options } };
    EventBus.fire("get-options", params);
    console.log(params.params);
    if (this.options.params.menutype === "Popup") this.frameClass = "moz-frame-popup";
  }

  public onOpenChartPopup() {
    EventBus.fire("open-popup", {
      params: { key: "test", target: "_blank", features: "width=600,height=500" },
    });
  }
}
</script>
