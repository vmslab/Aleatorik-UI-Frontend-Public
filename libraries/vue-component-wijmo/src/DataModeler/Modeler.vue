<template>
  <div ref="flow" @drop="onDrop" @dragover="onDragOver" :style="props.styleObject">
    <div class="toolbox">
      <div :draggable="true" @dragstart="onDrag" data-node="table">
        <i class="toolbox-icon mozart-icons m-061_icon-data-table"></i>
      </div>
    </div>
    <div class="minimap" ref="minimapRef"></div>
  </div>
</template>

<script setup lang="ts">
import { createApp, onMounted, ref, StyleValue } from "vue";
import { Flow, FlowClone, FlowMinimap } from "@mozart-ui/common-ui";
import TableNode from "./node/TableNode.vue";

const props = defineProps<{
  styleObject?: StyleValue;
}>();

const flow = ref(null);
const minimapRef = ref(null);
let editor: Flow | null = null;
let minimap: FlowMinimap | null = null;

onMounted(() => {
  editor = new Flow(flow.value || document.createElement("div"));
  editor.reroute = true;
  editor.rerouteFixCurvature = true;
  editor.forceFirstInput = false;
  minimap = new FlowMinimap(minimapRef.value || document.createElement("div"), editor, 0.05);
  editor.start();

  // temporary code...
  editor.addModule({
    name: "main",
    data: {},
    info: {},
    selected: true,
  });

  editor.registerNode("table", (content, id, data, module) => {
    createApp(TableNode, { data }).mount(content);
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
</script>
