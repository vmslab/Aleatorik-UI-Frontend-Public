import * as React from "react";
import { useSetRecoilState } from "recoil";
import { useQuery, useMutation } from "react-query";
import { ITreeNode, ITreeProps, Command, getModelTreeItems } from "@mozart-ui/protos";
import { selectedState, connectionState } from "../../stores/devStore";
import ConnectionDialog from "./ConnectionDialog";
import { GetModel, Remove, Migrate } from "@mozart-ui/common-api";
import { showConfirm } from "../../utils/dialog";
import { alarmState, loadState } from "../../stores/mainStore";
import queryClient from "../../utils/query";
import { generateGUID } from "@mozart-ui/common-ui";
import { Tree } from "@mozart-ui/react-component";

interface IModelTreeProp extends ITreeProps {}

const ModelTree: React.FC<IModelTreeProp> = props => {
  const setSelectedInfo = useSetRecoilState(selectedState);
  const setConnectionState = useSetRecoilState(connectionState);
  const setLoad = useSetRecoilState(loadState);
  const setAlarm = useSetRecoilState(alarmState);
  const [items, setItems] = React.useState([] as ITreeNode[]);

  const { isLoading, isError, data, error } = useQuery("model", GetModel, {
    onSuccess: data => {
      setItems(getModelTreeItems(data.data));
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
      setLoad({ loading: false });
      setAlarm(() => ({
        message: result.data.count > 0 ? "Database migrated!" : "Database migration failed!",
        type: result.data.count > 0 ? "success" : "error",
      }));
      if (result.data.count > 0) {
        queryClient.invalidateQueries("system");
      }
    },
    onError: error => {
      setLoad({ loading: false });
      setAlarm(() => ({
        message: "Database migration failed!",
        type: "error",
      }));
    },
  });

  const onItemClick = (evt: any) => {
    if (!evt.itemData.parentId) return;
    setSelectedInfo(evt.itemData);

    if (props.itemSelected) {
      props.itemSelected({ item: evt.itemData, mode: "Modify" });
    }
  };

  const contextItems = [
    {
      command: Command.ADD_CONNECTION,
      type: "connection-group",
      execute: () => {
        setConnectionState({
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
        setConnectionState({
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
        const conn = items.find(item => item.name === args?.label);
        if (!conn || !conn.info) return;

        const result = await showConfirm({
          message: `Are you sure you want to create or replace database '${conn.name}'?`,
          type: "warning",
          title: "warning",
        });

        if (!result) return;
        if (!args) return;

        const dataItems = items
          .filter(item => item.parentId === args?.parentId && item.info)
          .map(item => item.info);
        setLoad({ loading: true });
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
        const conn = items.find(item => item.name === args?.label);
        if (!conn || !conn.info) return;

        const result = await showConfirm({
          message: `Are you sure you want to migrate database '${conn.name}'?`,
          type: "warning",
          title: "warning",
        });

        if (!result) return;
        if (!args) return;

        const dataItems = items
          .filter(item => item.parentId === args?.parentId && item.info)
          .map(item => item.info);
        setLoad({ loading: true });
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
    setSelectedInfo(evt.itemData);

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
          items: items
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
          items: items
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

  if (isLoading || !data) return <>Loading...</>;

  if (isError) return <>Error: {(error as any).message}</>;

  return (
    <>
      <Tree
        items={items}
        mode="plat"
        contextItems={contextItems}
        onItemClick={onItemClick}
        onItemContextMenu={onItemContextMenu}
      />
      <ConnectionDialog />
    </>
  );
};

export default React.memo(ModelTree);
