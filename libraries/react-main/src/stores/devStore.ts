import { atom, selector } from "recoil";
import { ITreeNode, providers } from "@mozart-ui/protos";
import { FileParameter } from "@mozart-ui/common";

export const selectedState = atom({
  key: "model-tree-selected",
  default: null as ITreeNode | null,
});

export const provider = selector({
  key: "provider",
  get: ({ get }) => {
    const selectedInfo = get(selectedState);
    if (!selectedInfo) return providers[1];
    if (!selectedInfo.info) return providers[1];
    const item = providers.find(p => p.name === selectedInfo.info?.dbType);
    if (!item) return providers[1];
    return item;
  },
});

export const connectionState = atom({
  key: "connection-dialog-state",
  default: {
    open: false,
    mode: "Add",
  },
});

export const fileProgressState = atom({
  key: "file-progress-dialog-state",
  default: {
    open: false,
    mode: "Upload",
    files: [] as FileParameter[],
  },
});

export const systemState = atom({
  key: "system-dialog-state",
  default: {
    open: false,
    mode: "Add",
    connName: "",
  },
});

export const deployState = atom({
  key: "deploy-state",
  default: {
    workingDirectory: "",
    delimiter: "",
  },
});

export const getWorkingDirectory = selector({
  key: "working-directory",
  get: ({ get }) => {
    const deploy = get(deployState);
    return deploy.workingDirectory;
  },
});

export const getServerDelimiter = selector({
  key: "server-delimiter",
  get: ({ get }) => {
    const deploy = get(deployState);
    return deploy.delimiter;
  },
});
