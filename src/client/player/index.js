import p5 from "p5";
import io from "socket.io-client";

import "../css/common.css";

const state = {
  inputs: [true, false],
  output: false
};

const socket = io();

new p5(function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function() {
    p.background(130, 130, 240);

    p.fill(state.inputs[0] ? 255 : 0);
    p.rect(0 * p.width, 0.1 * p.height, 0.25 * p.width, 0.3 * p.height);

    p.fill(state.inputs[1] ? 255 : 0);
    p.rect(0 * p.width, 0.6 * p.height, 0.25 * p.width, 0.3 * p.height);

    p.fill(state.output ? 255 : 0);
    p.rect(0.75 * p.width, 0.25 * p.height, 0.25 * p.width, 0.5 * p.height);
  };

  p.mousePressed = function() {
    state.output = !state.output;
    socket.emit("output", { state: state.output });
  };
});
