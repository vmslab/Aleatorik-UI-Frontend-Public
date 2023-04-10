import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { TreeView } from "devextreme-react/ui/tree-view";
import { addTooltipEvent } from "@mozart-ui/common-ui";
import { menus, IMenu } from "@mozart-ui/common-api";
import { layoutState } from "../../stores/mainStore";

const MenuList: React.FC = () => {
  const layout = useRecoilValue(layoutState);
  const navigate = useNavigate();

  const redirectMenu = (menu?: IMenu, params?: Record<string, any>) => {
    if (!menu) return;
    if (menu.categoryId === "Category") return;
    if (!menu.path) return;
    navigate(menu.path);
    // pushRoute(this.$router, menu.URL, params);
  };

  const onInit = async () => {
    // await this.treemenu.selectItem(MainModule.currentMenuId);
    // await this.treemenu.expandItem(MainModule.currentCategoryId);
    // await this.treemenu.expandItem(MainModule.currentMenuId);
    // await this.onMenuChanged({});
  };

  const onItemClick = async (e: any) => {
    // if (currentMenu === e.itemData.menuId) return;
    // if (!drawer) MainModule.toggle();
    // else {
    // if (MenuModule.getIsChanging) {
    //   const result = await confirm("Are you sure you want to <b>Leave</b> this page?", "Cancel");
    //   if (!result) return;
    // }
    // MenuModule.setIsChanging(false);
    // if (MenuModule.getIsChanging) return;
    // remainFocusIfClickedSameNode(e);
    if (e.itemData.type === "Category") return;
    // MenuModule.setRootMenu(this.findParentItem(e));
    // MenuModule.setSecondMenu(this.findSecondItem(e));

    // await this.treemenu.selectItem(e.itemData.MENU_ID);

    redirectMenu(e.itemData);
    const pointerEvent = e.event;
    pointerEvent.stopPropagation();
    // }
  };

  const onHover = (e: any, item: any) => {
    if (!layout.drawer) {
      let target = e.target;
      if (e.target.nodeName === "I") target = e.target.parentElement;
      addTooltipEvent(target, item.name as string, false, "elright");
    }
  };

  const onMouseOut = (e: any) => {
    if (!layout.drawer) {
      let target = e.target;
      if (e.target.nodeName === "I") target = e.target.parentElement;
      target.onmouseenter = undefined;
    }
  };

  const onMenuItemOver = (evt: React.MouseEvent) => {
    const el = evt.target as HTMLElement;
    if (el.offsetWidth < el.scrollWidth) {
      addTooltipEvent(el, el.innerText, false, "elright");
    }
  };
  const onMenuItemOut = (evt: React.MouseEvent) => {
    const ts = document.getElementsByClassName("tooltip");
    if (ts && ts.length > 0) {
      Array.from(ts).forEach(t => {
        document.body.removeChild(t);
      });
    }
  };
  const renderItem = (data: IMenu) => {
    const MenuText = () => {
      if (layout.drawer) {
        return (
          <span onMouseOver={onMenuItemOver} onMouseOut={onMenuItemOut}>
            {data.name}
          </span>
        );
      } else {
        return <></>;
      }
    };
    const MenuItem = () => {
      if (data.type === "Category" && !data.categoryId) {
        return (
          <div className="first-node">
            <i className="mozart-icons m-017_menuitem"></i>
            <MenuText />
          </div>
        );
      } else if (data.type === "Category" && data.categoryId) {
        return (
          <div className="second-node">
            <MenuText />
          </div>
        );
      } else {
        return (
          <div className="child-node">
            <MenuText />
          </div>
        );
      }
    };
    return (
      <div onMouseOver={evt => onHover(evt, data)} onMouseOut={onMouseOut}>
        <div>
          <MenuItem />
        </div>
      </div>
    );
  };

  return (
    <TreeView
      id="menu"
      className={`moz-drawer-treeview ${layout.drawer ? "" : "closed-node"}`}
      items={menus}
      selection-mode="single"
      dataStructure="plain"
      keyExpr="menuId"
      parentIdExpr="categoryId"
      displayExpr="name"
      expandedExpr="expanded"
      rootValue=""
      hoverStateEnabled={true}
      focusStateEnabled={false}
      expandEvent="click"
      onInitialized={onInit}
      onItemClick={onItemClick}
      width="100%"
      itemRender={renderItem}
    />
  );
};

export default MenuList;
