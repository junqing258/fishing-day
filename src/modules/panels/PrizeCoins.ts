import { StakeTypesConf } from '@/common/Helper';
import { gameStore } from '@/models/game';
import { BetItemType } from '@/services/model';
import { isEmpty, randomIntegerInRange } from '@/utils/snippets';
import { createColorFilter, querySelector } from '@/utils/util';
import { IReactionDisposer } from 'mobx';
import Panel from '../Panel';
import { playSound } from '../sound';
import Footer from './Footer';
import Big from 'big.js';

interface PropsType {
  panel: Panel;
}

const { Tween, Ease } = Laya;

class Coin extends Laya.Image {
  static __className = 'PrizeCoin';
  __className = 'PrizeCoin';
  constructor() {
    super();
    this.skin = 'panel/fish_coin.png';
    this.visible = true;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this.scale(0.8, 0.8);
  }
  public dispose(): void {
    /* this.visible = false;
    this.removeSelf();
    Laya.Pool.recoverByClass(this); */
    this.destroy();
  }
}

export default class PrizeCoins extends Laya.EventDispatcher {
  reactions: IReactionDisposer[] = [];
  static instance: PrizeCoins;
  private panel: Panel;
  private table: Footer;
  private viewStack: Laya.ViewStack;
  tableCoins: Coin[] = [];

  constructor(props: PropsType) {
    super();
    this.panel = props.panel;
    this.table = this.panel.footer;
    this.viewStack = querySelector(this.table, 'viewStack') as Laya.ViewStack;
  }

  static getInstance(props?: PropsType): PrizeCoins {
    if (!PrizeCoins.instance) PrizeCoins.instance = new PrizeCoins(props);
    return PrizeCoins.instance;
  }

  static resetEntities(): void {
    PrizeCoins.getInstance().recoverTableCoins();
    PrizeCoins.instance = null;
  }

  getCoin(): Coin {
    const coin = new Coin();
    this.tableCoins.push(coin);
    return coin;
  }

  public async playMyBet(bet: BetItemType) {
    this.playTableCoin(bet, true);
  }

  public async playAutoBet(bet: BetItemType) {
    this.playTableCoin(bet);
  }

  private playTableCoin(bet: BetItemType, isMy = false): void {
    if (!this.panel || this.panel.destroyed || isEmpty(bet)) return;
    const { stakeType } = bet;
    const { index, typeIndex } = this.getBetInfo(stakeType);
    const betItem = querySelector(this.viewStack, `item${index} > betItem[${typeIndex}]`) as Laya.Button;
    const viewIndex = this.viewStack.selectedIndex;
    const showIn = viewIndex === index;
    const coinsBox = querySelector(this.viewStack, `item${index} > prizeCoins`) as Laya.Sprite;

    const coin = this.getCoin();
    coin.zOrder = 3;
    coinsBox.addChild(coin);

    if (isMy) {
      coin.pos(375, 377 + 20);
    } else {
      coin.pos(Math.random() > 0.5 ? 770 : -20, randomIntegerInRange(0, 377));
    }
    const ps = { x: betItem.x, y: betItem.y };

    const toPos =
      viewIndex === 0
        ? {
            x: ps.x + randomIntegerInRange(-48, 48),
            y: ps.y + randomIntegerInRange(-15, 15),
          }
        : {
            x: ps.x + randomIntegerInRange(-40, 40),
            y: ps.y + randomIntegerInRange(-12, 12),
          };

    if (showIn) {
      playSound('sounds/bet.mp3');
      Tween.to(coin, toPos, 350, Ease.sineIn);
    } else {
      coin.pos(toPos.x, toPos.y);
    }
  }

  getBetInfo(stakeType) {
    let typeIndex = 0;
    const index = StakeTypesConf.findIndex((c) => {
      typeIndex = c.findIndex((v) => String(v) === String(stakeType));
      return typeIndex > -1;
    });
    return { index, typeIndex };
  }

  private recoverTableCoins(): void {
    [0, 1].forEach((index) => {
      const coinsBox = querySelector(this.viewStack, `item${index} > prizeCoins`) as Laya.Sprite;
      if (coinsBox) coinsBox.destroyChildren();
    });
    this.tableCoins = [];
  }

  public onSettle(bets: BetItemType[]): void {
    this.recoverTableCoins();
    if (!isEmpty(bets)) {
      this.prizeCoinTips(bets);
    }
  }

  private async prizeCoinTips(bets: BetItemType[] = []): Promise<void> {
    const total = (bets || []).reduce((s, v) => (s = s.add(Number(v.price))), new Big(0));
    console.log('total', total, total.valueOf());
    const prizeTotal = total.toNumber();
    if (prizeTotal > 0) {
      const currency = gameStore.gameData?.rInfo.currency;
      const info = gameStore.amountList?.find((d) => d.currency === currency);
      const prizeTips = querySelector(this.panel, 'prizeTips') as Laya.Sprite;
      const icon = querySelector(prizeTips, 'icon') as Laya.Image;
      const num = querySelector(prizeTips, 'num') as Laya.Label;
      icon.filters = [createColorFilter('#ffe2a2')];
      num.text = `+${prizeTotal} ${currency}`;
      icon.skin = info.imageUrl;
      prizeTips.visible = true;
      prizeTips.alpha = 1;
      prizeTips.pos(13, 168);
      Tween.from(prizeTips, { y: 213, alpha: 0.5 }, 650, Ease.backOut);
      Laya.timer.once(2000, this, () => (prizeTips.visible = false));
    }
  }

  bottomToPanel(btn: Laya.Button) {
    const parent = btn.parent as Laya.Sprite;
    return parent.localToGlobal(new Laya.Point(btn.x, btn.y), false, this.panel);
  }
}
