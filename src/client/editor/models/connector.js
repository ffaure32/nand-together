import { Vector } from "p5";
import { containsPoint } from "../../common/utils";

export default class Connector {
  constructor({ gate, dir, center, state } = {}) {
    this.gate = gate;
    this.dir = dir;
    this.size = new Vector(20, 20);
    this.pos = Vector.sub(center, Vector.mult(this.size, 0.5));
    this.state = state;
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.fill(this.state ? 255 : 0);
    p.rectMode(p.CORNER);
    p.rect(0, 0, this.size.x, this.size.y);
    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    if (containsPoint(this, x, y)) {
      this.handlePos = new Vector(x - this.pos.x, y - this.pos.y);
      return true;
    }
    return false;
  }

  mouseReleased(p, { x, y, button }) {
    if (this.handlePos) {
      if (this.handlePos.dist(new Vector(x - this.pos.x, y - this.pos.y)) < 1) {
        this.state = !this.state;
      }

      this.handlePos = null;
      return true;
    }
    return false;
  }
}
