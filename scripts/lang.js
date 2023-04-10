const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const { parse } = require("csv-parse");
const options = require("./config/lang.config");
const { distPath } = require("./config/lang.config");

function main() {
  const langPath = path.join(process.cwd(), "scripts", "lang", "lang.csv");
  const data = [];
  const resources = {};
  fs.createReadStream(langPath)
    .pipe(
      parse({
        delimiter: ",",
        columns: true,
        ltrim: true,
      }),
    )
    .on("data", function (row) {
      data.push(row);
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {
      rimraf.sync(path.join(options.distPath));
      data.forEach(d => {
        let key = "";
        Object.keys(d).forEach(k => {
          if (k === "key") {
            key = d[k];
          } else {
            let resource = resources[k];
            if (!resource) {
              resource = {
                translation: {},
              };
              resources[k] = resource;
            }
            resource.translation[key] = d[k];
          }
        });
      });
      fs.writeFileSync(distPath, JSON.stringify(resources), { encoding: "utf8", flag: "w" });
      console.log(resources);
    });
}

main();
