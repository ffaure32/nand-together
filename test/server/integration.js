const { expect } = require("chai");
const connectClient = require("socket.io-client");
const clientOpts = {
  multiplex: false,
  transports: ["websocket"]
};

describe("The server", function() {
  let server, serverUrl;
  let player, editor;

  beforeEach(function(done) {
    player = editor = null;
    server = require("../../src/server")();
    request = require("supertest")(server);
    server.listen(0, () => {
      serverUrl = "http://127.0.0.1:" + server.address().port;
      done();
    });
  });

  afterEach(function(done) {
    if (player) {
      player.disconnect();
    }
    if (editor) {
      editor.disconnect();
    }
    server.close(done);
  });

  describe("when an editor is connected", function() {
    beforeEach(function(done) {
      editor = connectClient(serverUrl, {
        ...clientOpts,
        query: { isEditor: true }
      });

      editor.on("connect", done);
    });

    it("notifies editor of new players", function(done) {
      editor.once("player", function(data) {
        expect(data).to.deep.equal({
          playerId: "aPlayer",
          present: true
        });
        done();
      });

      player = connectClient(serverUrl, {
        ...clientOpts,
        query: { playerId: "aPlayer" }
      });
    });

    describe("when a player is connected", function() {
      beforeEach(function(done) {
        editor.once("player", () => done());

        player = connectClient(serverUrl, {
          ...clientOpts,
          query: { playerId: "aPlayer" }
        });
      });

      it("echoes output messages from players", function(done) {
        editor.once("player", function(data) {
          expect(data).to.deep.equal({
            playerId: "aPlayer",
            output: { state: true }
          });
          done();
        });

        player.emit("output", { state: true });
      });

      it("notifies editor of player disconnection", function(done) {
        editor.once("player", function(data) {
          expect(data).to.deep.equal({
            playerId: "aPlayer",
            present: false
          });
          done();
        });

        player.disconnect();
        player = null;
      });

      it("relays update messages from editor to players", function(done) {
        player.once("update", function(data) {
          expect(data).to.deep.equal({
            inputs: [true, false]
          });
          done();
        });
        editor.emit("update", { playerId: "aPlayer", inputs: [true, false] });
      });
    });
  });

  describe("when a player is connected", function() {
    beforeEach(function(done) {
      player = connectClient(serverUrl, {
        ...clientOpts,
        query: { playerId: "aPlayer" }
      });
      player.on("connect", done);
    });

    it("notifies editor of player presence on connection", function(done) {
      editor = connectClient(serverUrl, {
        ...clientOpts,
        query: { isEditor: true }
      });

      editor.once("player", function(data) {
        expect(data).to.deep.equal({
          playerId: "aPlayer",
          present: true
        });
        done();
      });
    });
  });
});
