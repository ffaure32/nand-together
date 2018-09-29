import { Vector } from "p5";
import pull from "lodash/pull";

export default class Heart {
  constructor({ schema, pos }) {
    this.schema = schema;
    this.pos = pos;
    this.age = 0;
    this.size = new Vector(32, 32);
    this.offset = Math.random() * 10;
  }

  draw(p) {
    p.push();
    p.imageMode(p.CENTER);
    p.noSmooth();
    p.image(
      p.heartImage,
      this.pos.x + Math.cos(this.offset + this.age / 10) * 10,
      this.pos.y - this.age,
      this.size.x,
      this.size.y
    );
    p.pop();
  }

  simulate() {
    return this.age++ <= 80;
  }
}
