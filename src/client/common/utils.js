module.exports = {
  containsPoint(obj, x, y) {
    return (
      x >= obj.pos.x &&
      x < obj.pos.x + obj.size.x &&
      y >= obj.pos.y &&
      y < obj.pos.y + obj.size.y
    );
  }
};
