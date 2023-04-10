<template>
  <div>
    <moz-controller></moz-controller>
    <div class="moz-frame">
      <div class="dx-card">
        <moz-calendar :height="350" :exceptWeeks="[0, 6]" locale="ko" :events="events">
        </moz-calendar>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class Calendar extends Vue {
  constructor() {
    super();
  }

  public get events(): any[] {
    return [
      {
        title: "test1",
        start: "2021-09-02",
        end: "2021-09-04",
        repeat: "never",
        tooltip: "<span style='font-weight:bold'>개발</span>: 2021.119.0",
        backgroundColor: "#FF0000",
      },
      {
        title: "test6",
        start: "2021-09-08",
        end: "2021-09-08",
        repeat: "never",
        tooltip: "<span style='font-weight:bold'>테스트</span> 2021.119.0",
      },
      {
        title: "test2",
        start: "2021-09-08",
        end: "2021-09-13",
        repeat: "monthly",
        tooltip: "<span style='font-weight:bold'>테스트</span> 2021.119.0",
      },
      {
        title: "test3",
        start: "2021-09-18",
        end: "2021-09-18",
        repeat: "yearly",
        tooltip: "정기점검",
      },
      {
        title: "test4",
        start: "2021-09-23",
        end: "2021-09-23",
        repeat: "monthly",
        tooltip: "<span style='font-weight:bold'>배포</span> 2021.119.0",
      },
    ];
  }
}
</script>
