<template>
  <Controller></Controller>
  <div class="moz-frame">
    <Gantt
      :columns="columns"
      :getRows="getRows"
      :minDate="minDate"
      :maxDate="maxDate"
      :ganttHeaders="ganttHeaders"
      ganttTaskLine="last"
      :ganttWidthRate="ganttWidthRate"
      :emptyRanges="emptyRanges"
      :setGanttHeaderText="setGanttHeaderText"
      :setTaskTooltip="setGanttTaskTooltip"
    ></Gantt>
  </div>
</template>

<script setup lang="ts">
import { Gantt } from "@mozart-ui/vue-component-wijmo";
import dayjs from "dayjs";
import { dayjsRange } from "@mozart-ui/common";
import { Column, IGanttHeader, IGanttRow, GanttHeaderType, IGanttTask, generateGUID } from "@mozart-ui/common-ui";
import Controller from "../../components/Controller.vue";

const columns: Column[] = [
  new Column({
    field: "AA",
    width: 100,
    merge: true,
  }),
  new Column({
    field: "BB",
    width: 100,
    merge: true,
  }),
  new Column({
    field: "CC",
    children: [
      new Column({
        field: "DD",
        width: 100,
      }),
      new Column({
        field: "EE",
        width: 100,
      }),
    ],
  }),
  new Column({
    field: "FF",
    children: [
      new Column({
        field: "GG",
        children: [
          new Column({
            field: "HH",
            width: 100,
          }),
          new Column({
            field: "II",
            width: 100,
          }),
        ],
      }),
      new Column({
        field: "JJ",
        children: [
          new Column({
            field: "KK",
            width: 100,
          }),
          new Column({
            field: "LL",
            width: 100,
          }),
        ],
      }),
    ],
  }),
];

const data = [
  ...Array(5)
    .fill(0)
    .map((num, idx) => {
      const i = idx + 1;
      return {
        AA: `AA${i}`,
        BB: `BB${i}`,
        DD: `DD${i}`,
        EE: `EE${i}`,
        HH: `HH${i}`,
        II: `II${i}`,
        KK: `KK${i}`,
        LL: `LL${i}`,
      };
    }),
];

data.push({
  AA: `AA5`,
  BB: `BB5`,
  DD: `DD6`,
  EE: `EE6`,
  HH: `HH6`,
  II: `II6`,
  KK: `KK6`,
  LL: `LL6`,
});

data.push({
  AA: `AA5`,
  BB: `BB6`,
  DD: `DD7`,
  EE: `EE7`,
  HH: `HH7`,
  II: `II7`,
  KK: `KK7`,
  LL: `LL7`,
});

data.push({
  AA: `AA8`,
  BB: `BB6`,
  DD: `DD8`,
  EE: `EE8`,
  HH: `HH8`,
  II: `II8`,
  KK: `KK8`,
  LL: `LL8`,
});

const minDate = dayjs("2022-04-16 16:50:00").toDate();
const maxDate = dayjs("2022-09-24 16:50:00").toDate();

const ganttHeaders: IGanttHeader[] = [{ type: "Month" }, { type: "Day" }, { type: "Shift" }];

const ganttWidthRate = 0.0008;

const emptyRanges = [dayjsRange("2022-04-17", "2022-04-18")];

let rowCnt = 8;
let eo = 1;

const getRows = (currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) => {
  if (rowCnt > 500) {
    resolve([]);
  }
  const newData = Array(buffer)
    .fill(0)
    .map((num, idx) => {
      const i = idx + rowCnt + 1;
      rowCnt++;
      return {
        AA: `AA${i}`,
        BB: `BB${i}`,
        DD: `DD${i}`,
        EE: `EE${i}`,
        HH: `HH${i}`,
        II: `II${i}`,
        KK: `KK${i}`,
        LL: `LL${i}`,
      };
    });

  if (currentBuffer === 0) {
    newData.unshift(...data);
  }

  resolve(
    newData.map((d, i) => {
      const tasks = [...Array(32).keys()].map(j => {
        return {
          id: generateGUID(),
          startTime: dayjs("2022-04-16 16:50:00")
            .add(j * 4 + j, "d")
            .toDate(),
          endTime: dayjs("2022-04-20 16:50:00")
            .add(j * 4 + j, "d")
            .toDate(),
          item: d,
          key: `${d.AA}_task${j + 1}`,
          level: 1,
          text: `${d.AA}_task${j + 1}`,
          tooltip: `${d.AA}_task${j + 1}`,
        };
      });
      const milestones = [];
      const links = [];
      if (i === 4) {
        const taskId = generateGUID();
        const mileId = generateGUID();
        tasks.push({
          id: taskId,
          startTime: dayjs("2022-04-18 16:50:00").toDate(),
          endTime: dayjs("2022-04-22 16:50:00").toDate(),
          item: d,
          key: `${d.BB}_task3`,
          level: eo % 4 < 2 ? 2 : 3,
          text: `${d.BB}_task3`,
          tooltip: `${d.BB}_task3`,
        });
        milestones.push({
          id: mileId,
          time: dayjs(eo % 2 === 0 ? "2022-04-20 06:00:00" : "2022-04-24 06:00:00").toDate(),
          item: d,
          key: `${d.BB}_task3`,
          level: eo % 4 < 2 ? 3 : 2,
          tooltip: `${d.BB}_task3`,
        });
        links.push({
          from: taskId,
          to: mileId,
        });
        eo++;
      }
      return {
        ...d,
        maxLevel: i === 4 ? 3 : 1,
        tasks,
        milestones,
        links,
      };
    }),
  );
};

const setGanttHeaderText = (text: string, type: GanttHeaderType, to: Date, from: Date) => {
  if (type === "Shift") {
    const hour = dayjs(to).hour();
    if (hour <= 6 || hour > 22) {
      return "MO";
    } else if (hour <= 14 && hour > 6) {
      return "AF";
    } else {
      return "NN";
    }
  } else {
    return text;
  }
};

const setGanttTaskTooltip = (task: IGanttTask, row?: IGanttRow) => {
  return `${Object.keys(task.item).reduce((result, key, idx) => {
    return `${result}<tr><td>${key}</td><td>${task.item[key]}</td></tr>`;
  }, `<table><tr><td colspan="2">${task.text}</td></tr>`)}</table>`;
};
</script>
