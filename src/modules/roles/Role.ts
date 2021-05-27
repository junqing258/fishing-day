import { actions, gameStore } from '@/models/game';
import { getLogger } from '@/utils/getLogger';
import { sleep } from '@/utils/snippets';
import { createSkeleton } from '@/utils/util';
import { IReactionDisposer } from 'mobx';
import FishRod from './FishRod';

interface RolePropsType {
  bodyUrl: string;
  roleName: string;
}

const logger = getLogger('Role');
export default abstract class Role extends Laya.Sprite {
  private reactions: IReactionDisposer[] = [];
  roleName: string;
  protected body: Laya.Skeleton;
  public rod: FishRod;
  purposes = [];
  gainCount = 0;

  constructor({ bodyUrl, roleName }: RolePropsType) {
    super();
    this.roleName = roleName;
    this.body = createSkeleton(bodyUrl);
    this.addChild(this.body);
    this.rod = new FishRod({ roleName: roleName });
    this.rod.on('gained', this, this.onGained);
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }

  onEnable(): void {
    this.timer.frameLoop(1, this, this.loop);
    this.rod.zOrder = 2;
    this.parent.addChild(this.rod);
  }

  protected loop(): void {
    if (!this.body || this.body.destroyed) return;
    if (this.purposes.length > 0) {
      const ani = this.purposes.shift();
      this.body.play(ani, true);
    }
  }

  public async playStart(delay = 0): Promise<void> {
    this.gainCount = 0;
    this.boatOut();
    this.timer.once(delay + 1000, this, () => this.rod.startPlay());
  }

  public async replaying(): Promise<void> {
    this.boatOut(true);
    this.rod.startPlay(true);
  }

  public async endFishing(): Promise<void> {
    const { catFish, dogFish } = gameStore.overData;
    const { cat: catNum, dog: dogNum } = gameStore.counter;
    const overNum = this.roleName === 'cat' ? catFish : dogFish;
    const counterNum = this.roleName === 'cat' ? catNum : dogNum;
    const reset = overNum - counterNum;
    this.gainCount = overNum;
    this.onGained();
    await this.rod.closeUp(reset);
    await this.boatIn();
  }

  public gainFish(): void {
    if (this.gainCount >= 0 && this.gainCount < 10) {
      ++this.gainCount;
      this.gainedFishes();
    } else {
      logger.info('达到数量', this.gainCount);
    }
  }

  private gainedFishes(): void {
    this.rod.gainerFishes(this.gainCount);
  }

  onGained(): void {
    const { catFish, dogFish } = gameStore.overData;
    const counter = { ...gameStore.counter };
    if (this.roleName === 'cat') {
      counter.cat = Math.min(this.gainCount, catFish);
    } else if (this.roleName === 'dog') {
      counter.dog = Math.min(this.gainCount, dogFish);
    }
    actions.updateCounter(counter);
  }

  protected abstract boatOut(replay?: boolean): Promise<void>;

  async boatIn(): Promise<void> {
    this.body.play('drive', true);
    Laya.Tween.to(this.body, { x: 0 }, 1000, null);
    await sleep(1032);
    this.body.x = 0;
  }

  public resetForce(): void {
    this.rod.resetForce();
  }

  public drive(): void {
    this.purposes.push('drive');
  }

  public stay(): void {
    this.purposes.push('stay');
  }
}
