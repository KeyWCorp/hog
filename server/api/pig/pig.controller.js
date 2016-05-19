'use strict';

var fs = require('fs');
var Pig = require('./pig.model');
var logger = require('../../config/logger.js');

/* Set up response functions */
function handleError (socket, err) {
  return socket.emit('pig:error', {status: 500, json: err});
}
function buildResponse (statusCode, data)
{
  return {status: statusCode, json: data};
}

/* Load the objects */
/* Pig.load(
   function(err)
   {
   logger.error('Failed to load Pig collection with error [%s]', err);
   });*/

/* Set up messages */
exports.init = function (socket)
{
  logger.info('initializing pig controller')
    Pig.created = function(obj)
    {
      socket.emit('Pig:created', obj);
    }
  Pig.updated = function(obj)
  {
    socket.emit('Pig:updated', obj);
  }
  Pig.removed = function(obj)
  {
    socket.emit('Pig:removed', obj);
  }
}
/**
 * Get list of Pig
 *
 * @param req
 * @param res
 */
exports.index = function (socket) {
  logger.debug('in index function')
    socket.on('index',
        function()
        {
          console.log('Index requested');
          logger.debug('Index requested');
          Pig.list(
              function (err, pigs)
              {
                if (err) { return handleError(socket, err); }
                console.log('index sent')
                  socket.emit('index', buildResponse(200, pigs));
              });
        });
};


/**
 * Get a single Pig
 *
 * @param req
 * @param res
 */
exports.show = function (socket) {
  socket.on('show',
      function(id)
      {
        Pig.find(id,
            function(err, obj)
            {
              if (err) { return handleError(socket, err); }
              socket.emit('show', buildResponse(200, obj));
            });
      });
};


/**
 * Creates a new Pig in the DB.
 *
 * @param req
 * @param res
 */
exports.create = function (socket) {
  socket.on('create',
      function(data)
      {
        Pig.create(data,
            function(err, obj)
            {
              if (err) { return handleError(socket, err); }
              socket.emit('server:create', buildResponse(201, obj));
            });
      });
};


/**
 * Updates an existing Pig in the DB.
 *
 * @param req
 * @param res
 */
exports.update = function (socket)
{
  socket.on('update',
      function(data)
      {
        Pig.update(data.id, data.obj,
            function(err, obj)
            {
              console.log('finished updating', err, obj);
              if (err) { return handleError(socket, err); }
              socket.emit('update', buildResponse(200, obj));
            });
      });
};

/**
 * Deletes a Pig from the DB.
 *
 * @param req
 * @param res
 */
exports.destroy = function (socket) {
  socket.on('destroy',
      function(id)
      {
        Pig.remove(id,
            function(err)
            {
              if (err) { return handleError(socket, err); }
              socket.emit('destroy', buildResponse(204, {}));
            });
      });
};

/**
 * Runs a Pig.
 *
 * @param socket
 */
exports.run = function (socket) {
  socket.on('run',
      function(id)
      {
        Pig.run(id,
          // stdoutCB
          function(data)
          {
            socket.emit('run:output', buildResponse(200, data));
          },
          // stderrCB
          function(err)
          {
            if (err) { return handleError(socket, err); }
          },
          // stdlogCB
          function(data)
          {
            socket.emit('run:log', buildResponse(200, data));
          },
          // stdwarningCB
          function(data)
          {
            socket.emit('run:warning', buildResponse(200, data));
          },
          // finishedCB
          function(data)
          {
            socket.emit('run:end');
            socket.emit('run:finished');
          });
      });
};

/**
 * Runs a Pig and tracks it
 *
 * @param socket
 */
exports.runAndTrack = function (socket) {
  socket.on('run:track',
      function(id)
      {
        Pig.runAndTrack(id,
          // stdoutCB
          function(data)
          {
            socket.emit('run:output', buildResponse(200, data));
          },
          // stderrCB
          function(err)
          {
            if (err) { return handleError(socket, err); }
          },
          // stdlogCB
          function(data)
          {
            socket.emit('run:log', buildResponse(200, data));
          },
          // stdwarningCB
          function(data)
          {
            socket.emit('run:warning', buildResponse(200, data));
          },
          // trackerCB
          function(data)
          {
            socket.emit('tracker:update', data);
          },
          // finishedCB
          function(data)
          {
            socket.emit('run:end');
            socket.emit('run:finished');
          });
      });
};
