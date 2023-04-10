<template>
  <div class="moz-custom-form">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({
  components: {},
})
export default class CustomForm extends Vue {
  constructor() {
    super();
  }
}
</script>
