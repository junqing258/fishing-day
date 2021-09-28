/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from 'crypto-js';
import { enableLog } from '@/utils/getLogger';
import EventEmitter from 'eventemitter3';
import { JSEncrypt } from 'jsencrypt';

const methodToColorMap = {
  receive: `#24a400`, // Green
  send: `#237de3`, // blue
};

const getPrefix = (method, name) => {
  const styles = [
    `background: ${methodToColorMap[method]}`,
    `border-radius: 0.5em`,
    `color: white`,
    `font-weight: bold`,
    `padding: 2px 0.5em`,
  ];
  return [`%c${name}`, styles.join(';')];
};

/**
 * 生成 AUTH
 * @returns {string}
 */
function getAuthorizeKey(publicKey, commKey) {
  const jsencrypt = new JSEncrypt();
  jsencrypt.setPublicKey(publicKey);
  return jsencrypt.encrypt(commKey);
}

/**
 * 加密数据包
 * @param data
 * @returns {string}
 */
function encodeMsg(data, commKey) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(commKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

/**
 * 解密数据包
 * @param data
 * @returns {any}
 */
function decodeMsg(data, commKey) {
  const pendingData = data.substring(1);
  const desData = CryptoJS.AES.decrypt(pendingData, CryptoJS.enc.Utf8.parse(commKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(desData.toString(CryptoJS.enc.Utf8));
}

interface SocketPropsType {
  url: string;
  publicKey: string;
  commKey: string;
}
// scheduler reconciler
type RemoveFunction = () => void;

export interface SocketType {
  ws: WebSocket;
  emitter: EventEmitter;
  isConnecting: () => boolean;
  addMessageListener: (cmd: string, listener: (d: any) => void) => RemoveFunction;
  onMessage: (cmd: string, listener: (d: any) => void, once?: boolean) => RemoveFunction;
  sendMessage: (cmd: string, params?: any) => void;
}

/**
 * 创建 Socket
 * @param props {SocketType}
 */
export const createSocket = (props: SocketPropsType): SocketType => {
  const { url, publicKey, commKey } = props;
  const auth = getAuthorizeKey(publicKey, commKey);
  const emitter = new EventEmitter();

  let connecting = false;
  let pendingList = [];
  let pingTimeout;

  const ws = new WebSocket(`${url}?auth=${auth}`);
  let interval = setInterval(heartbeat, 3000);

  function heartbeat() {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(() => {
      connecting = false;
      clearInterval(interval);
      emitter.emit('ws_error', new Error('ping timeout'));
    }, 1000);
    if (ws.readyState === WebSocket.OPEN) ws.send('ping');
  }

  ws.onopen = () => {
    connecting = true;
    clearInterval(interval);
    interval = setInterval(heartbeat, 3000);
    pendingList.forEach((v) => ws.send(v));
  };

  ws.onclose = () => {
    connecting = false;
    pendingList = [];
    emitter.emit('close');
  };

  ws.onerror = (err) => {
    connecting = false;
    emitter.emit('ws_error', err);
  };

  ws.onmessage = function (e) {
    const { data } = e;
    if (data === 'pong') {
      clearTimeout(pingTimeout);
      return;
    }
    let msgData = data;
    const type = data.substr(0, 1);
    if (type === '0') {
      msgData = decodeMsg(data, commKey);
    }
    enableLog() && console.log(...getPrefix('receive', msgData?.cmd), msgData, JSON.stringify(msgData));
    if (msgData.cmd) emitter.emit(msgData.cmd, msgData);
  };

  function onMessage(cmd, cb, once = false) {
    const handler = (msgData) => {
      const { code } = msgData;
      const data = msgData.data || msgData.res;
      if (cb) cb({ code, data });
    };
    once ? emitter.once(cmd, handler) : emitter.on(cmd, handler);
    return () => emitter.off(cmd, handler, null, once);
  }

  function sendMessage(cmd, params = {}) {
    const msgData = {
      cmd,
      params,
    };
    enableLog() && console.log(...getPrefix('send', msgData?.cmd), msgData, JSON.stringify(msgData));
    const s = '0' + encodeMsg(msgData, commKey);
    connecting ? ws.send(s) : pendingList.push(s);
  }

  function isConnecting() {
    return connecting;
  }

  return {
    ws,
    emitter,
    isConnecting,
    addMessageListener: onMessage,
    onMessage,
    sendMessage,
  };
};
