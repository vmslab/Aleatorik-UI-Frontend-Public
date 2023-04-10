import * as React from "react";
import ReactDOM from "react-dom/client";
import { useRecoilBridgeAcrossReactRoots_UNSTABLE, useSetRecoilState, useRecoilState, useRecoilValue } from "recoil";
import { QueryClientProvider, useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import queryClient from "../utils/query";
import { IDE } from "@mozart-ui/react-component";
import { IDEMain, IDEMenu, IDEStatus, IIDEParams, IMenuItem, ICommandOptions } from "@mozart-ui/common-ui";
import { GetDeployInfo } from "@mozart-ui/common-api";
import { ITreeNode } from "@mozart-ui/protos";
import { themeState, layoutState } from "../stores/mainStore";
import { deployState } from "../stores/devStore";
import { useSignout } from "../utils/user";
import { setAppTheme } from "../utils/theme";
import ModelTree from "../components/DevApp/ModelTree";
import SystemTree from "../components/DevApp/SystemTree";
import SqlEditor from "../components/DevApp/SqlEditorDock";
import DataItem from "../components/DevApp/DataItemDock";
import Setting from "../components/DevApp/SettingDock";
import Service from "../components/DevApp/ServiceDock";
import SystemSetting from "../components/DevApp/SystemSettingDock";

const DevApp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();

  const setDeploy = useSetRecoilState(deployState);
  const [theme, setTheme] = useRecoilState(themeState);
  const layout = useRecoilValue(layoutState);

  let main: IDEMain | null = null;
  let menu: IDEMenu | null = null;
  let status: IDEStatus | null = null;

  const { isLoading, isError, data, error } = useQuery("deploy", GetDeployInfo, {
    onSuccess: result => {
      if (result && result.data) {
        setDeploy({
          workingDirectory: result.data.workingDirectory,
          delimiter: result.data.delimeter,
        });
      }
    },
    refetchOnWindowFocus: false,
  });

  const { signout } = useSignout();

  const onClickTheme = (t: "light" | "dark") => {
    const from = { ...theme, theme: t };
    setTheme(oldVal => from);
    setAppTheme(from, layout);
  };

  const commands: Record<string, ICommandOptions> = {
    logout: {
      label: t("Logout") as string,
      execute: async () => {
        await signout();
      },
    },
    setting: {
      label: "Addvanced Settings Editor",
      execute: () => {
        if (!main) return;
        main.addDock({
          key: "setting",
          type: "setting",
          title: "Setting",
        });
      },
    },
    dark: {
      label: "Dark",
      isToggleable: true,
      isToggled: args => {
        return theme.theme === "dark";
      },
      execute: args => {
        onClickTheme("dark");
      },
    },
    light: {
      label: "Light",
      isToggleable: true,
      isToggled: args => {
        return theme.theme === "light";
      },
      execute: args => {
        onClickTheme("light");
      },
    },
  };

  Object.keys(i18n.options.resources || {}).forEach(key => {
    commands[key] = {
      label: key,
      isToggleable: true,
      isToggled: args => {
        return i18n.language.startsWith(key);
      },
      execute: args => {
        i18n.changeLanguage(key);
      },
    };
  });

  const menus: IMenuItem[] = [
    {
      label: t("User") as string,
      items: [
        {
          command: "logout",
        },
      ],
    },
    {
      label: t("Settings") as string,
      items: [
        {
          label: t("Theme") as string,
          items: [
            {
              command: "dark",
            },
            {
              command: "light",
            },
          ],
        },
        {
          label: t("Language") as string,
          items: Object.keys(i18n.options.resources || {}).map(key => {
            return {
              command: key,
            };
          }),
        },
        {
          beginGroup: true,
          command: "setting",
        },
      ],
    },
  ];

  const onInitializeIde = (params: IIDEParams) => {
    main = params.main;
    menu = params.menu;
    status = params.status;
  };

  const onItemSelected = (params: { item: ITreeNode; mode?: string }) => {
    if (!main) return;
    if (params.item.type === "data-action") {
      if (!params.item.info) return;
      main.addDock({
        key: `sql-editor:${params.item.name}`,
        type: "sql-editor",
        title: params.item.name,
        data: { data: params.item.info, mode: params.mode },
      });
    } else if (params.item.type === "data-item") {
      if (!params.item.info) return;
      main.addDock({
        key: `data-item:${params.item.name}`,
        type: "data-item",
        title: params.item.name,
        data: { data: params.item.info, mode: params.mode },
      });
    } else if (params.item.type === "system-child-service") {
      if (!params.item.info) return;
      main.addDock({
        key: `service:${params.item.parentId}:${params.item.name}`,
        type: "service",
        title: params.item.title || params.item.name,
        data: { system: params.item.info },
      });
    } else if (params.item.type === "system-child-setting") {
      if (!params.item.info) return;
      main.addDock({
        key: `system-setting:${params.item.parentId}:${params.item.name}`,
        type: "system-setting",
        title: params.item.title || params.item.name,
        data: { system: params.item.info },
      });
    }
  };

  const onRegisterAccordian = (child: any, content: HTMLElement, id: number, data: Record<string, any>) => {
    ReactDOM.createRoot(content).render(
      <QueryClientProvider client={queryClient}>
        <RecoilBridge>{child}</RecoilBridge>
      </QueryClientProvider>,
    );
  };

  const onRegisterDock = (child: any, content: HTMLElement, id: number, data: Record<string, any>) => {
    ReactDOM.createRoot(content).render(
      <QueryClientProvider client={queryClient}>
        <RecoilBridge>{React.cloneElement(child, data)}</RecoilBridge>
      </QueryClientProvider>,
    );
  };

  if (isLoading || !data) return <>Loading...</>;

  if (isError) return <>Error: {(error as any).message}</>;

  return (
    <IDE
      commands={commands}
      menus={menus}
      initializeIde={onInitializeIde}
      registerAccordian={onRegisterAccordian}
      registerDock={onRegisterDock}
    >
      <ModelTree
        data-type="model-management"
        data-position="accordian"
        data-icon="m-060_icon-database"
        data-active={true}
        data-add={true}
        itemSelected={onItemSelected}
      />
      <SystemTree
        data-type="system-management"
        data-position="accordian"
        data-icon="m-093_icon-project"
        data-add={true}
        itemSelected={onItemSelected}
      />
      <SqlEditor data-type="sql-editor" data-position="dock" />
      <DataItem data-type="data-item" data-position="dock" />
      <Setting data-type="setting" data-position="dock" />
      <Service data-type="service" data-position="dock" />
      <SystemSetting data-type="system-setting" data-position="dock" />
    </IDE>
  );
};

export default React.memo(DevApp);
