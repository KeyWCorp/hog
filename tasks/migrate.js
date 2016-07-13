/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

/**
 * Build task
 */

var gulp  = require('gulp');
var path  = require('path');
var fs      = require('fs');
var ds    = require('nedb');
var config  = require('./config/dbFiles.js');
var _       = require('lodash');
var as      = require('async');

module.exports = function(done)
{
  function migrate(value, key, cb)
  {
    console.log('migrating :', key);
    var db = new ds({filename: path.join(__dirname, config[key], key + '.data.db.mig'), autoload: true, onload: cb});
    fs.readFile(path.join(__dirname, value, key + '.data.json'), "utf8",
      function(err, data)
      {
        if(err)
        {
          return cb(err)
        }
        var d = _.map(JSON.parse(data),
          function(v, k, c)
          {
            v.id = undefined;
            return v
          });

        db.insert(d,
          function(err, docs)
          {
            if(err)
            {
              console.error(err);
              cb(err);
            }
          });
      });
  }
  as.forEachOf(config, migrate, done);
}
