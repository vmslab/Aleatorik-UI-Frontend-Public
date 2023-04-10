import * as monaco from "monaco-editor";

const monacoLight: monaco.editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  colors: {},
  rules: [
    {
      token: "",
      // foreground: this.themes.light.font3,
      // background: this.themes.light.back,
    },
  ],
};

const monacoDark: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  colors: {},
  rules: [
    {
      token: "",
      // foreground: this.themes.dark.font3,
      // background: this.themes.dark.back,
    },
  ],
};

monaco.editor.defineTheme("moz-light", monacoLight as any);
monaco.editor.defineTheme("moz-dark", monacoDark as any);

export default class Editor {
  public editor?: monaco.editor.IStandaloneCodeEditor;
  public width: number = 0;
  public height: number = 0;
  public onScrollChanged?: (e: monaco.IScrollEvent) => void;

  constructor(options: {
    element: HTMLElement;
    width: number;
    height: number;
    language?: string;
    value?: string;
    dark?: boolean;
    readOnly?: boolean;
    onScrollChanged?: (e: monaco.IScrollEvent) => void;
  }) {
    const { element, width, height, language, value, dark, readOnly, onScrollChanged } = options;
    this.width = width;
    this.height = height;
    this.onScrollChanged = onScrollChanged;
    this.editor = monaco.editor.create(element, {
      value,
      language,
      theme: dark ? "moz-dark" : "moz-light",
      minimap: {
        enabled: true,
      },
      // fontFamily: "'Roboto', 'NanumBarunGothic'",
      readOnly,
      automaticLayout: true,
    });
    this.editor.onDidScrollChange((e: monaco.IScrollEvent) => {
      if (!this.onScrollChanged) return;
      this.onScrollChanged(e);
    });
  }

  public dispose() {
    this.editor?.dispose();
  }

  public getValue() {
    return this.editor?.getValue();
  }

  public setValue(value: string) {
    this.editor?.setValue(value);
  }

  public setTheme(dark: boolean) {
    monaco.editor?.setTheme(dark ? "vs-dark" : "vs");
  }

  public setScrollTop(position: number) {
    this.editor?.setScrollTop(position);
  }

  public setHeight(height: number) {
    this.height = height;
  }

  public moveScrollLast(): number {
    if (!this.editor) return 0;
    const scrollHeight = this.editor.getScrollHeight();
    if (scrollHeight > this.height) {
      const next = scrollHeight - this.height - this.height + 19 * 7;
      this.editor.setScrollTop(next);
      return next;
    }
    return 0;
  }
}
