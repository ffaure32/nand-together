export default class Player {
  constructor({ socket, id }) {
    this.id = id;
    this.socket = socket;
    this.state = {
      inputs: [true, false],
      output: false
    };
  }

  draw(p) {
    p.push();

    p.fill(0);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(24);
    p.text(this.id, 0.5 * p.width, p.height - 2);

    p.fill(this.state.inputs[0] ? p.color(0, 255, 0) : p.color(255, 0, 0));
    p.rect(0 * p.width, 0.1 * p.height, 0.25 * p.width, 0.3 * p.height);

    p.fill(this.state.inputs[1] ? p.color(0, 255, 0) : p.color(255, 0, 0));
    p.rect(0 * p.width, 0.6 * p.height, 0.25 * p.width, 0.3 * p.height);

    p.fill(this.state.output ? p.color(0, 255, 0) : p.color(255, 0, 0));
    p.rect(0.75 * p.width, 0.25 * p.height, 0.25 * p.width, 0.5 * p.height);

    p.pop();
  }

  mousePressed(p, { x, y, button }) {
    this.state.output = !this.state.output;
    this.socket.emit("output", { state: this.state.output });
  }
}
