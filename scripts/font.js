const fontagon = require("fontagon");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const { copyFolderRecursiveSync } = require("./utils/copy");
const options = require("./config/font.config");

const createHTML = opts => {
  const fontName = opts.fontName;
  let html = "<!DOCTYPE html>";
  html += '<html lang="ko">';
  html += "<head>";
  html += `<link rel="stylesheet" type="text/css" href="${fontName}.css" />`;
  html += "<style>";
  html += "body {";
  html += "display: flex;";
  html += "justify-content: center;";
  html += "}";
  html += ".panel {";
  html += "min-width: 600px;";
  html += "max-width: 1500px;";
  html += "margin-top: 50px;";
  html += "}";
  html += ".frame {";
  html += "width: 150px;";
  html += "float: left;";
  html += "margin: 10px 30px;";
  html += "}";
  html += ".icon {";
  html += "display: flex;";
  html += "justify-content: center;";
  html += "align-items: center;";
  html += "font-size: 40px;";
  html += "height: 50px;";
  html += "}";
  html += ".name {";
  html += "display: flex;";
  html += "justify-content: center;";
  html += "align-items: center;";
  html += "font-size: 14px;";
  html += "text-overflow: ellipsis;";
  html += "white-space: nowrap;";
  html += "word-wrap: normal;";
  html += "}";
  html += ".content {";
  html += "display: flex;";
  html += "justify-content: center;";
  html += "align-items: center;";
  html += "font-size: 14px;";
  html += "}";
  html += "</style>";
  html += "</head>";
  html += "<body>";
  html += "<div class='panel'>";
  opts.names.forEach(name => {
    html += `<div class="frame" title="${name}">`;
    html += `<div class="icon ${fontName} ${opts.classOptions.classPrefix}-${name}"></div>`;
    html += `<div class="content">\\${(+opts.codepoints[name]).toString(16)}</div>`;
    html += `<div class="name">${opts.classOptions.classPrefix}-${name}</div>`;
    html += "</div>";
  });
  html += "</div>";
  html += "</body>";
  html += "</html>";
  return html;
};

const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

async function main() {
  const opts = await fontagon({
    files: [`${options.svgDir}/*.svg`],
    dist: options.distDir,
    fontName: options.name,
    style: "all",
    classOptions: {
      baseClass: options.name,
      classPrefix: options.prefix,
    },
    startCodepoint: 0xe101,
  });
  if (!opts) {
    console.log("failed! ");
    return;
  }
  const rootDir = path.resolve(__dirname, "..");
  const outputDir = path.join(rootDir, options.distDir);
  const dxFontDir = path.join(rootDir, options.dxFontDir);
  const defaultFontDir = path.join(rootDir, options.defaultFontDir);
  const fontName = opts.fontName;
  const distFirst = options.distInfo.first;
  const distSecond = options.distInfo.second;
  options.copyInfos.forEach(info => {
    const projDir = path.join(rootDir, info.dir, info.project);
    const projName = info.project;
    const distDir = path.join(projDir, distFirst, distSecond);

    // copy icon font files
    if (fs.existsSync(distDir)) {
      rimraf.sync(distDir);
    }
    copyFolderRecursiveSync(outputDir, distDir);

    // create html & modify sass
    const htmlPath = path.join(distDir, `${fontName}.html`);
    const sassPath = path.join(distDir, `${fontName}.sass`);
    const urlPrefix = info.monorepo
      ? info.monorepo === "internal"
        ? `/${distFirst}/${distSecond}/`
        : `~@${info.monorepo}/${projName}/${distFirst}/${distSecond}/`
      : `~${projName}/${distFirst}/${distSecond}/`;
    const sass = fs.readFileSync(sassPath, { encoding: "utf8", flag: "r" });
    let newSass = replaceAll(sass, `url("${fontName}`, `url("${urlPrefix}${fontName}`);
    newSass = replaceAll(newSass, `font-family: "${fontName}"`, `font-family: "${fontName}"\n  font-display: swap`);
    newSass = replaceAll(newSass, "ontent: $value", "ontent: unicode($value)");
    newSass = newSass.replace(/"\\([0-9a-z]+)"/g, '"$1"');
    newSass = `@function unicode($str)\n  @return unquote("\\"")+unquote(str-insert($str, "\\\\", 1))+unquote("\\"")\n\n${newSass}`;
    fs.writeFileSync(sassPath, newSass, { encoding: "utf8", flag: "w" });
    fs.writeFileSync(htmlPath, createHTML(opts));

    // copy dx icon font files
    const dxDistDir = path.join(projDir, distFirst, options.distInfo.dx);

    if (fs.existsSync(dxDistDir)) {
      rimraf.sync(dxDistDir);
    }
    copyFolderRecursiveSync(dxFontDir, dxDistDir);

    // copy default font files
    const defaultDistDir = path.join(projDir, distFirst, options.distInfo.default);

    if (fs.existsSync(defaultDistDir)) {
      rimraf.sync(defaultDistDir);
    }
    copyFolderRecursiveSync(defaultFontDir, defaultDistDir);
  });

  // remove output
  rimraf.sync(outputDir);

  console.log("done!");
}

main();
