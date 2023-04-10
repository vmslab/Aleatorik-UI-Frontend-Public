<template>
  <div class="moz-frame">
    <moz-controller></moz-controller>
    <div class="dx-card" :style="`height:var(--size-content-inner-height);`">
      <div class="dx-card-title">
        <div class="dx-card-title-text">Login User Info</div>
      </div>
      <div class="dx-card-text">
        <div>ID: {{ email }}</div>
        <div>ROLE: {{ role }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { ILogin } from "@/generated/types";
import { Get } from "@/api/mainService";

@Component({
  components: {},
})
export default class Home extends Vue {
  public userInfo: ILogin | null = null;

  constructor() {
    super();
  }

  public get module() {
    return MainModule;
  }

  public get email() {
    if (!this.userInfo) return "";
    return this.userInfo.email;
  }

  public get role() {
    if (!this.userInfo || !this.userInfo.role) return "";
    var role = JSON.parse(this.userInfo.role);
    return role.NAME + `(${role.GROUP_ID})`;
  }

  public async mounted() {
    const result = await Get("UserInfo");
    this.userInfo = JSON.parse(result.data);
  }
}
</script>
<style lang="scss" scoped>
.login {
  &-wrapper {
    background-color: #3d394a;
    height: 100vh;
  }
  &-logo {
    width: 131px;
    height: 30px;
    padding: 20px;
  }
  &-form-area {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-top: -70px;
    input {
      width: 260px;
      margin-bottom: 10px;
    }
  }
  &-input-label {
    display: flex;
    justify-content: space-between;
    color: var(--color-font5);
    margin-bottom: 5px;
  }
  &-button-area {
    display: flex;
    justify-content: center;
    margin: 10px;
  }
}
.login-system-list {
  width: 300px;
  height: 40px;
  border-color: #ccc;
  color: #fff;
}
</style>
