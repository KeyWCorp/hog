/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

var Settings = require('./settings.controller');
var logger = require('../../config/logger.js');

exports.register = function (io) {

    var nps = io.of('/api/settings');
    nps.on('connection', function(socket)
    {
        socket.connectDate = new Date();
        socket.ip = (socket.handshake.address) ? socket.handshake.address : null;
        socket.on('index',
            function()
            {
                logger.debug('test on indx')
        }
            )
        Settings.init(socket);
        Settings.index(socket);
        Settings.show(socket);
        Settings.create(socket);
        Settings.update(socket);
        Settings.destroy(socket);
        /* insert your logic */

        socket.on('disconnect', function () {
            logger.debug('/api/settings [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
            console.log('/api/settings [%s] %s disconnected.', new Date().toUTCString(), socket.ip);
        });
        logger.debug(' /api/settings [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
        console.log(' /api/settings [%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);
    });
   
};