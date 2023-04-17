import { ContextMenu } from "@lumino/widgets";
import { CommandRegistry } from "@lumino/commands";
import { INodeBase, INode, IPlatNode } from "../../types";
import { createDiv, createI, createSection, createSpan } from "../../utils/tagUtil";

export interface ITreeProps {
  items: Array<Record<string, any>>;
  mode?: "tree" | "plat";
  rootValue?: string;
  contextItems?: Array<Record<string, any>>;
  onItemClick?: (evt: any) => void;
  onItemContextMenu?: (evt: any) => Array<Record<string, any>>;
}

interface ITreeDetailProps extends ITreeProps {
  parents: HTMLElement;
}

interface ITreeNodeRenderProps {
  element: HTMLElement;
  items: INode[];
  node: INode;
  level: number;
  commands: CommandRegistry;
  renderFunc: Function;
  callbackFunc: Function;
  selectFunc: Function;
  onItemClick?: Function;
  onItemContextMenu?: Function;
}

interface ITreeNodeRenderDetailProps extends ITreeNodeRenderProps {
  children?: INodeBase[];
}

export default class Tree {
  parents: HTMLElement;
  items: INodeBase[];
  mode: "tree" | "plat";
  rootValue?: string;
  contextItems?: Array<Record<string, any>>;
  onItemClick?: (evt: any) => void;
  onItemContextMenu?: (evt: any) => Array<Record<string, any>>;

  element: HTMLElement | null = null;

  constructor(params: ITreeDetailProps) {
    this.parents = params.parents;
    this.items = params.items as INodeBase[];
    this.mode = params.mode || "tree";
    this.rootValue = params.rootValue;
    this.contextItems = params.contextItems;
    this.onItemClick = params.onItemClick;
    this.onItemContextMenu = params.onItemContextMenu;
  }

  dispose() {}

  selectNode(id: string, element?: HTMLElement) {
    const el = element ?? document;
    if (!el) return;
    const node = el.querySelector(`.moz-tree-node-item[data-id="${id}"]`);
    const nodes = el.querySelectorAll(".moz-tree-node-item");
    if (!node) return;
    nodes.forEach(n => {
      n.classList.remove("moz-tree-node-item-selected");
    });
    node.classList.add("moz-tree-node-item-selected");
  }

  renderNode(params: ITreeNodeRenderDetailProps) {
    const createMenu = (ms: Array<Record<string, any>>, e: any) => {
      const result = new ContextMenu({ commands: params.commands });

      let sepCnt = 0;
      ms.forEach((m, i) => {
        if (m.beginGroup) {
          result.addItem({
            selector: `.moz-tree-node-item[data-type=${m.type}]`,
            type: "separator",
            rank: i + sepCnt++,
          });
        }
        if (m.items) {
          const submenu = createMenu(m.items, e);
          submenu.menu.title.label = m.label;
          result.addItem({
            selector: `.moz-tree-node-item[data-type=${m.type}]`,
            type: "submenu",
            rank: i + sepCnt,
            submenu: submenu.menu,
          });
        } else {
          const menu = {
            command: m.command,
            selector: `.moz-tree-node-item[data-type=${m.type}]`,
            rank: i + sepCnt,
            args: { event: e, itemData: params.node, ...m.args } as any,
          };
          result.addItem(menu);
          result.menu.addItem(menu);
        }
      });
      return result;
    };

    const createNode = (nodeParams: {
      // btn: HTMLElement;
      // icon: HTMLElement;
      onClick: (evt: any) => void;
    }): HTMLElement => {
      const text = createSpan({ className: "moz-tree-node-item-text" }, params.node.name);
      const node = createDiv(
        {
          className: "moz-tree-node-item",
          "data-id": params.node.id,
          "data-type": params.node.type,
          // style: { paddingLeft: `${10 * params.level}px` },
        },
        // nodeParams.btn,
        // nodeParams.icon,
        text,
      );
      node.addEventListener("click", nodeParams.onClick);
      node.addEventListener("contextmenu", (evt: any) => {
        if (!params.onItemContextMenu) return;

        evt.preventDefault();

        const menus: Array<Record<string, any>> = params.onItemContextMenu({ event: evt, itemData: params.node });

        const contextMenu = createMenu(menus, evt);
        contextMenu.open(evt);
      });
      return node;
    };

    if (params.children && params.children.length > 0) {
      const group = createDiv({ className: "moz-tree-node-parent" });
      // const btn = createI({
      //   className: `moz-tree-node-item-btn ${
      //     params.node.expanded ? "m-130_icon-arrow-down" : "m-131_icon-arrow-right"
      //   }`,
      // });
      // const icon = createI({
      //   className: `moz-tree-node-item-icon ${
      //     params.node.expanded
      //       ? `${params.node.activeIcon || "m-047_icon-folder-open"}${
      //           params.node.activeIconClass ? ` ${params.node.activeIconClass}` : ""
      //         }`
      //       : `${params.node.icon || "m-043_icon-folder"}${params.node.iconClass ? ` ${params.node.iconClass}` : ""}`
      //   }`,
      // });
      const childEl = createDiv({
        className: "moz-tree-node-child",
        style: { display: `${params.node.expanded ? "block" : "none"}` },
      });
      const node = createNode({
        // btn,
        // icon,
        onClick: (evt: any) => {
          if (childEl.style.display === "block") {
            // btn.className = "moz-tree-node-item-btn m-131_icon-arrow-right";
            // icon.className = `moz-tree-node-item-icon ${params.node.icon || "m-043_icon-folder"}${
            //   params.node.iconClass ? ` ${params.node.iconClass}` : ""
            // }`;
            childEl.style.display = "none";
          } else {
            // btn.className = "moz-tree-node-item-btn m-130_icon-arrow-down";
            // icon.className = `moz-tree-node-item-icon ${params.node.activeIcon || "m-047_icon-folder-open"}${
            //   params.node.activeIconClass ? ` ${params.node.activeIconClass}` : ""
            // }`;
            childEl.style.display = "block";
          }
          params.selectFunc(params.node.id, params.element);
          if (!params.onItemClick) return;
          params.onItemClick({ event: evt, itemData: params.node, element: params.element, node });
        },
      });

      params.children.forEach(child => {
        childEl.appendChild(params.callbackFunc({ ...params, ...{ node: child, level: params.level + 1 } }));
      });
      group.appendChild(node);
      group.appendChild(childEl);
      return group;
    } else {
      const btn = createI({ className: "moz-tree-node-item-btn m-163_icon-empty" });
      const icon = createI({
        className: `moz-tree-node-item-icon ${params.node.icon || "m-163_icon-empty"}${
          params.node.iconClass ? ` ${params.node.iconClass}` : ""
        }`,
      });
      const node = createNode({
        // btn,
        // icon,
        onClick: (evt: any) => {
          params.selectFunc(params.node.id, params.element);
          if (!params.onItemClick) return;
          params.onItemClick({ event: evt, itemData: params.node, element: params.element, node });
        },
      });

      return node;
    }
  }

  renderTreeNode(params: ITreeNodeRenderProps) {
    const children = params.node.children;
    return params.renderFunc({ ...params, children });
  }

  renderPlatNode(params: ITreeNodeRenderProps) {
    const children = (params.items as IPlatNode[]).filter(item => item.parentId === params.node.id);
    return params.renderFunc({ ...params, children });
  }

  render() {
    while (this.parents.firstChild) {
      if (!this.parents.lastChild) break;
      this.parents.removeChild(this.parents.lastChild);
    }

    this.element = createSection({ className: "moz-tree-container" });
    const commands = new CommandRegistry();

    if (this.contextItems && this.contextItems.length > 0) {
      this.contextItems.forEach(item => {
        commands.addCommand(item.command, {
          execute: item.execute,
          label: item.label,
          isEnabled: () => true,
        });
      });
    }

    if (this.mode === "tree") {
      this.items.forEach(item => {
        this.element?.appendChild(
          this.renderTreeNode({
            element: this.element,
            items: this.items,
            node: item,
            level: 0,
            commands,
            renderFunc: this.renderNode,
            callbackFunc: this.renderTreeNode,
            selectFunc: this.selectNode,
            onItemClick: this.onItemClick,
          }),
        );
      });
    } else {
      (this.items as IPlatNode[])
        .filter(item => {
          if (this.rootValue) {
            return item.parentId === this.rootValue;
          } else {
            return !item.parentId;
          }
        })
        .forEach(item => {
          this.element?.appendChild(
            this.renderPlatNode({
              element: this.element,
              items: this.items,
              node: item,
              level: 0,
              commands,
              renderFunc: this.renderNode,
              callbackFunc: this.renderPlatNode,
              selectFunc: this.selectNode,
              onItemClick: this.onItemClick,
              onItemContextMenu: this.onItemContextMenu,
            }),
          );
        });
    }

    this.parents.appendChild(this.element);
  }
}
