// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Vector = function (x = 0, y = 0) {
  this.x = x;
  this.y = y;
};

Vector.prototype = {
  constructor: Vector,
  // 获取向量大小（即向量的模），即两点间距离
  getMagnitude: function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  },
  len: function () {
    return this.getMagnitude();
  },
  // 点积的几何意义之一是：一个向量在平行于另一个向量方向上的投影的数值乘积。
  // 后续将会用其计算出投影的长度
  dotProduct: function (vector) {
    return this.x * vector.x + this.y + vector.y;
  },
  add: function (vector) {
    const v = new Vector();
    v.x = this.x + vector.x;
    v.y = this.y + vector.y;
    return v;
  },
  // 向量相减 得到边
  subtract: function (vector) {
    const v = new Vector();
    v.x = this.x - vector.x;
    v.y = this.y - vector.y;
    return v;
  },
  edge: function (vector) {
    return this.subtract(vector);
  },
  // 获取当前向量的法向量（垂直）
  perpendicular: function () {
    const v = new Vector();
    v.x = this.y;
    v.y = 0 - this.x;
    return v;
  },
  // 获取单位向量（即向量大小为1，用于表示向量方向），一个非零向量除以它的模即可得到单位向量
  normalize: function () {
    const v = new Vector(0, 0);
    const m = this.getMagnitude();
    if (m !== 0) {
      v.x = this.x / m;
      v.y = this.y / m;
    }
    return v;
  },
  // 获取边缘法向量的单位向量，即投影轴
  normal: function () {
    const p = this.perpendicular();
    return p.normalize();
  },
};

export default Vector;
