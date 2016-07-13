/*
 * @license MIT
 * @file pig.socket.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var Pig = require('./pig.controller');
var logger = require('../../config/logger.js');

/**
 * Registers the socket namespace
 * @method register
 * @param {} io - the socket.io instance
 */
exports.register = function (io) {

  var nps = io.of('/api/pigs');
  // Connect the socket
  nps.on('connection', function(socket)
      {
        socket.connectDate = new Date();
        socket.ip = (socket.handshake.address) ? socket.handshake.address : null;
        // Set up message handlers
        Pig.init(socket);
        Pig.index(socket);
        Pig.simpleIndex(socket);
        Pig.show(socket);
        Pig.create(socket);
        Pig.update(socket);
        Pig.destroy(socket);
        Pig.run(socket);
        Pig.runAndTrack(socket);
        Pig.bumpVersion(socket);
        Pig.getRecent(socket);
        /* insert your logic */

        // Disconnect the socket
        socket.on('disconnect', function () {
          logger.debug('/api/pigs [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
          console.log('/api/pigs [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
        });
        logger.debug(' /api/pigs [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
        console.log(' /api/pigs [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
      });

};
