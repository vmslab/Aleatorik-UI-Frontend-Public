<template>
  <div class="wrapper" :style="`height:var(--size-height)`">
    <div class="notfound-wrapper">
      <img class="img-center" src="../image/404.png" />
      <div class="info-area">
        <img src="../image/warning_icon.png" />
        <div class="warning-text">요청하신 페이지를 찾을 수 없습니다.</div>
        <div class="warning-sub-text">
          방문 원하시는 페이지의 주소가 잘못 입력되었거나, 변경 혹은 삭제되어 요청하신 페이지를 찾을 수 없습니다.
          입력하신 페이지의 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.
        </div>
        <button class="default-button" @click="onGoToPrev">이전 화면</button>
        <button class="default-button" @click="onGoToHome">홈으로 가기</button>
        <button v-if="isLogOut" class="default-button" @click="onLogOut">로그아웃</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
