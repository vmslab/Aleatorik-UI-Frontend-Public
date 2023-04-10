import * as React from "react";
import { SqlEditor, ISqlEditor, ISqlEditorParams, createCamelProps } from "@mozart-ui/common-ui";

interface ISqlEditorWidgetProps extends ISqlEditor {
  children?: React.ReactNode | React.ReactNode[];
  initializeSqlEditor?: (params: ISqlEditorParams) => void;
  registerDock?: (child: any, content: HTMLElement, id: number, data: Record<string, any>) => void;
}

const SqlEditorWidget: React.FC<ISqlEditorWidgetProps> = props => {
  const sqlRef = React.useRef(null);
  let sql: SqlEditor;

  React.useEffect(() => {
    sql = new SqlEditor({
      parents: sqlRef.current as unknown as HTMLElement,
      ...createCamelProps<ISqlEditor>(props),
    });

    const childAction = (child: any) => {
      if (!sql) return;
      if (child.props["data-position"] === "dock") {
        sql.registerDock(child.props["data-type"], (content, id, data) => {
          if (props.registerDock) {
            props.registerDock(child, content, id, data);
          }
        });
        if (child.props["data-add"]) {
          sql.addDock({
            key: child.props["data-type"],
            type: child.props["data-type"],
            title: child.props["data-title"],
          });
        }
      }
    };

    if (props.children && Array.isArray(props.children)) {
      props.children.forEach((child: any) => {
        childAction(child);
      });
    } else {
      if (!props.children) return;
      const child: any = props.children;
      childAction(child);
    }

    setTimeout(() => {
      sql.render();
      if (props.initializeSqlEditor) {
        props.initializeSqlEditor({
          sql,
        });
      }
    }, 20);

    return () => {
      sql.dispose();
    };
  });

  return (
    <>
      <div className="moz-sql-root" ref={sqlRef}></div>
    </>
  );
};

export default SqlEditorWidget;
