<template>
  <Controller :show-filter="options.filter">
    <DxButton
      v-tooltip="{ text: $t('Refresh') }"
      class="moz-default-button"
      icon="refresh"
      type="default"
      :focusStateEnabled="false"
      :text="$t('Refresh')"
      @click="loadData()"
    />

    <template #title>
      <i
        v-if="options.filter"
        v-tooltip="{ text: t('HideFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon-tap controller-title-button"
      />
      <i
        v-else
        v-tooltip="{ text: t('ShowFilter') }"
        @click="options.filter = !options.filter"
        class="mozart-icons moz-filter-icon controller-title-button"
      />
    </template>
    <template #filter>
      <div>
        <label>{{ $t("Log") }} {{ $t("Date") }}</label>
        <WjInputDate format="yyyy-MM-dd" :valueChanged="onValueChanged" />
      </div>
    </template>
  </Controller>
  <div class="user-manager moz-frame-for-outer-control">
    <WjFlexGrid
      :style="{ width: '100%', height: `calc(var(--size-content-inner-height-outer-controller) - 4px)` }"
      :itemsSource="logItems"
      :initialized="onInitialized"
      :isReadOnly="true"
      selectionMode="MultiRange"
      allowSorting="MultiColumn"
      keyActionTab="Cycle"
      :allowDelete="true"
      :autoGenerateColumns="false"
      :deferResizing="true"
      :quickAutoSize="true"
      :imeEnabled="true"
      :alternatingRowStep="0"
    >
      <WjFlexGridColumn
        width="*"
        binding="Timestamp"
        :header="$t('Timestamp')"
        :isReadOnly="true"
        :isRequired="true"
        dataType="Date"
        format="yyyy-MM-dd HH:mm:ss"
      />
      <WjFlexGridColumn width="*" binding="Level" :header="$t('Level')" :isRequired="true" />
      <WjFlexGridColumn width="*" binding="ClientIp" :header="$t('ClientIp')" :isRequired="false" />
      <WjFlexGridColumn width="*" binding="ClientAgent" :header="$t('ClientAgent')" :isRequired="false" />
      <WjFlexGridColumn width="*" binding="UserName" :header="`${$t('User')} ${$t('Name')}`" :isRequired="true" />
      <WjFlexGridColumn width="*" binding="Path" :header="$t('Path')" :isRequired="false" />
      <WjFlexGridColumn width="*" binding="Message" :header="$t('Message')" :isRequired="false" />
    </WjFlexGrid>

    <DxLoadPanel
      :visible="options.loading"
      :show-indicator="true"
      :show-pane="true"
      :shading="true"
      :hideOnOutsideClick="false"
      container=".user-manager"
      shading-color="rgba(0,0,0,0.4)"
      message="Please, wait..."
    />
  </div>
</template>

<script setup lang="ts">
import { Get } from "../../stores/templateStore";
import { onMounted, ref, reactive } from "vue";
import { useQuery, useQueryClient } from "vue-query";
import { ExtendGrid } from "@aleatorik-ui/vue-component-wijmo";
import { WjFlexGrid, WjFlexGridColumn } from "@grapecity/wijmo.vue2.grid";
import { FlexGrid } from "@grapecity/wijmo.grid";
import { WjInputDate } from "@grapecity/wijmo.vue2.input";
import { Globalize } from "@grapecity/wijmo";

import "devextreme-vue/text-area";
import { DxLoadPanel } from "devextreme-vue/load-panel";
import { useTranslation } from "i18next-vue";
import { showMessage } from "../../utils/dialog";
import Controller from "../../components/Controller.vue";
import DxButton from "devextreme-vue/button";

import { useMenuStore } from "../../stores/mainStore";
import { InputDate } from "@grapecity/wijmo.input";
import { EventArgs } from "@grapecity/wijmo";

const menuModule = useMenuStore();

const { t } = useTranslation();

const logItems = ref<any[] | null>([]);
const grid = ref<FlexGrid | null>(null);
const extendgrid = ref<ExtendGrid | null>(null);

const logDate = ref<Date>(new Date());

const options = reactive({ loading: false, filter: true, activeDelete: false });
const queryClient = useQueryClient();

useQuery("Log", ({ queryKey }) => Get(queryKey[0], `webapi-${Globalize.format(logDate.value, "yyyyMMdd")}`), {
  refetchOnWindowFocus: false,
  onSuccess: result => {
    menuModule.endEdit();
    if (result && result.data)
      logItems.value = result.data.map((data: string) => {
        let logData = JSON.parse(data);
        logData.Timestamp = new Date(logData.Timestamp);
        logData.ClientIp = logData.Properties.ClientIp;
        logData.ClientAgent = logData.Properties.ClientAgent;
        logData.UserName = logData.Properties.LogTemplate.User;
        logData.Path = logData.Properties.LogTemplate.Path;
        logData.Message = logData.Properties.LogTemplate.Message;
        return logData;
      });
    else logItems.value = [];
  },
  onError: err => {
    showMessage("An error occurred while loading data", false);
    logItems.value = [];
  },
});

onMounted(async () => {
  await loadData();
});

const onValueChanged = async (calendar: InputDate, e: EventArgs) => {
  if (!calendar.value) return;
  logDate.value = calendar.value;
  await loadData();
};

const onInitialized = (flexGrid: FlexGrid) => {
  grid.value = flexGrid;
  extendgrid.value = new ExtendGrid({
    flexGrid,
  });
};

const loadData = async () => {
  options.loading = true;
  queryClient.invalidateQueries("Log");
  options.loading = false;
};
</script>
