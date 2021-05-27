import EventEmitter from 'eventemitter3';

let isActive, blurTime, monitorNum, checkTimer;

export const monitorEvent = new EventEmitter();

const monitorCount = function () {
  clearInterval(checkTimer);
  checkTimer = setInterval(() => {
    monitorNum++;
  }, 1000);
};

const stageOnBlur = function () {
  if (!isActive) return;
  isActive = false;
  monitorNum = 0;
  Laya.stage.once('mousedown', null, stageOnFocus);
  monitorCount();
  blurTime = Date.now();
  if (monitorEvent) monitorEvent.emit('back');
};

const stageOnFocus = function () {
  if (isActive) return;
  isActive = true;
  clearInterval(checkTimer);
  Laya.stage.off('mousedown', null, stageOnFocus);
  const now = Date.now();
  const vorNum = Math.floor((now - blurTime) / 1000);
  if (monitorEvent) monitorEvent.emit('front');
  if (vorNum > monitorNum) {
    monitorEvent.emit('sleep');
  }
};

const visibilityChange = function () {
  if (Laya.stage.isVisibility) {
    stageOnFocus();
  } else {
    stageOnBlur();
  }
};

export const initMonitor = function () {
  isActive = true;
  Laya.stage.on('blur', null, stageOnBlur);
  Laya.stage.on('focus', null, stageOnFocus);
  Laya.stage.on('visibilitychange', null, visibilityChange);
};
