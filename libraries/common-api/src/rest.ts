import dayjs from "dayjs";
import axios, { AxiosResponse, Method, AxiosRequestConfig } from "axios";
import { Upload, isSupported } from "tus-js-client";
import { toCamelCase, StreamingParameter, FileParameter } from "@aleatorik-ui/common";
import { getWebSocketURL, blobToArrayBuffer, errorProcess } from "./utils/common";
import ByteBuffer from "bytebuffer";

const CHUNK_SIZE = 1024 * 2; // 2KB

export async function request(
  url: string,
  method: Method = "get",
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<any>> {
  try {
    if (method === "get" && data) {
      url = `${url}/${data}`;
      data = undefined;
    }
    const response = await axios({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data,
      ...config,
    });
    if (response.status !== 200) {
      throw response;
    }
    return response;
  } catch (error: any) {
    await errorProcess(error, async () => await request(url, method, data, config));
    return Promise.reject(error);
  }
}

export async function sendFile(url: string, method: Method = "post", data: FileParameter) {
  try {
    if (isSupported) {
      const upload = new Upload(data.file as File, {
        endpoint: url,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        chunkSize: 1024 * 1024 * 4, // 4MB
        headers: {
          "session-id": data.sessionId,
          "file-path": data.name,
        },
        onError(error) {
          throw error;
        },
        onProgress(bytesUploaded, bytesTotal) {
          data.offset = bytesUploaded;
        },
        onSuccess() {
          data.completed();
        },
      });

      upload.findPreviousUploads().then(function (previousUploads) {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        data.isCancelable = true;
        data.onCancelClick = async (param: FileParameter) => {
          await upload.abort(true);
          data.isCanceled = true;
          data.completed();
        };
        upload.start();
      });
    } else {
      const ws: WebSocket = new WebSocket(getWebSocketURL(url));
      ws.binaryType = "arraybuffer";
      ws.onopen = async () => {
        // console.log("open");
        ws.send(
          new ByteBuffer()
            .writeVString(data.sessionId)
            .writeVString(String(1)) // FileStreamMessageType.SessionCreate
            .writeVString(data.name)
            .writeVString(dayjs(new Date(data.file?.lastModified || 0)).format("YYYY-MM-DD HH:mm:ss"))
            .writeVString(String(data.file?.size || 0))
            .flip()
            .toBuffer(),
        );
      };

      let offset = 0;
      let currentChunk = 0;

      const sendChunk = async () => {
        if (data.isComplete || data.isCanceled) return;
        offset = currentChunk * CHUNK_SIZE;
        const chunk = data.file?.slice(offset, offset + CHUNK_SIZE) as Blob;
        const chunkBuffer = await blobToArrayBuffer(chunk!);

        ws.send(
          new ByteBuffer()
            .writeVString(data.sessionId)
            .writeVString(
              String(
                data.totalSize <= offset + CHUNK_SIZE
                  ? 2 // FileStreamMessageType.SessionClose
                  : 5, // FileStreamMessageType.SessionSave
              ),
            )
            .writeVString(data.name)
            .writeVString(String(offset))
            .writeVString(String(data.totalSize < offset + CHUNK_SIZE ? data.totalSize : offset + CHUNK_SIZE))
            .writeVString(String(data.totalSize))
            .append(chunkBuffer)
            .flip()
            .toBuffer(),
        );

        currentChunk++;
      };

      ws.onmessage = async (e: MessageEvent) => {
        const bb = new ByteBuffer().append(e.data).flip();
        const sessionId = bb.readVString();
        if (sessionId !== data.sessionId) return;
        const messageType = +bb.readVString();
        if (messageType === 1) {
          // FileStreamMessageType.SessionCreate
          data.isCancelable = true;
          data.onCancelClick = (param: FileParameter) => {
            data.isCancelable = false;
            ws.send(
              new ByteBuffer()
                .writeVString(data.sessionId)
                .writeVString(String(3)) // FileStreamMessageType.SessionCancel
                .writeVString(data.name)
                .flip()
                .toBuffer(),
            );
          };
          await sendChunk();
        } else if (
          messageType === 2 || // FileStreamMessageType.SessionClose
          messageType === 5 // FileStreamMessageType.SessionSave
        ) {
          const rangeStart = +bb.readVString();
          const rangeEnd = +bb.readVString();
          data.offset = rangeEnd;
          if (messageType === 5) {
            // FileStreamMessageType.SessionSave
            await sendChunk();
          }
          if (messageType === 2) {
            // FileStreamMessageType.SessionClose
            data.completed();
            ws.close();
          }
        } else if (messageType === 3) {
          // FileStreamMessageType.SessionCancel
          // console.log("canceled");
          data.isCanceled = true;
          data.completed();
          ws.close();
        }
      };

      ws.onerror = e => {
        console.log(e);
      };

      ws.onclose = () => {
        // console.log("close");
      };
    }
  } catch (error: any) {
    await errorProcess(error);
  }
}

export async function reciveFile(url: string, method: Method = "post", data: FileParameter) {
  try {
    if (ReadableStream) {
      const abortController = new AbortController();
      const { signal } = abortController;
      const response = await fetch(url, {
        method: "post",
        signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: data.name,
        }),
      });
      if (!response.body) return;
      const reader = response.body.getReader();
      const fileBuffer = new ByteBuffer();
      const fileName = decodeURI(response.headers.get("content-disposition")!.split("=")[1]);
      const stream = new ReadableStream({
        start(streamController) {
          // 아래 함수는 각 data chunck를 다룬다.
          function push() {
            // "done"은 Boolean 이며 value는 "Uint8Array 이다."
            reader.read().then(({ done, value }) => {
              // 더이상 읽은 데이터가 없는가?
              if (done) {
                // 브라우저에게 데이터 전달이 끝났다고 알린다.
                fileBuffer.flip();
                const blob = new Blob([fileBuffer.toArrayBuffer()]);
                streamController.close();
                data.completed(blob ? { fileName, blob } : undefined);
                return;
              }

              if (!value) return;

              // 데이터를 얻고 컨트롤러를 통하여 그 데이터를 브라우저에 넘긴다.
              streamController.enqueue(value);
              fileBuffer.append(value);
              data.offset += value.byteLength;
              push();
            });
          }

          push();
        },
        cancel(reason) {
          fileBuffer.clear();
          abortController.abort();
        },
      });

      data.isCancelable = true;
      data.onCancelClick = async (param: FileParameter) => {
        data.isCanceled = true;
        stream.cancel("");
        data.completed();
      };
    } else {
      const ws: WebSocket = new WebSocket(getWebSocketURL(url));
      ws.binaryType = "arraybuffer";
      ws.onopen = async () => {
        // console.log("open");
        ws.send(
          new ByteBuffer()
            .writeVString(data.sessionId)
            .writeVString(String(8)) // FileStreamMessageType.LoadMetaData
            .writeVString(data.name)
            .writeVString(data.path)
            .flip()
            .toBuffer(),
        );
      };

      let currentChunk = 0;
      let totalChunks = 0;
      let fileName: string = "temp";
      let fileBuffer: ByteBuffer | null = null;

      const reciveChunk = () => {
        const offset = currentChunk * CHUNK_SIZE;

        ws.send(
          new ByteBuffer()
            .writeVString(data.sessionId)
            .writeVString(String(0)) // FileStreamMessageType.Streaming
            .writeVString(data.name)
            .writeVString(String(offset))
            .writeVString(String(data.totalSize < offset + CHUNK_SIZE ? data.totalSize : offset + CHUNK_SIZE))
            .writeVString(String(data.totalSize))
            .flip()
            .toBuffer(),
        );

        currentChunk++;
      };

      ws.onmessage = async (e: MessageEvent) => {
        const bb = new ByteBuffer().append(e.data).flip();
        const sessionId = bb.readVString();
        if (sessionId !== data.sessionId) return;
        const messageType = +bb.readVString();
        if (messageType === 8) {
          // FileStreamMessageType.LoadMetaData
          data.isCancelable = true;
          data.onCancelClick = (param: FileParameter) => {
            data.isCancelable = false;
            ws.send(
              new ByteBuffer()
                .writeVString(data.sessionId)
                .writeVString(String(3)) // FileStreamMessageType.SessionCancel
                .writeVString(data.name)
                .flip()
                .toBuffer(),
            );
          };
          fileName = bb.readVString();
          fileBuffer = new ByteBuffer();
          totalChunks = Math.ceil(data.totalSize / CHUNK_SIZE);
          reciveChunk();
        } else if (messageType === 0) {
          // FileStreamMessageType.Streaming
          const rangeStart = +bb.readVString();
          const rangeEnd = +bb.readVString();
          const buffer = bb.readBytes(rangeEnd - rangeStart);
          fileBuffer?.append(buffer);
          data.offset = rangeEnd;

          if (currentChunk < totalChunks) {
            reciveChunk();
          } else {
            let blob: Blob | null = null;
            if (fileBuffer) {
              fileBuffer.flip();
              blob = new Blob([fileBuffer.toArrayBuffer()]);
            }
            ws.close();
            data.completed(blob ? { fileName, blob } : undefined);
          }
        } else if (messageType === 3) {
          // FileStreamMessageType.SessionCancel
          data.isCanceled = true;
          data.completed();
          ws.close();
        }
      };

      ws.onerror = e => {
        console.log(e);
      };

      ws.onclose = () => {
        // console.log("close");
      };
    }
  } catch (error: any) {
    errorProcess(error);
  }
}

export async function wsCall<Req, Res>(url: string, method: Method = "get", data: StreamingParameter<Req, Res>) {
  try {
    const ws: WebSocket = new WebSocket(getWebSocketURL(url));
    const message: Req = data.params;
    ws.binaryType = "arraybuffer";
    ws.onopen = async () => {
      ws.send(new ByteBuffer().writeVString(JSON.stringify(message)).flip().toBuffer() as Buffer);
    };

    data.onCancelClick = (param: Req) => {
      ws.send(new ByteBuffer().writeVString(JSON.stringify(param)).flip().toBuffer() as Buffer);
    };

    data.onRequestClick = (param: Req) => {
      ws.send(new ByteBuffer().writeVString(JSON.stringify(param)).flip().toBuffer() as Buffer);
    };

    ws.onmessage = async (e: MessageEvent) => {
      const bb = new ByteBuffer().append(e.data).flip();
      const str = bb.readString(e.data.byteLength) as string;
      const response: Res = JSON.parse(str, toCamelCase);
      data.recived(response);
      if (data.isComplate) {
        ws.close();
      }
    };

    ws.onerror = e => {
      console.log(e);
    };

    ws.onclose = () => {
      data.closed();
    };
  } catch (error: any) {
    errorProcess(error);
  }
}
