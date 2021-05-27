import { actions, gameStore } from '@/models/game';
import { querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';

export default class Counter extends Laya.Image {
  private reactions: IReactionDisposer[] = [];
  private dogCount = 0;
  private catCount = 0;
  private showing: boolean;

  onAwake(): void {
    this.reactions = [
      autorun(() => {
        const { dog, cat } = gameStore.counter;
        if (dog && dog > this.dogCount) {
          this.setDogNum(dog);
        }
        if (cat && cat > this.catCount) {
          this.setCatNum(cat);
        }
      }),
      autorun(() => {
        switch (gameStore.status) {
          case 'fishing':
            this.setCatNum(0);
            this.setDogNum(0);
            this.timer.once(350, this, () => {
              this.showCounter();
            });
            break;
          case 'fishing_cd':
            break;
          case 'start':
          case 'ended':
            this.dogCount = 0;
            this.catCount = 0;
            actions.updateCounter({
              dog: 0,
              cat: 0,
            });
            this.hideCounter();
            break;
          default:
            this.hideCounter();
            break;
        }
      }),
    ];
  }

  private setCatNum(num: number): void {
    this.catCount = num;
    const panel = querySelector(this, 'catCounter') as Laya.Image;
    const label = panel.getChildAt(0) as Laya.Label;
    label.text = `x${num}`;
  }

  private setDogNum(num: number): void {
    this.dogCount = num;
    const panel = querySelector(this, 'dogCounter') as Laya.Image;
    const label = panel.getChildAt(0) as Laya.Label;
    label.text = `x${num}`;
  }

  showCounter(): void {
    if (this.showing) return;
    this.showing = true;
    this.timer.once(32, this, this.showCat);
    this.timer.once(16, this, this.showDog);
  }

  hideCounter(): void {
    if (!this.showing) return;
    this.showing = false;
    this.hideCat();
    this.hideDog();
  }

  showCat(): void {
    const panel = querySelector(this, 'catCounter') as Laya.Image;
    panel.visible = true;
    panel.x = 0;
    Laya.Tween.from(panel, { x: -268 }, 250, Laya.Ease.sineInOut);
  }

  showDog(): void {
    const panel = querySelector(this, 'dogCounter') as Laya.Image;
    panel.visible = true;
    panel.x = 484;
    Laya.Tween.from(panel, { x: 484 + 268 }, 250, Laya.Ease.sineInOut);
  }

  private hideCat(): void {
    const panel = querySelector(this, 'catCounter') as Laya.Image;
    Laya.Tween.to(
      panel,
      { x: -268 },
      250,
      Laya.Ease.sineOut,
      Laya.Handler.create(panel, () => (panel.visible = false)),
    );
  }

  private hideDog(): void {
    const panel = querySelector(this, 'dogCounter') as Laya.Image;
    Laya.Tween.to(
      panel,
      { x: 484 + 268 },
      250,
      Laya.Ease.sineOut,
      Laya.Handler.create(panel, () => (panel.visible = false)),
    );
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
