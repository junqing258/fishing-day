import { StakeTypesConf } from '@/common/Helper';
import Big from 'big.js';
import { i18n } from '@/common/i18n';
import Toast from '@/common/Toast';
import { gameStore } from '@/models/game';
import { putBet } from '@/services/game';
import { GetAmountListItem } from '@/services/model';
import { isEmpty } from '@/utils/snippets';
import { createColorFilter, lightFilter, querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';
import Confirm from '../popup/Confirm';

// 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
export default class Footer extends Laya.Box {
  private reactions: IReactionDisposer[] = [];
  betMultiple: number;
  betting: boolean;
  betAmount: number;

  onAwake(): void {
    this.timer.frameOnce(1, this, () => {
      this.setBetMultiple(10);
      this.showTab(0);
    });

    /* const viewStack = querySelector(this, 'viewStack') as Laya.Box;
    [0, 1].forEach((d) => {
      const stakeTypes = StakeTypesConf[d];
      const itemBox = viewStack.getChildByName(`item${d}`);
      stakeTypes.forEach((t, i) => {
        const betItemBox = querySelector(itemBox, `betItem[${i}]`) as any;
        const oddsLabel = betItemBox.getChildByName('odds') as Laya.Label;
        const ps = betItemBox.localToGlobal(new Laya.Point(oddsLabel.x, oddsLabel.y), false, itemBox as any);
        oddsLabel.visible = false;
        const newOddsLabel = new Laya.Label();
        newOddsLabel.color = oddsLabel.color;
        newOddsLabel.fontSize = oddsLabel.fontSize;
        newOddsLabel.x = ps.x;
        newOddsLabel.y = ps.y;
        itemBox.addChild(newOddsLabel);
        betItemBox.newOddsLabel = newOddsLabel;
      });
    }); */

    this.initEvent();
    this.initStore();
  }

  initStore(): void {
    const viewStack = querySelector(this, 'viewStack') as Laya.Box;
    this.reactions = [
      autorun(() => {
        const { tInfo } = gameStore.gameData;
        if (isEmpty(tInfo)) return;
        const { betInfo } = tInfo;
        [0, 1].forEach((d) => {
          const stakeTypes = StakeTypesConf[d];
          const itemBox = viewStack.getChildByName(`item${d}`);
          stakeTypes.forEach((t, i) => {
            const bet = betInfo.find((v) => String(v.stakeType) === String(t)) || {
              upLimit: 10000, // 投币区域投注金额上限
              balance: 0, // 投币区域已投注金额
              odds: '1.1', // 赔率
              myBalance: 0,
            };
            const betItemBox = querySelector(itemBox, `betItem[${i}]`) as any;
            // const oddsBox = querySelector(itemBox, `oddsBox`) as any;
            const oddsLabel = querySelector(itemBox, `oddsBox > odds[${i}]`) as Laya.Label;
            const balanceLabel = betItemBox.getChildByName('balance') as Laya.Label;
            const myLabel = betItemBox.getChildByName('my') as Laya.Label;

            oddsLabel.text = `x ${bet.odds}`;
            balanceLabel.text = `${bet.balance}/${bet.upLimit}`;
            myLabel.text = i18n('my_bet', { num: bet.myBalance || 0 });
          });
        });
      }),
    ];
  }

  private initEvent(): void {
    [0, 1].forEach((v) => {
      const btn = querySelector(this, `tab[${v}]`);
      btn.on(Laya.Event.CLICK, this, () => {
        if (!btn.forbidden) this.showTab(v);
      });
    });
    let changing = false;
    [0, 1, 2].forEach((v) => {
      const btn = querySelector(this, `btnAmount[${v}]`);
      btn.on(Laya.Event.CLICK, this, () => {
        if (changing) return;
        changing = true;
        this.timer.once(350, this, () => (changing = false));
        const label = btn.getChildAt(2) as Laya.Label;
        this.setBetMultiple(Number(label.text));
      });
    });
    const viewStack = querySelector(this, 'viewStack') as Laya.ViewStack;
    [0, 1].forEach((d) => {
      const stakeTypes = StakeTypesConf[d];
      const item = viewStack.getChildByName(`item${d}`) as Laya.Sprite;
      item._children.forEach((btn, i) => {
        if (btn.name === 'betItem') {
          btn.stakeTypes = stakeTypes[i];
          btn.on(Laya.Event.CLICK, this, () => {
            this.handleBetting(stakeTypes[i]);
          });
        }
      });
    });
  }

  showTab(index: number): void {
    const q = index === 0 ? [0, 1] : [1, 0];
    const tab0 = querySelector(this, `tab[${q[0]}]`) as Laya.Button;
    const tab1 = querySelector(this, `tab[${q[1]}]`) as Laya.Button;
    if (tab1.filters) return;
    tab0.filters = null;
    tab1.filters = [lightFilter(0.5)];
    tab0.forbidden = true;
    tab1.forbidden = false;
    const tabBg0 = tab0.getChildAt(0) as Laya.Sprite;
    const tabBg1 = tab1.getChildAt(0) as Laya.Sprite;
    tabBg0.y = 0;
    tabBg1.y = 4;
    const viewStack = querySelector(this, 'viewStack') as Laya.ViewStack;
    viewStack.selectedIndex = index;
  }

  handleBetting(type: string): void {
    if (this.betting) return;
    this.betting = true;
    this.timer.once(350, this, () => (this.betting = false));
    if (gameStore.userType !== 'user') {
      Confirm.getInstance().popupMsg(i18n('error_32'), {
        onSure: () => paladin?.account.login(),
      });
      return;
    }
    const currency = gameStore.gameData?.rInfo.currency;
    if (gameStore.status === 'betting') {
      const info = gameStore.amountList?.find((d) => d.currency === currency);
      if (info.balance < this.betAmount) {
        Toast.getInstance().showMsg(i18n('error_3'));
      } else {
        putBet(type, this.betMultiple);
      }
    } else {
      Toast.getInstance().showMsg(i18n('error_34'));
    }
  }

  setBetMultiple(multi: number): void {
    if (this.betMultiple === multi) return;
    const currency = gameStore.gameData?.rInfo.currency;
    [0, 1, 2].forEach((v) => {
      const btn = querySelector(this, `btnAmount[${v}]`);
      const bg = btn.getChildAt(0) as Laya.Sprite;
      const label = btn.getChildAt(2) as Laya.Label;
      const selected = (btn.selected = label.text === String(multi));
      const t = selected ? 'panel/buttonCur.png' : 'panel/buttonIcon.png';
      btn.forbidden = selected;
      bg.texture = Laya.loader.getRes(t);
    });
    const info = gameStore.amountList?.find((d) => d.currency === currency);
    if (!info.bettingMin) return;
    this.betMultiple = multi;
    this.betAmount = new Big(Number(info.bettingMin)).times(multi).toNumber();
    this.showBetTips(multi, info);
  }

  private showBetTips(multi: number, info: GetAmountListItem) {
    const currency = gameStore.gameData?.rInfo.currency;
    const tips = querySelector(this, 'betTips') as Laya.Sprite;
    const label = querySelector(tips, 'num');
    const icon = querySelector(tips, 'icon') as Laya.Image;
    const index = [1, 10, 100].indexOf(multi);
    const btn = querySelector(this, `btnAmount[${index}]`) as Laya.Button;
    icon.filters = [createColorFilter('#ffe2aa')];
    label.text = `${this.betAmount} ${currency}`;
    tips.x = btn.x - 196 / 2 - 29;
    icon.skin = info.imageUrl;
    if (tips.visible === true) return;
    tips.visible = true;
    tips.alpha = 1;
    Laya.Tween.from(
      tips,
      { alpha: 0 },
      300,
      null,
      Laya.Handler.create(this, () => {
        this.timer.once(2700, this, () => {
          this.hideBetTips();
        });
      }),
    );
  }

  private hideBetTips() {
    const tips = querySelector(this, 'betTips') as Laya.Sprite;
    Laya.Tween.to(
      tips,
      { alpha: 0 },
      300,
      null,
      Laya.Handler.create(this, () => {
        tips.visible = false;
      }),
    );
  }

  public show(): void {
    if (this.bottom === 0) return;
    Laya.Tween.to(this, { bottom: 0 }, 250, null);
  }

  public hide(): void {
    const b = -375 - 45;
    if (this.bottom === b) return;
    Laya.Tween.to(this, { bottom: b }, 250, null);
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
