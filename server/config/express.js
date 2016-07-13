/*
 * @license MIT
 * @file express.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('./logger.js');

var config = require('./environment');

/**
 * Creates the express application
 * @method exports
 * @param {} app
 */
module.exports = function (app) {

  var env = config.env;

  app.set('view engine', 'html');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
  app.use(morgan('dev'));
    app.use(morgan(logger.stream))
  app.use(express.static(path.join(config.root, 'client')));
  app.set('appPath', 'client');

  if (env === 'development' || env === 'test') {
    app.use(require('errorhandler')());
  }

};
