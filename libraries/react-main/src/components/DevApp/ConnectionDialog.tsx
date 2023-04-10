import * as React from "react";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { Popup, ToolbarItem } from "devextreme-react/popup";
import TileView from "devextreme-react/tile-view";
import { connectionState, provider, selectedState } from "../../stores/devStore";
import Form, { Item } from "devextreme-react/form";
import { providers } from "@mozart-ui/protos";
import { generateGUID } from "@mozart-ui/common-ui";
import { Add, Modify, TestConnection } from "@mozart-ui/common-api";
import { alarmState } from "../../stores/mainStore";
import queryClient from "../../utils/query";

const ConnectionDialog: React.FC = () => {
  const formRef = React.useRef(null);
  const [selectedInfo, setSelectedInfo] = useRecoilState(selectedState);
  const currentProvider = useRecoilValue(provider);
  const [state, setState] = useRecoilState(connectionState);
  const setAlarm = useSetRecoilState(alarmState);
  const [addIdx, setAddIdx] = React.useState(0);

  const { t } = useTranslation();

  const mutation = useMutation(state.mode === "Add" ? Add : Modify, {
    onSuccess: result => {
      setAlarm(() => ({
        message:
          result.data.count > 0
            ? `Connection ${state.mode === "Add" ? "added" : "modified"}!`
            : `${state.mode} connection failed!`,
        type: result.data.count > 0 ? "success" : "error",
      }));
      if (result.data.count > 0) {
        queryClient.invalidateQueries("model");
        setState({
          mode: state.mode,
          open: false,
        });
      }
    },
  });

  const onHiding = () => {
    setState({
      mode: state.mode,
      open: false,
    });
  };

  const onProviderItemClick = (evt: any) => {
    setAddIdx(1);
    const id = generateGUID();
    setSelectedInfo({
      id,
      name: "",
      parentId: "",
      type: "connection",
      info: {
        id,
        name: "",
        dbType: evt.itemData.name,
        dataSource: "",
      },
    });
  };

  const onTestBtnClick = async (evt: any) => {
    var result = await TestConnection(selectedInfo?.info);
    if (result && result.data) {
      setAlarm(() => ({
        message: result.data.count > 0 ? "Connected!" : "Connection failed!",
        type: result.data.count > 0 ? "success" : "error",
      }));
    }
  };

  const onSaveBtnClick = async (evt: any) => {
    mutation.mutate({ type: "Connection", payload: selectedInfo?.info });
  };

  const onFieldDataChanged = (evt: any) => {
    if (!formRef.current) return;
    const data = (formRef.current as any).props.formData;
    setSelectedInfo({ ...selectedInfo, ...({ info: data } as any) });
  };

  if (!state.open) return <></>;

  return (
    <>
      <Popup
        visible={state.open}
        className="moz-popup"
        onHiding={onHiding}
        dragEnabled={true}
        hideOnOutsideClick={false}
        showCloseButton={true}
        showTitle={true}
        title="Connection"
        width={300}
        height={340}
      >
        {state.mode === "Add" && addIdx === 0 ? (
          <TileView
            items={providers}
            direction="vertical"
            width="100%"
            height="100%"
            baseItemHeight={70}
            baseItemWidth={70}
            itemRender={data => (
              <div className="moz-db-tile">
                <i className={`mozart-icons moz-db-icon ${data.icon}`}></i>
                <span>{data.name}</span>
              </div>
            )}
            onItemClick={onProviderItemClick}
          />
        ) : state.mode === "Modify" || addIdx === 1 ? (
          <Form
            ref={formRef}
            className="moz-form moz-margin-form"
            showColonAfterLabel={false}
            formData={{ ...selectedInfo?.info }}
            onFieldDataChanged={onFieldDataChanged}
          >
            <Item dataField="name" />
            <Item dataField="group" />
            <Item dataField="dataSource" />
            {currentProvider.type > 0 || <Item dataField="database" />}
            {currentProvider.type !== 1 || <Item dataField="sid" />}
            {currentProvider.type !== 1 || <Item dataField="serviceName" />}
            {currentProvider.type > 1 || <Item dataField="userId" />}
            {currentProvider.type > 1 || <Item dataField="password" editorOptions={{ mode: "password" }} />}
          </Form>
        ) : (
          <></>
        )}
        <ToolbarItem location="before">
          {(state.mode === "Add" && addIdx === 0) || (
            <i className={`mozart-icons moz-db-icon moz-db-icon-title ${currentProvider.icon}`} />
          )}
        </ToolbarItem>
        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          options={{ text: t("Test"), disabled: state.mode === "Add" && addIdx === 0, onClick: onTestBtnClick }}
        />
        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          options={{ text: t("Save"), disabled: state.mode === "Add" && addIdx === 0, onClick: onSaveBtnClick }}
        />
      </Popup>
    </>
  );
};

export default React.memo(ConnectionDialog);
