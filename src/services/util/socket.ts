import { createSocket, SocketType } from './ws';
import { publicKey, socketUrl } from '@/const/config';
import { omitBy, remove } from '@/utils/snippets';

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

let currentConnect: SocketType;

function updateCurrentConnect() {
  const now = Date.now();
  if (currentConnect) {
    currentConnect.ws.close();
  }
  const socket = createSocket({
    publicKey,
    url: socketUrl,
    commKey: now + '' + now + ('' + now).substring(0, 6),
  });
  socket.emitter.once('ws_error', (err) => {
    currentConnect = updateCurrentConnect();
  });
  listeners.forEach((d) => socket.onMessage.apply(null, Object.values(d)));
  return socket;
}

export function getConnect(): SocketType {
  if (currentConnect) return currentConnect;
  currentConnect = updateCurrentConnect();
  return currentConnect;
}

export function onCmd<T>(cmd: string, listener: (d: T) => void): () => void {
  const d = { cmd, listener };
  listeners.push(d);
  const off = getConnect().onMessage(cmd, listener);
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
    const connect = getConnect();
    let timer = null;
    let disposer = connect.onMessage(
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
    }, 60000);

    const common = omitBy(commonParams, (x) => x === undefined);
    connect.sendMessage(cmd, { ...common, ...params });
  });
}

export function sendCmd(cmd: string, params?: any): void {
  const connect = getConnect();
  const common = omitBy(commonParams, (x) => x === undefined);
  connect.sendMessage(cmd, { ...common, ...params });
}

if (__DEV__) window.fetchCmd = fetchCmd;
