import { ITreeNode } from "../types";
import { SystemResponse } from "../generated/Protos/UIService";

export const getSystemTreeItems = (info: SystemResponse) => {
  const items: ITreeNode[] = [];
  let systemCnt: number = 0;
  let childCnt: number = 0;

  info.contents.forEach(item => {
    items.push({
      id: item.id,
      parentId: "",
      type: "system-root",
      name: item.name,
      expanded: true,
    });
    item.items.forEach((system: any) => {
      const systemId = `system-${systemCnt++}`;
      items.push({
        id: systemId,
        parentId: item.id,
        type: "system",
        name: system.NAME,
        info: system,
      });
      items.push({
        id: `system-child-${childCnt++}`,
        parentId: systemId,
        type: "system-child-service",
        name: "Service",
        title: `${system.NAME}:Service`,
        icon: "m-183_icon-service",
        info: system,
      });
      items.push({
        id: `system-child-${childCnt++}`,
        parentId: systemId,
        type: "system-child-module",
        name: "Module",
        title: `${system.NAME}:Module`,
        icon: "m-182_icon-module",
        info: system,
      });
      items.push({
        id: `system-child-${childCnt++}`,
        parentId: systemId,
        type: "system-child-view",
        name: "View",
        title: `${system.NAME}:View`,
        icon: "m-185_icon-view",
        info: system,
      });
      items.push({
        id: `system-child-${childCnt++}`,
        parentId: systemId,
        type: "system-child-menu",
        name: "Menu",
        title: `${system.NAME}:Menu`,
        icon: "m-016_menu",
        info: system,
      });
      items.push({
        id: `system-child-${childCnt++}`,
        parentId: systemId,
        type: "system-child-setting",
        name: "Setting",
        icon: "m-134_icon-setting",
        title: `${system.NAME}:Setting`,
        info: system,
      });
    });
  });

  return items;
};
