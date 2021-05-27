import { playSound } from '@/modules/sound';

/* eslint-disable @typescript-eslint/no-this-alias */
const handleTouchIn = function () {
  const self = this;
  if (self.gray || self.__clicked || self.forbidden) {
    return false;
  }

  self.__clicked = true;
  self.__inTimer = Laya.Tween.to(
    self,
    { scaleX: 0.9, scaleY: 0.9 },
    100,
    null,
    Laya.Handler.create(self, function () {
      self.__inTimer = Laya.Tween.to(
        self,
        { scaleX: 1, scaleY: 1 },
        100,
        null,
        Laya.Handler.create(self, function () {
          self.__clicked = false;
        }),
      );
    }),
  );
};

const handleTouchOver = function () {
  const self = this;
  if (this.gray || this.forbidden) {
    return false;
  }
  self.__inTimer && Laya.Tween.clear(self.__inTimer);
  self.__inTimer = Laya.Tween.to(
    self,
    { scaleX: 1, scaleY: 1 },
    100,
    null,
    Laya.Handler.create(self, function () {
      self.__clicked = false;
    }),
  );
};

const addListener = function (type, caller, listener, args) {
  const self = this;
  let _listener = listener.bind(caller);
  if (type === 'click') {
    _listener = function () {
      if (self.__cd || self.gray || self.forbidden) {
        return;
      }
      self.__cd = true;
      self.timer.once(150, self, function () {
        listener.apply(caller || self, args || []);
        setTimeout(function () {
          self.__cd = false;
        }, 150);
      });
    };
  }
  return Laya.Sprite.prototype.on.call(self, type, caller, _listener, args);
};

interface ButtonType extends Laya.Button {
  decorated?: boolean;
  delay?: number;
}

function ButtonDecorator<T extends ButtonType>(button: T, props?: any): T {
  if (button.stateNum !== 1) return button;
  if (button.decorated) {
    console.warn('button destroyed');
    return;
  }
  const self = button;
  if (self.decorated) return self;
  self.decorated = true;
  props = props || {};
  if (!self.pivotX && !self.pivotY && !self.anchorX) {
    self.pivot(self.width / 2, self.height / 2);
    self.x += self.width / 2;
    self.y += self.height / 2;
  }
  self.delay = props.delay || 300;

  self.on = addListener.bind(self);
  self.on(Laya.Event.MOUSE_DOWN, self, handleTouchIn.bind(self));
  self.on(Laya.Event.MOUSE_UP, self, handleTouchOver.bind(self));
  self.on(Laya.Event.MOUSE_OUT, self, handleTouchOver.bind(self));

  return self;
}

export { ButtonDecorator as $btn };

export class IButton extends Laya.Button {
  constructor(skin = null, label = '') {
    super(skin, label);
    this.on('click', this, () => playSound('sounds/btn.mp3'));
    setTimeout(() => ButtonDecorator(this));
  }
}

/* export class ITab extends Laya.Tab {
  constructor(skin = null, label = '') {
    super(skin, label);
    this.on('click', this, () => playSound('sounds/btn.mp3'));
  }
} */
