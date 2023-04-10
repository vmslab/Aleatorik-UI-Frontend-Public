import { request, wsCall, sendFile, reciveFile } from "./rest";
import { unary, bidirectional, fileSend, fileRecive } from "./grpc";
import { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { StreamingParameter, IpcResponse, FileParameter } from "@aleatorik-ui/common";

const ipcRenderer: any = (window as any).ipcRenderer;

export async function call(
  url: string,
  method: Method = "get",
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<any> | IpcResponse> {
  return ipcRenderer ? unary(url, method, data) : request(url, method, data, config);
}

export async function bidiCall<Req, Res>(url: string, method: Method = "get", data: StreamingParameter<Req, Res>) {
  if (ipcRenderer) {
    bidirectional(url, method, data);
  } else {
    wsCall(url, method, data);
  }
}

export async function upload(url: string, method: Method = "get", data: FileParameter) {
  if (ipcRenderer) {
    fileSend(url, method, data);
  } else {
    sendFile(url, method, data);
  }
}

export async function download(url: string, method: Method = "get", data: FileParameter) {
  if (ipcRenderer) {
    fileRecive(url, method, data);
  } else {
    reciveFile(url, method, data);
  }
}
