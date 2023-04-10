<template>
  <div ref="container" />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as monaco from "monaco-editor";
import { Snippets, IField, ITable, ISchema, ITableNameAndAlias } from "mozart-common";

@Component({
  name: "SQLEditor",
  components: {},
})
export default class SQLEditor extends Vue {
  @Prop({ type: String, default: "" }) public value!: string;
  @Prop({ type: Array }) public dbs?: ISchema[];
  @Prop({ type: Function }) public onInputField?: () => Promise<IField[]>;
  @Prop({ type: Function }) public onInputTableAlias?: (tableName: string) => Promise<IField[]>;
  @Prop({ type: Number, default: 500 }) public width!: number;
  @Prop({ type: Number, default: 500 }) public height!: number;
  @Prop({ type: String, default: "vs" }) public theme!: string;
  @Prop({ type: Boolean, default: false }) public contextmenu!: boolean;
  @Prop({ type: Boolean, default: true }) public suggestOnTriggerCharacters!: boolean;
  @Prop({ type: Number, default: 14 }) public fontSize!: number;
  @Prop({ type: Array }) public customKeywords?: string[];
  @Prop({ type: Array }) public triggerCharacters?: string[];

  public monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  public completionItemProvider: monaco.IDisposable | null = null;
  public snippets: Snippets | null = null;
  private caretOffset: number = 0;

  constructor() {
    super();
  }

  public mounted() {
    this.initEditor();
    if (!this.monacoEditor) return;
    this.monacoEditor.setValue(this.value);
  }

  public beforeDestroy() {
    this.$emit("onDidChangeCursorSelection", "");
    if (this.completionItemProvider) {
      this.completionItemProvider.dispose();
    }
    if (this.monacoEditor) {
      this.monacoEditor.dispose();
    }
  }

  // @Watch("value")
  // public onValueChanged(newValue: string) {
  //   if (!this.monacoEditor) return;
  //   this.monacoEditor.setValue(newValue);
  // }

  @Watch("dbs", { deep: true })
  public onDbsChanged() {
    if (!this.snippets || !this.dbs) return;
    this.snippets.setDbSchema(this.dbs);
  }

  @Watch("width", { immediate: true })
  public onWidthChanged() {
    if (!this.monacoEditor) return;
    this.monacoEditor.layout({ width: this.width, height: this.height });
  }

  @Watch("height", { immediate: true })
  public onHeightChanged() {
    if (!this.monacoEditor) return;
    this.monacoEditor.layout({ width: this.width, height: this.height });
  }

  @Watch("theme", { immediate: true })
  public onThemeChanged() {
    monaco.editor.setTheme(this.theme);
  }

  public initEditor() {
    this.snippets = new Snippets(
      this.customKeywords,
      this.onInputField!,
      this.onInputTableAlias!,
      this.dbs,
    );
    // Editor language setting
    this.completionItemProvider = monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", ".", ...(this.triggerCharacters || [])],
      provideCompletionItems: (model: any, position: any) => this.snippets!.provideCompletionItems(model, position) as any,
    });
    // Editor initialize
    this.monacoEditor = monaco.editor.create(this.$refs.container as HTMLElement, {
      value: this.value,
      language: "sql",
      theme: this.theme,
      contextmenu: this.contextmenu,
      suggestOnTriggerCharacters: this.suggestOnTriggerCharacters,
      fontSize: this.fontSize,
    });
    // Rerendering
    this.monacoEditor.layout({ width: this.width, height: this.height });
    // Changing monitoring
    this.monacoEditor.onDidChangeModelContent((e: any) => {
      this.caretOffset = e.changes[0].rangeOffset; // Get cursor location
      this.$emit("input", this.monacoEditor!.getValue());
    });
    this.monacoEditor.onDidChangeCursorSelection((e: any) => {
      const selectedText = this.monacoEditor!.getModel()!.getValueInRange({
        startLineNumber: e.selection.startLineNumber,
        startColumn: e.selection.startColumn,
        endLineNumber: e.selection.endLineNumber,
        endColumn: e.selection.endColumn,
      });
      this.$emit("onDidChangeCursorSelection", selectedText);
    });
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      this.$emit("ctrl-enter");
    });
    this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      // Get current cursor location
      const position = this.monacoEditor!.getPosition()!;
      const range = new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column,
      );
      const options = {
        range: range,
        text: " ${  }",
        forceMoveMarkers: true,
      };
      this.monacoEditor!.executeEdits("my-source", [options]);
      this.monacoEditor!.setPosition({
        column: position.column + 3,
        lineNumber: position.lineNumber,
      });
    });
    
    // this.monacoEditor.addAction()
  }
}
</script>

<style lang="scss" scoped>
.sqlpad {
  .container {
    width: 100%;
    height: 400px;
    border: 1px solid #dcdfe6;
  }
  .devide {
    width: 100%;
    height: 4px;
    cursor: row-resize;
    &:hover {
      background: orange;
    }
  }
}
</style>
