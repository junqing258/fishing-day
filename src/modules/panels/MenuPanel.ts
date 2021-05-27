import { IReactionDisposer } from 'mobx';
import Rank from '../popup/Rank';
import Records from '../popup/Records';
import Trend from '../popup/Trend';
import Verify from '../popup/Verify';
import Voice from '../popup/Voice';
import NewGuide from './NewGuide';

export default class MenuPanel extends Laya.Box {
  private reactions: IReactionDisposer[] = [];

  onAwake(): void {
    this.on(Laya.Event.CLICK, this, (event) => {
      switch (event.target?.name) {
        case 'btnHelp':
          // actions.updateGuide(1);
          NewGuide.getInstance().show();
          break;
        case 'btnRecord':
          Records.getInstance().popup();
          break;
        case 'btnRank':
          Rank.getInstance().popup();
          break;
        case 'btnVerify':
          Verify.getInstance().popup();
          break;
        case 'btnVoice':
          Voice.getInstance().popup();
          break;
        case 'btnTrend':
          Trend.getInstance().popup();
          break;
      }
    });
  }

  public show(): void {
    this.visible = true;
    this.scaleY = 0;
    Laya.Tween.to(this, { scaleY: 1 }, 250, Laya.Ease.backOut);
  }

  public hide(): void {
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
}
