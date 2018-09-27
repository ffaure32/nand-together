import { Vector } from "p5";
import { containsPoint, colorForState } from "../../common/utils";

export default class Connector {
  constructor({ gate, index, dir, center, state } = {}) {
    this.gate = gate;
    this.index = index;
    this.dir = dir;
    this.size = new Vector(20, 20);
    this.center = center;
    this.pos = Vector.sub(center, Vector.mult(this.size, 0.5));
    this.state = state;
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);
    p.fill(colorForState(this.state));
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

  mouseDragged(p, { x, y, button }) {
    if (this.handlePos) {
      this.gate.dragWire(this, { x, y, dragging: true });
      return true;
    }
    return false;
  }

  mouseReleased(p, { x, y, button }) {
    if (this.handlePos) {
      this.gate.dragWire(this, { x, y, dragging: false });
      this.handlePos = null;
      return true;
    }
    return false;
  }

  keyTyped(p, { x, y, key }) {
    if (containsPoint(this, x, y)) {
      switch (key) {
        case "r":
          this.state = false;
          return true;
        case "g":
          this.state = true;
          return true;
        case "u":
          this.state = null;
          return true;
      }
    }
  }

  makeConnectorRef() {
    return { gate: this.gate.id, index: this.index };
  }

  getSchemaPos() {
    return Vector.add(this.center, this.gate.pos);
  }

  allowConnection(targetConnector) {
    return targetConnector !== this && this.dir !== targetConnector.dir;
  }

  isDetermined() {
    return typeof this.state === "boolean";
  }
}
