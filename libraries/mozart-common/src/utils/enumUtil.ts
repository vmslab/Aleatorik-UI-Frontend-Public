export const enumToArray = (enumType: any) => {
  return Object.keys(enumType)
    .filter((value: string) => isNaN(+value) === false)
    .map(key => enumType[key]);
};
