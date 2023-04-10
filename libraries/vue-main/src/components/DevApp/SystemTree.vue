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
    <SystemDialog v-if="systemStore.open" />
  </template>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useQuery, useMutation } from "vue-query";
import { ITreeNode, ITreeProps, Command, getSystemTreeItems } from "@mozart-ui/protos";
import SystemDialog from "./SystemDialog.vue";
import { useSelectedStore, useSystemStore } from "../../stores/devStore";
import { GetSystem, Remove } from "@mozart-ui/common-api";
import { showConfirm } from "../../utils/dialog";
import queryClient from "../../utils/query";
import { Tree } from "@mozart-ui/vue-component";

// interface ISystemTreeProps extends ITreeProps {}

const props = defineProps<{
  itemSelected?: (params: { item: ITreeNode; mode?: string }) => void;
}>();

const items = ref([] as ITreeNode[]);
const selectedInfo = useSelectedStore();
const systemStore = useSystemStore();

const { isLoading, isError, data, error } = useQuery("system", GetSystem, {
  onSuccess: data => {
    items.value = getSystemTreeItems(data.data);
  },
  refetchOnWindowFocus: false,
});

const mutation = useMutation(Remove, {
  onSuccess: result => {
    if (result.data.count > 0) {
      queryClient.invalidateQueries("system");
    }
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
    command: Command.ADD_SYSTEM,
    type: "system-root",
    execute: (args: any) => {
      systemStore.setSystemState({
        mode: "Add",
        open: true,
        connName: args.connName,
      });
    },
    label: "Add System",
  },
  {
    command: Command.MODIFY_SYSTEM,
    type: "system",
    execute: (args: any) => {
      systemStore.setSystemState({
        mode: "Modify",
        open: true,
        connName: args.connName,
      });
    },
    label: "Update System",
  },
  {
    command: Command.REMOVE_SYSTEM,
    type: "system",
    execute: async (args: any) => {
      const result = await showConfirm({
        message: `Are you sure you want to remove system '${args?.itemData.name}'?`,
        type: "warning",
        title: "warning",
      });

      if (!result) return;
      if (!args) return;

      mutation.mutate({
        type: "",
        payload: {
          connName: args?.connName,
          tableName: "T_SA_SYSTEM",
          obj: args?.itemData?.info,
          wheres: ["SYSTEM_ID", "=", args?.itemData?.info?.SYSTEM_ID],
        },
      });
    },
    label: "Remove System",
  },
];

const onItemContextMenu = (evt: any) => {
  selectedInfo.setSelectedItems(evt.itemData);

  if (evt.itemData.type === "system-root") {
    return [
      {
        command: Command.ADD_SYSTEM,
        type: evt.itemData.type,
        args: { connName: evt.itemData.name },
      },
    ];
  }

  if (evt.itemData.type === "system") {
    const parent = items.value.find(x => x.id === evt.itemData.parentId);
    return [
      {
        command: Command.MODIFY_SYSTEM,
        type: evt.itemData.type,
        args: { connName: parent?.name },
      },
      {
        command: Command.REMOVE_SYSTEM,
        type: evt.itemData.type,
        args: { connName: parent?.name },
      },
    ];
  }

  return [];
};
</script>
