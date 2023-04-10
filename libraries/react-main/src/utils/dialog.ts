import { confirm } from "devextreme/ui/dialog";
import { alert } from "devextreme/ui/dialog";

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
