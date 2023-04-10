const path = require("path");
const fs = require("fs");
const commandLineArgs = require("command-line-args");
const rimraf = require("rimraf");
const sftpClient = require("ssh2-sftp-client");
const spawn = require("child_process").spawn;
const crypt = require("./utils/crypt");
const { copyFileSync, copyFolderRecursiveSync } = require("./utils/copy");
const colors = require("./utils/colors");
const options = require("./config/framework.config");

function runDeploy(stcDir, distDir, excludes) {
  let result = false;
  try {
    const cwd = process.cwd();
    const srcPath = path.join(cwd, stcDir);
    const distPath = path.join(cwd, distDir);

    console.log();
    console.log(`========== ${colors.FgYellow}Start Deploy ${colors.Reset}==========`);
    console.log();

    console.log(`${colors.Reset}Source Folder (src) : ${colors.FgBlue}${srcPath}`);
    console.log(`${colors.Reset}Destination Folder (dist) : ${colors.FgBlue}${distPath}`);

    console.log();

    const distEntries = fs.readdirSync(distPath);

    distEntries
      .filter(entry => !excludes.includes(entry))
      .forEach(entry => {
        const fullPath = path.join(distPath, entry);
        rimraf.sync(path.join(distPath, entry));
        console.log(`${colors.Reset}removed : ${colors.FgYellow}${fullPath}`);
      });

    console.log();

    const srcEntries = fs.readdirSync(srcPath);
    srcEntries
      .filter(entry => !options.excludes.includes(entry))
      .forEach(entry => {
        const srcFullPath = path.join(srcPath, entry);
        const distFullPath = path.join(distPath, entry);
        const stats = fs.lstatSync(srcFullPath);
        if (stats.isDirectory()) {
          copyFolderRecursiveSync(srcFullPath, distFullPath);
        }
        if (stats.isFile()) {
          copyFileSync(srcFullPath, distFullPath);
        }
        console.log(`${colors.Reset}copied : ${colors.FgGreen}src/${entry} -> dist/${entry}`);
      });

    console.log(colors.Reset);
    result = true;
  } catch (error) {
    console.log(colors.FgRed);
    console.error(error);
    console.log(colors.Reset);
    process.exitCode = 1;
  }
  return result;
}

async function runRemoteDeploy(srcDir, distDir) {
  const sftp = new sftpClient();
  let result = false;

  try {
    const cwd = process.cwd();
    const srcPath = path.join(cwd, srcDir);
    const host = options.remote.host;
    const distPath = distDir;

    console.log();
    console.log(`========== ${colors.FgYellow}Start Remote Deploy ${colors.Reset}==========`);
    console.log();

    console.log(`${colors.Reset}Source Folder (src) : ${colors.FgBlue}${srcPath}`);
    console.log(`${colors.Reset}Destination Host : ${colors.FgBlue}${host}`);
    console.log(`${colors.Reset}Destination Folder (dist) : ${colors.FgBlue}${distPath}`);

    console.log();

    await sftp.connect({
      host,
      username: options.remote.user,
      password: crypt.decrypt(options.remote.pass),
    });

    const distEntries = await sftp.list(distPath);
    await Promise.all(
      distEntries
        .filter(entry => !options.excludes.includes(entry.name))
        .map(async entry => {
          const fullPath = path.join(distPath, entry.name);
          if (entry.type === "d") {
            await sftp.rmdir(fullPath, true);
          } else {
            await sftp.delete(fullPath);
          }
          return console.log(`${colors.Reset}removed : ${colors.FgYellow}${fullPath}`);
        }),
    );

    console.log();

    const srcEntries = fs.readdirSync(srcPath);
    await Promise.all(
      srcEntries
        .filter(entry => !options.excludes.includes(entry))
        .map(async entry => {
          const srcFullPath = path.join(srcPath, entry);
          const distFullPath = path.join(distPath, entry);
          const stats = fs.lstatSync(srcFullPath);
          if (stats.isDirectory()) {
            await sftp.mkdir(distFullPath, true);
            await sftp.uploadDir(srcFullPath, distFullPath);
          }
          if (stats.isFile()) {
            await sftp.fastPut(srcFullPath, distFullPath);
          }
          return console.log(
            `${colors.Reset}copied : ${colors.FgGreen}src/${entry} -> dist/${entry}`,
          );
        }),
    );

    console.log(colors.Reset);
    result = true;
  } catch (error) {
    console.log(colors.FgRed);
    console.error(error);
    console.log(colors.Reset);
    process.exitCode = 1;
  } finally {
    sftp.end();
  }
  return result;
}

async function main() {
  const args = commandLineArgs([{ name: "remote", alias: "r", type: Boolean }]);

  buildThemeBuilder(args.remote);

  const child = spawn("powershell.exe", ["pnpm --filter mozart-ui-framework-dev build"]);

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

  child.on("close", async function (code) {
    if (code !== 0) return;
    if (runDeploy(options.srcDir, options.distDir, options.excludes)) {
      if (options.remote.use && args.remote) {
        await runRemoteDeploy(options.srcDir, options.remote.distDir);
      }
    }
  });
}

function buildThemeBuilder(remote) {
  console.log(`========== ${colors.FgYellow}Start Build theme-builder ${colors.Reset}==========`);
  console.log();
  const theme = spawn("powershell.exe", ["pnpm --filter theme-builder build"]);

  console.log();

  theme.stdout.setEncoding("utf8");
  theme.stdout.on("data", function (data) {
    if (data.trim().toLowerCase().startsWith("error")) {
      console.log(colors.FgRed);
      console.error(data);
      console.log(colors.Reset);
      process.exitCode = 1;
    } else {
      console.log(data);
    }
  });

  theme.stderr.setEncoding("utf8");
  theme.stderr.on("data", function (data) {
    if (data.trim().toLowerCase().startsWith("error")) {
      console.log(colors.FgRed);
      console.error(data);
      console.log(colors.Reset);
      process.exitCode = 1;
    } else {
      console.log(data);
    }
  });

  theme.on("close", async function (code) {
    if (code !== 0) return;
    if (
      runDeploy(
        "apps/theme-builder/dist",
        "../MozartUIStudio/Installer/MozartUIServerInstaller/Resources/UIService/ThemeBuilder",
        ["meta"],
      ) &&
      runDeploy(
        "apps/theme-builder/meta",
        "../MozartUIStudio/Installer/MozartUIServerInstaller/Resources/UIService/ThemeBuilder/meta",
        [],
      )
    ) {
      if (options.remote.use && remote) {
        await runRemoteDeploy("apps/theme-builder/dist", "C:/MozartUIService/ThemeBuilder");
      }
    }
  });
}

main();
