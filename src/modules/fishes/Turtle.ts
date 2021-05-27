import { PATH } from '@/const/path/path1';
import Fish from './Fish';

/**
 * 海龟
 */
export default class Turtle extends Fish {
  static className = 'Turtle';
  paths: { [key: string]: number[][] } = PATH;

  constructor() {
    super('fishes/ani/turtle');
  }
}
