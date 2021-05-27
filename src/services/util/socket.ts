import { createSocket, SocketType } from './ws';
import { publicKey, socketUrl } from '@/const/config';
import { omitBy, remove } from '@/utils/snippets';
import { i18n } from '@/common/i18n';
import Confirm from '@/modules/popup/Confirm';

let socket: SocketType;

const listeners: { cmd: string; listener: (d: unknown) => void }[] = [];

export const OK_CODE = 200;

const commonParams = {
  jwt: undefined,
};

// setParams({ jwt: token });
export const setParams = (p: any) => Object.assign(commonParams, p);

export interface AppResponseType<T> {
  code: string | number;
  cmd: string;
  message: string;
  data: T;
  rspTime: number;
}

export function getSocket(): SocketType {
  const now = Date.now();
  if (socket) return socket;
  socket = createSocket({
    publicKey,
    url: socketUrl,
    commKey: now + '' + now + ('' + now).substring(0, 6),
  });
  listeners.forEach((d) => socket.onMessage.apply(null, Object.values(d)));
  return socket;
}

export function onCmd<T>(cmd: string, listener: (d: T) => void): () => void {
  const d = { cmd, listener };
  listeners.push(d);
  const off = getSocket().onMessage(cmd, listener);
  return () => {
    remove(listeners, (v) => v === d);
    off();
  };
}

type FetchProps = {
  tips?: boolean;
  timeout?: false | number;
};

export function fetchCmd<R>(cmd: string, params?: any, props?: FetchProps): Promise<AppResponseType<R>> {
  return new Promise((resolve, reject) => {
    const sock = getSocket();
    let timer = null;
    let disposer = sock.onMessage(
      cmd,
      (data) => {
        clearTimeout(timer);
        resolve(data);
        disposer = null;
      },
      true,
    );
    timer = setTimeout(() => {
      const uid = window.paladin?.sys.config.uid || '';
      console.warn('your uid:', uid);
      reject(new Error(`${cmd} timeout`));
      disposer();
      if (!(props?.tips === false)) {
        Confirm.getInstance().popupMsg(i18n('tips_net_timeout'), { onClosed: () => window.location.reload() });
      }
    }, 6000);

    const common = omitBy(commonParams, (x) => x === undefined);
    sock.sendMessage(cmd, { ...common, ...params });
  });
}

export function sendCmd(cmd: string, params?: any): void {
  const sock = getSocket();
  const common = omitBy(commonParams, (x) => x === undefined);
  sock.sendMessage(cmd, { ...common, ...params });
}

if (__DEV__) window.fetchCmd = fetchCmd;
