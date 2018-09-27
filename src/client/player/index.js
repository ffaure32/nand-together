import p5 from "p5";
import io from "socket.io-client";
import Player from "./models/Player";
import chance from "../common/chance";

import "../css/common.css";

function getPlayerId() {
  const storedId = localStorage.getItem("playerId");
  if (typeof storedId === "string" && storedId.length > 4) {
    return storedId;
  } else {
    const newId = chance.word({ length: 8 });
    localStorage.setItem("playerId", newId);
    return newId;
  }
}

const playerId = getPlayerId();

const socket = io({ query: { playerId } });

const player = new Player({ socket, id: playerId });

new p5(function(p) {
  p.preload = function() {
    p.gateImage = p.loadImage(require("../images/NAND.png"));
    p.truthTableImage = p.loadImage(require("../images/truth-table.png"));
  };

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(30);
    p.pixelDensity(1);
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function() {
    p.clear();

    player.draw(p);
  };

  p.mousePressed = function() {
    player.mousePressed(p, { x: p.mouseX, y: p.mouseY, button: p.mouseButton });
    return false;
  };
});
