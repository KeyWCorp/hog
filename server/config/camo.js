/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


var connect = require('camo').connect;
var path    = require('path');

/**
 * Description
 * @method init
 * @param {} cb
 */
exports.init = function(cb)
{
  var uri = 'nedb://' + path.join(__dirname, '../db');
  connect(uri).then(function(db) {
    logger.info('connected to DB', db, uri);
    cb(null, db);
  })
}