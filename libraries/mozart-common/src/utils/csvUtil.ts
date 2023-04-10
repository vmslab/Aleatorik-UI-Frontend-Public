import * as d3 from "d3";

export const parseCsv = (source: string, parser: (d: Record<string, any>) => object): any[] => {
  return d3.csvParse(source, parser);
};
