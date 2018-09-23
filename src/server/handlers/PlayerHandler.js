const debug = require("debug")("server");

module.exports = class PlayerHandler {
  constructor({ playerId, playerEvents }) {
    this.playerId = playerId;
    this.playerEvents = playerEvents;
  }

  connect() {
    this.emitUpdate({ present: true });
  }

  disconnect() {
    this.emitUpdate({ present: false });
  }

  emitUpdate(data) {
    this.playerEvents.emit("player", { playerId: this.playerId, ...data });
  }

  onOutput(output) {
    debug(
      `player '${this.playerId}' set their output to ${JSON.stringify(output)}`
    );
    this.emitUpdate({ output });
  }
};
