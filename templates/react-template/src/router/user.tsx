import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { LoadPanel } from "devextreme-react/load-panel";
import { NotFound } from "@mozart-ui/react-main";

const Router = () => {
  const Home = React.lazy(() => import("../views/Home"));
  const Modeler = React.lazy(() => import("../views/Modeler"));
  const Gantt = React.lazy(() => import("../views/Gantt"));
  const Chart = React.lazy(() => import("../views/Chart"));
  const Chart2 = React.lazy(() => import("../views/Chart2"));
  const Gauge = React.lazy(() => import("../views/Gauge"));
  const Graph = React.lazy(() => import("../views/Graph"));

  return (
    <>
      <React.Suspense
        fallback={
          <LoadPanel
            visible={true}
            showIndicator={true}
            shading={true}
            showPane={true}
            shadingColor="rgba(0,0,0,0.4)"
          />
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modeler" element={<Modeler />} />
          <Route path="/gantt" element={<Gantt />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/chart2" element={<Chart2 />} />
          <Route path="/gauge" element={<Gauge />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </>
  );
};

export default Router;
