import { ui } from '@/ui/layaMaxUI';
import { querySelector } from '@/utils/util';

const { Sprite, Event, Handler, Tween, Ease } = Laya;

const queue = [];
export default class Toast extends ui.AlertUI {
  static instance: Toast;
  msgTxt: laya.ui.Label = querySelector(this, 'msgLabel');
  showed: any;
  maskLayer: Laya.Sprite;

  static getInstance(): Toast {
    if (!Toast.instance || Toast.instance.destroyed) Toast.instance = new Toast();
    return Toast.instance;
  }

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    const maskLayer = (this.maskLayer = new Sprite());
    maskLayer.zOrder = 999;
    this.zOrder = 1000;
    maskLayer.on(Event.MOUSE_DOWN, this, () => {});

    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.resizable(() => {
      const stage = Laya.stage;
      if (this.maskLayer) this.maskLayer.size(stage.width, stage.height);
      this.pos(stage.width / 2, stage.height / 2);
    });
  }

  public showMsg(msg: string): void {
    if (this.showed) {
      if (this.msgTxt.text !== msg) queue.push(msg);
    } else {
      this.showed = true;
      this.setMessage(msg);
    }
  }

  private setMessage(msg: string): void {
    const stage = Laya.stage;
    this.msgTxt.text = msg;

    Object.assign(this, { scaleX: 0.5, scaleY: 0.5, alpha: 0.7 });
    Tween.to(this, { scaleX: 1, scaleY: 1, alpha: 1 }, 100, Ease.backOut);

    if (!this.maskLayer.parent) stage.addChild(this.maskLayer);
    if (!this.parent) stage.addChild(this);

    this.timer.clear(this, this.hide);
    this.timer.once(2500, this, this.hide);
  }

  public hide(): void {
    Tween.to(
      this,
      { scaleX: 0.5, scaleY: 0.5, alpha: 0.7 },
      100,
      Ease.backIn,
      Handler.create(this, () => {
        this.maskLayer.removeSelf();
        this.removeSelf();
        this.showed = false;

        if (queue.length > 0) {
          for (let i = 0, len = queue.length; i < len; i++) {
            const msg = queue.shift();
            if (this.msgTxt.text !== msg) {
              return Laya.timer.once(800, this, () => this.showMsg(msg));
            }
          }
        }
      }),
    );
  }
}
