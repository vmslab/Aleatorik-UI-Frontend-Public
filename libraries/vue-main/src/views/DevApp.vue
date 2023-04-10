<template>
  <template v-if="isLoading || !data">Loading...</template>
  <template v-else-if="isError">Error : {{ (error as any).message }}</template>
  <template v-else>
    <IDE
      :key="i18next.language"
      :commands="commands"
      :menus="menus"
      :initialize-ide="onInitializeIde"
      :register-accordian="onRegisterAccordian"
      :register-dock="onRegisterDock"
    >
      <ModelTree
        data-type="model-management"
        data-position="accordian"
        data-icon="m-060_icon-database"
        :data-add="true"
        :data-active="true"
        :item-selected="onItemSelected"
      />
      <SystemTree
        data-type="system-management"
        data-position="accordian"
        data-icon="m-093_icon-project"
        :data-add="true"
        :item-selected="onItemSelected"
      />
      <SqlEditor data-type="sql-editor" data-position="dock" />
      <DataItem data-type="data-item" data-position="dock" />
      <Setting data-type="setting" data-position="dock" />
      <Service data-type="service" data-position="dock" />
      <SystemSetting data-type="system-setting" data-position="dock" />
    </IDE>
  </template>
</template>

<script setup lang="ts">
import { createApp, computed } from "vue";
import { VueQueryPlugin, useQuery } from "vue-query";
import { useTranslation } from "i18next-vue";
import { IDE } from "@mozart-ui/vue-component";
import { IDEMain, IDEMenu, IDEStatus, IIDEParams, IMenuItem, ICommandOptions } from "@mozart-ui/common-ui";
import { GetDeployInfo } from "@mozart-ui/common-api";
import { ITreeNode } from "@mozart-ui/protos";
import i18n from "../plugin/i18n";
import { useThemeStore } from "../stores/mainStore";
import { useDeployStore } from "../stores/devStore";
import { useSignout } from "../utils/user";
import queryClient from "../utils/query";
import { setAppTheme } from "../utils/theme";
import ModelTree from "../components/DevApp/ModelTree.vue";
import SystemTree from "../components/DevApp/SystemTree.vue";
import SqlEditor from "../components/DevApp/SqlEditorDock.vue";
import DataItem from "../components/DevApp/DataItemDock.vue";
import Setting from "../components/DevApp/SettingDock.vue";
import Service from "../components/DevApp/ServiceDock.vue";
import SystemSetting from "../components/DevApp/SystemSettingDock.vue";

const { t, i18next } = useTranslation();

const deploy = useDeployStore();
const theme = useThemeStore();

let main: IDEMain | null = null;
let menu: IDEMenu | null = null;
let status: IDEStatus | null = null;

const { isLoading, isError, data, error } = useQuery("deploy", GetDeployInfo, {
  onSuccess: (result: any) => {
    if (result && result.data) {
      deploy.setDeployState({
        workingDirectory: result.data.workingDirectory,
        delimiter: result.data.delimeter,
      });
    }
  },
  refetchOnWindowFocus: false,
});

const { signout } = useSignout();

const onClickTheme = (t: "light" | "dark") => {
  theme.setTheme({
    ...theme,
    theme: t,
  });
  setAppTheme();
};

// const commands: Record<string, ICommandOptions> =
const commands = computed(() => {
  const cmds: Record<string, ICommandOptions> = {
    logout: {
      label: t("Logout") as string,
      execute: async () => {
        await signout.value();
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
  Object.keys(i18next.options.resources || {}).forEach(key => {
    cmds[key] = {
      label: key,
      isToggleable: true,
      isToggled: args => {
        return i18next.language.startsWith(key);
      },
      execute: args => {
        i18next.changeLanguage(key);
      },
    };
  });
  return cmds;
});

// const menus: IMenuItem[]
const menus = computed(() => {
  return [
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
          items: Object.keys(i18next.options.resources || {}).map(key => {
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
});

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
  i18n(createApp(child)).use(VueQueryPlugin, { queryClient }).mount(content);
};

const onRegisterDock = (child: any, content: HTMLElement, id: number, data: Record<string, any>) => {
  i18n(createApp(child, data)).use(VueQueryPlugin, { queryClient }).mount(content);
};
</script>
