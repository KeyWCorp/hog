'use strict';

var fs = require('fs');
var Settings = require('./settings.model');
var logger = require('../../config/logger.js');
var _ready = false;
/* Set up response functions */
function handleError (socket, err) {
  return socket.emit('settings:error', {status: 500, json: err});
}
function buildResponse (statusCode, data)
{
    return {status: statusCode, json: data};
}

/* Load the objects */
/*Settings.load(
    function(err)
    {
        logger.error('Failed to load Settings collection with error [%s]', err);
    });*/

/* Set up messages */
exports.init = function (socket)
{
    logger.info('initializing settings controller')
    Settings.created = function(obj)
    {
        socket.emit('Settings:created', obj);
    }
    Settings.updated = function(obj)
    {
        socket.emit('Settings:updated', obj);
    }
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
 *
 * @param req
 * @param res
 */
exports.index = function (socket) {
    logger.debug('in index function')
    socket.on('index',
        function()
        {
            //console.log('Index requested');
            logger.debug('Index requested');
            if (_ready)
            {
              var Settin = Settings.Setting;
              Settin.find({})
                .then(
                  function (settings)
                  {
                    logger.debug('index sent settings:', settings);
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
 *
 * @param req
 * @param res
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
 *
 * @param req
 * @param res
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
                    logger.debug('creating obj:', obj);
                    //if (err) { return handleError(socket, err); }
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
 *
 * @param req
 * @param res
 */
exports.update = function (socket)
{
  
    socket.on('update',
        function(data)
        {
          if (_ready)
          {
            logger.debug('updating', data);
            Settings.Setting.findOneAndUpdate({_id: data.id}, JSON.parse(data.obj), {upsert: true})
              .then(
                function(obj)
                {
                    logger.debug('finished updating', err, obj);
                    //if (err) { return handleError(socket, err); }
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
 *
 * @param req
 * @param res
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
                    //if (err) { return handleError(socket, err); }
                    socket.emit('destroy', buildResponse(204, {}));
                },
                function(err)
                {
                   if (err) { return handleError(socket, err); }
                });
          }
        });
};

