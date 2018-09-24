const EventEmitter = require("events");
const debug = require("debug")("server");

module.exports = class EditorHandler extends EventEmitter {
  constructor({ players, playerEvents }) {
    super();
    this.players = players;
    this.playerEvents = playerEvents;
    this._onPlayer = this.onPlayer.bind(this);
  }

  connect() {
    this.players.forEach(p =>
      this.emit("player", { playerId: p.playerId, present: true })
    );

    this.playerEvents.on("player", this._onPlayer);
  }

  disconnect() {
    this.playerEvents.removeListener("player", this._onPlayer);
  }

  onPlayer(data) {
    this.emit("player", data);
  }

  onUpdate(data) {
    const { playerId, ...update } = data;
    const player = this.players.find(p => p.playerId === playerId);
    if (player) {
      player.update(update);
    }
  }
};
