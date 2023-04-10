<template>
  <div class="moz-enter">
    <div class="moz-enter-back">
      <img src="../image/background.png" />
    </div>
    <div class="moz-announced-text">
      아래의 주소창에 귀사의 고유 주소를 입력하시면 MOZART CLOUD를 시작 하실 수 있습니다.
    </div>
    <div class="moz-url">
      <div class="moz-url-back">
        <img src="../image/url.png" />
      </div>
      <DxTextBox
        v-model="systemId"
        class="moz-url-text"
        placeholder="Your address here"
        @enter-key="onMoveSystem"
      >
      </DxTextBox>
      <DxButton
        class="moz-url-button"
        icon="search"
        stylingMode="text"
        @click="onMoveSystem"
      ></DxButton>
    </div>
    <DxCheckBox
      class="moz-url-save"
      text="이 주소를 MOZART CLOUD 기본 주소로 지정합니다."
      v-model="isSaveUrl"
    />
    <DxButton
      :width="430"
      :height="65"
      class="moz-button-home moz-button"
      type="normal"
      styling-mode="outlined"
      text="VMS SOLUTIONS 홈페이지로 이동"
      @click="onMoveHome"
    >
    </DxButton>
  </div>
</template>

<script lang="ts">
import { MainModule } from "@/store/modules/mainStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxTextBox } from "devextreme-vue/text-box";
import { DxCheckBox } from "devextreme-vue/check-box";
import { DxButton } from "devextreme-vue/button";
import { ISystem } from "@/generated/types";
import Cookies from "js-cookie";

@Component({
  components: {
    DxTextBox,
    DxCheckBox,
    DxButton,
  },
})
export default class Enter extends Vue {
  @Prop({ type: Array, required: true }) public systems!: ISystem[];

  public savedUrl: any = {};
  public systemId: string = "";
  public isSaveUrl: boolean = false;

  constructor() {
    super();
  }

  public created() {
    this.savedUrl = Cookies.get("savedSystemId");

    if (this.savedUrl) {
      this.systemId = this.savedUrl;
      this.isSaveUrl = true;
      this.onMoveSystem();
    }
  }

  public onMoveHome() {
    document.location.href = "https://vms-solutions.com";
  }

  public onMoveSystem() {
    if (!this.systemId) return;
    const lowerSystemId = this.systemId.toLocaleLowerCase();
    if (!this.systems.some(system => system.SYSTEM_ID === lowerSystemId)) {
      MainModule.showSnackBar({ message: `${this.$t("Invalid Address")}`, type: "error" });
      return;
    }

    const path = document.URL.split("?")[0];
    if (this.isSaveUrl) {
      Cookies.set("savedSystemId", lowerSystemId, {
        expires: 30, // 30 days
      });
    }

    if (path.endsWith("/")) {
      document.location.href = `${path}${lowerSystemId}`;
    } else {
      document.location.href = `${path}/${lowerSystemId}`;
    }
  }
}
</script>
