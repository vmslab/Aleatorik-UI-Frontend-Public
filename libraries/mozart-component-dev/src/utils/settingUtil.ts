/* eslint-disable id-blacklist */
const options = [
  "filterValue",
  "filterValues",
  "fixed",
  "width",
  "sortOrder",
  "visibleIndex",
  "visible",
  "groupIndex",
];

export const makeParams = (grid: any) => {
  const params: any = {};

  options.forEach((o: string) => {
    const values: any[] = [];
    grid.option("columns").forEach((c: any) => {
      const field = c.dataField;
      const value = grid.columnOption(field, o);
      // eslint-disable-next-line prettier/prettier
      if(value !== undefined){
        values.push({ field, value });
      }
    });
    if (values.length > 0) {
      params[o] = values;
    }
  });

  return params;
};

export const setParams = (grid: any, params: any) => {
  options.forEach((o: any) => {
    const option = params[o];
    if (!option) {
      return;
    }
    if (o === "visibleIndex") {
      option.sort((a: any, b: any) => {
        return a.value - b.value;
      });
    }
    option.forEach((v: any) => {
      grid.columnOption(v.field, o, v.value);
    });
  });
};
