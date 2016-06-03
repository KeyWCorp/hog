'use strict';

//var fs      = require('fs');
//var _       = require('lodash');
var logger  = require('../../config/logger.js');
//var path    = require('path');
//var ds      = require('nedb');
//var connect = require('camo').connect;
var Document  = require('camo').Document;

class Setting extends Document {
  constructor() {
    super();
    
    this.default      = String;
    this.inputType    = String;
    this.name         = String;
    this.data         = [];
    this.displayName  = String;
  }
  static collectionName() {
        return 'settings.data';
    }
  preValidate()
  {
    console.log('validate: ', this.name);
  }
  postValidate()
  {
    console.log('validate: ', this.name);
  }
}
exports.Setting = Setting;
exports.init = function(cb)
{
  cb(null);
  /*var uri = 'nedb://' + path.join(__dirname);
  connect(uri).then(function(db) {
    logger.info('connected to DB', db, uri);
    cb(null, db);
  },
  function(err)
  {
    logger.error(err);
  });*/
}
/*
var collection = new ds({filename: 'server/api/settings/settings.data.db', autoload: true, onload: function (err) { if(err) { logger.error('Error on load: ', err) }}});

exports.create = function(obj, cb)
{
  collection.insert(JSON.parse(obj),cb);
}
exports.list = function(cb)
{
  collection.find({}, cb);
}
exports.find = function(id, cb)
{
  if(typeof(id) == 'Number')
  {
    this.findById(id, cb);
  }
  else if(typeof(id) == 'string')
  {
    this.findByName(id, cb);
  }
}
exports.findByName = function(name, cb)
{
  collection.findOne({name: name}, cb);
}
exports.findById = function(id, cb)
{
  collection.findOne({_id: id}, cb);
}
exports.update = function(id, changes, cb)
{
  collection.update({_id: id}, JSON.parse(changes), {upsert: true, returnUpdatedDocs: true},
    function(err, numAffected, affectedDocuments, upsert)
    {
      if(err)
      {
        logger.error(err);
        return cb(err);
      }
      //logger.debug('doc: ', doc, 'Changes: ', changes, 'affected Documents: ', affectedDocuments, 'Error', err, ' num affected: ', numAffected, 'upsert: ', upsert);
      cb(err, affectedDocuments);
    });
}
exports.delete = function(id, cb)
{
  collection.remove({_id: id}, cb);
}

*/