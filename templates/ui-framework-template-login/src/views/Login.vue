<template>
  <div>
    <div class="moz-login-container">
      <div style="font-size: 50px; color: #1a408d; font-weight: 900">
        {{ selectedSystem ? $t(selectedSystem.NAME) : "System" }}
      </div>
      <div class="moz-login-back">
        <img src="/module/main_background_b.png" :width="width" :height="height" />
      </div>
      <div class="moz-login">
        <div v-if="isInit">
          <dx-text-box
            v-model="id"
            placeholder="Email"
            ref="id"
            @enter-key="onLogin"
            @focus-out="onCheckId"
          >
            <dx-validator>
              <dx-required-rule :message="$t('EMAIL_IS_REQUIRED')" />
              <dx-email-rule :message="$t('EMAIL_IS_INVALID')" />
            </dx-validator>
          </dx-text-box>
          <dx-text-box
            v-model="password"
            mode="password"
            placeholder="Password"
            ref="pw"
            @enter-key="onLogin"
          >
            <dx-validator>
              <dx-required-rule :message="$t('PASSWORD_IS_REQUIRED')" />
              <dx-string-length-rule :min="4" :message="$t('AT_LEAST_FOUR_SYMBOLS')" />
            </dx-validator>
          </dx-text-box>
          <dx-button
            :width="430"
            :height="65"
            class="moz-button-login"
            type="default"
            styling-mode="contained"
            :use-submit-behavior="true"
            text="Login"
            @click="onLogin"
          >
          </dx-button>
          <div
            style="width: 430px; margin-top: 35px; display: flex; justify-content: space-between"
          >
            <div style="margin: auto 0px">
              <DxCheckBox :value="saveId" :text="$t(`SaveID`)" :width="100" />
            </div>
          </div>
        </div>
        <div v-else class="moz-system-list">
          <ul>
            <li v-for="system in systems" v-bind:key="system.NAME" @click="onSystemClick(system)">
              <div>{{ $t(system.NAME) }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <dx-load-panel
      ref="loadpanel"
      :visible="loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :close-on-outside-click="false"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DxCheckBox } from "devextreme-vue/check-box";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { DxTextBox } from "devextreme-vue/text-box";
import {
  DxValidator,
  DxRequiredRule,
  DxEmailRule,
  DxStringLengthRule,
} from "devextreme-vue/validator";
import DxButton from "devextreme-vue/button";

import { MainModule } from "@/store/modules/mainStore";
import { ILogin, ISystem } from "@/generated/types";
import { CustomLogin, Get } from "@/api/mainService";
import { EventBus } from "mozart-common";
import { EncryptAES, GetRSAKey, DecryptAES } from "mozart-component-dev";

@Component({
  components: {
    DxButton,
    DxCheckBox,
    DxTextBox,
    DxLoadPanel,
    DxValidator,
    DxRequiredRule,
    DxEmailRule,
    DxStringLengthRule,
  },
})
export default class Login extends Vue {
  public loading: boolean = false;
  public setControlHeight: any = MainModule.setControlHeight;
  public id: string = "";
  public password: string = "";
  public systems: ISystem[] = [];
  public options: Record<string, any> = {};
  public isInit: boolean = true;
  public selectedSystem: ISystem | undefined = undefined;
  public publicKey: string = "";
  public expires: string = "";
  public saveId: boolean = false;

  constructor() {
    super();
  }

  public get module() {
    return MainModule;
  }

  public get width(): number {
    return MainModule.window.width;
  }

  public get height() {
    return MainModule.window.height;
  }

  public async mounted() {
    EventBus.fire("get-systems", { params: { systems: this.systems, options: this.options } });
    EventBus.fire("get-token-expires", { params: { options: this.options } });
    EventBus.fire("get-saved-id-cookie", {
      params: { options: this.options },
    });

    await this.getPublicKey();
    this.isInit = this.options.isInit;
    this.selectedSystem = this.systems.find(t => t.SYSTEM_ID === MainModule.getSystemId);

    // if (this.selectedSystem) {
    //   document.title = this.$t(this.selectedSystem.NAME) as string;
    // }

    this.getSavedId();
  }

  public getSavedId() {
    const id = this.options.savedId;
    if (id) {
      this.saveId = true;
      this.id = id as string;
    }
    this.$nextTick(() => {
      if (this.id) {
        if (this.$refs.pw) {
          (this.$refs.pw as DxTextBox).instance?.focus();
        }
      } else {
        if (this.$refs.id) {
          (this.$refs.id as DxTextBox).instance?.focus();
        }
      }
    });
  }

  public async getPublicKey() {
    const result = await Get("PublicKey");
    this.publicKey = result.data;
  }

  public onSystemClick(system: ISystem) {
    EventBus.fire("set-system", { params: { system } });
    this.selectedSystem = system;
  }

  public async isAdmin(id: string, resolve: any, reject: any) {
    EventBus.fire("is-account-admin", {
      params: {
        account: id,
        system: MainModule.getSystemId,
        options: this.options,
        resolve: resolve,
        reject: reject,
      },
    });
  }

  public async onLogin() {
    this.loading = true;

    setTimeout(async () => {
      try {
        if (!this.id || !this.password) return;

        await new Promise((resolve: any, reject: any) => {
          this.isAdmin(this.id, resolve, reject);
        });

        const obj = {
          id: this.id,
          pw: this.password,
          name: "사용자",
          role: JSON.stringify(this.options.role),
          admin: this.options.isAdmin,
          group: this.options.group,
          system: this.selectedSystem!.SYSTEM_ID,
          expires: this.options.expires,
        };

        const cryptedMessage = await EncryptAES(this.publicKey, JSON.stringify(obj));
        const rsaKey = await GetRSAKey();

        const result = await CustomLogin({
          cryptedMessage,
          rsaKey,
        });

        const decrypted = await DecryptAES(result.data);
        const data = JSON.parse(decrypted);

        this.onDone(data);
      } catch (error: any) {
        this.onError(error);
      } finally {
        this.loading = false;
      }
    }, 0);
  }

  public onCheckId() {
    if (!this.id) return;
    if (this.id.search("@") === -1) {
      // TODO: 업체에 맞게 Domain 변경
      this.id += `@vms-solutions.com`;
    }
  }

  public onLogout() {
    console.log("logout 처리");
    EventBus.remove("logout-user", this.onLogout);
  }

  public async onDone(result: ILogin) {
    if (result.result) {
      if (this.saveId) {
        EventBus.fire("set-saved-id-cookie", { params: { id: this.id } });
      } else {
        EventBus.fire("remove-saved-id-cookie");
      }
      EventBus.register("logout-user", this.onLogout);
      EventBus.fire("login-user", {
        params: { result: result },
      });
    } else {
      MainModule.showSnackBar({ message: "로그인 실패", type: "error" });
    }
  }

  public onError(message: string) {
    MainModule.showSnackBar({ message: message, type: "error" });
  }
}
</script>
