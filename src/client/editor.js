import p5 from 'p5';
import './css/common.css';
import Gate from './models/gate';

const gates = restore();

new p5(function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background(220);
    gates.forEach((g) => g.draw(p));
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  ['mousePressed', 'mouseDragged', 'mouseReleased'].forEach((event) => {
    p[event] = function () {
      if (gates.some((g) => g[event](p, {x: p.mouseX, y: p.mouseY, button: p.mouseButton}))) {
        save();
      }
    }
  });
});

function save() {
  localStorage.setItem('gates', JSON.stringify(gates));
}

function restore() {
  try {
    const store = JSON.parse(localStorage.getItem('gates'));
    return store.map((info) => new Gate(info));
  } catch(e) {
    return Array(10).fill().map(() => new Gate());
  }
}