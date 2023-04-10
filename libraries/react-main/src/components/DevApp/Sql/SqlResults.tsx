import * as React from "react";
import { DataGrid, Column } from "devextreme-react/data-grid";

interface IDataItemProp {
  results?: any[];
}

const SqlResults: React.FC<IDataItemProp> = props => {
  return (
    <>
      <DataGrid
        className="moz-edit-datagrid"
        width="100%"
        height="100%"
        dataSource={props.results}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        columnResizingMode="widget"
        keyExpr="name"
        autoNavigateToFocusedRow={false}
        showBorders={false}
        showColumnLines={false}
        selection={{ mode: "single" }}
        hoverStateEnabled={true}
        noDataText="No data to display"
      >
      </DataGrid>
    </>
  );
};

export default React.memo(SqlResults);
