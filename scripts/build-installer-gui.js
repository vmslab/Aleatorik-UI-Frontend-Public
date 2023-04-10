const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");
const spawn = require("child_process").spawn;
const { copyFolderRecursiveSync } = require("./utils/copy");

function runChild(command, callback) {
  const child = spawn("powershell.exe", [command]);

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
    console.log(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", function (data) {
    console.log(data);
  });

  child.on("close", async function (code) {
    if (code !== 0) return;
    callback();
  });
}

async function main() {
  runChild("pnpm --filter @mozart-ui/installer-ui build", () => {
    const uiDistDir = path.join(__dirname, "..", "apps", "installer-ui", "dist");
    const guiDistDir = path.join(__dirname, "..", "apps", "installer-gui", "dist");
    if (fs.existsSync(guiDistDir)) {
      rimraf.sync(guiDistDir);
    }
    copyFolderRecursiveSync(uiDistDir, guiDistDir);

    runChild("pnpm --filter @mozart-ui/installer-gui pkg", () => {
      console.log("Done!");
    });
  });
}

main();
