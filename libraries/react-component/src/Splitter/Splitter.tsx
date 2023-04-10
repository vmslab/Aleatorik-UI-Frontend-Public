import * as React from "react";
import ReactDOM from "react-dom/client";
import {
  Splitter as SplitterComponent,
  Pane as PaneComponent,
  ISplitterProps,
  Direction,
  createCamelProps,
} from "@aleatorik-ui/common-ui";

interface ISplitterPropsDetail extends ISplitterProps {
  children?: React.ReactNode | React.ReactNode[];
  renderPane?: (child: any, parent: HTMLElement) => void;
}

const Splitter: React.FC<ISplitterPropsDetail> = props => {
  const splitterRef = React.useRef(null);

  React.useEffect(() => {
    const contents: PaneComponent[] = [];
    const addPane = (child: any) => {
      contents.push(
        new PaneComponent({
          contents: (parents: HTMLElement) => {
            if (props.renderPane) {
              props.renderPane(child, parents);
            } else {
              ReactDOM.createRoot(parents).render(child);
            }
          },
          direction: props.direction,
          resizersSize: props.resizerSize,
          size: child.props["pane-size"],
          minSize: child.props["pane-min-size"],
          maxSize: child.props["pane-max-size"],
        }),
      );
    };
    if (props.children && Array.isArray(props.children)) {
      props.children.forEach((child: any) => {
        addPane(child);
      });
    } else {
      addPane(props.children);
    }
    const splitter = new SplitterComponent({
      parents: splitterRef.current as unknown as HTMLElement,
      ...createCamelProps<ISplitterProps>(props),
      contents,
    });
    splitter.render();

    return () => {
      splitter.dispose();
    };
  });
  return (
    <>
      <div className="moz-splitter-root" ref={splitterRef}></div>
    </>
  );
};

export default Splitter;
