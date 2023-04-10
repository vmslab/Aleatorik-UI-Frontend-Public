<template>
  <DxPopup
    v-if="systemStore.open"
    :visible="systemStore.open"
    class="moz-popup"
    :drag-enabled="true"
    :hide-on-outside-click="false"
    :show-close-button="true"
    :show-title="true"
    title="System"
    :width="300"
    :height="200"
    @hiding="onHiding"
  >
    <DxForm
      class="moz-form moz-margin-form"
      :show-colon-after-label="false"
      :form-data="selectedInfo.selectedItem?.info"
      @content-ready="onContentReady"
    >
      <DxItem data-field="SYSTEM_ID" :editor-options="{ didabled: systemStore.mode === 'Modify' }" />
      <DxItem data-field="NAME" />
      <DxItem data-field="TYPE" :editor-options="{ didabled: systemStore.mode === 'Modify' }" />
    </DxForm>
    <DxToolbarItem
      widget="dxButton"
      toolbar="bottom"
      location="after"
      :options="{ text: 'Save', onClick: onSaveBtnClick }"
    />
  </DxPopup>
</template>

<script setup lang="ts">
import { useMutation } from "vue-query";
import { DxPopup, DxToolbarItem } from "devextreme-vue/popup";
import { DxForm, DxItem } from "devextreme-vue/form";
import { generateGUID } from "@mozart-ui/common-ui";
import { Add, Modify } from "@mozart-ui/common-api";
import { useAlarmStore } from "../../stores/mainStore";
import { useSelectedStore, useSystemStore } from "../../stores/devStore";
import queryClient from "../../utils/query";

const alarm = useAlarmStore();
const selectedInfo = useSelectedStore();
const systemStore = useSystemStore();

const mutation = useMutation(systemStore.mode === "Add" ? Add : Modify, {
  onSuccess: result => {
    alarm.setAlarm({
      message:
        result.data.count > 0
          ? `System ${systemStore.mode === "Add" ? "added" : "modified"}!`
          : `${systemStore.mode} system failed!`,
      type: result.data.count > 0 ? "success" : "error",
    });
    if (result.data.count > 0) {
      queryClient.invalidateQueries("system");
      systemStore.setSystemState({
        mode: systemStore.mode,
        open: false,
        connName: "",
      });
    }
  },
});

const onHiding = (evt: any) => {
  systemStore.setSystemState({
    mode: systemStore.mode,
    open: false,
    connName: "",
  });
};

const onContentReady = (evt: any) => {
  if (selectedInfo.selectedItem?.info) return;
  const id = generateGUID();
  selectedInfo.setSelectedItems({
    id,
    name: "",
    parentId: "",
    type: "system",
    info: {
      SYSTEM_ID: "",
      NAME: "",
      TYPE: "",
    },
  });
};

const onSaveBtnClick = async (evt: any) => {
  const wheres =
    systemStore.mode === "Modify" ? ["SYSTEM_ID", "=", selectedInfo.selectedItem?.info?.SYSTEM_ID] : undefined;
  mutation.mutate({
    type: "",
    payload: { connName: systemStore.connName, tableName: "T_SA_SYSTEM", obj: selectedInfo.selectedItem?.info, wheres },
  });
};
</script>
