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

  io.on("connection", function(socket) {
    const playerId = socket.handshake.query.playerId;

    debug(`player '${playerId}' connected`);

    socket.on("disconnect", function() {
      debug(`player '${playerId}' disconnected`);
    });

    socket.on("output", function(data) {
      debug(`player '${playerId}' set their state to ${JSON.stringify(data)}`);
      socket.broadcast.emit("output", data);
    });
  });

  return server;
};
