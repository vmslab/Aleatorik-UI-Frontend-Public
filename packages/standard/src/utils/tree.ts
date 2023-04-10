import { IMenu } from "../stores/mainStore";
export interface IViewNode {
  id: string;
  name: string;
  type: "Module" | "Category" | "View";
  version?: string;
  description?: string;
  collapsed: boolean;
  show: boolean;
  item?: object;
  view: any | null;
  children?: IViewNode[];
  use: boolean;
}

export interface IViewNode {
  name: string;
  views: any[];
}

export interface ITreeNode {
  name: string;
  menu: IMenu;
  children?: ITreeNode[];
}

const AddChild = (data: any[], parent: any, sort: boolean, childInside: boolean): IMenu[] => {
  let ordered: any[] = [];
  const children = data.filter(t => t.categoryId === parent.menuId);

  children.forEach((item: any) => {
    if (childInside === false) {
      ordered.push(item);
      if (item.MENU_TYPE === "Category") {
        ordered = ordered.concat(AddChild(data, item, sort, childInside));
      }
    } else {
      item.items = AddChild(data, item, sort, childInside);
      ordered.push(item);
    }
  });
  return ordered;
};

export const makeMenuChildren = (categoryId: string, menus: any): ITreeNode[] => {
  const fmenus = menus.filter((menu: IMenu) => {
    if (categoryId) {
      return menu.categoryId === categoryId;
    } else {
      return !menu.categoryId;
    }
  });
  return fmenus.map((menu: IMenu) => {
    if (menu.type === "Category") {
      return {
        name: menu.menuId,
        menu,
      };
    } else {
      return {
        name: menu.menuId,
        menu,
        children: makeMenuChildren(menu.menuId, menus),
      };
    }
  });
};

export const makeToHierarchicalFormat = (data: any[]) => {
  const makedList: any[] = [];

  const roots = data.filter(t => (t.categoryId === "" || t.categoryId == null) && t.type === "Category");

  roots.forEach((item: any) => {
    item.items = AddChild(data, item, false, true);
    if (item.MENU_TYPE === "Category") item.icon = "mozart-icons m-017_menuitem";
    makedList.push(item);
  });

  return makedList;
};
