<template></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class EditGridChild extends Vue {
  @Prop({ type: String, default: "test" }) public text!: string;
  constructor() {
    super();
  }

  public mounted() {
    setTimeout(() => {
      this.$emit("test-event", this.text);
    }, 1000);
  }
}
</script>
