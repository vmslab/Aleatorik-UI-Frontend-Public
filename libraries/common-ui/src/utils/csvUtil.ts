import * as d3 from "d3";

export const parseCsv = (
  source: string,
  parser: (d: Record<string, any>) => Record<string, any>,
): Array<Record<string, any>> => {
  return d3.csvParse(source, parser);
};
