import path from "path";
import AdmZip from "adm-zip";
import { chmodFile, getDirIfEmptyMkdir } from "./file";

export const extractZip = (
  zipPath: string,
  targetPath: string,
  exeFile: string,
  init: (count: number) => void,
  step: () => void,
  close: () => void,
) => {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  const allCount = zipEntries.length;

  init(allCount);

  zipEntries.forEach(async element => {
    if (element.isDirectory) {
      getDirIfEmptyMkdir(path.join(targetPath, element.entryName));
    } else {
      zip.extractEntryTo(element.entryName, targetPath, true, true);
      if (process.platform === "linux") {
        if (element.entryName.endsWith(exeFile)) {
          await chmodFile(path.join(targetPath, element.entryName), "+x");
        }
      }
    }
    step();
  });

  close();
};
