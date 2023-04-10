<template>
  <DxPopup
    v-if="connectionStore.open"
    :visible="connectionStore.open"
    class="moz-popup"
    :drag-enabled="true"
    :hide-on-outside-click="false"
    :show-close-button="true"
    :show-title="true"
    title="Connection"
    :width="300"
    :height="340"
    @hiding="onHiding"
  >
    <DxTileView
      v-if="connectionStore.mode === 'Add'"
      v-show="addIdx === 0"
      :items="providers"
      direction="vertical"
      width="100%"
      height="100%"
      :base-item-height="70"
      :base-item-width="70"
      @item-click="onProviderItemClick"
    >
      <template #item="{ data }">
        <div class="moz-db-tile">
          <i :class="`mozart-icons moz-db-icon ${data.icon}`"></i>
          <span>{{ data.name }}</span>
        </div>
      </template>
    </DxTileView>
    <DxForm class="moz-form moz-margin-form" :show-colon-after-label="false" :form-data="selectedInfo.selectedItem?.info">
      <DxItem data-field="name" />
      <DxItem data-field="group" />
      <DxItem data-field="dataSource" />
      <DxItem v-if="selectedInfo.provider.type < 1" data-field="database" />
      <DxItem v-if="selectedInfo.provider.type === 1" data-field="sid" />
      <DxItem v-if="selectedInfo.provider.type === 1" data-field="serviceName" />
      <DxItem v-if="selectedInfo.provider.type < 2" data-field="userId" />
      <DxItem v-if="selectedInfo.provider.type < 2" data-field="password" :editor-options="{ mode: 'password' }" />
    </DxForm>
    <DxToolbarItem location="before">
      <i v-if="connectionStore.mode === 'Modify' || addIdx === 1" :class="`mozart-icons moz-db-icon moz-db-icon-title ${selectedInfo.provider.icon}`" />
    </DxToolbarItem>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{ text: t('Test'), disabled: connectionStore.mode === 'Add' && addIdx === 0, onClick: onTestBtnClick }"
    />
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{ text: t('Save'), disabled: connectionStore.mode === 'Add' && addIdx === 0, onClick: onSaveBtnClick }"
    />
  </DxPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "vue-query";
import { useTranslation } from "i18next-vue";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxTileView } from "devextreme-vue/tile-view";
import { DxForm, DxItem } from "devextreme-vue/form";
import { providers } from "@mozart-ui/protos";
import { generateGUID } from "@mozart-ui/common-ui";
import { Add, Modify, TestConnection } from "@mozart-ui/common-api";
import { useAlarmStore } from "../../stores/mainStore";
import { useSelectedStore, useConnectionStore } from "../../stores/devStore";
import queryClient from "../../utils/query";

const { t } = useTranslation();

const alarm = useAlarmStore();
const selectedInfo = useSelectedStore();
const connectionStore = useConnectionStore();

const addIdx = ref(0);

const mutation = useMutation(connectionStore.mode === "Add" ? Add : Modify, {
  onSuccess: result => {
    alarm.setAlarm({
      message:
        result.data.count > 0
          ? `Connection ${connectionStore.mode === "Add" ? "added" : "modified"}!`
          : `${connectionStore.mode} connection failed!`,
      type: result.data.count > 0 ? "success" : "error",
    });
    if (result.data.count > 0) {
      queryClient.invalidateQueries("model");
      connectionStore.setConnectionState({
        mode: connectionStore.mode,
        open: false,
      });
    }
  },
});

const onHiding = (evt: any) => {
  connectionStore.setConnectionState({
    mode: connectionStore.mode,
    open: false,
  });
};

const onProviderItemClick = (evt: any) => {
  addIdx.value = 1;
  const id = generateGUID();
  selectedInfo.setSelectedItems({
    id,
    name: "",
    parentId: "",
    type: "connection",
    info: {
      id,
      name: "",
      dbType: evt.itemData.name,
      dataSource: "",
    }
  });
};

const onTestBtnClick = async (evt: any) => {
  var result = await TestConnection(selectedInfo.selectedItem?.info);
  if (result && result.data) {
    alarm.setAlarm({
      message: result.data.count > 0 ? "Connected!" : "Connection failed!",
      type: result.data.count > 0 ? "success" : "error",
    });
  }
};

const onSaveBtnClick = async (evt: any) => {
  mutation.mutate({ type: "Connection", payload: selectedInfo.selectedItem?.info });
};
</script>
