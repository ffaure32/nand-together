const EventEmitter = require("events");
const debug = require("debug")("server");

module.exports = class PlayerHandler extends EventEmitter {
  constructor({ playerId, playerEvents }) {
    super();
    this.playerId = playerId;
    this.playerEvents = playerEvents;
  }

  emitUpdate(data) {
    this.playerEvents.emit("player", { playerId: this.playerId, ...data });
  }

  connect() {
    this.emitUpdate({ present: true });
  }

  disconnect() {
    this.emitUpdate({ present: false });
  }

  onOutput(output) {
    debug(
      `player '${this.playerId}' set their output to ${JSON.stringify(output)}`
    );
    this.emitUpdate({ output });
  }

  update(data) {
    debug(
      `sending update to player '${this.playerId}': ${JSON.stringify(data)}`
    );
    this.emit("update", data);
  }
};
