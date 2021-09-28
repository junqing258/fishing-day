import './utils/laya.custom.ts';
import SceneManager from './utils/SceneManager';
import GameConfig from './GameConfig';
import LoadingScene from '@/scenes/LoadingScene';
import GameScene from '@/scenes/GameScene';
import { IButton } from './common/Button';
import Big from 'big.js';
import { initMonitor, monitorEvent } from './common/Monitor';
import { handleError } from './services/errors';

const { ResourceVersion, Handler } = Laya;

Laya.ClassUtils.regClass('Button', IButton);

Big.RM = 0; //设置Big.js为向下取整
Big.NE = -10; // 科学计数位数

UIConfig.closeDialogOnSide = false;

export default (): void => {
  Laya.init(GameConfig.width, GameConfig.height, Laya.WebGL);
  const stage = Laya.stage;
  stage.scaleMode = GameConfig.scaleMode;
  stage.alignH = GameConfig.alignH;
  stage.alignV = GameConfig.alignV;
  stage.screenMode = GameConfig.screenMode;
  // stage.frameRate = 'slow';
  stage.bgColor = '#33679f';
  Laya.URL.basePath = window.paladin?.sys.config.cdn || location.origin + '/';
  // Laya.URL.useMultipleBasePath = Laya.URL.basePath instanceof Array; //

  ['mousewheel', 'DOMMouseScroll'].forEach(function (event) {
    Laya.Browser.container.addEventListener(event, function (e) {
      e.preventDefault();
    });
  });

  /* if (document.webkitFullscreenElement) {
    document.webkitCancelFullScreen();
  } else {
    const el = document.documentElement;
    el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } */

  initMonitor();
  monitorEvent.on('sleep', () => {
    window.location.reload();
  });

  SceneManager.reg([
    { router: '/loading', component: LoadingScene },
    { router: '/game', component: GameScene },
  ]);

  //设置版本控制类型为使用文件名映射的方式
  ResourceVersion.type = ResourceVersion.FILENAME_VERSION;
  //加载版本信息文件
  ResourceVersion.enable(
    'version.json' + `?${__webpack_hash__}`,
    Handler.create(this, () => {
      SceneManager.loadScene('/loading', () => {
        document.body.classList.remove('paladin-container');
        window.paladin?.comps.launch.hide();
        handleError();
      });
    }),
  );
};
