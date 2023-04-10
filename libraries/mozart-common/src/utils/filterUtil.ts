import FilterState from "../data/FilterState";
import { IWhereInput } from "../types";

export const convertFilterToWhere = (filters: FilterState[]): IWhereInput[] => {
  return filters.reduce((wheres: IWhereInput[], filter: FilterState) => {
    if (filter.value) {
      wheres.push({
        key: filter.name,
        type: filter.whereType,
        not: false,
        value: {
          type: filter.valueType,
          value: filter.whereValue,
        },
      });
    }
    return wheres;
  }, []);
};
