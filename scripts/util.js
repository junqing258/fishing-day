/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const os = require('os');
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

// 获取本机ip
function getIPAdress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
};


module.exports = {
  getIPAdress,
  fileHashSync,
};
