export const parseLink = (
  value: string,
): {
  text: string;
  link: string;
} => {
  const regex = /\[([^\[]+)\]\((.*)\)/;
  const match = regex.exec(value);
  if (match) {
    return {
      text: match[1],
      link: match[2],
    };
  } else {
    return {
      text: value,
      link: value,
    };
  }
};
