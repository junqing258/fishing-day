import { getLang } from '@/common/i18n';
import { actions, gameStore } from '@/models/game';
import { getTrendList } from '@/services/game';
import { TrendRecordType } from '@/services/model';
import { OK_CODE } from '@/services/util/socket';
import { ui } from '@/ui/layaMaxUI';
import { isEmpty } from '@/utils/snippets';
import { createColorFilter, querySelector } from '@/utils/util';
import TrendSelector from './TrendSelector';

const { Handler } = Laya;
export default class Trend extends ui.DlgTrendUI {
  static instance: Trend;
  currency: string;

  static getInstance(): Trend {
    if (!Trend.instance) Trend.instance = new Trend();
    return Trend.instance;
  }

  constructor() {
    super();
    this.zOrder = 99;
    this.initialize();
  }

  initialize(): void {
    const tab = querySelector(this, 'tab') as Laya.Tab;
    const viewStack = querySelector(this, 'viewStack') as Laya.ViewStack;
    const selectBtn = querySelector(this, 'select') as Laya.Button;
    const selectBox = querySelector(this, 'selectBox') as TrendSelector;

    if (['vi'].includes(getLang())) {
      tab.labelSize = 20;
    }

    this.on(Laya.Event.CLICK, this, (event) => {
      if (selectBtn.contains(event.target)) {
        selectBox.toggleVisible();
      } else {
        selectBox.hide();
      }
    });

    selectBox.on('currency', this, (currency: string) => {
      this.updateCurrency(currency);
    });

    tab.selectHandler = new Handler(this, () => (viewStack.selectedIndex = tab.selectedIndex));

    const list1 = querySelector(this, 'viewStack > item0 > list') as Laya.List;
    list1.scrollBar.showButtons = false;

    const list2 = querySelector(this, 'viewStack > item1 > list') as Laya.List;
    list2.scrollBar.showButtons = false;

    list1.renderHandler = new Laya.Handler(this, this.updateWinnerItem);
    list2.renderHandler = new Laya.Handler(this, this.updateCounterItem);

    this.setListArray([]);
  }

  private updateWinnerItem(cell: Laya.Box): void {
    const record = cell.dataSource as TrendRecordType;
    const { dog_fish: dogFish, cat_fish: catFish } = record;
    const icon = cell.getChildByName('type_icon') as Laya.Image;
    const winner = dogFish > catFish ? 'dog' : catFish > dogFish ? 'cat' : 'draw';
    const cx = dogFish > catFish ? 500 : catFish > dogFish ? 240 : 368;
    icon.skin = `popup/${winner}_icon.png`;
    icon.x = cx;
  }

  private updateCounterItem(cell: Laya.Box): void {
    const record = cell.dataSource as TrendRecordType;
    const { num } = record;
    const label = cell.getChildByName('num') as Laya.Label;
    let numType = 1;
    if (num === 10) numType = 2;
    else if (num >= 11 && num <= 19) numType = 3;
    else if (num === 0 || num === 20) numType = 4;
    label.x = 191 + 95 * (numType - 1);
  }

  private updateCurrency(currency: string): void {
    this.currency = currency;
    const currencyInfo = gameStore.amountList?.find((v) => v.currency === this.currency);
    const currencyIcon = querySelector(this, 'select > imageUrl');
    const currencyLabel = querySelector(this, 'select > currency');
    currencyLabel.text = this.currency;
    currencyIcon.skin = currencyInfo.imageUrl;
    currencyIcon.filters = [createColorFilter('#fffde4')];

    getTrendList(currency).then((rep) => {
      if (rep.code === OK_CODE) {
        const list = rep.data || [];
        this.setListArray(list);

        if (currency === gameStore.gameData.rInfo?.currency) {
          const vieTrends = list.map((v) => ({ type: v.type, num: v.num }));
          actions.updateTrends(vieTrends);
        }
      }
    });
  }

  private setListArray(array: any[] = []): void {
    const viewStack = querySelector(this, 'viewStack') as Laya.ViewStack;
    const list1 = querySelector(viewStack, 'item0 > list') as Laya.List;
    const list2 = querySelector(viewStack, 'item1 > list') as Laya.List;
    const nodata = querySelector(this, 'nodata');
    list1.array = array;
    list2.array = array;
    viewStack.visible = !isEmpty(array);
    nodata.visible = !viewStack.visible;
  }

  onOpened(): void {
    const currency = gameStore.gameData.rInfo.currency;
    this.updateCurrency(currency);
  }

  onClosed(): void {}
}
