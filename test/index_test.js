// import '../src/utils/laya.custom.js';
function App() {
  const { Stage } = Laya;
  var stage;
  Laya.init(750, 1624, Laya.WebGL);
  stage = Laya.stage;
  stage.scaleMode = Stage.SCALE_FIXED_WIDTH;
  stage.alignH = Stage.ALIGN_CENTER;
  stage.alignV = Stage.ALIGN_MIDDLE;
  // stage.screenMode = Stage.SCREEN_HORIZONTAL;
  stage.bgColor = '#46ABFC';
}

App();

const testsContext = require.context('.', true, /test$/);
testsContext.keys().forEach(testsContext);
