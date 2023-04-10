import * as React from "react";
// import ReactDOM from "react-dom/client";
import { IDEMain, IDEMenu, IDEStatus, IIDEParams, IMenuItem, ICommandOptions } from "@mozart-ui/common-ui";
// import HelloWorldWidget from "./Widget/HelloWorldWidget";

interface IIDE {
  commands: Record<string, ICommandOptions>;
  menus: IMenuItem[];
  children?: React.ReactNode | React.ReactNode[];
  initializeIde?: (params: IIDEParams) => void;
  registerAccordian?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
  registerDock?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
}

const IDE: React.FC<IIDE> = (props: IIDE) => {
  const menuRef = React.useRef(null);
  const mainRef = React.useRef(null);
  const statusRef = React.useRef(null);
  let main: IDEMain | null = null;
  let menu: IDEMenu | null = null;
  let status: IDEStatus | null = null;

  React.useEffect(() => {
    // let cnt = 1;
    menu = new IDEMenu({ container: menuRef.current, commands: props.commands, menus: props.menus });
    menu.draw();

    main = new IDEMain(mainRef.current);
    main.draw();
    // main.registerDock("hello", (content, id, data) => {
    //   ReactDOM.createRoot(content).render(<HelloWorldWidget data={data} />);
    // });
    // main.registerAccordian("hello", (content, id, data) => {
    //   ReactDOM.createRoot(content).render(<HelloWorldWidget data={data} />);
    // });

    const childAction = (child: any) => {
      if (!main) return;
      if (child.props["data-position"] === "accordian") {
        main.registerAccordian(child.props["data-type"], (content, id, data) => {
          if (props.registerAccordian) {
            props.registerAccordian(child, content, id, data);
          }
        });
        if (child.props["data-add"]) {
          main.addAccordian({
            key: child.props["data-type"],
            type: child.props["data-type"],
            icon: child.props["data-icon"],
            active: child.props["data-active"],
          });
        }
      } else if (child.props["data-position"] === "dock") {
        main.registerDock(child.props["data-type"], (content, id, data) => {
          if (props.registerDock) {
            props.registerDock(child, content, id, data);
          }
        });
        if (child.props["data-add"]) {
          main.addDock({
            key: child.props["data-type"],
            type: child.props["data-type"],
            title: child.props["data-title"],
          });
        }
      }
    };

    if (props.children && Array.isArray(props.children)) {
      props.children.forEach((child: any) => {
        childAction(child);
      });
    } else {
      if (!props.children) return;
      const child: any = props.children;
      childAction(child);
    }

    status = new IDEStatus(statusRef.current);
    status.draw();

    if (props.initializeIde) {
      props.initializeIde({
        main,
        menu,
        status,
      });
    }
  });
  return (
    <>
      <div ref={menuRef}></div>
      <div ref={mainRef}></div>
      <div ref={statusRef}></div>
    </>
  );
};

export default IDE;
