import { formatTime, getStakeColors, getStakeNames } from '@/common/Helper';
import { i18n } from '@/common/i18n';
import Toast from '@/common/Toast';
import { getHashRecord } from '@/services/game';
import { OverDataType } from '@/services/model';
import { OK_CODE } from '@/services/util/socket';
import { ui } from '@/ui/layaMaxUI';
import { isEmpty, throttle } from '@/utils/snippets';
import { querySelector } from '@/utils/util';

export default class Verify extends ui.DlgVerifyUI {
  static instance: Verify;
  hash: string;
  detail: Laya.Sprite;
  statement: Laya.Label;
  recordHash: string;
  hashInput: Laya.TextInput;
  constructor() {
    super();
    this.zOrder = 99;
    this.initial();
  }

  static getInstance(): Verify {
    if (!Verify.instance) Verify.instance = new Verify();
    return Verify.instance;
  }

  private initial(): void {
    this.detail = querySelector(this, 'detail') as Laya.Sprite;
    this.statement = querySelector(this, 'statement') as Laya.Label;
    const btnPaste = querySelector(this, 'paste') as Laya.Label;
    const btnVerify = querySelector(this, 'btnVerify') as Laya.Button;
    btnPaste.on(Laya.Event.CLICK, this, this.handlePase);
    btnVerify.on(Laya.Event.CLICK, this, throttle(this.handleVerify, 500));
    const hashArea = querySelector(this, 'hashArea') as Laya.Sprite;
    const hashInput = (this.hashInput = querySelector(this, 'hashArea > hashInput') as Laya.TextInput);
    hashArea.on(Laya.Event.CLICK, this, () => hashInput.select());
  }

  private clearData(): void {
    this.recordHash = null;
    this.detail.visible = false;
    this.statement.visible = true;
    this.setPastedHash('');
  }

  public onOpened(): void {
    this.clearData();
  }

  public onClosed(): void {
    this.clearData();
  }

  private async handlePase(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.setPastedHash(text);
    } catch {
      if (window.__CLIPBOARD_DATA__) {
        this.setPastedHash(window.__CLIPBOARD_DATA__);
      } else {
        this.hashInput.focus = true;
        Toast.getInstance().showMsg(i18n('tips_paste'));
      }
    }
  }

  private handleVerify(): void {
    const hashInput = querySelector(this, 'hashArea > hashInput') as Laya.TextInput;
    const hash = hashInput.text;
    if (!hash || !/^[a-z0-9]{16,64}$/i.test(hash)) {
      Toast.getInstance().showMsg(i18n('tips_hash_code'));
      return;
    }
    if (this.recordHash === hash) return;

    getHashRecord(hash).then((rep) => {
      if (rep.code === OK_CODE) {
        this.recordHash = hash;
        if (rep.data.roundId) {
          this.updateDetail(rep.data as any);
        } else {
          this.updateDetail();
          Toast.getInstance().showMsg(i18n('no_search_data'));
        }
      }
    });
  }
  // dd550464de825d97c1eccad3aadc86af
  updateDetail(overData?: OverDataType): void {
    if (isEmpty(overData)) {
      this.detail.visible = false;
      this.statement.visible = true;
      return;
    }
    this.detail.visible = true;
    this.statement.visible = false;

    const { catFish = 0, dogFish = 0 } = overData;
    const currency = overData.currency || '';
    const round = querySelector(this.detail, 'itemBox > round') as Laya.Label;
    round.text = i18n('round_title', { num: overData.roundId });

    const time = querySelector(this.detail, 'itemBox > time') as Laya.Label;
    time.text = formatTime(overData.time);

    const price = querySelector(this.detail, 'itemBox > price') as Laya.Label;
    price.text = i18n('price_num', { num: Number(overData.price) }) + ' ' + currency;

    const bet = querySelector(this.detail, 'itemBox > bet') as Laya.Label;
    bet.text = i18n('bet_num', { num: Number(overData.betBalance) }) + ' ' + currency;

    const stakeType = dogFish > catFish ? '11' : catFish > dogFish ? '12' : '13';
    const winner = querySelector(this.detail, 'drawing > winner') as Laya.Label;
    winner.text = getStakeNames()[stakeType];
    winner.color = getStakeColors()[stakeType];

    const winPic = querySelector(this.detail, 'drawing > winPic') as Laya.Sprite;
    winPic.visible = dogFish !== catFish;
    winPic.x = dogFish > catFish ? 293 : catFish > dogFish ? -39 : 0;

    const vsNum = querySelector(this.detail, 'drawing > vsNum') as Laya.Label;
    vsNum.text = `${catFish}/${dogFish}`;

    const fishNum = querySelector(this.detail, 'drawing > fishNum') as Laya.Label;
    fishNum.text = i18n('fish_total', { num: catFish + dogFish });
  }

  setPastedHash(hash: string): void {
    this.hash = hash;
    /* const temp = `<div style="font-size: 25; width: 540">
          <span style="color: #fffad4">哈希值：</span>
          <input style="color: #f4e6ce">${hash}</input>
        </div>`;
    const div = querySelector(this, 'div') as Laya.HTMLDivElement;
    div.innerHTML = temp; */
    const hashLabel = querySelector(this, 'hashArea > hashLabel') as Laya.Label;
    hashLabel.text = i18n('hash_code');
    const hashInput = querySelector(this, 'hashArea > hashInput') as Laya.TextInput;
    hashInput.text = hash;
  }
}
