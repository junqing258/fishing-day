import langs from '@/localize';
import zhHans from '@/localize/zh-Hans';
import template from '@/utils/template';
import { getQueryString } from '@/utils/util';

const LANGS = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'vi'];

export const getLang = () => {
  const lang = window.paladin?.sys.config.lang || getQueryString('lang');
  return LANGS.includes(lang) ? lang : 'en';
};

export const i18n = (key: keyof typeof zhHans, data?: any): string => {
  const lang = getLang();
  return template(langs[lang][key], data);
};

export const isFit = () => ['en', 'vi'].includes(getLang());
