import Gate from "./Gate";
import Wire from "./Wire";
import { Vector } from "p5";
import pull from "lodash/pull";
import pullAll from "lodash/pullAll";
import compact from "lodash/compact";

function debug(...args) {
  console.log(...args);
}

export default class Schema {
  constructor({ storage }) {
    this.storage = storage;
    this.gates = [];
    this.wires = [];
    this.players = Object.create(null);
    this.gridSize = 10;
  }

  draw(p) {
    p.clear();

    p.push();
    p.fill(0);
    p.textSize(32);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Connect to: ${location.protocol}//${location.host}`, 5, 5);
    p.pop();

    p.push();
    p.fill(0);
    p.textSize(24);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text(
      `Gates: ${this.gates.length} / Players: ${
        Object.keys(this.players).length
      }`,
      5,
      p.height - 5
    );
    p.pop();

    this.gates.forEach(g => g.draw(p));
    this.wires.forEach(w => w.draw(p));
    this.gates.forEach(g => g.drawLabel(p));

    if (this.newWire) {
      const { connector, x, y } = this.newWire;
      const connectorPos = Vector.add(connector.center, connector.gate.pos);
      p.push();
      p.strokeWeight(3);
      p.line(x, y, connectorPos.x, connectorPos.y);
      p.pop();
    }

    if (this.simulationBlocked) {
      p.push();
      p.textSize(40 + 5 * Math.cos(p.millis() / 200));
      p.textAlign(p.CENTER, p.CENTER);
      p.text("⌛️", p.width - 50, 50);
      p.pop();
    }
  }

  dragWire(connector, { x, y, dragging }) {
    if (dragging) {
      this.newWire = { connector, x, y };
    } else {
      let targetConnector;
      this.gates.some(g => (targetConnector = g.hitConnector({ x, y })));

      if (targetConnector) {
        this.connectOrDisconnect(connector, targetConnector);
      }
      this.newWire = null;
    }
  }

  save() {
    this.storage.set(
      JSON.stringify({
        gates: this.gates,
        wires: this.wires
      })
    );
  }

  restore() {
    try {
      const store = JSON.parse(this.storage.get());
      this.gates = store.gates.map(
        info => new Gate(Object.assign({ schema: this }, info))
      );
      this.wires = store.wires.map(
        info => new Wire(Object.assign({ schema: this }, info))
      );
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      this.gates = Array(10)
        .fill()
        .map(() => new Gate({ schema: this }));
    }
  }

  newPlayer(playerId) {
    this.players[playerId] = null;
    this.checkAssignments();
  }

  playerGone(playerId) {
    const controlledGate = this.gates.find(gate => gate.playerId === playerId);
    if (controlledGate) {
      debug(`player ${playerId} releasing gate ${controlledGate.id}`);
      controlledGate.attachPlayer(null);
    }
    delete this.players[playerId];
    this.checkAssignments();
  }

  playerUpdate(data) {
    const { playerId } = data;
    if ("output" in data) {
      this.gates.filter(gate => gate.playerId === playerId).forEach(gate => {
        gate.update(data);
      });
    } else if ("present" in data) {
      if (data.present) {
        this.newPlayer(data.playerId);
      } else {
        this.playerGone(data.playerId);
      }
    }
    this.save();
  }

  connectOrDisconnect(srcConnector, targetConnector) {
    const existingWire = this.wires.find(w =>
      w.matches(srcConnector, targetConnector)
    );
    if (existingWire) {
      pull(this.wires, existingWire);
    } else {
      if (srcConnector.allowConnection(targetConnector)) {
        if (srcConnector.dir === "input") {
          [srcConnector, targetConnector] = [targetConnector, srcConnector];
        }
        this.wires.push(
          new Wire({
            schema: this,
            inputConnector: srcConnector,
            outputConnector: targetConnector
          })
        );
      }
    }
  }

  resolveConnectorRef(connectorRef) {
    return this.gates.find(g => g.id === connectorRef.gate).connectors[
      connectorRef.index
    ];
  }

  simulate() {
    this.gates.forEach(g => g.simulate());
    if (this.wires.every(w => w.canSimulate())) {
      this.wires.forEach(w => w.simulate());
      this.simulationBlocked = false;
    } else {
      this.simulationBlocked = true;
    }
  }

  neededPlayerUpdates() {
    return compact(this.gates.map(g => g.neededPlayerUpdate()));
  }

  snapToGrid({ x, y }) {
    return new Vector(
      this.gridSize * Math.round(x / this.gridSize),
      this.gridSize * Math.round(y / this.gridSize)
    );
  }

  dispatchToGates(p, event, eventData) {
    if (
      this.gates
        .slice()
        .reverse()
        .some(g => g[event](p, eventData))
    ) {
      this.save();
    }
    return false;
  }

  keyTyped(p, eventData) {
    if (this.dispatchToGates(p, "keyTyped", eventData)) {
      return true;
    }
    const { x, y, key } = eventData;
    if (key === "c") {
      this.addGate({ x, y });
    }
    return false;
  }

  addGate({ x, y }) {
    this.gates.push(new Gate({ schema: this, pos: this.snapToGrid({ x, y }) }));
    this.checkAssignments();
    this.save();
  }

  deleteGate(gate) {
    const deadWires = this.wires.filter(w => w.isConnectedTo(gate));
    pullAll(this.wires, deadWires);
    pull(this.gates, gate);
    this.checkAssignments();
    this.save();
  }

  checkAssignments() {
    this.gates.forEach(g => {
      if (g.playerId) {
        if (!(g.playerId in this.players)) {
          debug(`player ${g.playerId} releasing gate ${g.id}`);
          g.attachPlayer(null);
        } else {
          this.players[g.playerId] = g;
        }
      }
    });
    Object.keys(this.players).forEach(playerId => {
      const gate = this.players[playerId];
      if (this.gates.indexOf(gate) < 0) {
        this.players[playerId] = null;
      }
    });
    this.gates.forEach(g => {
      if (!g.playerId) {
        const availablePlayerId = Object.keys(this.players).find(
          playerId => !this.players[playerId]
        );
        if (availablePlayerId) {
          debug(`player ${availablePlayerId} taking control of gate ${g.id}`);
          this.players[availablePlayerId] = g;
          g.attachPlayer(availablePlayerId);
        }
      }
    });
  }
}

["mousePressed", "mouseDragged", "mouseReleased"].forEach(event => {
  Schema.prototype[event] = function(p, eventData) {
    return this.dispatchToGates(p, event, eventData);
  };
});
