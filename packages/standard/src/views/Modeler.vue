<template>
  <div class="moz-frame-no-control">
    <!-- <Modeler :style-object="{ height: 'var(--size-content-inner-height-no-padding)' }"></Modeler> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { GetModel } from "@aleatorik-ui/common-api";
// import { Modeler } from "@aleatorik-ui/vue-component-wijmo";

onMounted(async () => {
  const result = await GetModel();
  if (result && result.data) {
    console.log(result.data);
  }
});
</script>
