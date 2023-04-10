import * as React from "react";
import { useRecoilValue } from "recoil";
import { LoadPanel } from "devextreme-react/load-panel";
import { loadState } from "../stores/mainStore";

const Home: React.FC = () => {
  const load = useRecoilValue(loadState);
  return (
    <LoadPanel
      visible={load.loading}
      showIndicator={true}
      shading={true}
      showPane={true}
      shadingColor="rgba(0,0,0,0.4)"
    />
  );
};

export default Home;
