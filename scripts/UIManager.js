#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const template = require('art-template');

const UIParser = require('./gen/UIParser');

const pagePath = path.resolve(__dirname, '../laya/pages/');

(() => {
  const uiFiles = glob.sync('**/*.scene', { cwd: pagePath });
  const templates = [];
  const views = [];
  uiFiles.forEach((uiFile) => {
    const parser = new UIParser({ pagePath });
    const data = parser.parse(uiFile);
    const reg = data.viewClassMaps.filter((f) => !views.find((v) => v[0] === f[0]));
    views.push(...reg);
    const uiTpl = template(__dirname + '/tpl/ui.art', data);
    templates.push(uiTpl);
  });
  const uiMaxTpl = template(__dirname + '/tpl/ui-max.art', { templates, views });
  fs.writeFileSync(path.resolve(__dirname, '../src/ui/ui.ts'), uiMaxTpl);
})();
