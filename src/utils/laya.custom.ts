/* eslint-disable */
(function () {
  Laya.Sprite.prototype.resizable = function (cb) {
    let self = this;
    let stage = Laya.stage;
    if (!stage || typeof cb !== 'function') return;
    cb();
    var _resizeCb = function () {
      if (self.resizeTimer) return;
      self.resizeTimer = true;
      setTimeout(function () {
        self.resizeTimer = false;
      }, 300);
      if (!self || self.destroyed) {
        stage.off('resize', null, _resizeCb);
      } else if (self.displayedInStage !== false) {
        cb();
      }
    };
    stage.on('resize', null, _resizeCb);
  };

  Laya.Graphics.prototype.drawRoundRectComplex = function (x, y, w, h, rTL, rTR, rBR, rBL, fillStyle) {
    let max = (w < h ? w : h) / 2;
    let mTL = 0,
      mTR = 0,
      mBR = 0,
      mBL = 0;
    if (rTL < 0) {
      rTL *= mTL = -1;
    }
    if (rTL > max) {
      rTL = max;
    }
    if (rTR < 0) {
      rTR *= mTR = -1;
    }
    if (rTR > max) {
      rTR = max;
    }
    if (rBR < 0) {
      rBR *= mBR = -1;
    }
    if (rBR > max) {
      rBR = max;
    }
    if (rBL < 0) {
      rBL *= mBL = -1;
    }
    if (rBL > max) {
      rBL = max;
    }

    this.drawPath(
      0,
      0,
      [
        ['moveTo', x + w - rTR, y],
        ['arcTo', x + w + rTR * mTR, y - rTR * mTR, x + w, y + rTR, rTR],
        ['lineTo', x + w, y + h - rBR],
        ['arcTo', x + w + rBR * mBR, y + h + rBR * mBR, x + w - rBR, y + h, rBR],
        ['lineTo', x + rBL, y + h],
        ['arcTo', x - rBL * mBL, y + h + rBL * mBL, x, y + h - rBL, rBL],
        ['lineTo', x, y + rTL],
        ['arcTo', x - rTL * mTL, y - rTL * mTL, x + rTL, y, rTL],
        ['closePath'],
      ],
      { fillStyle: fillStyle },
    );
  };
  Laya.Graphics.prototype.drawRoundRect = function (x, y, w, h, radius, fillStyle) {
    return this.drawRoundRectComplex(x, y, w, h, radius, radius, radius, radius, fillStyle);
  };
})();
