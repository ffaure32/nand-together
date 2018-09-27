import { Vector } from "p5";
import chance from "../../common/chance";
import Connector from "./Connector";
import { containsPoint } from "../../common/utils";

export default class Gate {
  constructor({ id, pos, state, playerId, schema } = {}) {
    this.id = id || chance.word({ length: 8 });
    this.type = "gate";
    this.playerId = playerId;
    this.pos = pos ? new Vector(pos.x, pos.y) : new Vector(50, 100);
    this.size = new Vector(80, 80);
    this.schema = schema;

    this.output = new Connector({
      gate: this,
      index: 0,
      dir: "output",
      center: new Vector(this.size.x, 0.5 * this.size.y),
      state: state && state.output
    });

    this.inputs = [
      new Connector({
        gate: this,
        index: 1,
        dir: "input",
        center: new Vector(0, 20),
        state: state && state.inputs && state.inputs[0]
      }),
      new Connector({
        gate: this,
        index: 2,
        dir: "input",
        center: new Vector(0, this.size.y - 20),
        state: state && state.inputs && state.inputs[1]
      })
    ];

    this.connectors = [this.output, ...this.inputs];
  }

  draw(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);

    p.fill(255);
    p.strokeWeight(1);
    p.rect(0, 0, this.size.x, this.size.y, 10);

    p.imageMode(p.CENTER);
    p.push();
    p.noSmooth();
    p.image(
      p.gateImage,
      0.5 * this.size.x,
      0.5 * this.size.y,
      0.8 * this.size.x,
      0.8 * this.size.y
    );
    p.pop();

    this.connectors.forEach(c => c.draw(p));

    p.pop();
  }

  drawLabel(p) {
    p.push();
    p.translate(this.pos.x, this.pos.y);

    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(20);
    p.textFont("Futura");
    p.textStyle(p.BOLD);
    if (this.playerId) {
      p.push();
      p.rectMode(p.CENTER);
      p.fill(255);
      p.stroke(0);
      p.strokeWeight(1);
      p.noSmooth();
      p.rect(
        0.5 * this.size.x,
        this.size.y + 8,
        p.textWidth(this.playerId) + 4,
        28,
        5,
        5
      );
      p.pop();
    }
    p.textAlign(p.CENTER, p.TOP);
    p.fill(this.output.isDetermined() ? 0 : "orange");
    p.text(this.playerId || "🤖", 0.5 * this.size.x, this.size.y - 6);
    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    if (this.dispatchToConnectors("mousePressed", p, { x, y, button })) {
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
      this.pos = this.schema.snapToGrid(
        Vector.sub(new Vector(x, y), this.handlePos)
      );
      return true;
    }
    return this.dispatchToConnectors("mouseDragged", p, { x, y, button });
  }

  mouseReleased(p, { x, y, button }) {
    if (this.handlePos) {
      this.handlePos = null;
      return true;
    }

    return this.dispatchToConnectors("mouseReleased", p, { x, y, button });
  }

  dispatchToConnectors(event, p, { x, y, ...info }) {
    return this.connectors.some(c =>
      c[event](p, { x: x - this.pos.x, y: y - this.pos.y, ...info })
    );
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      pos: { x: this.pos.x, y: this.pos.y },
      state: {
        inputs: this.inputs.map(c => c.state),
        output: this.output.state
      }
    };
  }

  update({ output: { state } }) {
    this.output.state = state;
  }

  attachPlayer(playerId) {
    this.lastSentPlayerInputs = null;
    this.output.state = null;
    this.playerId = playerId;
  }

  neededPlayerUpdate() {
    if (!this.playerId) {
      return null;
    }
    const playerInputs = this.inputs.map(c => c.state);

    if (JSON.stringify(playerInputs) !== this.lastSentPlayerInputs) {
      this.lastSentPlayerInputs = JSON.stringify(playerInputs);
      return { playerId: this.playerId, inputs: playerInputs };
    }
  }

  dragWire(connector, { x, y, dragging }) {
    return this.schema.dragWire(connector, {
      x: this.pos.x + x,
      y: this.pos.y + y,
      dragging
    });
  }

  hitConnector({ x, y }) {
    const localX = x - this.pos.x,
      localY = y - this.pos.y;
    return this.connectors.find(c => containsPoint(c, localX, localY));
  }

  simulate() {
    if (!this.playerId) {
      if (this.inputs.some(i => typeof i.state !== "boolean")) {
        this.output.state = null;
      } else {
        this.output.state = !this.inputs.every(i => i.state);
      }
    } else {
      if (this.inputs.some(i => i.lastState !== i.state)) {
        this.output.state = null;
      }
    }
    this.inputs.forEach(i => {
      i.lastState = i.state;
    });
  }

  keyTyped(p, { x, y, key }) {
    if (this.dispatchToConnectors("keyTyped", p, { x, y, key })) {
      return true;
    }

    if (containsPoint(this, x, y)) {
      if (key === "x") {
        this.schema.deleteGate(this);
      }
      return true;
    }
    return false;
  }
}
