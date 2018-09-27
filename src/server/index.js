const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const debug = require("debug")("nand:server");
const expressStaticGzip = require("express-static-gzip");
const EventEmitter = require("events");
const EditorHandler = require("./handlers/EditorHandler");
const PlayerConnection = require("./handlers/PlayerConnection");
const Player = require("./models/Player");
const PlayerCollection = require("./models/PlayerCollection");
const _ = require("lodash");
const chance = require("chance").Chance();

module.exports = function() {
  const app = express();
  const server = http.createServer(app);

  const io = require("socket.io")(server);

  let editors = [],
    players = new PlayerCollection();

  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  app.use(logger("short"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.get("/monitor", function(req, res) {
    res.json(players.dump());
  });

  app.use(expressStaticGzip(path.join(__dirname, "../../public")));

  io.on("connection", function(socket) {
    let {
      address,
      headers,
      query: { isEditor, playerId }
    } = socket.handshake;

    address = headers["x-real-ip"] || address;

    const socketId = chance.word({ length: 8 });

    if (isEditor) {
      debug(`an editor connected from ${address} with socket ${socketId}`);

      function sendPlayerToClient(data) {
        debug(
          `sending player info ${JSON.stringify(
            data
          )} to editor connected from ${address} with socket ${socketId}`
        );
        socket.emit("player", data);
      }

      const handler = new EditorHandler({ players, sendPlayerToClient });
      editors.push(handler);

      handler.connect();

      socket.on("update", data => {
        debug(
          `received update ${JSON.stringify(
            data
          )} from editor from ${address} with socket ${socketId}`
        );
        handler.receiveFromClient(data);
      });

      socket.on("disconnect", function() {
        debug(`an editor disconnected from ${address} with socket ${socketId}`);
        _.pull(editors, handler);
        handler.disconnect();
      });
    } else {
      debug(
        `player '${playerId}' connected from ${address} with socket ${socketId}`
      );

      function sendUpdateToClient(data) {
        debug(
          `sending update ${JSON.stringify(
            data
          )} to player '${playerId}' at ${address} with socket ${socketId}`
        );
        socket.emit("update", data);
      }

      const connection = new PlayerConnection({
        playerId,
        socketId,
        sendUpdateToClient
      });

      socket.on("output", data => {
        debug(
          `player '${playerId}' sent update ${JSON.stringify(
            data
          )} from ${address} with socket ${socketId}`
        );
        connection.receiveFromClient(data);
      });

      socket.on("disconnect", function() {
        debug(
          `player '${playerId}' disconnected from ${address} with socket ${socketId}`
        );
        players.removeConnection(playerId, connection);
      });

      players.addConnection(playerId, connection);
    }
  });

  return server;
};
