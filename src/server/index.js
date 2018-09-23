const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const debug = require("debug")("server");
const expressStaticGzip = require("express-static-gzip");

module.exports = function() {
  const app = express();
  const server = http.createServer(app);

  const io = require("socket.io")(server);

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(expressStaticGzip(path.join(__dirname, "../../public")));

  let editors = [];

  io.on("connection", function(socket) {
    const { isEditor, playerId } = socket.handshake.query;

    if (isEditor) {
      debug(`an editor connected`);
      editors.push(socket);

      socket.on("disconnect", function() {
        debug(`an editor disconnected`);
        editors = editors.filter(e => e !== socket);
      });
    } else {
      debug(`player '${playerId}' connected`);

      editors.forEach(e => e.emit("player", { playerId, present: true }));

      socket.on("disconnect", function() {
        debug(`player '${playerId}' disconnected`);
        editors.forEach(e => e.emit("player", { playerId, present: false }));
      });

      socket.on("output", function(output) {
        debug(
          `player '${playerId}' set their state to ${JSON.stringify(output)}`
        );
        editors.forEach(e => e.emit("output", { playerId, output }));
      });
    }
  });

  return server;
};
