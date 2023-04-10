import { get } from "lodash";
import { parseCsv, INode, IEdge, ICluster } from "mozart-common";

const chartCsv: string = `Demand,AVG,MAX,MIN,TARGET,UNSATIS,SATIS,TOTAL
6,121.875,183.333,41.666,100,0,8,8
7,257.291,450,35.666,45.8333333333333,13,11,24
8,391.041,716.666,50.666,27.5,29,11,40
9,524.553,983.333,33,19.6428571428571,45,11,56
10,657.986,1250,25.666,15.2777777777778,61,11,72
11,791.382,1516.666,15.666,12.5,77,11,88
12,924.759,1783.333,0,10.5769230769231,93,11,104
15,1058.125,2050,1000,9.16666666666667,109,11,120`;

export const chartDatas = parseCsv(chartCsv, d => {
  const item: any = {
    x: get(d, "Demand"),
    AVG: 0,
    MAX: 0,
    MIN: 0,
  };
  item.AVG = get(d, "AVG");
  item.MAX = get(d, "MAX");
  item.MIN = get(d, "MIN");
  return item;
});

export const chartDatas2 = parseCsv(chartCsv, d => {
  const item: any = {
    x: "Demand",
  };
  item.AVG = get(d, "AVG");
  item.MAX = get(d, "MAX");
  item.MIN = get(d, "MIN");
  return item;
});

export const chartDatas3 = parseCsv(chartCsv, d => {
  const num = +get(d, "Demand") || 0;
  const item: any = {
    x: num % 2 === 1 ? "Odd" : "Even",
  };
  item.AVG = get(d, "AVG");
  item.MAX = get(d, "MAX");
  item.MIN = get(d, "MIN");
  return item;
});

export const chartDatas4 = (() => {
  const result: any[] = [];
  const types = ["AVG", "MAX", "MIN"];
  types.forEach(type => {
    result.push(
      ...parseCsv(chartCsv, d => {
        return {
          x: type,
          demand: get(d, type),
        };
      }),
    );
  });
  return result;
})();

export const flowNodes = (() => {
  const clusters: ICluster[] = [
    {
      key: "K101",
      text: "K101",
      clusterLabelPos: "top",
      tooltip: "K101",
    },
    {
      key: "K201",
      text: "K201",
      clusterLabelPos: "top",
      tooltip: "K201",
    },
    {
      key: "K202",
      text: "K202",
      clusterLabelPos: "top",
      tooltip: "K202",
    },
  ];

  const nodes: INode[] = [
    {
      key: "K101-ASSEMBLY",
      text: "ASSEMBLY",
      cluster: clusters[0],
      tooltip: "K101-ASSEMBLY",
    },
    {
      key: "K201-GASKET_ATTACH",
      text: "GASKET_ATTACH",
      cluster: clusters[1],
      tooltip: "K201-GASKET_ATTACH",
    },
    {
      key: "K201-PAINTING",
      text: "PAINTING",
      cluster: clusters[1],
      tooltip: "K201-PAINTING",
    },
    {
      key: "K201-GRINDING",
      text: "GRINDING",
      cluster: clusters[1],
      tooltip: "K201-GRINDING",
    },
    {
      key: "K201-PRESS",
      text: "PRESS",
      cluster: clusters[1],
      tooltip: "K201-PRESS",
    },
    {
      key: "K202-SEAL_INSERTION",
      text: "SEAL_INSERTION",
      cluster: clusters[2],
      tooltip: "K202-SEAL_INSERTION",
    },
    {
      key: "K202-INJECTION",
      text: "INJECTION",
      cluster: clusters[2],
      tooltip: "K202-INJECTION",
    },
  ];
  return nodes;
})();

export const flowEdges = (() => {
  const edges: IEdge[] = [
    { source: "K201-GASKET_ATTACH", target: "K101-ASSEMBLY" },
    { source: "K201-PAINTING", target: "K201-GASKET_ATTACH" },
    { source: "K201-GRINDING", target: "K201-PAINTING" },
    { source: "K201-PRESS", target: "K201-GRINDING" },
    { source: "K202-SEAL_INSERTION", target: "K101-ASSEMBLY" },
    { source: "K202-INJECTION", target: "K202-SEAL_INSERTION" },
  ];
  return edges;
})();
