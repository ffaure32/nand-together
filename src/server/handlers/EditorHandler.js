const EventEmitter = require("events");
const debug = require("debug")("nand:editor-handler");

module.exports = class EditorHandler extends EventEmitter {
  constructor({ players, sendPlayerToClient }) {
    super();
    this.players = players;
    this._onPlayerUpdated = this.onPlayerUpdated.bind(this);
    this.sendPlayerToClient = sendPlayerToClient;
  }

  connect() {
    this.players.forEachPresent(p =>
      this.sendPlayerToClient({ playerId: p.playerId, present: true })
    );

    this.players.on("player-updated", this._onPlayerUpdated);
  }

  disconnect() {
    this.players.removeListener("player-updated", this._onPlayerUpdated);
  }

  onPlayerUpdated(playerData) {
    this.sendPlayerToClient(playerData);
  }

  receiveFromClient(data) {
    const { playerId, ...update } = data;
    this.players.deliverUpdate(playerId, update);
  }
};
