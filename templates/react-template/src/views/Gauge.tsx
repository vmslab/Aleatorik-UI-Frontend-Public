import React from "react";
import { IGaugeTooltipParams } from "@mozart-ui/common-ui";
import { Splitter, Gauge, Bar, Arc, Mark } from "@mozart-ui/react-component";

const ChartComponent: React.FC = () => {
  const textPosColorHash: Record<string, any> = {};
  const setToolTip = (params: IGaugeTooltipParams) => {
    return `<div>통과: 20</div>
      <div>실패: 1</div>
      <div>미수행: 0</div>`;
  };
  return (
    <div className="moz-frame-no-control">
      <Splitter>
        <Splitter direction="horizontal">
          <Gauge width={300} height={30} cornerRadius={15}>
            <Bar value={50} name="사용률" />
          </Gauge>
          <Gauge width={300} height={30} colorHash={textPosColorHash}>
            <Bar value={50} name="start" percentText="%" />
          </Gauge>
          <Gauge width={300} height={30} colorHash={textPosColorHash}>
            <Bar value={50} name="middle" labelType="middle" percentText="%" />
          </Gauge>
          <Gauge width={300} height={30} colorHash={textPosColorHash}>
            <Bar value={50} name="end" labelType="end" percentText="%" />
          </Gauge>
          <Gauge width={300} height={30} colorHash={textPosColorHash}>
            <Bar value={50} name="inner" labelType="inner" percentText="%" />
          </Gauge>
          <Gauge width={300} height={30} colorHash={textPosColorHash}>
            <Bar value={50} name="outer" labelType="outer" percentText="%" />
          </Gauge>
          <Gauge width={300} height={30}>
            <Bar value={70} name="target" color="#FDD5D8" labelType="outer" />
            <Bar value={20} name="current" color="#f58991" labelType="outer" animationDelay={1500} />
          </Gauge>
          <Gauge width={300} height={30}>
            <Bar value={80} name="target" color="#d0dbef" labelType="inner" />
            <Bar value={50} name="old" color="#a9bce0" labelType="inner" animationDelay={1500} />
            <Bar value={20} name="new" color="#617db2" labelType="inner" animationDelay={2500} />
          </Gauge>
          <Gauge width={300} height={30}>
            <Bar value={100} name="진행률" />
            <Mark type="tick" />
          </Gauge>
          <Gauge width={300} height={30}>
            <Bar value={50} name="진행률" />
            <Mark value={30} name="최소 목표" dashArray="8, 5" />
            <Mark value={70} name="목표" dashArray="8, 5" />
          </Gauge>
          <Gauge width={300} height={30} setToolTip={setToolTip}>
            <Bar value={70} name="사용률" color="#B7F0D2" endColor="#3eb776" gradient={true} labelType="inner" />
          </Gauge>
          <Gauge width={300} height={30} noDataText="No Data!">
            <Bar value={50} name="사용률" />
          </Gauge>
        </Splitter>
        <Splitter>
          <Splitter direction="horizontal">
            <Gauge width={200} height={200} type="arc" cornerRadius={10}>
              <Arc value={50} name="사용률" />
            </Gauge>
            <Gauge width={200} height={200} type="arc" colorHash={textPosColorHash}>
              <Arc value={50} name="middle" labelType="middle" percentText="%" textSize={20} />
            </Gauge>
            <Gauge width={200} height={200} type="arc" colorHash={textPosColorHash}>
              <Arc value={50} name="inner" labelType="inner" percentText="%" />
            </Gauge>
            <Gauge width={200} height={200} type="arc" colorHash={textPosColorHash}>
              <Arc value={50} name="outer" labelType="outer" percentText="%" />
            </Gauge>
          </Splitter>
          <Splitter direction="horizontal">
            <Gauge width={200} height={200} type="arc">
              <Arc value={70} name="target" color="#FDD5D8" labelType="outer" />
              <Arc value={20} name="current" color="#f58991" labelType="outer" animationDelay={1500} />
            </Gauge>
            <Gauge width={200} height={200} type="arc">
              <Arc value={80} name="target" color="#d0dbef" labelType="inner" />
              <Arc value={50} name="old" color="#a9bce0" labelType="inner" animationDelay={1500} />
              <Arc value={20} name="new" color="#617db2" labelType="inner" animationDelay={2500} />
            </Gauge>
            <Gauge width={200} height={200} type="arc">
              <Arc value={100} name="진행률" />
              <Mark type="tick" />
            </Gauge>
            <Gauge width={200} height={200} type="arc">
              <Arc value={50} name="진행률" />
              <Mark value={30} name="최소 목표" dashArray="8, 5" />
              <Mark value={70} name="목표" dashArray="8, 5" />
            </Gauge>
          </Splitter>
        </Splitter>
        <Splitter>
          <Splitter direction="horizontal">
            <Gauge width={200} height={200} type="arc" cornerRadius={10} setToolTip={setToolTip}>
              <Arc value={70} name="사용률" color="#B7F0D2" endColor="#3eb776" gradient={true} labelType="inner" />
            </Gauge>
            <Gauge width={200} height={200} type="arc" startAngle={-135} endAngle={135}>
              <Arc value={70} name="사용률" color="#f0baec" textSize={20} percentText="%" />
              <Mark type="tick" ticks={10} />
            </Gauge>
            <Gauge width={200} height={200} type="arc" cornerRadius={10} reverse={true}>
              <Arc value={50} name="사용률" />
            </Gauge>
            <Gauge width={200} height={200} type="arc" reverse={true}>
              <Arc value={70} name="target" color="#FDD5D8" labelType="outer" />
              <Arc value={20} name="current" color="#f58991" labelType="outer" animationDelay={1500} />
            </Gauge>
          </Splitter>
          <Splitter direction="horizontal">
            <Gauge width={200} height={100} type="arc" startAngle={-90} endAngle={90} verticalPosition={50}>
              <Arc value={50} name="사용률" textVerticalPosition={-20} />
            </Gauge>
            <Gauge width={200} height={100} type="arc" startAngle={-90} endAngle={90} verticalPosition={50}>
              <Arc value={70} name="사용률" color="#9cc6f0" textVerticalPosition={-20} percentText="%" />
              <Mark type="tick" />
            </Gauge>
          </Splitter>
        </Splitter>
      </Splitter>
    </div>
  );
};

export default ChartComponent;
