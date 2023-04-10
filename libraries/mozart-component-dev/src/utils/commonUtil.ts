import { get } from "lodash";
import { IComboParams, IComboItem } from "../store/modules/baseStore";

export const getCboItems = async <T>(items: T[], params: IComboParams): Promise<IComboItem[]> => {
  const citems: IComboItem[] = [];

  let witems: T[];

  if (params.whereprop) {
    witems = items.filter((item: T) => {
      const wv = get(item, params.whereprop!)!;
      return wv === params.wherevalue;
    });
  } else {
    witems = items;
  }

  if (params.optional) {
    citems.push({
      value: "",
      text: "",
    });
  }

  for (const item of witems) {
    const value = get(item, params.propkey!)!;
    const text = params.propname ? get(item, params.propname!) : null;

    const fci = citems.find((ci: IComboItem) => ci.value === value);

    if (!fci) {
      citems.push({
        value,
        text: text ? text : value,
      });
    }
  }

  return citems;
};
