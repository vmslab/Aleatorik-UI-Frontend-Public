import { EventBus } from "@mozart-ui/common";

export const isElectron: boolean = (window as any).ipcRenderer ? true : false;

export const getWebSocketURL = (url?: string): string => {
  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const baseUrl = `${scheme}://${window.location.host}`;
  if (url === undefined) {
    return baseUrl;
  } else {
    if (url[0] === "/") {
      return `${baseUrl}${url}`;
    } else {
      return url;
    }
  }
};

export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      }
      reject();
    };
    reader.onerror = () => reject;
    reader.readAsArrayBuffer(blob);
  });
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const errorProcess = async (error: any, cb: any = () => {}) => {
  if (error.response) {
    if (error.response.status === 401) {
      EventBus.emit("signout", { isServerLogout: false });
      return;
    }
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log("error.response.data", error.response.data);
    console.log("error.response.status", error.response.status);
    console.log("error.response.headers", error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log("error.request", JSON.stringify(error));
  } else if (error.message) {
    // cancel
    return;
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("etc error", error);
  }
  alert(error.message);
};
