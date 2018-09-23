import { Vector } from "p5";
import chance from "../../common/chance";
import Connector from "./connector";
import { containsPoint } from "../../common/utils";

export default class Gate {
  constructor({ id, pos, state, playerId } = {}) {
    this.id = id || chance.word({ length: 8 });
    this.playerId = playerId;
    this.pos = pos || new Vector(50, 100);
    this.size = new Vector(80, 80);

    this.output = new Connector({
      gate: this,
      dir: "output",
      center: new Vector(1 * this.size.x, 0.5 * this.size.y),
      state: state && state.output
    });

    this.inputs = [
      new Connector({
        gate: this,
        dir: "input",
        center: new Vector(0 * this.size.x, 0.2 * this.size.y),
        state: state && state.inputs && state.inputs[0]
      }),
      new Connector({
        gate: this,
        dir: "input",
        center: new Vector(0 * this.size.x, 0.8 * this.size.y),
        state: state && state.inputs && state.inputs[1]
      })
    ];

    this.connectors = [this.output, ...this.inputs];
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);

    p.fill(255);
    p.rect(0, 0, this.size.x, this.size.y);

    this.connectors.forEach(c => c.draw(p));

    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(10);
    p.fill(0);
    p.text(this.id, 0.5 * this.size.x, -2);
    p.textAlign(p.CENTER, p.TOP);
    p.text(this.playerId || "", 0.5 * this.size.x, this.size.y + 2);
    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    if (
      this.connectors.some(c =>
        c.mousePressed(p, { x: x - this.pos.x, y: y - this.pos.y, button })
      )
    ) {
      return true;
    }

    if (containsPoint(this, x, y)) {
      this.handlePos = new Vector(x - this.pos.x, y - this.pos.y);
      return true;
    }

    return false;
  }

  mouseDragged(p, { x, y, button }) {
    if (this.handlePos) {
      this.pos = Vector.sub(new Vector(x, y), this.handlePos);
      return true;
    }
    return false;
  }

  mouseReleased(p, { x, y, button }) {
    if (this.handlePos) {
      this.handlePos = null;
      return true;
    }

    return this.connectors.some(c =>
      c.mouseReleased(p, { x: x - this.pos.x, y: y - this.pos.y, button })
    );
  }

  toJSON() {
    return {
      id: this.id,
      pos: this.pos,
      state: {
        inputs: this.inputs.map(c => c.state),
        output: this.output.state
      },
      playerId: this.playerId
    };
  }

  update({ output: { state } }) {
    this.output.state = state;
  }
}
