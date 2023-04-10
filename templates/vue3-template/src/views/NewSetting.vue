<template>
  <div class="moz-frame-no-control">
    <table>
      <tbody>
        <tr>
          <td style="padding: 4px; font-weight: bold">Processor Name</td>
          <td style="padding: 4px">
            {{ serverInfo.processorName }} ({{ serverInfo.is64BitOperatingSystem ? "x64" : "x86" }})
          </td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold">Operating System</td>
          <td style="padding: 4px">{{ serverInfo.operatingSystem }}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold">Physical Memory</td>
          <td style="padding: 4px">{{ serverInfo.physicalMemory }}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold">Installed Dotnets</td>
          <td style="padding: 4px">{{ serverInfo.dotnetVersions }}</td>
        </tr>
      </tbody>
    </table>
    <div className="flex-center-horizontal">
      <Gauge :width="200" :height="200" type="arc" :cornerRadius="10">
        <Arc
          :value="serverState.cpuUsage"
          name="CPU Usage"
          :animationDuration="0"
          :animationDelay="0"
          :textSize="26"
          percentText="%"
        />
      </Gauge>
      <Gauge :width="200" :height="200" type="arc" :cornerRadius="10">
        <Arc
          :value="serverState.memoryUsage"
          name="Memory Usage"
          :animationDuration="0"
          :animationDelay="0"
          :textSize="26"
          percentText="%"
        />
      </Gauge>
      <Gauge :width="200" :height="200" type="arc" :cornerRadius="10">
        <Arc
          :value="serverState.diskUsage"
          name="Disk Usage"
          :animationDuration="0"
          :animationDelay="0"
          :textSize="26"
          percentText="%"
        />
      </Gauge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { StreamingParameter } from "@mozart-ui/common";
import { GetServerInfo, ServerSate } from "@mozart-ui/common-api";
import { generateGUID } from "@mozart-ui/common-ui";
import { ServerStateResponse } from "@mozart-ui/protos/src/generated/Protos/ServerService";
import { Gauge, Arc } from "@mozart-ui/vue-component-wijmo";

const serverInfo = ref({} as Record<string, any>);
const serverState = ref({} as Record<string, any>);

const sessionId = generateGUID();
const serverParameter = new StreamingParameter<Record<string, any>, ServerStateResponse>(sessionId, {});

onMounted(async () => {
  const result = await GetServerInfo();
  if (result && result.data) {
    serverInfo.value = result.data;
  }
  serverParameter.onRecived = param => {
    serverState.value = param;
  };
  await ServerSate(serverParameter);
});

onUnmounted(() => {
  serverParameter.isComplate = true;
});
</script>
