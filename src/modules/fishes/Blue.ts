import { PATH } from '@/const/path/path1';
import Fish from './Fish';


export default class Blue extends Fish {
  static className = 'Blue';
  paths: { [key: string]: number[][] } = PATH;

  constructor() {
    super('fishes/ani/blue');
  }
}
