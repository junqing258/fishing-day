import { chunk, flatten, randomIntegerInRange, remove, sample } from '@/utils/snippets';
import { createSkeleton } from '@/utils/util';
import Mover from '../components/Mover';

import { PATH as PATHS_CONF } from '@/const/paths';

const { Handler } = Laya;

const TRAD_NO = {
  '1': ['1_10', '2_34', '2_27', '2_30', '3_93', '4_43'],
  '2': ['1_12', '2_34', '2_35', '2_36', '3_91', '3_92', '3_93'],
};

export interface FishPropsType {
  /** 1 猫捕获 2 狗捕获 */
  trapType?: undefined | 0 | 1 | 2;
  direction: 1 | -1;
  path: number;
  time: number;
  sign: string;
}

export default abstract class Fish extends Laya.Sprite {
  abstract paths: { [key: string]: number[][] };
  static className: string;
  static classNames = new Set();
  body: Laya.Skeleton;
  actions = [];
  intents = [];
  baseScale: number;
  __className: string;
  props?: FishPropsType | null;
  static SeaFishes = [];

  static createByClass<T extends Fish>(cls: any, props): T {
    const fish = Laya.Pool.createByClass(cls) as T;
    cls.__className = fish.__className = cls.className;
    this.classNames.add(cls.__className);
    fish.zOrder = randomIntegerInRange(0, 4);
    const mover: Mover = fish.getComponent(Mover);
    mover.reset();
    fish.props = props || null;
    fish.visible = true;
    if (!Fish.SeaFishes.find((v) => v === fish)) {
      Fish.SeaFishes.push(fish);
    }
    return fish;
  }

  static resetEntities(): void {
    // const pool = Laya.Pool.getPoolBySign('Tropical');
    Fish.SeaFishes.forEach((v) => {
      v.props = null;
    });
    Fish.SeaFishes = Fish.SeaFishes.filter((v: Fish) => !v.destroyed);
  }

  constructor(bodyUrl: string) {
    super();
    this.baseScale = 0.6;
    this.scaleX = this.baseScale;
    this.scaleY = this.baseScale;
    this.addComponent(Mover);
    Laya.loader.load(
      [
        { url: `${bodyUrl}.sk`, type: 'arraybuffer' },
        { url: `${bodyUrl}.png`, type: 'image' },
      ],
      Handler.create(this, () => {
        this.body = createSkeleton(bodyUrl);
        this.addChild(this.body);
      }),
    );
  }

  onDestroy(): void {
    remove(Fish.SeaFishes, (v) => v === this);
  }

  onAwake(): void {
    this.timer.frameLoop(1, this, this.loop);
  }

  private loop(): void {
    if (!this.body || this.body.destroyed) return;
    if (this.actions.length > 0) {
      const ani = this.actions.shift();
      this.body.play(ani, true);
    }
  }

  public move(): void {
    this.actions.push('move');
    const mover: Mover = this.getComponent(Mover);
    mover.start();
  }

  public stopMove(): void {
    const mover: Mover = this.getComponent(Mover);
    mover.stop();
  }

  public dispose(): void {
    this.visible = false;
    this.props = null;
    const mover: Mover = this.getComponent(Mover);
    mover.stop();
    Laya.Pool.recoverByClass(this);
  }

  onMoving(): void {
    this.event('moving', [this]);
  }

  onPathEnd(): void {
    if (!this.props?.trapType) {
      this.dispose();
    } else {
      const mover: Mover = this.getComponent(Mover);
      this.props.direction = this.props.trapType === 1 ? 1 : -1;
      this.props.path = (this.props.path + 1) % TRAD_NO[this.props.trapType].length;
      mover.reset();
      this.move();
    }
  }

  public trap(): void {
    this.props = null;
    this.onPathEnd();
  }

  public getPath(): number[][] {
    if (this.props?.trapType) return this.getTrapPath();
    const reverse = Math.random() > 0.5;
    const path = sample(Object.values(PATHS_CONF));
    return !reverse ? path : Fish.reversePath(path);
  }

  private getTrapPath(): number[][] {
    const { trapType, direction, path: pathNo } = this.props;
    const no = pathNo % TRAD_NO[trapType].length;
    const c = TRAD_NO[trapType][Math.max(0, no - 1)];
    const path = PATHS_CONF[c];
    const reverse = direction === -1;
    return !reverse ? path : Fish.reversePath(path);
  }

  /* 反转入场方向 */
  static reversePath(p: number[][]): number[][] {
    // return p.map((s) => chunk(s, 2).reverse().flat()).reverse();
    return p.map((s) => flatten(chunk(s, 2).reverse())).reverse();
  }
}
