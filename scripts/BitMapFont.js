#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const child_process = require('child_process');
// const glob = require('glob');
const template = require('art-template');
const { execSync, spawn, exec } = child_process;

// https://www.cnblogs.com/sandal1980/articles/3904623.html
(() => {
  const name = 'org_slackey';

  const dir = path.resolve(__dirname, '../laya/fonts');
  console.log('dir', dir);
  const args = [];
  args.push(`--sheet ../assets/bitmapFont/${name}.png`);
  args.push('--data ../assets/out.json');
  args.push('--format laya');
  args.push(name);

  const str = 'TexturePacker ' + args.join(' ');
  console.log(str);
  execSync(str, { cwd: dir });

  const data = fse.readJsonSync(path.join(dir, '../assets/out.json'));
  fse.removeSync(path.join(dir, `../assets/out.json`));

  const frames = Object.keys(data.frames);

  let maxW = 0,
    maxH = 0;
  const chars = frames.map((fname) => {
    const v = data.frames[fname];
    const id = fname.split('.')[0].charCodeAt();
    const f = v.frame;
    if (maxW < f.w) maxW = f.w;
    if (maxH < f.h) maxH = f.h;
    return `<char id="${id}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" xoffset="0" yoffset="0" xadvance="${f.x}" page="0" chnl="15"/>`;
  });

  const outData = {
    chars,
    file: data.meta.image,
    charCount: frames.length,
    scaleW: data.meta.scaleW,
    scaleH: data.meta.scaleH,
    maxW,
    maxH,
  };

  const fntTpl = template(__dirname + '/tpl/tpl-fnt.art', outData);
  fs.writeFileSync(path.join(dir, `../assets/bitmapFont/${name}.fnt`), fntTpl);
})();
