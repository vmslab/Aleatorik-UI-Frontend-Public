export type TreeType =
  | "connection-root"
  | "connection-group"
  | "connection"
  | "data-item-root"
  | "data-item-group"
  | "data-item"
  | "data-action-root"
  | "data-action"
  | "system-root"
  | "system"
  | "system-child-service"
  | "system-child-module"
  | "system-child-setting"
  | "system-child-menu"
  | "system-child-view";

export interface ITreeNode {
  id: string;
  parentId: string;
  type: TreeType;
  name: string;
  title?: string;
  icon?: string;
  iconClass?: string;
  activeIcon?: string;
  activeIconClass?: string;
  expanded?: boolean;
  info?: Record<string, any>;
}

export interface ITreeProps {
  itemSelected?: (params: { item: ITreeNode; mode?: "Add" | "Modify" }) => void;
}
