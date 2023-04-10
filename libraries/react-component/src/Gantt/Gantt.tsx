import * as React from "react";
import { Gantt as GanttComponent, IGanttProps } from "@aleatorik-ui/common-ui";

const Gantt: React.FC<IGanttProps> = (props: IGanttProps) => {
  const ganttRef = React.useRef(null);

  React.useEffect(() => {
    const gantt = new GanttComponent({
      parents: ganttRef.current as unknown as HTMLElement,
      ...props,
    });
    gantt.render();

    return () => {
      gantt.dispose();
    };
  });
  return (
    <>
      <div ref={ganttRef}></div>
    </>
  );
};

export default Gantt;
