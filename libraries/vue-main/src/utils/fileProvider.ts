/* eslint-disable id-blacklist */

import CustomFileSystemProvider from "devextreme/file_management/custom_provider";
import UploadInfo from "devextreme/file_management/upload_info";
import FileSystemItem from "devextreme/file_management/file_system_item";

export interface FileProviderOptions {
  abortFileUpload?: (
    fileData: File,
    chunksInfo: UploadInfo,
    destinationDir: FileSystemItem,
  ) => Promise<any>;
  copyItem?: (item: FileSystemItem, destinationDirectory: FileSystemItem) => Promise<any>;
  createDirectory?: (parentDirectory: FileSystemItem, name: string) => Promise<any>;
  deleteItem?: (item: FileSystemItem) => Promise<any>;
  downloadItems?: (items: Array<FileSystemItem>) => void;
  getItems?: (pathInfo: FileSystemItem) => Promise<any>;
  getItemsContent?: (pathInfo: Array<FileSystemItem>) => Promise<any>;
  moveItem?: (item: FileSystemItem, destinationDir: FileSystemItem) => Promise<any>;
  renameItem?: (item: FileSystemItem, name: string) => Promise<any>;
  uploadFileChunk?: (
    fileData: File,
    chunksInfo: UploadInfo,
    destinationDir: FileSystemItem,
  ) => Promise<any>;

  dateModifiedExpr?: string | Function;
  hasSubDirectoriesExpr?: string | Function;
  isDirectoryExpr?: string | Function;
  keyExpr?: string | Function;
  nameExpr?: string | Function;
  sizeExpr?: string | Function;
  thumbnailExpr?: string | Function;
}

export const createProviderConfig = (options: FileProviderOptions): CustomFileSystemProvider => {
  const abortFileUpload = options.abortFileUpload;
  const copyItem = options.copyItem;
  const createDirectory = options.createDirectory;
  const deleteItem = options.deleteItem;
  const downloadItems = options.downloadItems;
  const getItems = options.getItems;
  const getItemsContent = options.getItemsContent;
  const moveItem = options.moveItem;
  const renameItem = options.renameItem;
  const uploadFileChunk = options.uploadFileChunk;

  const dateModifiedExpr = options.dateModifiedExpr;
  const hasSubDirectoriesExpr = options.hasSubDirectoriesExpr;
  const isDirectoryExpr = options.isDirectoryExpr;
  const keyExpr = options.keyExpr;
  const nameExpr = options.nameExpr;
  const sizeExpr = options.sizeExpr;
  const thumbnailExpr = options.thumbnailExpr;

  const customFileSystemProvider = new CustomFileSystemProvider({
    abortFileUpload,
    copyItem,
    createDirectory,
    deleteItem,
    downloadItems,
    getItems,
    getItemsContent,
    moveItem,
    renameItem,
    uploadFileChunk,
    dateModifiedExpr,
    hasSubDirectoriesExpr,
    isDirectoryExpr,
    keyExpr,
    nameExpr,
    sizeExpr,
    thumbnailExpr,
  });

  return customFileSystemProvider;
};
