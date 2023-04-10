<template>
  <SqlEditorWidget
    :contents="data?.contents"
    :initialize-sql-editor="onInitializeSqlEditor"
    :register-dock="onRegisterDock"
    :execute="onExecute"
  >
    <SqlParameters data-type="sql-parameters" data-position="dock" :data-add="true" :params="(data?.params as any)" />
    <SqlResults data-type="sql-results" data-position="dock" />
  </SqlEditorWidget>
</template>

<script setup lang="ts">
import { createApp } from "vue";
import { VueQueryPlugin } from "vue-query";
import { SqlEditor, ISqlEditorParams } from "@aleatorik-ui/common-ui";
import i18n from "../../plugin/i18n";
import queryClient from "../../utils/query";
import { SqlDef } from "@aleatorik-ui/protos/src/generated/Protos/ModelService";
import { SqlEditorWidget } from "@aleatorik-ui/vue-component";
import SqlParameters from "./Sql/SqlParameters.vue";
import SqlResults from "./Sql/SqlResults.vue";

const props = defineProps<{
  data?: SqlDef;
}>();

let sql: SqlEditor | null = null;

const onInitializeSqlEditor = (params: ISqlEditorParams) => {
  sql = params.sql;
};

const onRegisterDock = (child: any, content: HTMLElement, id: number, data: Record<string, any>) => {
  i18n(createApp(child, data)).use(VueQueryPlugin, { queryClient }).mount(content);
};

const onExecute = (text: string) => {
  if (!sql) return;
  console.log(text);
  sql.addDock({
    key: "sql-results",
    type: "sql-results",
    title: "Results",
  });
};
</script>
