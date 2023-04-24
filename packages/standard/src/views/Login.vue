<template>
  <div class="moz-login-container">
    <div style="font-size: 50px; color: #1a408d; font-weight: 900">MozartWeb Login</div>

    <div class="moz-login-back">
      <img v-if="theme === 'dark'" src="../assets/dark_login_image_3x.png" :width="width" :height="height" />
      <img v-else src="../assets/light_login_image_3x.png" :width="width" :height="height" />
    </div>
    <div className="moz-login">
      <dx-text-box v-model:value="id" placeholder="UserName" @enter-key="onLogin" @focus-out="onCheckId">
        <dx-validator>
          <dx-required-rule />
          <dx-email-rule />
          <!-- <dx-pattern-rule :pattern="/^[a-zA-Z0-9]+$/" :message="`${'UserName'} must be a english and number.`" /> -->
        </dx-validator>
      </dx-text-box>
      <dx-text-box v-model:value="pw" mode="password" placeholder="Password" @enter-key="onLogin">
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
      <div className="moz-login-control" style="width: 430px; margin-top: 35px; display: flex; justify-content: space-between">
        <div style="margin: auto 0px">
          <dx-check-box v-model:value="compSaveId" :text="t('SaveID')" :width="100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMutation } from 'vue-query';
import { useTranslation } from 'i18next-vue';
import DxButton from 'devextreme-vue/button';
import DxTextBox from 'devextreme-vue/text-box';
import { DxValidator, DxRequiredRule, DxPatternRule, DxStringLengthRule, DxEmailRule } from 'devextreme-vue/validator';
import { DxCheckBox } from 'devextreme-vue/check-box';

import { Login as LoginCall, getCookie, setCookie, parseExpires, removeCookie } from '@aleatorik-ui/common-api';
import { encodeUnescapeBtoa, decodeEscapeAtob } from '@aleatorik-ui/common-ui';
import { useLayoutStore, useLoadStore, useAlarmStore, useUserStore, useMenuStore, useThemeStore } from '../stores/mainStore';

import sha256 from 'crypto-js/sha256';
import router from '../router';
import { domain } from '../utils/env';
import { systemPath } from '../router/index';

const { t } = useTranslation();

const layout = useLayoutStore();
const load = useLoadStore();
const alarm = useAlarmStore();
const user = useUserStore();
const menuModule = useMenuStore();
const themeModule = useThemeStore();

const { width, height, renderType } = storeToRefs(layout);
const { theme } = storeToRefs(themeModule);

const savedId = ref(decodeEscapeAtob(getCookie('save_id')));
const id = ref(savedId.value);
const pw = ref('');
let saveId = savedId.value ? true : false;

onBeforeMount(() => {
  if (renderType.value() === 1) {
    router.push(`${systemPath}/main`);
  }
});

const failedLogin = (message: string) => {
  alarm.setAlarm({
    message,
    type: 'error'
  });
};

const mutation = useMutation(LoginCall, {
  onSuccess: async result => {
    if (result && result.data && result.data.success) {
      const refreshToken = encodeUnescapeBtoa(result.data.refreshToken);
      setCookie('refresh_token', refreshToken, {
        path: '/',
        sameSite: 'strict',
        expires: parseExpires(result.data.expiration)
      });
      if (saveId) {
        setCookie('save_id', encodeUnescapeBtoa(id.value), { sameSite: 'strict' });
      } else {
        removeCookie('save_id');
      }
      user.setUser({
        name: result.data.name,
        email: result.data.email,
        role: result.data.role
      });
      layout.setLayout({
        ...storeToRefs(layout),
        login: true
      });
    } else {
      failedLogin('SignIn Failed!');
    }
    menuModule.resetData();
    router.push('/');
    load.setLoad({ loading: false });
  },
  onError: (err: any) => {
    failedLogin(err.message);
    load.setLoad({ loading: false });
  }
});

const onLogin = async () => {
  if (!id.value || !pw.value) return;
  load.setLoad({ loading: true });
  mutation.mutate({ Email: id.value, Password: sha256(pw.value).toString() });
};

const onCheckId = () => {
  if (!id.value) return;
  if (id.value.search('@') === -1) {
    id.value += `@${domain}`;
  }
};

const compSaveId = computed({
  get: () => saveId,
  set: val => (saveId = val)
});
</script>
