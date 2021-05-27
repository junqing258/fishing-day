/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const NodeRSA = require('node-rsa');
const queryString = require('query-string');
const WebSocket = require('ws');
const _ = require('lodash');
const util = require('util');
const JSON5 = require('json5');
const log4js = require('log4js');

const logger = log4js.getLogger('ws');
logger.level = 'debug';

const privateKey = fs.readFileSync(path.resolve(__dirname, 'rsa/private_key.pem')).toString();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const StakeTypesConf = [
  ['12', '13', '11'],
  ['21', '22', '23', '24'],
];

const run = function () {
  const port = 7000;
  const wss = new WebSocket.Server({ port });

  wss.on('listening', () => logger.info('ws server listening:' + port));
  wss.on('connection', function connection(ws, req) {
    const { query } = queryString.parseUrl(req.url);
    const txt = String(query.auth).replace(/\ /g, '+');
    const key = new NodeRSA(privateKey);
    key.setOptions({ encryptionScheme: 'pkcs1' });
    const decrypted = key.decrypt(txt, 'utf8');
    const commKey = decrypted;
    ws.commKey = decrypted;

    ws.on('message', function incoming(msg) {
      if (msg === 'ping') {
        ws.send('pong');
        return;
      }
      const parsedData = decryptMsg(msg, commKey);
      const { cmd, params } = parsedData;
      logger.info('💬 ', cmd, _.omit(params, ['jwt']));
      if (cmd === 'replay') {
        replay(ws);
      } else if (fs.existsSync(path.join(__dirname, `./mock/${cmd}.js`))) {
        const rep = require(`./mock/${cmd}.js`)(cmd, params);
        ws.send('0' + encodeMsg(rep, commKey));
      } else {
        fs.readFile(path.join(__dirname, `./mock/${cmd}.json5`), (err, data) => {
          const rep = err ? { cmd: 'error', code: 500, msg: err.message } : JSON5.parse(data.toString());
          ws.send('0' + encodeMsg(rep, commKey));
        });
      }
    });

    ws.on('error', (err) => {
      logger.error(err);
    });

    ws.on('close', () => {
      logger.warn('🟠  ws close');
    });

    ws.send('connection');
  });

  function sendAll(rep) {
    logger.info('Send', rep);
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send('0' + encodeMsg(rep, client.commKey));
      }
    });
  }

  let t1;
  let status = 1;
  async function start() {
    status = 2;
    const r0 = await util.promisify(fs.readFile)(path.join(__dirname, `./mock/gameStart.json5`));
    sendAll(JSON5.parse(r0.toString()));

    clearInterval(t1);
    t1 = setInterval(() => {
      const stakeType = sample(StakeTypesConf.flat());
      sendAll({ cmd: 'autoBet', code: 200, data: { bet: '400', stakeType } });
    }, 300);

    await sleep(10000);

    clearInterval(t1);
    await sleep(5000);
    sendAll({ cmd: 'betOver', code: 200, data: null });

    status = 3;
    const r2 = await util.promisify(fs.readFile)(path.join(__dirname, `./mock/gameOver.json5`));
    sendAll(JSON5.parse(r2.toString()));

    await sleep(1000);

    status = 1;
    await sleep(25000);
    start();
  }

  setTimeout(() => start(), 1000);

  async function replay(ws) {
    const d = await util.promisify(fs.readFile)(path.join(__dirname, `./mock/replay.json5`));
    const rep = JSON5.parse(d);
    rep.data.rInfo.status = status;
    logger.info('🍅 ', status);
    ws.send('0' + encodeMsg(rep, ws.commKey));
  }

  function encodeMsg(data, commKey) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(commKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  function decryptMsg(data, commKey) {
    const pendingData = data.substring(1);
    const desData = CryptoJS.AES.decrypt(pendingData, CryptoJS.enc.Utf8.parse(commKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(desData.toString(CryptoJS.enc.Utf8));
  }
};

run();
