'use strict';

var express     = require('express'),
    compression = require('compression'),
    morgan      = require('morgan'),
    path        = require('path'),
    bodyParser  = require('body-parser'),
    logger      = require('./logger.js'),
    expressJwt  = require('express-jwt'),
    jwt         = require('jsonwebtoken'),
    config      = require('./environment');

module.exports = function (app) {

  var env = config.env;

  app.set('view engine', 'html');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
 // app.use(morgan('tiny'));
  //  app.use(morgan(logger.stream))
  app.use(express.static(path.join(config.root, 'client')));
  app.set('appPath', 'client');

  if (env === 'development' || env === 'test') {
    app.use(require('errorhandler')());
  }

  //Protect the API
  app.use('/api', expressJwt({secret: config.secret}));
};
