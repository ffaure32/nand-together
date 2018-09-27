import { Vector } from "p5";
import { containsPoint, colorForState } from "../../common/utils";

export default class Player {
  constructor({ socket, id }) {
    this.id = id;
    this.socket = socket;

    this.buttons = [];
    this.gatePos = new Vector(80, 100);
    this.gateSize = 120;

    this.output = {
      center: new Vector(this.gateSize, 0.5 * this.gateSize),
      state: null
    };

    this.inputs = [
      {
        center: new Vector(0, 20),
        state: false
      },
      {
        center: new Vector(0, this.gateSize - 20),
        state: false
      }
    ];

    this.connectors = [this.output, ...this.inputs];

    this.connectorSize = 20;
    this.buttonSize = 80;

    this.buttons = [
      {
        center: new Vector(
          250,
          this.gatePos.y + 0.5 * this.gateSize - 0.5 * this.buttonSize - 40
        ),
        targetState: true
      },
      {
        center: new Vector(
          250,
          this.gatePos.y + 0.5 * this.gateSize + 0.5 * this.buttonSize + 40
        ),
        targetState: false
      }
    ];

    this.buttons.forEach(b => {
      b.pos = new Vector(
        b.center.x - 0.5 * this.buttonSize,
        b.center.y - 0.5 * this.buttonSize
      );
      b.size = new Vector(this.buttonSize, this.buttonSize);
    });

    socket.on("update", ({ inputs }) => {
      let changed = false;
      this.inputs.forEach((v, i) => {
        if (this.inputs[i].state !== inputs[i]) {
          changed = true;
          this.inputs[i].state = inputs[i];
        }
      });
      if (changed) {
        this.output.state = null;
      }
    });
  }

  draw(p) {
    p.push();

    const scaleFactor = p.width / 320;
    p.scale(scaleFactor, scaleFactor);

    p.fill(0);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(24);
    p.text(this.id, 160, 400);

    this.buttons.forEach(b => {
      p.push();

      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, y]) => {
        const corner = new Vector(
          b.center.x + x * 0.5 * this.buttonSize,
          b.center.y + y * 0.5 * this.buttonSize
        );
        p.line(
          corner.x,
          corner.y,
          this.gatePos.x + this.output.center.x,
          this.gatePos.y + this.output.center.y
        );
      });

      p.fill(colorForState(b.targetState));
      p.rectMode(p.CENTER);
      p.rect(b.center.x, b.center.y, this.buttonSize, this.buttonSize);
      p.pop();
    });

    p.stroke(0);
    p.strokeWeight(2);
    p.line(
      this.gatePos.x + this.output.center.x,
      this.gatePos.y + this.output.center.y,
      320,
      this.gatePos.y + this.output.center.y
    );
    p.line(
      this.gatePos.x + this.inputs[0].center.x,
      this.gatePos.y + this.inputs[0].center.y,
      0,
      this.gatePos.y + this.inputs[0].center.y
    );
    p.line(
      this.gatePos.x + this.inputs[1].center.x,
      this.gatePos.y + this.inputs[1].center.y,
      0,
      this.gatePos.y + this.inputs[1].center.y
    );

    p.push();
    p.translate(this.gatePos.x, this.gatePos.y);

    p.fill(255);
    p.strokeWeight(1);
    p.rect(0, 0, this.gateSize, this.gateSize, 10);

    p.push();
    p.imageMode(p.CENTER);
    p.noSmooth();
    p.image(
      p.gateImage,
      0.5 * this.gateSize,
      0.5 * this.gateSize,
      0.8 * this.gateSize,
      0.8 * this.gateSize
    );
    p.pop();

    this.connectors.forEach(c => {
      p.push();
      p.translate(c.center.x, c.center.y);
      p.fill(colorForState(c.state));
      p.rectMode(p.CENTER);
      p.rect(0, 0, this.connectorSize, this.connectorSize);
      p.pop();
    });
    p.pop();

    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    const scaleFactor = p.width / 320;
    x /= scaleFactor;
    y /= scaleFactor;
    this.buttons.forEach(b => {
      if (containsPoint(b, x, y)) {
        this.output.state = b.targetState;
        this.socket.emit("output", { state: this.output.state });
      }
    });
  }
}
