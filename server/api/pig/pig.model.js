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
var EmbeddedDocument  = require('camo').EmbeddedDocument;
var diffmatchpatch = require('diff-match-patch');
var dmp = new diffmatchpatch();

class Version extends EmbeddedDocument {
  constructor()
  {
    super();
    this.version    = String;
    this.current    = Boolean;
    this.diff       = [];
    this.timeStamp  = {
      type: Date,
      default: Date.now
    };
  }
}
class Pig extends Document {
  constructor()
  {
    super();
    
    
    this.name         = String;
    this.data         = String;
    this.args         = [];
    this.version      = {
      type: String,
      default: "0.0.0"
    };
    this.script_loc   = String;
    this.history      = [Version];
    this.type         = String;
    this.graph_type   = String;
    this.graph_count  = Number;
    this.nodes        = [];
    this.links        = [];
  }
  static collectionName() {
        return 'pig.data';
    }
  run(stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB, killCB)
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

    pigParser.run(this.args, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, finishedCB, killCB);
  }
  runAndTrack(stdoutCB, stderrCB, stdlogCB, stdwarningCB, trackerCB, finishedCB, killCB)
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

    pigParser.trackTasks(this.args, script_location, stdoutCB, stderrCB, stdlogCB, stdwarningCB, trackerCB, finishedCB, killCB);
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
    console.log('in bump')
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
    return this.version;
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
              that.script_loc = path.join(__dirname, '../../scripts/pig/', that.name + '.pig');
              resolve(that);
            }
          });
      });
    return p;
  }
  diff(oldData, save, newData)
  {
    var d;
    var version;
    if(newData)
    {
      d = dmp.diff_main(this.data, newData.data);
      version = newData.version;
    }
    else
    {
      d = dmp.diff_main(oldData.data, this.data)
      version = this.version;
    }
    console.log('starting diff');
    //var d = diff.diffTrimmedLines(this.data, newData.data)
    //var d = dmp.diff_main(this.data, newData.data);
    //var d = dmp.diff_main(oldData.data, this.data);
    dmp.diff_cleanupEfficiency(d);
    if(save)
    {
      console.log('diff', d, 'creating new Version: ', version);
      try {
        var vers = Version.create({
        version: version,
        current: true,
        diff: d
      });
      } catch (error) {
        console.log(error);
      }
      
      console.log('version', vers, 'created');
      this.history.forEach(function(e) { e.current = false;});
      console.log('all currents set to false');
      this.history.push(vers);
      console.log('pushed new version');
    }
    return d;
  }
  update(data)
  {
    this.name         = data.name;
    this.data         = data.data;
    this.args         = data.args
    this.version      = data.version;
    this.script_loc   = data.script_loc;
    this.type         = data.type;
    this.graph_type   = data.graph_type;
    this.graph_count  = data.graph_count;
    this.nodes        = data.nodes;
    this.links        = data.links;
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
