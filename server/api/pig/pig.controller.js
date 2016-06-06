'use strict';

var fs      = require('fs');
var path    = require('path');
var Pigs    = require('./pig.model');
var logger  = require('../../config/logger.js');
var _ready  = false;
var Pig     = Pigs.Pig;
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
  Pigs.init(
    function(err, db)
    {
      _ready = true;
    });
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
          if (_ready)
          {
            console.log('Index requested');
            logger.debug('Index requested');
            Pig.find({})
              .then(
                function (pigs)
                {
                  //
                  console.log('index sent')
                  socket.emit('index', buildResponse(200, pigs));
                },
                function(err)
                {
                  if (err) { return handleError(socket, err); }
                });
          }
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
        console.log('in show for pig: ', id, _ready);
        if (_ready)
        {
          Pig.findOne({_id: id}, {populate: true})
            .then(
              function(obj)
              {
                //if (err) { return handleError(socket, err); }
                //logger.info('data for show: ', obj.toJSON());
                socket.emit('show', buildResponse(200, obj.toJSON()));
              },
              function(err)
              {
                logger.error(err);
                if (err) { return handleError(socket, err); }
              });
        }
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
        if (_ready)
        {
          var pig = Pig.create(JSON.parse(data));
          console.log(pig);
          pig.save()
            .then(
              function(obj)
              {
                console.log(obj);
              //if (err) { return handleError(socket, err); }
                socket.emit('server:create', buildResponse(201, obj.toJSON()));
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
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
        if (_ready)
        {
          var oldData = JSON.parse(data.obj);
          Pig.findOneAndUpdate({_id: data.id}, oldData, {upsert: true})
            .then(
              function(doc)
              {
                console.log('old name: ', oldData.name, 'new name: ', doc.name)
                if(doc.name != oldData.name)
                {
                  var script_location; // Old location of the script
                  if (oldData.script_loc)
                  {
                    script_location = oldData.script_loc;
                  }
                  else
                  {
                    script_location = path.join(__dirname, '../../',  'scripts/pig/', oldData.name +  '.pig');
                  }
                  doc.rename(script_location)
                    .then(
                      function()
                      {
                        doc.saveScript()
                          .then(
                            function()
                            {
                              console.log('finished updating', doc);
                              //if (err) { return handleError(socket, err); }
                              socket.emit('update', buildResponse(200, doc.toJSON()));
                            },
                            function(err)
                            {
                              if (err) { return handleError(socket, err); }
                            });
                      },
                      function(err)
                      {
                        if (err) { return handleError(socket, err); }
                      });
                }
                else
                {
                  doc.saveScript()
                    .then(
                      function()
                      {
                        console.log('finished updating', doc);
                        //if (err) { return handleError(socket, err); }
                        socket.emit('update', buildResponse(200, doc.toJSON()));
                      },
                      function(err)
                      {
                        if (err) { return handleError(socket, err); }
                      });
                }
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
          console.log('saving ', data);
         /* Pig.findOne({_id: data.id}, JSON.parse(data.obj))
            .then(
              function(doc)
              {
                if(doc.name != data.name)
                {
                  doc.rename();
                }
                doc.save()
                  .then(
                    function(obj)
                    {
                      console.log('finished updating', obj);
                    //if (err) { return handleError(socket, err); }
                      socket.emit('update', buildResponse(200, obj.toJSON()));
                    },
                    function(err)
                    {
                      if (err) { return handleError(socket, err); }
                    });
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });*/
        }
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
        if (_ready)
        {
          Pig.deleteOne({_id: id})
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

/**
 * Runs a Pig.
 *
 * @param socket
 */
exports.run = function (socket) {
  socket.on('run',
      function(id)
      {
        if (_ready)
        {
          Pig.findOne({_id: id})
            .then(
              function(doc)
              {
                doc.run(
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
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
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
        if (_ready)
        {
          Pig.findOne({_id: id})
            .then(
              function(doc)
              {
                doc.runAndTrack(
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
              },
              function(err)
              {
                if (err) { return handleError(socket, err); }
              });
        }
      });
};
