import * as React from "react";
import ReactDOM from "react-dom/client";
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil";
import { QueryClientProvider } from "react-query";
import queryClient from "../../utils/query";
import { SqlEditor, ISqlEditorParams } from "@aleatorik-ui/common-ui";
import { SqlDef } from "@aleatorik-ui/protos/src/generated/Protos/ModelService";
import { SqlEditorWidget } from "@aleatorik-ui/react-component";
import SqlParameters from "./Sql/SqlParameters";
import SqlResults from "./Sql/SqlResults";

interface ISqlEditorProps {
  data?: SqlDef;
}

const SqlEditorDock: React.FC<ISqlEditorProps> = props => {
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();

  let sql: SqlEditor | null = null;

  const onInitializeSqlEditor = (params: ISqlEditorParams) => {
    sql = params.sql;
  };

  const onRegisterDock = (child: any, content: HTMLElement, id: number, data: Record<string, any>) => {
    ReactDOM.createRoot(content).render(
      <QueryClientProvider client={queryClient}>
        <RecoilBridge>{React.cloneElement(child, data)}</RecoilBridge>
      </QueryClientProvider>,
    );
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

  return (
    <>
      <SqlEditorWidget
        contents={props.data?.contents}
        initializeSqlEditor={onInitializeSqlEditor}
        registerDock={onRegisterDock}
        execute={onExecute}
      >
        <SqlParameters
          data-type="sql-parameters"
          data-position="dock"
          data-add={true}
          params={props.data?.params as any}
        />
        <SqlResults data-type="sql-results" data-position="dock" />
      </SqlEditorWidget>
    </>
  );
};

export default React.memo(SqlEditorDock);
