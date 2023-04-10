import * as React from "react";
import { ColorPicker } from "@mozart-ui/react-component";

interface ISettingProps {}

const SettingDock: React.FC<ISettingProps> = props => {
  return (
    <>
      <div>Setting</div>
      <ColorPicker popup={false} />
    </>
  );
};

export default React.memo(SettingDock);
