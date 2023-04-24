import { defineStore, storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import notify from 'devextreme/ui/notify';
import {
  setCssSizeVariable,
  DRAWER_MAX,
  DRAWER_MIN,
  CONTENTS_PADDING,
  TOP_HEIGHT,
  COMPACT_CONTROL_HEIGHT,
  COMPACT_TOP_HEIGHT,
  CONTROL_HEIGHT,
  SIDE_TAB_BAR_WIDTH,
  MENU_HEIGHT,
  STATUS_HEIGHT,
  IThemeData
} from '@aleatorik-ui/common-ui';
import router from '../router';
import { systemId } from '../utils/env';
import { ITreeNode, makeMenuChildren, makeToHierarchicalFormat } from '../../src/utils/tree';
import { Get } from './queryStore';
export type IMenu = {
  systemId: string;
  menuId: string;
  type: 'Category' | 'Menu';
  name: string;
  path: string;
  categoryId?: string;
  sequence?: number;
  separator?: boolean;
  state?: 'loaded' | 'added' | 'removed';
  params?: string;
  isRead?: boolean;
  isWrite?: boolean;
  items?: IMenu[];
};

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    width: 0,
    height: 0,
    drawerMax: DRAWER_MAX,
    drawerMin: DRAWER_MIN,
    contentsPadding: CONTENTS_PADDING,
    drawerWidth: DRAWER_MAX,
    topHeight: COMPACT_TOP_HEIGHT,
    controlHeight: COMPACT_CONTROL_HEIGHT,
    sideTabBarWidth: SIDE_TAB_BAR_WIDTH,
    menuHeight: MENU_HEIGHT,
    statusHeight: STATUS_HEIGHT,
    drawer: true,
    login: false,
    compact: true
  }),
  getters: {
    renderType(layout) {
      return () => {
        return layout.login ? 1 : 0;
      };
    }
  },
  actions: {
    setLayout(from: any) {
      this.width = from.width;
      this.height = from.height;
      this.contentsPadding = from.contentsPadding;
      this.drawerWidth = from.login ? (from.drawer ? from.drawerMax : from.drawerMin) : 0;
      this.topHeight = from.login ? (from.compact ? COMPACT_TOP_HEIGHT : TOP_HEIGHT) : 0;
      this.controlHeight = from.login ? (from.compact ? COMPACT_CONTROL_HEIGHT : CONTROL_HEIGHT) : 0;
      this.drawer = from.login ? from.drawer : true;
      this.login = from.login;
      this.compact = from.compact;

      setCssSizeVariable({
        width: this.width,
        height: this.height,
        contentsPadding: this.contentsPadding,
        drawerWidth: this.drawerWidth,
        topHeight: this.topHeight,
        controlHeight: this.controlHeight,
        sideTabBarWidth: this.sideTabBarWidth,
        menuHeight: this.menuHeight,
        statusHeight: this.statusHeight
      });
    }
  }
});

export const useLoadStore = defineStore('load', {
  state: () => ({
    loading: false
  }),
  actions: {
    setLoad(from: any) {
      this.loading = from.loading;
    }
  }
});

export const useAlarmStore = defineStore('alarm', {
  state: () => ({
    message: '',
    type: 'success'
  }),
  actions: {
    setAlarm(from: any) {
      this.message = from.message;
      this.type = from.type;
      notify(
        {
          message: this.message,
          type: this.type,
          displayTime: 2000,
          width: 'auto',
          minWidth: 150,
          animation: {
            show: {
              type: 'fade',
              duration: 400,
              from: 0,
              to: 1
            },
            hide: { type: 'fade', duration: 40, to: 0 }
          }
        },
        { position: 'bottom center', direction: 'up-push' }
      );
    }
  }
});

export const useUserStore = defineStore('user', {
  state: () => ({
    role: '',
    name: '',
    email: ''
  }),
  actions: {
    setUser(from: any) {
      this.role = from.role;
      this.name = from.name;
      this.email = from.email;
    }
  }
});

export const usePathStore = defineStore('path', {
  state: () => ({
    path: ''
  }),
  actions: {
    setPath(from: any) {
      this.path = from.path;
    }
  }
});

export const useServerStore = defineStore('server', {
  state: () => ({
    time: dayjs()
  }),
  actions: {
    setServer(from: any) {
      this.time = from.time;
    }
  }
});

export const useThemeStore = defineStore('theme', {
  state: (): {
    theme: 'light' | 'dark';
    compact: 'normal' | 'compact';
    themeData: IThemeData;
  } => ({
    theme: 'light',
    compact: 'normal',
    themeData: {
      common: {},
      light: {},
      dark: {},
      compact: {},
      normal: {}
    }
  }),
  actions: {
    setTheme(from: any) {
      this.theme = from.theme;
      this.compact = from.compact;
      this.themeData = from.themeData;
    }
  }
});

export const useMenuLocationStore = defineStore('menuLocation', {
  state: () => ({
    menuLocation: 'topandleft'
  }),
  actions: {
    setMenuLocation(value: string) {
      const layout = useLayoutStore();

      let menuSizeObj = storeToRefs(layout);

      if (value === 'top') {
        menuSizeObj.drawer.value = false;
        menuSizeObj.drawerWidth.value = 0;
        menuSizeObj.drawerMax.value = 0;
        menuSizeObj.drawerMin.value = 0;
      } else if (value === 'topandleft' || value === 'topandtree') {
        menuSizeObj.drawer.value = true;
        menuSizeObj.drawerWidth.value = 200;
        menuSizeObj.drawerMax.value = 200;
        menuSizeObj.drawerMin.value = 0;
      } else if (value === 'left') {
        menuSizeObj.drawer.value = true;
        menuSizeObj.drawerWidth.value = DRAWER_MAX;
        menuSizeObj.drawerMax.value = DRAWER_MAX;
        menuSizeObj.drawerMin.value = DRAWER_MIN;
      }
      this.menuLocation = value;

      layout.setLayout({
        ...menuSizeObj
      });
    }
  }
});

export const useMenuItems = defineStore('menuItems', {
  state: () => ({
    items: [] as any[]
  }),
  getters: {
    getMenuSetting(): any[] {
      const menuLocationStore = useMenuLocationStore();

      const { menuLocation } = storeToRefs(menuLocationStore);

      const menuModule = useMenuStore();
      const { getTopAndLeft, getLeftTreeMenu } = storeToRefs(menuModule);

      if (menuLocation.value === 'topandleft') {
        return getTopAndLeft.value;
      } else if (menuLocation.value === 'topandtree') {
        return getLeftTreeMenu.value;
      }
      return [];
    }
  },
  actions: {
    setMenuItems(from: any) {
      this.items = [...from];
    },
    clearMenuItems() {
      this.items = [];
    }
  }
});

export const useMenuStore = defineStore('menu', {
  state: () => ({
    rootMenu: {} as IMenu,
    secondMenu: undefined as IMenu | undefined,
    currentMenu: {} as IMenu | undefined,
    rootItems: [] as IMenu[],
    menuItems: [] as ITreeNode[],
    currentMenuId: '' as string,
    categoryId: '' as string,
    navis: [] as string[],
    isEditing: false
  }),
  getters: {
    getcurrent(state): IMenu | undefined {
      return state.currentMenu;
    },
    rootMenuId(state): string {
      if (!state.rootMenu) return '';
      return state.rootMenu.menuId;
    },
    targetId(state): string {
      return state.secondMenu ? state.secondMenu.menuId : this.rootMenuId;
    },
    getMenus(): any[] {
      const menuItems = useMenuItems();

      if (!menuItems.items) return [];

      let menus = menuItems.items;

      menus.forEach(t => {
        if (!t.items) return;
        t.items.forEach((element: any) => {
          element.selectedCategory = false;
          if (element.menuId === this.currentMenu?.menuId) element.selected = true;
        });
      });

      if (this.secondMenu) {
        const second: any = menus.find(t => t.menuId === this.targetId);
        if (second) {
          second.selectedCategory = true;
        }
      }

      return makeToHierarchicalFormat(menus);
    },
    getTreeMenus(): IMenu[] {
      const menus = this.getMenus;
      if (!menus) return [];

      let itemArr = [];

      itemArr.push(
        ...menus
          .filter(t => (t.categoryId === '' || t.categoryId == null) && t.type === 'Category')
          .map(t => {
            const onlyParent = Object.assign({}, t);
            delete onlyParent.items;
            return onlyParent;
          })
      );

      return itemArr;
    },
    getTopAndLeft(): IMenu[] {
      const menuItems = useMenuItems();

      if (!menuItems.items) return [];

      const menus = [...menuItems.items];

      return menus.filter(t => t.categoryId === this.targetId && t.type === 'Menu');
    },
    getLeftTreeMenu(): any[] {
      const menuItems = useMenuItems();
      let menus: any[] = [];

      menuItems.items.filter(t => t.categoryId === this.rootMenuId).forEach(t => addChildMenu(t, menus));

      return menus;
    },
    getMenuItem(item: any): IMenu {
      const menuItems = useMenuItems();

      return menuItems.items.find(t => t.menuId === item.id);
    },
    getMenuItemById(id: any): IMenu {
      const menuItems = useMenuItems();

      return menuItems.items.find(t => t.menuId === id);
    }
  },
  actions: {
    async loadData(forceUpdate = false) {
      try {
        let rootIndex = 0;
        const menuItems = useMenuItems();
        const userStore = useUserStore();
        const { email } = storeToRefs(userStore);

        if (forceUpdate || menuItems.items.length === 0) {
          try {
            const result = await Get('Menu', { systemId: systemId, email: email.value });
            menuItems.setMenuItems(result.data);
          } catch (e) {
            console.log(e);
            return;
          }
        }

        const path = router.currentRoute.value.path;
        if (path === '/' || path.startsWith(`${systemId ? `/${systemId}` : ``}/main`)) return;

        const currentMenu = menuItems.items.find((menu: IMenu) => menu.path === path);
        if (currentMenu) {
          if (currentMenu.isRead) this.setCurrentMenu(currentMenu);
          else router.push('/401');
        } else {
          router.push('/401');
        }
      } catch (error) {
        console.log(error);
      }
    },
    resetData() {
      const menuItems = useMenuItems();
      menuItems.clearMenuItems();
    },
    changeRootMenu(value?: IMenu) {
      const menuItems = useMenuItems();

      if (!value) return;

      this.rootMenu = value;
      if (this.rootMenu) {
        if (this.rootMenu.type === 'Menu') {
          this.menuItems = [
            {
              name: this.rootMenu.type,
              menu: this.rootMenu
            }
          ];
        } else {
          this.menuItems = [
            {
              name: this.rootMenu.type,
              menu: this.rootMenu,
              children: makeMenuChildren(this.rootMenu.menuId, menuItems.items)
            }
          ];
        }
      } else {
        this.menuItems = makeMenuChildren('', menuItems.items);
      }
    },
    setCurrentMenuId(value: string) {
      this.currentMenuId = value;
    },
    setCategoryId(value: string) {
      this.categoryId = value;
    },
    setCurrentMenu(value: IMenu) {
      const menuItems = useMenuItems();
      if (!value) return;

      const menuItem = menuItems.items.find(menu => menu.menuId === value.menuId);

      this.setCurrentMenuId(menuItem.menuId);
      this.setCategoryId(menuItem.categoryId || '');
      this.changeCurrentMenu(menuItem);

      const categoryMenu = menuItems.items.find(t => t.menuId === menuItem.categoryId)!;

      if (!categoryMenu) {
        if (menuItem.categoryId === 'Favorite') {
          this.changeRootMenu({
            systemId: systemId,
            menuId: 'Favorite',
            type: 'Category',
            name: '',
            path: '/favorite'
          });
        } else {
          this.changeRootMenu(undefined);
        }
        this.changeSecondMenu(undefined);
        return;
      }

      if (categoryMenu.type === 'Category') {
        const rootMenu = menuItems.items.find(t => t.menuId === categoryMenu.categoryId)!;

        if (rootMenu) {
          this.changeSecondMenu(categoryMenu);
          this.changeRootMenu(rootMenu);
        } else {
          this.changeRootMenu(categoryMenu);
          this.changeSecondMenu(undefined);
        }
      }
    },
    changeCurrentMenu(value?: IMenu) {
      this.currentMenu = value;
    },
    changeSecondMenu(value?: IMenu) {
      this.secondMenu = value;
    },
    changeRootItems(value: IMenu[]) {
      this.rootItems = value;
    },
    beginEdit() {
      this.isEditing = true;
    },
    endEdit() {
      this.isEditing = false;
    },
    setIsEditing(isEditing: boolean) {
      this.isEditing = isEditing;
    }
  }
});

export const getNavis = async (path: string, navis: string[]): Promise<string[]> => {
  const menuItems = useMenuItems();
  if (menuItems.items.length === 0) {
    const menuModule = useMenuStore();
    await menuModule.loadData();
  }
  const fitem = menuItems.items.find(item => item.path === path);
  if (fitem) {
    navis.push(fitem.name);
    if (fitem.categoryId) {
      return getCategoryNavis(fitem.categoryId!, navis);
    }
  }
  return navis;
};

export const getCategoryNavis = (menu: string, navis: string[]): string[] => {
  const menuItems = useMenuItems();
  const fitem = menuItems.items.find(item => item.menuId === menu);
  if (fitem) {
    navis.push(fitem.name);
    if (fitem.categoryId) {
      return getCategoryNavis(fitem.categoryId!, navis);
    }
  }
  return navis;
};

export const addChildMenu = (menu: any, menusArr: any[]): any[] => {
  const menuModule = useMenuStore();
  menusArr.push(menu);
  if (menu.items && menu.items.length > 0) {
    menu.items.forEach((m: any) => {
      addChildMenu(m, menusArr);
      if (m === menuModule.currentMenu || m.expanded) menu.expanded = true;
    });
  }
  return menusArr;
};
