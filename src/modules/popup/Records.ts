import { formatTime, getStakeColors, getStakeNames } from '@/common/Helper';
import { i18n, isFit } from '@/common/i18n';
import Toast from '@/common/Toast';
import { gameStore } from '@/models/game';
import { getRecordList } from '@/services/game';
import { RecordType } from '@/services/model';
import { OK_CODE } from '@/services/util/socket';
import { ui } from '@/ui/layaMaxUI';
import { isEmpty } from '@/utils/snippets';
import { querySelector } from '@/utils/util';

export default class Records extends ui.DlgRecordsUI {
  static instance: Records;
  content: Laya.Sprite;
  detail: Laya.Box;
  hashId: string;
  detailList: Laya.List;

  constructor() {
    super();
    this.zOrder = 99;
    const warp = querySelector(this, 'warp') as Laya.Sprite;
    const detail = (this.detail = querySelector(this, 'warp > content > detail'));
    const mask = new Laya.Sprite();
    mask.graphics.drawRect(0, 0, 574, 864, '#000000');
    warp.mask = mask;
    detail.x = 574;
    this.content = querySelector(this, 'warp > content') as Laya.Sprite;
    this.init();
  }

  static getInstance(): Records {
    if (!Records.instance) Records.instance = new Records();
    return Records.instance;
  }

  private init(): void {
    const list = querySelector(this.content, ' list') as Laya.List;
    const detailList1 = querySelector(this.detail, 'list_fit') as Laya.List;
    const detailList0 = querySelector(this.detail, 'list') as Laya.List;
    this.detailList = isFit() ? detailList1 : detailList0;
    this.detailList.vScrollBarSkin = '';
    this.detailList.visible = true;

    const nodata = querySelector(this, 'warp > nodata');
    const copy = querySelector(this.detail, 'hashArea > copy') as Laya.Label;
    list.vScrollBarSkin = '';
    list.selectEnable = true;
    list.renderHandler = new Laya.Handler(this, this.updateItem);
    list.on('click', this, (event) => {
      const name = String(event.target.name);
      if (name.startsWith('item')) this.onItemClick(event.target);
      else if ('btnForward' === name) this.onItemClick(event.target.parent);
    });
    this.setListArray([]);
    const btnBack = querySelector(this.content, 'detail > itemBox > btnBack') as Laya.Button;
    btnBack.on('click', this, this.hideDetail);
    nodata.on('click', this, this.handleNodata);
    copy.on('click', this, this.handleCopy);
  }

  private setListArray(array: any[]): void {
    const list = querySelector(this.content, ' list') as Laya.List;
    const nodata = querySelector(this, 'warp > nodata') as Laya.Label;
    list.array = array;
    this.content.visible = !isEmpty(array);
    nodata.visible = !this.content.visible;
    nodata.text = gameStore.userType !== 'user' ? i18n('login_to_view') : i18n('no_data');
    nodata.underline = gameStore.userType !== 'user';
  }

  private handleNodata(): void {
    if (gameStore.userType !== 'user') {
      window?.paladin.account.login();
    }
  }

  private handleCopy(): void {
    window.__CLIPBOARD_DATA__ = this.hashId;
    if (window?.paladin.account.copy) {
      window?.paladin.account.copy(this.hashId);
      Toast.getInstance().showMsg(i18n('copy_success'));
    }
  }

  onOpened(): void {
    const currency = gameStore.gameData.rInfo.currency;
    if (gameStore.userType == 'user') {
      getRecordList(currency)
        .then((rep) => {
          if (rep.code === OK_CODE) {
            this.setListArray(rep.data);
          }
        })
        .catch(() => {
          this.setListArray([]);
        });
    } else {
      this.setListArray([]);
    }
  }

  onClosed(): void {
    const content = querySelector(this, 'warp > content') as Laya.Sprite;
    content.x = 0;
  }

  onItemClick(cell: Laya.Box): void {
    this.showDetail(cell);
  }

  showDetail(cell: Laya.Box): void {
    this.updateDetail(cell.dataSource);
    const content = querySelector(this, 'warp > content') as Laya.Sprite;
    Laya.Tween.to(content, { x: -574 }, 150, null);
  }

  hideDetail(): void {
    const content = querySelector(this, 'warp > content') as Laya.Sprite;
    Laya.Tween.to(content, { x: 0 }, 150, null);
  }

  private updateItem(cell: Laya.Box): void {
    const overData = cell.dataSource;
    const currency = overData.currency || gameStore.gameData.rInfo.currency || '';

    const round = querySelector(cell, 'round') as Laya.Label;
    round.text = i18n('round_title', { num: overData.round_id });

    const time = querySelector(cell, 'time') as Laya.Label;
    time.text = formatTime(overData.time);

    const price = querySelector(cell, 'price') as Laya.Label;
    price.text = i18n('price_num', { num: Number(overData.price || 0) }) + ' ' + currency;

    const bet = querySelector(cell, 'bet') as Laya.Label;
    bet.text = i18n('bet_num', { num: Number(overData.bet_balance || 0) }) + ' ' + currency;
  }

  private updateDetail(overData: RecordType): void {
    const { catFish = 0, dogFish = 0 } = overData;
    const currency = overData.currency || gameStore.gameData.rInfo.currency || '';

    const round = querySelector(this.detail, 'itemBox > round') as Laya.Label;
    round.text = i18n('round_title', { num: overData.round_id });

    const time = querySelector(this.detail, 'itemBox > time') as Laya.Label;
    time.text = formatTime(overData.time);

    const price = querySelector(this.detail, 'itemBox > price') as Laya.Label;
    price.text = i18n('price_num', { num: overData.price || 0 }) + ' ' + currency;

    const bet = querySelector(this.detail, 'itemBox > bet') as Laya.Label;
    bet.text = i18n('bet_num', { num: overData.bet_balance || 0 }) + ' ' + currency;

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
      stakeName: {
        text: getStakeNames()[v.stakeType],
        /* color: {
          '11': '#883220',
          '12': '#48408b',
          '13': '#ffdf08',
        }[v.stakeType], */
      },
    }));
  }
}
