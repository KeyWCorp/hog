/*
 * @license MIT
 * @file camo.js
 * @copyright KeyW Corporation 2016
 */


var connect = require('camo').connect;
var path    = require('path');

/**
 * Initialize the camo ODM
 * @method init
 * @param {func} cb - callback
 */
exports.init = function(cb)
{
  var uri = 'nedb://' + path.join(__dirname, '../db');
  connect(uri).then(function(db) {
    logger.info('connected to DB', db, uri);
    cb(null, db);
  })
}