/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

var express = require('express');
var chalk = require('chalk');
var config = require('./config/environment');

var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server);
var camo    = require('./config/camo.js');

camo.init(
  function(err)
  {
    console.log('error initalizing database', err);
  })
    require('./config/sockets.js')(socket);
    require('./config/express')(app);
    require('./routes')(app);

    server.listen(config.port, config.ip, function () {

      console.log(
        chalk.red('\nExpress server listening on port ')
        + chalk.yellow('%d')
        + chalk.red(', in ')
        + chalk.yellow('%s')
        + chalk.red(' mode.\n'),
        config.port,
        app.get('env')
      );

      if (config.env === 'development') {
        require('ripe').ready();
      }

    });
  
module.exports = server;
