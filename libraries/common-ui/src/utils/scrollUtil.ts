export const getOptions = (obj: Record<string, any>) => {
  const options = Array.prototype.reduce.call(
    obj,
    ((acc: Record<string, any>, attribute: Record<string, any>) => {
      const option = attribute.name.match(/data-moz-scrollbar-(.+)/);
      if (option) {
        const key = option[1].replace(/\W+(.)/g, (x, chr) => chr.toUpperCase());
        switch (attribute.value) {
          case "true":
            acc[key] = true;
            break;
          case "false":
            acc[key] = false;
            break;
          case undefined:
            acc[key] = true;
            break;
          default:
            acc[key] = attribute.value;
        }
      }
      return acc;
    }) as any,
    {},
  );
  return options;
};
