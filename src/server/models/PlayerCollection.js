const EventEmitter = require("events");
const debug = require("debug")("nand:player-collection");
const Player = require("./Player");

module.exports = class PlayerCollection extends EventEmitter {
  constructor() {
    super();
    this.players = new Map();
  }

  forEachPresent(cb) {
    for (const p of this.players.values()) {
      if (p.present) {
        cb(p);
      }
    }
  }

  deliverUpdate(playerId, update) {
    const player = this.getOrCreate(playerId);
    player.deliverUpdate(update);
  }

  getOrCreate(playerId) {
    let player = this.players.get(playerId);
    if (!player) {
      player = new Player({ playerId });
      player.on("player-updated", update =>
        this.emit("player-updated", update)
      );
      this.players.set(playerId, player);
    }
    return player;
  }

  addConnection(playerId, handler) {
    const player = this.getOrCreate(playerId);
    player.addConnection(handler);
  }

  removeConnection(playerId, handler) {
    const player = this.getOrCreate(playerId);
    player.removeConnection(handler);
  }

  dump() {
    return [...this.players.values()].map(p => p.dump());
  }
};
