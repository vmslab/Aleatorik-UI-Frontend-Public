<template>
  <Controller></Controller>
  <div class="moz-frame">
    <Graph :elements="elements" :styleObj="styleObj" :layout="layout"></Graph>
  </div>
</template>

<script setup lang="ts">
import { Graph } from "@mozart-ui/vue-component-wijmo";
import { ElementsDefinition } from "@mozart-ui/common-ui";
import Controller from "../../components/Controller.vue";

const elements: ElementsDefinition = {
  nodes: [
    {
      data: {
        id: "1",
        name: "Satellite Test",
        externalKey: "T1",
        color: "rgb(163, 143, 132)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "2",
        name: "Satellite Req",
        externalKey: "R1",
        color: "rgb(163, 143, 132)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "3",
        name: "Satellite",
        externalKey: "SYN-45",
        color: "rgb(66, 117, 0)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "4",
        name: "Satellite Test",
        externalKey: "SYN-10",
        color: "rgb(251, 160, 38)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "5",
        name: "Capsule",
        externalKey: "SYN-11",
        color: "rgb(66, 117, 0)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "6",
        name: "Station",
        externalKey: "SYN-12",
        color: "rgb(251, 160, 38)",
      },
      group: "nodes",
    },
    {
      data: {
        id: "7",
        name: "Hinges",
        externalKey: "SYN-09",
        color: "blue",
      },
      group: "nodes",
    },
  ],
  edges: [
    {
      data: {
        id: "9",
        name: "allocate",
        externalKey: "A1",
        color: "blue",
        source: "1",
        target: "4",
      },
      group: "edges",
    },
    {
      data: {
        id: "10",
        name: "allocate",
        externalKey: "A2",
        color: "blue",
        source: "2",
        target: "4",
      },
      group: "edges",
    },
    {
      data: {
        id: "11",
        name: "allocate",
        externalKey: "A3",
        color: "blue",
        source: "3",
        target: "4",
      },
      group: "edges",
    },
    {
      data: {
        id: "12",
        name: "contains",
        externalKey: "C1",
        color: "blue",
        source: "4",
        target: "7",
      },
      group: "edges",
    },
    {
      data: {
        id: "13",
        name: "contains",
        externalKey: "C1",
        color: "blue",
        source: "3",
        target: "4",
      },
      group: "edges",
    },
    {
      data: {
        id: "14",
        name: "contains",
        externalKey: "C1",
        color: "blue",
        source: "3",
        target: "5",
      },
      group: "edges",
    },
    {
      data: {
        id: "15",
        name: "contains",
        externalKey: "C1",
        color: "blue",
        source: "3",
        target: "6",
      },
      group: "edges",
    },
  ],
};
const styleObj: any[] = [
  {
    selector: "edge",
    style: {
      textBackgroundOpacity: 1,
      textBackgroundColor: "white",
      textBackgroundShape: "rectangle",
      content(ele: any) {
        return ele.data("name");
      },
      curveStyle: "straight",
      targetArrowShape: "triangle",
      edgeTextRotation: "autorotate",
      lineColor: "#000",
      lineStyle: "solid",
      targetArrowColor: "data(color)",
      width: 0.5,
      fontSize: 6,
      controlPointStepSize: 70,
    },
  },
  {
    selector: "node",
    style: {
      content(ele: any) {
        return ele.data("externalKey");
      },
      backgroundColor: "data(color)",
      borderWidth: 0.5,
      borderStyle: "solid",
      borderColor: "#000000",
      width: 30,
      height: 30,
      textValign: "center",
      textHalign: "center",
      textWrap: "ellipsis",
      textMaxWidth: 40,
      fontSize: 6,
      color: "#ffffff",
    },
  },
  {
    selector: "node.highlight",
    style: {
      borderWidth: 1,
      borderColor: "#000000",
    },
  },
  {
    selector: "edge.hover",
    style: {
      width: 1,
      fontSize: 8,
      color: "#000000",
    },
  },
];
const layout: any = {
  name: "klay",
  klay: {
    // direction: "DOWN",
  },
};
</script>
