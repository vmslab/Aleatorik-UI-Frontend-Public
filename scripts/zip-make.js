const path = require("path");
const options = require("./config/zip-make.config");
const { execSync, spawnSync } = require("child_process");
const { copyFolderRecursiveSync } = require("./utils/copy");
const fs = require("fs");
const AdmZip = require("adm-zip");

const cleanOutputDirectory = true;
const cleanBuildDirectory = true;
const build = true;
const zip = true;

function dotnetBuild(pathString, framework = "") {
  console.log(
    `dotnet build ${pathString} -c ${options.mode} ${framework ? "--framework " + framework : ""}`,
  );
  execSync(
    `dotnet build ${pathString} -c ${options.mode} ${framework ? "--framework " + framework : ""}`,
    (err, out, stderr) => {
      console.log(err);
    },
  );
}

function runChild(command) {
  spawnSync("powershell.exe", [command]);
}

function convertPath(pathString, os) {
  if (os.startsWith("win")) return pathString;

  const convertedPath = pathString.replace(/[:\\/]+/g, "/");
  return path.join("/mnt", convertedPath);
}

function createZipFile(filePath, os) {
  if (!fs.lstatSync(convertPath(path.join(options.outputDirectory, filePath), os)).isDirectory())
    return;

  const zip = new AdmZip();
  const targetFile = convertPath(path.join(options.outputDirectory, filePath), os);
  zip.addLocalFolder(targetFile);
  zip.writeZip(convertPath(path.join(options.zipDirectory, `${filePath}.zip`), os));
}

function main(os) {
  console.log(`====== Start Make Zip... ${os} ======`);

  if (cleanOutputDirectory) {
    console.log("====== Clean Output Directory ======");
    const dirs = fs.readdirSync(convertPath(options.outputDirectory, os));
    if (dirs.length > 0) {
      console.log(dirs);

      dirs.forEach(dir => {
        console.log(`remove ${convertPath(path.join(options.outputDirectory, dir), os)}...`);
        if (fs.lstatSync(convertPath(path.join(options.outputDirectory, dir), os)).isDirectory()) {
          fs.rmSync(convertPath(path.join(options.outputDirectory, dir), os), {
            recursive: true,
          });
        } else {
          fs.rmSync(convertPath(path.join(options.outputDirectory, dir), os));
        }
      });
    }
  }

  if (cleanBuildDirectory) {
    console.log("====== Clean Build Directory ======");
    options.built.forEach(dir => {
      if (fs.existsSync(convertPath(path.join(options.workingDirectory, dir), os))) {
        fs.rmSync(convertPath(path.join(options.workingDirectory, dir), os), {
          recursive: true,
        });
      }
    });
  }

  if (build) {
    console.log(`====== Start Build ======`);
    // 1. 각 필요 폴더 빌드
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.enterprise), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.dataActions), os),
    );
    dotnetBuild(convertPath(path.join(options.workingDirectory, options.build.mzssvr.access), os));
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.services), os),
    );
    dotnetBuild(
      convertPath(
        path.join(options.workingDirectory, options.build.mzssvr.serializationBinary),
        os,
      ),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.processHostring), os),
    );
    dotnetBuild(convertPath(path.join(options.workingDirectory, options.build.mzssvr.server), os));
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.jobIntegration), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.framework), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.analyzer), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.mzssvr.modelReader), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.domain.legacyBridge), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.domain.processHostingApp), os),
    );
    dotnetBuild(
      convertPath(path.join(options.workingDirectory, options.build.domain.net472), os),
      "net472",
    );
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.bcp));
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.general));
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.lcd));
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.semiBe));
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.semicon));
    // dotnetBuild(path.join(options.workingDirectory, options.build.domain.semiEds));
  }

  // mode가 Debug면 더이상 진행하지 않음
  if (options.mode === "Debug") return;

  //// mmc build
  console.log("build mmc");
  runChild("pnpm --filter mozart-management-console build:proto");
  runChild("pnpm --filter mozart-management-console build");

  // 2. 각 요소별로 파일 모으기
  console.log("collect files");
  const delimiter = os === "win" ? "\\" : "/";

  const moveTargets = options.move.concat(os === "win" ? options.win.move : options.linux.move);

  moveTargets.forEach(set => {
    console.log(`====== Move Files ${set.from} => ${set.to} ======`);

    if (set.fromCondition) {
      set.fromCondition.forEach(filePath => {
        const from = convertPath(path.join(options.workingDirectory, set.from, filePath), os);
        const to = convertPath(path.join(options.outputDirectory, set.to, filePath), os);

        if (!fs.existsSync(to.substring(0, to.lastIndexOf(delimiter)))) {
          fs.mkdirSync(to.substring(0, to.lastIndexOf(delimiter)), { recursive: true });
        }
        fs.copyFile(from, to, err => {
          if (err) console.log(err);
        });
      });
    } else {
      let from = set.from;
      const to = convertPath(path.join(options.outputDirectory, set.to), os);

      if (set.from.indexOf(":") < 0) {
        from = convertPath(path.join(options.workingDirectory, set.from), os);
      } else {
        from = convertPath(set.from, os);
      }
      if (set.os) from = path.join(from, os);

      copyFolderRecursiveSync(from, to, null, set.except, os === "linux" ? delimiter : null);
    }
  });

  if (zip) {
    // 3. 압축
    fs.readdir(convertPath(options.outputDirectory, os), (err, files) => {
      files.forEach(filePath => {
        console.log("압축", filePath);
        createZipFile(filePath, os);
      });
    });
  }
}

main(process.argv[2]);
