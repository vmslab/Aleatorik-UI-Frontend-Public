export const getFileSizeToFormat = (size: number): string => {
  const reg = /(^[+-]?\d+)(\d{3})/;
  let formatString: string = String(Math.ceil(size / 1024));

  while (reg.test(formatString)) {
    formatString = formatString.replace(reg, "$1" + "," + "$2");
  }

  return `${formatString}KB`;
};
