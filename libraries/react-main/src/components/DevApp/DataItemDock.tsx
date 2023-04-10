import * as React from "react";
import { useSetRecoilState } from "recoil";
import { useMutation } from "react-query";
import { generateGUID } from "@mozart-ui/common-ui";
import { types } from "@mozart-ui/protos";
import { EntityDef, EntityPropDef } from "@mozart-ui/protos/src/generated/Protos/ModelService";
import { Add, Modify } from "@mozart-ui/common-api";
import { alarmState } from "../../stores/mainStore";
import queryClient from "../../utils/query";
import { DataGrid, Column, Editing, Lookup, Toolbar, Item } from "devextreme-react/data-grid";
import TextBox from "devextreme-react/text-box";
import Button from "devextreme-react/button";
import cloneDeep from "lodash/cloneDeep";

interface IDataItemProp {
  data?: EntityDef;
  mode?: string;
}

const DataItemDock: React.FC<IDataItemProp> = props => {
  const gridRef = React.useRef(null);
  const setAlarm = useSetRecoilState(alarmState);

  const [dataItem, setDataItem] = React.useState(
    cloneDeep(
      props.data || {
        id: generateGUID(),
        name: "",
        props: [] as EntityPropDef[],
      },
    ),
  );

  const mutation = useMutation(props.mode === "Add" ? Add : Modify, {
    onSuccess: result => {
      setAlarm(() => ({
        message:
          result.data.count > 0
            ? `DataItem ${props.mode === "Add" ? "added" : "modified"}!`
            : `${props.mode} DataItem failed!`,
        type: result.data.count > 0 ? "success" : "error",
      }));
      if (result.data.count > 0) {
        queryClient.invalidateQueries("model");
      }
    },
  });

  const onInitNewRow = (e: any) => {
    e.data.id = generateGUID();
    e.data.entityName = dataItem.name;
    e.data.primaryKey = false;
    e.data.nullable = true;
  };

  const onAddClick = () => {
    (gridRef.current as any)?.instance?.addRow();
  };

  const onSaveClick = () => {
    mutation.mutate({ type: "DataItem", payload: dataItem });
  };

  return (
    <>
      <DataGrid
        ref={gridRef}
        className="moz-edit-datagrid moz-edit-datagrid-show-toolbar"
        width="100%"
        height="100%"
        dataSource={dataItem.props}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        columnResizingMode="widget"
        keyExpr="id"
        autoNavigateToFocusedRow={false}
        showBorders={false}
        showColumnLines={false}
        selection={{ mode: "single" }}
        hoverStateEnabled={true}
        noDataText="No data to display"
        onInitNewRow={onInitNewRow}
      >
        <Editing allowUpdating={true} allowDeleting={true} allowAdding={true} useIcons={true} mode="cell"></Editing>
        <Toolbar>
          <Item location="before">
            <div className="flex-center-horizontal">
              <label>Name</label>
              <TextBox
                value={dataItem.name}
                onValueChanged={(evt: any) => {
                  if (!evt.value) return;
                  setDataItem({ ...dataItem, ...{ name: evt.value } });
                }}
              />
            </div>
          </Item>
          <Item location="before">
            <div className="flex-center-horizontal">
              <label>Table Name</label>
              <TextBox
                value={dataItem.tableName as any}
                onValueChanged={(evt: any) => {
                  if (!evt.value) return;
                  setDataItem({ ...dataItem, ...{ tableName: evt.value } });
                }}
              />
            </div>
          </Item>
          <Item location="before">
            <div className="flex-center-horizontal">
              <label>Group</label>
              <TextBox
                value={dataItem.group as any}
                onValueChanged={(evt: any) => {
                  if (!evt.value) return;
                  setDataItem({ ...dataItem, ...{ group: evt.value } });
                }}
              />
            </div>
          </Item>
          <Item location="after">
            <Button className="moz-default-button" icon="add" type="default" text="Add" onClick={onAddClick} />
          </Item>
          <Item location="after">
            <Button className="moz-default-button" icon="save" type="default" text="Save" onClick={onSaveClick} />
          </Item>
        </Toolbar>
        <Column dataField="name"></Column>
        <Column dataField="columnName"></Column>
        <Column dataField="type">
          <Lookup dataSource={types} />
        </Column>
        <Column dataField="size" dataType="number" editorOptions={{ showSpinButtons: true }}></Column>
        <Column dataField="primaryKey" dataType="boolean"></Column>
        <Column dataField="nullable" dataType="boolean"></Column>
      </DataGrid>
    </>
  );
};

export default React.memo(DataItemDock);
