<template>
  <template v-if="isLoading || !data">Loading...</template>
  <template v-else-if="isError">Error : {{ (error as any).message }}</template>
  <template v-else>
    <Tree
      :items="items"
      mode="plat"
      :context-items="contextItems"
      :on-item-click="onItemClick"
      :on-item-context-menu="onItemContextMenu"
    />
    <ConnectionDialog v-if="connectionStore.open" />
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useQuery, useMutation } from "vue-query";
import { ITreeNode, ITreeProps, Command, getModelTreeItems } from "@aleatorik-ui/protos";
import ConnectionDialog from "./ConnectionDialog.vue";
import { useSelectedStore, useConnectionStore } from "../../stores/devStore";
import { GetModel, Remove, Migrate } from "@aleatorik-ui/common-api";
import { showConfirm } from "../../utils/dialog";
import { useAlarmStore, useLoadStore } from "../../stores/mainStore";
import queryClient from "../../utils/query";
import { generateGUID } from "@aleatorik-ui/common-ui";
import { Tree } from "@aleatorik-ui/vue-component";

// interface IModelTreeProps extends ITreeProps { };

const props = defineProps<{
  itemSelected?: (params: { item: ITreeNode; mode?: string }) => void;
}>();

const items = ref([] as ITreeNode[]);
const selectedInfo = useSelectedStore();
const connectionStore = useConnectionStore();
const load = useLoadStore();
const alarm = useAlarmStore();

const { isLoading, isError, data, error } = useQuery("model", GetModel, {
  onSuccess: data => {
    items.value = getModelTreeItems(data.data);
  },
  refetchOnWindowFocus: false,
});

const mutation = useMutation(Remove, {
  onSuccess: result => {
    if (result.data.count > 0) {
      queryClient.invalidateQueries("model");
    }
  },
});

const migrateMutation = useMutation(Migrate, {
  onSuccess: result => {
    load.setLoad({ loading: false });
    alarm.setAlarm({
      message: result.data.count > 0 ? "Database migrated!" : "Database migration failed!",
      type: result.data.count > 0 ? "success" : "error",
    });
  },
  onError: error => {
    load.setLoad({ loading: false });
    alarm.setAlarm({
      message: "Database migration failed!",
      type: "error",
    });
  },
});

const onItemClick = (evt: any) => {
  selectedInfo.setSelectedItems(evt.itemData);

  if (props.itemSelected) {
    props.itemSelected({ item: evt.itemData, mode: "Modify" });
  }
};

const contextItems = [
  {
    command: Command.ADD_CONNECTION,
    type: "connection-group",
    execute: () => {
      connectionStore.setConnectionState({
        mode: "Add",
        open: true,
      });
    },
    label: "Add Connection",
  },
  {
    command: Command.MODIFY_CONNECTION,
    type: "connection",
    execute: () => {
      connectionStore.setConnectionState({
        mode: "Modify",
        open: true,
      });
    },
    label: "Update Connection",
  },
  {
    command: Command.REMOVE_CONNECTION,
    type: "connection",
    execute: async (args: any) => {
      const result = await showConfirm({
        message: `Are you sure you want to remove data source '${args?.itemData.name}'?`,
        type: "warning",
        title: "warning",
      });

      if (!result) return;
      if (!args) return;

      mutation.mutate({ type: "Connection", payload: args?.itemData?.info });
    },
    label: "Remove Connection",
  },
  {
    command: Command.ADD_DATA_ITEM,
    type: "data-item-group",
    execute: () => {
      if (!props.itemSelected) return;
      const id = generateGUID();
      props.itemSelected({
        item: {
          name: "",
          id,
          parentId: "dataItems",
          type: "data-item",
          info: {
            id,
            name: "",
            tableName: "",
            props: [],
          },
        },
        mode: "Add",
      });
    },
    label: "Add DataItem",
  },
  {
    command: Command.MODIFY_DATA_ITEM,
    type: "date-item",
    execute: (args: any) => {
      if (!props.itemSelected) return;
      props.itemSelected({ item: args.itemData as ITreeNode, mode: "Modify" });
    },
    label: "Modify DataItem",
  },
  {
    command: Command.REMOVE_DATA_ITEM,
    type: "date-item",
    execute: async (args: any) => {
      const result = await showConfirm({
        message: `Are you sure you want to remove data item '${args?.itemData?.name}'?`,
        type: "warning",
        title: "warning",
      });

      if (!result) return;
      if (!args?.itemData) return;

      mutation.mutate({ type: "DataItem", payload: args?.itemData?.info });
    },
    label: "Remove DataItem",
  },
  {
    command: Command.CRAETE_OR_REPLACE_TABLES,
    type: "",
    execute: async (args: any) => {
      const conn = items.value.find(item => item.name === args?.label);
      if (!conn || !conn.info) return;

      const result = await showConfirm({
        message: `Are you sure you want to create or replace database '${conn.name}'?`,
        type: "warning",
        title: "warning",
      });

      if (!result) return;
      if (!args) return;

      const dataItems = items.value
        .filter(item => item.parentId === args?.parentId && item.info)
        .map(item => item.info);
      load.setLoad({ loading: true });
      conn.info.schemaGroup = args.parentName;
      migrateMutation.mutate({
        connectionInfo: conn.info,
        entityDefs: dataItems,
        isDown: false,
      });
    },
    label: (args: any) => {
      return args.label;
    },
  },
  {
    command: Command.DROP_TABLES,
    type: "",
    execute: async (args: any) => {
      const conn = items.value.find(item => item.name === args?.label);
      if (!conn || !conn.info) return;

      const result = await showConfirm({
        message: `Are you sure you want to migrate database '${conn.name}'?`,
        type: "warning",
        title: "warning",
      });

      if (!result) return;
      if (!args) return;

      const dataItems = items.value
        .filter(item => item.parentId === args?.parentId && item.info)
        .map(item => item.info);
      load.setLoad({ loading: true });
      conn.info.schemaGroup = undefined;
      migrateMutation.mutate({
        connectionInfo: conn.info,
        entityDefs: dataItems,
        isDown: true,
      });
    },
    label: (args: any) => {
      return args.label;
    },
  },
];

const onItemContextMenu = (evt: any) => {
  selectedInfo.setSelectedItems(evt.itemData);

  if (evt.itemData.type === "connection-group") {
    return [
      {
        command: Command.ADD_CONNECTION,
        type: evt.itemData.type,
      },
    ];
  }

  if (evt.itemData.type === "connection") {
    return [
      {
        command: Command.MODIFY_CONNECTION,
        type: evt.itemData.type,
      },
      {
        command: Command.REMOVE_CONNECTION,
        type: evt.itemData.type,
      },
    ];
  }

  if (evt.itemData.type === "data-item-group") {
    return [
      {
        command: Command.ADD_DATA_ITEM,
        type: evt.itemData.type,
      },
      {
        beginGroup: true,
        label: "Create or Replace Tables",
        type: evt.itemData.type,
        items: items.value
          .filter(item => item.type === "connection")
          .map((item: any) => ({
            type: item.type,
            command: Command.CRAETE_OR_REPLACE_TABLES,
            args: { parentId: evt.itemData.id, parentName: evt.itemData.name, label: item.name },
          })),
      },
      {
        label: "Drop Tables",
        type: evt.itemData.type,
        items: items.value
          .filter(item => item.type === "connection")
          .map((item: any) => ({
            type: item.type,
            command: Command.DROP_TABLES,
            args: { parentId: evt.itemData.id, parentName: evt.itemData.name, label: item.name },
          })),
      },
    ];
  }

  if (evt.itemData.type === "data-item") {
    return [
      {
        command: Command.MODIFY_DATA_ITEM,
        type: evt.itemData.type,
      },
      {
        command: Command.REMOVE_DATA_ITEM,
        type: evt.itemData.type,
      },
    ];
  }

  return [];
};
</script>
