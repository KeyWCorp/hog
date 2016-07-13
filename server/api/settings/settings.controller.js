/*
 * @license MIT
 * @file settings.controller.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var fs = require('fs');
var Settings = require('./settings.model');
var logger = require('../../config/logger.js');
var _ready = false;
/**
 * Set up error functions 
 * @method handleError
 * @param {} socket
 * @param {} err
 */
function handleError (socket, err) {
  return socket.emit('settings:error', {status: 500, json: err});
}
/**
 * Set up responce functions
 * @method buildResponse
 * @param {} statusCode
 * @param {} data
 */
function buildResponse (statusCode, data)
{
    return {status: statusCode, json: data};
}

/**
 * Set up messages 
 * @method init
 * @param {} socket
 */
exports.init = function (socket)
{
    logger.info('initializing settings controller')
    /**
     * Deprecated
     * @method created
     * @param {} obj
     */
    Settings.created = function(obj)
    {
        socket.emit('Settings:created', obj);
    }
    /**
     * Deprecated
     * @method updated
     * @param {} obj
     */
    Settings.updated = function(obj)
    {
        socket.emit('Settings:updated', obj);
    }
    /**
     * Deprecated
     * @method removed
     * @param {} obj
     */
    Settings.removed = function(obj)
    {
        socket.emit('Settings:removed', obj);
    }
    
    Settings.init(
        function(err, db)
        {
          _ready = true;
        });
}
/**
 * Get list of Settings
 * @method index
 * @param {} socket
 */
exports.index = function (socket) {
    socket.on('index',
        function()
        {
            if (_ready)
            {
              var Settin = Settings.Setting;
              Settin.find({})
                .then(
                  function (settings)
                  {
                    socket.emit('index', buildResponse(200, settings));
                  },
                  function (err)
                  {
                    if (err) { return handleError(socket, err); }
                  });
            }
        });
};


/**
 * Get a single Setting
 * @method show
 * @param {} socket
 */
exports.show = function (socket) {
    socket.on('show',
        function(id)
        {
          if (_ready)
          {
            Settings.Setting.findOne({name: id})
              .then(
                function(obj)
                {
                    socket.emit('show', buildResponse(200, obj.toJSON()));
                },
                function(err)
                {
                   if (err) { return handleError(socket, err); }
                });
          }
        });
};


/**
 * Creates a new Setting in the DB.
 * @method create
 * @param {} socket
 */
exports.create = function (socket) {
    socket.on('create',
        function(data)
        {
          if (_ready)
          {
            var setting = Settings.Setting.create(JSON.parse(data))
            setting.save()
              .then(
                function(obj)
                {
                   socket.emit('create', buildResponse(201, obj.toJSON()));
                },
                function(err)
                {
                   if (err) { return handleError(socket, err); }
                });
          }
        });
};


/**
 * Updates an existing Setting in the DB.
 * @method update
 * @param {} socket
 */
exports.update = function (socket)
{
  
    socket.on('update',
        function(data)
        {
          if (_ready)
          {
            Settings.Setting.findOneAndUpdate({_id: data.id}, JSON.parse(data.obj), {upsert: true})
              .then(
                function(obj)
                {
                    socket.emit('update', buildResponse(200, obj.toJSON()));
                },
                function(err)
                {
                   if (err) { return handleError(socket, err); };
                });
          }
        });
 };

/**
 * Deletes a Setting from the DB.
 * @method destroy
 * @param {} socket
 */
exports.destroy = function (socket) {
    socket.on('destroy',
        function(id)
        {
          if (_ready)
          {
            Settings.Setting.deleteOne({_id: id})
              .then(
                function(err)
                {
                    socket.emit('destroy', buildResponse(204, {}));
                },
                function(err)
                {
                   if (err) { return handleError(socket, err); }
                });
          }
        });
};

