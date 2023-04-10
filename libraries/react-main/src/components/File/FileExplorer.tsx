import * as React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { FileParameter } from "@aleatorik-ui/common";
import { generateGUID } from "@aleatorik-ui/common-ui";
import { CopyTo, CreateDirectory, DeleteItem, GetFileInfos, MoveTo, RenameItem } from "@aleatorik-ui/common-api";
import FileManager, { Permissions, Notifications } from "devextreme-react/file-manager";
import { getServerDelimiter, fileProgressState } from "../../stores/devStore";
import { createProviderConfig } from "../../utils/fileProvider";
import FileProgressDialog from "../File/FileProgressDialog";

interface IFileExplorerProps {
  basePath: string;
  height?: number | string | (() => number | string);
  width?: number | string | (() => number | string);
}

const FileExplorer: React.FC<IFileExplorerProps> = props => {
  const fileRef = React.useRef(null);

  const delimiter = useRecoilValue(getServerDelimiter);
  const setFileProgressState = useSetRecoilState(fileProgressState);

  let files: FileParameter[] = [];
  let fileCount: number = 0;

  const provider = createProviderConfig({
    getItems: pathInfo => {
      return new Promise(async resolve => {
        if (!pathInfo.name) {
          const result = await GetFileInfos({ path: props.basePath });
          if (result && result.data) {
            resolve(result.data.result);
          }
        } else {
          const result = await GetFileInfos({ path: pathInfo.key });
          if (result && result.data) {
            resolve(result.data.result);
          }
        }
        resolve([]);
      });
    },
    createDirectory: (parentDirectory, name) => {
      return new Promise(async resolve => {
        if (!parentDirectory.key) {
          const result = await CreateDirectory({ path: props.basePath, name });
          resolve(result?.data?.success);
        } else {
          const result = await CreateDirectory({ path: parentDirectory.key, name });
          resolve(result?.data?.success);
        }
        resolve(false);
      });
    },
    deleteItem: item => {
      return new Promise(async resolve => {
        const result = await DeleteItem({
          key: item.key,
          name: item.name,
          isDirectory: item.isDirectory,
        });
        resolve(result?.data?.success);
      });
    },
    copyItem: (item, destinationDirectory) => {
      return new Promise(async resolve => {
        const result = await CopyTo({
          source: { key: item.key, name: item.name, isDirectory: item.isDirectory },
          destination: {
            key: destinationDirectory.key,
            name: destinationDirectory.name,
            isDirectory: destinationDirectory.isDirectory,
          },
        });
        resolve(result?.data?.success);
      });
    },
    moveItem: (item, destinationDirectory) => {
      return new Promise(async resolve => {
        const result = await MoveTo({
          source: { key: item.key, name: item.name, isDirectory: item.isDirectory },
          destination: {
            key: destinationDirectory.key,
            name: destinationDirectory.name,
            isDirectory: destinationDirectory.isDirectory,
          },
        });
        resolve(result?.data?.success);
      });
    },
    renameItem: (item, name) => {
      return new Promise(async resolve => {
        const result = await RenameItem({
          info: { key: item.key, name: item.name, isDirectory: item.isDirectory },
          name,
        });
        resolve(result?.data?.success);
      });
    },
    downloadItems: items => {
      setFileProgressState({
        open: true,
        mode: "Download",
        files: items.map(item => {
          const param = new FileParameter("Download", generateGUID());
          param.name = item.key;
          param.path = item.key;
          param.size = item.size;
          return param;
        }),
      });
    },
    uploadFileChunk: (fileData, chunkInfo, destinationDir) => {
      return new Promise(resolve => {
        const path = `${destinationDir.key || props.basePath}${delimiter}${fileData.name}`;
        if (files.some(x => x.path === path)) {
          resolve(false);
          return;
        }
        const param = new FileParameter("Upload", generateGUID());
        param.name = path;
        param.path = path;
        param.size = fileData.size;
        param.file = fileData;
        files.push(param);
        resolve(true);
      });
    },
  });

  const onFileUploaded = (evt: any) => {
    console.log(files, fileCount);
    if (files.length > ++fileCount) return;
    setFileProgressState({
      open: true,
      mode: "Upload",
      files: [...files],
    });
    files = [];
    fileCount = 0;
  };

  const onComplete = (mode: string) => {
    if (mode === "Upload") {
      if (!fileRef || !fileRef.current) return;
      (fileRef.current as any)?.instance?.refresh();
    }
  };

  return (
    <>
      <FileManager
        ref={fileRef}
        height={props.height}
        width={props.width}
        fileSystemProvider={provider}
        onFileUploaded={onFileUploaded}
      >
        <Permissions create={true} copy={true} move={true} delete={true} rename={true} upload={true} download={true} />
        <Notifications showPanel={false} showPopup={false} />
      </FileManager>
      <FileProgressDialog complete={onComplete} />
    </>
  );
};

export default React.memo(FileExplorer);
