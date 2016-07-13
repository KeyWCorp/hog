/*
 * @license MIT
 * @file sockets.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

/**
 * Registers the socket namespaces
 * @method exports
 * @param {} io
 */
module.exports = function (io) {
    // nps inserts
  require('../api/pig/pig.socket.js').register(io);
  require('../api/settings/settings.socket.js').register(io);
};