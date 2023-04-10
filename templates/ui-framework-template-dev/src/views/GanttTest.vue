<template>
  <div>
    <div class="moz-frame">
      <moz-controller></moz-controller>
      <moz-gantt
        :columns="columns"
        :getRows="getRows"
        :minDate="minDate"
        :maxDate="maxDate"
        ganttTaskLine="last"
        :ganttHeaders="ganttHeaders"
        :ganttWidthRate="ganttWidthRate"
        :setGanttHeaderClassList="setGanttHeaderClassList"
      ></moz-gantt>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import dayjs from "dayjs";
import { Column, IGanttHeader, IGanttRow, generateGUID, GanttHeaderType } from "mozart-common";

@Component({
  components: {},
})
export default class GanttTest extends Vue {
  public columns: Column[] = [
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
  public data: any[];
  public minDate: Date = dayjs("2022-04-16 16:50:00").toDate();
  public maxDate: Date = dayjs("2022-09-24 16:50:00").toDate();
  public ganttHeaders: IGanttHeader[] = [{ type: "Month" }, { type: "Day" }];
  public ganttWidthRate: number = 0.0004;
  public rowCnt: number = 8;
  public eo: number = 1;

  constructor() {
    super();

    this.data = [
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

    this.data.push({
      AA: `AA5`,
      BB: `BB5`,
      DD: `DD6`,
      EE: `EE6`,
      HH: `HH6`,
      II: `II6`,
      KK: `KK6`,
      LL: `LL6`,
    });

    this.data.push({
      AA: `AA5`,
      BB: `BB6`,
      DD: `DD7`,
      EE: `EE7`,
      HH: `HH7`,
      II: `II7`,
      KK: `KK7`,
      LL: `LL7`,
    });

    this.data.push({
      AA: `AA8`,
      BB: `BB6`,
      DD: `DD8`,
      EE: `EE8`,
      HH: `HH8`,
      II: `II8`,
      KK: `KK8`,
      LL: `LL8`,
    });
  }

  public getRows(currentBuffer: number, buffer: number, resolve: (value: IGanttRow[]) => void) {
    if (this.rowCnt > 500) {
      resolve([]);
    }
    const newData = Array(buffer)
      .fill(0)
      .map((num, idx) => {
        const i = idx + this.rowCnt + 1;
        this.rowCnt++;
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
      newData.unshift(...this.data);
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
            level: this.eo % 4 < 2 ? 2 : 3,
            text: `${d.BB}_task3`,
            tooltip: `${d.BB}_task3`,
          });
          milestones.push({
            id: mileId,
            time: dayjs(this.eo % 2 === 0 ? "2022-04-20 06:00:00" : "2022-04-24 06:00:00").toDate(),
            item: d,
            key: `${d.BB}_task3`,
            level: this.eo % 4 < 2 ? 3 : 2,
            tooltip: `${d.BB}_task3`,
          });
          links.push({
            from: taskId,
            to: mileId,
          });
          this.eo++;
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
  }

  public setGanttHeaderClassList(text: string, type: GanttHeaderType, to: Date, from: Date) {
    if (type === "Month") {
      if (dayjs(to).month() === 3) {
        return ["moz-gantt-header-apr"];
      } else {
        return [];
      }
    } else if (type === "Day") {
      const day = dayjs(to).day();
      if (day === 0) {
        return ["moz-gantt-header-sun"];
      } else if (day === 6) {
        return ["moz-gantt-header-sat"];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}
</script>
