import { gameStore, actions, StatusType } from '@/models/game';
import { ui } from '@/ui/layaMaxUI';
import { createSkeleton, querySelector } from '@/utils/util';
import { autorun } from 'mobx';
import CurrencyPanel from './panels/CurrencyPanel';
import Footer from './panels/Footer';
import NewGuide from './panels/NewGuide';
import PrizeCoins from './panels/PrizeCoins';
import Settle from './popup/Settle';
import VsPanel from './popup/VsPanel';
import { playSound } from './sound';

export default class Panel extends ui.PanelUI {
  private reactions: (() => void)[] = [];
  private visibleMenu: boolean;
  private visibleCurrency: boolean;
  centerArea = (this.getChildByName('centerArea') as unknown) as Laya.Box;
  footer: Footer = (this.getChildByName('footer') as unknown) as Footer;
  private status: string;
  private waitingAni: Laya.Skeleton;

  constructor() {
    super();
    this.footer.zOrder = 2;
    this.init();
  }

  private init(): void {
    this.initEvent();
    this.initStore();
    NewGuide.getInstance().run(this);
    PrizeCoins.getInstance({ panel: this });
    this.resizable(() => {
      this.height = Laya.stage.height;
      this.centerArea.y = Math.max(190, 245 - (1624 - this.height) / 2);
      this.centerArea.height = this.height / 2 - 245;
    });
  }

  initStore(): void {
    // const btnCurrency = querySelector(this, 'userInfo > btnCurrency') as Laya.Button;
    this.reactions = [
      autorun(() => {
        this.onGameStatus(gameStore.status);
      }),
    ];
  }

  onGameStatus(status: StatusType): void {
    let cdTickNum = undefined;
    switch (status) {
      case 'start':
        Settle.getInstance().close();
        VsPanel.getInstance().popup();
        this.timer.once(64 + 2000, this, () => actions.updateStatus('betting'));
        if (gameStore.gameData?.rInfo.cdTimes) {
          cdTickNum = Number(gameStore.gameData.rInfo.cdTimes);
        }
        break;
      case 'betting':
        Settle.getInstance().close();
        if (!['start', 'betting'].includes(this.status) && Number(gameStore.gameData.rInfo?.leftTimes) > 1) {
          cdTickNum = Number(gameStore.gameData.rInfo.leftTimes | 0);
        }
        break;
      case 'betOver':
      case 'fishing':
        cdTickNum = null;
        break;
      case 'fishing_cd':
        cdTickNum = 3;
        break;
      case 'ended':
        Settle.getInstance().popup();
        actions.updateCurrencySwitch(true);
        cdTickNum = null;
        break;
    }

    ['betOver', 'fishing', 'fishing_cd'].includes(status) ? this.hideFooter() : this.showFooter();

    if (['ended', 'waiting'].includes(status)) {
      this.showWattling();
    } else {
      this.hideWattling();
      if (cdTickNum) {
        this.countTick(cdTickNum);
      }
    }
    if (cdTickNum === null) this.clearCountTick();

    this.status = status;
  }

  showWattling(): void {
    const waitingBox = querySelector(this.centerArea, 'waitingBox') as Laya.Box;
    if (!this.waitingAni || this.waitingAni.destroyed) {
      this.waitingAni = createSkeleton('panel/ani/waiting');
      waitingBox.addChild(this.waitingAni);
    }
    waitingBox.visible = true;
    this.waitingAni.play(0, true);
  }

  hideWattling(): void {
    const waitingBox = querySelector(this.centerArea, 'waitingBox') as Laya.Box;
    waitingBox.visible = false;
    if (this.waitingAni && !this.waitingAni.destroyed) this.waitingAni.stop();
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
    this.timer.clearAll(this);
    PrizeCoins.resetEntities();
    VsPanel.getInstance().close();
  }

  private initEvent(): void {
    const btnMenu = querySelector(this, 'btnMenu');
    const btnCurrency = querySelector(this, 'userInfo > btnCurrency') as Laya.Button;
    const currencyPanel = querySelector(this, 'currencyPanel');

    this.on(Laya.Event.CLICK, this, (event) => {
      if (btnMenu.contains(event.target)) {
        this.toggleMenuPanel();
      } else {
        this.hideMenuPanel();
      }

      if (btnCurrency.contains(event.target)) {
        if (!btnCurrency.gray) this.toggleCurrencyPanel();
      } else if (!currencyPanel.contains(event.target)) {
        this.hideCurrencyPanel();
      }
    });
  }

  countTick(countNum: number, cb?: () => void): void {
    const timeCounter = querySelector(this.centerArea, `timeCounter`) as Laya.Box;
    const label = timeCounter.getChildAt(0) as Laya.Label;
    label.text = String(countNum);
    timeCounter.visible = this.status !== 'start' && countNum >= 1;
    if (countNum <= 3) playSound('sounds/countdown.mp3');

    Laya.Tween.to(timeCounter, { scaleX: 1.15, scaleY: 1.15 }, 130 * 0.55);
    Laya.Tween.to(timeCounter, { scaleX: 1.0, scaleY: 1.0 }, 330 * 0.55, null, null, 130 * 0.55 + 32);

    if (countNum >= 1) {
      this.timer.once(1000, this, this.countTick, [countNum - 1, cb]);
    } else {
      this.clearCountTick();
      cb && cb();
    }
  }

  clearCountTick(): void {
    if (!this.destroyed) {
      const timeCounter = querySelector(this.centerArea, `timeCounter`) as Laya.Box;
      timeCounter.visible = false;
      this.timer.clear(this, this.countTick);
    }
    // Laya.Tween.clearAll(timeCounter);
  }

  showFooter(): void {
    this.footer.show();
  }

  hideFooter(): void {
    this.footer.hide();
  }

  toggleMenuPanel(): void {
    this.visibleMenu ? this.hideMenuPanel() : this.showMenuPanel();
  }

  showMenuPanel(): void {
    const menuPanel = querySelector(this, 'menuPanel');
    this.visibleMenu = true;
    menuPanel.show();
  }

  hideMenuPanel(): void {
    const menuPanel = querySelector(this, 'menuPanel');
    this.visibleMenu = false;
    menuPanel.hide();
  }

  toggleCurrencyPanel(): void {
    this.visibleCurrency ? this.hideCurrencyPanel() : this.showCurrencyPanel();
  }

  showCurrencyPanel(): void {
    const currencyPanel = querySelector(this, 'currencyPanel') as CurrencyPanel;
    this.visibleCurrency = true;
    currencyPanel.show();
  }

  hideCurrencyPanel(): void {
    const currencyPanel = querySelector(this, 'currencyPanel') as CurrencyPanel;
    this.visibleCurrency = false;
    currencyPanel.hide();
  }
}
