/* eslint-disable @typescript-eslint/no-explicit-any */
// declare var console: any;

import { getQueryString } from './util';

interface Logger {
  debug: (message?: any, ...optionalParams: any[]) => void;
  log: (message?: any, ...optionalParams: any[]) => void;
  info: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  groupCollapsed: (oupTitle?: string, ...optionalParams: any[]) => void;
  groupEnd: () => void;
}

const loggers: { [name: string]: Logger } = {};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const manual = getQueryString('GodMode') || window.GodMode;

export const enableLog = () => String(manual) !== '0' && (__DEV__ || manual);

export function getLogger(name: string): Logger {
  if (loggers[name]) {
    return loggers[name];
  }

  let inGroup = false;
  const methodToColorMap = {
    debug: `#7f8c8d`, // Gray
    log: `#2ecc71`, // Green
    info: `#2ecc71`, // Green
    warn: `#f39c12`, // Yellow
    error: `#c0392b`, // Red
    groupCollapsed: `#3498db`, // Blue
    groupEnd: '', // No colored prefix on groupEnd
  };

  const getLogPrefix = function (method: keyof Logger) {
    if (method === 'groupCollapsed') {
      // https://bugs.webkit.org/show_bug.cgi?id=182754
      if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        return [];
      }
    }
    const styles = [
      `background: ${methodToColorMap[method]}`,
      `border-radius: 0.5em`,
      `color: white`,
      `font-weight: bold`,
      `padding: 2px 0.5em`,
    ];
    const logPrefix = inGroup ? [] : [`%c${name}`, styles.join(';')];
    if (method === 'groupCollapsed') {
      inGroup = true;
    }
    if (method === 'groupEnd') {
      inGroup = false;
    }
    return logPrefix;
  };

  const logger = {} as Logger;
  for (const method of Object.keys(methodToColorMap)) {
    const logPrefix = getLogPrefix(method as keyof Logger);
    logger[method] = enableLog() ? console[method].bind(console, logPrefix[0], logPrefix[1]) : noop;
  }

  return logger;
}
