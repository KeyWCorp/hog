'use strict';

var fs      = require('fs');
var _       = require('lodash');
var logger  = require('../../config/logger.js');
var path    = require('path');
var ds      = require('nedb');
// if you want to track ids locally uncomment below.
/* Local ID */
//var nextId = 0;
var collection = new ds({filename: 'server/api/settings/settings.data.db', autoload: true, onload: function (err) { if(err) { logger.error('Error on load: ', err) }}});

/*var collection = {
    raw: {},
    instances: {}
}*/
/*var Setting = function(obj)
{*/
    /* Preform creation logic. */

/*  this.id = obj.id;
  this.name = obj.name;
  this.data = obj.data;
  this.inputType = obj.inputType;
  this.displayName = obj.displayName;
  collection.raw[this.id] = obj;
   // exports.created(obj);
}
Setting.prototype.update = function(obj, cb)
{*/
    /* Preform update logic */

/*    logger.info('Setting: ', this.id, 'being updated');
    obj = JSON.parse(obj);

    this.inputType = obj.inputType;
    this.data = obj.data;
    if (this.name != obj.name)
        this.updateName(obj.name, cb);
    this.name = obj.name;
    this.displayName = obj.displayName;
    //this.id = obj.id;
    this.save(cb);
    collection.raw[this.id] = obj;
    cb(null, obj);
    //exports.updated(obj);
}
Setting.prototype.remove = function(obj)
{*/
    /* Preform remove logic. */
    //exports.removed(obj);
/*}
Setting.prototype.save = function(cb)
{*/
   // fs.writeFile('server/scripts/pig/' + this.name + '.pig', this.data, 'utf-8', cb);
//}
/*Setting.prototype.updateName = function(name, cb)
{*/
   // fs.writeFile('server/scripts/pig/' + name + '.pig', this.data, 'utf-8', cb);
//}

/*exports.save = function(cb)
{
    logger.debug('writting file', collection.raw);

    fs.writeFile('server/api/settings/settings.data.json', JSON.stringify(collection.raw, null, 2), 'utf-8', cb);
}
exports.load = function(cb)
{
    fs.readFile('server/api/settings/settings.data.json', 'utf-8',
        function(err, data)
        {
            if (err)
            {
                return cb(err);
            }

            collection.raw = JSON.parse(data);
            for(var id in collection.raw)
            {
                collection.instances[id] = new Setting(collection.raw[id]);*/
                /* Local ID */

                /*if (nextId < id)
                {
                    nextId = id + 1;
                }
            }
      logger.debug('read in collection', collection);
    })
}*/
/*var obj1 = {
    "name": "es",
    "displayName": "ElasticSearch:",
    "data": "10.1.10.1:9000",
    "inputType": "string",
   
  };
var obj2 = {
    "name": "udfs",
    "displayName": "User Defined Functions (UDF):",
    "data": [
      {
        "name": "test",
        "file": ""
      },
      {
        "name": "test2",
        "file": ""
      }
    ],
    "inputType": "chips",
    
  };
  var obj3 = {
    "name": "udfLocs",
    "displayName": "UDF locations:",
    "data": [
      "./udf",
      "./"
    ],
    "inputType": "string",
    
  };
  var obj4 = {
    "name": "pigArgs",
    "displayName": "Pig Arguments:",
    "data": [
      {
        "description": "Run mode",
        "arg": "-x",
        "default": "local"
      }
    ],
    "inputType": "form",
    
  };
collection.insert(obj1, function(err, doc)
    {
      logger.debug('Document Inserted: ', doc, err);
      if(err)
      {
        logger.error('Error on creation: ', err)
      }
});
collection.insert(obj2, function(err, doc)
    {
      logger.debug('Document Inserted: ', doc, err);
      if(err)
      {
        logger.error('Error on creation: ', err)
      }
});
collection.insert(obj3, function(err, doc)
    {
      logger.debug('Document Inserted: ', doc, err);
      if(err)
      {
        logger.error('Error on creation: ', err)
      }
});
collection.insert(obj4, function(err, doc)
    {
      logger.debug('Document Inserted: ', doc, err);
      if(err)
      {
        logger.error('Error on creation: ', err)
      }
});*/
exports.create = function(obj, cb)
{
    /* Local ID */
    collection.insert(JSON.parse(obj),cb);
   /* obj.id = nextId;
    if (_.find(collection.raw, { name: obj.name}) != undefined)
    {
        setImmediate(
            function()
            {
                cb('name alread exists', obj);
            });
        return;
    }
    var inst = new Setting(obj);
    collection.instances[inst.id] = inst;
    inst.save(
        function(err)
        {
            if(err)
                return cb(err, obj);

            this.save(
                function(err)
                {
                    cb(err, obj);
                });
        });*/

    /* Local ID */
   // nextId++;

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
  collection.update({_id: id}, JSON.parse(changes), {upsert: true}, function(err, numAffected, affectedDocuments, upsert)
  {
        if(err)
          {
            logger.error(err);
            return cb(err);
          }
        logger.debug('doc: ', doc, 'Changes: ', changes, 'affected Documents: ', affectedDocuments, 'Error', err, ' num affected: ', numAffected, 'upsert: ', upsert);
        cb(err, upsert);
  });
}
exports.delete = function(id, cb)
{
  collection.remove({_id: id}, cb);
}

