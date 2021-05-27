/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const csv = require('@fast-csv/format');

//https://c2fo.io/fast-csv/docs/formatting/examples

class CsvFile {
  static write(fstream, rows, options) {
    // fWrite.write(iconv.encode(read_line+'\n', 'GBK'));
    return new Promise((res, rej) => {
      csv
        .writeToStream(fstream, rows, options)
        .on('error', (err) => rej(err))
        .on('finish', () => res());
    });
  }

  constructor(opts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = {
      headers: this.headers,
      // writeBOM: true,
      includeEndRowDelimiter: true,
    };
  }

  create(rows) {
    return CsvFile.write(fs.createWriteStream(this.path, { encoding: 'utf8' }), rows, {
      ...this.writeOpts,
      writeHeaders: true,
    });
  }

  append(rows) {
    return CsvFile.write(fs.createWriteStream(this.path, { flags: 'a', encoding: 'utf8' }), rows, {
      ...this.writeOpts,
      writeHeaders: false,
    });
  }

  read() {
    return new Promise((res, rej) => {
      fs.readFile(this.path, (err, contents) => {
        if (err) {
          return rej(err);
        }
        return res(contents);
      });
    });
  }
}

module.exports = CsvFile;
