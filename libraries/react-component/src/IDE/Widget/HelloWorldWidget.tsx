import * as React from "react";

interface IHelloWorldWidget {
  data: Record<string, any>;
}

const HelloWorldWidget: React.FC<IHelloWorldWidget> = props => {
  return <div>Hello World! {props.data.no}</div>;
};

export default HelloWorldWidget;
