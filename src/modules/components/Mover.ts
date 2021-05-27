import Bezier from 'bezier-js';
import Fish from '../fishes/Fish';

export default class Mover extends Laya.Script {
  owner: Fish;
  private moving: boolean;
  path: number[][];
  curve: Bezier;
  pathIndex = 0;
  t = 0;
  interval = 0;
  startTimer: number;
  usedTimer: number;

  onAwake(): void {
    this.reset();
  }

  public reset(): void {
    this.pathIndex = 0;
    this.interval = 0;
    this.path = this.owner.getPath();
    this.switchCurve();
  }

  onUpdate(): void {
    if (!this.moving || !this.curve) return;

    const time = Date.now();
    const usedTimer = (this.usedTimer = time - this.startTimer);
    this.t = Math.max(this.t + this.interval, this.interval * Math.floor(usedTimer / 33));

    const pos = this.curve.get(this.t);
    const der = this.curve.derivative(this.t);

    if (this.t >= 1) {
      if (this.pathIndex < this.path.length - 1) {
        this.pathIndex += 1;
        this.switchCurve();
      } else {
        this.owner.onPathEnd();
        return;
      }
    }
    this.owner.scaleX = (der.x < 0 ? 1 : -1) * (this.owner.baseScale || 1);
    const x = pos.x - 375;
    const y = pos.y - 817;
    this.owner.pos(x, y);
    this.owner.onMoving();
  }

  start(): void {
    this.moving = true;
  }

  stop(): void {
    this.moving = false;
  }

  private switchCurve(): void {
    this.t = 0;
    this.startTimer = Date.now();
    const path = this.path[this.pathIndex];
    this.curve = new Bezier(path);
    this.interval = this.curve.length() * 0.00002 * 1;
  }
}
