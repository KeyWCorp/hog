'use strict';
var pigParser = require('../pig-parser/index.js');
var fs        = require('fs');
var _         = require('lodash');
var spawn     = require('child_process').spawn;
var logger    = require('../../config/logger.js');
var path      = require('path');
var ds        = require('nedb');

var collection = new ds({filename: 'server/api/pig/pig.data.db', autoload: true, onload: function (err) { if(err) { logger.error('Error on load: ', err) }}});

exports.create = function(obj, cb)
{
  //logger.debug('Creating Script: ', JSON.parse(obj));
  collection.insert(JSON.parse(obj),
    function(err, doc)
    {
      logger.debug('Document Inserted: ', doc, err);
      if(err)
      {
        logger.error('Error on creation: ', err)
      }
      else
      {
        fs.writeFile(path.join(__dirname, '../../scripts/pig/' + doc["name"] + '.pig'), doc.data, 'utf-8',
          function(err)
          {
            if(err) { logger.error('Error on creation: ', err) }
            cb(err,doc)
          });
      }
    });
}
exports.list = function(cb)
{
  collection.find({}, cb);
}
exports.find = function(id, cb)
{
  collection.findOne({_id: id}, cb);
}
exports.update = function(id, changes, cb)
{
  changes = JSON.parse(changes);
  collection.findOne({_id: id},
    function(err, doc)
    {
      if(err)
      {
        logger.error(err);
        return cb(err);
      }
      collection.update({_id: id}, changes, {upsert: true, returnUpdatedDocs: true},
        function(err, numAffected, affectedDocuments, upsert)
        {
          if(err)
          {
            logger.error(err);
            return cb(err);
          }
          //logger.debug('doc: ', doc, 'Changes: ', changes, 'affected Documents: ', affectedDocuments, 'Error', err, ' num affected: ', numAffected, 'upsert: ', upsert);
          if(changes.name != doc.name)
          {
            fs.rename('server/scripts/pig/' + doc.name + '.pig', 'server/scripts/pig/' + changes.name + '.pig', function(err) { if (err) logger.error(err); });
          }

          fs.writeFile('server/scripts/pig/' + changes.name + '.pig', changes.data, 'utf-8', function(err) { if (err) { logger.error (err) } });
          cb(null, affectedDocuments);
        });
    });
}
exports.delete = function(id, cb)
{
  collection.remove({_id: id},cb);
}
exports.run = function(id, stdoutCB, stderrCB, errCB, finishedCB)
{
  logger.debug('Running Pig Script: ', id);
  var nArg = [];

  collection.findOne({_id: id},
    function(err, doc)
    {
      if(err)
      {
        return errCB(err);
      }

      for( var index in doc.args)
      {
        nArg.push(_.values(doc.args[index]));
      }

      nArg = _.flatten(nArg);

      var script_location = path.join(__dirname, '../../',  'scripts/pig/', doc.name +  '.pig');

      pigParser.run(nArg, script_location, stdoutCB, stderrCB, stderrCB, finishedCB);
    });

}
exports.runAndTrack = function(id, stdoutCB, stderrCB, errCB, trackerCB, finishedCB)
{
  logger.debug('Running Pig Script: ', id);
  var nArg = [];

  collection.findOne({_id: id},
    function(err, doc)
    {
      if(err)
      {
        return errCB(err);
      }

      for( var index in doc.args)
      {
        nArg.push(_.values(doc.args[index]));
      }

      nArg = _.flatten(nArg);

      var script_location = path.join(__dirname, '../../',  'scripts/pig/', doc.name +  '.pig');

      pigParser.trackTasks(nArg, script_location, stdoutCB, stderrCB, stderrCB, trackerCB, finishedCB);
    });

};
