import langs from '@/localize';
import { getLang, i18n } from './i18n';

export default class I18nComponent extends Laya.Script {
  onAwake(): void {
    if (getLang() !== 'zh-Hans') {
      this.traverse(this.owner);
    }
  }

  traverse(ele: Laya.Node): void {
    const nodes = ele['_children'];
    if (nodes?.length) {
      for (let i = 0, n = nodes.length; i < n; i++) {
        const node = nodes[i];
        if (node.text && /(.*[\u4e00-\u9fa5].*)/.test(node.text)) {
          const info = langs['zh-Hans'];
          for (const key in info) {
            if (info[key] === node.text) {
              node.text = i18n(key as any);
            }
          }
        } else {
          this.traverse(node);
        }
      }
    }
  }
}
