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
    this.gridSize = 10;
  }

  draw(p) {
    p.clear();

    p.push();
    p.fill(0);
    p.textSize(32);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Connect to: ${location.origin}`, 5, 5);
    p.pop();

    this.gates.forEach(g => g.draw(p));
    this.wires.forEach(w => w.draw(p));

    if (this.newWire) {
      const { connector, x, y } = this.newWire;
      const connectorPos = Vector.add(connector.center, connector.gate.pos);
      p.push();
      p.strokeWeight(3);
      p.line(x, y, connectorPos.x, connectorPos.y);
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

  playerUpdate(data) {
    const { playerId } = data;
    const controlledGate = this.gates.find(gate => gate.playerId === playerId);
    if ("output" in data) {
      this.gates.filter(gate => gate.playerId === playerId).forEach(gate => {
        gate.update(data);
      });
    } else if ("present" in data) {
      if (data.present) {
        if (!controlledGate) {
          const availableGate = this.gates.find(gate => !gate.playerId);
          if (availableGate) {
            debug(
              `player ${playerId} taking control of gate ${availableGate.id}`
            );
            availableGate.attachPlayer(playerId);
          }
        }
      } else {
        if (controlledGate) {
          debug(`player ${playerId} releasing gate ${controlledGate.id}`);
          controlledGate.attachPlayer(null);
        }
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
    this.wires.forEach(w => w.simulate());
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
      this.gates.push(
        new Gate({ schema: this, pos: this.snapToGrid({ x, y }) })
      );
    }
    return false;
  }

  deleteGate(gate) {
    const deadWires = this.wires.filter(w => w.isConnectedTo(gate));
    pullAll(this.wires, deadWires);
    pull(this.gates, gate);
    this.save();
  }
}

["mousePressed", "mouseDragged", "mouseReleased"].forEach(event => {
  Schema.prototype[event] = function(p, eventData) {
    return this.dispatchToGates(p, event, eventData);
  };
});
