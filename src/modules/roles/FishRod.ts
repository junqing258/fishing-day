import { sleep } from '@/utils/snippets';
import { createSkeleton } from '@/utils/util';
import { playSound } from '../sound';

/**
 * 鱼竿
 */
export default class FishRod extends Laya.Sprite {
  splash: Laya.Skeleton;
  body: Laya.Skeleton;
  count = 0;
  status: 'end' | 'gaining' | 'staying' | 'finishing' = 'end';
  roleName: string;

  constructor(props: any) {
    super();
    this.body = createSkeleton('fishes/ani/fishrod_new');
    this.splash = createSkeleton('fishes/ani/splash');
    this.addChildren(this.body, this.splash);
    this.roleName = props.roleName;
    this.body.on('stopped', this, this.onGainAniStop);
  }

  /**
   * 下杆
   */
  public startPlay(replay?: boolean) {
    if (replay) {
      this.palyStay();
    } else {
      // this.body.once('stopped', this, this.palyStay);
      this.timer.once(750, this, this.palyStay);
      this.body.play('casting', false);
      this.splash.play('casting', false);
      this.timer.once(300, this, () => playSound('sounds/hook_water.mp3'));
    }
  }

  public checkStaying(): boolean {
    return this.status === 'staying';
  }

  private palyStay(): void {
    this.status = 'staying';
    this.body?.play('stay', true);
  }

  /**
   * 收竿
   */
  public async closeUp(reset?: number): Promise<void> {
    const name = this.status !== 'staying' || reset >= 1 ? `end_1` : 'end';
    this.body.play(name, false);
    this.splash.play('end', false);
    this.status = 'end';
    if (reset >= 1) {
      this.event('gained');
    }
    this.count = 0;

    await sleep(17000 / 24);
    this.body?.play('spray', false);
  }

  public resetForce(): void {
    this.body.play('spray', false);
    this.timer.clearAll(this);
    this.status = 'end';
  }

  /**
   * 上鱼
   */
  public gainerFishes(num: number): void {
    this.count = num;
    if (num) {
      playSound('sounds/gain.mp3');
    }
    this.splash.play('spray', false);
    this.status = 'gaining';
    /* this.body.play('gain', false); */
    this.onGainAniStop();
  }

  private onGainAniStop(): void {
    switch (this.status) {
      case 'staying':
        break;
      case 'gaining':
        this.status = 'finishing';
        this.body?.play('finish', false);
        break;
      case 'finishing':
        this.status = 'staying';
        this.body?.play('stay', true);
        this.event('gained');
        break;
      case 'end':
        break;
    }
  }

  destroy(): void {
    super.destroy();
    this.body = null;
  }
}
