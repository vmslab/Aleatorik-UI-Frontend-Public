import * as React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useTranslation } from "react-i18next";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import path from "path-browserify";
import cloneDeep from "lodash/cloneDeep";
import { Popup } from "devextreme-react/popup";
import Button from "devextreme-react/button";
import { fileProgressState, getServerDelimiter } from "../../stores/devStore";
import { FileParameter } from "@aleatorik-ui/common";
import { Upload, Download } from "@aleatorik-ui/common-api";

interface IZip {
  key: string;
  zip: JSZip;
}

interface IFileProgressDialogProps {
  complete?: (mode: string) => void;
}

const FileProgressDialog: React.FC<IFileProgressDialogProps> = props => {
  const { t } = useTranslation();

  const [state, setState] = useRecoilState(fileProgressState);
  const delimiter = useRecoilValue(getServerDelimiter);

  const files = cloneDeep(state.files);

  const onHiding = () => {
    setState({
      open: false,
      mode: state.mode,
      files: [],
    });
  };

  const getProgressBackColor = (param: FileParameter) => {
    if (param.isCanceled) {
      return "var(--color-error)";
    } else if (param.isComplete) {
      return "var(--color-success)";
    } else {
      return "var(--color-accent)";
    }
  };

  const onCancel = (item: FileParameter) => {
    if (!item.onCancelClick) return;
    item.onCancelClick(item);
  };

  const downloadFile = (param: FileParameter) => {
    if (!param.blobInfo) return;
    saveAs(param.blobInfo.blob, path.basename(param.blobInfo.fileName));
  };

  const downloadZip = () => {
    if (!files) return;
    const names = files[0].name.split(delimiter);
    const zipName = names[names.length - 2];
    const zips: IZip[] = [];
    const zip: IZip = {
      key: zipName,
      zip: new JSZip(),
    };
    files
      .filter(p => p.blobInfo)
      .forEach(p => {
        if (p.blobInfo) {
          const filePath = p.blobInfo.fileName;
          const dirs = path.dirname(filePath);
          const fileName = path.basename(filePath);
          let prev = zip;
          dirs.split(delimiter || "/").forEach(dir => {
            const key: string = `${prev.key}${path.delimiter}${dir}`;
            const findZip = zips.find(z => z.key === key);
            if (findZip) {
              prev = findZip;
            } else {
              const folder = prev.zip.folder(dir);
              if (folder) {
                prev = {
                  key,
                  zip: folder,
                };
                zips.push(prev);
              }
            }
          });
          prev.zip.file(fileName, p.blobInfo.blob, { base64: true });
        }
      });
    zip.zip.generateAsync({ type: "blob" }).then((content: any) => {
      saveAs(content, `${zipName}.zip`);
    });
  };

  const onCompleted = (param: FileParameter) => {
    if (!files) return;
    if (!files.every(p => p.isComplete)) return;
    if (!files.every(p => p.isCanceled)) {
      if (state.mode === "Download") {
        if (files.length > 1) {
          downloadZip();
        } else {
          downloadFile(param);
        }
      }
    }
    if (props.complete) {
      props.complete(state.mode);
    }
    onHiding();
  };

  React.useEffect(() => {
    if (files.length === 0) return;
    files.forEach(param => {
      param.onCompleted = onCompleted;
      if (state.mode && state.mode === "Upload") {
        Upload(param);
      } else {
        Download(param);
      }
    });
  });

  if (!state.open) return <></>;

  return (
    <>
      <Popup
        visible={state.open}
        className="moz-popup moz-file-transfer-popup"
        onHiding={onHiding}
        dragEnabled={true}
        hideOnOutsideClick={false}
        showCloseButton={true}
        showTitle={true}
        title={t(`File${state.mode}`) as string}
        width={550}
        height="auto"
      >
        <div className="moz-file-transfer">
          {files.map((file, i) => {
            return (
              <div className="moz-progress-frame" key={`item${i}`}>
                <div className="moz-progress-wrapper">
                  <div className="moz-progress-title" title={file.name}>
                    {file.path}
                  </div>
                  <div className="moz-progress-outside">
                    <div
                      className="moz-progress-inside"
                      style={{ width: `${file.percent}%`, backgroundColor: getProgressBackColor(file as any) }}
                    ></div>
                  </div>
                  <div className="moz-progress-status">{file.status}</div>
                </div>
                <div className="moz-progress-cancel">
                  <Button
                    className="moz-text-button cancel-button"
                    icon="close"
                    disabled={!file.isCancelable}
                    stylingMode="text"
                    onClick={evt => {
                      onCancel(file as any);
                    }}
                  ></Button>
                </div>
              </div>
            );
          })}
        </div>
      </Popup>
    </>
  );
};

export default React.memo(FileProgressDialog);
