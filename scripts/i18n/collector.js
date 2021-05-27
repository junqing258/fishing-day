#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
/* tslint:disable */
const fs = require('fs');
const path = require('path');
const moment = require('dayjs');
const chalk = require('chalk');
const { runPromisesInSeries } = require('./utils');
const csv = require('fast-csv');
const CsvFile = require('./CsvFile');
const { headers, langs, appModules } = require('./constant');
const argv = require('node-argv');

require('@babel/register')({
  extensions: ['.ts', '.tsx', '.jsx', '.js'],
  cache: true,
  plugins: [['@babel/plugin-transform-modules-commonjs']],
});

let availableIds = [];

const args = argv(process.argv.slice(2), {});
const { options } = args;

function genFileData(namespace, fileData, lang) {
  return Object.keys(fileData).reduce((s, key) => {
    const v = fileData[key];
    if (namespace === 'translationId') debugger;
    const translationId = [namespace, key].join('.');
    if (typeof v === 'object') {
      return s.concat(genFileData(translationId, v, lang));
    }
    if (availableIds.includes(translationId)) return s;

    const text = fileData[key].trim();
    // if (text && text.indexOf(',') > -1) text = ['"', text, '"'].join('');

    s.push({ translationId, [lang]: text });
    return s;
  }, []);
}

/** 排除生产部分 */
async function readAvailableIds() {
  const translationIds = [];

  const files = [];

  await runPromisesInSeries(
    files.map((file) => () => {
      return new Promise((resolve) => {
        const onRow = (row) => {
          const { translationId } = row;
          if (translationId) {
            translationIds.push(translationId);
          }
        };
        const onEnd = () => {
          resolve(translationIds);
        };
        fs.createReadStream(path.resolve(__dirname, file))
          .pipe(csv.parse({ headers: true }))
          .on('error', (error) => console.error(error))
          .on('data', onRow)
          .on('end', onEnd);
      });
    }),
  );

  return translationIds;
}

/**
 * starter
 */
(async () => {
  const { all } = options;

  const outFile = `gofishing${all ? '' : '_'+ moment().format('MMDD')}.csv`;

  const writeFile = new CsvFile({
    path: path.resolve(__dirname, outFile),
    headers,
  });

  availableIds = await readAvailableIds();
  let created = false;

  await runPromisesInSeries(
    appModules.map((mod) => async () => {
      let mainLangList;

      langs.forEach((lang) => {
        const langFile = path.resolve(__dirname, `../../src/localize/${lang}/${mod}.ts`);
        if (!fs.existsSync(langFile)) return;
        const langData = require(path.relative(__dirname, langFile)).default;
        if (!langData) return;
        const langDataList = genFileData(mod, langData, lang);
        if (mainLangList) {
          langDataList.forEach((langRow) => {
            const dataRow = mainLangList.find((v) => v.translationId == langRow.translationId);
            if (dataRow && langRow[lang] && !dataRow[lang]) {
              dataRow[lang] = langRow[lang];
            } else {
              // console.log('待清理:', lang, langRow.translationId);
            }
          });
        } else {
          mainLangList = langDataList;
        }
      });
      let outDataList = mainLangList;
      if (!all) {
        // if (!mainLangList) debugger;
        outDataList = mainLangList.filter((v) => !langs.every((lang) => v[lang]));
      }

      if (!created && outDataList.length) {
        created = true;
        await writeFile.create(outDataList);
      } else if (outDataList.length) {
        await writeFile.append([].concat(outDataList));
      }
    }),
  );

  console.log(chalk.cyan('完成 >> ' + outFile));
})();
