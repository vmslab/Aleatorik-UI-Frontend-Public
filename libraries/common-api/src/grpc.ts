import { Method } from "axios";
import { IpcRequest, IpcResponse, StreamingParameter, FileParameter } from "@aleatorik-ui/common";
import { errorProcess } from "./utils/common";

interface IpcRenderer {
  init: (serverUrl: string) => void;
  invoke: (channel: string, args: IpcRequest) => Promise<IpcResponse>;
  send: (channel: string, args: IpcRequest) => void;
  receive: (channel: string, cb: (event: any, response: any) => void) => void;
}

interface IElectronWindow extends Window {
  ipcRenderer: IpcRenderer;
}

const ipcRenderer: IpcRenderer = (window as unknown as IElectronWindow).ipcRenderer;

export async function init(url: string) {
  ipcRenderer.init(url);
}

export async function unary(url: string, method: Method = "get", data?: any): Promise<IpcResponse> {
  try {
    const channel = `${url}:${method}`;
    const responseChannel = `${channel}_response_${new Date().getTime()}`;
    const result = await ipcRenderer.invoke(channel, {
      responseChannel,
      params: data,
    });
    return result;
  } catch (error: any) {
    errorProcess(error);
    return Promise.reject(error);
  }
}

export async function fileSend(url: string, method: Method = "post", data: FileParameter) {
  try {
    const channel = `${url}:${method}`;
    const responseChannel = `${channel}_${data.sessionId}`;
    const cancelChannel = `${responseChannel}__cancel`;
    ipcRenderer.send(channel, {
      responseChannel,
      cancelChannel,
      params: data.ipcObject,
    });
    ipcRenderer.receive(responseChannel, (response: IpcResponse) => {
      if (response.error) {
        errorProcess(response.error);
      } else {
        if (response.data) {
          const fs = response.data;
          switch (fs.messageType) {
            case 1: // FileStreamMessageType.SessionCreate
              data.isCancelable = true;
              data.onCancelClick = (param: FileParameter) => {
                data.isCancelable = false;
                ipcRenderer.send(cancelChannel, {
                  responseChannel,
                  params: undefined,
                });
              };
              break;
            case 5: // FileStreamMessageType.SessionSave
            case 2: // FileStreamMessageType.SessionClose
              if (fs.request?.$case === "content") {
                data.offset = +fs.request.content.rangeEnd;
              }
              if (fs.messageType === 2) {
                // FileStreamMessageType.SessionClose
                data.completed();
              }
              break;
            case 3: // FileStreamMessageType.SessionCancel
              data.isCanceled = true;
              data.completed();
              break;
            default:
              break;
          }
        }
      }
    });
  } catch (error: any) {
    errorProcess(error);
  }
}

export async function fileRecive(url: string, method: Method = "post", data: FileParameter) {
  try {
    const channel = `${url}:${method}`;
    const responseChannel = `${channel}__${data.sessionId}`;
    const cancelChannel = `${responseChannel}__cancel`;
    ipcRenderer.send(channel, {
      responseChannel,
      cancelChannel,
      params: data.ipcObject,
    });
    ipcRenderer.receive(responseChannel, (response: IpcResponse) => {
      if (response.error) {
        errorProcess(response.error);
      } else {
        if (response.data) {
          const fs = response.data;
          switch (fs.messageType) {
            case 8: // FileStreamMessageType.LoadMetaData
              data.isCancelable = true;
              data.onCancelClick = (param: FileParameter) => {
                data.isCancelable = false;
                ipcRenderer.send(cancelChannel, {
                  responseChannel,
                  params: undefined,
                });
              };
              break;
            case 0: // FileStreamMessageType.Streaming
              if (fs.request?.$case === "content") {
                data.offset = +fs.request.content.rangeEnd;
              }
              break;
            case 2: // FileStreamMessageType.SessionClose
              data.completed();
              break;
            case 3: // FileStreamMessageType.SessionCancel
              data.isCanceled = true;
              data.completed();
              break;
            default:
              break;
          }
        }
      }
    });
  } catch (error: any) {
    errorProcess(error);
  }
}

export async function bidirectional<Req, Res>(url: string, method: Method = "get", data: StreamingParameter<Req, Res>) {
  try {
    const channel = `${url}:${method}`;
    const responseChannel = `${channel}__${data.sessionId}`;
    const requestChannel = `${responseChannel}__request`;
    const cancelChannel = `${responseChannel}__cancel`;
    const closeChannel = `${responseChannel}__close`;
    data.onCancelClick = (param: Req) => {
      ipcRenderer.send(cancelChannel, {
        responseChannel,
        params: param,
      });
    };
    data.onRequestClick = (param: Req) => {
      ipcRenderer.send(requestChannel, {
        responseChannel,
        params: param,
      });
    };
    ipcRenderer.send(channel, {
      responseChannel,
      requestChannel,
      cancelChannel,
      closeChannel,
      params: data.ipcObject,
    });
    ipcRenderer.receive(responseChannel, (response: IpcResponse) => {
      if (response.error) {
        errorProcess(response.error);
      } else {
        if (response.data) {
          const res = response.data as Res;
          data.recived(res);
        }
      }
    });
    ipcRenderer.receive(closeChannel, () => {
      data.closed();
    });
  } catch (error: any) {
    errorProcess(error);
  }
}
