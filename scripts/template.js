const path = require("path");
const glob = require("fast-glob");
const fs = require("fs");
const rimraf = require("rimraf");
const { copyFileSync, copyFolderRecursiveSync } = require("./utils/copy");
const colors = require("./utils/colors");
const options = require("./config/template.config");

function main() {
  try {
    const srcPath = process.cwd();
    const distPath = path.join(process.cwd(), options.distDir);

    console.log();
    console.log(`========== ${colors.FgYellow}Start Deploy ${colors.Reset}==========`);
    console.log();

    console.log(`${colors.Reset}Source Folder (src) : ${colors.FgBlue}${srcPath}`);
    console.log(`${colors.Reset}Destination Folder (dist) : ${colors.FgBlue}${distPath}`);

    console.log(colors.Reset);

    rimraf.sync(distPath);

    console.log(`${colors.Reset}removed : ${colors.FgYellow}${distPath}`);

    fs.mkdirSync(distPath);

    console.log(`${colors.Reset}created : ${colors.FgCyan}${distPath}`);

    console.log(colors.Reset);

    const srcRootEntries = fs.readdirSync(srcPath);
    srcRootEntries
      .filter(entry => !options.root.excludes.includes(entry))
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

    options.packages.paths.forEach(pkgPath => {
      const srcPackagesPath = path.join(srcPath, pkgPath);
      const distPackagesPath = path.join(distPath, pkgPath);
      const srcPackagesEntries = fs.readdirSync(srcPackagesPath);
      srcPackagesEntries
        .filter(entry => options.packages.includes.includes(entry))
        .forEach(entry => {
          const srcPackageFullPath = path.join(srcPackagesPath, entry);
          const distPackageFullPath = path.join(distPackagesPath, entry);
          const packageEntries = fs.readdirSync(srcPackageFullPath);
          packageEntries
            .filter(pentry => !options.packages.excludes.includes(pentry))
            .forEach(pentry => {
              const srcFullPath = path.join(srcPackageFullPath, pentry);
              const distFullPath = path.join(distPackageFullPath, pentry);
              const stats = fs.lstatSync(srcFullPath);
              if (stats.isDirectory()) {
                copyFolderRecursiveSync(srcFullPath, distFullPath);
              }
              if (stats.isFile()) {
                copyFileSync(srcFullPath, distFullPath);
              }
              console.log(
                `${colors.Reset}copied : ${colors.FgGreen}src/${pentry} -> dist/${pentry}`,
              );
            });
        });
    });

    console.log(colors.Reset);
  } catch (error) {
    console.log(colors.FgRed);
    console.error(error);
    console.log(colors.Reset);
    process.exitCode = 1;
  }
}

main();
