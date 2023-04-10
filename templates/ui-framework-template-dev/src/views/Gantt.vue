<template>
  <div>
    <div class="moz-frame">
      <moz-controller></moz-controller>
      <DxGantt :task-list-width="500" :height="700" scale-type="weeks">
        <DxTasks :data-source="tasks" />

        <DxToolbar>
          <DxItem name="undo" />
          <DxItem name="redo" />
          <DxItem name="separator" />
          <DxItem name="collapseAll" />
          <DxItem name="expandAll" />
          <DxItem name="separator" />
          <DxItem name="addTask" />
          <DxItem name="deleteTask" />
          <DxItem name="separator" />
          <DxItem name="zoomIn" />
          <DxItem name="zoomOut" />
        </DxToolbar>

        <DxEditing :enabled="true" />
        <DxValidation :auto-update-parent-tasks="true" />

        <DxColumn :width="300" data-field="title" caption="Subject" />
        <DxColumn data-field="start" caption="Start Date" />
        <DxColumn data-field="end" caption="End Date" />
      </DxGantt>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import {
  DxGantt,
  DxTasks,
  DxColumn,
  DxEditing,
  DxValidation,
  DxToolbar,
  DxItem,
} from "devextreme-vue/gantt";

@Component({
  components: {
    DxGantt,
    DxTasks,
    DxColumn,
    DxEditing,
    DxValidation,
    DxToolbar,
    DxItem,
  },
})
export default class Gantt extends Vue {
  public tasks: any[] = [
    {
      id: 1,
      parentId: 0,
      title: "Software Development",
      start: new Date("2022-02-21T05:00:00.000Z"),
      end: new Date("2022-07-04T12:00:00.000Z"),
      progress: 31,
    },
    {
      id: 2,
      parentId: 1,
      title: "Scope",
      start: new Date("2022-02-21T05:00:00.000Z"),
      end: new Date("2022-02-26T09:00:00.000Z"),
      progress: 60,
    },
    {
      id: 3,
      parentId: 2,
      title: "Determine project scope",
      start: new Date("2022-02-21T05:00:00.000Z"),
      end: new Date("2022-02-21T09:00:00.000Z"),
      progress: 100,
    },
    {
      id: 4,
      parentId: 2,
      title: "Secure project sponsorship",
      start: new Date("2022-02-21T10:00:00.000Z"),
      end: new Date("2022-02-22T09:00:00.000Z"),
      progress: 100,
    },
    {
      id: 5,
      parentId: 2,
      title: "Define preliminary resources",
      start: new Date("2022-02-22T10:00:00.000Z"),
      end: new Date("2022-02-25T09:00:00.000Z"),
      progress: 60,
    },
    {
      id: 6,
      parentId: 2,
      title: "Secure core resources",
      start: new Date("2022-02-25T10:00:00.000Z"),
      end: new Date("2022-02-26T09:00:00.000Z"),
      progress: 0,
    },
    {
      id: 7,
      parentId: 2,
      title: "Scope complete",
      start: new Date("2022-02-26T09:00:00.000Z"),
      end: new Date("2022-02-26T09:00:00.000Z"),
      progress: 0,
    },
    {
      id: 8,
      parentId: 1,
      title: "Analysis/Software Requirements",
      start: new Date("2022-02-26T10:00:00.000Z"),
      end: new Date("2022-03-18T09:00:00.000Z"),
      progress: 80,
    },
    {
      id: 9,
      parentId: 8,
      title: "Conduct needs analysis",
      start: new Date("2022-02-26T10:00:00.000Z"),
      end: new Date("2022-03-05T09:00:00.000Z"),
      progress: 100,
    },
  ];

  constructor() {
    super();
  }
}
</script>
