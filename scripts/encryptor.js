const crypt = require("./utils/crypt");
const commandLineArgs = require("command-line-args");

function main() {
  const args = commandLineArgs([{ name: "word", alias: "w", type: String }]);
  console.log(crypt.encrypt(args.word));
}

main();
