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
    const newId = chance.word({ length: 16 });
    localStorage.setItem("playerId", newId);
    return newId;
  }
}

const playerId = getPlayerId();

const socket = io({ query: { playerId } });

const player = new Player({ socket, id: playerId });

new p5(function(p) {
  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function() {
    p.background(130, 130, 240);

    player.draw(p);
  };

  p.mousePressed = function() {
    player.mousePressed(p, { x: p.mouseX, y: p.mouseY, button: p.mouseButton });
  };
});
