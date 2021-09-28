import { loadGuestToken } from '@/common/Helper';
import { i18n } from '@/common/i18n';
import Toast from '@/common/Toast';
import Confirm from '@/modules/popup/Confirm';
import { getLogger } from '@/utils/getLogger';
import { AppResponseType, getSocket, onCmd, setParams } from './util/socket';

const logger = getLogger('socket');

export function handleError() {
  const { ws, emitter } = getSocket();
  emitter.on('ws_error', (err) => {
    logger.error(err);
    // Confirm.getInstance().popupMsg(i18n('tips_net_timeout'), { onClosed: () => window.location.reload() });
  });

  onCmd('error', (rep: AppResponseType<any>) => {
    switch (Number(rep.data?.errCode)) {
      case 31:
        Confirm.getInstance().popupMsg(i18n('error_31'));
        break;
      case 32:
        Confirm.getInstance().popupMsg(i18n('error_32'), { onSure: () => paladin?.account.login() });
        break;
      case 1:
        Confirm.getInstance().popupMsg(i18n(`error_1`));
        break;
      case 33:
      case 34:
      case 36:
      case 37:
      case 39:
      case 2:
      default:
        const msg = i18n(`error_${rep.data?.errCode}` as any) || i18n(`error_1`);
        Toast.getInstance().showMsg(msg);
        break;
    }
  });

  /**
   * var BadCmdCode = "1000"
   * var NoCmdCode = "1001"
   * var BadJwtTokenCode = "1002"
   * var AlreadyLoginCode = "1003"
   * var TokenExpiredCode = "1004"
   */
  onCmd('conn::error', (rep: AppResponseType<any>) => {
    const code = rep.data?.code;

    switch (String(code)) {
      case '1002':
      case '1004':
        setParams({ jwt: null });
        loadGuestToken();
        break;
      case '1003':
        ws.close();
        Confirm.getInstance().popupMsg(i18n('msg_repeatedly_login'), { onClosed: () => location.reload() });
        break;
    }
  });
}
