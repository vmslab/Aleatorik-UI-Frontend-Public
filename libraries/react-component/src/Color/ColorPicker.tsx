import * as React from "react";
import { ColorPicker as ColorPickerComponent, IColorPickerOptions } from "@mozart-ui/common-ui";

interface IColorPickerOptionsDetail extends IColorPickerOptions {
  children?: React.ReactNode;
}

const ColorPicker: React.FC<IColorPickerOptionsDetail> = (props: IColorPickerOptionsDetail) => {
  const pickerRef = React.useRef(null);

  React.useEffect(() => {
    const picker = new ColorPickerComponent({
      parent: pickerRef.current as unknown as HTMLElement,
      ...props,
    });

    // return () => {
    //   picker.dispose();
    // };
  });
  return (
    <>
      <div className="moz-color-picker" ref={pickerRef}>
        {props.children ?? props.children}
      </div>
    </>
  );
};

export default ColorPicker;
