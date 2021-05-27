/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * 异步
 */

export const pipeAsyncFunctions = (...fns) => (arg) => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

export const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const chainAsync = (fns) => {
  let curr = 0;
  const last = fns[fns.length - 1];
  const next = () => {
    const fn = fns[curr++];
    fn === last ? fn() : fn(next);
  };
  return next;
};

export const promisify = (func) => (...args) =>
  new Promise((resolve, reject) => func(...args, (err, result) => (err ? reject(err) : resolve(result))));

/**
 * 函数
 */
export const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

export const curry = (fn, arity = fn.length, ...args) =>
  arity <= args.length ? fn(...args) : curry.bind(null, fn, arity, ...args);

export const debounce = (fn, ms = 0) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime;
  return function () {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(function () {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};

/* Math */
export const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

export const randomIntegerInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomIntArrayInRange = (min, max, n = 1) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);

export const sumBy = (arr, fn) =>
  arr.map(typeof fn === 'function' ? fn : (val) => val[fn]).reduce((acc, val) => acc + val, 0);

/** 数组 */
export const difference = (a, b) => {
  const s = new Set(b);
  return a.filter((x) => !s.has(x));
};

export const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

export const flatten = (arr, depth = 1) =>
  arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v), []);

export const remove = (arr, func) =>
  Array.isArray(arr)
    ? arr.filter(func).reduce((acc, val) => {
        arr.splice(arr.indexOf(val), 1);
        return acc.concat(val);
      }, [])
    : [];

/** 对象 */

/** Type */
export const isNil = (val) => val === undefined || val === null;

export const isEmpty = (val) => val == null || !(Object.keys(val) || val).length;

export const is = (type, val) => ![, null].includes(val) && val.constructor === type;

export const isObject = (obj) => obj === Object(obj);

export const isPlainObject = (val) => !!val && typeof val === 'object' && val.constructor === Object;

export const getType = (v) => (v === undefined ? 'undefined' : v === null ? 'null' : v.constructor.name);

export const equals = (a, b) => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
  if (a.prototype !== b.prototype) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => equals(a[k], b[k]));
};

export const deepClone = (obj) => {
  if (obj === null) return null;
  const clone = Object.assign({}, obj);
  Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]));
  if (Array.isArray(obj)) {
    clone.length = obj.length;
    return Array.from(clone);
  }
  return clone;
};

export const omit = <T>(obj: T, arr): any =>
  Object.keys(obj)
    .filter((k) => !arr.includes(k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {});

export const omitBy = (obj, fn) =>
  Object.keys(obj)
    .filter((k) => !fn(obj[k], k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {});

export const pick = (obj, arr) => arr.reduce((acc, curr) => (curr in obj && (acc[curr] = obj[curr]), acc), {});

export const pickBy = (obj, fn) =>
  Object.keys(obj)
    .filter((k) => fn(obj[k], k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {});
