'use strict';

var fs = require('fs');
var Settings = require('./settings.model');
var logger = require('../../config/logger.js');

/* Set up response functions */
function handleError (socket, err) {
  return socket.emit('settings:error', {status: 500, json: err});
}
function buildResponse (statusCode, data)
{
    return {status: statusCode, json: data};
}

/* Load the objects */
Settings.load(
    function(err)
    {
        logger.error('Failed to load Settings collection with error [%s]', err);
    });

/* Set up messages */
exports.init = function (socket)
{
    logger.info('initializing pig controller')
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
            Settings.list(
                function (err, settings)
                {
                    if (err) { return handleError(socket, err); }
                    logger.debug('index sent', settings);
                    socket.emit('index', buildResponse(200, settings));
                });
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
           Settings.find(id,
                function(err, obj)
                {
                    if (err) { return handleError(socket, err); }
                    socket.emit('show', buildResponse(200, obj));
                });
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
            Settings.create(data,
                function(err, obj)
                {
                    logger.debug('creating obj:', obj);
                    if (err) { return handleError(socket, err); }
                    socket.emit('create', buildResponse(201, obj));
                });
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
          logger.debug('updating', data);
            Settings.update(data.id, data.obj,
                function(err, obj)
                {
                    logger.debug('finished updating', err, obj);
                    if (err) { return handleError(socket, err); }
                    socket.emit('update', buildResponse(200, obj));
                });
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
            Settings.remove(id,
                function(err)
                {
                    if (err) { return handleError(socket, err); }
                    socket.emit('destroy', buildResponse(204, {}));
                });
        });
};

