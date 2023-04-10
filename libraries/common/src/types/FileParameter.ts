export default class FileParameter {
  public sessionId: string;
  public name: string = "";
  public path: string = "";
  public saveDir: string = "";
  public size: number = 0;
  public file?: File;
  public info?: any;
  public type: "Upload" | "Download" = "Upload";
  public offset: number = 0;
  public isComplete: boolean = false;
  public isCancelable: boolean = false;
  public isCanceled: boolean = false;
  public blobInfo?: {
    fileName: string;
    blob: Blob;
  };
  public onCompleted?: (param: FileParameter) => void;

  public onCancelClick?: (param: FileParameter) => void;

  constructor(type: "Upload" | "Download", id: string) {
    this.type = type;
    this.sessionId = id;
  }

  public get ipcObject(): object {
    return {
      sessionId: this.sessionId,
      name: this.name,
      path: this.path,
      saveDir: this.saveDir,
      size: this.size,
      info: this.info,
    };
  }

  public get totalSize(): number {
    if (this.type === "Upload") {
      return +(this.file?.size || this.size);
    } else {
      return +(this.info?.length || 0);
    }
  }

  public get percent(): number {
    if (this.offset === 0 || this.totalSize === 0) return 0;
    return Math.round((this.offset / this.totalSize) * 100);
  }

  public get progressValue(): number {
    return +this.offset;
  }

  public get status(): string {
    return `${this.percent}% (${this.formatSizeUnits(this.offset)}/${this.formatSizeUnits(this.totalSize)})`;
  }

  public completed(param?: { fileName: string; blob: Blob }) {
    this.isCancelable = false;
    this.isComplete = true;
    this.blobInfo = param;
    if (this.onCompleted) {
      this.onCompleted(this);
    }
  }

  private formatSizeUnits(bytes: number): string {
    let result = "";
    if (bytes >= 1073741824) {
      result = (bytes / 1073741824).toFixed(2) + " GB";
    } else if (bytes >= 1048576) {
      result = (bytes / 1048576).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      result = (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes > 1) {
      result = `${bytes} bytes`;
    } else if (bytes === 1) {
      result = `${bytes} byte`;
    } else {
      result = "0 bytes";
    }
    return result;
  }
}
