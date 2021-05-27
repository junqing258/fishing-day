import { PATH } from '@/const/path/path1';
import Fish from './Fish';

/**
 * 热带小黄鱼
 */
export default class Tropical extends Fish {
  static className = 'Tropical';
  paths: { [key: string]: number[][] } = PATH;

  constructor() {
    super('fishes/ani/tropical');
  }
}
