import { IReactionDisposer } from 'mobx';
import Footer from './Footer';

export default class NewGuideFooter extends Laya.Box {
  private reactions: IReactionDisposer[] = [];

  onAwake(): void {
    this.timer.frameOnce(1, this, () => {
      Footer.prototype.setBetMultiple.call(this, 10);
      Footer.prototype.showTab.call(this, 0);
    });

    this.initEvent();
    Footer.prototype.initStore.call(this);
  }

  initEvent() {}

  showBetTips() {}

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
