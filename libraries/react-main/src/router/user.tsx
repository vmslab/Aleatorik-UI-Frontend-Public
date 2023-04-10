import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { LoadPanel } from "devextreme-react/load-panel";

const Router = () => {
  const NotFound = React.lazy(() => import("../views/NotFound"));

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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </>
  );
};

export default Router;
