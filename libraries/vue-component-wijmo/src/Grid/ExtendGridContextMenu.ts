import { Menu } from "@grapecity/wijmo.input";
import {
  FlexGrid,
  CellRange,
  GroupRow,
  AllowSorting,
  HitTestInfo,
  Column,
} from "@grapecity/wijmo.grid";
import {
  SortDescription,
  CollectionViewGroup,
  PropertyGroupDescription,
  CollectionView,
} from "@grapecity/wijmo";
import { FlexGridXlsxConverter, IFlexGridXlsxOptions } from "@grapecity/wijmo.grid.xlsx";
import ExtendGrid, { ILayoutStorage } from "./ExtendGrid";

import dayjs from "dayjs";

export interface IMenuItemEventArgs {
  grid: FlexGrid;
  view: CollectionView;
  col: Column;
  hitTest: HitTestInfo | null;
  menu: IMenuItem;
}

export interface IMenuItem {
  header: string;
  cmd?: string;
  items?: Array<IMenuItem>;
  clicked?: (menuItemEventArgs: IMenuItemEventArgs) => void;
  active?: (menuItemEventArgs: IMenuItemEventArgs) => boolean;
}

export class ContextMenuProps {
  useSortColumn?: boolean;
  useFixedColumn?: boolean;
  useGroupColumn?: boolean;
  useAutoSizeColumn?: boolean;
  useLayout?: ILayoutStorage;
  useExportExcel?: boolean | IFlexGridXlsxOptions;
  onImportExcel?: Function;
  onExportOriginalData?: Function;
  onAddRow?: Function;
  onRemoveRow?: Function;

  /**
   * {@link ExtendGrid} Context Menu 설정 (needs IGridOptions.useContextMenu = true)
   *
   * @param {boolean} useSortColumn Sorting 기능을 사용할지 여부
   * @param {boolean} useFixedColumn Column Pin 고정 기능을 사용할지 여부
   * @param {boolean} useGroupColumn Grouping 기능을 사용할지 여부
   * @param {boolean} useAutoSizeColumn Column Auto Width Size 기능을 사용할지 여부
   *
   * @param {ILayoutStorage} useLayout Layout 기능을 사용할지 여부
   * @param {boolean | IFlexGridXlsxOptions} useExportExcel Excel Export 기능을 사용할지 여부
   *
   * @param {Function} onImportExcel Excel Import 메뉴 선택 시, 호출되는 Function 정의
   * @param {Function} onExportOriginalData Original Data Export 메뉴 선택 시, 호출되는 Function 정의
   *
   * @param {Function} onAddRow Add Row 메뉴 선택 시, 호출되는 Function 정의
   * @param {Function} onRemoveRow Remove Row 메뉴 선택 시, 호출되는 Function 정의
   */
  constructor(option: ContextMenuProps) {
    this.useSortColumn = option.useSortColumn;
    this.useFixedColumn = option.useFixedColumn;
    this.useGroupColumn = option.useGroupColumn;
    this.useAutoSizeColumn = option.useAutoSizeColumn;

    this.useLayout = option.useLayout;
    this.useExportExcel = option.useExportExcel;

    this.onImportExcel = option.onImportExcel;
    this.onExportOriginalData = option.onExportOriginalData;

    this.onAddRow = option.onAddRow;
    this.onRemoveRow = option.onRemoveRow;
  }
}

export default class ExtendGridContextMenu {
  private extendGrid: ExtendGrid;
  private hitTest: HitTestInfo | null = null;
  public menu: Menu;

  private canExecuteMap: Map<string, Function> = new Map();
  private executeMap: Map<string, Function> = new Map();

  public defaultContextMenuProps: ContextMenuProps = {
    useSortColumn: true,
    useFixedColumn: true,
    useGroupColumn: true,
    useAutoSizeColumn: false,
    useExportExcel: false,
  };

  constructor(extendGrid: ExtendGrid, contextMenuProps: ContextMenuProps = {}) {
    const grid = extendGrid.flexGrid,
      host = grid.hostElement;

    contextMenuProps = { ...this.defaultContextMenuProps, ...contextMenuProps };
    this.menu = this._buildMenu(grid, contextMenuProps);

    this.extendGrid = extendGrid;
    host.addEventListener(
      "contextmenu",
      e => {
        e.preventDefault(); // cancel the browser's default menu

        // select the cell/column that was clicked
        const sel = grid.selection,
          ht = grid.hitTest(e),
          row = ht.getRow(),
          isSingleCell = grid.selection.isSingleCell;

        switch (ht.panel) {
          case grid.cells:
            let colIndex = ht.col;
            // if this is a group header, select the group column
            if (row instanceof GroupRow && row.dataItem instanceof CollectionViewGroup) {
              const gd = row.dataItem.groupDescription;
              if (gd instanceof PropertyGroupDescription) {
                const col = grid.getColumn(gd.propertyName);
                if (col && col.index > -1) {
                  colIndex = col.index;
                }
              }
            }
            isSingleCell && grid.select(ht.row, colIndex);
            break;
          case grid.columnHeaders:
            isSingleCell && grid.select(sel.row, ht.col);
            break;
          case grid.rowHeaders:
            isSingleCell && grid.select(ht.row, sel.col);
            break;
          default:
            return; // invalid panel
        }
        // show the menu for the current column
        if (grid.selection.col > -1) {
          this.hitTest = ht;
          this.menu.show(e); // and show ours
        }
      },
      true,
    );
  }

  private genarateMenuItems(prop: ContextMenuProps) {
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
    const layoutItem =
      prop.useLayout?.mode !== "none"
        ? [
            {
              header: "Layout",
              items: [
                { header: "Save", cmd: "L_SAVE" },
                { header: "Load", cmd: "L_LOAD" },
                { header: "Remove", cmd: "L_RMV" },
              ],
            },
          ]
        : [];
    const excelItem =
      prop.useExportExcel || prop.onImportExcel || prop.onExportOriginalData
        ? [
            {
              header: "Excel",
              items: [
                { header: "Import", cmd: "EXC_IMP" },
                { header: "Export (Actual)", cmd: "EXC_EXPA" },
                { header: "Export", cmd: "EXC_EXP" },
              ],
            },
          ]
        : [];
    const addRowItem = prop.onAddRow ? [{ header: "-" }, { header: "Add Row", cmd: "ADD" }] : [];
    const removeRowItem = prop.onRemoveRow ? [{ header: "Remove Row", cmd: "RMV" }] : [];
    return [
      ...sortItem,
      ...pinItem,
      ...columnFitItem,
      ...groupItem,
      ...layoutItem,
      ...excelItem,
      ...addRowItem,
      ...removeRowItem,
    ];
  }

  private setCanExecuteMap(prop: ContextMenuProps) {
    this.canExecuteMap.clear();

    if (prop.useSortColumn) {
      this.canExecuteMap
        .set("SRT_ASC", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          return col.currentSort != "+";
        })
        .set("SRT_DESC", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          return col.currentSort != "-";
        })
        .set("SRT_NONE", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          return col.currentSort != null;
        })
        .set("SRT_CLR", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          return view.sortDescriptions.length > 0;
        });
    }
    if (prop.useFixedColumn) {
      this.canExecuteMap
        .set("PIN", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          const fCols = grid.frozenColumns;
          return col.index >= fCols;
        })
        .set("UNPIN", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          const fCols = grid.frozenColumns;
          return col.index < fCols;
        });
    }
    if (prop.useGroupColumn) {
      this.canExecuteMap.set(
        "GRP_CLR",
        ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          return view.groupDescriptions.length > 0;
        },
      );
    }

    if (prop.useExportExcel) {
      this.canExecuteMap.set("EXC_IMP", () => {
        return !!prop.onImportExcel;
      });
      this.canExecuteMap.set("EXC_EXPA", () => {
        return !!prop.onExportOriginalData;
      });
    }
  }

  private setExecuteMap(prop: ContextMenuProps) {
    this.executeMap.clear();

    if (prop.useSortColumn) {
      this.executeMap
        .set("SRT_ASC", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
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
        .set("SRT_DESC", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
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
        .set("SRT_NONE", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
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
        .set("SRT_CLR", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          view.sortDescriptions.clear();
        });
    }
    if (prop.useFixedColumn) {
      this.executeMap
        .set("PIN", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          const cols = grid.columns;
          const fCols = grid.frozenColumns;
          if (col.index >= fCols && col.binding) {
            this.extendGrid._pinHist.set(col.binding, col.index);
            cols.moveElement(col.index, fCols, false);
            grid.select(new CellRange(0, fCols, grid.rows.length, col.index));
            cols.frozen++;
          }
        })
        .set("UNPIN", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          const cols = grid.columns;
          const fCols = grid.frozenColumns;
          if (col.index < fCols && col.binding) {
            const origIndex = this.extendGrid._pinHist.get(col.binding);
            this.extendGrid._pinHist.delete(col.binding);
            cols.moveElement(col.index, origIndex || fCols - 1, false);
            grid.select(new CellRange(0, col.index, grid.rows.length, col.index));
            cols.frozen--;
          }
        });
    }
    if (prop.useAutoSizeColumn) {
      this.executeMap
        .set("ASZ", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          grid.autoSizeColumn(col.index);
        })
        .set("ASZ_ALL", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          grid.autoSizeColumns(0, grid.columns.length - 1);
        });
    }
    if (prop.useGroupColumn) {
      this.executeMap
        .set("GRP_PNL", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          if (!this.extendGrid.groupPanel) return;

          if (this.extendGrid.groupPanel.hostElement.style.display === "none") {
            this.extendGrid.groupPanel.hostElement.style.display = "";
            grid.hostElement.style.height = `calc(${this.extendGrid.gridContainerHeight} - var(--size-grid-toolbar-height))`;
          } else {
            this.extendGrid.groupPanel.hostElement.style.display = "none";
            grid.hostElement.style.height = this.extendGrid.gridContainerHeight;
          }
        })
        .set("GRP", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
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
        .set("GRP_CLR", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          view.groupDescriptions.clear();
        });
    }
    if (prop.onAddRow) {
      this.executeMap.set("ADD", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
        if (prop.onAddRow) prop.onAddRow();
      });
    }
    if (prop.onRemoveRow) {
      this.executeMap.set("RMV", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
        if (prop.onRemoveRow) prop.onRemoveRow();
      });
    }
    if (prop.useLayout && prop.useLayout?.mode !== "none") {
      this.executeMap
        .set("L_SAVE", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          if (prop.useLayout) this.extendGrid.saveLayout(prop.useLayout);
          // var state = {
          //   columns: grid.columnLayout,
          //   filterDefinition: this.extendGrid.filter?.filterDefinition,
          //   sortDescriptions: grid.collectionView.sortDescriptions.map((sortDesc: any) => {
          //     return { property: sortDesc.property, ascending: sortDesc.ascending };
          //   }),
          // };

          // if (prop.useLayout?.mode === "localStorage") {
          //   localStorage.setItem(`wijmoLayout_${prop.useLayout.key}`, JSON.stringify(state));
          // } else if (prop.useLayout?.mode === "uiframework") {
          //   this.saveLayout(JSON.stringify(state), prop.useLayout.key);
          // }
        })
        .set("L_LOAD", async ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          if (prop.useLayout) {
            const layout = await this.extendGrid.loadLayout(prop.useLayout);
            this.extendGrid.applyLayout(layout);
          }
          // let layoutData: any = {};
          // if (prop.useLayout?.mode === "localStorage") {
          //   layoutData = localStorage.getItem(`wijmoLayout_${prop.useLayout.key}`);
          // } else if (prop.useLayout?.mode === "uiframework") {
          //   layoutData = this.loadLayout(prop.useLayout.key);
          // }

          // if (layoutData) {
          //   const layout = JSON.parse(layoutData);
          //   this.extendGrid.applyLayout(layout);
          //   // if (view) {
          //   //   view.deferUpdate(() => {
          //   //     grid.columnLayout = layout.columns;
          //   //     if (this.extendGrid.filter) {
          //   //       this.extendGrid.filter.filterDefinition = layout.filterDefinition;
          //   //     }
          //   //     view.sortDescriptions.clear();
          //   //     for (var i = 0; i < layout.sortDescriptions.length; i++) {
          //   //       var sortDesc = layout.sortDescriptions[i];
          //   //       view.sortDescriptions.push(
          //   //         new SortDescription(sortDesc.property, sortDesc.ascending),
          //   //       );
          //   //     }
          //   //   });
          //   // }
          // }
        })
        .set("L_RMV", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
          if (prop.useLayout) this.extendGrid.removeLayout(prop.useLayout);
          // if (prop.useLayout?.mode === "localStorage") {
          //   localStorage.removeItem(`wijmoLayout_${prop.useLayout.key}`);
          // } else if (prop.useLayout?.mode === "uiframework") {
          //   this.removeLayout(prop.useLayout.key);
          // }
        });
    }
    if (prop.onImportExcel) {
      this.executeMap.set("EXC_IMP", prop.onImportExcel);
    }
    if (prop.onExportOriginalData) {
      this.executeMap.set("EXC_EXPA", prop.onExportOriginalData);
    }
    if (prop.useExportExcel) {
      let exportOption =
        prop.useExportExcel === true
          ? {
              includeColumnHeaders: true,
              includeStyles: false,
            }
          : prop.useExportExcel;
      this.executeMap.set("EXC_EXP", ({ grid, view, col, hitTest, menu }: IMenuItemEventArgs) => {
        FlexGridXlsxConverter.saveAsync(
          grid,
          exportOption,
          `DataGrid_${dayjs().format("YYYYMMDDHHmmss")}.xlsx`,
        );
      });
    }
  }

  private _buildMenu(grid: FlexGrid, prop: ContextMenuProps) {
    const itemSource = this.genarateMenuItems(prop);

    this.setCanExecuteMap(prop);
    this.setExecuteMap(prop);

    const menu = new Menu(document.createElement("div"), {
      owner: grid.hostElement,
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
          const view = grid.collectionView,
            colIdx = this.hitTest?.col || grid.selection.col,
            col = grid.columns[colIdx];
          if (this.canExecuteMap.has(cmd)) {
            const func = this.canExecuteMap.get(cmd);
            const menuItem: IMenuItem = this.getFlatMenuItem().find(
              (item: any) => item.cmd === cmd,
            );
            if (func) return func({ grid, view, col, hitTest: this.hitTest, menu: menuItem });
          }
          return true;
        },
        // execute menu commands
        executeCommand: (cmd: string) => {
          const view = grid.collectionView,
            cols = grid.columns,
            colIdx = this.hitTest?.col || grid.selection.col,
            col = cols[colIdx];
          if (this.executeMap.has(cmd)) {
            const func = this.executeMap.get(cmd);
            const menuItem: IMenuItem = this.getFlatMenuItem().find(
              (item: any) => item.cmd === cmd,
            );
            func && func({ grid, view, col, hitTest: this.hitTest, menu: menuItem });
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
   * @param item 추가할 항목 정의 @see ExtendGridContextMenu#IMenuItem
   * @param active 항목의 활성 여부에 대한 Function
   * @param clicked 항목 선택 시, 실행할 Function
   * @returns @see IMenuItem
   */
  public addMenuItem(item: IMenuItem): IMenuItem {
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
   * @param item 추가할 항목 정의 @see ExtendGridContextMenu#IMenuItem
   * @param active 항목의 활성 여부에 대한 Function
   * @param clicked 항목 선택 시, 실행할 Function
   * @returns @see IMenuItem
   */
  public insertMenuItem(index: number, item: IMenuItem): IMenuItem {
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
   * @returns @see ExtendGridContextMenu#IMenuItem
   */
  public removeMenuItem(index: number): IMenuItem | undefined {
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
   * @returns @see ExtendGridContextMenu#IMenuItem
   */
  public getMenuItem(index: number): IMenuItem | undefined {
    if (this.menu.itemsSource[index].length <= 0) return undefined;

    if (index >= 0) {
      this.menu.itemsSource[index][0];
    } else {
      this.menu.itemsSource[this.menu.itemsSource[index].length - index][0];
    }
  }

  /**
   * Context Menu Item을 Flat List로 반환
   * @param index
   * @returns @see ExtendGridContextMenu#IMenuItem
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
