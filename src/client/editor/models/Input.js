import { Vector } from "p5";
import Connector from "./Connector";
import { containsPoint } from "../../common/utils";
import Gate from "./Gate";

export default class Input extends Gate {
  constructor({ id, pos, state, playerId, schema, label }) {
    super({ id, pos, state, playerId, schema });
    this.type = "input";
    this.label = label;
    this.size = new Vector(50, 40);
    this.inputs = [];
    this.output = new Connector({
      gate: this,
      index: 0,
      dir: "output",
      center: new Vector(this.size.x, 0.5 * this.size.y),
      state: state && state.output
    });
    this.connectors = [this.output];
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);

    p.fill(255);
    p.strokeWeight(1);
    p.rect(0, 0, this.size.x, this.size.y, 10);

    p.push();
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(24);
    p.noStroke();
    p.fill(0);
    p.text(this.label || "?", 10, 0.5 * this.size.y);
    p.pop();

    this.connectors.forEach(c => c.draw(p));

    p.pop();
  }

  drawLabel() {}

  toJSON() {
    return { ...super.toJSON(), label: this.label };
  }
}
