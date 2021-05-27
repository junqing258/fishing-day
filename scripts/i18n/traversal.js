/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const iconv = require('iconv-lite');

const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

// 中文标点
const start_reg = /^[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
const stop_reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]$/;

const wFile = path.resolve(__dirname, './i18n1.csv');

const fWrite = fs.createWriteStream(wFile);

const dirs = ['laya/pages', 'src/modules', 'src/scenes'];

(async () => {
  await runPromisesInSeries(dirs.map((v) => () => traversalDir(path.resolve(__dirname, `../../${v}/`))));
  fWrite.close();
})();

async function handleSource(rFile) {
  return new Promise((resolve) => {
    const fRead = fs.createReadStream(rFile, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fRead,
      // output: fWrite,
      terminal: true,
    });

    let lineNum = 1;
    rl.on('line', (line) => {
      lineNum++;
      let str = iconv.encode(line, 'utf8').toString().trim();
      if (/console\./.test(str) || /\/\/.*/.test(str) || /\/\*.*\//.test(str)) {
        return;
      }
      if (/.*`.*([\u4e00-\u9fa5]+).*`.*/g.test(str)) {
        console.log('1. ------', str);
        writeLine(str);
      } else if (/.*'(.*[\u4e00-\u9fa5]((?!\').)*)'.*/g.test(str)) {
        console.log('2. ------', str);
        /*  if (str.indexOf('+') > -1 || str.indexOf('concat') > -1) {
          read_line = str;
        } */
        writeLine(str);
      } else if (/.*"(.*[\u4e00-\u9fa5]((?!\").)*)".*/g.test(str)) {
        console.log('3. ------', str);
        /* if (str.indexOf('+') > -1 || str.indexOf('concat') > -1) {
          read_line = str;
        } */
        if (/\.scene$/.test(rFile)) {
          str = str.replace(/\,$/, '');
          const d = JSON.parse('{' + str + '}')['props'];
          str = [d.text, d.label, d.labels].filter(Boolean).join('\n');
        }
        writeLine(str);
      } else if (/.*('|").*\\$/.test(str)) {
        console.log(chalk.red('++++++++++++++++', str, rFile));
      }
    });

    rl.on('close', () => {
      resolve();
      console.log(rFile, lineNum);
    });
  });
}

const outputs = [];

function writeLine(str) {
  // str = str.toString().replace(stop_reg, '').replace(start_reg, '');
  if (outputs.includes(str)) return;
  outputs.push(str);
  fWrite.write(iconv.encode(str + '\n', 'utf8'));
}

async function traversalDir(dir) {
  const all_files = fs.readdirSync(dir);
  await runPromisesInSeries(
    all_files.map((file_name) => async () => {
      const file_dir = path.join(dir, file_name);
      const stats = fs.statSync(file_dir);
      if (stats.isFile()) {
        await handleSource(file_dir);
      } else if (stats.isDirectory()) {
        await traversalDir(file_dir);
      }
    }),
  );
}
