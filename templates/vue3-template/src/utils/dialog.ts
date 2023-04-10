import { confirm } from "devextreme/ui/dialog";
import { alert } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";

export interface ISnackBarParams {
  message: string;
  type: "error" | "warning" | "success" | "info";
}

export const getDialogText = (message: string, type: string) => {
  return `<div class='flex'>
  <i class='dx-icon dx-icon-${type.toLowerCase()}'></i>
  <span style='padding-left:10px;'>${message}</span>
  </div>`;
};

export const showAlert = async (params: { message: string; type?: string; title?: string }) => {
  const { message, type = "warning", title = "Warning" } = params;
  return await alert(getDialogText(message, type), title);
};

export const showConfirm = async (params: { message: string; type?: string; title?: string }) => {
  const { message, type = "warning", title = "Confirm" } = params;
  return await confirm(getDialogText(message, type), "Confirm");
};

export const showSnackBar = (params: ISnackBarParams) => {
  notify({
    message: params.message,
    type: params.type,
    displayTime: 2000,
    width: "auto",
    minWidth: 150,
    animation: {
      show: {
        type: "fade",
        duration: 400,
        from: 0,
        to: 1,
      },
      hide: { type: "fade", duration: 40, to: 0 },
    },
  });
};

export const showMessage = (message: any, result: boolean) => {
  showSnackBar({
    message: `${message}!`,
    type: result ? "success" : "error",
  });
};
