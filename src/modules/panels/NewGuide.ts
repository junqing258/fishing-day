import { getLang, i18n } from '@/common/i18n';
import { actions, gameStore } from '@/models/game';
import { ui } from '@/ui/layaMaxUI';
import { querySelector } from '@/utils/util';
import { playSound } from '../sound';

export default class NewGuide extends Laya.EventDispatcher {
  static instance: NewGuide;
  static panel: Laya.View;
  stepNum: number;
  guideContainer: ui.NewGuideUI;
  maskLayer: Laya.Sprite;
  interactionArea: Laya.Sprite;
  btnPrev: Laya.Button;
  btnNext: Laya.Button;

  constructor() {
    super();

    Laya.Sprite.prototype;
  }

  static getInstance(): NewGuide {
    if (!NewGuide.instance) NewGuide.instance = new NewGuide();
    return NewGuide.instance;
  }

  public show(): void {
    if (!this.guideContainer || this.guideContainer.destroyed) {
      this.initComps();
    }
    this.step1();
  }

  private initComps(): void {
    const guideContainer = (this.guideContainer = new ui.NewGuideUI());
    const maskLayer = (this.maskLayer = new Laya.Sprite());
    maskLayer.alpha = 0.6;

    guideContainer.cacheAs = 'bitmap';
    const interactionArea = (this.interactionArea = new Laya.Sprite());
    interactionArea.blendMode = 'destination-out';
    maskLayer.addChild(interactionArea);
    this.guideContainer.addChildAt(this.maskLayer, 0);

    NewGuide.panel.addChildren(this.guideContainer);
    this.guideContainer.resizable(() => {
      if (!this.guideContainer) return;
      guideContainer.size(Laya.stage.width, Laya.stage.height);
      maskLayer.size(Laya.stage.width, Laya.stage.height);
      maskLayer.graphics.clear();
      maskLayer.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, '#000000');
    });

    const btnPrev = (this.btnPrev = querySelector(this.guideContainer, 'btnPrev'));
    const btnNext = (this.btnNext = querySelector(this.guideContainer, 'btnNext'));
    btnPrev.on('click', this, () => {
      const fn = this[`step${this.stepNum - 1}`];
      fn && fn.call(this);
    });
    btnNext.on('click', this, () => {
      const fn = this[`step${this.stepNum + 1}`];
      fn && fn.call(this);
    });

    const btnSkip = querySelector(this.guideContainer, 'btnSkip');
    btnSkip.on('click', this, () => {
      playSound('sounds/btn.mp3');
      this.close();
    });
    const btnStart = querySelector(this.guideContainer, 'step3 > close');
    btnStart.on('click', this, () => {
      this.close();
    });
    const step2Box = querySelector(this.guideContainer, 'step2');
    step2Box.on('click', this, (e: Laya.Event) => e.stopPropagation());
  }

  close(): void {
    this.guideContainer.destroy();
    const uid = window.paladin?.sys.config.uid || '';
    const gameId = window.paladin?.sys.config.gameId || '';
    localStorage.setItem(`__user_guide__${gameId}_${uid}`, '1');
    setTimeout(() => actions.updateGuide(-1), 100);
  }

  public run(panel: Laya.View): void {
    NewGuide.panel = panel;
    if (gameStore.guideStep === 1) {
      this.show();
    }
  }

  showStepComp(): void {
    this.interactionArea.graphics.clear();
    [1, 2, 3].forEach((v) => {
      const comp = querySelector(this.guideContainer, `step${v}`) as Laya.Box;
      comp.visible = v === this.stepNum;
    });
    this.btnPrev.visible = this.stepNum > 1;
    this.btnNext.visible = this.stepNum < 3;
  }

  step1(): void {
    this.stepNum = 1;
    this.guideContainer.zOrder = 99;
    this.showStepComp();
    this.interactionArea.graphics.drawRoundRect(116, 107, 339, 49, 15, '#000000');
  }

  step2(): void {
    this.stepNum = 2;
    this.guideContainer.zOrder = 99;
    this.showStepComp();
  }

  step3(): void {
    this.stepNum = 3;
    this.guideContainer.zOrder = 99;
    this.showStepComp();
    const fishNum = querySelector(this.guideContainer, 'step3 > fishNum') as Laya.Label;
    fishNum.text = i18n('fish_total', { num: 2 });

    if (['ja', 'vi'].includes(getLang())) {
      const btnClose = querySelector(this.guideContainer, 'step3 > close') as Laya.Button;
      btnClose.labelSize = 26;
    }
  }
}
