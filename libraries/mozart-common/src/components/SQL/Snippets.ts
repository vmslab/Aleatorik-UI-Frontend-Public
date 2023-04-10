import { languages, editor, Position, IRange, IMarkdownString } from "monaco-editor";
import { keywords } from "./keywords";
import { IField, ITable, ISchema, ITableNameAndAlias } from "../../types";

type ITextModel = editor.ITextModel;

export interface CompletionItem {
  label: string | languages.CompletionItemLabel;
  kind: languages.CompletionItemKind;
  tags?: readonly languages.CompletionItemTag[];
  detail?: string;
  documentation?: string | IMarkdownString;
  sortText?: string;
  filterText?: string;
  preselect?: boolean;
  insertText: string;
  insertTextRules?: languages.CompletionItemInsertTextRule;
  range?: IRange;
  commitCharacters?: string[];
  additionalTextEdits?: editor.ISingleEditOperation[];
  command?: languages.Command;
}

export default class Snippets {
  public customKeywords: string[];
  public dbKeywords: string[];
  public dbSchema: ISchema[];
  public monaco: any;
  public onInputTableColumn: () => Promise<IField[]>;
  public onInputTableAilas: (tableName: string) => Promise<IField[]>;
  public SortText = {
    Database: "0",
    Table: "1",
    Column: "2",
    Keyword: "3",
  };

  constructor(
    customKeywords: string[] = [],
    onInputTableColumn: () => Promise<IField[]>,
    onInputTableAilas: (tableName: string) => Promise<IField[]>,
    dbSchema: ISchema[] = [{ dbName: "", tables: [{ tblName: "", tableColumns: [] }] }],
  ) {
    this.customKeywords = customKeywords;
    this.dbKeywords = [...keywords, ...customKeywords];
    this.dbSchema = dbSchema;
    this.getKeywordSuggest = this.getKeywordSuggest.bind(this);
    this.getTableSuggest = this.getTableSuggest.bind(this);
    this.getTableColumnSuggest = this.getTableColumnSuggest.bind(this);
    this.onInputTableColumn = onInputTableColumn;
    this.onInputTableAilas = onInputTableAilas;
  }

  setDbSchema(dbSchema: ISchema[]) {
    this.dbSchema = dbSchema;
  }

  async provideCompletionItems(model: ITextModel, position: Position): Promise<any> {
    const { lineNumber, column } = position;
    const textBeforePointer = model.getValueInRange({
      startLineNumber: lineNumber,
      startColumn: 0,
      endLineNumber: lineNumber,
      endColumn: column,
    });
    const textBeforePointerMulti = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 0,
      endLineNumber: lineNumber,
      endColumn: column,
    });
    const textAfterPointerMulti = model.getValueInRange({
      startLineNumber: lineNumber,
      startColumn: column,
      endLineNumber: model.getLineCount(),
      endColumn: model.getLineMaxColumn(model.getLineCount()),
    });
    const tokens = textBeforePointer.trim().split(/\s+/);
    const lastToken = tokens[tokens.length - 1].toLowerCase();
    if (lastToken === "database") {
      return {
        suggestions: this.getDataBaseSuggest(),
      };
    } else if (lastToken.endsWith(".")) {
      const tokenNoDot = lastToken.slice(0, lastToken.length - 1);
      if (this.dbSchema.find(db => db.dbName === tokenNoDot.replace(/^.*,/g, ""))) {
        return {
          suggestions: [...this.getTableSuggestByDbName(tokenNoDot.replace(/^.*,/g, ""))],
        };
      } else if (
        this.getTableNameAndTableAlias(
          `${textBeforePointerMulti.split(";")[textBeforePointerMulti.split(";").length - 1]}${
            textAfterPointerMulti.split(";")[0]
          }`,
        )
      ) {
        const tableInfoList = this.getTableNameAndTableAlias(
          `${textBeforePointerMulti.split(";")[textBeforePointerMulti.split(";").length - 1]}${
            textAfterPointerMulti.split(";")[0]
          }`,
        );
        const currentTable = tableInfoList.find(
          item => item.tableAlias === tokenNoDot.replace(/^.*,/g, ""),
        );
        if (currentTable && currentTable.tableName) {
          return {
            suggestions: await this.getTableColumnSuggestByTableAlias(currentTable.tableName),
          };
        } else {
          return {
            suggestions: [],
          };
        }
      } else {
        return {
          suggestions: [],
        };
      }
    } else if (
      lastToken === "from" ||
      lastToken === "join" ||
      /(from|join)\s+.*?\s?,\s*$/.test(textBeforePointer.replace(/.*?\(/gm, "").toLowerCase())
    ) {
      const databases = this.getDataBaseSuggest();
      return {
        suggestions: databases,
      };
    } else if (
      [
        "select",
        "where",
        "order by",
        "group by",
        "by",
        "and",
        "or",
        "having",
        "distinct",
        "on",
      ].includes(lastToken.replace(/.*?\(/g, "")) ||
      (lastToken.endsWith(".") && !this.dbSchema.find(db => `${db.dbName}.` === lastToken)) ||
      /(select|where|order by|group by|by|and|or|having|distinct|on)\s+.*?\s?,\s*$/.test(
        textBeforePointer.toLowerCase(),
      )
    ) {
      return {
        suggestions: await this.getTableColumnSuggest(),
      };
    } else if (this.customKeywords.toString().includes(lastToken)) {
      return {
        suggestions: this.getCustomSuggest(lastToken.startsWith("$")),
      };
    } else {
      return {
        suggestions: [
          ...this.getDataBaseSuggest(),
          ...this.getTableSuggest(),
          ...this.getKeywordSuggest(),
        ],
      };
    }
  }

  getCustomSuggest(startsWith$: boolean) {
    return this.customKeywords.map(keyword => ({
      label: keyword,
      kind: languages.CompletionItemKind.Keyword,
      detail: "",
      sortText: this.SortText.Keyword,
      insertText: startsWith$ ? keyword.slice(1) : keyword,
    }));
  }

  getAllTableColumn() {
    const tableColumns: CompletionItem[] = [];
    this.dbSchema.forEach(db => {
      db.tables.forEach(table => {
        table.tableColumns.forEach(field => {
          tableColumns.push({
            label: field.columnName ? field.columnName : "",
            kind: languages.CompletionItemKind.Module,
            detail: "<Field>",
            sortText: this.SortText.Column,
            insertText: field.columnName ? field.columnName : "",
          });
        });
      });
    });
    return tableColumns;
  }

  getDataBaseSuggest(): CompletionItem[] {
    return this.dbSchema.map(db => {
      return {
        label: db.dbName ? db.dbName : "",
        kind: languages.CompletionItemKind.Class,
        detail: "<Database>",
        sortText: this.SortText.Database,
        insertText: db.dbName ? db.dbName : "",
      };
    });
  }

  getKeywordSuggest() {
    return this.dbKeywords.map(keyword => ({
      label: keyword,
      kind: languages.CompletionItemKind.Keyword,
      detail: "<Keyword>",
      sortText: this.SortText.Keyword,
      insertText: keyword.startsWith("$") ? keyword.slice(1) : keyword,
    }));
  }

  getTableSuggest() {
    const tables: CompletionItem[] = [];
    this.dbSchema.forEach(db => {
      db.tables.forEach(table => {
        tables.push({
          label: table.tblName ? table.tblName : "",
          kind: languages.CompletionItemKind.Struct,
          detail: `<Table> ${db.dbName} ${table.tblComment ? table.tblComment : ""}`,
          sortText: this.SortText.Table,
          insertText: table.tblName ? table.tblName : "",
          documentation: table.tblComment ? table.tblComment : "",
        });
      });
    });
    return tables;
  }

  getTableSuggestByDbName(dbName: string) {
    const currentDb = this.dbSchema.find(db => db.dbName === dbName);
    const tables: CompletionItem[] = [];
    if (currentDb) {
      currentDb.tables.forEach(table => {
        tables.push({
          label: table.tblName ? table.tblName : "",
          kind: languages.CompletionItemKind.Struct,
          detail: `<Table> ${currentDb.dbName} ${table.tblComment ? table.tblComment : ""}`,
          sortText: this.SortText.Table,
          insertText: table.tblName ? table.tblName : "",
          documentation: table.tblComment ? table.tblComment : "",
        });
      });
    }
    return tables;
  }

  async getTableColumnSuggest() {
    const defaultFields: CompletionItem[] = [];
    this.dbSchema.forEach(db => {
      for (const table of db.tables) {
        if (!table.tableColumns) continue;
        table.tableColumns.forEach(field => {
          defaultFields.push({
            label: field.columnName ? field.columnName : "",
            kind: languages.CompletionItemKind.Field,
            detail: `<Field> ${field.commentName ? field.commentName : ""} <${field.columnType}>`,
            sortText: this.SortText.Column,
            insertText: field.columnName ? field.columnName : "",
            documentation: {
              value: `
### Database: ${field.dbName}
### Table: ${field.tblName}
### Comment: ${field.commentName ? field.commentName : ""}
            `,
            },
          });
        });
      }
    });
    const asyncFields: CompletionItem[] = [];
    if (typeof this.onInputTableColumn === "function") {
      const fileds = await this.onInputTableColumn();
      fileds.forEach(field => {
        asyncFields.push({
          label: field.columnName ? field.columnName : "",
          kind: languages.CompletionItemKind.Field,
          detail: `<Field> ${field.commentName ? field.commentName : ""} <${field.columnType}>`,
          sortText: this.SortText.Column,
          insertText: field.columnName ? field.columnName : "",
          documentation: {
            value: `
  ### Database: ${field.dbName}
  ### Table: ${field.tblName}
  ### Comment: ${field.commentName ? field.commentName : ""}
            `,
          },
        });
      });
    }
    return [...defaultFields, ...asyncFields];
  }

  async getTableColumnSuggestByTableAlias(tableName: string) {
    const defaultFields: CompletionItem[] = [];
    this.dbSchema.forEach(db => {
      for (const table of db.tables) {
        if (!table.tableColumns) continue;
        table.tableColumns.forEach(field => {
          defaultFields.push({
            label: field.columnName ? field.columnName : "",
            kind: languages.CompletionItemKind.Field,
            detail: `<Field> ${field.commentName ? field.commentName : ""} <${field.columnType}>`,
            sortText: this.SortText.Column,
            insertText: field.columnName ? field.columnName : "",
            documentation: {
              value: `
### Database: ${field.dbName}
### Table: ${field.tblName}
### Comment: ${field.commentName ? field.commentName : ""}
            `,
            },
          });
        });
      }
    });
    const asyncFields: CompletionItem[] = [];
    if (typeof this.onInputTableAilas === "function") {
      const fileds = await this.onInputTableAilas(tableName);
      fileds.forEach(field => {
        asyncFields.push({
          label: field.columnName ? field.columnName : "",
          kind: languages.CompletionItemKind.Field,
          detail: `<Field> ${field.commentName ? field.commentName : ""} <${field.columnType}>`,
          sortText: this.SortText.Column,
          insertText: field.columnName ? field.columnName : "",
          documentation: {
            value: `
### Database: ${field.dbName}
### Table: ${field.tblName}
### Comment: ${field.commentName ? field.commentName : ""}
            `,
          },
        });
      });
    }
    return [...defaultFields, ...asyncFields];
  }

  getTableNameAndTableAlias(sqlText: string) {
    const regTableAliasFrom =
      /(^|(\s+))from\s+([^\s]+(\s+|(\s+as\s+))[^\s]+(\s+|,)\s*)+(\s+(where|left|right|full|join|inner|union))?/gi;
    const regTableAliasJoin = /(^|(\s+))join\s+([^\s]+)\s+(as\s+)?([^\s]+)\s+on/gi;
    const regTableAliasFromList = sqlText.match(regTableAliasFrom) || [];
    const regTableAliasJoinList = sqlText.match(regTableAliasJoin) || [];
    const strList = [
      ...regTableAliasFromList.map(item =>
        item
          .replace(/(^|(\s+))from\s+/gi, "")
          .replace(/\s+(where|left|right|full|join|inner|union)((\s+.*?$)|$)/gi, "")
          .replace(/\s+as\s+/gi, " ")
          .trim(),
      ),
      ...regTableAliasJoinList.map(item =>
        item
          .replace(/(^|(\s+))join\s+/gi, "")
          .replace(/\s+on((\s+.*?$)|$)/, "")
          .replace(/\s+as\s+/gi, " ")
          .trim(),
      ),
    ];
    const tableList: ITableNameAndAlias[] = [];
    strList.map(tableAndAlias => {
      tableAndAlias.split(",").forEach(item => {
        const tableName = item.trim().split(/\s+/)[0];
        const tableAlias = item.trim().split(/\s+/)[1];
        tableList.push({
          tableName,
          tableAlias,
        });
      });
    });
    return tableList;
  }
}
