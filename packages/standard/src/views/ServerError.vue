<template>
  <div class="wrapper" :style="`height:var(--size-height)`">
    <div class="notfound-wrapper">
      <img class="img-center" src="../image/404.png" />
      <div class="info-area">
        <img src="../image/warning_icon.png" />
        <div class="warning-text">서버에서 오류가 발생하였습니다.</div>
        <div class="warning-sub-text">관리자에게 문의해주시기 바랍니다.</div>
        <button class="default-button" @click="onGoToPrev">이전 화면</button>
        <button class="default-button" @click="onGoToHome">홈으로 가기</button>
        <button v-if="isLogOut" class="default-button" @click="onLogOut">로그아웃</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { useSignout } from "../utils/user";

const { signout } = useSignout();

const props = defineProps<{
  isLogOut?: boolean;
}>();

const onGoToPrev = () => {
  history.back();
};

const onGoToHome = () => {
  location.href = "/";
};

const onLogOut = async () => {
  await signout.value();
};
</script>
