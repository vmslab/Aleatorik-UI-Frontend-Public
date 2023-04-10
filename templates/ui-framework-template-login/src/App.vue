<template>
  <div ref="root" :style="`width: ${width}px; height: ${height}px;`">
    <div class="moz-root" ref="innerRoot">
      <Login />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { MainModule } from "@/store/modules/mainStore";
import { EventBus, MIN_WIDTH, MIN_HEIGHT, ScrollBar } from "mozart-common";
import Login from "./views/Login.vue";

@Component({
  components: {
    Login,
  },
})
export default class App extends Vue {
  public width: number = 0;
  public height: number = 0;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  public get appStyle(): object {
    return {
      display: "flex",
      height: `${MainModule.topHeight}px`,
      padding: "10px",
    };
  }

  public async created() {
    EventBus.register("get-systems", this.onGetSystems);
    EventBus.register("set-system", this.onSetSystem);
    EventBus.register("is-account-admin", this.onIsAccountAdmin);
    EventBus.register("get-token-expires", this.onGetTokenExpires);
    EventBus.register("get-saved-id-cookie", this.onGetLoginCookie);
    EventBus.register("set-saved-id-cookie", this.onSetLoginCookie);
    EventBus.register("remove-saved-id-cookie", this.onRemoveLoginCookie);
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  public mounted() {
    this.intervalId = setInterval(() => {
      if (!this.$refs.root) return;
      if (!this.$refs.innerRoot) return;
      new ScrollBar(this.$refs.root as HTMLElement);
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }, 500);
  }

  public destroyed() {
    EventBus.remove("get-systems", this.onGetSystems);
    EventBus.remove("set-system", this.onSetSystem);
    EventBus.remove("is-account-admin", this.onIsAccountAdmin);
    EventBus.remove("get-token-expires", this.onGetTokenExpires);
    EventBus.remove("get-saved-id-cookie", this.onGetLoginCookie);
    EventBus.remove("set-saved-id-cookie", this.onSetLoginCookie);
    EventBus.remove("remove-saved-id-cookie", this.onRemoveLoginCookie);
    window.removeEventListener("resize", this.handleResize);
  }

  public get systemId(): string {
    const url = new URL(window.location.href);
    const type = url.pathname.split("/");
    if (type.length > 0) {
      return type[1];
    }
    return "";
  }

  public onGetSystems(evt: any) {
    const { systems, options } = evt.detail.params;
    systems.push(
      ...[
        {
          SYSTEM_ID: "test1",
          NAME: "TEST1",
          TYPE: "Web",
        },
        {
          SYSTEM_ID: "test2",
          NAME: "TEST2",
          TYPE: "Web",
        },
      ],
    );
    options.isInit = this.systemId !== "";
  }

  public onSetSystem(evt: any) {
    const { system } = evt.detail.params;
    console.log(system);
    console.log(document.URL);
    console.log(`${document.URL.split("?")[0]}${system.SYSTEM_ID}`);
    document.location.href = `${document.URL.split("?")[0]}${system.SYSTEM_ID}`;
  }

  public async onIsAccountAdmin(evt: any) {
    const { account, system, options, resolve, reject } = evt.detail.params;
    options.isAdmin = true;
    options.group = "admin";
    options.role = "default";
    resolve();
  }

  public onGetTokenExpires(evt: any) {
    const { options } = evt.detail.params;
    options.expires = "30min";
  }

  public onGetLoginCookie(evt: any) {
    const { options } = evt.detail.params;
    options.savedId = "";
  }

  public onSetLoginCookie(evt: any) {
    const { id } = evt.detail.params;
    console.log(`${id} saved!`);
  }

  public onRemoveLoginCookie(evt: any) {
    console.log("test-id saved!");
  }

  public handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    MainModule.setWindow({
      width: window.innerWidth < MIN_WIDTH ? MIN_WIDTH : window.innerWidth,
      height: window.innerHeight < MIN_HEIGHT ? MIN_HEIGHT : window.innerHeight,
    });
  }
}
</script>
