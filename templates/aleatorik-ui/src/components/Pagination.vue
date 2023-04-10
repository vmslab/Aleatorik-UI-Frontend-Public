<template>
  <div class="paination-container">
    <button
      :disabled="disabled || (currentPage || 0) <= 1"
      class="prev-button"
      @click="move((currentPage || 0) - 1)"
    ></button>

    <button
      :class="{
        page: true,
      }"
      @click="move(1)"
      v-if="isShowLeftShortcut"
    >
      {{ 1 }}
    </button>
    <div class="separator" v-if="isShowLeftShortcut">. . .</div>

    <!-- 두 수 범위 사이를 루프 -->
    <button
      v-for="(page, index) in lastNumber - firstNumber + 1"
      :key="`page_${index}`"
      :class="{
        page: true,
        active: index + firstNumber == currentPage,
      }"
      @click="move(index + firstNumber)"
    >
      {{ index + firstNumber }}
    </button>

    <div class="separator" v-if="isShowRightShortcut">. . .</div>
    <button
      :class="{
        page: true,
      }"
      @click="move(totalPage)"
      v-if="isShowRightShortcut"
    >
      {{ totalPage }}
    </button>

    <button
      :disabled="disabled || (currentPage || 0) >= (totalPage || 0)"
      class="next-button"
      @click="move((currentPage || 0) + 1)"
    ></button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({
  name: "Pagination",
  components: {},
})
export default class Pagination extends Vue {
  @Prop({ type: Number, required: false }) public currentPage?: number;
  @Prop({ type: Number, required: false }) public totalPage?: number;
  @Prop({ type: Boolean, required: false }) public disabled?: boolean;
  @Prop({ type: Number, required: false, default: 5 }) public countPerPage?: number;

  public firstNumber: number = 0;
  public lastNumber: number = 0;

  constructor() {
    super();
  }

  public mounted() {
    this.init();
  }

  @Watch("currentPage")
  @Watch("totalPage")
  @Watch("countPerPage")
  public init() {
    this.calcPageRange();
  }

  public calcPageRange() {
    const _currentPage = this.currentPage || 0;
    const _totalPages = this.totalPage || 0;
    const _countPerPage = this.countPerPage || 0;

    // 보여질 페이지 범위 중 가장 첫 번호
    let firstPage = Math.max(1, _currentPage - Math.floor(_countPerPage / 2));

    // 보여질 페이지 범위 중 가장 나중 번호
    let lastPage = Math.min(_totalPages, _currentPage + Math.floor(_countPerPage / 2));

    // 범위 양쪽 경계에 있을때 페이지 범위가 정상적으로 출력되지 않음.
    // 따라서 범위를 조정해야 함.
    // if (lastPage - firstPage + 1 < _countPerPage) {
    //   if (_currentPage < _totalPages / 2) {
    //     lastPage = Math.min(_totalPages, lastPage + (_countPerPage - (lastPage - firstPage)));
    //   } else {
    //     firstPage = Math.max(1, firstPage - (_countPerPage - (lastPage - firstPage)));
    //   }
    // }

    // 좌측 경계에 있을때 block으로 작동 (countPerPage가 5일때 currentPage가 1~4 범위 일때)
    if (_currentPage <= _countPerPage - 1) {
      firstPage = 1;
      lastPage = _countPerPage;
    }

    // 우측 경계에 있을때 block으로 작동
    if (_currentPage > _totalPages - (_countPerPage - 1)) {
      firstPage = _totalPages - (_countPerPage - 1);
      lastPage = _totalPages;
    }

    // countPerPage가 홀수인 경우 범위가 짝수로 나타날 수 있음.
    if (lastPage - firstPage + 1 > _countPerPage) {
      if (_currentPage > _totalPages / 2) {
        firstPage++;
      } else {
        lastPage--;
      }
    }

    this.firstNumber = firstPage;
    this.lastNumber = lastPage;
  }

  public move(page?: number) {
    if (!page) return;

    this.$emit("change", page);
  }

  public get isShowLeftShortcut() {
    return (this.firstNumber || 0) >= 3;
  }
  public get isShowRightShortcut() {
    return (this.currentPage || 0) <= (this.totalPage || 0) - 4;
  }
}
</script>
