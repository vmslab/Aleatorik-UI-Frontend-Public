import { IView, IModuleFile } from "@/generated/types";

export const getFileSizeToFormat = (size: number): string => {
  const reg = /(^[+-]?\d+)(\d{3})/;
  let formatString: string = String(Math.ceil(size / 1024));

  while (reg.test(formatString)) {
    formatString = formatString.replace(reg, "$1" + "," + "$2");
  }

  return `${formatString}KB`;
};

export const addJsTag = (systemId: string, view: IView, files: IModuleFile[]) => {
  files.forEach((file: IModuleFile, idx: number) => {
    const jsId = `${view.MODULE_ID}-${idx}-js`;
    let jsEl: any = document.getElementById(jsId);
    if (!jsEl) {
      jsEl = document.createElement("script");
      jsEl.id = jsId;
      document.head.appendChild(jsEl);
    }
    jsEl.src = `${process.env.VUE_APP_MODULE_URL}${systemId}/${view.MODULE_ID}/${file.name}`;
  });
};

export const addCssTag = async (systemId: string, view: IView, files: IModuleFile[]) => {
  files.forEach((file: IModuleFile, idx: number) => {
    const cssId = `${view.MODULE_ID}-${idx}-css`;
    let cssEl: any = document.getElementById(cssId);
    if (!cssEl) {
      cssEl = document.createElement("link");
      cssEl.rel = "stylesheet";
      cssEl.id = cssId;
      document.head.appendChild(cssEl);
    }
    cssEl.href = `${process.env.VUE_APP_MODULE_URL}${systemId}/${view.MODULE_ID}/${file.name}`;
  });
};
