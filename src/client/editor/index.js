import p5 from "p5";
import io from "socket.io-client";
import Schema from "./models/Schema";

import "../css/common.css";

const storage = {
  get(fileName) {
    return localStorage.getItem(fileName);
  },

  set(fileName, data) {
    localStorage.setItem(fileName, data);
  },

  list() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (localStorage.getItem(key).match(/^\{.*"gates"/)) {
        result.push(key);
      }
    }
    return result;
  }
};

const schema = new Schema({ storage });
schema.restore();

const socket = io({ query: { isEditor: true } });

socket.on("player", function(data) {
  schema.playerUpdate(data);
});

new p5(function(p) {
  p.preload = function() {
    p.gateImage = p.loadImage(require("../images/NAND.png"));
  };

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(20);
    p.pixelDensity(1);
  };

  p.draw = function() {
    schema.simulate();
    schema.draw(p);
    schema.neededPlayerUpdates().forEach(data => socket.emit("update", data));
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  ["mousePressed", "mouseDragged", "mouseReleased"].forEach(event => {
    p[event] = function() {
      schema[event](p, { x: p.mouseX, y: p.mouseY, button: p.mouseButton });
      return false;
    };
  });

  p.keyTyped = function() {
    schema.keyTyped(p, { key: p.key, x: p.mouseX, y: p.mouseY });
    return false;
  };
});

window.NAND = { schema };
