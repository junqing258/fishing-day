import { GAME_ASSET } from '@/const/assets';
import { gameStore, actions, effects } from '@/models/game';
import Panel from '@/modules/Panel';
import Loading from '@/modules/popup/Loading';
import Voice from '@/modules/popup/Voice';
import Sea from '@/modules/Sea';
import { playMusic, playSound } from '@/modules/sound';
import { ui } from '@/ui/layaMaxUI';
import { IScene } from '@/utils/SceneManager';
import { isEmpty } from '@/utils/snippets';
import { autorun, when } from 'mobx';

export default class GameScene extends Laya.Sprite implements IScene {
  private reactions: (() => void)[] = [];
  private currency: string;
  private sea: Sea;
  private panel: Panel;
  gameUI: ui.GameUI;

  public static getAsset(): unknown[] {
    return GAME_ASSET;
  }

  constructor() {
    super();
    this.resizable(() => {
      this.height = Laya.stage.height;
    });
  }

  async willMount(): Promise<void> {
    actions.updateAmountList();
    actions.reset();
    return when(() => !isEmpty(gameStore.amountList) && !isEmpty(gameStore.gameData?.rInfo.currency));
  }

  didMount(): void {
    this.gameUI = new ui.GameUI();
    this.gameUI.centerY = 0;
    this.addChild(this.gameUI);

    Voice.getInstance().init();

    this.reactions = [
      autorun(() => {
        const { gameData } = gameStore;
        const currency = gameData.rInfo.currency;
        if (!currency || this.currency === currency) return;
        let delay = 0;
        if (this.currency) {
          this.timer.clearAll(this);
          Loading.getInstance().popup();
          actions.updateStatus('waiting');
          effects.dispose();
          this.unMountModule();
          delay = 250;
        }
        this.timer.once(delay, this, () => {
          this.mountModule();
          this.mountEffects();
          Loading.getInstance().close();
        });
        this.currency = currency;
      }),
      autorun(this.mountEffects),
      /* autorun(() => {
        switch (gameStore.status) {
          case 'fishing':
            playMusic(`sounds/play_bg.mp3`);
            break;
          case 'ended':
            this.timer.once(6000, this, () => {
             
            });
            break;
          default:
            playMusic();
            break;
        }
      }), */
    ];
    playMusic(`sounds/play_bg.mp3`);
    this.timer.once(500, this, () => {
      playSound(`sounds/fishing_bg.mp3`, 0);
    });
  }

  mountEffects(): void {
    if (gameStore.guideStep === -1) {
      effects.setup();
      actions.reset();
    } else {
      effects.dispose();
    }
  }

  mountModule(): void {
    this.sea = new Sea();
    this.sea.pos(375, 812);
    this.gameUI.addChildAt(this.sea, 2);
    this.panel = new Panel();
    this.addChild(this.panel);
  }

  unMountModule(): void {
    this.sea && this.sea.destroy();
    this.panel && this.panel.destroy();
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
