import { loadGuestToken } from '@/common/Helper';
import { COMM_ASSETS, LOADING_ASSETS } from '@/const/assets';
import { actions } from '@/models/game';
import { setParams } from '@/services/util/socket';
import { getLogger } from '@/utils/getLogger';
import SceneManager, { IScene } from '@/utils/SceneManager';
import { querySelector } from '@/utils/util';
import { ui } from '../ui/layaMaxUI';

const logger = getLogger('loading');
export default class LoadingScene extends Laya.Sprite implements IScene {
  private progressVal = 0;
  private progressBar; // = querySelector(this, 'progressBar') as Laya.ProgressBar;
  startTime: number;

  public static getAsset(): unknown[] {
    return [].concat(COMM_ASSETS, LOADING_ASSETS);
  }

  public async didMount(): Promise<void> {
    window.paladin && paladin.comps.launch.hide();

    const view = new ui.LoadingUI();
    this.progressBar = querySelector(view, 'progressBar') as Laya.ProgressBar;
    this.addChild(view);

    this.resizable(() => {
      view.y = (Laya.stage.height - 1624) / 2;
    });

    this.listenProcess();
    this.startTime = Date.now();
    SceneManager.emitter.on('loading', this, this.onLoading);
    SceneManager.emitter.on('loaded', this, this.onLoaded);

    const token = window?.paladin.sys.config.jwtToken || localStorage.getItem('guest_access_token');
    if (token) {
      setParams({ jwt: token });
      localStorage.removeItem('guest_access_token');
    } else {
      await loadGuestToken();
    }

    if (window?.paladin.sys.config.jwtToken) {
      logger.debug('jwtToken', window?.paladin.sys.config.jwtToken);
      actions.updateUserType('user');
    }

    SceneManager.loadScene('/game', () => {
      LoadingScene.clearLoadingAssets();
    });
  }

  private onLoading(progress: number) {
    this.progressVal = progress;
  }

  private onLoaded() {}

  private listenProcess() {
    Laya.timer.frameOnce(1, this, () => {
      const progress = this.progressVal;
      if (progress <= 0.99) {
        this.progressBar.value = progress;
        this.listenProcess();
      } else {
        this.progressBar.value = 1;
      }
    });
  }

  onDestroy(): void {
    SceneManager.emitter.off('loading', this, this.onLoading);
    SceneManager.emitter.off('loaded', this, this.onLoaded);
  }

  static clearLoadingAssets(): void {
    Object.keys(Laya.Loader.loadedMap).forEach((v: string) => {
      if (/\/loading\//.test(v)) Laya.Loader.clearRes(v);
    });
  }
}
