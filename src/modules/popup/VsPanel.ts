import { createSkeleton } from '@/utils/util';

export default class VsPanel extends Laya.Dialog {
  static instance: VsPanel;
  vs: Laya.Skeleton;
  opening: boolean;
  constructor() {
    super();
    this.mouseEnabled = false;
    this.popupEffect = null;
    this.closeEffect = null;
    this.init();
  }

  static getInstance(): VsPanel {
    if (!VsPanel.instance) VsPanel.instance = new VsPanel();
    return VsPanel.instance;
  }

  private init(): void {
    this.size(Laya.stage.width, Laya.stage.height);
    this.on('click', this, (e: Laya.Event) => e.stopPropagation());
    this.vs = createSkeleton('panel/ani/vs');
    this.vs.pos(this.width / 2, this.height / 2);
    this.addChild(this.vs);
  }

  onOpened(): void {
    this.opening = true;
    const vs = this.vs;
    vs.once('stopped', this, this.close);
    vs.play(0, false);
  }

  onClosed(): void {
    this.opening = false;
    this.vs.stop();
  }

  public close() {
    if (this.opening) super.close();
  }
}
