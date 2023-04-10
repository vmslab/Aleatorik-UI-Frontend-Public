import dayjs from "dayjs";
import { formatSizeUnits } from "../utils/fileUtil";
import { FileState } from "../types";

export interface IFileInfo {
  name: string;
  size: number;
  latestUpdateTime: string;
}

export default class FileSystem {
  public file?: File;
  public fileInfo?: IFileInfo;
  public name: string = "";
  public path: string = "";
  public origine: string = "";
  public size: string = "";
  public lastModified: string = "";
  public server: boolean = false;
  public client: boolean = false;
  public remove: boolean = false;
  public replace: boolean = false;
  public parentPath?: string;
  public children?: FileSystem[];

  constructor(item: {
    file?: File;
    fileInfo?: IFileInfo;
    name: string;
    path: string;
    server?: boolean;
    client?: boolean;
    children?: FileSystem[];
  }) {
    Object.assign(this, item);
  }

  public get isClient(): boolean {
    return this.client;
  }

  public get isServer(): boolean {
    return this.server;
  }

  public get isFolder(): boolean {
    return !this.file && !this.fileInfo;
  }

  public get isFile(): boolean {
    return !this.isFolder;
  }

  public get fullPath(): string | undefined {
    if (this.file) {
      return (this.file as any).path;
    }
    return undefined;
  }

  public get state(): FileState {
    if (this.isFolder) return "UNRECOGNIZED";
    if (this.isServer && this.remove) return "Remove";
    if (this.isClient && !this.isServer) return "Add";
    if (this.isClient && this.isServer) return "Edit";
    if (this.isServer && this.replace) return "Edit";
    return "UNRECOGNIZED";
  }

  public calcSize(): number {
    let result = 0;
    if (this.file) {
      result = this.file.size;
    } else if (this.fileInfo) {
      result = +this.fileInfo.size;
    } else {
      result =
        this.children?.reduce((sum: number, item: FileSystem) => sum + item.calcSize(), 0) || 0;
    }
    this.size = formatSizeUnits(result);
    return result;
  }

  public calcLastModified(): number {
    let result = 0;
    if (this.file) {
      result = this.file.lastModified;
    } else if (this.fileInfo) {
      result = +dayjs(this.fileInfo.latestUpdateTime);
    } else {
      result =
        this.children?.reduce((max: number, item: FileSystem) => {
          const last = item.calcLastModified();
          return max < last ? last : max;
        }, 0) || 0;
    }
    this.lastModified = dayjs(new Date(result)).format("YYYY-MM-DD LT");
    return result;
  }

  public removeAll() {
    this.remove = true;
    this.children?.forEach(c => c.removeAll());
  }

  public replaceAll(oldPath: string, newPath: string) {
    this.replace = true;
    this.origine = this.path;
    const regexp = new RegExp(`^${oldPath}`);
    this.path = this.path.replace(regexp, newPath);
    this.children?.forEach(c => c.replaceAll(oldPath, newPath));
  }
}
