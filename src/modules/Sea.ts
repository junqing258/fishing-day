import Cat from './roles/Cat';
import Dog from './roles/Dog';
import Fish, { FishPropsType } from './fishes/Fish';
import Tropical from './fishes/Tropical';
import Turtle from './fishes/Turtle';
import Jagged from './fishes/Jagged';
import Blue from './fishes/Blue';
import { gameStore, actions } from '@/models/game';
import { autorun, IReactionDisposer } from 'mobx';
import { isEmpty, isNil, randomIntegerInRange } from '@/utils/snippets';
import { OverDataType } from '@/services/model';
import { getLogger } from '@/utils/getLogger';

const logger = getLogger('Sea');

export default class Sea extends Laya.Sprite {
  private dog: Dog;
  private cat: Cat;
  private reactions: IReactionDisposer[] = [];
  private status: string;
  private overCdTime = 20;
  private overCount: number;
  private playing: boolean;
  private dogTraps: Omit<FishPropsType, 'trapType'>[];
  private catTraps: Omit<FishPropsType, 'trapType'>[];

  constructor() {
    super();
    this.addRoles();
    this.addFishes();
    this.initStore();
  }

  initStore(): void {
    this.reactions = [
      autorun(() => {
        const { status } = gameStore;
        switch (status) {
          case 'fishing': // gameOver
            if (isNil(this.status)) {
              this.reFishing();
            } else {
              this.playFishing();
            }
            break;
          case 'fishing_cd':
            break;
          case 'start':
            if (this.playing === true) {
              logger.error(`break the game`);
              this.resetForce();
            }
            Fish.resetEntities();
            break;
        }
        this.status = status;
      }),
      autorun(() => {
        const { overData } = gameStore;
        if (isEmpty(overData)) return;
        this.onOver(overData);
      }),
    ];
  }

  destroy(): void {
    this.playing = false;
    Array.from(Fish.classNames).forEach((v: string) => Laya.Pool.clearBySign(v));
    Fish.classNames.clear();
    this.timer.clearAll(this);
    this.reactions.forEach((v) => v());
    this.reactions = [];
    super.destroy();
  }

  addRoles(): void {
    this.dog = new Dog();
    this.dog.pos(270, -24);
    this.addChild(this.dog);
    this.dog.drive();

    this.cat = new Cat();
    this.cat.pos(-260, -24);
    this.addChild(this.cat);
    this.cat.drive();
  }

  public playFishing(): void {
    this.playing = true;
    // const { sequence } = gameStore.overData;
    const d = Math.random() > 0.5 ? [32, 64] : [64, 32];
    this.timer.once(d[0], this, () => this.dog.playStart());
    this.timer.once(d[1], this, () => this.cat.playStart());
  }

  private reFishing(): void {
    this.dog.replaying();
    this.cat.replaying();
  }

  private resetForce(): void {
    this.cat.resetForce();
    this.dog.resetForce();
    this.timer.clear(this, this.loopOver);
    this.playing = false;
  }

  public async endFishing(): Promise<void> {
    Fish.resetEntities();
    await Promise.all([this.dog.endFishing(), this.cat.endFishing()]);
    if (this.playing) {
      actions.updateStatus('ended');
      this.playing = false;
    }
  }

  private loopFishes(): void {
    this.createFish();
    const delay = randomIntegerInRange(64, 640);
    this.timer.once(delay, this, this.loopFishes);
  }

  addFishes(): void {
    const delay = randomIntegerInRange(16, 500);
    this.timer.once(delay, this, this.loopFishes);
  }

  /**
   * trapType  1, cat | 2, dog
   */
  createFish(props?: FishPropsType): void {
    const TYPES = [Tropical/*, Turtle*/];
    const fish = Fish.createByClass(TYPES[randomIntegerInRange(0,TYPES.length-1)], props);
    if (!fish.parent) {
      this.addChild(fish);
    }
    if (!fish.hasListener('moving')) {
      fish.on('moving', this, this.onFishMoving);
    }
    this.timer.frameOnce(1, fish, fish.move);
  }

  /** 结算 */
  private onOver(overData: OverDataType): void {
    const { catFishInfo, dogFishInfo, overCdTimes } = overData;
    if (overCdTimes) this.overCdTime = Number(overCdTimes) - 10;

    const keys = ['time', 'path', 'direction'];
    this.dogTraps = (dogFishInfo || [])
      .slice()
      .sort((a, b) => b.time - a.time)
      .map((v) => ({ ...v, sign: keys.map((k) => v[k]).join('_') }));
    this.catTraps = (catFishInfo || [])
      .slice()
      .sort((a, b) => b.time - a.time)
      .map((v) => ({ ...v, sign: keys.map((k) => v[k]).join('_') }));

    this.overCount = this.overCdTime;
    this.timer.loop(500, this, this.loopOver);
  }

  private loopOver(): void {
    this.overCount -= 0.5;
    const { counter, overData } = gameStore;
    const dogRest = overData.dogFish - counter.dog;
    const catRest = overData.catFish - counter.cat;
    if (this.overCount <= 0 && gameStore.status === 'fishing_cd') {
      this.endFishing();
      this.timer.clear(this, this.loopOver);

      if (dogRest > 1 || catRest > 1) {
        logger.error(`上钩数量错误:`, catRest, dogRest);
      }
    } else if (this.overCount <= 3) {
      if (dogRest + catRest <= 1) {
        actions.updateStatus('fishing_cd');
      } else if (Number.isInteger(this.overCount)) {
        logger.debug(`[countdown][${this.overCount}]`, catRest, dogRest);
      }
    }

    /* 添加上钩鱼 */
    if (['fishing_cd', 'fishing'].includes(gameStore.status)) {
      const catTraps = [...this.catTraps];
      const dogTraps = [...this.dogTraps];
      catTraps.forEach((v, i) => {
        if (v.time >= this.overCount) {
          const d = this.catTraps.splice(i, 1)[0];
          if (d) this.createFish({ ...d, trapType: 1 });
        }
      });
      dogTraps.forEach((v, i) => {
        if (v.time >= this.overCount) {
          const d = this.dogTraps.splice(i, 1)[0];
          if (d) this.createFish({ ...d, trapType: 2 });
        }
      });
    }
  }

  private onFishMoving(fish: Fish): void {
    if (!['fishing_cd', 'fishing'].includes(gameStore.status)) {
      return;
    }
    if (gameStore.counter.cat < gameStore.overData.catFish) {
      if (this.checkFishTrapType1(fish)) {
        this.cat.gainFish();
      }
    }
    if (gameStore.counter.dog < gameStore.overData.dogFish) {
      if (this.checkFishTrapType2(fish)) {
        this.dog.gainFish();
      }
    }
  }

  private checkFishTrapType1(fish: Fish): boolean {
    const { x, props } = fish;
    if (props?.trapType !== 1) return false;

    const trapPos = [-84, 262];
    const rod = this.cat.rod;
    if (Math.abs(x - trapPos[0]) <= 10 && rod.checkStaying()) return true;

    return false;
  }

  private checkFishTrapType2(fish: Fish): boolean {
    const { x, props } = fish;
    if (props?.trapType !== 2) return false;

    const trapPos = [82, 262];
    const rod = this.dog.rod;
    if (Math.abs(x - trapPos[0]) <= 10 && rod.checkStaying()) return true;

    return false;
  }
}
