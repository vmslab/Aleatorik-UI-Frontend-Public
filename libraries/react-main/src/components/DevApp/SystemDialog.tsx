import * as React from "react";
import { useSetRecoilState, useRecoilState } from "recoil";
import { useMutation } from "react-query";
import { Popup, ToolbarItem } from "devextreme-react/popup";
import { systemState, selectedState } from "../../stores/devStore";
import Form, { Item } from "devextreme-react/form";
import { generateGUID } from "@aleatorik-ui/common-ui";
import { Add, Modify } from "@aleatorik-ui/common-api";
import { alarmState } from "../../stores/mainStore";
import queryClient from "../../utils/query";

const SystemDialog: React.FC = () => {
  const formRef = React.useRef(null);
  const [selectedInfo, setSelectedInfo] = useRecoilState(selectedState);
  const [state, setState] = useRecoilState(systemState);
  const setAlarm = useSetRecoilState(alarmState);

  const mutation = useMutation(state.mode === "Add" ? Add : Modify, {
    onSuccess: result => {
      setAlarm(() => ({
        message:
          result.data.count > 0
            ? `System ${state.mode === "Add" ? "added" : "modified"}!`
            : `${state.mode} system failed!`,
        type: result.data.count > 0 ? "success" : "error",
      }));
      if (result.data.count > 0) {
        queryClient.invalidateQueries("system");
        setState({
          mode: state.mode,
          open: false,
          connName: "",
        });
      }
    },
  });

  const onHiding = () => {
    setState({
      mode: state.mode,
      open: false,
      connName: "",
    });
  };

  const onContentReady = (evt: any) => {
    if (selectedInfo?.info) return;
    const id = generateGUID();
    setSelectedInfo({
      id,
      name: "",
      parentId: "",
      type: "system",
      info: {
        SYSTEM_ID: "",
        NAME: "",
        TYPE: "",
      },
    });
  };

  const onSaveBtnClick = async (evt: any) => {
    const wheres = state.mode === "Modify" ? ["SYSTEM_ID", "=", selectedInfo?.info?.SYSTEM_ID] : undefined;
    mutation.mutate({ type: "", payload: { connName: state.connName, tableName: "T_SA_SYSTEM", obj: selectedInfo?.info, wheres } });
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
        title="System"
        width={300}
        height={200}
      >
        <Form
          ref={formRef}
          className="moz-form moz-margin-form"
          showColonAfterLabel={false}
          formData={{ ...selectedInfo?.info }}
          onContentReady={onContentReady}
          onFieldDataChanged={onFieldDataChanged}
        >
          <Item dataField="SYSTEM_ID" editorOptions={{ didabled: state.mode === "Modify" }} />
          <Item dataField="NAME" />
          <Item dataField="TYPE" editorOptions={{ didabled: state.mode === "Modify" }} />
        </Form>
        <ToolbarItem
          widget="dxButton"
          toolbar="bottom"
          location="after"
          options={{ text: "Save", onClick: onSaveBtnClick }}
        />
      </Popup>
    </>
  );
};

export default React.memo(SystemDialog);
