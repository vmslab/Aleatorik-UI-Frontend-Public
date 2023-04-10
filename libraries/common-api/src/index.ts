import menus from "./data/menus.json";
import theme from "./data/theme.json";
import lang from "./data/lang.json";
import installProcess from "./data/installprocess.json";
import uninstallProcess from "./data/uninstallprocess.json";
import updateProcess from "./data/updateprocess.json";

export { unary, bidirectional, init, fileSend, fileRecive } from "./grpc";
export { request, wsCall, sendFile, reciveFile } from "./rest";
export { call, bidiCall, download, upload } from "./common";

export { isElectron } from "./utils/common";

export { getCookie, setCookie, removeCookie, addCookieEvent, removeCookieEvent, parseExpires } from "./utils/cookie";

export { Add, Modify, Remove } from "./api/mainService";
export { Login, Refresh, Logout } from "./api/authService";
export { ServerTime, GetServerInfo, ServerSate } from "./api/serverService";
export { GetModel, TestConnection, Migrate } from "./api/modelService";
export {
  GetDeployInfo,
  GetFileInfos,
  CreateDirectory,
  DeleteItem,
  RenameItem,
  CopyTo,
  MoveTo,
  Upload,
  Download,
} from "./api/deployService";
export { GetSystem } from "./api/uiService";

export type { IMenu } from "./types";

export { menus, theme, lang, installProcess, uninstallProcess, updateProcess };
