import * as React from "react";
import { types } from "@mozart-ui/protos";
import { SqlParam } from "@mozart-ui/protos/src/generated/Protos/ModelService";
import { DataGrid, Column, Editing, Lookup, Toolbar, Item } from "devextreme-react/data-grid";
import TextBox from "devextreme-react/text-box";
import Button from "devextreme-react/button";

interface IDataItemProp {
  params?: SqlParam[];
}

const SqlParameters: React.FC<IDataItemProp> = props => {
  return (
    <>
      <DataGrid
        className="moz-edit-datagrid moz-edit-datagrid-show-toolbar"
        width="100%"
        height="100%"
        dataSource={props.params}
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
        <Editing allowUpdating={true} allowDeleting={true} allowAdding={true} useIcons={true} mode="cell"></Editing>
        <Column dataField="name"></Column>
        <Column dataField="type">
          <Lookup dataSource={types} />
        </Column>
      </DataGrid>
    </>
  );
};

export default React.memo(SqlParameters);
