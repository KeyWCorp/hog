/*
 * @license MIT
 * @file pig.model.js
 * @copyright KeyW Corporation 2016
 */


'use strict';
var pigParser = require('../pig-parser/index.js');
var fs        = require('fs');
var _         = require('lodash');
var logger    = require('../../config/logger.js');
var path      = require('path');
var Document  = require('camo').Document;
var EmbeddedDocument  = require('camo').EmbeddedDocument;
var diffmatchpatch = require('diff-match-patch');
var dmp = new diffmatchpatch();

/**
* Class representing a pig version
* @extends EmbeddedDocument
*/
class Version extends EmbeddedDocument {
  /**
  * Create a Version.
  */
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
/**
* Class representing a pig
* @extends Document
*/
class Pig extends Document {
  /**
  * Create a Pig.
  */
  constructor()
  {
    super();
    this.name         = {
      type: String,
      unique: true
    };
    this.data         = String;
    this.args         = [];
    this.version      = {
      type: String,
      default: "0.0.0"
    };
    this.script_loc   = String;
    this.history      = [Version];
    this.type         = String;
    this.graph_type   = {
      type: String,
      default: "Bar"
    },
    this.graph_count  = {
      type: String,
      default: "10"
    },
    this.nodes        = [];
    this.links        = [];
    this.lastModified = {
      type: Date,
      default: Date.now
    }
  }
  /**
   * Change the collection name in the database
   * @return {string} collection name
   */
  static collectionName() {
        return 'pig.data';
  }
  /**
   * Run a pig script
   * @param {func} stdoutCB - standard output handler.
   * @param {func} stderrCB - standard error handler.
   * @param {func} stdlogCB - standard log handler.
   * @param {func} stdwarningCB - standard warning handler.
   * @param {func} finishedCB - script is finished handler.
   * @param {func} killCB - script is killed handler.
   */
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
   /**
   * Runs and tracks a pig script
   * @param {func} stdoutCB - standard output handler.
   * @param {func} stderrCB - standard error handler.
   * @param {func} stdlogCB - standard log handler.
   * @param {func} stdwarningCB - standard warning handler.
   * @param {func} finishedCB - script is finished handler.
   * @param {func} killCB - script is killed handler.
   */
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
  /**
   * Changes the major version one level
   * @return {number} - major component plus one
   */
  bumpMajor()
  {
    return parseFloat(this.version.split('.')[0]) + 1;
  }
  /**
   * Changes the minor version one level
   * @return {number} - minor component plus one
   */
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
  /**
   * Changes the release version one level
   * @return {number} - release component plus one
   */
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
  /**
   * Changes the version one level
   * @return {string} - the new version
   */
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
    return this.version;
  }
  /**
   * Pre save hook
   * @return {Promise} - promise to resolve before saving
   */
  preSave(d)
  {
      return Promise.all([this.saveScript()])
  }
  /**
   * Changes the modified date
   */
  updateModified()
  {
    this.lastModified = new Date();
  }
  /**
   * Renames the pig script on disc
   * @param {string} newPath - the new file name
   * @return {promise} - the promise to resolve when finished
   */
  rename(newPath)
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
    var p = new Promise(
      function(resolve, reject)
      {
        fs.rename(script_location, newPath,
          function(err)
          {
            if(err)
            {
              reject(err);
            }
            else
            {
              that.script_loc = newPath;
              resolve();
            }
          });
      });
    return p;
  }
  /**
   * Saves the changes to the .pig script on disk
   * @return {promise} - the promise to resolve when finished
   */
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
  /**
   * Creates a diff between two files
   * @param {string} oldData - one side of diff
   * @param {boolean} save - whether to save this diff
   * @param {string} newData - one side of diff
   * @return {Object} - the diff
   */
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
    dmp.diff_cleanupEfficiency(d);
    if(save)
    {
      try {
        var vers = Version.create({
        version: version,
        current: true,
        diff: d
      });
      } catch (error) {
        console.log(error);
      }

      this.history.forEach(function(e) { e.current = false;});
      this.history.push(vers);
    }
    return d;
  }
   /**
   * Updates the pig instance
   * @param {object} data - the new data
   */
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
    this.updateModified();
  }
}
// Export the pig class
exports.Pig = Pig;
/**
 * Deprecated - initialize the database
 * @method init
 * @param {} cb
 */
exports.init = function(cb)
{
  cb(null);
}
