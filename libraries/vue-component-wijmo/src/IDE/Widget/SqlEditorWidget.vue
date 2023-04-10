<template>
  <div class="moz-sql-root" ref="sqlRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, useSlots, defineExpose } from "vue";
import { SqlEditor, ISqlEditor, ISchema, IField, ISqlEditorParams, createCamelProps } from "@mozart-ui/common-ui";

const props = defineProps<{
  contents?: string;
  theme?: string;
  contextmenu?: boolean;
  suggestOnTriggerCharacters?: boolean;
  dbs?: ISchema[];
  customKeywords?: string[];
  triggerCharacters?: string[];
  inputField?: () => Promise<IField[]>;
  inputTableAlias?: (tableName: string) => Promise<IField[]>;
  execute?: (sql: string) => void;
  initializeSqlEditor?: (params: ISqlEditorParams) => void;
  registerDock?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
}>();

const sqlRef = ref(null);
const sql = ref(null as SqlEditor | null);

const slots = useSlots();
const defaultSlots = (slots.default as any)();

onMounted(() => {
  sql.value = new SqlEditor({
    parents: sqlRef.value as unknown as HTMLElement,
    ...createCamelProps<ISqlEditor>(props),
  });

  defaultSlots.forEach((slot: any) => {
    if (!sql || !sql.value) return;
    if (slot.props["data-position"] === "dock") {
      sql.value.registerDock(slot.props["data-type"], (content, id, data) => {
        if (props.registerDock) {
          props.registerDock(slot, content, id, data);
        }
      });
      if (slot.props["data-add"]) {
        sql.value.addDock({
          key: slot.props["data-type"],
          type: slot.props["data-type"],
          title: slot.props["data-title"],
        });
      }
    }
  });

  setTimeout(() => {
    if (!sql || !sql.value) return;
    sql.value.render();

    if (props.initializeSqlEditor) {
      props.initializeSqlEditor({
        sql: sql.value as SqlEditor,
      });
    }
  }, 20);
});

onUnmounted(() => {
  if (!sql || !sql.value) return;
  sql.value.dispose();
});

defineExpose({
  sqlRef,
  sql,
});
</script>
