const path = require("path");
const fs = require("fs");
const commandLineArgs = require("command-line-args");
const rimraf = require("rimraf");
const spawn = require("child_process").spawn;
const { copyFileSync } = require("./utils/copy");
const colors = require("./utils/colors");
const options = require("./config/style.config");

function createStyle(meta, out) {
  return new Promise(resolve => {
    console.log();
    console.log(
      `========== ${colors.FgYellow}Start Create Style : ${path.parse(meta).name} ${
        colors.Reset
      }==========`,
    );
    console.log();

    const runBuilder = () => {
      switch (process.platform) {
        case "win32":
          return spawn("powershell.exe", [
            `${path.resolve(options.distDir, `${options.workspace}-win.exe`)} -p ${meta} -o ${out}`,
          ]);
        case "darwin":
          return spawn("bash", [
            "-c",
            `${path.resolve(options.distDir, `${options.workspace}-macos`)} -p ${meta} -o ${out}`,
          ]);
        case "linux":
          return spawn("bash", [
            "-c",
            `${path.resolve(options.distDir, `${options.workspace}-linux`)} -p ${meta} -o ${out}`,
          ]);
        default:
          return null;
      }
    };

    const child = runBuilder();

    if (!child) return;

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", function (data) {
      if (data.trim().toLowerCase().startsWith("error")) {
        console.log(colors.FgRed);
        console.error(data);
        console.log(colors.Reset);
        process.exitCode = 1;
      } else {
        console.log(data);
      }
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", function (data) {
      if (data.trim().toLowerCase().startsWith("error")) {
        console.log(colors.FgRed);
        console.error(data);
        console.log(colors.Reset);
        process.exitCode = 1;
      } else {
        console.log(data);
      }
    });

    child.on("close", function (code) {
      if (code !== 0) {
        resolve(false);
      } else {
        options.outDirs.forEach(dir => {
          copyFileSync(out, path.resolve(dir, path.parse(out).base));
        });
        resolve(true);
      }
    });
  });
}

function main() {
  const args = commandLineArgs([]);

  console.log();
  console.log(`========== ${colors.FgYellow}Start Build Theme Builder ${colors.Reset}==========`);
  console.log();

  rimraf.sync(path.join(options.distDir));
  options.outDirs.forEach(dir => {
    rimraf.sync(path.join(dir, "*.css"));
  });

  const buildBuilder = () => {
    switch (process.platform) {
      case "win32":
        return spawn("powershell.exe", [`pnpm --filter ${options.workspace} build`]);
      default:
        return spawn("bash", ["-c", `pnpm --filter ${options.workspace} build`]);
    }
  };

  const child = buildBuilder();

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data) {
    if (data.trim().toLowerCase().startsWith("error")) {
      console.log(colors.FgRed);
      console.error(data);
      console.log(colors.Reset);
      process.exitCode = 1;
    } else {
      console.log(data);
    }
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", function (data) {
    if (data.trim().toLowerCase().startsWith("error")) {
      console.log(colors.FgRed);
      console.error(data);
      console.log(colors.Reset);
      process.exitCode = 1;
    } else {
      console.log(data);
    }
  });

  child.on("close", function (code) {
    if (code !== 0) return;
    // copy icon
    const iconEntries = fs.readdirSync(options.iconDir);
    iconEntries.forEach(entry => {
      options.outDirs.forEach(dir => {
        copyFileSync(path.resolve(options.iconDir, entry), path.resolve(dir, "icons", entry));
      });
    });

    // create style & copy
    const metaEntries = fs.readdirSync(options.metaDir);
    metaEntries.forEach(async entry => {
      await createStyle(
        path.resolve(options.metaDir, entry),
        path.resolve(options.distDir, `${path.parse(entry).name.toLowerCase()}.css`),
      );
    });
  });
}

main();
