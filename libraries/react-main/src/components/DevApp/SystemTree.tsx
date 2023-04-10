import * as React from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useQuery, useMutation } from "react-query";
import { GetSystem } from "@mozart-ui/common-api";
import { ITreeNode, ITreeProps, Command, getSystemTreeItems } from "@mozart-ui/protos";
import { selectedState, systemState } from "../../stores/devStore";
import SystemDialog from "./SystemDialog";
import { Remove } from "@mozart-ui/common-api";
import { showConfirm } from "../../utils/dialog";
import queryClient from "../../utils/query";
import { Tree } from "@mozart-ui/react-component";

interface ISystemTreeProp extends ITreeProps {}

const SystemTree: React.FC<ISystemTreeProp> = props => {
  const setSelectedInfo = useSetRecoilState(selectedState);
  const setSystemState = useSetRecoilState(systemState);
  const [items, setItems] = React.useState([] as ITreeNode[]);

  const { isLoading, isError, data, error } = useQuery("system", GetSystem, {
    onSuccess: data => {
      setItems(getSystemTreeItems(data.data));
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
    if (!evt.itemData.parentId) return;
    setSelectedInfo(evt.itemData);

    if (props.itemSelected) {
      props.itemSelected({ item: evt.itemData, mode: "Modify" });
    }
  };

  const contextItems = [
    {
      command: Command.ADD_SYSTEM,
      type: "system-root",
      execute: (args: any) => {
        setSystemState({
          mode: "Add",
          open: true,
          connName: args?.connName,
        });
      },
      label: "Add System",
    },
    {
      command: Command.MODIFY_SYSTEM,
      type: "system",
      execute: (args: any) => {
        setSystemState({
          mode: "Modify",
          open: true,
          connName: args?.connName,
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
    setSelectedInfo(evt.itemData);

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
      const parent = items.find(x => x.id === evt.itemData.parentId);
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
      <SystemDialog />
    </>
  );
};

export default React.memo(SystemTree);
