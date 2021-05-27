/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const fsextra = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const tinify = require('tinify');

tinify.key = 'ji_oer2nT8KVdzjDftCr_LKnF-DS87Za';

const BIN_DIR = path.resolve(__dirname, '../bin');
const OUTPUT_DIR = path.resolve(__dirname, '../release/bin');
const TEMP_DIR = path.resolve(__dirname, './.temp/');

const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

async function tinypng(filePath, filename) {
  const file = path.join(filePath, filename);
  const source = tinify.fromFile(file);
  const newDir = filePath.replace(BIN_DIR, OUTPUT_DIR);
  const newFile = path.join(newDir, filename);
  if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
  await source.toFile(newFile);
  console.log(chalk.green(`compress:`), path.relative(OUTPUT_DIR, newFile));
}

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const version = fsextra.readJSONSync(path.resolve(__dirname, '../bin/version.json'));
  const cachedVersion = fs.existsSync(path.join(TEMP_DIR, 'version.json'))
    ? fsextra.readJSONSync(path.join(TEMP_DIR, 'version.json'))
    : {};

  async function fileDisplay(filePath) {
    const files = fs.readdirSync(filePath);
    await runPromisesInSeries(
      files.map((filename) => async () => {
        const fileDir = path.join(filePath, filename);
        const stats = fs.statSync(fileDir);
        if (stats.isFile()) {
          if (/\.(png)$/i.test(fileDir)) {
            const name = path.relative(BIN_DIR, fileDir);
            if (version[name] !== cachedVersion[name]) {
              cachedVersion[name] = version[name];
              await tinypng(filePath, filename);
            }
          }
        } else if (stats.isDirectory()) {
          await fileDisplay(fileDir);
        }
      }),
    );
  }

  await fileDisplay(BIN_DIR);
  fsextra.writeJSONSync(path.join(TEMP_DIR, 'version.json'), cachedVersion);
})();
