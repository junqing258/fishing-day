import { PATH } from '@/const/path/path1';
import Fish from './Fish';


export default class Jagged extends Fish {
  static className = 'Jagged';
  paths: { [key: string]: number[][] } = PATH;

  constructor() {
    super('fishes/ani/jagged');
  }
}
