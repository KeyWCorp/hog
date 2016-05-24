'use strict';

var socketioJwt = require('socketio-jwt');
var config      = require('./environment');
module.exports = function (io) {

  /*io.use(socketioJwt.authorize({
    secret: config.secrets.session,
    handshake: true
  }));
  
  io.sockets
    .on('connection', function (socket) {
      console.log(socket.decoded_token, 'connected');
      //socket.on('event');
    });*/
  /*io.on('connection', function (socket) {

    socket.connectDate = new Date();
    socket.ip = (socket.handshake.address) ? socket.handshake.address : null;

    // sockets inserts

    socket.on('disconnect', function () {
      console.log('[%s] %s disconnected.', new Date().toUTCString(), socket.ip);
    });

    console.log('[%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);

  });*/
    // nps inserts
  //require('../api/auth/auth.socket.js').register(io);
  require('../api/pig/pig.socket.js').register(io);
  require('../api/settings/settings.socket.js').register(io);
};