import { Menu, MenuBar, Widget } from "@lumino/widgets";
import { CommandRegistry } from "@lumino/commands";

export interface IMenuItem {
  command?: string;
  label?: string;
  beginGroup?: boolean;
  items?: IMenuItem[];
}

export default class IDEMenu {
  container: HTMLElement | null;
  commands: Record<string, CommandRegistry.ICommandOptions>;
  menus: IMenuItem[];

  constructor(params: {
    container: HTMLElement | null;
    commands: Record<string, CommandRegistry.ICommandOptions>;
    menus: IMenuItem[];
  }) {
    this.container = params.container;
    this.commands = params.commands;
    this.menus = params.menus;
  }

  public draw() {
    if (!this.container) return;
    if (!this.menus) return;

    while (this.container.firstChild) {
      if (!this.container.lastChild) break;
      this.container.removeChild(this.container.lastChild);
    }

    const bar = new MenuBar();

    const commands = new CommandRegistry();

    Object.keys(this.commands).forEach(key => {
      commands.addCommand(key, this.commands[key]);
    });

    const createMenu = (ms: Record<string, any> | Array<Record<string, any>>) => {
      const result = new Menu({ commands });

      if (Array.isArray(ms)) {
        ms.forEach((m, i) => {
          if (m.beginGroup) {
            result.addItem({
              type: "separator",
            });
          }
          if (m.items) {
            const submenu = createMenu(m.items);
            submenu.title.label = m.label;
            result.addItem({
              type: "submenu",
              submenu,
            });
          } else {
            const menu = {
              command: m.command,
            };
            result.addItem(menu);
          }
        });
      }

      return result;
    };

    const menus = createMenu(this.menus);
    menus.items.forEach(menu => {
      const m = new Menu({ commands });
      m.title.label = menu.label;
      menu.submenu?.items.forEach(sm => {
        m.addItem(sm);
      });
      bar.addMenu(m);
    });

    bar.id = "menu-bar";

    Widget.attach(bar, this.container);
  }
}
