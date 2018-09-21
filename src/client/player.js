import p5 from 'p5';
import './css/common.css';

let state = false;

new p5(function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background(130, 130, 240);

    p.fill(state ? 255 : 0);

    p.rect(.25 * p.width, 0.25 * p.height, .5 * p.width, .5 * p.height);
  };

  p.mousePressed = function () {
    state = !state;
  }
});