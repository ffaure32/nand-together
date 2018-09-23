import p5 from "p5";
import io from "socket.io-client";
import Gate from "./models/gate";

import "../css/common.css";

const gates = restore();

const socket = io({ query: { isEditor: true } });

function debug(...args) {
  console.log(...args);
}

new p5(function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function() {
    p.background(220);
    p.push();
    p.fill(0);
    p.textSize(32);
    p.text(`Connect to: ${location.origin}`, 5, 35);
    p.pop();
    gates.forEach(g => g.draw(p));
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  ["mousePressed", "mouseDragged", "mouseReleased"].forEach(event => {
    p[event] = function() {
      if (
        gates
          .slice()
          .reverse()
          .some(g =>
            g[event](p, { x: p.mouseX, y: p.mouseY, button: p.mouseButton })
          )
      ) {
        save();
      }
      return false;
    };
  });
});

function save() {
  localStorage.setItem("gates", JSON.stringify(gates));
}

function restore() {
  try {
    const store = JSON.parse(localStorage.getItem("gates"));
    return store.map(info => new Gate(info));
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return Array(10)
      .fill()
      .map(() => new Gate());
  }
}

socket.on("player", function(data) {
  const { playerId } = data;
  const controlledGate = gates.find(gate => gate.playerId === playerId);
  if ("output" in data) {
    gates.filter(gate => gate.playerId === playerId).forEach(gate => {
      gate.state = data.output.state;
    });
  } else if ("present" in data) {
    if (data.present) {
      if (!controlledGate) {
        const availableGate = gates.find(gate => !gate.playerId);
        if (availableGate) {
          debug(
            `player ${playerId} taking control of gate ${availableGate.id}`
          );
          availableGate.playerId = playerId;
        }
      }
    } else {
      if (controlledGate) {
        debug(`player ${playerId} releasing gate ${controlledGate.id}`);
        controlledGate.playerId = null;
      }
    }
  }
  save();
});
