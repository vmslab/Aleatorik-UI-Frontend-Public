import React from "react";
import Routes from "../router/user";
import { useRecoilState } from "recoil";
import Drawer from "devextreme-react/drawer";
import { DRAWER_MAX, DRAWER_MIN } from "@aleatorik-ui/common-ui";

import { layoutState } from "../stores/mainStore";

import TopAppBar from "../components/UserApp/TopAppBar";
import MenuList from "../components/UserApp/MenuList";

const UserApp: React.FC = () => {
  const [layout, setLayout] = useRecoilState(layoutState);
  const onToggleClick = () => {
    setLayout(oldVal => ({
      ...oldVal,
      drawer: !oldVal.drawer,
    }));
  };
  const onClickLogo = () => {
    console.log("logo");
  };
  const Title = () => {
    if (layout.drawer) {
      return (
        <div className="drawer-logo-area" onClick={onClickLogo}>
          Logo
        </div>
      );
    } else {
      return <template></template>;
    }
  };
  const DrawerContent = () => {
    return (
      <div className="moz-side-menu">
        <div className="side-top-area">
          <div className="toggle-menu">
            <i className="mozart-icons m-016_menu" onClick={onToggleClick} />
          </div>
          <Title></Title>
        </div>
        <MenuList></MenuList>
      </div>
    );
  };
  return (
    <Drawer
      className="moz-drawer"
      minSize={DRAWER_MIN}
      maxSize={DRAWER_MAX}
      opened={layout.drawer}
      openedStateMode="push"
      revealMode="slide"
      render={DrawerContent}
    >
      <div id="content" className="moz-contents">
        <TopAppBar />
        <Routes />
      </div>
    </Drawer>
  );
};

export default UserApp;
