/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function uuid() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
export function formatDate(date: Date, fmt = 'yyyy-MM-dd hh:mm:ss'): string {
  const o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
  return fmt;
}

export function formatCurrency(num: number | string, len = 12, maxDecimal = 6): string {
  if (!num) return '0';
  if (window.paladin) {
    return '' + paladin.tools.formatAmount(Number(num), len, maxDecimal);
  }
  num = String(num);
  const sp = num.split('.');
  if (sp[0].length > len) {
    if (sp[0].length > 10) return formatCurrency(Number(sp[0]) / 1000000000, 7) + 'M';
    else if (sp[0].length > 7) return formatCurrency(Number(sp[0]) / 1000000, 7) + 'B';
    // else if (sp[0].length > 4) return Number(sp[0]) / 1000 + 'K';
  }
  return [sp[0], sp[1]?.substr(0, Math.max(0, len - sp[0].length))].filter(Boolean).join('.');
}

/**
 * 数字千分位格式化
 */
export function toThousands(num: string) {
  let result = '',
    counter = 0;
  num = (num || 0).toString();
  for (let i = num.length - 1; i >= 0; i--) {
    counter++;
    result = num.charAt(i) + result;
    if (!(counter % 3) && i != 0) {
      result = ',' + result;
    }
  }
  return result;
}

export function getCharLength(str: string) {
  let countLen = 0;
  let strLen = 0;
  strLen = str.length;
  for (let i = 0; i < strLen; i++) {
    const a = str.charAt(i);
    countLen++;
    if (escape(a).length > 4) {
      countLen++;
    }
  }
  return countLen;
}

export function ellipsis(str: string, len: number): string {
  let countLen = 0;
  let strLen = 0;
  let strCut = '';
  strLen = str.length;
  for (let i = 0; i < strLen; i++) {
    const a = str.charAt(i);
    countLen++;
    if (escape(a).length > 4) {
      countLen++;
    }
    strCut = strCut.concat(a);
    if (countLen > len) {
      strCut = strCut.concat('...');
      return strCut;
    }
  }
  if (countLen <= len) {
    return str;
  }
}

export function getQueryString(name: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r !== null) {
    return window.unescape(r[2]);
  }
  return null;
}

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function grayFilter(n: number) {
  n = n || 0;
  const grayMat = [
    0.3086 * (1 - n) + n,
    0.6094 * (1 - n),
    0.082 * (1 - n),
    0,
    0,
    0.3086 * (1 - n),
    0.6094 * (1 - n) + n,
    0.082 * (1 - n),
    0,
    0,
    0.3086 * (1 - n),
    0.6094 * (1 - n),
    0.082 * (1 - n) + n,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
  return new Laya.ColorFilter(grayMat);
}

export function lightFilter(n: number) {
  n = n || 0;
  const lightMat = [n, 0, 0, 0, 0, 0, n, 0, 0, 0, 0, 0, n, 0, 0, 0, 0, 0, 1, 0];
  return new Laya.ColorFilter(lightMat);
}

export function createColorFilter(r: number | string, g?: number, b?: number, a = 255) {
  if (typeof r === 'string') {
    const rgb = hexToRgb(r);
    r = rgb.r;
    g = rgb.g;
    b = rgb.b;
    a = 255;
  }
  r = r / 255;
  g = g / 255;
  b = b / 255;
  a = a / 255;

  // prettier-ignore
  const redMat = [
      r, 0, 0, 0, 0, // R
      0, g, 0, 0, 0, // G
      0, 0, b, 0, 0, // B
      0, 0, 0, a, 0, // A
  ];

  // 创建一个颜色滤镜对象,红色
  return new Laya.ColorFilter(redMat);
}

/**
 * @public
 * 创建骨骼动画
 * @param {String} path 骨骼动画路径
 * @param {Number} rate 骨骼动画帧率，引擎默认为30，一般传24
 * @param {Number} type 动画类型 0,使用模板缓冲的数据，模板缓冲的数据，不允许修改	（内存开销小，计算开销小，不支持换装） 1,使用动画自己的缓冲区，每个动画都会有自己的缓冲区，相当耗费内存 （内存开销大，计算开销小，支持换装） 2,使用动态方式，去实时去画	（内存开销小，计算开销大，支持换装,不建议使用）
 * @return Skeleton骨骼动画
 */
const paths = [];
const temps = [];
export function createSkeleton(path: string, rate = 24, type = 0): Laya.Skeleton {
  const png = Laya.loader.getRes(path + '.png');
  const sk = Laya.loader.getRes(path + '.sk');
  if (!png || !sk) {
    console.error('Resource not loaded:' + path);
    return null;
  }
  const index = paths.indexOf(path);
  let templet: Laya.Templet;
  if (index === -1) {
    templet = new Laya.Templet();
    const len = paths.length;
    paths[len] = path;
    temps[len] = templet;
    templet.parseData(png, sk, rate);
  } else {
    templet = temps[index];
  }
  return templet.buildArmature(type);
}

export function querySelector(ele: any, str): any {
  const s: string[] = str.split('>').map((v) => v.trim());
  let result = null;
  let n;
  while ((n = s.shift())) {
    const nodes = ele._children;
    let name = n,
      index = 0;
    let t;
    if ((t = n.match(/(\w+)\[(\d+)\]/))) {
      name = t[1];
      index = Number(t[2]);
    }
    result = null;
    if (nodes) {
      for (let i = 0, n = nodes.length; i < n; i++) {
        const node = nodes[i];
        if (node.name === name && index-- === 0) {
          result = ele = node;
          break;
        }
      }
    }
  }
  return result;
}
