import * as React from "react";
import { Tree as TreeComponent, ITreeProps } from "@mozart-ui/common-ui";

const Tree: React.FC<ITreeProps> = (props: ITreeProps) => {
  const treeRef = React.useRef(null);

  React.useEffect(() => {
    const tree = new TreeComponent({
      parents: treeRef.current as unknown as HTMLElement,
      ...props,
    });
    tree.render();

    return () => {
      tree.dispose();
    };
  });
  return (
    <>
      <div className="moz-tree" ref={treeRef}></div>
    </>
  );
};

export default Tree;
