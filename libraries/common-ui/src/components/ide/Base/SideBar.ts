import { TabBar, StackedPanel, Title, Widget } from "@lumino/widgets";
import { ArrayExt, find, toArray } from "@lumino/algorithm";
import { ISignal, Signal } from "@lumino/signaling";

interface IRankItem {
  /**
   * The widget for the item.
   */
  widget: Widget;

  /**
   * The sort rank of the widget.
   */
  rank: number;
}

function itemCmp(first: IRankItem, second: IRankItem): number {
  return first.rank - second.rank;
}

export default class SideBar {
  /**
   * Construct a new side bar handler.
   */
  constructor() {
    this._sideBar = new TabBar<Widget>({
      insertBehavior: "none",
      removeBehavior: "none",
      allowDeselect: true,
      orientation: "vertical",
    });
    this._stackedPanel = new StackedPanel();
    this._sideBar.hide();
    this._stackedPanel.hide();
    this._lastCurrent = null;
    this._sideBar.currentChanged.connect(this._onCurrentChanged, this);
    this._sideBar.tabActivateRequested.connect(this._onTabActivateRequested, this);
    this._stackedPanel.widgetRemoved.connect(this._onWidgetRemoved, this);
  }

  /**
   * Whether the side bar is visible
   */
  get isVisible(): boolean {
    return this._sideBar.isVisible;
  }

  /**
   * Get the tab bar managed by the handler.
   */
  get sideBar(): TabBar<Widget> {
    return this._sideBar;
  }

  /**
   * Get the stacked panel managed by the handler
   */
  get stackedPanel(): StackedPanel {
    return this._stackedPanel;
  }

  /**
   * Signal fires when the stack panel or the sidebar changes
   */
  get updated(): ISignal<SideBar, void> {
    return this._updated;
  }

  /**
   * Expand the sidebar.
   *
   * #### Notes
   * This will open the most recently used tab, or the first tab
   * if there is no most recently used.
   */
  expand(): void {
    const previous = this._lastCurrent || (this._items.length > 0 && this._items[0].widget);
    if (previous) {
      this.activate(previous.id);
    }
  }

  /**
   * Activate a widget residing in the side bar by ID.
   *
   * @param id - The widget's unique ID.
   */
  activate(id: string): void {
    const widget = this._findWidgetByID(id);
    if (widget) {
      this._sideBar.currentTitle = widget.title;
      widget.activate();
    }
  }

  /**
   * Test whether the sidebar has the given widget by id.
   */
  has(id: string): boolean {
    return this._findWidgetByID(id) !== null;
  }

  /**
   * Collapse the sidebar so no items are expanded.
   */
  collapse(): void {
    this._sideBar.currentTitle = null;
  }

  /**
   * Add a widget and its title to the stacked panel and side bar.
   *
   * If the widget is already added, it will be moved.
   */
  addWidget(widget: Widget, rank: number): void {
    widget.parent = null;
    widget.hide();
    const item = { widget, rank };
    // const index = this._findInsertIndex(item);
    // ArrayExt.insert(this._items, index, item);
    this._items.push(item);
    this._stackedPanel.addWidget(widget);
    const title = this._sideBar.addTab(widget.title);
    // Store the parent id in the title dataset
    // in order to dispatch click events to the right widget.
    title.dataset = { id: widget.id };

    if (typeof title.icon === "string") {
      // add some classes to help with displaying css background imgs
      title.iconClass = `mozart-icons ${title.icon}`;
      title.label = "";
    }

    this._refreshVisibility();
  }

  // /**
  //  * Dehydrate the side bar data.
  //  */
  // dehydrate(): ILabShell.ISideArea {
  //   const collapsed = this._sideBar.currentTitle === null;
  //   const widgets = toArray(this._stackedPanel.widgets);
  //   const currentWidget = widgets[this._sideBar.currentIndex];
  //   return {
  //     collapsed,
  //     currentWidget,
  //     visible: !this._isHiddenByUser,
  //     widgets,
  //   };
  // }

  // /**
  //  * Rehydrate the side bar.
  //  */
  // rehydrate(data: ILabShell.ISideArea): void {
  //   if (data.currentWidget) {
  //     this.activate(data.currentWidget.id);
  //   }
  //   if (data.collapsed) {
  //     this.collapse();
  //   }
  //   if (!data.visible) {
  //     this.hide();
  //   }
  // }

  /**
   * Hide the side bar even if it contains widgets
   */
  hide(): void {
    this._isHiddenByUser = true;
    this._refreshVisibility();
  }

  /**
   * Show the side bar if it contains widgets
   */
  show(): void {
    this._isHiddenByUser = false;
    this._refreshVisibility();
  }

  /**
   * Find the insertion index for a rank item.
   */
  private _findInsertIndex(item: IRankItem): number {
    return ArrayExt.upperBound(this._items, item, itemCmp);
  }

  /**
   * Find the index of the item with the given widget, or `-1`.
   */
  private _findWidgetIndex(widget: Widget): number {
    return ArrayExt.findFirstIndex(this._items, i => i.widget === widget);
  }

  /**
   * Find the widget which owns the given title, or `null`.
   */
  private _findWidgetByTitle(title: Title<Widget>): Widget | null {
    const item = find(this._items, value => value.widget.title === title);
    return item ? item.widget : null;
  }

  /**
   * Find the widget with the given id, or `null`.
   */
  private _findWidgetByID(id: string): Widget | null {
    const item = find(this._items, value => value.widget.id === id);
    return item ? item.widget : null;
  }

  /**
   * Refresh the visibility of the side bar and stacked panel.
   */
  private _refreshVisibility(): void {
    this._stackedPanel.setHidden(this._sideBar.currentTitle === null);
    this._sideBar.setHidden(this._isHiddenByUser || this._sideBar.titles.length === 0);
    this._updated.emit();
  }

  /**
   * Handle the `currentChanged` signal from the sidebar.
   */
  private _onCurrentChanged(sender: TabBar<Widget>, args: TabBar.ICurrentChangedArgs<Widget>): void {
    const oldWidget = args.previousTitle ? this._findWidgetByTitle(args.previousTitle) : null;
    const newWidget = args.currentTitle ? this._findWidgetByTitle(args.currentTitle) : null;
    if (oldWidget) {
      oldWidget.hide();
    }
    if (newWidget) {
      newWidget.show();
    }
    this._lastCurrent = newWidget || oldWidget;
    this._refreshVisibility();
  }

  /**
   * Handle a `tabActivateRequest` signal from the sidebar.
   */
  private _onTabActivateRequested(sender: TabBar<Widget>, args: TabBar.ITabActivateRequestedArgs<Widget>): void {
    args.title.owner.activate();
  }

  /*
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: StackedPanel, widget: Widget): void {
    if (widget === this._lastCurrent) {
      this._lastCurrent = null;
    }
    ArrayExt.removeAt(this._items, this._findWidgetIndex(widget));
    this._sideBar.removeTab(widget.title);
    this._refreshVisibility();
  }

  private _isHiddenByUser = false;
  private _items = new Array<IRankItem>();
  private _sideBar: TabBar<Widget>;
  private _stackedPanel: StackedPanel;
  private _lastCurrent: Widget | null;
  private _updated: Signal<SideBar, void> = new Signal(this);
}
