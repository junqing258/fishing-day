/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const crypto = require('crypto');

function fileHashSync(filePath) {
  let fileData;
  try {
    fileData = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return console.error('File does not exist. Error: ', err);

    return console.error('Error: ', err);
  }
  return crypto.createHash('sha1').update(fileData, 'utf8').digest('hex');
}

module.exports = {
  fileHashSync,
};
