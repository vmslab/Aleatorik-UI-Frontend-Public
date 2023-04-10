import * as React from "react";
import { StreamingParameter } from "@mozart-ui/common";
import { GetServerInfo, ServerSate } from "@mozart-ui/common-api";
import { generateGUID } from "@mozart-ui/common-ui";
import { ServerStateResponse } from "@mozart-ui/protos/src/generated/Protos/ServerService";
import { Gauge, Arc } from "@mozart-ui/react-component";

const Home: React.FC = () => {
  const [serverInfo, setServerInfo] = React.useState({} as Record<string, any>);
  const [serverState, setServerState] = React.useState({} as Record<string, any>);
  const sessionId = generateGUID();
  React.useEffect(() => {
    (async () => {
      const result = await GetServerInfo();
      if (result && result.data) {
        setServerInfo(result.data);
      }
    })();
    const serverParameter = new StreamingParameter<Record<string, any>, ServerStateResponse>(sessionId, {});
    const func = async () => {
      serverParameter.onRecived = param => {
        setServerState(param);
      };
      await ServerSate(serverParameter);
    };
    func();
    return () => {
      serverParameter.isComplate = true;
    };
  }, []);

  return (
    <div className="moz-frame-no-control">
      <table>
        <tbody>
          <tr>
            <td style={{ padding: "4px", fontWeight: "bold" }}>Processor Name</td>
            <td style={{ padding: "4px" }}>
              {serverInfo.processorName} ({serverInfo.is64BitOperatingSystem ? "x64" : "x86"})
            </td>
          </tr>
          <tr>
            <td style={{ padding: "4px", fontWeight: "bold" }}>Operating System</td>
            <td style={{ padding: "4px" }}>{serverInfo.operatingSystem}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px", fontWeight: "bold" }}>Physical Memory</td>
            <td style={{ padding: "4px" }}>{serverInfo.physicalMemory}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px", fontWeight: "bold" }}>Installed Dotnets</td>
            <td style={{ padding: "4px" }}>{serverInfo.dotnetVersions}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex-center-horizontal">
        <Gauge width={200} height={200} type="arc" cornerRadius={10}>
          <Arc
            value={serverState.cpuUsage}
            name="CPU Usage"
            animationDuration={0}
            animationDelay={0}
            textSize={26}
            percentText="%"
          />
        </Gauge>
        <Gauge width={200} height={200} type="arc" cornerRadius={10}>
          <Arc
            value={serverState.memoryUsage}
            name="Memory Usage"
            animationDuration={0}
            animationDelay={0}
            textSize={26}
            percentText="%"
          />
        </Gauge>
        <Gauge width={200} height={200} type="arc" cornerRadius={10}>
          <Arc
            value={serverState.diskUsage}
            name="Disk Usage"
            animationDuration={0}
            animationDelay={0}
            textSize={26}
            percentText="%"
          />
        </Gauge>
      </div>
    </div>
  );
};

export default Home;
