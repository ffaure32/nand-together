import { Vector } from "p5";
import chance from "../../common/chance";

export default class Gate {
  constructor({ pos, state } = {}) {
    this.id = chance.word({ length: 8 });
    this.playerId = null;
    this.pos = pos || new Vector(50, 100);
    this.size = new Vector(80, 80);
    this.state = typeof state !== "undefined" ? state : false;
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.fill(this.state ? 255 : 0);
    p.rect(0, 0, this.size.x, this.size.y);

    p.textAlign(p.CENTER, p.TOP);
    p.textSize(10);
    p.fill(0);
    p.text(this.id, 0.5 * this.size.x, 2);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text(this.playerId || "", 0.5 * this.size.x, this.size.y - 2);
    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    if (
      x >= this.pos.x &&
      x < this.pos.x + this.size.x &&
      y >= this.pos.y &&
      y < this.pos.y + this.size.y
    ) {
      this.handlePos = new Vector(x - this.pos.x, y - this.pos.y);
      return true;
    }
  }

  mouseDragged(p, { x, y, button }) {
    if (this.handlePos) {
      this.pos = Vector.sub(new Vector(x, y), this.handlePos);
      return true;
    }
  }

  mouseReleased() {
    this.handlePos = null;
  }

  toJSON() {
    return { pos: this.pos, state: this.state };
  }
}
