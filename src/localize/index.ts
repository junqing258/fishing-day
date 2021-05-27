import en from './en/index';
import ja from './ja/index';
import ko from './ko/index';
import vi from './vi/index';
import zhHant from './zh-Hant/index'; // 繁体中文
import zhHans from './zh-Hans/index'; // 简体中文

const langs = {
  en,
  ja,
  ko,
  vi,
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
};

export default langs;
