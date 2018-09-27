const EventEmitter = require("events");
const debug = require("debug")("nand:player-connection");

module.exports = class PlayerConnection extends EventEmitter {
  constructor({ playerId, socketId, sendUpdateToClient }) {
    super();
    this.playerId = playerId;
    this.socketId = socketId;
    this.sendUpdateToClient = sendUpdateToClient;
  }

  receiveFromClient(output) {
    this.emit("from-client", { output });
  }

  deliverUpdate(data) {
    this.sendUpdateToClient(data);
  }

  dump() {
    return { socketId: this.socketId };
  }
};
