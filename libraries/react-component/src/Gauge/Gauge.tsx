import * as React from "react";
import {
  Gauge as GaugeComponent,
  Bar as BarComponent,
  Arc as ArcComponent,
  Mark as MarkComponent,
  IGaugeProps,
  IBarProps,
  IArcProps,
  IMarkProps,
  createCamelProps,
} from "@aleatorik-ui/common-ui";

interface IGaugePropsDetail extends IGaugeProps {
  children?: React.ReactNode | React.ReactNode[];
}

const Gauge: React.FC<IGaugePropsDetail> = props => {
  const gaugeRef = React.useRef(null);

  React.useEffect(() => {
    const bars: BarComponent[] = [];
    const arcs: ArcComponent[] = [];
    const marks: MarkComponent[] = [];
    if (props.children) {
      const children: React.ReactNode[] = [];
      if (Array.isArray(props.children)) {
        children.push(...props.children);
      } else {
        children.push(props.children);
      }
      children.forEach((child: any) => {
        if (child.type.name === "Bar") {
          bars.push(new BarComponent(createCamelProps<IBarProps>(child.props)));
        } else if (child.type.name === "Arc") {
          arcs.push(new ArcComponent(createCamelProps<IArcProps>(child.props)));
        } else if (child.type.name === "Mark") {
          marks.push(new MarkComponent(createCamelProps<IMarkProps>(child.props)));
        }
      });
    }
    const gauge = new GaugeComponent({
      parents: gaugeRef.current as unknown as HTMLElement,
      ...createCamelProps<IGaugeProps>(props),
      bars,
      arcs,
      marks,
    });
    gauge.render();

    return () => {
      gauge.dispose();
    };
  });
  return (
    <>
      <div className="moz-gauge-root" ref={gaugeRef}></div>
    </>
  );
};

export default Gauge;
