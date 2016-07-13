/*
 * @license MIT
 * @file pig.controller.js
 * @copyright KeyW Corporation 2016
 */


'use strict';

var fs      = require('fs');
var _       = require('lodash');
var path    = require('path');
var Pigs    = require('./pig.model');
var logger  = require('../../config/logger.js');
var _ready  = false;
var Pig     = Pigs.Pig;
/**
 * Set up error functions
 * @method handleError
 * @param {} socket
 * @param {} err
 */
function handleError (socket, err) {
  return socket.emit('pig:error', {status: 500, json: err});
}
/**
 * Set up response functions
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
  logger.info('initializing pig controller')
  /**
   * Not Used Callback
   * @method created
   * @param {} obj
   */
  Pig.created = function(obj)
  {
    socket.emit('Pig:created', obj);
  }
  /**
   * Not Used Callback
   * @method updated
   * @param {} obj
   */
  Pig.updated = function(obj)
  {
    socket.emit('Pig:updated', obj);
  }
  /**
   * Not Used Callback
   * @method removed
   * @param {} obj
   */
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
 * @method index
 * @param {} socket
 */
exports.index = function (socket) {
    socket.on('index',
        function()
        {
          if (_ready)
          {
            Pig.find({})
              .then(
                function (pigs)
                {
                  /*
                   * convert array to object
                   */
                  var pigs_obj = _.keyBy(pigs, '_id');

                  socket.emit('index', buildResponse(200, pigs_obj));
                },
                function(err)
                {
                  if (err) { return handleError(socket, err); }
                });
          }
        });
};
/**
 * Get list of simple Pig
 * @method simpleIndex
 * @param {} socket
 */
exports.simpleIndex = function (socket) {
    socket.on('simpleIndex',
        function()
        {
          if (_ready)
          {
            Pig.find({type: 'simple'})
              .then(
                function (pigs)
                {
                  /*
                   * convert array to object
                   */
                  var pigs_obj = _.keyBy(pigs, '_id');

                  socket.emit('simpleIndex', buildResponse(200, pigs_obj));
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
 * @method show
 * @param {} socket
 */
exports.show = function (socket) {
  socket.on('show',
      function(id)
      {
        if (_ready)
        {
          Pig.findOne({_id: id}, {populate: true})
            .then(
              function(obj)
              {
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
 * @method create
 * @param {} socket
 */
exports.create = function (socket) {
  socket.on('create',
      function(data)
      {
        if (_ready)
        {
          var d = JSON.parse(data);
          d.version = d.version == '' ? null : d.version;
          var pig = Pig.create(d);
          pig.diff({data: ''}, true);
          pig.updateModified();
          pig.save()
            .then(
              function(obj)
              {
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
          var newData = JSON.parse(data.obj);
          Pig.findOne({_id: newData._id})
            .then(
              function(doc)
              {
                console.log('Found One: ', doc);
                if(newData.version != doc.version)
                {
                   doc.diff(doc, true, newData);
                }
                if(newData.name != doc.name)
                {
                  var script_location = path.join(__dirname, '../../',  'scripts/pig/', newData.name +  '.pig');
                  newData.script_loc = script_location;
                  doc.rename(script_location)
                    .then(
                      function()
                      {
                        doc.update(newData);
                        doc.save()
                          .then(
                            function(obj)
                            {
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
                      });
                }
                else
                {
                  doc.update(newData);
                  doc.save()
                    .then(
                      function(obj)
                      {
                        socket.emit('update', buildResponse(200, obj.toJSON()));
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
        }
      });
};

/**
 * Deletes a Pig from the DB.
 * @method destroy
 * @param {} socket
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
 * @method run
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
                  },
                  // killCB
                  function(pig)
                  {
                    socket.on('kill',
                        function (kill_id)
                        {
                          if (id === kill_id)
                          {
                            pig.kill();

                            console.log("\n\nKilled script....");

                            socket.emit('run:end');
                            socket.emit('run:finished');
                          }
                        });
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
 * @method runAndTrack
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
                  },
                  // killCB
                  function(pig)
                  {
                    socket.on('kill',
                        function (kill_id)
                        {
                          if (id === kill_id)
                          {
                            pig.kill();

                            console.log("\n\nKilled script....");

                            socket.emit('run:end');
                            socket.emit('run:finished');
                          }
                        });
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
 * Gets a list of the most recently changed scripts up to the limit passed in
 * @method getRecent
 * @param socket
 */
exports.getRecent = function (socket) {
  socket.on('recent',
    function(countntype)
    {
      Pig.find({type: countntype.type}, {populate: ['name'], limit: countntype.count, sort: '-lastModified'})
        .then(
            function(docs)
            {
              socket.emit('recents-'+countntype.type, buildResponse(200, docs));
            },
            function(err)
            {
              if (err) { return handleError(socket, err); }
            });
    })
};

/**
 * bumps the pigs version
 * @method bumpVersion
 * @param socket
 */
exports.bumpVersion = function(socket)
{
  socket.on('bump',
    function(id)
    {
      if (_ready)
      {
        Pig.findOne({_id: id})
          .then(
            function(doc)
            {
              var ver = doc.bump();
              socket.emit('bumped', buildResponse(200, ver));
            },
            function(err)
            {
              if (err) { return handleError(socket, err); }
            });
      }
    });
}

