/* eslint-disable @typescript-eslint/no-var-requires */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fsextra = require('fs-extra');
const glob = require('glob');

const bin_dir = path.resolve(__dirname, '../bin/');
const vFile = path.join(bin_dir, 'version.json');

const runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

(async () => {
  const version = {};

  const files = glob.sync(`./bin/**`, {
    ignore: ['*.rec', '*.html', './bin/libs/**', './version.json'],
  });

  await runPromisesInSeries(
    files.map((file) => async () => {
      const stat = fs.statSync(file);
      if (stat.isFile()) {
        const md5 = await md5File(file).catch((err) => {
          console.log(chalk.red(err.toString()));
        });
        const name = path.relative(bin_dir, file);
        version[name] = `${name}?${md5.slice(0, 6)}`;
      }
    }),
  );
  fsextra.writeJSONSync(vFile, version);
  console.log('write version complete');
})();

function md5File(path) {
  return new Promise((resolve) => {
    var rs = fs.createReadStream(path);
    var hash = crypto.createHash('md5');
    rs.on('data', hash.update.bind(hash));
    rs.on('end', function () {
      resolve(hash.digest('hex'));
    });
  });
}
