/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IScene {
  active?: boolean;
  // static getAsset(): any[];
  willMount?(): Promise<void> | void;
  didMount?(): void;
  willUnMount?(): Promise<void> | void;
}

abstract class SceneType extends Laya.Sprite {
  willUnMount() {
    throw new Error('Method not implemented.');
  }
}

let currentSense: SceneType;
let currentRouter: string;
let switching = false;

const routerList = [];
const componentList = [];
const hisRouters = [];

type ComponentType = any;

const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

type PropsType = {
  reload?: boolean;
};

export default class SceneManager {
  static loading: boolean;
  static emitter = new Laya.EventDispatcher();
  static reg(list: any[]): void {
    list.forEach((v: { router: string; component: ComponentType }, i: string | number) => {
      routerList[i] = v.router;
      const ComNode = v.component;
      if (!ComNode.getInstance) {
        ComNode.getInstance = function () {
          if (!ComNode.instance || ComNode.instance.destroyed) ComNode.instance = new ComNode();
          return ComNode.instance;
        };
      }
      componentList[i] = ComNode;
    });
  }

  static loadScene(router: string, cb?: () => void, props?: PropsType): void {
    const index = routerList.indexOf(router);
    if (index === -1) return console.warn(`${router} not registered`);
    if (currentRouter && !currentSense.active) return console.warn(`${currentRouter} not active`);
    const CurComponent = componentList[index];
    const preProto = CurComponent.prototype;
    preProto.active = false;
    const promises = [];
    if (currentRouter && typeof currentSense.willUnMount === 'function') {
      promises.push(currentSense.willUnMount);
    }
    if (typeof CurComponent.getAsset === 'function') {
      const asset = CurComponent.getAsset();
      if (Array.isArray(asset) && asset.length > 0) {
        promises.push(
          () =>
            new Promise((resolve) => {
              Laya.loader.load(
                asset.filter((v) => v.type !== 'font'),
                Laya.Handler.create(null, () => {
                  this.regBitmapFonts(
                    asset.filter((v) => v.type === 'font'),
                    () => resolve(void 0),
                  );
                }),
                Laya.Handler.create(this, this.onLoading, null, false),
              );
            }),
        );
      }
    }
    if (typeof preProto.willMount === 'function') {
      promises.push(preProto.willMount);
    }

    if (promises.length > 0) {
      runPromisesInSeries(promises).then(
        () => {
          this.changeSense(router, CurComponent.trail, cb, props);
          SceneManager.onLoaded();
        },
        () => {
          SceneManager.onLoaded();
        },
      );
    } else {
      this.changeSense(router, CurComponent.trail, cb, props);
      SceneManager.onLoaded();
    }
  }

  static reload(): void {
    this.loadScene(currentRouter, null, { reload: true });
  }

  static onLoaded(): void {
    SceneManager.loading = false;
    SceneManager.emitter.event('loaded');
  }

  static onLoading(progress: number): void {
    SceneManager.loading = true;
    SceneManager.emitter.event('loading', [progress]);
  }

  static changeSense(router: string, trail: boolean, cb: { (): void; (): void; (): any }, props?: PropsType): void {
    const index = routerList.indexOf(router);
    const PrComponent = componentList[index];
    PrComponent.instance = null;
    const preSense = PrComponent.getInstance();
    if (currentRouter) {
      Laya.timer.once(32, null, () => {
        if (!currentSense.destroyed) currentSense.destroy(true);
        currentRouter = router;
        currentSense = preSense;
        currentSense.active = true;
      });
    } else {
      currentRouter = router;
      currentSense = preSense;
      currentSense.active = true;
    }

    if (trail) {
      this.pushHistory(currentRouter);
      location.hash = router;
    }

    setTimeout(() => (switching = false), 110);

    Laya.stage.addChildAt(preSense, 0);
    if (typeof cb === 'function') Laya.timer.once(32, null, () => cb());

    if (typeof preSense.didMount === 'function') {
      Laya.timer.once(32, preSense, () => preSense.didMount());
    }
  }

  static getSenseNode(router: string): any {
    const index = routerList.indexOf(router);
    if (index === -1) return console.warn(`${router} not registered`);
    return componentList[index];
  }

  static getCurSense(): ComponentType {
    return currentSense;
  }

  static getCurRouter(): string {
    return currentRouter;
  }

  static goBack(): void {
    const router = hisRouters.pop();
    if (router) this.loadScene(router);
  }

  static pushHistory(router: string): void {
    if (router) hisRouters.push(router);
  }

  static setHashRouter(router: string): void {
    location.hash = router;
    setTimeout(() => (switching = false), 110);
  }

  static regBitmapFonts(fontAssets: any[], cb: () => void): void {
    if (!fontAssets.length) return cb();
    Promise.all(
      fontAssets.map((fontRes) => {
        return new Promise((resolve) => {
          const { url, name } = fontRes;
          // if (Laya.Text._bitmapFonts && Laya.Text._bitmapFonts[name]) return resolve();
          const bitmapFont = new Laya.BitmapFont();
          bitmapFont.loadFont(
            url,
            Laya.Handler.create(this, () => {
              Laya.Text.registerBitmapFont(name, bitmapFont);
              resolve(void 0);
            }),
          );
        });
      }),
    ).then(cb);
  }
}
