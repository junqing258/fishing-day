const socketUrl = (window.paladin && paladin.sys.config.ws) || 'wss://game1-fishings.testbitgame.com/ws';
// const socketUrl = 'wss://game1-fishings.testbitgame.com/ws';

const publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMUws+7NKknmImMYUsSr4DOKYVrs1s7BQzGBgkkTptjGiektUmxm3BNZq34ugF6Vob9V0vU5r0S7vfyuOTC87uFeGe+rBJf7si4kE5wsJiEBlLNZjrz0T30xHGJlf+eizYVKPkpo3012rKvHN0obBlN7iBsdiGpLGP3sPAgO2tFQIDAQAB';

export { publicKey, socketUrl };

export const CDN_PATH = ((window.paladin && paladin.sys.config.cdn) || location.origin) + '/';

export const LanguageList = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko'];

export const FISHING_DURING = 20000;
