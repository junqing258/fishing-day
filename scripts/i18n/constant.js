/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * i18n配置
 */
const path = require('path');
const glob = require('glob');

const langs = ['zh-Hans', 'en', 'ja']; // , 'ko', 'vi', 'zh-Hant'
const headers = ['translationId', ...langs, 'remarks'];
const outDir = path.resolve(__dirname, '../../src/localize');

const excludes = [];

const appModules = glob
	.sync('./src/localize/zh-Hans/**.ts')
	.map((v) => path.parse(v).name)
	.filter((v) => !excludes.includes(v));

console.log('modules:', appModules);

module.exports = {
	langs,
	headers,
	outDir,
	appModules,
};