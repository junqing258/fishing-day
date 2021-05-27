import { gameStore } from '@/models/game';
import { putChangeCurrency } from '@/services/game';
import { createColorFilter, formatCurrency, querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';

export default class CurrencyPanel extends Laya.Box {
  private reactions: IReactionDisposer[] = [];

  onAwake(): void {
    const list = querySelector(this, 'list') as Laya.List;
    const listBg = querySelector(this, 'bg') as Laya.Image;
    list.scrollBar.showButtons = false;
    list.renderHandler = new Laya.Handler(this, this.updateItem);
    this.reactions = [
      autorun(() => {
        const dataList = gameStore.amountList || [];
        list.array = dataList.map((v) => ({
          ...v,
          balance: formatCurrency(Number(v.balance)),
        }));
        listBg.height = Math.min(229, 28 + 52 * dataList.length);
        list.scrollBar.visible = dataList.length > 4;
      }),
    ];

    list.on('click', this, (e: Laya.Event) => {
      if (String(e.target.name).startsWith('item')) {
        const currency = gameStore.gameData?.rInfo.currency;
        const curLabel = e.target.getChildByName('currency') as Laya.Label;
        if (curLabel.text !== currency) {
          this.onSelect(curLabel.text);
        }
      }
    });
  }

  onSelect(currency: string): void {
    // const data = gameStore.amountList[index];
    putChangeCurrency(currency);
    this.hide();
  }

  updateItem(cell: Laya.Box): void {
    const icon = cell.getChildByName('imageUrl') as Laya.Image;
    icon.filters = [createColorFilter('#e8983f')];
  }

  public show(): void {
    this.visible = true;
    this.scaleY = 0;
    Laya.Tween.to(this, { scaleY: 1 }, 250, Laya.Ease.backOut);
  }

  public hide(): void {
    if (!this.visible) return;
    Laya.Tween.to(
      this,
      { scaleY: 0 },
      120,
      Laya.Ease.sineIn,
      Laya.Handler.create(this, () => {
        this.visible = false;
      }),
    );
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
