import { confirm } from 'devextreme/ui/dialog';
import { alert } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { Popup } from '@grapecity/wijmo.input';
import { t } from 'i18next';

export interface ISnackBarParams {
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
}

export const getDialogText = (message: string, type: string) => {
  return `<div class='flex'>
  <i class='dx-icon dx-icon-${type.toLowerCase()}'></i>
  <span style='padding-left:10px;'>${message}</span>
  </div>`;
};

export const showAlert = async (params: { message: string; type?: string; title?: string }) => {
  const { message, type = 'warning', title = 'Warning' } = params;
  return await alert(getDialogText(message, type), title);
};

export const showConfirm = async (params: { message: string; type?: string; title?: string }) => {
  const { message, type = 'warning', title = 'Confirm' } = params;
  return await confirm(getDialogText(message, type), 'Confirm');
};

/**
 * 사용자 액션이 필요한 팝업창 생성
 * @param params
 * @returns
 */
export const showDialog = async (params: {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  action: 'confirm' | 'alert';
}) => {
  return new Promise((resolve, reject) => {
    const { message, type = 'warning', action = 'confirm' } = params;

    const container = document.createElement('div');
    container.className = 'moz-dialog';

    const header = document.createElement('div');
    header.className = 'wj-dialog-header moz-dialog-header';
    header.textContent = getDialogTitle(type);
    // TODO: icon 변경시 textContent 말고 자식으로 넣어야 함

    const body = document.createElement('div');
    body.className = 'wj-dialog-body moz-dialog-body';
    body.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'wj-dialog-footer moz-dialog-footer';

    if (action == 'confirm') {
      // 버튼 두개
      const yes = document.createElement('button');
      yes.className = 'moz-button moz-default-button wj-hide-yes';
      yes.textContent = t('Yes');

      const no = document.createElement('button');
      no.className = 'moz-button moz-text-button wj-hide-no';
      no.textContent = t('No');

      actions.appendChild(yes);
      actions.appendChild(no);
    } else if (action == 'alert') {
      // 버튼 하나만
      const yes = document.createElement('button');
      yes.className = 'moz-button moz-default-button wj-hide-yes';
      yes.textContent = t('Yes');
    }

    // append childrens at container
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(actions);

    const popup = new Popup(container, {
      isDraggable: true,
      modal: true,
      hideTrigger: 0
    });
    popup.show(true, (sender: any) => {
      resolve(sender.dialogResult == 'wj-hide-yes');
    });
  });
};

const getDialogTitle = (type: string) => {
  switch (type) {
    case 'error':
      return 'err';

    case 'warning':
      return 'warn';

    case 'success':
      return 'succ';

    case 'info':
    default:
      return 'info';
  }
};

export const showSnackBar = (params: ISnackBarParams) => {
  notify({
    message: params.message,
    type: params.type,
    displayTime: 2000,
    width: 'auto',
    minWidth: 150,
    animation: {
      show: {
        type: 'fade',
        duration: 400,
        from: 0,
        to: 1
      },
      hide: { type: 'fade', duration: 40, to: 0 }
    }
  });
};

export const showMessage = (message: any, result: boolean) => {
  showSnackBar({
    message: `${message}!`,
    type: result ? 'success' : 'error'
  });
};
