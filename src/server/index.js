const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const debug = require("debug")("server");
const expressStaticGzip = require("express-static-gzip");
const EventEmitter = require("events");
const EditorHandler = require("./handlers/EditorHandler");
const PlayerHandler = require("./handlers/PlayerHandler");
const _ = require("lodash");

module.exports = function() {
  const app = express();
  const server = http.createServer(app);

  const io = require("socket.io")(server);

  app.use(logger("short"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(expressStaticGzip(path.join(__dirname, "../../public")));

  let editors = [],
    players = [];

  const playerEvents = new EventEmitter();

  io.on("connection", function(socket) {
    const {
      address,
      query: { isEditor, playerId }
    } = socket.handshake;

    if (isEditor) {
      debug(`an editor connected from ${address}`);
      const handler = new EditorHandler({ players, playerEvents });
      editors.push(handler);

      handler.on("player", data => socket.emit("player", data));

      handler.connect();

      socket.on("update", data => handler.onUpdate(data));

      socket.on("disconnect", function() {
        debug(`an editor disconnected from ${address}`);
        _.pull(editors, handler);
        handler.disconnect();
      });
    } else {
      debug(`player '${playerId}' connected from ${address}`);
      const handler = new PlayerHandler({ playerId, playerEvents });
      players.push(handler);

      handler.on("update", data => socket.emit("update", data));

      handler.connect();

      socket.on("output", data => handler.onOutput(data));

      socket.on("disconnect", function() {
        debug(`player '${playerId}' disconnected from ${address}`);
        _.pull(players, handler);
        handler.disconnect();
      });
    }
  });

  return server;
};
