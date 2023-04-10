import * as React from "react";
import { useRecoilValue } from "recoil";
import { getWorkingDirectory, getServerDelimiter } from "../../stores/devStore";
import FileExplorer from "../File/FileExplorer";

interface IServiceProps {
  system?: Record<string, any>;
}

const ServiceDock: React.FC<IServiceProps> = props => {
  const workingDirectory = useRecoilValue(getWorkingDirectory);
  const delimiter = useRecoilValue(getServerDelimiter);

  return (
    <>
      <div>{props.system?.SYSTEM_ID}</div>
      <div>{workingDirectory}</div>
      <div>{delimiter}</div>
      <FileExplorer basePath={`${workingDirectory}${delimiter}${props.system?.SYSTEM_ID}`} height={450} />
    </>
  );
};

export default React.memo(ServiceDock);
