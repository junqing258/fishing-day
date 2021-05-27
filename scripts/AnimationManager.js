

require('./laya/laya.js');
require('./laya/laya.libs.js');
require('./laya/laya.LayaAnimationTool.js');
require('./laya/laya.node.js');

const fs = require('fs');
const path = require('path');

(async () => {

	let dragonBoneTools = new dragonBones.DragonBoneTools();
    function completeFun() {
      console.log("complete");
    }
    function failFun() {
      console.log("fail");
    }

    let inpath = path.resolve(__dirname, "../laya/assets/ani/"); //'http://localhost:8080/ani/';
    let outPath = path.resolve(__dirname, "../bin/assets/ani/");
    let type = 0;

    dragonBoneTools.loadFile(inpath, outPath, completeFun, failFun, type);

})();