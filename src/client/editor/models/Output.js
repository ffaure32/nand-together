import { Vector } from "p5";
import Connector from "./Connector";
import Gate from "./Gate";

export default class Output extends Gate {
  constructor({ id, pos, state, playerId, schema, label }) {
    super({ id, pos, state, playerId, schema });
    this.type = "output";
    this.label = label;
    this.size = new Vector(50, 40);
    this.output = null;
    this.inputs = [
      new Connector({
        gate: this,
        index: 1,
        dir: "input",
        center: new Vector(0, 0.5 * this.size.y),
        state: state && state.inputs && state.inputs[0]
      })
    ];
    this.connectors = [...this.inputs];
    this.applyState(state);
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);

    p.fill(255);
    p.strokeWeight(1);
    p.rect(0, 0, this.size.x, this.size.y, 10);

    p.push();
    p.textAlign(p.RIGHT, p.CENTER);
    p.textSize(24);
    p.noStroke();
    p.fill(0);
    p.text(this.label || "?", this.size.x - 10, 0.5 * this.size.y);
    p.pop();

    this.connectors.forEach(c => c.draw(p));

    p.pop();
  }

  drawLabel() {}

  simulate() {}

  toJSON() {
    return { ...super.toJSON(), label: this.label };
  }
}
