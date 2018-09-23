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

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(expressStaticGzip(path.join(__dirname, "../../public")));

  let editors = [],
    players = [];

  const playerEvents = new EventEmitter();

  io.on("connection", function(socket) {
    const { isEditor, playerId } = socket.handshake.query;

    if (isEditor) {
      debug(`an editor connected`);
      const handler = new EditorHandler({ players, playerEvents });
      editors.push(handler);

      handler.on("player", data => socket.emit("player", data));

      handler.connect();

      socket.on("disconnect", function() {
        debug(`an editor disconnected`);
        _.pull(editors, handler);
        handler.disconnect();
      });
    } else {
      debug(`player '${playerId}' connected`);
      const handler = new PlayerHandler({ playerId, playerEvents });
      players.push(handler);
      handler.connect();

      socket.on("output", data => handler.onOutput(data));

      socket.on("disconnect", function() {
        debug(`player '${playerId}' disconnected`);
        _.pull(players, handler);
        handler.disconnect();
      });
    }
  });

  return server;
};
