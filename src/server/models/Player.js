const EventEmitter = require("events");
const debug = require("debug")("nand:player");
const _ = require("lodash");

module.exports = class Player extends EventEmitter {
  constructor({ playerId }) {
    super();
    this.playerId = playerId;
    this.connections = [];
    this.present = false;
    this.lastUpdateFromEditor = null;
  }

  addConnection(connection) {
    connection.on("from-client", output =>
      this.receiveOutputFromClient(output)
    );
    this.connections.push(connection);
    if (this.connections.length === 1) {
      this.setPresent(true);
    }
    if (this.lastUpdateFromEditor) {
      this.deliverUpdate(this.lastUpdateFromEditor);
    }
  }

  removeConnection(connection) {
    _.pull(this.connections, connection);
    if (this.connections.length === 0) {
      this.setPresent(false);
    }
  }

  setPresent(present) {
    debug(`player '${this.playerId}' is now ${present ? "present" : "absent"}`);
    this.present = present;
    this.emit("player-updated", {
      playerId: this.playerId,
      present: this.present
    });
  }

  deliverUpdate(update) {
    this.connections.forEach(c => {
      this.lastUpdateFromEditor = update;
      c.deliverUpdate(update);
    });
  }

  receiveOutputFromClient(output) {
    debug(
      `player '${this.playerId}' set their output to ${JSON.stringify(output)}`
    );
    this.emit("player-updated", { playerId: this.playerId, ...output });
  }

  dump() {
    return {
      playerId: this.playerId,
      present: this.present,
      connections: this.connections.map(c => c.dump())
    };
  }
};
