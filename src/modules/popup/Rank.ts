import { ui } from '@/ui/layaMaxUI';

export default class Rank extends ui.DlgRankUI {
  static instance: Rank;
  constructor() {
    super();
    this.init();
  }
  static getInstance(): Rank {
    if (!this.instance) this.instance = new this();
    return this.instance;
  }
  private init(): void {}
}
