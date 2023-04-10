<template>
  <div className="moz-login">
    <div className="moz-login-title">Login</div>
    <dx-text-box v-model:value="compId" placeholder="UserName" @enter-key="onLogin">
      <dx-validator>
        <dx-required-rule />
        <dx-pattern-rule :pattern="/^[a-zA-Z0-9]+$/" :message="`${'UserName'} must be a english and number.`" />
      </dx-validator>
    </dx-text-box>
    <dx-text-box v-model:value="compPass" mode="password" placeholder="Password" @enter-key="onLogin">
      <dx-validator>
        <dx-required-rule />
        <dx-string-length-rule :min="4" />
      </dx-validator>
    </dx-text-box>
    <dx-button
      class="moz-button-login"
      type="default"
      styling-mode="contained"
      :use-submit-behavior="true"
      :text="t('Login')"
      :width="430"
      :height="65"
      @click="onLogin"
    >
    </dx-button>
    <div className="moz-login-control">
      <div style="margin: auto 0px">
        <dx-check-box v-model:value="compSaveId" :text="t('SaveID')" :width="100" />
      </div>
      <!-- <div style="vertical-align: top">
        <a :href="`mailto:${adminEamil}`" className="moz-link">{{ "request_admin" }}</a>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useMutation } from "vue-query";
import { useTranslation } from "i18next-vue";
import DxButton from "devextreme-vue/button";
import DxTextBox from "devextreme-vue/text-box";
import { DxValidator, DxRequiredRule, DxPatternRule, DxStringLengthRule } from "devextreme-vue/validator";
import { DxCheckBox } from "devextreme-vue/check-box";

import { Login as LoginCall, getCookie, setCookie, parseExpires, removeCookie } from "@aleatorik-ui/common-api";
import { encodeUnescapeBtoa, decodeEscapeAtob } from "@aleatorik-ui/common-ui";
import { useLayoutStore, useLoadStore, useAlarmStore, useUserStore } from "../stores/mainStore";

const { t } = useTranslation();

const layout = useLayoutStore();
const load = useLoadStore();
const alarm = useAlarmStore();
const user = useUserStore();

const savedId = ref(decodeEscapeAtob(getCookie("save_id")));
let id = savedId.value;
let pw = "";
let saveId = savedId.value ? true : false;

const failedLogin = (message: string) => {
  alarm.setAlarm({
    message,
    type: "error",
  });
};

const mutation = useMutation(LoginCall, {
  onSuccess: result => {
    if (result && result.data && result.data.success) {
      setCookie("refresh_token", encodeUnescapeBtoa(result.data.refreshToken), {
        sameSite: "strict",
        expires: parseExpires(result.data.expiration),
      });
      if (saveId) {
        setCookie("save_id", encodeUnescapeBtoa(id), { sameSite: "strict" });
      } else {
        removeCookie("save_id");
      }
      user.setUser({
        name: result.data.userName,
        email: result.data.email,
        role: result.data.role,
      });
      layout.setLayout({
        ...storeToRefs(layout),
        login: true,
      });
    } else {
      failedLogin("SignIn Failed!");
    }
    load.setLoad({ loading: false });
  },
  onError: (err: any) => {
    failedLogin(err.message);
    load.setLoad({ loading: false });
  },
});

const onLogin = async () => {
  if (!id || !pw) return;
  load.setLoad({ loading: true });
  mutation.mutate({ userName: id, password: pw });
};

const compId = computed({
  get: () => id,
  set: val => (id = val),
});
const compPass = computed({
  get: () => pw,
  set: val => (pw = val),
});
const compSaveId = computed({
  get: () => saveId,
  set: val => (saveId = val),
});
</script>
