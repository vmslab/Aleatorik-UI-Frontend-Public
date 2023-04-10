<template>
  <div class="moz-custom-login">
    <div class="moz-login-wrapper">
      <div class="moz-login-area">
        <div v-if="isInit">
          <div class="logo-area">
            <center><img :src="imgUrl" /></center>
          </div>
          <div class="moz-shadow-box">
            <div class="system-name">
              {{ selectedSystem ? $t(selectedSystem.NAME) : "System" }}
            </div>
            <div class="input-area">
              <dx-text-box
                v-model="id"
                :width="300"
                :height="50"
                class="moz-input-text ime-en-only"
                placeholder="Email or ID"
                @enter-key="onLogin"
                @focus-out="onCheckId"
              >
                <dx-validator validation-group="validationLogin">
                  <dx-required-rule :message="$t('EMAIL_IS_REQUIRED')" />
                  <dx-email-rule :message="$t('EMAIL_IS_INVALID')" />
                </dx-validator>
              </dx-text-box>
              <dx-text-box
                v-model="password"
                :width="300"
                :height="50"
                class="moz-input-text ime-en-only"
                mode="password"
                placeholder="Password"
                ref="pw"
                @enter-key="onLogin"
              >
                <dx-validator validation-group="validationLogin">
                  <dx-required-rule :message="$t('PASSWORD_IS_REQUIRED')" />
                  <dx-string-length-rule :min="4" :message="$t('AT_LEAST_FOUR_SYMBOLS')" />
                </dx-validator>
              </dx-text-box>
              <dx-button
                :width="300"
                :height="50"
                class="moz-button-login"
                type="default"
                styling-mode="contained"
                :use-submit-behavior="true"
                text="Log In"
                @click="onLogin"
              >
              </dx-button>
              <div>
                <div>
                  <DxCheckBox
                    :value="saveId"
                    class="moz-save-id"
                    :text="$t('SaveID')"
                    :width="100"
                  />
                  <div class="moz-find-pw" @click="onFindPassword">{{ $t("FIND_PASSWORD") }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Enter v-else :systems="systems" />
        <!-- <div v-else class="moz-system-list">
          <div class="wrapper" :style="`height:var(--size-height)`">
            <div class="notfound-wrapper">
              <img class="img-center" src="../image/404.png" />
              <div class="info-area">
                <img src="../image/warning_icon.png" />
                <div class="warning-text">요청하신 페이지를 찾을 수 없습니다.</div>
                <div class="warning-sub-text">
                  방문 원하시는 페이지의 주소가 잘못 입력되었거나, 변경 혹은 삭제되어 요청하신
                  페이지를 찾을 수 없습니다. 입력하신 페이지의 주소가 정확한지 다시 한번 확인해
                  주시기 바랍니다.
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <DxPopup
      :wrapper-attr="{
        class: 'moz-find-password-popup',
      }"
      :width="400"
      height="auto"
      :title="$t('FIND_PASSWORD')"
      :show-title="true"
      :drag-enabled="true"
      :close-on-outside-click="false"
      :visible="find"
      shadingColor="rgb(0,0,0,0.3)"
      @hidden="find = false"
    >
      <template>
        <div class="moz-area-padding">
          <div class="flex-center moz-body-03">회원가입 시 사용한 이메일을 입력하시면</div>
          <div class="flex-center moz-body-03">해당 이메일로 비밀번호 재설정 URL이 전송됩니다.</div>
          <div style="height: 36px"></div>
          <dx-text-box
            v-model="email"
            class="moz-input-text ime-en-only"
            placeholder="Email"
            @enter-key="onClickSendMail"
          >
            <dx-validator validation-group="validationSendMail">
              <dx-required-rule :message="$t('EMAIL_IS_REQUIRED')" />
              <dx-email-rule :message="$t('EMAIL_IS_INVALID')" />
            </dx-validator>
          </dx-text-box>
        </div>
      </template>
      <DxToolbarItem
        widget="dxButton"
        toolbar="bottom"
        location="after"
        :options="{
          text: $t('Send'),
          elementAttr: { class: 'moz-button-login' },
          onClick: onClickSendMail,
        }"
      />
    </DxPopup>
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
import { DxTextBox } from "devextreme-vue/text-box";
import { DxButton } from "devextreme-vue/button";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import {
  DxValidator,
  DxRequiredRule,
  DxEmailRule,
  DxStringLengthRule,
} from "devextreme-vue/validator";
import ValidationEngine from "devextreme/ui/validation_engine";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";

import { MainModule } from "@/store/modules/mainStore";
import { ILogin, ISystem } from "@/generated/types";
import { EventBus } from "mozart-common";
import Enter from "@/components/Enter.vue";
import { Get } from "@/api/mainService";
import Cookies from "js-cookie";

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
    DxPopup,
    DxToolbarItem,
    Enter,
  },
})
export default class Login extends Vue {
  public loading: boolean = false;
  public setControlHeight: any = MainModule.setControlHeight;
  public id: string = "";
  public password: string = "";
  public email: string = "";
  public systems: ISystem[] = [];
  public options: Record<string, any> = {};
  public isInit: boolean = true;
  public selectedSystem: ISystem | undefined = undefined;
  public expires: string = "";
  public saveId: boolean = false;
  public loginImg: string = "login.png";
  public imgUrl: string = "";
  public find: boolean = false;

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
    EventBus.fire("get-default-domain", {
      params: { options: this.options },
    });

    this.isInit = this.options.isInit;
    this.selectedSystem = this.systems.find(t => t.SYSTEM_ID === MainModule.getSystemId);

    // if (this.selectedSystem) {
    //   document.title = this.$t(this.selectedSystem.NAME) as string;
    // }
    if (!this.isInit) {
      document.title = "Mozart Cloud";
    } else {
      const result = await Get(`ProjectItem/${MainModule.getSystemId}`);
      if (result && result.data) {
        const projectItem = JSON.parse(result.data)?.data[0];
        this.loginImg = projectItem
          ? `${MainModule.getSystemId}/${projectItem.LOGIN_IMAGE}`
          : this.loginImg;
      }

      this.imgUrl = `/image/${this.loginImg}`;
    }

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

  public async procLogin(obj: any, resolve: any, reject: any) {
    EventBus.fire("login-user-proc", {
      params: {
        obj: obj,
        options: this.options,
        resolve: resolve,
        reject: reject,
      },
    });
  }

  public async procPasswordMail(obj: any, resolve: any, reject: any) {
    EventBus.fire("send-password-mail", {
      params: {
        obj: obj,
        options: this.options,
        resolve: resolve,
        reject: reject,
      },
    });
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

        const valid = ValidationEngine.validateGroup("validationLogin");
        if (!valid.isValid) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
        if (valid.status === "pending") {
          const validResult = await valid.complete;

          if (!validResult || !validResult.isValid) {
            MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
            return;
          }
        }

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

        await new Promise((resolve: any, reject: any) => {
          this.procLogin(obj, resolve, reject);
        });

        this.onDone(this.options.loginResult);
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
      if (this.options.defaultDomain) {
        this.id += `@${this.options.defaultDomain}`;
      } else {
        this.id += `@vms-solutions.com`;
      }
    }
  }

  public onLogout() {
    EventBus.remove("logout-user", this.onLogout);
  }

  public onFindPassword() {
    this.find = true;
  }

  public onClickSendMail() {
    this.loading = true;

    setTimeout(async () => {
      try {
        if (!this.email) return;
        const valid = ValidationEngine.validateGroup("validationSendMail");
        if (!valid.isValid) {
          MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
          return;
        }
        if (valid.status === "pending") {
          const validResult = await valid.complete;

          if (!validResult || !validResult.isValid) {
            MainModule.showSnackBar({ message: `${this.$t(`InvalidDataMessage`)}`, type: "error" });
            return;
          }
        }

        const obj = {
          email: this.email,
        };

        await new Promise((resolve: any, reject: any) => {
          this.procPasswordMail(obj, resolve, reject);
        });

        if (this.options.sendMailResult.count > 0) {
          MainModule.showSnackBar({ message: "Send Mail Successed!", type: "success" });
          this.find = false;
        } else {
          MainModule.showSnackBar({ message: "Send Mail Failed!", type: "error" });
        }
      } catch (error: any) {
        this.onError(error);
      } finally {
        this.loading = false;
      }
    }, 0);
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
      MainModule.showSnackBar({ message: "Login Failed!", type: "error" });
    }
  }

  public onError(message: string) {
    MainModule.showSnackBar({ message: "Login Failed!", type: "error" });
    // MainModule.showSnackBar({ message: message, type: "error" });
  }
}
</script>
