/*
 * @license MIT
 * @file settings.socket.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var Settings = require('./settings.controller');
var logger = require('../../config/logger.js');

/**
 * Registers a socket namespace
 * @method register
 * @param {} io - socket.io instance
 */
exports.register = function (io) {

    var nps = io.of('/api/settings');
    // Set up connection
    nps.on('connection', function(socket)
    {
        socket.connectDate = new Date();
        socket.ip = (socket.handshake.address) ? socket.handshake.address : null;
        
        // Set up message handlers
        Settings.init(socket);
        Settings.index(socket);
        Settings.show(socket);
        Settings.create(socket);
        Settings.update(socket);
        Settings.destroy(socket);
        /* insert your logic */

        // Set up disconnect
        socket.on('disconnect', function () {
            logger.debug('/api/settings [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
            console.log('/api/settings [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
        });
        logger.debug(' /api/settings [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
        console.log(' /api/settings [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
    });
   
};