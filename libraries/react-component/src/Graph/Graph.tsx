import * as React from "react";
import { Graph as GanttComponent, IGraphProps } from "@mozart-ui/common-ui";

const Graph: React.FC<IGraphProps> = (props: IGraphProps) => {
  const graphRef = React.useRef(null);

  React.useEffect(() => {
    const gantt = new GanttComponent({
      parents: graphRef.current as unknown as HTMLElement,
      ...props,
    });
    gantt.render();

    return () => {
      gantt.dispose();
    };
  });
  return (
    <>
      <div ref={graphRef} className="moz-graph-root"></div>
    </>
  );
};

export default Graph;
