import { ui } from '@/ui/layaMaxUI';
import { querySelector } from '@/utils/util';

interface PropsType {
  onSure?: () => void;
  onClosed?: () => void;
}

export default class Confirm extends ui.DlgConfirmUI {
  static instance: Confirm;
  propsData: PropsType;
  opened: boolean;

  constructor() {
    super();
    this.zOrder = 99;
    this.init();
  }

  static getInstance(): Confirm {
    if (!Confirm.instance) Confirm.instance = new Confirm();
    return Confirm.instance;
  }

  private init(): void {
    const btn = querySelector(this, 'btnSure');
    btn.on(Laya.Event.CLICK, this, () => {
      if (typeof this.propsData?.onSure === 'function') this.propsData.onSure();
      this.close();
    });
  }

  public popupMsg(msg: string, props?: PropsType): void {
    const label = querySelector(this, 'msg') as Laya.Label;
    label.text = msg;
    // const title = querySelector(this, 'title') as Laya.Label;
    // title.text = props?.onSure || props?.onClosed ? i18n('confirm') : i18n('tips');
    this.propsData = props;
    if (!this.opened) {
      super.popup();
    }
  }

  onOpened() {
    this.opened = true;
  }

  onClosed() {
    this.opened = false;
    if (typeof this.propsData?.onClosed === 'function') this.propsData.onClosed();
  }
}
