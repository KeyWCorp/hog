'use strict';

var fs      = require('fs');
var _       = require('lodash');
var logger  = require('../../config/logger.js');
var path   = require('path');
// if you want to track ids locally uncomment below.
/* Local ID */
var nextId = 0;

var collection = {
    raw: {},
    instances: {}
}
var Setting = function(obj)
{
    /* Preform creation logic. */

  this.id = obj.id;
  this.name = obj.name;
  this.data = obj.data;
  this.inputType = obj.inputType;
  this.displayName = obj.displayName;
  collection.raw[this.id] = obj;
   // exports.created(obj);
}
Setting.prototype.update = function(obj, cb)
{
    /* Preform update logic */

    logger.info('Setting: ', this.id, 'being updated');
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
{
    /* Preform remove logic. */
    //exports.removed(obj);
}
Setting.prototype.save = function(cb)
{
   // fs.writeFile('server/scripts/pig/' + this.name + '.pig', this.data, 'utf-8', cb);
}
Setting.prototype.updateName = function(name, cb)
{
   // fs.writeFile('server/scripts/pig/' + name + '.pig', this.data, 'utf-8', cb);
}

exports.save = function(cb)
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
                collection.instances[id] = new Setting(collection.raw[id]);
                /* Local ID */

                if (nextId < id)
                {
                    nextId = id + 1;
                }
            }
      logger.debug('read in collection', collection);
    })
}

exports.create = function(obj, cb)
{
    /* Local ID */
    obj.id = nextId;
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
        });

    /* Local ID */
    nextId++;

}
exports.list = function(cb)
{
    setImmediate(
        function()
        {
          //logger.info('collection: ', collection.raw);
          cb(null, _.values(collection.raw));
        });
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
  var obj = _.find(collection.raw, function(o) { return o.name == name;});
  if (_.isUndefined(obj))
    {
        var err = 'Id ' + name + ' was not found in Settings collection';
        if (_.isUndefined(cb) )
        {
            return err;
        }
        else
        {
            setImmediate(
                function()
                {
                    cb(err);
                });
        }
    }
    else
    {
        if (_.isUndefined(cb) )
        {
            return obj;
        }
        else
        {
            setImmediate(
                function()
                {
                    cb(null, obj);
                });
        }
    }
}
exports.findById = function(id, cb)
{
    if (_.isUndefined(collection.raw[id]))
    {
        var err = 'Id ' + id + ' was not found in Settings collection';
        if (_.isUndefined(cb) )
        {
            return err;
        }
        else
        {
            setImmediate(
                function()
                {
                    cb(err);
                });
        }
    }
    else
    {
        if (_.isUndefined(cb) )
        {
            return collection.raw[id];
        }
        else
        {
            setImmediate(
                function()
                {
                    cb(null, collection.raw[id]);
                });
        }
    }
}
exports.update = function(id, changes, cb)
{
  
      if (_.isUndefined(collection.instances[id]) || _.isUndefined(collection.raw[id]))
      {
          setImmediate(
              function()
              {
                  cb('Id ' + id + ' was not found in Settings collection');
              });
      }
      else
      {
          var up = this;
          logger.info('Instance of id: ', id, 'data : ', collection.instances[id], 'changes: ', changes);
          collection.instances[id].update(changes,
              function(err, raw)
              {
                  up.save(
                      function(err)
                      {
                          console.log('finished saving');
                          cb(err, raw);
                      });
              });
      }
   
    
}
exports.delete = function(id, cb)
{
    if (_.isUndefined(collection.instances[id]) || _.isUndefined(collection.raw[id]))
    {
        setImmediate(
            function()
            {
                cb('Id ' + id + ' was not found in Settings collection');
            });
    }
    else
    {
        collection.instances[id].remove();
        delete collection.instances[id];
        delete collection.raw[id];
        this.save(cb);
    }
}

