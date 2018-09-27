module.exports = {
  containsPoint(obj, x, y) {
    return (
      x >= obj.pos.x &&
      x < obj.pos.x + obj.size.x &&
      y >= obj.pos.y &&
      y < obj.pos.y + obj.size.y
    );
  },

  colorForState(state) {
    if (state === true) {
      return "#0f0";
    } else if (state === false) {
      return "#f00";
    } else {
      return "gray";
    }
  }
};
