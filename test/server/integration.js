const { expect } = require('chai');
const connectClient = require('socket.io-client');

describe('The server', function () {
  let server, request, world;
  this.timeout(5000);

  beforeEach(function (done) {
    server = require('../../src/server')();
    request = require('supertest')(server);
    server.listen(0, done);
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('blab', function () {
    let player, editor;

    beforeEach(function (done) {
      const serverUrl = 'http://127.0.0.1:' + server.address().port;
      const clientOpts = {
        multiplex: false,
        transports: ['websocket']
      };

      editor = connectClient(serverUrl, clientOpts);
      editor.on('connect', function () {
        player = connectClient(serverUrl, clientOpts);

        player.on('connect', function () {
          done();
        });
      });
    });

    it("echoes output messages from players", function (done) {
      player.emit('output', { state: true });
      editor.once('output', function (data) {
        expect(data).to.deep.equal({ state: true });
        done();
      })
    })

    afterEach(function (done) {
      player.disconnect();
      editor.disconnect();
      done();
    });
  });
});