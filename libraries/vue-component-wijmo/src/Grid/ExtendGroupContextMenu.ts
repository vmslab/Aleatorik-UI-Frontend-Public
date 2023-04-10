import { Menu } from "@grapecity/wijmo.input";
import { FlexGrid, AllowSorting, Column } from "@grapecity/wijmo.grid";
import { GroupPanel } from "@grapecity/wijmo.grid.grouppanel";
import {
  SortDescription,
  PropertyGroupDescription,
  CollectionView,
  GroupDescription,
} from "@grapecity/wijmo";
import ExtendGrid from "./ExtendGrid";

export interface IGroupMenuItem {
  header: string;
  cmd?: string;
  items?: Array<IGroupMenuItem>;
  clicked?: (menuItemEventArgs: IGroupMenuItemEventArgs) => void;
  active?: (menuItemEventArgs: IGroupMenuItemEventArgs) => boolean;
}

export interface IGroupMenuItemEventArgs {
  grid: FlexGrid;
  view: CollectionView;
  col: Column;
  groupDesc: GroupDescription | null;
  menu: IGroupMenuItem;
}

export class GroupContextMenuProps {
  useExpandGroup?: boolean;
  useSortColumn?: boolean;
  useFixedColumn?: boolean;
  useGroupColumn?: boolean;
  useAutoSizeColumn?: boolean;

  /**
   * {@link ExtendGrid} Context Menu 설정 (needs IGridOptions.useContextMenu = true)
   *
   * @param {boolean} useExpandGroup Group Expand/Collapse 기능을 사용할지 여부
   * @param {boolean} useSortColumn Sorting 기능을 사용할지 여부
   * @param {boolean} useFixedColumn Column Pin 고정 기능을 사용할지 여부
   * @param {boolean} useGroupColumn Grouping 기능을 사용할지 여부
   * @param {boolean} useAutoSizeColumn Column Auto Width Size 기능을 사용할지 여부
   */
  constructor(option: GroupContextMenuProps) {
    this.useExpandGroup = option.useExpandGroup;
    this.useSortColumn = option.useSortColumn;
    this.useFixedColumn = option.useFixedColumn;
    this.useGroupColumn = option.useGroupColumn;
    this.useAutoSizeColumn = option.useAutoSizeColumn;
  }
}

export default class ExtendGroupContextMenu {
  private extendGrid: ExtendGrid;
  private groupDesc: GroupDescription | null = null;

  private groupPanel: GroupPanel;
  private groupIndex: number = -1;
  public menu: Menu;

  private canExecuteMap: Map<string, Function> = new Map();
  private executeMap: Map<string, Function> = new Map();

  public defaultContextMenuProps: GroupContextMenuProps = {
    useExpandGroup: true,
    useSortColumn: true,
    useFixedColumn: true,
    useGroupColumn: true,
    useAutoSizeColumn: true,
  };

  constructor(
    extendGrid: ExtendGrid,
    groupPanel: GroupPanel,
    contextMenuProps: GroupContextMenuProps = {},
  ) {
    const grid = groupPanel.grid,
      host = groupPanel.hostElement;

    contextMenuProps = { ...this.defaultContextMenuProps, ...contextMenuProps };
    this.menu = this._buildMenu(groupPanel, contextMenuProps);

    this.extendGrid = extendGrid;
    this.groupPanel = groupPanel;
    host.addEventListener(
      "contextmenu",
      e => {
        e.preventDefault();

        const ht = groupPanel.hitTest(e),
          cv = groupPanel.collectionView;

        this.groupDesc = ht;
        this.groupIndex = ht ? cv.groupDescriptions.indexOf(ht) : -1;
        this.menu.show(e);
      },
      true,
    );
  }

  private genarateMenuItems(prop: GroupContextMenuProps) {
    const expandItem = [
      { header: "Expand All", cmd: "EXP" },
      { header: "Collapse All", cmd: "CLP" },
      { header: "-" },
    ];
    const sortItem = prop.useSortColumn
      ? [
          {
            header: "Sort",
            items: [
              { header: "Ascending", cmd: "SRT_ASC" },
              { header: "Descending", cmd: "SRT_DESC" },
              { header: "No Sort", cmd: "SRT_NONE" },
              { header: "-" },
              { header: "Clear All Sorts", cmd: "SRT_CLR" },
            ],
          },
        ]
      : [];
    const pinItem = prop.useFixedColumn
      ? [
          {
            header: "Column Fix",
            items: [
              { header: "Pin", cmd: "PIN" },
              { header: "Unpin", cmd: "UNPIN" },
            ],
          },
        ]
      : [];
    const columnFitItem = prop.useAutoSizeColumn
      ? [
          {
            header: "AutoSize",
            items: [
              { header: "AutoSize", cmd: "ASZ" },
              { header: "AutoSize All", cmd: "ASZ_ALL" },
            ],
          },
        ]
      : [];
    const groupItem = prop.useGroupColumn
      ? [
          {
            header: "Group",
            items: [
              { header: "Show/Hide Group Panel", cmd: "GRP_PNL" },
              { header: "Group/Ungroup", cmd: "GRP" },
              { header: "Clear All Groups", cmd: "GRP_CLR" },
            ],
          },
        ]
      : [];

    return [...expandItem, ...pinItem, ...columnFitItem, ...sortItem, ...groupItem];
  }

  private setCanExecuteMap(prop: GroupContextMenuProps) {
    this.canExecuteMap.clear();

    if (prop.useExpandGroup) {
      this.canExecuteMap
        .set("EXP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1;
        })
        .set("CLP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1;
        });
    }
    if (prop.useFixedColumn) {
      this.canExecuteMap
        .set("PIN", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const fCols = grid.frozenColumns;
          return this.groupIndex > -1 && col.index >= fCols;
        })
        .set("UNPIN", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const fCols = grid.frozenColumns;
          return this.groupIndex > -1 && col.index < fCols;
        });
    }
    if (prop.useAutoSizeColumn) {
      this.canExecuteMap
        .set("ASZ", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1;
        })
        .set("ASZ_ALL", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1;
        });
    }
    if (prop.useSortColumn) {
      this.canExecuteMap
        .set("SRT_ASC", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1 && col.currentSort != "+";
        })
        .set("SRT_DESC", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1 && col.currentSort != "-";
        })
        .set("SRT_NONE", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1 && col.currentSort != null;
        })
        .set("SRT_CLR", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return view.sortDescriptions.length > 0;
        });
    }
    if (prop.useGroupColumn) {
      this.canExecuteMap
        .set("GRP_PNL", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return true;
        })
        .set("GRP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return this.groupIndex > -1 && true;
        })
        .set("GRP_CLR", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          return view.groupDescriptions.length > 0;
        });
    }
  }

  private setExecuteMap(prop: GroupContextMenuProps) {
    this.executeMap.clear();

    if (prop.useExpandGroup) {
      this.executeMap
        .set("EXP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {})
        .set("CLP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {});
    }
    if (prop.useSortColumn) {
      this.executeMap
        .set("SRT_ASC", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const sd = view.sortDescriptions;
          if (grid.allowSorting != AllowSorting.MultiColumn) {
            sd.clear();
          } else {
            for (let i = 0; i < sd.length; i++) {
              if (sd[i].property == col.binding) {
                sd.removeAt(i);
                break;
              }
            }
          }
          if (col.binding) {
            sd.push(new SortDescription(col.binding, true));
          }
        })
        .set("SRT_DESC", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const sd = view.sortDescriptions;
          if (grid.allowSorting != AllowSorting.MultiColumn) {
            sd.clear();
          } else {
            for (let i = 0; i < sd.length; i++) {
              if (sd[i].property == col.binding) {
                sd.removeAt(i);
                break;
              }
            }
          }
          if (col.binding) {
            sd.push(new SortDescription(col.binding, false));
          }
        })
        .set("SRT_NONE", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const sd = view.sortDescriptions;
          if (grid.allowSorting != AllowSorting.MultiColumn) {
            sd.clear();
          } else {
            for (let i = 0; i < sd.length; i++) {
              if (sd[i].property == col.binding) {
                sd.removeAt(i);
                break;
              }
            }
          }
        })
        .set("SRT_CLR", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          view.sortDescriptions.clear();
        });
    }
    if (prop.useGroupColumn) {
      this.executeMap
        .set("GRP_PNL", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          if (!this.groupPanel) return;

          if (this.groupPanel.hostElement.style.display === "none") {
            this.groupPanel.hostElement.style.display = "";
            grid.hostElement.style.height = `calc(${this.extendGrid.gridContainerHeight} - var(--size-grid-toolbar-height))`;
          } else {
            this.groupPanel.hostElement.style.display = "none";
            grid.hostElement.style.height = this.extendGrid.gridContainerHeight;
          }
        })
        .set("GRP", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          const gd = view.groupDescriptions;
          // remove group
          for (let i = 0; i < gd.length; i++) {
            if ((gd[i] as any).propertyName == col.binding) {
              gd.removeAt(i);
              return; // we're done
            }
          }
          // add group
          if (col.binding) gd.push(new PropertyGroupDescription(col.binding));
        })
        .set("GRP_CLR", ({ grid, view, col }: IGroupMenuItemEventArgs) => {
          view.groupDescriptions.clear();
        });
    }
  }

  private _buildMenu(groupPanel: GroupPanel, prop: GroupContextMenuProps) {
    const itemSource = this.genarateMenuItems(prop);

    this.setCanExecuteMap(prop);
    this.setExecuteMap(prop);

    const menu = new Menu(document.createElement("div"), {
      owner: groupPanel.hostElement,
      displayMemberPath: "header",
      subItemsPath: "items",
      commandParameterPath: "cmd",
      dropDownCssClass: "ctx-menu",
      openOnHover: true,
      closeOnLeave: true,
      itemsSource: itemSource,
      command: {
        // enable/disable menu commands
        canExecuteCommand: (cmd: string) => {
          const grid = groupPanel.grid,
            view = grid.collectionView,
            binding = (view.groupDescriptions[this.groupIndex] as any)?.propertyName,
            col = grid.getColumn(binding);
          if (this.canExecuteMap.has(cmd)) {
            const func = this.canExecuteMap.get(cmd);
            const menuItem: IGroupMenuItem = this.getFlatMenuItem().find(
              (item: any) => item.cmd === cmd,
            );
            if (func) return func({ grid, view, col, groupDesc: this.groupDesc, menu: menuItem });
          }
          return true;
        },
        // execute menu commands
        executeCommand: (cmd: string) => {
          const grid = groupPanel.grid,
            view = grid.collectionView,
            binding = (view.groupDescriptions[this.groupIndex] as any)?.propertyName,
            col = grid.getColumn(binding);
          if (this.executeMap.has(cmd)) {
            const func = this.executeMap.get(cmd);
            func && func(grid, view, col);
          }

          // restore focus to active grid cell
          grid.refresh();
          const sel = grid.selection,
            cell = grid.cells.getCellElement(sel.row, sel.col);
          if (cell) {
            cell.focus();
          }
        },
      },
    });
    // done
    return menu;
  }

  /**
   * Context Menu에 항목을 추가
   * @param item 추가할 항목 정의 @see ExtendGridContextMenu#IGroupMenuItem
   * @param active 항목의 활성 여부에 대한 Function
   * @param clicked 항목 선택 시, 실행할 Function
   * @returns @see IGroupMenuItem
   */
  public addMenuItem(item: IGroupMenuItem): IGroupMenuItem {
    this.menu.itemsSource.push(item);

    if (item.cmd) {
      item.clicked && this.executeMap.set(item.cmd, item.clicked);
      item.active && this.canExecuteMap.set(item.cmd, item.active);
    }

    return item;
  }

  /**
   * Context Menu에 항목을 추가
   * @param index 항목을 추가할 위치
   * @param item 추가할 항목 정의 @see ExtendGridContextMenu#IGroupMenuItem
   * @param active 항목의 활성 여부에 대한 Function
   * @param clicked 항목 선택 시, 실행할 Function
   * @returns @see IGroupMenuItem
   */
  public insertMenuItem(index: number, item: IGroupMenuItem): IGroupMenuItem {
    this.menu.itemsSource.splice(index, 0, item);

    if (item.cmd) {
      item.clicked && this.executeMap.set(item.cmd, item.clicked);
      item.active && this.canExecuteMap.set(item.cmd, item.active);
    }

    return item;
  }

  /**
   * Context Menu 항목을 삭제
   * @param index 삭제할 항목의 index
   * @returns @see ExtendGridContextMenu#IGroupMenuItem
   */
  public removeMenuItem(index: number): IGroupMenuItem | undefined {
    const item = this.menu.itemsSource[index].splice(index, 1)[0];
    if (item) {
      if (item.cmd) {
        this.canExecuteMap.delete(item.cmd);
        this.executeMap.delete(item.cmd);
      }

      return item;
    }
  }

  /**
   * Context Menu Item 호출
   * @param index
   * @returns @see ExtendGridContextMenu#IGroupMenuItem
   */
  public getMenuItem(index: number): IGroupMenuItem | undefined {
    if (this.menu.itemsSource[index].length > 0) return this.menu.itemsSource[index][0];
  }

  /**
   * Context Menu Item을 Flat List로 반환
   * @param index
   * @returns @see ExtendGridContextMenu#IGroupMenuItem
   */
  public getFlatMenuItem(): any[] {
    let flatMenus: any[] = [];
    this.menu.itemsSource?.forEach((menu: any) => {
      flatMenus.push(menu);
      if (menu.items && menu.items.length > 0) {
        flatMenus.push(...this.getFlatChildItem(menu.items));
      }
    });

    return flatMenus;
  }

  private getFlatChildItem(menus: any[]): any[] {
    let flatMenus: any[] = [];
    menus.forEach((menu: any) => {
      flatMenus.push(menu);
      if (menu.items && menu.items.length > 0) {
        flatMenus.push(...this.getFlatChildItem(menu.items));
      }
    });

    return flatMenus;
  }
}
