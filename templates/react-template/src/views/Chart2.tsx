import React from "react";
import dayjs from "dayjs";
import { IChartData, parseChartCsv, IChartTextParams, IChartTooltipParams } from "@mozart-ui/common-ui";
import { Splitter, Chart, Axis, Series, Text } from "@mozart-ui/react-component";

const Chart2Component: React.FC = () => {
  const csv: string = `Demand,AVG,MAX,MIN,TARGET,UNSATIS,SATIS,TOTAL
6,121.875,183.333,41.666,100,0,8,8
7,257.291,450,35.666,45.8333333333333,13,11,24
8,391.041,716.666,50.666,27.5,29,11,40
9,524.553,983.333,33,19.6428571428571,45,11,56
10,657.986,1250,25.666,15.2777777777778,61,11,72
11,791.382,1516.666,15.666,12.5,77,11,88
12,924.759,1783.333,0,10.5769230769231,93,11,104
15,1058.125,2050,1000,9.16666666666667,109,11,120`;

  const data3 = [
    {
      key: dayjs("2020-02-01").toDate(),
      DATA1: 56,
      DATA2: 124,
    },
    {
      key: dayjs("2020-03-01").toDate(),
      DATA1: 74,
      DATA2: 118,
    },
    {
      key: dayjs("2020-04-01").toDate(),
      DATA1: 68,
      DATA2: 128,
    },
    {
      key: dayjs("2020-05-01").toDate(),
      DATA1: 60,
      DATA2: 120,
    },
    {
      key: dayjs("2020-06-01").toDate(),
      DATA1: 70,
      DATA2: 127,
    },
    {
      key: dayjs("2020-07-01").toDate(),
      DATA1: 65,
      DATA2: 114,
    },
  ];
  const markers = [dayjs("2020-03-15").toDate(), dayjs("2020-05-15").toDate()];

  const data = parseChartCsv(csv, d => {
    const item: IChartData = {
      key: +d.Demand,
    };
    item.AVG = d.AVG;
    item.MAX = d.MAX;
    item.MIN = d.MIN;
    return item;
  });

  const onSetDateLabel = (params: IChartTextParams) => {
    const { value } = params;
    return dayjs(value).format("YY-MM");
  };

  const onSetLineAreaTooltip = (params: IChartTooltipParams) => {
    const { type, key, text, numberFormat } = params;
    if (type === "value" && key === "X") {
      if (text instanceof Date) {
        return dayjs(text).format("YY-MM");
      }
    }
    if (typeof text === "number" && numberFormat) {
      return numberFormat(text);
    }
    return String(text);
  };

  const onSetStackTotal = (params: IChartTextParams) => {
    const { value } = params;
    if (typeof value === "number") {
      return `(${Math.ceil(value)})`;
    }
    return String(value);
  };
  return (
    <div className="moz-frame-no-control">
      <Splitter>
        <Splitter direction="horizontal">
          <Chart data={data} margin={{ top: 60, right: 60, left: 60, bottom: 80 }} showZero={false} isZoom={true}>
            <Axis
              name="X"
              type="key"
              dataType="number"
              direction="horizontal"
              location="bottom"
              showGrid={true}
              outerPadding={0.1}
            ></Axis>
            <Axis name="Y" type="series" dataType="number" direction="vertical" location="left" showGrid={true}></Axis>
            <Series field="MAX" keyAxis="X" seriesAxis="Y" barMaxSize={30}></Series>
            <Series field="AVG" type="area" keyAxis="X" seriesAxis="Y" opacity={0.5} onlySeries={true}></Series>
            <Series field="AVG" type="line" keyAxis="X" seriesAxis="Y"></Series>
            <Series field="MIN" type="area" keyAxis="X" seriesAxis="Y" opacity={0.5} onlySeries={true}></Series>
            <Series field="MIN" type="line" keyAxis="X" seriesAxis="Y"></Series>
            <Text text="Title" location="top" className="moz-text-title"></Text>
            <Text text="Y Title" location="left" angle={270} className="moz-text-axis"></Text>
            <Text type="legend" location="bottom" legendShape="series"></Text>
            <Text text="MIN" type="label" position="start" margin={{ bottom: 4 }}></Text>
            <Text text="AVG" type="label" position="start" margin={{ bottom: 4 }}></Text>
            <Text text="MAX" type="label" position="start" margin={{ top: 4 }}></Text>
          </Chart>
          <Chart
            data={data3}
            margin={{ top: 60, right: 60, left: 60, bottom: 80 }}
            showZero={false}
            isZoom={true}
            setToolTipText={onSetLineAreaTooltip}
          >
            <Axis
              name="X"
              type="key"
              dataType="Date"
              direction="horizontal"
              location="bottom"
              markers={markers}
              setLabel={onSetDateLabel}
              outerPadding={0.05}
            ></Axis>
            <Axis
              name="Y"
              type="series"
              dataType="number"
              direction="vertical"
              location="left"
              showGrid={true}
              fixedMinValue={0}
              outerPadding={0.15}
            ></Axis>
            <Series
              field="DATA1"
              type="area"
              keyAxis="X"
              seriesAxis="Y"
              areaAffectedPrev={true}
              onlySeries={true}
            ></Series>
            <Series field="DATA1" type="line" keyAxis="X" seriesAxis="Y"></Series>
            <Series
              field="DATA2"
              type="area"
              keyAxis="X"
              seriesAxis="Y"
              areaAffectedPrev={true}
              onlySeries={true}
            ></Series>
            <Series field="DATA2" type="line" keyAxis="X" seriesAxis="Y"></Series>
            <Text type="legend" location="bottom" legendShape="series"></Text>
            <Text type="label" position="start" margin={{ bottom: 4 }}></Text>
          </Chart>
        </Splitter>
        <Splitter direction="horizontal">
          <Chart
            data={data}
            margin={{ top: 60, right: 60, left: 60, bottom: 80 }}
            collisionTextPadding={-1}
            collisionTextType="back"
          >
            <Axis name="X" type="key" dataType="number" direction="vertical" location="left" outerPadding={0.1}></Axis>
            <Axis name="Y" type="series-aggregation" dataType="number" direction="horizontal" location="bottom"></Axis>
            <Series field="MIN" type="stack" keyAxis="X" seriesAxis="Y" barMaxSize={22}></Series>
            <Series field="AVG" type="stack" keyAxis="X" seriesAxis="Y" barMaxSize={22}></Series>
            <Series field="MAX" type="stack" keyAxis="X" seriesAxis="Y" barMaxSize={22}></Series>
            <Text type="legend" location="bottom"></Text>
            <Text type="label"></Text>
            <Text
              text="MAX"
              type="total"
              color="var(--color-font4)"
              margin={{ left: 8 }}
              setText={onSetStackTotal}
            ></Text>
          </Chart>
          <Chart data={data} margin={{ top: 60, right: 60, left: 60, bottom: 80 }} isCollisionTextRerender={false}>
            <Axis
              name="X"
              type="key"
              dataType="number"
              direction="horizontal"
              location="bottom"
              showGrid={true}
              outerPadding={0.1}
            ></Axis>
            <Axis name="Y" type="series" dataType="number" direction="vertical" location="left" showGrid={true}></Axis>
            <Series field="MIN" keyAxis="X" seriesAxis="Y" barMaxSize={40}></Series>
            <Series field="AVG" keyAxis="X" seriesAxis="Y" barMaxSize={40}></Series>
            <Series field="MAX" keyAxis="X" seriesAxis="Y" barMaxSize={40}></Series>
            <Text text="Title" location="top" className="moz-text-title"></Text>
            <Text text="Y Title" location="left" angle={270} className="moz-text-axis"></Text>
            <Text type="legend" location="bottom" legendShape="series"></Text>
            <Text type="label" angle={90}></Text>
          </Chart>
        </Splitter>
      </Splitter>
    </div>
  );
};

export default Chart2Component;
