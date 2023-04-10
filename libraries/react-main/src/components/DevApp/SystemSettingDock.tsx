import * as React from "react";

interface ISystemSettingProps {
  system?: Record<string, any>;
}

const SystemSettingDock: React.FC<ISystemSettingProps> = props => {
  return <>{props.system?.SYSTEM_ID}</>;
};

export default React.memo(SystemSettingDock);
