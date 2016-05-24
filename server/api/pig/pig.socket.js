'use strict';

var Pig = require('./pig.controller');
var logger = require('../../config/logger.js');
var config = require('../../config/environment');
var socketioJwt = require('socketio-jwt');

exports.register = function (io) {

  var nps = io.of('/api/pigs').use(socketioJwt.authorize({
      secret: config.secrets.session,
      handshake: true
    }));
  nps.on('connection',
      function(socket)
      {
        logger.debug(socket.decoded_token, 'connected');
        socket.connectDate = new Date();
        socket.ip = (socket.handshake.address) ? socket.handshake.address : null;
        socket.on('index',
            function()
            {
              logger.debug('test on indx')
            });
        
        Pig.init(socket);
        Pig.index(socket);
        Pig.show(socket);
        Pig.create(socket);
        Pig.update(socket);
        Pig.destroy(socket);
        Pig.run(socket);
        Pig.runAndTrack(socket);
        /* insert your logic */


        socket.on('disconnect', function () {
          logger.debug('/api/pigs [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
          console.log('/api/pigs [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
        });
        logger.debug(' /api/pigs [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
        console.log(' /api/pigs [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
      });

};
