const EventEmitter = require("events");
const debug = require("debug")("nand:player-connection");

module.exports = class PlayerConnection extends EventEmitter {
  constructor({ socketId, sendUpdateToClient }) {
    super();
    this.socketId = socketId;
    this.sendUpdateToClient = sendUpdateToClient;
  }

  receiveFromClient(update) {
    this.emit("from-client", { update });
  }

  deliverUpdate(data) {
    this.sendUpdateToClient(data);
  }

  dump() {
    return { socketId: this.socketId };
  }
};
