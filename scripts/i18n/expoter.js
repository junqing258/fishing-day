#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { merge } = require('lodash');
const prettier = require('prettier');
const csv = require('fast-csv');

const { langs, outDir } = require('./constant');
const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

require('@babel/register')({
  extensions: ['.ts', '.tsx', '.jsx', '.js'],
  cache: true,
  plugins: [['@babel/plugin-transform-modules-commonjs']],
});

/**
 * starter
 */
(async () => {
  const datastore = {};

  const files = ['gofishing.csv'];

  langs.forEach((lang) => (datastore[lang] = {}));

  const formatOptions = require('../../.prettierrc.js');

  await runPromisesInSeries(
    files.map((filename) => () => {
      return new Promise((resolve) => {
        let rowCount = 0;

        const onRow = (row) => {
          const { translationId } = row;
          if (!translationId) return;
          const nameArr = translationId.split('.');
          langs.forEach((lang) => {
            const rowObj = {};
            const text = /\"(.+)\"/.test(row[lang]) ? RegExp.$1 : row[lang];
            nameArr.reduce((s, k, i, arr) => {
              return (s[k] = i < arr.length - 1 ? {} : text);
            }, rowObj);
            merge(datastore[lang], rowObj);
          });
          rowCount++;
        };

        const onEnd = () => {
          console.log(chalk.cyan(`Parsed ${filename} ${rowCount} rows`));
          resolve();
        };

        fs.createReadStream(path.resolve(__dirname, filename))
          .pipe(csv.parse({ headers: true }))
          .on('error', (error) => console.error(error))
          .on('data', onRow)
          .on('end', onEnd);
      });
    }),
  );

  await runPromisesInSeries(
    langs.map((lang) => async () => {
      const langData = datastore[lang];
      Object.keys(langData).forEach((filename) => {
        const dir = path.join(outDir, `${lang}`);
        fs.mkdirSync(dir, { recursive: true });
        const filepath = path.join(dir, `${filename}.ts`);
        let fileData = langData[filename];
        if (fs.existsSync(filepath)) {
          const preData = require(path.relative(__dirname, filepath)).default;
          fileData = merge(preData, fileData);
        }
        fs.writeFileSync(
          filepath,
          prettier.format('/* eslint-disable */\nexport default' + JSON.stringify(fileData), {
            ...formatOptions,
            parser: 'babel-ts',
          }),
        );
      });
    }),
  );
})();
