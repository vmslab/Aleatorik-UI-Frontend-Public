<template>
  <div>{{ text }}</div>
  <div>{{ workingDirectory }}</div>
  <div>{{ delimiter }}</div>
  <FileExplorer :base-path="basePath" :height="450" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useDeployStore } from "../../stores/devStore";
import FileExplorer from "../File/FileExplorer.vue";

const props = defineProps<{
  system?: Record<string, any>;
}>();

const deploy = useDeployStore();

const { workingDirectory, delimiter } = storeToRefs(deploy);

const basePath = ref(`${workingDirectory.value}${delimiter.value}${props.system?.SYSTEM_ID}`);
const text: string = `${props.system?.SYSTEM_ID}:service`;
</script>
