import { formatTime, getStakeColors, getStakeNames } from '@/common/Helper';
import { i18n, isFit } from '@/common/i18n';
import Toast from '@/common/Toast';
import { actions, gameStore } from '@/models/game';
import { OverDataType } from '@/services/model';
import { ui } from '@/ui/layaMaxUI';
import { isEmpty, sleep } from '@/utils/snippets';
import { querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';
import PrizeCoins from '../panels/PrizeCoins';
import { playSound } from '../sound';

export default class Settle extends ui.DlgSettleUI {
  static instance: Settle;
  private reactions: IReactionDisposer[] = [];
  detail: Laya.Sprite;
  hashId: string;
  opening: boolean;
  detailList: Laya.List;
  constructor() {
    super();
    this.closeEffect = null;
    this.zOrder = 99;
    this.init();
  }
  static getInstance(): Settle {
    if (!Settle.instance) Settle.instance = new Settle();
    return Settle.instance;
  }
  private init(): void {
    this.detail = querySelector(this, 'detail');
    const detailList1 = querySelector(this.detail, 'list_fit') as Laya.List;
    const detailList0 = querySelector(this.detail, 'list') as Laya.List;
    this.detailList = isFit() ? detailList1 : detailList0;
    this.detailList.vScrollBarSkin = '';
    this.detailList.visible = true;
  }

  onAwake(): void {
    this.reactions = [
      autorun(() => {
        const { overData } = gameStore;
        this.updateDetail(overData);
      }),
    ];
    const btnCopy = querySelector(this.detail, 'hashArea > copy') as Laya.Label;
    btnCopy.on('click', this, this.handleCopy);
  }

  private updateDetail(overData: OverDataType): void {
    const { catFish = 0, dogFish = 0 } = overData;
    const currency = overData.currency || gameStore.gameData.rInfo.currency;

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

    const hash = querySelector(this.detail, 'hashArea > hash') as Laya.Label;
    this.hashId = overData.hashId;
    hash.text = i18n('round_hash', { hash: overData.hashId });

    this.detailList.array = overData?.bets?.map((v) => ({
      ...v,
      balance: i18n('bet_num', { num: v.balance + ' ' + currency }),
      price: i18n('price_num', { num: v.price + ' ' + currency }),
      stakeName: getStakeNames()[v.stakeType],
    }));
    const listTitle = querySelector(this.detail, 'listTitle') as Laya.List;
    listTitle.visible = !isEmpty(overData?.bets);
  }

  private handleCopy(): void {
    window.__CLIPBOARD_DATA__ = this.hashId;
    if (window?.paladin.account.copy) {
      window?.paladin.account.copy(this.hashId);
      Toast.getInstance().showMsg(i18n('copy_success'));
    }
    /* navigator.clipboard.writeText(this.hashId).then(
      () => {
      },
      (err) => {
      },
    ); */
  }

  onOpened(): void {
    this.opening = true;
    playSound('sounds/settle.mp3');
    this.timer.once(1000 * 10, this, this.close);
  }

  async onClosed() {
    this.opening = false;
    this.timer.clear(this, this.close);

    if (!isEmpty(gameStore.overData)) {
      const { catFish, dogFish } = gameStore.overData;

      const bets = (gameStore.overData.bets || []).slice();
      await sleep(500);
      await PrizeCoins.getInstance().onSettle(bets);
      if (!isEmpty(bets)) {
        actions.updateAmountList();
      }
      const type = dogFish > catFish ? 1 : catFish > dogFish ? 2 : 3;
      const num = catFish + dogFish;
      const vieTrends = gameStore.gameData?.vieTrends || [];
      vieTrends.unshift({ type, num });
      actions.updateTrends(vieTrends);
      actions.updateOverData({} as OverDataType);
    }
  }

  public close() {
    if (this.opening) super.close();
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
