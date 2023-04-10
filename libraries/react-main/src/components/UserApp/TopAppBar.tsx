import * as React from "react";
import dayjs from "dayjs";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import ContextMenu from "devextreme-react/context-menu";
import { userState, serverState, themeState, layoutState } from "../../stores/mainStore";
import { setAppTheme } from "../../utils/theme";
import { useSignout } from "../../utils/user";
import { StreamingParameter } from "@mozart-ui/common";
import { generateGUID } from "@mozart-ui/common-ui";
import { ServerTime } from "@mozart-ui/common-api";
import { ServerTimeResponse } from "@mozart-ui/protos/src/generated/Protos/ServerService";

const ServerTimeComponent: React.FC = () => {
  const server = useRecoilValue(serverState);
  return (
    <span className="moz-body-03 moz-color-font4 nowrap-text" style={{ marginLeft: "16px", fontWeight: 400 }}>
      {server.time.format("MMM-DD HH:mm")}
    </span>
  );
};

const TopAppBar: React.FC = () => {
  const user = useRecoilValue(userState);
  const [theme, setTheme] = useRecoilState(themeState);
  const layout = useRecoilValue(layoutState);
  const setServer = useSetRecoilState(serverState);
  const { signout } = useSignout();

  const userMenus = [{ text: "SignOut", id: "logout" }];
  const sessionId = generateGUID();

  React.useEffect(() => {
    const serverParameter = new StreamingParameter<Record<string, any>, ServerTimeResponse>(sessionId, {});
    const func = async () => {
      serverParameter.onRecived = param => {
        setServer({
          time: dayjs(param.time),
        });
      };
      await ServerTime(serverParameter);
    };
    func();
    return () => {
      serverParameter.isComplate = true;
    };
  });

  const itemClick = async (e: any) => {
    const id = e.itemData.id;
    if (id === "logout") {
      await signout();
    }
  };
  const onClickTheme = (t: "light" | "dark") => {
    const from = { ...theme, theme: t };
    setTheme(oldVal => from);
    setAppTheme(from, layout);
  };
  const onClickCompact = (c: "normal" | "compact") => {
    const from = { ...theme, compact: c };
    setTheme(oldVal => from);
    setAppTheme(from, layout);
  };
  const ThemeIcon = () => {
    if (theme.theme === "light") {
      return <i onClick={() => onClickTheme("dark")} className="mozart-icons moz-theme-tap top-app-button"></i>;
    } else {
      return <i onClick={() => onClickTheme("light")} className="mozart-icons moz-theme top-app-button"></i>;
    }
  };
  const CompactIcon = () => {
    if (theme.compact === "normal") {
      return (
        <i onClick={() => onClickCompact("compact")} className="mozart-icons moz-compact-normal top-app-button"></i>
      );
    } else {
      return <i onClick={() => onClickCompact("normal")} className="mozart-icons moz-compact top-app-button"></i>;
    }
  };
  const UserMenuItem = (data: any) => {
    return (
      <div className="menu-item">
        <span>{data.text}</span>
      </div>
    );
  };
  return (
    <div className="moz-top-app">
      <div className="moz-navigator">TopAppBar</div>
      <div className="spacer"></div>
      <div className="moz-top-common-btn-area">
        <ThemeIcon />
        <CompactIcon />
      </div>
      <div className="moz-user-info">
        <div className="flex-center-horizontal">
          <span className="moz-body-02" style={{ fontWeight: 700 }}>
            {user.name}
          </span>
          <ServerTimeComponent></ServerTimeComponent>
        </div>
        <div className="moz-body-03 moz-color-font5" style={{ whiteSpace: "nowrap" }}>
          {user.email}
        </div>
      </div>
      <div className="mozart-icons moz-top-user-menu" id="user-menu"></div>
      <ContextMenu
        dataSource={userMenus}
        width={200}
        cssClass="moz-user-context"
        target="#user-menu"
        showEvent="click"
        onItemClick={itemClick}
        itemRender={UserMenuItem}
      ></ContextMenu>
    </div>
  );
};

export default TopAppBar;
