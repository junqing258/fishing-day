import { createSkeleton } from '@/utils/util';

export default class Loading extends Laya.Dialog {
  static instance: Loading;
  ani: Laya.Skeleton;
  constructor() {
    super();
    this.mouseEnabled = false;
    this.init();
  }

  static getInstance(): Loading {
    if (!Loading.instance) Loading.instance = new Loading();
    return Loading.instance;
  }

  private init(): void {
    this.popupEffect = null;
    this.closeEffect = null;
    this.ani = createSkeleton('game/ani/loadingIcon');
    this.addChild(this.ani);
    this.on('click', this, (e: Laya.Event) => e.stopPropagation());
    this.resizable(() => {
      this.size(Laya.stage.width, Laya.stage.height);
      this.ani.pos(this.width / 2, this.height / 2);
    });
  }

  onOpened(): void {
    this.ani.play(0, true);
  }

  onClosed(): void {
    this.event(Laya.Event.CLOSE);
    this.ani.stop();
  }
}
