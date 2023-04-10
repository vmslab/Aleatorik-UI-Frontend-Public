<template>
  <div class="wrapper" :style="`height:var(--size-height)`">
    <div class="notfound-wrapper">
      <img class="img-center" src="../image/404.png" />
      <div class="info-area">
        <img src="../image/warning_icon.png" />
        <div class="warning-text">페이지에 접근할 권한이 없습니다.</div>
        <div class="warning-sub-text">
          방문 원하시는 페이지의 주소가 잘못 입력되었거나, 페이지에 접근할 권한이 없습니다. 입력하신 페이지의 주소가
          정확한지 다시 한번 확인해 주시거나 관리자에게 문의해주시기 바랍니다.
        </div>
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

const onGoToHome = () => {
  location.href = "/";
};

const onLogOut = async () => {
  await signout.value();
};
</script>
