'use strict';

var express = require('express');
var chalk = require('chalk');
var config = require('./config/environment');
var socketioJwt = require('socketio-jwt');

var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server);

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
