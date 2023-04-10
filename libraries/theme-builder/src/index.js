const commandLineArgs = require("command-line-args");
const fs = require("fs");
const themeBuilder = require("devextreme-themebuilder/modules/builder");

async function main() {
  const args = commandLineArgs([
    { name: "path", alias: "p", type: String },
    { name: "out", alias: "o", type: String },
  ]);
  const config = fs.readFileSync(args.path, { encoding: "utf8" });
  const result = await themeBuilder.buildTheme(JSON.parse(config));
  let content = result.css;
  if (result.swatchSelector) {
    console.log(
      `Add the '${result.swatchSelector}' class to the container to apply swatch styles to its nested elements.`,
    );
  }
  if (result.unusedWidgets && result.unusedWidgets.length) {
    console.log(
      "Styles for the following widgets were not included in the resulting theme because these widgets don't use CSS styles:\n",
    );
    result.unusedWidgets.forEach((w) => console.log(`${w}\n`));
  }
  fs.writeFile(args.out, content, "utf8", (error) => {
    if (error) {
      console.log(`Unable to write the ${args.out} file. ${error.message}`);
    } else {
      console.log(`The result was written to the ${args.out} file.`);
    }
  });
}

main();
