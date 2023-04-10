import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export const getDirIfEmptyMkdir = (targetDir: string, base?: string) => {
  const sep = path.sep;
  const baseDir = base || ".";

  return targetDir
    .replace(baseDir, "")
    .split(sep)
    .reduce((parentDir, childDir) => {
      const curDir = path.join(baseDir, parentDir, childDir);
      try {
        if (!fs.existsSync(curDir)) {
          fs.mkdirSync(curDir);
        }
      } catch (err: any) {
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

export const copyFileSync = (source: string, target: string) => {
  getDirIfEmptyMkdir(path.dirname(target));
  let targetFile = target;
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

export const copyFolderRecursiveSync = (source: string, target: string, parent: string) => {
  if (parent) {
    target = path.join(target, parent);
  }
  const targetFolder = getDirIfEmptyMkdir(target);
  if (fs.lstatSync(source).isDirectory()) {
    const entries = fs.readdirSync(source);
    entries.forEach(entry => {
      const curSource = path.join(source, entry);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, entry);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};

export const chmodFile = async (file: string, option: string) => {
  return new Promise(resolve => {
    const cp = spawn("chmod", [option, file]);

    cp.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
    });

    cp.stderr.on("data", data => {
      console.error(`stderr: ${data}`);
    });

    cp.on("close", code => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
