import { sleep } from '@/utils/snippets';
import Role from './Role';

export default class Dog extends Role {
  constructor() {
    super({
      bodyUrl: 'roles/ani/dog',
      roleName: 'dog',
    });
  }

  async boatOut(replay: boolean): Promise<void> {
    const delay = replay ? 0 : 1000;
    Laya.Tween.to(this.body, { x: 375 }, delay, null);
    await sleep(delay + 32);
    this.body.x = 375;
    this.body.stop();
  }
}
