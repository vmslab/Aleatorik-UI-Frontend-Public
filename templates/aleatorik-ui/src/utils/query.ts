import { GetTableRemote, GetTableOption } from "@/api/mainService";

export const getSummaryQty = async (
  tableName: string,
  filter: any[],
  column: string,
): Promise<number> => {
  const result = await GetTableOption(tableName, {
    isSummaryQuery: true,
    filter,
    groupSummary: [
      {
        selector: column,
        summaryType: "sum",
      },
    ],
  });
  if (result && result.data) {
    const datas = JSON.parse(result.data);
    if (datas.length > 0) {
      const data = datas[0];
      return data[`sum_${column}`];
    }
  }
  return 0;
};

export const getGroupQuery = async (
  tableName: string,
  filter: any[],
  groupSummary: any[],
): Promise<Record<string, any> | null> => {
  const result = await GetTableOption(tableName, {
    isSummaryQuery: true,
    filter,
    groupSummary,
  });
  if (result && result.data) {
    const datas = JSON.parse(result.data);
    if (datas.length > 0) {
      return datas[0];
    }
  }
  return null;
};
