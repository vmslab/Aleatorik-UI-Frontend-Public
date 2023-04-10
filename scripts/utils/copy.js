const path = require("path");
const fs = require("fs");

const getDirIfEmptyMkdir = (targetDir, base) => {
  const sep = path.sep;
  const baseDir = base || ".";

  return targetDir
    .split(sep)
    .filter(x => x !== baseDir)
    .reduce((parentDir, childDir) => {
      const curDir = path.join(baseDir, parentDir, childDir);
      try {
        if (!fs.existsSync(curDir)) {
          fs.mkdirSync(curDir);
        }
      } catch (err) {
        if (err.code === "EEXIST") {
          // curDir already exists!
          return curDir;
        }
        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === "ENOENT") {
          // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }
        const caughtErr = ["EACCES", "EPERM", "EISDIR"].includes(err.code);
        if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
          throw err; // Throw if it's just the last created dir.
        }
      }
      return curDir;
    }, "");
};

const copyFileSync = (source, target, base) => {
  getDirIfEmptyMkdir(path.dirname(target), base);
  let targetFile = target;
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

const copyFolderRecursiveSync = (source, target, parent, except, base) => {
  if (parent) {
    target = path.join(target, parent);
  }
  const targetFolder = getDirIfEmptyMkdir(target, base);
  if (fs.lstatSync(source).isDirectory()) {
    const entries = fs.readdirSync(source);
    entries.forEach(entry => {
      const curSource = path.join(source, entry);
      if (except && except.includes(entry)) return;
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, entry, except, base);
      } else {
        copyFileSync(curSource, path.join(targetFolder, entry), base);
      }
    });
  }
};

module.exports = {
  copyFileSync,
  getDirIfEmptyMkdir,
  copyFolderRecursiveSync,
};
