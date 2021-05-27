import { gameStore } from '@/models/game';
import { querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';
import TrendPop from '../popup/Trend';

export default class TrendsComp extends Laya.Sprite {
  private reactions: IReactionDisposer[] = [];

  onAwake(): void {
    const list = querySelector(this, 'list') as Laya.List;
    list.hScrollBarSkin = '';
    list.renderHandler = new Laya.Handler(this, this.updateItem);

    this.on('click', this, () => {
      TrendPop.getInstance().popup();
    });

    this.reactions = [
      autorun(() => {
        const { vieTrends } = gameStore.gameData;
        list.array = vieTrends || [];
        list.scrollTo(0);
      }),
    ];
  }
  // 1:狗赢 orange，2:猫赢 blue，3:平 yellow
  updateItem(cell: Laya.Box): void {
    const bubble = cell.getChildByName('bubble') as Laya.Image;
    const data = cell.dataSource;
    const d = ['orange', 'blue', 'draw'][Number(data.type) - 1];
    bubble.skin = `panel/trend_${d}.png`;
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
