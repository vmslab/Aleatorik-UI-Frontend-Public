export function dedent(templ: TemplateStringsArray | string, ...values: unknown[]): string {
  let strings = Array.from(typeof templ === "string" ? [templ] : templ.raw);

  // 1. Remove trailing whitespace.
  strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, "");

  // 2. Find all line breaks to determine the highest common indentation level.
  const indentLengths = strings.reduce((arr, str) => {
    const matches = str.match(/\n([\t ]+|(?!\s).)/g);
    if (matches) {
      return arr.concat(matches.map(match => match.match(/[\t ]/g)?.length ?? 0));
    }
    return arr;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, <number[]>[]);

  // 3. Remove the common indentation from all strings.
  if (indentLengths.length) {
    const pattern = new RegExp(`\n[\t ]{${Math.min(...indentLengths)}}`, "g");

    strings = strings.map(str => str.replace(pattern, "\n"));
  }

  // 4. Remove leading whitespace.
  strings[0] = strings[0].replace(/^\r?\n/, "");

  // 5. Perform interpolation.
  let concatStr = strings[0];

  values.forEach((value, i) => {
    concatStr = `${concatStr}${value}${strings[i + 1]}`;
  });

  return concatStr;
}

export default dedent;
