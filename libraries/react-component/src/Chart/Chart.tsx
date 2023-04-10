import * as React from "react";
import {
  Chart as ChartComponent,
  Axis as AxisComponent,
  Series as SeriesComponent,
  Text as TextComponent,
  IChartProps,
  IAxisProps,
  ISeriesProps,
  ITextProps,
  createCamelProps,
} from "@mozart-ui/common-ui";

interface IChartPropsDetail extends IChartProps {
  children?: React.ReactNode | React.ReactNode[];
}

const Chart: React.FC<IChartPropsDetail> = props => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const axises: AxisComponent[] = [];
    const serieses: SeriesComponent[] = [];
    const pies: SeriesComponent[] = [];
    const texts: TextComponent[] = [];
    if (props.children) {
      const children: React.ReactNode[] = [];
      if (Array.isArray(props.children)) {
        children.push(...props.children);
      } else {
        children.push(props.children);
      }
      children.forEach((child: any) => {
        if (child.type.name === "Axis") {
          axises.push(new AxisComponent(createCamelProps<IAxisProps>(child.props)));
        } else if (child.type.name === "Series") {
          if (child.props.type === "pie") {
            pies.push(new SeriesComponent(createCamelProps<ISeriesProps>(child.props)));
          } else {
            serieses.push(new SeriesComponent(createCamelProps<ISeriesProps>(child.props)));
          }
        } else if (child.type.name === "Text") {
          texts.push(new TextComponent(createCamelProps<ITextProps>(child.props)));
        }
      });
    }
    const chart = new ChartComponent({
      parents: chartRef.current as unknown as HTMLElement,
      ...createCamelProps<IChartProps>(props),
      axises,
      serieses,
      pies,
      texts,
    });
    chart.render();

    return () => {
      chart.dispose();
    };
  });
  return (
    <>
      <div className="moz-chart-root" ref={chartRef}></div>
    </>
  );
};

export default Chart;
