import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { LoadPanel } from "devextreme-react/load-panel";
import { Login, NotFound } from "@mozart-ui/react-main";

const Router = () => {
  const UserApp = React.lazy(() => import("../views/UserApp"));

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
          <Route path="/" element={<Login />} />
          <Route path="/user/*" element={<UserApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </>
  );
};

export default Router;
