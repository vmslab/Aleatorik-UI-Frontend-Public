import { defineStore } from "pinia";
import { ITreeNode, providers } from "@aleatorik-ui/protos";
import { FileParameter } from "@aleatorik-ui/common";

export const useSelectedStore = defineStore("model-tree-selected", {
  state: () => ({
    selectedItem: null as ITreeNode | null,
  }),
  getters: {
    provider(selectedInfo) {
      if (!selectedInfo.selectedItem) return providers[1];
      if (!selectedInfo.selectedItem.info) return providers[1];
      const item = providers.find(p => p.name === selectedInfo.selectedItem?.info?.dbType);
      if (!item) return providers[1];
      return item;
    },
  },
  actions: {
    setSelectedItems(from: any) {
      this.selectedItem = from;
    },
  },
});

export const useConnectionStore = defineStore("connection-dialog-state", {
  state: () => ({
    mode: "Add",
    open: false,
  }),
  actions: {
    setConnectionState(from: any) {
      this.mode = from.mode;
      this.open = from.open;
    },
  },
});

export const useFileProgressStore = defineStore("file-progress-dialog-state", {
  state: () => ({
    open: false,
    mode: "Download",
    files: [] as FileParameter[],
  }),
  actions: {
    setFileProgressState(from: any) {
      this.open = from.open;
      this.mode = from.mode;
      this.files = from.files;
    },
  },
});

export const useSystemStore = defineStore("system-dialog-state", {
  state: () => ({
    mode: "Add",
    open: false,
    connName: "",
  }),
  actions: {
    setSystemState(from: any) {
      this.mode = from.mode;
      this.open = from.open;
      this.connName = from.connName;
    },
  },
});

export const useDeployStore = defineStore("deploy-state", {
  state: () => ({
    workingDirectory: "",
    delimiter: "",
  }),
  actions: {
    setDeployState(from: any) {
      this.workingDirectory = from.workingDirectory;
      this.delimiter = from.delimiter;
    },
  },
});
