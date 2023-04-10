import * as React from "react";
import ReactDOM from "react-dom";
import { Flow, FlowClone, FlowMinimap } from "@mozart-ui/common-ui";
import TableNode from "./node/TableNode";

export interface IModelerProps {
  styleObject?: Record<string, any>;
}

const Modeler: React.FC<IModelerProps> = (props: IModelerProps) => {
  const flowRef = React.useRef(null);
  const minimapRef = React.useRef(null);
  let editor: Flow | null = null;
  let minimap: FlowMinimap | null = null;

  React.useEffect(() => {
    editor = new Flow(flowRef.current || document.createElement("div"));
    editor.reroute = true;
    editor.rerouteFixCurvature = true;
    editor.forceFirstInput = false;
    minimap = new FlowMinimap(minimapRef.current || document.createElement("div"), editor, 0.05);
    editor.start();

    // temporary code...
    editor.addModule({
      name: "main",
      data: {},
      info: {},
      selected: true,
    });

    editor.registerNode("table", (content, id, data, module) => {
      ReactDOM.render(<TableNode data={data}></TableNode>, content);
    });
  });

  const onDrag = (event: any) => {
    event.dataTransfer.setData("node", event.target.getAttribute("data-node"));
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
  };

  const onDrop = (event: any) => {
    event.preventDefault();
    if (!editor) return;
    if (!editor.precanvas) return;
    if (editor.editorMode !== "edit") return;
    const type = event.dataTransfer.getData("node");
    const posX =
      event.clientX * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) -
      editor.precanvas.getBoundingClientRect().x *
        (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom));
    const posY =
      event.clientY * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) -
      editor.precanvas.getBoundingClientRect().y *
        (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom));
    switch (type) {
      case "table":
        editor.addNode("table", 1, 0, posX, posY, "", {}, "table", true);
        break;
      case "sql":
        editor.addNode("sql", 1, 0, posX, posY, "", {}, "sql", true);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={flowRef} onDrop={onDrop} onDragOver={onDragOver} style={props.styleObject}>
      <div className="toolbox">
        <div draggable={true} onDragStart={onDrag} data-node="table">
          <i className="toolbox-icon mozart-icons m-061_icon-data-table"></i>
        </div>
      </div>
      <div className="minimap" ref={minimapRef}></div>
    </div>
  );
};

export default Modeler;
