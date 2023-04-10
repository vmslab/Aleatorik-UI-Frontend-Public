import * as React from "react";
import { GetModel } from "@mozart-ui/common-api";
// import { Modeler as ModelerComponent } from "@mozart-ui/react-component";

const Modeler: React.FC = () => {
  React.useEffect(() => {
    (async () => {
      const result = await GetModel();
      if (result && result.data) {
        console.log(result.data);
      }
    })();
  }, []);

  return (
    <div className="moz-frame-no-control">
      {/* <ModelerComponent
        styleObject={{ height: "var(--size-content-inner-height-no-padding)" }}
      ></ModelerComponent> */}
    </div>
  );
};

export default Modeler;
