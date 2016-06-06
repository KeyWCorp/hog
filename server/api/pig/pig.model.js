'use strict';
var pigParser = require('../pig-parser/index.js');
var fs        = require('fs');
var _         = require('lodash');
//var spawn     = require('child_process').spawn;
var logger    = require('../../config/logger.js');
var path      = require('path');
//var ds        = require('nedb');
//var connect   = require('camo').connect;
var Document  = require('camo').Document;

class Pig extends Document {
  constructor()
  {
    super();
    
    this.name       = String;
    this.data       = String;
    this.args       = [];
    this.version    = String;
    this.script_loc = String;
  }
  static collectionName() {
        return 'pig.data';
    }
  run(stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB)
  {
    var script_location = '';
    if (this.script_loc)
    {
      script_location = this.script_loc;
    }
    else
    {
      script_location = path.join(__dirname, '../../',  'scripts/pig/', this.name +  '.pig');
    }

    pigParser.run(this.args, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB);
  }
  runAndTrack(stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB)
  {
    var script_location = '';
    if (this.script_loc)
    {
      script_location = this.script_loc;
    }
    else
    {
      script_location = path.join(__dirname, '../../',  'scripts/pig/', this.name +  '.pig');
    }

    pigParser.trackTasks(this.args, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB);
  }
  bumpMajor()
  {
    return parseFloat(this.version.split('.')[0]) + 1;
  }
  bumpMinor()
  {
    var v = this.version.split('.');
    var vv = parseFloat(v[1]);
    if(vv + 1 >= 10)
    {
      return 0;
    }
    else
    {
      return vv + 1;
    }
  }
  bumpRelease()
  {
    var v = this.version.split('.');
    var vv = parseFloat(v[2]);
    if(vv + 1 >= 10)
    {
      return 0;
    }
    else
    {
      return vv + 1;
    }
  }
  bump()
  {
    var v = this.version.split('.');
    var release = this.bumpRelease();
    var minor = v[1];
    var major = v[0];
    if (release == 0)
    {
      minor = this.bumpMinor();
      if(minor == 0)
      {
        major = this.bumpMajor();
      }
    }
    this.version = ''.concat(major,'.',minor,'.',release);
  }
  preSave(d)
  {
    //this.bump();
    console.log('in presave', d);
    var that = this;
    
      return Promise.all([this.saveScript()])
  }
  rename(oldPath)
  {
    var that = this;
    var script_location;
    if (this.script_loc)
    {
      script_location = this.script_loc;
    }
    else
    {
      script_location = path.join(__dirname, '../../',  'scripts/pig/', this.name +  '.pig');
    }
    console.log('renaming ', oldPath, ' to ', script_location);
    var p = new Promise(
      function(resolve, reject)
      {
        fs.rename(oldPath, script_location,
          function(err)
          {
            console.log('finished renaming', err);
            if(err)
            {
              reject(err);
            }
            else
            {
              resolve();
            }
          });
      });
    return p;
  }
  saveScript()
  {
    var that = this;
     var p = new Promise(
      function(resolve, reject)
      {
        console.log('writing script');
        fs.writeFile(path.join(__dirname, '../../scripts/pig/' + that.name + '.pig'), that.data, 'utf-8',
          function(err)
          {
            console.log('wrote file', err);
            if(err)
            {
              logger.error('Error on creation: ', err)
              reject(err);
            }
            else
            {
              console.log('resolved')
              that.script_loc = path.join(__dirname, '../../scripts/pig/', that.name, '.pig');
              resolve(that);
            }
          });
      });
    return p;
  }
}

exports.Pig = Pig;
exports.init = function(cb)
{
  cb(null);
  /*var uri = 'nedb://' + path.join(__dirname);
  connect(uri).then(function(db) {
    logger.info('connected to DB', db, uri);
    cb(null, db);
  })*/
}
/*
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
exports.run = function(id, stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB)
{
  logger.debug('Running Pig Script: ', id);
  var nArgs = ["-x", "local"];

  collection.findOne({_id: id},
    function(err, doc)
    {
      if(err)
      {
        return errCB(err);
      }

      if (doc.args)
      {
        nArgs = doc.args;
      }

      var script_location = path.join(__dirname, '../../',  'scripts/pig/', doc.name +  '.pig');

      pigParser.run(nArgs, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB);
    });

}
exports.runAndTrack = function(id, stdoutCB, stderrCB, stdlogCB, stdwarningCB, trackerCB, finishedCB)
{
  logger.debug('Running Pig Script: ', id);
  var nArgs = ["-x", "local"];

  collection.findOne({_id: id},
    function(err, doc)
    {
      if(err)
      {
        return errCB(err);
      }

      if (doc.args)
      {
        nArgs = doc.args;
      }

      var script_location = path.join(__dirname, '../../',  'scripts/pig/', doc.name +  '.pig');

      pigParser.trackTasks(nArgs, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, trackerCB, finishedCB);
    });

};
*/