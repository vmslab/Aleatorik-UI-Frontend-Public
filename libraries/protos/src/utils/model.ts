import { ITreeNode } from "../types";
import { ModelInfo } from "../generated/Protos/ModelService";
import { getIconFromProvider } from "../data/database";

export const getModelTreeItems = (info: ModelInfo) => {
  const items: ITreeNode[] = [];
  let grpCnt: number = 0;
  items.push({
    id: "connections",
    parentId: "",
    type: "connection-root",
    name: "ConnectionInfos",
    icon: "m-186_icon-connection-folder",
    activeIcon: "m-187_icon-connection-folder-open",
    expanded: true,
  });
  const connectionDic: Record<string, string> = {};
  connectionDic.Default = `group-${grpCnt++}`;
  info.connectionInfos
    .filter(c => c.group)
    .forEach(c => {
      if (!c.group) return;
      if (connectionDic[c.group as any]) return;
      connectionDic[c.group as any] = `group-${grpCnt++}`;
    });
  Object.keys(connectionDic).forEach(g => {
    items.push({
      id: connectionDic[g],
      parentId: "connections",
      type: "connection-group",
      name: g as string,
      expanded: false,
    });
  });
  info.connectionInfos.forEach(c => {
    items.push({
      id: c.id,
      parentId: c.group ? connectionDic[c.group as any] : connectionDic.Default,
      type: "connection",
      name: c.name,
      icon: getIconFromProvider(c.dbType),
      iconClass: "moz-db-icon",
      info: c,
    });
    // c.tables.forEach(t => {
    //   items.push({
    //     id: t.name,
    //     parentId: c.id,
    //     name: t.name,
    //     info: t,
    //   });
    // });
  });
  items.push({
    id: "dataItems",
    parentId: "",
    type: "data-item-root",
    name: "DataItems",
    expanded: true,
  });
  const dataItemDic: Record<string, string> = {};
  dataItemDic.Default = `group-${grpCnt++}`;
  info.entityDefs
    .filter(c => c.group)
    .forEach(c => {
      if (!c.group) return;
      if (dataItemDic[c.group as any]) return;
      dataItemDic[c.group as any] = `group-${grpCnt++}`;
    });
  Object.keys(dataItemDic).forEach(g => {
    items.push({
      id: dataItemDic[g],
      parentId: "dataItems",
      type: "data-item-group",
      name: g as string,
      expanded: false,
    });
  });
  info.entityDefs.forEach(e => {
    items.push({
      id: e.id,
      parentId: e.group ? dataItemDic[e.group as any] : dataItemDic.Default,
      type: "data-item",
      name: e.name,
      icon: "m-061_icon-data-table",
      info: e,
    });
  });
  items.push({
    id: "dataActions",
    parentId: "",
    type: "data-action-root",
    name: "DataActions",
    expanded: true,
  });
  info.sqlDefs.forEach(s => {
    items.push({
      id: s.id,
      parentId: "dataActions",
      type: "data-action",
      name: s.name,
      icon: "m-184_icon-sql",
      info: s,
    });
  });

  return items;
};
