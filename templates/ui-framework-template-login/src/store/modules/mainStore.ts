import store from "@/store";
import Cookies from "js-cookie";
import { Module as Mod } from "vuex";
import { Action, getModule, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { IKeyValue, EventBus, changeColorTheme, changeSizeTheme } from "mozart-common";
import Constants from "@/utils/Constants";
import notify from "devextreme/ui/notify";

export interface IWindow {
  width: number;
  height: number;
}

export interface ISnackBarParams {
  message: string;
  type: "error" | "warning" | "success" | "info";
}

export interface IMainState {
  // App
  window: IWindow;
  fontFamily: string;
  labelFontSize: string;
  labelWidthMargin: number;
  validationHeight: number;

  // TopBar
  title: string;
  topHeight: number;
  controlHeight: number;
  minControlHeight: number;
  titleHeight: number;
  contentsPadding: number;
  theme: "light" | "dark";
  compact: "normal" | "compact";

  // Drawer
  drawer: boolean;
  drawerWidth: number;
  name: string;
  roleId: string;

  // Login
  logedOn: boolean;

  // Snack Bar
  snackbar: boolean;
  barColor: string;
  barTimeout: number;
  message: string;

  navis: string[];
  write: boolean;
  params: IKeyValue[];
}

function getControllerHeight(compact: string, menuLocation: string) {
  if (compact === "compact") {
    if (menuLocation === "left") return 44;
    else return 52;
  } else {
    if (menuLocation === "left") return 66;
    else return 60;
  }
}

function getTopHeight(compact: string, menuLocation: string) {
  if (compact === "compact") {
    if (menuLocation === "left") return 52;
    else return 52;
  } else {
    if (menuLocation === "left") return 66;
    else return 60;
  }
}

function getNaviHeight(compact: string, menuLocation: string) {
  if (menuLocation === "left") return 0;
  if (compact === "compact") {
    return 52;
  } else {
    return 60;
  }
}

@Module({ dynamic: true, namespaced: true, store, name: "mainStore" })
class MainStore extends VuexModule implements IMainState {
  public title: string = document.title;
  public topHeight: number = 66; // 45
  public naviHeight: number = 0;
  public window: IWindow = { width: 0, height: 0 };
  public drawer: boolean = true;
  public drawerMax: number = 256;
  public drawerMin: number = 70;
  public drawerWidth: number = this.drawerMax;
  public controlHeight: number = 66;
  public minControlHeight: number = 62;
  public titleHeight: number = 50;
  public contentsPadding: number = 20; // 16
  public theme: "light" | "dark" = "light";
  public compact: "normal" | "compact" = "compact";
  public name: string = "";
  public roleId: string = "";
  public logedOn: boolean = false;
  public snackbar: boolean = false;
  public barColor: string = "";
  public barTimeout: number = 2000;
  public message: string = "";
  public navis: string[] = [];
  public write: boolean = false;
  public params: IKeyValue[] = [];
  public viewElement: HTMLElement | null = null;
  public fontFamily: string = "Noto Sans KR";
  public labelFontSize: string = "14px";
  public labelWidthMargin: number = 5;
  public validationHeight: number = 18;
  public menuLocation: string = "left";

  constructor(module: Mod<ThisType<{}>, any>) {
    super(module);

    const token = Cookies.get("token");
    const name = Cookies.get("name");
    const role = Cookies.get("role");

    this.setLogedOn(token ? true : false);
    this.name = name ? name : "";
    this.roleId = role ? role : "";
  }

  @Mutation
  private setSize() {
    if (process.env.NODE_ENV === "production") return;

    const width = this.window.width;
    const height = this.window.height;
    const contentPadding = this.contentsPadding;
    const contentPaddingNoScroll = this.contentsPadding - 8; // 8px is scroll size
    const drawerWidth = this.drawerWidth;
    const topHeight = this.topHeight;
    const withoutTopHeight = this.window.height - topHeight;
    const controlHeight = this.controlHeight;
    const paddingDouble = contentPadding * 2;
    const contentHeight = height - topHeight;
    const contentWidth = width - drawerWidth;
    const contentsInnerHeight = contentHeight - controlHeight - contentPadding;
    const contentsInnerWidth = contentWidth - paddingDouble;
    const contentsInnerHeightNoPadding = contentHeight - controlHeight;
    document.documentElement.style.setProperty("--size-width", `${width}px`);
    document.documentElement.style.setProperty("--size-height", `${height}px`);
    document.documentElement.style.setProperty("--size-top-height", `${topHeight}px`);
    document.documentElement.style.setProperty("--size-control-height", `${controlHeight}px`);
    document.documentElement.style.setProperty("--size-drawer-width", `${drawerWidth}px`);
    document.documentElement.style.setProperty(
      "--size-height-without-top",
      `${withoutTopHeight}px`,
    );
    document.documentElement.style.setProperty("--size-content-padding", `${contentPadding}px`);
    document.documentElement.style.setProperty(
      "--size-content-padding-reverse",
      `-${contentPadding}px`,
    );
    document.documentElement.style.setProperty(
      "--size-content-padding-no-scroll",
      `${contentPaddingNoScroll}px`,
    );
    document.documentElement.style.setProperty("--size-content-height", `${contentHeight}px`);
    document.documentElement.style.setProperty("--size-content-width", `${contentWidth}px`);
    document.documentElement.style.setProperty(
      "--size-content-inner-height",
      `${contentsInnerHeight}px`,
    );
    document.documentElement.style.setProperty(
      "--size-content-inner-width",
      `${contentsInnerWidth}px`,
    );
    document.documentElement.style.setProperty(
      "--size-content-inner-height-no-padding",
      `${contentsInnerHeightNoPadding}px`,
    );
  }

  @Mutation
  private changeTitle(value: string) {
    this.title = value;
  }

  @Mutation
  private changeWindow(value: IWindow) {
    this.window = value;
  }

  @Mutation
  private toggleDrawer() {
    this.drawer = !this.drawer;
    this.drawerWidth = this.drawer ? this.drawerMax : this.drawerMin;
    if (this.viewElement) {
      this.viewElement.setAttribute("drawer-width", String(this.drawerWidth));
    }
  }

  @Mutation
  private changeDrawer(value: boolean) {
    this.drawer = value;
  }

  @Mutation
  private changeName(value: string) {
    this.name = value;
  }

  @Mutation
  private changeRoleId(value: string) {
    this.roleId = value;
  }

  @Mutation
  private changeLogedOn(value: boolean) {
    this.logedOn = value;
  }

  @Mutation
  private changeSnackBar(value: boolean) {
    this.snackbar = value;
  }

  @Mutation
  private changeMessage(message: string) {
    this.message = message;
  }

  @Mutation
  private changeBarColor(color: string) {
    this.barColor = color;
  }

  @Mutation
  private changeBarTimeout(timeout: number) {
    this.barTimeout = timeout;
  }

  @Mutation
  private changeNavis(value: string[]) {
    this.navis = value;
  }

  @Mutation
  private changeControlHeight(value: number) {
    this.controlHeight = value;
  }

  @Mutation
  private changeMinControlHeight(value: number) {
    this.minControlHeight = value;
  }

  @Mutation
  private changeTopHeight(value: number) {
    this.topHeight = value;
  }

  @Mutation
  private changeWrite(value: boolean) {
    this.write = value;
  }

  @Mutation
  private changeParams(value: IKeyValue[]) {
    this.params = value;
  }

  @Mutation
  private changeDrawerWidth(value: number) {
    this.drawerWidth = value;
  }

  @Action
  public setTitle(value: string) {
    this.changeTitle(value);
  }

  @Mutation
  private changeTheme(value: "light" | "dark") {
    this.theme = value;
    changeColorTheme({ color: value, size: this.compact });
  }

  @Mutation
  private changeCompact(value: "normal" | "compact") {
    this.compact = value;
    this.topHeight = this.compact === "compact" ? 52 : 66;
    this.controlHeight = this.compact === "compact" ? 44 : 66;
    changeSizeTheme({ color: this.theme, size: value });
  }

  @Mutation
  private changeMenuLocation(value: string) {
    if (value === "top") {
      this.drawer = false;
      this.topHeight = getTopHeight(this.compact, value);
      this.naviHeight = getNaviHeight(this.compact, value);
      this.controlHeight = getControllerHeight(this.compact, value);
      this.drawerMin = 0;
      this.drawerMax = 0;
      this.drawerWidth = 0;
    } else if (value === "topandleft" || value === "topandtree") {
      this.drawer = true;
      this.topHeight = getTopHeight(this.compact, value);
      this.naviHeight = getNaviHeight(this.compact, value);
      this.controlHeight = getControllerHeight(this.compact, value);
      this.drawerWidth = 200;
      this.drawerMin = 0;
      this.drawerMax = 200;
    } else if (value === "left") {
      this.drawer = true;
      this.topHeight = getTopHeight(this.compact, value);
      this.naviHeight = getNaviHeight(this.compact, value);
      this.controlHeight = getControllerHeight(this.compact, value);
      this.drawerMax = 256;
      this.drawerWidth = 256;
      this.drawerMin = 70;
    }
    this.menuLocation = value;
  }

  @Action
  public setWindow(value: IWindow) {
    this.changeWindow(value);
    this.setSize();
  }

  @Action
  public toggle() {
    this.toggleDrawer();
    this.setSize();
  }

  @Action
  public setDrawer(value: boolean) {
    this.changeDrawer(value);
    this.setSize();
  }

  @Action
  public setName(value: string) {
    this.changeName(value);
  }

  @Action
  public setRoleId(value: string) {
    this.changeRoleId(value);
  }

  @Action
  public setLogedOn(value: boolean) {
    this.changeLogedOn(value);
  }

  @Action
  public setSnackBar(value: boolean) {
    this.changeSnackBar(value);
  }

  @Action
  public setMessage(message: string) {
    this.changeMessage(message);
  }

  @Action
  public setBarColor(color: string) {
    this.changeBarColor(color);
  }

  @Action
  public setBarTimeout(timeout: number) {
    this.changeBarTimeout(timeout);
  }

  @Action({ rawError: true })
  public showSnackBar(params: ISnackBarParams) {
    notify({
      message: params.message,
      type: params.type,
      displayTime: 2000,
      width: "auto",
      minWidth: 150,
      animation: {
        show: {
          type: "fade",
          duration: 400,
          from: 0,
          to: 1,
        },
        hide: { type: "fade", duration: 40, to: 0 },
      },
    });
    /*
    if (process.env.NODE_ENV === "production") {
      EventBus.fire("show-snack-bar", { params });
    } else {
      this.changeMessage(params.message);
      this.changeBarColor(params.type);
      this.changeSnackBar(true);
    }
    */
  }

  @Action
  public setNavis(value: string[]) {
    this.changeNavis(value);
  }

  @Action
  public setControlHeight(value: number) {
    this.changeControlHeight(Math.max(value, this.minControlHeight));
    this.setSize();
  }

  @Action
  public setMinControlHeight(value: number) {
    this.changeMinControlHeight(value);
  }

  @Action
  public setTopHeight(value: number) {
    this.changeTopHeight(value);
    this.setSize();
  }

  @Action
  public setWrite(value: boolean) {
    this.changeWrite(value);
  }

  @Action
  public setParams(value: IKeyValue[]) {
    this.changeParams(value);
  }

  @Action
  public setDrawerWidth(value: number) {
    this.changeDrawerWidth(value);
    this.setSize();
  }

  @Action
  public setTheme(value: "light" | "dark") {
    this.changeTheme(value);
  }

  @Action
  public setCompact(value: "normal" | "compact") {
    this.changeCompact(value);
    this.setSize();
  }

  @Action
  public setMenuLocation(value: string) {
    this.changeMenuLocation(value);
    this.setSize();
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDrawer(): boolean {
    return this.drawer;
  }

  public get getName(): string {
    return this.name;
  }

  public get getRoleId(): string {
    return this.roleId;
  }

  public get getLogedOn(): boolean {
    return this.logedOn;
  }

  public get getSnackBar(): boolean {
    return this.snackbar;
  }

  public get getBarColor(): string {
    return this.barColor;
  }

  public get getMessage(): string {
    return this.message;
  }

  public get getBarTimeout(): number {
    return this.barTimeout;
  }

  public get getWrite(): boolean {
    return this.write;
  }

  public get getRole(): string {
    return "user";
  }

  public get isDev(): boolean {
    return this.getRole === Constants.ROLE_DEVELOPER;
  }

  public get isAdmin(): boolean {
    return this.getRole === Constants.ROLE_ADMIN;
  }

  public get isUser(): boolean {
    return this.getRole === Constants.ROLE_USER;
  }

  public get getSystemId(): string {
    const path = window.location.pathname;
    const pathArr = path.split("/");
    return pathArr[pathArr.length - 1].toLowerCase();
  }

  public get getLoginCookieKey(): string {
    return `${this.getRole}-${this.getSystemId}`;
  }

  // controller O 내장형
  public get getInnerContentsHeight(): number {
    return this.window.height - this.topHeight - this.naviHeight - this.contentsPadding;
  }

  public get getInnerContentsWidth(): number {
    return this.window.width - this.drawerWidth - this.contentsPadding * 2;
  }

  public get getTheme(): "light" | "dark" {
    return this.theme;
  }

  public get getCompact(): "normal" | "compact" {
    return this.compact;
  }

  public get getMenuLocation(): string {
    return this.menuLocation;
  }
}

export const MainModule = getModule(MainStore);
