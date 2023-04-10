<template>
  <div>Hello World! {{ no }}</div>
</template>

<script setup lang="ts">
const props = defineProps({
  data: Object,
});

const no = props.data!.no;
</script>
